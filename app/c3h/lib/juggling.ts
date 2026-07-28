// juggling.ts — data + helpers for the NeuroVision "Neuro-Juggling" tracker
// (Dr. Jackie's visual-motor / cross-body progression, 8 levels, 1→3 balls).
//
// Juggling is a physical, off-screen drill, so the app's job is to guide it and
// track progress — not simulate it. Only levels whose full instructions have
// been captured are `detailed`; the rest render as a locked "coming soon" card
// until their session is added. Pure/data-only so it stays trivially testable.

export interface JugglingLevel {
  level: number;
  name: string;
  balls: string;
  /** Step-by-step how-to — present only for detailed levels. */
  how?: string[];
  /** The "you've got it when…" criterion. */
  mastery?: string;
  /** True once the full session has been captured into this file. */
  detailed: boolean;
}

export const JUGGLING_LEVELS: JugglingLevel[] = [
  {
    level: 1,
    name: 'Cross Knee Challenge',
    balls: '1 ball',
    detailed: true,
    how: [
      'One ball. Toss it from one hand and catch it with the other.',
      'As you throw, lift the OPPOSITE knee at the same moment — right hand throws, left knee up; left hand throws, right knee up.',
      'Keep the ball’s arc consistent, at eye level.',
    ],
    mastery: '20 reps in a row without breaking rhythm or dropping. This is the pattern foundation for everything that follows.',
  },
  {
    level: 2,
    name: 'Clap & Pat Challenge',
    balls: '1 ball',
    detailed: true,
    how: [
      'Same one-ball toss from hand to hand, but add a beat in between.',
      'Rep A: throw, clap once, catch.',
      'Rep B: throw, pat your thigh, catch.',
      'Alternate — clap, pat, clap, pat — keeping the ball on its arc while your hands do the extra beat.',
    ],
    mastery: '20 clean reps alternating clap-pat-clap-pat. This forces your hands to work independently of your eyes — holding the target while the body does something else.',
  },
  { level: 3, name: 'Cross-Throw & First Three-Ball Throws', balls: '2→3 balls', detailed: false },
  { level: 4, name: 'Partner & Bounce Modifications', balls: '3 balls', detailed: false },
  { level: 5, name: 'Athletic Neuro-Challenges', balls: '3 balls', detailed: false },
  { level: 6, name: 'Reaction & Cue Training', balls: '3 balls', detailed: false },
  { level: 7, name: 'The Coordination Chart', balls: '3 balls', detailed: false },
  { level: 8, name: 'The Mindset Behind It All', balls: '3 balls', detailed: false },
];

export const JUGGLING_TOTAL = JUGGLING_LEVELS.length;

/** The next level to work on = one past the highest cleared (capped at total). */
export function nextJugglingTarget(clearedLevel: number): number {
  return Math.min(JUGGLING_TOTAL, Math.max(0, clearedLevel) + 1);
}

/** A level can be marked cleared only when its instructions exist and it's the current target. */
export function canClearLevel(level: JugglingLevel, clearedLevel: number): boolean {
  return level.detailed && level.level === nextJugglingTarget(clearedLevel);
}
