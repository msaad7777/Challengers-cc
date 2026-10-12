// strikingDrills.ts — net drills that train a DECISION, not a movement.
//
// The distinction that matters: most net work repeats a pattern. You know what
// is coming, so the brain is only running the motor programme. A decision drill
// withholds the information until the last moment, so the batter has to read
// and choose under time pressure — which is the actual skill a match tests.
// Players concentrate visibly harder in these, and that is the point.
//
// ── Attribution ──────────────────────────────────────────────────────────
// Sourced from Julian Wood's power-hitting material (julianwoodcricket.com).
// Captured as brief general setup notes in our own words so a coach can run
// them; go to his own videos for the coaching itself. Do NOT expand these into
// a step-by-step reproduction of his method, and keep this comment intact.
// Same rule as the ProVelocity progression in powerHitting.ts.
//
// Pure/data-only, no React. Any randomness (which ball to feed) is the
// CALLER's job — see pickFeed() — so this module stays deterministic and
// testable, per the convention for this directory.

import type { BattingIntent } from './setupMechanics';

export type DrillKind = 'decision' | 'striking';

export interface StrikingDrill {
  id: string;
  name: string;
  kind: DrillKind;
  /** The skill actually being trained, as opposed to what it looks like. */
  trains: string;
  setup: string;
  rules: string[];
  coachNote: string;
  /** Which batting setup the drill is run from, where it matters. */
  intent?: BattingIntent;
}

export const STRIKING_DRILLS: StrikingDrill[] = [
  {
    id: 'colour-ball-leave-or-hit',
    name: 'Colour ball: leave or hit',
    kind: 'decision',
    trains: 'Shot selection and restraint under time pressure. The batter cannot pre-plan, so every ball is a genuine read.',
    setup: 'Two clearly different balls — any two will do, they need not be weighted or any particular colour, only told apart in flight. Feeder mixes them without telling the batter which is coming.',
    rules: [
      'One colour is the LEAVE ball. It must be left, however inviting it looks.',
      'The other colour is the HIT ball. Only that one gets played.',
      'The batter does not know which is coming until it is released.',
      'Leaving the wrong ball and hitting the wrong ball are both faults — score them equally.',
    ],
    coachNote: 'Restraint is the half players skip. A batter who hits every red and also hits two yellows has not passed. Watch concentration drop off as the set runs long and stop before it does.',
  },
  {
    id: 'play-straight-vs-strike-straight',
    name: 'Play straight vs strike straight',
    kind: 'striking',
    trains: 'Feeling the difference between a compact straight bat and a striking bat path with room to extend — and knowing which one you have chosen.',
    setup: 'Same delivery, same length, alternating blocks. First block from the batting setup playing straight; second block from the hitting setup, creating space and letting the bat come through on a slight diagonal.',
    rules: [
      'Block A: traditional grip, batting stance, straight bat, stay compact.',
      'Block B: power grip, hitting stance, create room, let the hands extend through contact.',
      'Change one thing at a time — do not drift into block B grip while still in block A.',
      'If a radar or exit-velocity app is available, record both. The difference is the lesson.',
    ],
    coachNote: 'The limiter on the straight shot is room: hands that cannot extend cannot accelerate. Players feel this immediately and stop treating the two as the same shot played harder.',
    intent: 'strike',
  },
];

export const byKind = (kind: DrillKind, drills: StrikingDrill[] = STRIKING_DRILLS): StrikingDrill[] =>
  drills.filter((d) => d.kind === kind);

export function drillById(id: string, drills: StrikingDrill[] = STRIKING_DRILLS): StrikingDrill {
  const d = drills.find((x) => x.id === id);
  if (!d) throw new Error(`no striking drill with id "${id}"`);
  return d;
}

/**
 * Which ball the feeder should deliver next, for the colour-ball drill.
 *
 * `rng` is injected rather than imported so the UI can pass Math.random and a
 * test can pass a seeded generator — the rule for every non-deterministic
 * function in this directory.
 *
 * `hitShare` is the proportion of HIT balls. Defaults to 0.5. Keeping it near
 * half is deliberate: skew it towards the hit ball and the batter stops
 * deciding and starts swinging, which is the habit the drill exists to break.
 */
export function pickFeed(rng: () => number, hitShare = 0.5): 'hit' | 'leave' {
  if (!(hitShare >= 0 && hitShare <= 1)) throw new Error(`hitShare must be between 0 and 1, got ${hitShare}`);
  return rng() < hitShare ? 'hit' : 'leave';
}

/** Score a set: a leave on a leave-ball counts as much as a hit on a hit-ball. */
export function scoreSet(
  balls: Array<{ fed: 'hit' | 'leave'; played: boolean }>,
): { correct: number; total: number; missedHits: number; playedLeaves: number } {
  let correct = 0, missedHits = 0, playedLeaves = 0;
  for (const b of balls) {
    const right = b.fed === 'hit' ? b.played : !b.played;
    if (right) correct++;
    else if (b.fed === 'hit') missedHits++;
    else playedLeaves++;
  }
  return { correct, total: balls.length, missedHits, playedLeaves };
}
