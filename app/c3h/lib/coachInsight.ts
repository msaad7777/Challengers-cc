// Auto Coach Insight — generates a structured coach-style summary
// from a single reflection. Rule-based (no LLM) so it works offline,
// is deterministic, and runs at zero cost. The rules codify the kind
// of thing a captain or coach would say after watching a dismissal:
// link the technical mistake to the plan failure, give a fix, and
// produce a concrete plan for next innings.
//
// Pure function — feed it the reflection-form values, get back a
// structured insight. UI is responsible for rendering.

export interface CoachInputs {
  // Required core
  howGotOut: string[];
  whatWentRight: string[];
  whatWentWrong: string[];
  feeling: number;        // 1-5
  intentScore: number;    // 1-5

  // Coach-level review (all optional)
  controlPercent?: number;
  pickedLengthEarly?: 'yes' | 'mostly' | 'no';
  watchedBall?: 'yes' | 'partially' | 'no';
  misjudgedPaceOrBounce?: boolean;
  headOverBall?: 'yes' | 'sometimes' | 'no';
  frontFootToPitch?: 'yes' | 'sometimes' | 'no';
  balanceAtContact?: 'stable' | 'falling' | 'reaching';
  matchPhase?: 'powerplay' | 'middle' | 'death' | 'na';
  pressureLevel?: 'low' | 'medium' | 'high';
  intentMode?: 'accelerate' | 'consolidate' | 'settle';
  firstSixBallsPlan?: string;
  stuckToPlan?: 'yes' | 'partly' | 'no';
  whyShotThatGotMeOut?: string;

  // From scorer if available
  runs?: number;
  balls?: number;
  isOut?: boolean;
}

export interface CoachInsight {
  diagnosis: string;       // one-line root cause
  narrative: string;       // 2-4 sentence coach voice
  drills: string[];        // concrete drills for next nets
  nextInningsPlan: {
    firstSixBalls: string; // what to focus on for the first 6 balls
    scoringAreas: string;  // where to look for runs
    riskToAvoid: string;   // what to NOT do
    strengthToBack: string;
  };
}

const PRIMARY_DISMISSAL = (got: string[]): string => got[0] || '';

// Map a "what went wrong" reason to a specific drill.
// Drills written like a coach actually says them — short, actionable.
const MISTAKE_DRILLS: Record<string, string> = {
  'Poor shot selection': 'Shot-selection drill — coach calls leave/defend/push/drive/loft before each ball. Match call to length. 30 balls.',
  'Played too early': 'Late-play drill — wait until the ball is right under your eyes before committing. 20 throw-downs.',
  'Played too late': 'Forward trigger drill — initiate the trigger as the bowler enters delivery stride. 30 balls of front-foot defence.',
  'Rushed my innings': 'Tempo drill — bat 30 balls with a strict rule: no boundary attempts until ball 11. Build tempo gradually.',
  'No clear plan': 'Plan-aloud drill — before each ball, say your plan out loud (defend / single / boundary). Coach grades execution.',
  'Froze under pressure': 'Pre-ball routine drill — breathe, tap, focus, settle, look up. Repeat the routine before every ball for 2 sets.',
  'Chased a wide delivery': 'Leave drill — 6 balls outside off, leave each one. 4 sets. Train the head to NOT play.',
  'Forgot my routine': 'Pre-ball routine drill — same five steps, every ball, regardless of context. Becomes muscle memory.',
  'Overthinking': 'Reset drill — between balls, 3 deep breaths and focus on the next ball only. Don\'t replay the last one.',
  'Lost concentration': 'Concentration drill — bat 30 balls with no break, mark anytime you "drift" on a notepad. Find your fade point.',
  'Poor footwork': 'Footwork drill against spin — coach throws short or full; commit fully forward or fully back, never half-forward. 30 balls.',
  'Tried to hit too hard': 'Soft-hands drill — bat 20 balls with just the bottom hand on the bat. Forces timing over power.',
  'Defensive mindset': 'Intent drill — pick a scoring shot for every ball. Even defended balls must have intent (gap-aware push).',
  'Did not rotate strike': 'Rotation drill — single off every ball except boundaries. 4 overs. No dot balls.',
  'Fatigue or distraction': 'Recovery focus — 2L water + carbs night before + arrival 60min before. Test your match-day prep, not just your batting.',
  'Bat-pad gap': 'Pad-bat alignment — defend with bat coming down NEXT to the pad, not behind it. 30 balls.',
  'Head fell over': 'Head-position drill — defend with chin tucked toward off-side shoulder, head over the front knee. 30 balls.',
  'Threw front leg to spin': 'Backfoot anchor drill — against spin, plant back foot first; only commit forward if the ball is full enough.',
  'Wrong shot to ball line': 'Shot-line drill — coach calls the line (off / middle / leg) before each ball; you must play to the line called.',
  'Grip felt off': 'Grip check — V-formation between thumb and index finger lined up between bottom edge and back of bat. Practise picking up the bat and finding the V instinctively.',
  'Bat felt unbalanced': 'Bat pickup drill — slow pickup, full extension, both hands engaged through impact. 50 reps.',
};

