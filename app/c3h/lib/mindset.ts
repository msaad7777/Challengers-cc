// mindset.ts — sport-psychology principles + practical "access your performance
// state" routines for the NeuroVision Mindset module. The problem this solves:
// even good players can't reach their best mental state IN the game. The fix is
// a small, repeatable pre-ball routine (a trigger) plus fast reset + arousal
// regulation. All content is original, cricket-applied, LLM-free and pure.

export interface Principle { icon: string; title: string; body: string; cue: string; }

export const PRINCIPLES: Principle[] = [
  {
    icon: '🧠', title: 'Two minds — stop coaching yourself at the crease',
    body: 'The nets are for building technique. At the crease, let it go — the performing brain reacts, it doesn’t coach. Give yourself ONE simple cue and trust it. Thinking about your grip mid-ball is the fastest way to freeze.',
    cue: 'Train the skill in the nets. Trust it in the middle.',
  },
  {
    icon: '🎯', title: 'Process over outcome — control the controllables',
    body: 'You can’t control the score, the pitch, the umpire, or the result. You CAN control watching the ball, your breathing, and your next reaction. Play the ball, not the situation. Outcomes take care of themselves when the process is right.',
    cue: 'Play the ball, not the scoreboard.',
  },
  {
    icon: '📈', title: 'Optimal arousal — find your zone',
    body: 'Too flat and you’re slow and sloppy; too amped and you’re tight and rushed. Peak performance sits in the middle — alert but calm. Learn to read where you are and nudge yourself back into the zone before the next ball.',
    cue: 'Alert, not anxious. Calm, not casual.',
  },
  {
    icon: '⏱️', title: 'One ball at a time',
    body: 'The last ball is gone. The next over doesn’t exist yet. There is only this ball. Present focus is where performance lives — the mind that drifts to the last mistake or the required rate is not watching the ball.',
    cue: 'Last ball’s gone. Only this ball matters.',
  },
  {
    icon: '💬', title: 'Self-talk — pick your teammate',
    body: 'Your inner voice is either a teammate or an opponent — you choose which. Keep it short, positive and instructional: “watch the ball”, “still head”, “breathe”. Never rehearse failure or replay the miss in words.',
    cue: 'Short. Positive. Instructional.',
  },
  {
    icon: '🔁', title: 'A pre-ball routine is your ON switch',
    body: 'Elite players run the same small ritual before every single ball. Same routine → same state → repeatable performance. It’s not superstition; it’s a trained trigger that puts you into your zone on demand, no matter the pressure.',
    cue: 'Same routine every ball = the state on demand.',
  },
  {
    icon: '🚿', title: 'Reset fast after a mistake',
    body: 'A play-and-miss, a dropped catch, a loose ball — it’s already done. One breath, eyes up, next ball. The faster you reset, the less a single error costs you. Champions aren’t mistake-free; they recover quicker than everyone else.',
    cue: 'One breath. Eyes up. Next ball.',
  },
  {
    icon: '🦁', title: 'Confidence is a choice you act into',
    body: 'Confidence isn’t a feeling you wait to arrive — it’s a decision you act on. Stand tall, walk in strong, slow your movements, act as if. The body leads the mind: change the posture and the state follows.',
    cue: 'Act as if. The body leads the mind.',
  },
  {
    icon: '👁️', title: 'Quiet Eye — the last thing you look at wins',
    body: 'The single most researched skill in sports vision: a steady, unbroken final gaze on one spot just before the action. For a batter that spot is the bowler’s hand at release — pick the ball up there, not off the pitch. A long, still final fixation beats a darting one, and it holds up under pressure exactly when nerves make the eyes wander.',
    cue: 'One gaze. The release point. Hold it.',
  },
];

// ── Pre-ball centering routine ───────────────────────────────────────────

export interface BreathPattern { id: string; label: string; text: string; secs: number; }

export const BREATH_PATTERNS: BreathPattern[] = [
  { id: 'calm', label: 'Calming (in 4 / out 6)', text: 'Breathe in through your nose for 4… and slowly out for 6.', secs: 10 },
  { id: 'coherence462', label: 'Coherence (4-6-2: in 4 / out 6 / hold 2)', text: 'In through the nose for 4… slowly out for 6… and hold for 2.', secs: 12 },
  { id: 'box', label: 'Box (4-4-4-4)', text: 'Box breath — in for 4, hold 4, out 4, hold 4.', secs: 16 },
  { id: 'single', label: 'One deep breath', text: 'One slow, deep breath in… and let it all the way out.', secs: 8 },
];

export interface RoutineStep { text: string; seconds: number; breathe: boolean; }

const DEFAULT_CUE = 'watch the ball';

