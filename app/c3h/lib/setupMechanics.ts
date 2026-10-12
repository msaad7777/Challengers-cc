// setupMechanics.ts — grip and stance, and why they change with intent.
//
// The one idea worth taking away: a batting setup and a hitting setup are two
// different things built for two different jobs. You cannot bat properly from a
// hitting stance, and you cannot clear a boundary from a batting stance. Which
// one you take guard in is a decision, not a habit — so this module is keyed by
// INTENT rather than listing "the correct" grip and stance.
//
// ── Attribution ──────────────────────────────────────────────────────────
// The grip and stance distinctions below are Julian Wood's power-hitting
// material (julianwoodcricket.com). They are HIS coaching method, captured here
// as brief general cues in our own words so a player knows what to look for and
// can go to his own videos for the actual coaching. Do NOT expand these into a
// step-by-step reproduction of his breakdown, and keep this comment intact.
// Same rule as the ProVelocity progression in powerHitting.ts.
//
// Deliberately omitted: his numeric claims — the percentage of extra swing the
// open bat toe buys, and the exit-velocity readings from his sessions. Those
// are his measurements of particular players on particular days. The PRINCIPLE
// (space and a freer bat path strike harder than a compact straight bat) is
// general and worth teaching; his numbers are his data and are not ours to
// republish as if they were a general result.
//
// Pure/data-only, no React, no randomness — unit-testable.

/** What the batter is trying to do this ball. The setup follows from this. */
export type BattingIntent = 'build' | 'strike';

export interface GripSpec {
  intent: BattingIntent;
  name: string;
  /** Non-negotiable in both grips — the control reference point. */
  topHand: string;
  bottomHand: string;
  why: string;
  caution: string;
}

export interface StanceSpec {
  intent: BattingIntent;
  name: string;
  base: string;
  batPosition: string;
  /** What must stay true in BOTH stances, or the setup has gone wrong. */
  alignment: string;
  why: string;
  caution: string;
}

export const GRIPS: GripSpec[] = [
  {
    intent: 'build',
    name: 'Traditional grip',
    topHand: 'The V of the top hand runs down the outside edge of the bat.',
    bottomHand: 'Sits close behind the top hand so the two Vs line up with each other.',
    why: 'Keeps the face slightly closed and under control, which is what straight-bat play and driving need.',
    caution: 'Controlled, but the wrists cannot cock as freely, so there is less whip available at contact.',
  },
  {
    intent: 'strike',
    name: 'Power-hitting grip',
    topHand: 'Unchanged — the V of the top hand still runs down the outside edge. This is the part you never give up.',
    bottomHand: 'Rotates further round towards a palm-up position.',
    why: 'Frees the wrists to cock further, so there is more whip and more bat speed through the ball.',
    caution: 'A small change with a big effect. Move the bottom hand, never the top — losing the top-hand V costs you control of the face.',
  },
];

export const STANCES: StanceSpec[] = [
  {
    intent: 'build',
    name: 'Batting stance',
    base: 'Compact and narrow.',
    batPosition: 'Held back behind the body.',
    alignment: 'Head over hands, hands over back foot — one straight line.',
    why: 'Built for straight, controlled shots: defence, driving, playing late.',
    caution: 'There is little room to swing from here. Trying to hit from a batting stance is how you end up reaching.',
  },
  {
    intent: 'strike',
    name: 'Hitting stance',
    base: 'Wider and more athletic.',
    batPosition: 'Toe of the bat opened out towards first slip rather than tucked behind the body.',
    alignment: 'Still head over hands over back foot — the wider base does not change this.',
    why: 'Opening the bat out creates room, so there is more swing available through the ball.',
    caution: 'You cannot bat an innings from here. This is a setup you choose for a ball or a phase, not a default.',
  },
];

/** The paired grip and stance for a given intent. */
export function setupFor(intent: BattingIntent): { grip: GripSpec; stance: StanceSpec } {
  const grip = GRIPS.find((g) => g.intent === intent);
  const stance = STANCES.find((s) => s.intent === intent);
  if (!grip || !stance) throw new Error(`no setup defined for intent "${intent}"`);
  return { grip, stance };
}

/** What stays true whichever setup you take. Breaking these is a fault, not a style. */
export const SETUP_CONSTANTS: string[] = [
  'The V of the top hand runs down the outside edge of the bat, in both grips.',
  'Head over hands, hands over back foot — in both stances.',
  'Only the bottom hand and the width of the base change between the two.',
];

/** The two setups side by side, for teaching the contrast rather than one setup. */
export function compareSetups(): Array<{ aspect: string; build: string; strike: string }> {
  const b = setupFor('build');
  const s = setupFor('strike');
  return [
    { aspect: 'Top hand', build: b.grip.topHand, strike: s.grip.topHand },
    { aspect: 'Bottom hand', build: b.grip.bottomHand, strike: s.grip.bottomHand },
    { aspect: 'Base', build: b.stance.base, strike: s.stance.base },
    { aspect: 'Bat position', build: b.stance.batPosition, strike: s.stance.batPosition },
    { aspect: 'Built for', build: b.stance.why, strike: s.stance.why },
  ];
}


// ── Bat path and space ───────────────────────────────────────────────────
// The reason the hitting setup exists. Playing straight and striking straight
// are different actions, and the limiter on the straight one is room: hands
// that cannot extend cannot accelerate.

export interface BatPath {
  intent: BattingIntent;
  name: string;
  path: string;
  space: string;
  tradeoff: string;
}

/** Degrees off straight for the striking bat path. A range, not a target. */
export const STRIKE_PATH_DEGREES: readonly [number, number] = [30, 45];

export const BAT_PATHS: BatPath[] = [
  {
    intent: 'build',
    name: 'Playing straight',
    path: 'Bat comes through straight, face square to the ball.',
    space: 'Close to the ball, compact, hands kept in.',
    tradeoff: 'Technically sound and low risk, but the hands never get room to accelerate, so the ball comes off slower.',
  },
  {
    intent: 'strike',
    name: 'Striking straight',
    path: `Bat comes through on a slight diagonal, roughly ${STRIKE_PATH_DEGREES[0]}–${STRIKE_PATH_DEGREES[1]} degrees off straight.`,
    space: 'Create room between yourself and the ball so the hands can extend through contact.',
    tradeoff: 'Markedly harder strike, but it needs the power grip and the wider base — attempting it from the batting setup is how you reach and edge.',
  },
];

export function batPathFor(intent: BattingIntent): BatPath {
  const p = BAT_PATHS.find((b) => b.intent === intent);
  if (!p) throw new Error(`no bat path defined for intent "${intent}"`);
  return p;
}

/** Everything that changes when the intent changes, in one object. */
export function fullSetupFor(intent: BattingIntent): {
  grip: GripSpec; stance: StanceSpec; batPath: BatPath;
} {
  return { ...setupFor(intent), batPath: batPathFor(intent) };
}