const DISMISSAL_DRILLS: Record<string, string> = {
  'Bowled': 'Front-foot defence drill — 30 balls on a length, bat-and-pad close together, head over the ball.',
  'LBW': 'Pad-bat alignment — defend with bat NEXT to pad, not behind. 30 balls.',
  'Caught — Slips/Gully': 'Leave drill — 6 balls outside off, leave each one. 4 sets.',
  'Caught — Keeper': 'Soft-hands drill — defend with grip held loose, watch ball into bat.',
  'Caught — Boundary': 'Shot-selection drill — wait for the bad ball before going aerial. 30 balls.',
  'Caught — Infield': 'Hit along ground — 30 balls, every shot below knee height.',
  'Caught — Hit straight to fielder': 'Field-reading drill — name three gaps before each ball, hit accordingly.',
  'Run Out': 'Running between wickets — pairs running 1s and 2s, every call loud. 5 minutes.',
  'Stumped': 'Footwork against spin — fully forward or fully back, never half-forward. 30 balls.',
  'Hit Wicket': 'Stance drill — back leg outside leg stump, stable base, watch the bat through follow-through.',
};

export function generateCoachInsight(r: CoachInputs): CoachInsight {
  const got = PRIMARY_DISMISSAL(r.howGotOut);
  const wrong = r.whatWentWrong || [];
  const right = r.whatWentRight || [];

  // ── Diagnosis (one-line root cause) ──
  let diagnosis = '';
  if (got === 'Not out' || got === 'Did not bat') {
    diagnosis = got === 'Not out'
      ? 'Stayed not out — your job is to keep building this kind of innings.'
      : 'Padded up but didn\'t get to the crease. Stay match-ready for next time.';
  } else if (r.stuckToPlan === 'no' && got) {
    diagnosis = `Plan failure: you knew what to do for the first 6 balls, abandoned it, and got out ${got.toLowerCase()}.`;
  } else if (r.balanceAtContact === 'falling' || r.balanceAtContact === 'reaching') {
    diagnosis = `Balance broke down — you were ${r.balanceAtContact} at contact, which led to the mistake that got you out.`;
  } else if (r.headOverBall === 'no' && (got === 'Bowled' || got.startsWith('Caught'))) {
    diagnosis = `Head wasn\'t over the ball — that\'s why you got ${got.toLowerCase()}.`;
  } else if (r.frontFootToPitch === 'no' && (got === 'Stumped' || got === 'LBW' || got === 'Bowled')) {
    diagnosis = `Front foot didn\'t reach the pitch — half-forward is the danger zone, especially against spin.`;
  } else if (r.controlPercent !== undefined && r.controlPercent < 40) {
    diagnosis = `Low control (${r.controlPercent}%) — you weren\'t reading the bowler. Time to slow down and watch the ball.`;
  } else if (wrong.includes('Chased a wide delivery')) {
    diagnosis = 'Chased width when you should have left — the leave shot is the discipline that protects you.';
  } else if (wrong.includes('No clear plan')) {
    diagnosis = 'No clear plan = no anchor under pressure. Plan first, score second.';
  } else if (wrong.includes('Froze under pressure')) {
    diagnosis = `Pressure took your decision-making away. Pre-ball routine is the fix — every ball, same five steps.`;
  } else if (got) {
    diagnosis = `Got out ${got.toLowerCase()} — every dismissal is a coaching moment. See drill below.`;
  } else {
    diagnosis = 'Solid innings. Keep stacking the small things — leave the bad balls, hit the gaps, watch the ball into your hands.';
  }

  // ── Narrative (2-4 sentences in coach voice) ──
  const narrativeParts: string[] = [];
  if (right.length > 0) {
    narrativeParts.push(`What worked: ${right.slice(0, 2).join(', ').toLowerCase()}.`);
  }
  if (r.controlPercent !== undefined && r.controlPercent >= 70) {
    narrativeParts.push(`You felt in control on ${r.controlPercent}% of balls — that\'s a good base, the next level is converting control into runs.`);
  } else if (r.controlPercent !== undefined && r.controlPercent < 40) {
    narrativeParts.push(`Only ${r.controlPercent}% control — that\'s not a technique problem, that\'s a tempo problem. Slow down. Watch the seam.`);
  }
  if (wrong.length > 0) {
    narrativeParts.push(`Where it went wrong: ${wrong.slice(0, 2).join(', ').toLowerCase()}.`);
  }
  if (r.whyShotThatGotMeOut && r.whyShotThatGotMeOut.trim().length > 5) {
    narrativeParts.push(`Your own read on the dismissal: "${r.whyShotThatGotMeOut.trim()}" — own that thought, then change the input next time.`);
  }
  if (narrativeParts.length === 0) {
    narrativeParts.push('Reflect on every ball, not just the ones you scored from. The dot balls tell you as much as the boundaries.');
  }
  const narrative = narrativeParts.join(' ');

  // ── Drills (specific to this dismissal + mistakes) ──
  const drillSet = new Set<string>();
  if (got && DISMISSAL_DRILLS[got]) drillSet.add(DISMISSAL_DRILLS[got]);
  for (const w of wrong) {
    const drill = MISTAKE_DRILLS[w];
    if (drill) drillSet.add(drill);
    if (drillSet.size >= 3) break;
  }
  // Body-mechanics drills based on coach-level review
  if (r.headOverBall === 'no') drillSet.add('Head-position drill — defend with chin tucked toward off-side shoulder, head over front knee. 30 balls.');
  if (r.frontFootToPitch === 'no') drillSet.add('Forward stride drill — exaggerated front-foot stride to the pitch on every full ball. 30 balls.');
  if (r.balanceAtContact === 'falling') drillSet.add('Stance drill — strong base, weight 60/40 toward the back leg, finish balanced.');
  if (r.balanceAtContact === 'reaching') drillSet.add('Reach-fix drill — defend with feet planted; only commit forward if the ball is reachable without overstretching.');
  const drills = Array.from(drillSet).slice(0, 4);

  // ── Next innings plan ──
  let firstSixBalls = 'Play yourself in. Watch the ball, leave outside off, defend straight balls.';
  let scoringAreas = 'V — mid-on to mid-off — straight bat, soft hands.';
  let riskToAvoid = 'Big shots before you\'re set.';
  let strengthToBack = right[0] || 'The shot you trust most.';

  if (r.matchPhase === 'powerplay') {
    firstSixBalls = 'Powerplay: pick the bowler\'s release point, leave width, attack the half-volley straight.';
    scoringAreas = 'V + cover region; let leg-side runs come naturally off the hip.';
  } else if (r.matchPhase === 'death') {
    firstSixBalls = 'Death overs: clear the front leg, get to the pitch, use the long boundaries.';
    scoringAreas = 'Long-on, long-off, square boundary — pre-meditate scoring zones based on where the boundary is shortest.';
  }

  if (got === 'Caught — Slips/Gully' || wrong.includes('Chased a wide delivery')) {
    firstSixBalls = 'Leave anything outside off for the first 6 balls. No exceptions.';
    riskToAvoid = 'Width outside off stump.';
  }
  if (got === 'Bowled' || got === 'LBW') {
    firstSixBalls = 'Forward defence on a length. Bat next to pad. Don\'t play across the line.';
    riskToAvoid = 'Across-the-line shots to anything straight.';
  }
  if (got === 'Stumped') {
    firstSixBalls = 'Against spin: get to the pitch OR stay back. Half-forward is the danger zone.';
    riskToAvoid = 'Charging without reading the length.';
  }
  if (got === 'Run Out') {
    firstSixBalls = 'Loud calls — yes / no / wait. Eye contact with your partner before every run.';
    riskToAvoid = 'Half-walking. Either commit or hold.';
  }
  if (wrong.includes('No clear plan') || r.stuckToPlan === 'no') {
    firstSixBalls = 'Defend straight only for the first 6. Rotate strike if it\'s there. No boundaries until ball 7.';
    riskToAvoid = 'Anything ambitious before you\'re set.';
  }

  return {
    diagnosis,
    narrative,
    drills,
    nextInningsPlan: { firstSixBalls, scoringAreas, riskToAvoid, strengthToBack },
  };
}
