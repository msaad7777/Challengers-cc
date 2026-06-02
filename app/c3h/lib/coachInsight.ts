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

  // ── Run Maker tracker (optional) ──────────────────────────────
  // Drives the Dot Ball % KPI and bowler-style-specific drill /
  // tactic recommendations. All optional — existing reflections
  // remain valid without these.
  dotBallsFaced?: number;
  dismissalBowlerArm?: 'right' | 'left';
  dismissalBowlerStyle?: 'fast' | 'medium' | 'off-spin' | 'leg-spin';
  stickyBowlerStyle?: 'fast' | 'medium' | 'off-spin' | 'leg-spin';
  nextFocusKpi?: 'runs-per-10' | 'intent' | 'dot-ball-pct' | 'use-tactic' | 'pre-ball-routine';
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
  // Bounce Back System — a structured mental-recovery routine built on
  // the Breathe → Reflect → Reset framework. Generated from the same
  // form data; surfaces emotional/mental cues alongside the technical
  // ones the rest of the insight gives.
  bounceBack: {
    breathe: string;          // calming prompt — what to do *right now*
    reflectPrompts: Array<{   // the 3 structured reflection questions, auto-answered
      question: string;
      answer: string;
    }>;
    resetCard: {              // pre-next-innings reset (matches the printable Reset Card)
      mindsetWord: string;
      strengthToBack: string;
      pressureResponse: string;
      mantra: string;
    };
    mindsetSwitch: {          // cognitive reframe — replace the unhelpful inner sentence
      from: string;
      to: string;
    };
  };
  // Run Maker System — offensive scoring identity + pre-ball intent
  // routine + phased innings plan. Counterpart to Bounce Back: where
  // BB is post-failure mental recovery, RM is pre-ball / pre-innings
  // scoring readiness. Same rule-based pure-function pattern.
  runMaker: {
    scoringIdentity: {              // aspirational identity for next innings
      traits: string[];             // 3 traits picked by rules
      scoringStatement: string;     // composed from the 3 traits
    };
    intentTrigger: {                // pre-ball LOOK → BREATHE → SAY routine
      look: string;
      breathe: string;
      say: string;
    };
    phasePlan: Array<{              // 3-phase innings strategy
      phase: 'Start Smart' | 'Build Fast' | 'Finish Strong';
      balls: string;                // "1-10" / "11-25" / "25+"
      goal: string;
      keyShots: string;
      reminderWord: string;
    }>;
    dotBallTactics: string[];       // 2-3 tactics derived from "did not rotate strike" / freeze patterns
    kpis: {                         // scorer-driven KPIs, surfaced when data available
      runsPer10Balls: number | null;
      intentScore: number | null;
      dotBallPercent: number | null; // requires dotBallsFaced + balls; null otherwise
    };
    focusForNextSession: string | null; // surfaced when nextFocusKpi is set on the reflection
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

// ── Bounce Back System ─────────────────────────────────────────────────
// Rule-based mental-recovery routine following the Breathe → Reflect →
// Reset framework. All inputs are existing CoachInputs fields; we don't
// require any new form fields for MVP.

const MINDSET_WORD_RULES: Array<{ when: (r: CoachInputs, w: string[]) => boolean; word: string }> = [
  { when: (_r, w) => w.includes('Chased a wide delivery') || w.includes('Reckless shot'), word: 'Discipline' },
  { when: (_r, w) => w.includes('Froze under pressure') || w.includes('Overthinking'), word: 'Calm' },
  { when: (_r, w) => w.includes('No clear plan') || w.includes('Forgot my routine'), word: 'Clear' },
  { when: (_r, w) => w.includes('Defensive mindset'), word: 'Brave' },
  { when: (_r, w) => w.includes('Rushed my innings') || w.includes('Played too early'), word: 'Patient' },
  { when: (_r, w) => w.includes('Tried to hit too hard'), word: 'Soft hands' },
  { when: (r, _w) => r.pressureLevel === 'high', word: 'Calm' },
  { when: (r, _w) => r.feeling !== undefined && r.feeling <= 2, word: 'Brave' },
  { when: (r, _w) => r.intentScore !== undefined && r.intentScore <= 2, word: 'Decisive' },
];

function pickMindsetWord(r: CoachInputs, wrong: string[]): string {
  for (const rule of MINDSET_WORD_RULES) {
    if (rule.when(r, wrong)) return rule.word;
  }
  return 'Locked in';
}

function pickPressureResponse(r: CoachInputs): string {
  if (r.pressureLevel === 'high') {
    return 'Step away from the crease. Three deep breaths — in for 4, out for 6. Tap the bat twice. Say your mindset word out loud. Look up, settle, play the next ball only.';
  }
  if (r.pressureLevel === 'medium') {
    return 'Reset between balls — one breath, scan the field, refocus. Don\'t replay the last ball; play the next one.';
  }
  return 'Pre-ball routine every ball: breathe, tap, settle, look up. Same five steps, regardless of context.';
}

function pickMantra(r: CoachInputs, got: string): string {
  if (r.feeling !== undefined && r.feeling <= 2) {
    return 'My score doesn\'t define me. My process does.';
  }
  if (got && got !== 'Not out' && got !== 'Did not bat') {
    return 'I had a moment. I learned from it. I\'m growing.';
  }
  if (r.intentScore !== undefined && r.intentScore >= 4) {
    return 'Trust, commit, hit.';
  }
  return 'Review it. Don\'t relive it. Next ball is the only ball.';
}

function pickMindsetSwitch(r: CoachInputs, got: string): { from: string; to: string } {
  if (got && got !== 'Not out' && got !== 'Did not bat') {
    return { from: 'I got out. I failed.', to: 'I had a moment. I learned from it. I\'m growing.' };
  }
  if (r.feeling !== undefined && r.feeling <= 2) {
    return { from: 'I\'m not good enough.', to: 'I trained for this. I belong here.' };
  }
  if (r.pressureLevel === 'high') {
    return { from: 'What if I fail in front of everyone?', to: 'What if I trust my plan and play freely?' };
  }
  return { from: 'I have to score.', to: 'I have to play the ball. Runs follow process.' };
}

function generateBounceBack(
  r: CoachInputs,
  got: string,
  wrong: string[],
  right: string[],
  nextPlan: { firstSixBalls: string; scoringAreas: string; riskToAvoid: string; strengthToBack: string },
  topDrill: string | undefined,
): CoachInsight['bounceBack'] {
  // ── Breathe ──
  // The "right now" mental reset. Same prompt every time — that's the point;
  // it becomes a learned ritual, like a pre-ball routine.
  const breathe = 'Stand still. Bat down. Three deep breaths — in for 4, out for 6. Drop your shoulders. Say to yourself: "That moment is over. I\'m back."';

  // ── Reflect (3 structured prompts, auto-answered from the form) ──
  const reflectPrompts: Array<{ question: string; answer: string }> = [];

  // Q1: What happened? — factual, no emotion.
  const happenedParts: string[] = [];
  if (got && got !== 'Not out' && got !== 'Did not bat') happenedParts.push(`Dismissed: ${got.toLowerCase()}`);
  if (got === 'Not out') happenedParts.push('Stayed not out — innings still building');
  if (got === 'Did not bat') happenedParts.push('Padded up, didn\'t get to the crease');
  if (r.whyShotThatGotMeOut && r.whyShotThatGotMeOut.trim().length > 5) {
    happenedParts.push(`In your words: "${r.whyShotThatGotMeOut.trim()}"`);
  }
  if (r.controlPercent !== undefined) happenedParts.push(`Felt in control on ${r.controlPercent}% of balls`);
  reflectPrompts.push({
    question: 'What happened?',
    answer: happenedParts.length > 0 ? happenedParts.join('. ') + '.' : 'No dismissal recorded — reflect on the innings shape overall.',
  });

  // Q2: What was in my control?
  const controlParts: string[] = [];
  if (r.stuckToPlan === 'no') controlParts.push('You had a plan and abandoned it');
  if (r.stuckToPlan === 'partly') controlParts.push('You stuck to your plan partly — gaps in execution');
  if (wrong.length > 0) controlParts.push(`Self-identified mistakes: ${wrong.slice(0, 2).map((w) => w.toLowerCase()).join(', ')}`);
  if (r.headOverBall === 'no') controlParts.push('Head wasn\'t over the ball');
  if (r.frontFootToPitch === 'no') controlParts.push('Front foot didn\'t reach the pitch');
  if (r.balanceAtContact === 'falling' || r.balanceAtContact === 'reaching') controlParts.push(`Balance: ${r.balanceAtContact} at contact`);
  reflectPrompts.push({
    question: 'What was in my control?',
    answer: controlParts.length > 0 ? controlParts.join('. ') + '.' : 'Shot selection, intent, footwork, mindset — all yours, every ball.',
  });

  // Q3: What would I try next time?
  const nextParts: string[] = [];
  if (nextPlan.firstSixBalls) nextParts.push(nextPlan.firstSixBalls);
  if (topDrill) nextParts.push(`Add to next nets: ${topDrill}`);
  reflectPrompts.push({
    question: 'What would I try next time?',
    answer: nextParts.length > 0 ? nextParts.join(' ') : 'Play yourself in. Watch the ball. Score off the bad ones, leave the rest.',
  });

  // ── Reset (mindset word + strength + pressure response + mantra) ──
  const resetCard = {
    mindsetWord: pickMindsetWord(r, wrong),
    strengthToBack: nextPlan.strengthToBack || right[0] || 'The shot you trust most',
    pressureResponse: pickPressureResponse(r),
    mantra: pickMantra(r, got),
  };

  // ── Mindset switch ──
  const mindsetSwitch = pickMindsetSwitch(r, got);

  return { breathe, reflectPrompts, resetCard, mindsetSwitch };
}

// ── Run Maker System ───────────────────────────────────────────────────
// Offensive counterpart to Bounce Back. Where BB resets after failure,
// RM activates pre-ball scoring intent and lays out a phased plan.
// Rule-based, pure function — no LLM, no new form fields required.

// Trait pools by intent posture, used to derive 3 aspirational traits.
const TRAIT_POOLS = {
  // Default — well-rounded scorer
  default: ['Bold', 'Decisive', 'Composed'],
  // Player needs to find courage to attack (low intent / froze)
  unfreeze: ['Brave', 'Bold', 'Calm'],
  // Player has aggression but is throwing it away
  controlAggression: ['Calculated', 'Strategic', 'Patient'],
  // Player needs to stay composed under pressure
  steadyPressure: ['Composed', 'Focused', 'Grounded'],
  // Death-overs / accelerate posture
  finisher: ['Fearless', 'Dominant', 'Ruthless'],
  // Powerplay / first-up clarity
  starter: ['Sharp', 'Game-aware', 'Purposeful'],
} as const;

function pickScoringTraits(r: CoachInputs, wrong: string[]): readonly string[] {
  if (r.matchPhase === 'death' || r.intentMode === 'accelerate') return TRAIT_POOLS.finisher;
  if (r.matchPhase === 'powerplay') return TRAIT_POOLS.starter;
  if (wrong.includes('Froze under pressure') || (r.intentScore !== undefined && r.intentScore <= 2)) {
    return TRAIT_POOLS.unfreeze;
  }
  if (wrong.includes('Reckless shot') || wrong.includes('Tried to hit too hard') || wrong.includes('Rushed my innings')) {
    return TRAIT_POOLS.controlAggression;
  }
  if (r.pressureLevel === 'high') return TRAIT_POOLS.steadyPressure;
  return TRAIT_POOLS.default;
}

function buildScoringStatement(traits: readonly string[]): string {
  const [a, b, c] = traits;
  if (!a || !b || !c) return 'I\'m the batter who plays with intent and finds gaps. Every ball is a chance.';
  return `I'm the batter who plays ${a.toLowerCase()}, ${b.toLowerCase()}, and ${c.toLowerCase()}. Every ball is a chance.`;
}

function pickIntentLook(r: CoachInputs): string {
  if (r.matchPhase === 'powerplay') {
    return 'Bowler\'s wrist and release point. Scan for fielder gaps — anything outside the 30-yard circle is on.';
  }
  if (r.matchPhase === 'death') {
    return 'Short boundary side. Long-on / long-off depth. Pre-pick your boundary zone before he runs in.';
  }
  if (r.matchPhase === 'middle') {
    return 'Field gaps for rotation. Square-leg pocket, point pocket, mid-on/mid-off straight. Singles are everywhere.';
  }
  return 'Scan the field. Pick the gap. Commit to a scoring option before he bowls.';
}

function pickIntentSay(r: CoachInputs, wrong: string[]): string {
  if (wrong.includes('Froze under pressure') || (r.intentScore !== undefined && r.intentScore <= 2)) {
    return 'See it. Hit it.';
  }
  if (wrong.includes('No clear plan')) return 'Pick and hit.';
  if (r.matchPhase === 'death' || r.intentMode === 'accelerate') return 'Score now.';
  if (r.matchPhase === 'powerplay') return 'Stay sharp. Find the gap.';
  if (r.intentScore !== undefined && r.intentScore >= 4) return 'Trust, commit, hit.';
  return 'I\'m ready.';
}

function pickDotBallTactics(r: CoachInputs, wrong: string[]): string[] {
  const tactics: string[] = [];
  if (wrong.includes('Did not rotate strike') || (r.intentMode === 'consolidate' && r.pressureLevel === 'high')) {
    tactics.push('Drop and Run — soft hands into the off-side (cover/point), call early, take the single.');
    tactics.push('Shuffle and Clip — step across the crease, clip the straight ball into the leg-side gap.');
  }
  if (wrong.includes('Froze under pressure') || wrong.includes('Defensive mindset')) {
    tactics.push('Quick Feet Bunt — small step forward or back, tap into the cover or midwicket gap. Control, not power.');
  }
  if (wrong.includes('Tried to hit too hard')) {
    tactics.push('Late Dab — let the ball come close, angle the bat down to third man. Easy single, no risk.');
  }
  if (wrong.includes('No clear plan')) {
    tactics.push('Walk Down the Track (vs spin) — change the length, push into the gaps. Disrupts the bowler\'s line.');
  }

  // ── Sticky-bowler-style-specific tactics ─────────────────────
  // If the player flagged a bowler type that keeps causing dots,
  // give a tactic tailored to that style.
  const sticky = r.stickyBowlerStyle;
  if (sticky === 'fast') {
    tactics.push('vs Fast: Late Dab to third man — let the short-of-length ball come close, angle bat down. Avoids playing across the line.');
  } else if (sticky === 'medium') {
    tactics.push('vs Medium pace: Shuffle and Clip on the pads — step across early, target the leg-side gap behind square.');
  } else if (sticky === 'off-spin') {
    tactics.push('vs Off-spin: Use the depth of crease — back-and-across, work into midwicket gap. Sweep when the field is up.');
  } else if (sticky === 'leg-spin') {
    tactics.push('vs Leg-spin: Sweep / lap to the leg-side — disrupts the line, scores against the spin. Use the depth of crease for the wide ones.');
  }

  // Always give the player at least 2 tactics so the section isn't empty.
  if (tactics.length === 0) {
    tactics.push('Drop and Run — soft hands into the off-side, call early. The easiest single in the game.');
    tactics.push('Shuffle and Clip — step across, clip the straight ball into the leg-side gap.');
  }
  return tactics.slice(0, 4);
}

// Map (bowlerArm, bowlerStyle) → a targeted drill that addresses
// the specific challenge of that bowler type. Used when the player
// records what kind of bowler dismissed them.
function pickBowlerDrill(arm: 'right' | 'left' | undefined, style: 'fast' | 'medium' | 'off-spin' | 'leg-spin' | undefined): string | null {
  if (!style) return null;
  const armPrefix = arm === 'left' ? 'Left-arm' : arm === 'right' ? 'Right-arm' : 'The';
  if (style === 'fast') {
    if (arm === 'left') return 'Left-arm pace drill — line comes across to a right-hander; train the leave outside off and play later under the eyes. 30 balls of leave/defend only.';
    return 'Right-arm pace drill — head still, hands close to the body. Defend with soft hands; let the ball come to you. 30 balls.';
  }
  if (style === 'medium') {
    if (arm === 'left') return 'Left-arm medium drill — angle into the pads; shuffle across and work to leg-side. 30 balls focusing on hip movement, not arms.';
    return 'Right-arm medium drill — back-of-a-length challenge; play late, soft hands, third-man / cover dab for rotation. 30 balls.';
  }
  if (style === 'off-spin') {
    if (arm === 'left') return 'Left-arm orthodox (SLA) drill — ball turns into the right-hander; play with the spin (work to leg-side), use the sweep against fuller deliveries. 30 balls.';
    return 'Off-spin drill — get to the pitch OR rock back; never half-forward. Defend with bat-next-to-pad. Sweep against the fuller length. 30 balls.';
  }
  if (style === 'leg-spin') {
    if (arm === 'left') return 'Chinaman drill — left-arm wrist spin turns away from a right-hander. Play late, watch the wrist, defend straight. 30 balls.';
    return 'Leg-spin drill — read the wrist before the seam; play with the spin to the off-side, use depth-of-crease to negate length. 30 balls.';
  }
  return `${armPrefix} ${style} drill — watch the seam, play late, defend with bat next to pad. 30 balls.`;
}

const FOCUS_KPI_DESCRIPTIONS: Record<NonNullable<CoachInputs['nextFocusKpi']>, string> = {
  'runs-per-10': 'Runs per 10 balls — target 6+. Rotate the strike; don\'t let dots compound.',
  'intent': 'Intent score — target 5/5. Pick a scoring option before every ball; play with purpose, even on defence.',
  'dot-ball-pct': 'Dot ball % — keep it under 40%. Use a tactic on every ball you can\'t boundary.',
  'use-tactic': 'Use one Dot Ball Destroyer tactic every over — Drop and Run, Shuffle and Clip, Late Dab, or Quick Feet Bunt.',
  'pre-ball-routine': 'Pre-ball routine — LOOK / BREATHE / SAY before every ball. Make it automatic.',
};

function pickPhaseKeyShots(r: CoachInputs, phase: 'Start Smart' | 'Build Fast' | 'Finish Strong', right: string[]): string {
  // Prefer the player's own strength when we have one — players score
  // best with shots they trust. Otherwise use phase-default scoring shots.
  const strength = right[0]?.toLowerCase() || '';
  if (phase === 'Start Smart') {
    if (strength.includes('defen') || strength.includes('block')) return 'Front-foot defence, leave outside off, push for singles into the V.';
    return 'Push down the ground, flick off the pads, dab to third man. Build a rhythm before you build runs.';
  }
  if (phase === 'Build Fast') {
    if (strength.includes('cover') || strength.includes('drive')) return 'Cover drive, on-drive, late cut. Hit through your scoring zones with full intent.';
    if (strength.includes('pull') || strength.includes('hook')) return 'Pull, slap-pull, whip through midwicket. Take on short balls.';
    return 'Cover drive, flick off the pads, slap-pull. Rotate every ball, find boundaries in your scoring areas.';
  }
  // Finish Strong
  if (r.matchPhase === 'death') return 'Lofted drives (long-on / long-off), slog-sweep, scoop. Pre-pick your boundary zone.';
  return 'Lofted drives, pull, sweep. Use the long boundary side. Manipulate the field by hitting the area they\'ve left open.';
}

function pickKpis(r: CoachInputs): { runsPer10Balls: number | null; intentScore: number | null; dotBallPercent: number | null } {
  const runsPer10Balls =
    r.runs !== undefined && r.balls !== undefined && r.balls > 0
      ? Math.round((r.runs / r.balls) * 10 * 10) / 10 // one decimal
      : null;
  const intentScore = r.intentScore ?? null;
  const dotBallPercent =
    r.dotBallsFaced !== undefined && r.balls !== undefined && r.balls > 0
      ? Math.round((r.dotBallsFaced / r.balls) * 100 * 10) / 10 // one decimal
      : null;
  return { runsPer10Balls, intentScore, dotBallPercent };
}

function generateRunMaker(r: CoachInputs, wrong: string[], right: string[]): CoachInsight['runMaker'] {
  const traits = pickScoringTraits(r, wrong);
  const scoringStatement = buildScoringStatement(traits);
  const intentTrigger = {
    look: pickIntentLook(r),
    breathe: 'One slow breath through the nose. Drop the shoulders. Feel your feet on the ground. Focus in, noise out.',
    say: pickIntentSay(r, wrong),
  };
  const phasePlan: CoachInsight['runMaker']['phasePlan'] = [
    {
      phase: 'Start Smart',
      balls: '1-10',
      goal: 'Settle, find timing, get off strike. Read the bowler.',
      keyShots: pickPhaseKeyShots(r, 'Start Smart', right),
      reminderWord: 'Calm',
    },
    {
      phase: 'Build Fast',
      balls: '11-25',
      goal: 'Rotate every ball. Hit your scoring zones. Build pressure back.',
      keyShots: pickPhaseKeyShots(r, 'Build Fast', right),
      reminderWord: 'Push',
    },
    {
      phase: 'Finish Strong',
      balls: '25+',
      goal: 'Accelerate. Find boundaries. Manipulate the field.',
      keyShots: pickPhaseKeyShots(r, 'Finish Strong', right),
      reminderWord: 'Power',
    },
  ];
  const dotBallTactics = pickDotBallTactics(r, wrong);
  const kpis = pickKpis(r);
  const focusForNextSession = r.nextFocusKpi ? FOCUS_KPI_DESCRIPTIONS[r.nextFocusKpi] : null;
  return {
    scoringIdentity: { traits: [...traits], scoringStatement },
    intentTrigger,
    phasePlan,
    dotBallTactics,
    kpis,
    focusForNextSession,
  };
}

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
  // Bowler-style-specific drill — only added when the player recorded
  // what kind of bowler dismissed them. Targets the specific challenge
  // of that bowler type (e.g. left-arm pace line, leg-spin wrist read).
  const bowlerDrill = pickBowlerDrill(r.dismissalBowlerArm, r.dismissalBowlerStyle);
  if (bowlerDrill) drillSet.add(bowlerDrill);
  const drills = Array.from(drillSet).slice(0, 5);

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

  const nextInningsPlan = { firstSixBalls, scoringAreas, riskToAvoid, strengthToBack };
  const bounceBack = generateBounceBack(r, got, wrong, right, nextInningsPlan, drills[0]);
  const runMaker = generateRunMaker(r, wrong, right);

  return {
    diagnosis,
    narrative,
    drills,
    nextInningsPlan,
    bounceBack,
    runMaker,
  };
}