/** Build the 4-beat pre-ball centering routine, personalised with a cue word. */
export function buildCenteringRoutine(cue: string, patternId: string): RoutineStep[] {
  const pattern = BREATH_PATTERNS.find((p) => p.id === patternId) ?? BREATH_PATTERNS[0];
  const word = cue.trim() || DEFAULT_CUE;
  return [
    { text: 'Step away from the crease. Loosen your grip, drop your shoulders, shake the tension out of your hands.', seconds: 6, breathe: false },
    { text: pattern.text, seconds: pattern.secs, breathe: true },
    { text: `Your cue word: “${word}”. Say it to yourself, and let it set your focus.`, seconds: 6, breathe: false },
    { text: 'Quiet Eye: soft, wide gaze as the bowler runs in — then narrow to ONE spot, the hand at release. Hold it there. Pick the ball up out of the hand.', seconds: 7, breathe: false },
    { text: 'Still. Balanced. Ready. Commit fully to this ball — nothing else exists.', seconds: 5, breathe: false },
  ];
}

// ── Quiet Eye (walking out / entering the pitch) ─────────────────────────
// The single most-replicated finding in sports vision (Vickers): a steady,
// unbroken final fixation on one target just before and during the action.
// For a batter that target is the bowler's hand at the release point.

export interface QuietEye {
  what: string;
  anchor: string;
  /** Off-field drill to lengthen and steady the final fixation. */
  drill: string[];
}

export const QUIET_EYE: QuietEye = {
  what: 'Quiet Eye is a single, still final gaze fixed on one spot just before and during the action — for a batter, the bowler’s hand at the moment of release, then the ball. The longer and steadier that last fixation, the sharper and more pressure-proof your response. Under nerves the eyes dart around; a trained Quiet Eye keeps them locked.',
  anchor: 'In the game: as the bowler turns and runs in, let your eyes go soft and wide. As they load into the delivery stride, narrow to ONE anchor — the release point out of the hand. Pick the ball up there, not off the pitch. One gaze, one ball.',
  drill: [
    'Mark a small target at eye height — a coin or dot on a wall, or have a partner hold a ball where a bowler’s hand would release.',
    'Take your stance. As the “bowler” loads, keep a soft, wide gaze — then lock a single, still fixation on the release spot about a second before release.',
    'Hold that gaze completely still, all the way through “contact”. No darting, no blinking it away.',
    '10 reps. Keep the final fixation long and quiet — quality over count.',
    'Progress: shorten the pre-fixation, or add a decoy movement (a wave, a step) you must ignore while your gaze stays anchored.',
  ],
};

/**
 * The walk-out / entering-the-pitch routine: set arousal with 4-6-2 coherence
 * breaths on the walk, then set attention with a Quiet Eye anchor before the
 * first ball. Personalised with the player's cue word.
 */
export function buildWalkoutRoutine(cue: string): RoutineStep[] {
  const word = cue.trim() || DEFAULT_CUE;
  return [
    { text: 'You’re walking out. Slow your steps. Stand tall — chest up, shoulders down. You belong out here.', seconds: 8, breathe: false },
    { text: 'First 4-6-2 coherence breath: in through the nose for 4… slowly out for 6… hold for 2.', seconds: 12, breathe: true },
    { text: 'Again — in for 4… out for 6… hold for 2. Let the heart rate settle and the hands go soft.', seconds: 12, breathe: true },
    { text: 'At the crease: take guard, tap your mark, and scan the field once — note where the gaps are.', seconds: 9, breathe: false },
    { text: 'Quiet Eye now: soft, wide gaze on the bowler… then narrow to ONE spot — the hand at release. Hold it still. You’ll pick the ball up out of the hand.', seconds: 10, breathe: false },
    { text: `Your cue: “${word}”. Soft, still, balanced. Watch it out of the hand — commit fully to the first ball.`, seconds: 8, breathe: false },
  ];
}

/** The mistake-recovery "flush" — the same every time, so it's automatic. */
export const RESET_ROUTINE: RoutineStep[] = [
  { text: 'It’s done. Whatever just happened — the miss, the drop, the loose ball — let it go.', seconds: 6, breathe: false },
  { text: 'One slow breath out — long and complete. Flush it.', seconds: 8, breathe: true },
  { text: 'Small physical reset — tap your bat, adjust your gloves, re-mark your guard. Eyes up.', seconds: 6, breathe: false },
  { text: 'Next ball. You’re back. Watch it out of the hand.', seconds: 6, breathe: false },
];

// ── Arousal regulation ───────────────────────────────────────────────────

export type ArousalLevel = 'flat' | 'dialled' | 'amped';

export interface RegulationTool { title: string; body: string; }

export function regulateFor(level: ArousalLevel): RegulationTool {
  switch (level) {
    case 'flat':
      return {
        title: 'Up-regulate — get the engine going',
        body: 'Three short, sharp breaths. A quick jog on the spot or a few high knees. Clap your gloves, make a loud call, get louder in the field. Raise your intensity so you’re switched on for the next ball.',
      };
    case 'amped':
      return {
        title: 'Down-regulate — bring it back down',
        body: 'Slow everything right down. Three long exhales, out longer than in. Relax your jaw and unclench your hands. Widen your gaze and lower your shoulders. Let the heart rate settle before you face up.',
      };
    default:
      return {
        title: 'You’re in the zone',
        body: 'Alert and calm — exactly where you want to be. Run your pre-ball routine and go. Don’t overthink it; trust the state and watch the ball.',
      };
  }
}
