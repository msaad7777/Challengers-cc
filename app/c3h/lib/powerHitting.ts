// powerHitting.ts — data + logic for the NeuroVision "Power Hitting" tracker.
// A physical, off-screen drill (like juggling) so the app guides + tracks it.
// The whole design pushes QUALITY over a 500-rep grind: short, full-intent
// sets with real rest, contact feedback, and match-week tapering — because
// swing speed is a nervous-system quality that fatigue destroys, not builds.
// Pure/data-only, no React, so it stays unit-testable.

export interface PowerPrinciple { icon: string; title: string; body: string; }

export const POWER_PRINCIPLES: PowerPrinciple[] = [
  {
    icon: '⚡', title: 'Quality beats a 500-rep grind',
    body: 'Swing speed is trained fresh, full-intent, in short sets with real rest — not by grinding hundreds of tired reps. Once you fatigue you groove a slow, sloppy swing. Stop a set early the moment the bat slows.',
  },
  {
    icon: '🏏', title: 'Contrast overload (your Pro Velocity bat)',
    body: 'If the training bat is heavier than your match bat, use it to build the strength and pattern — then swing your match bat and feel it move faster. Don’t bat with a much-heavier bat right before a game; it dulls your timing for a day or two.',
  },
  {
    icon: '🎯', title: 'Hit something — get contact feedback',
    body: 'Do most reps off a tee, drop-ball, or throwdowns, not just air swings. Air swings alone quietly train an overswing with no timing check. Clean strike + balanced finish on every rep.',
  },
  {
    icon: '📅', title: 'Time it around the game',
    body: 'Heavy volume makes you sore and temporarily flat. Load early in the week, taper off 1–2 days before you play, and do NO big volume the day before a game — arrive fresh, not fried.',
  },
  {
    icon: '🩹', title: 'Protect the elbow/wrist/shoulder',
    body: 'High-rep swinging with a heavier bat is an overuse risk. Full reps with full intent and full rest beats grinding through pain. If a joint complains, stop for the day.',
  },
];

export interface PowerProtocol {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restSec: number;
  contact: string;
  cue: string;
}

export const POWER_PROTOCOLS: PowerProtocol[] = [
  {
    id: 'contrast', name: 'Contrast Power (heavy → match)',
    sets: 6, reps: 10, restSec: 75, contact: 'Tee / drop-ball',
    cue: 'Alternate: a heavy-bat set, then a match-bat set — feel the match bat move faster. Full intent, clean strike, hold the finish.',
  },
  {
    id: 'tee', name: 'Tee Power Sets',
    sets: 8, reps: 15, restSec: 60, contact: 'Tee / drop-ball',
    cue: 'Max intent every swing. Hit through the ball, finish balanced. Rest fully between sets — quality over count.',
  },
  {
    id: 'volume', name: 'Big Volume (mid-week peak)',
    sets: 10, reps: 18, restSec: 60, contact: 'Tee / throwdowns',
    cue: 'Your heaviest swing day. Keep the quality high — end a set early if the swing slows. Do this early in the week, never before a game.',
  },
  {
    id: 'taper', name: 'Feel / Taper (match week)',
    sets: 3, reps: 10, restSec: 45, contact: 'Match bat, throwdowns',
    cue: 'Light and smooth — timing, not effort. Match-weight bat only. A sharpener, not a workout.',
  },
];

export const totalReps = (p: PowerProtocol): number => p.sets * p.reps;

// ── Drill progression ────────────────────────────────────────────────────
// Drills 1-14 are the ProVelocity CRICKET progression (provelocitycricket.com),
// not the baseball line at provelocitybat.com — the cricket product has its own
// cricket-specific drill list and these names/order match it exactly. They are
// their branded drills: follow their own videos for the exact method, the notes
// here are brief general hitting cues only. Drill 15 is an added cross-sport
// "connection" drill and is NOT theirs.
//
// These are designed to be run with the ProVelocity trainer bat. Its resistance
// makes it heavier than a match bat, so treat it as contrast/overload work —
// see the 'Time it around the game' principle above and keep it away from the
// 48h before a match, where it dulls timing.
//
// `phase` marks when a drill is safe to run. Most are 'any'. A drill flagged
// 'off-season' is a technique-remodelling drill: it deliberately changes a
// movement pattern, so running it close to a game risks grooving a fault you
// then carry to the crease. The UI surfaces this so match-week users skip it.

export type DrillPhase = 'any' | 'off-season';

export interface PowerDrill {
  n: number;
  name: string;
  note: string;
  source: 'ProVelocity' | 'Added';
  phase: DrillPhase;
}

export const POWER_DRILLS: PowerDrill[] = [
  { n: 1, name: 'One Click Hand Slot', note: 'Load into a strong, repeatable hitting position — hands “slotted” and ready to fire.', source: 'ProVelocity', phase: 'any' },
  { n: 2, name: 'Separation Drill', note: 'Create separation between the lower half and the hands so the swing uncoils in sequence, not all at once.', source: 'ProVelocity', phase: 'any' },
  { n: 3, name: 'Hand Slot & Separation', note: 'Combine the loaded hand slot with hip–hand separation into one move.', source: 'ProVelocity', phase: 'any' },
  { n: 4, name: 'Stop on Contact', note: 'Swing and freeze at the contact point to check your strike position and bat face.', source: 'ProVelocity', phase: 'any' },
  { n: 5, name: 'Three-Quarter Swing', note: 'Controlled ¾ swing to groove the path before adding full effort.', source: 'ProVelocity', phase: 'any' },
  { n: 6, name: 'Follow Thru', note: 'Full, balanced follow-through — finish under control every time.', source: 'ProVelocity', phase: 'any' },
  { n: 7, name: 'Full Swing', note: 'Complete swing at rhythm with a clean strike.', source: 'ProVelocity', phase: 'any' },
  { n: 8, name: 'Max Out', note: 'Full-intent, maximum bat-speed swings. Quality first — stop if it slows.', source: 'ProVelocity', phase: 'any' },
  { n: 9, name: 'Top Hand Isolation', note: 'Swing with the top hand only to train its control and swing path.', source: 'ProVelocity', phase: 'any' },
  { n: 10, name: 'Bottom Hand Isolation', note: 'Swing with the bottom hand only to train its power and whip.', source: 'ProVelocity', phase: 'any' },
  { n: 11, name: 'Full Toss', note: 'Hit full tosses to groove timing and clean contact.', source: 'ProVelocity', phase: 'any' },
  { n: 12, name: 'Half Volley', note: 'Drive the half-volley length — the classic scoring length.', source: 'ProVelocity', phase: 'any' },
  { n: 13, name: 'Self Feed', note: 'Drop/toss to yourself and hit — a solo rep builder.', source: 'ProVelocity', phase: 'any' },
  { n: 14, name: 'Cut Shot', note: 'Back-foot cut to width — free the arms through point.', source: 'ProVelocity', phase: 'any' },
  {
    n: 15, name: 'Towel Connection (added)', source: 'Added', phase: 'off-season',
    // Borrowed from the golf "Hogan" connection drill and its baseball cousin
    // (towel under the front elbow). Both are CONNECTION drills — neither is a
    // bat-speed drill, despite how they are usually sold. Any speed gain is a
    // second-order effect of better sequencing.
    note: 'Connection drill borrowed from golf/baseball — NOT a bat-speed drill, whatever the videos claim. Tuck a small towel or glove under your top-hand armpit and shadow-swing, keeping it pinned. If it drops, your arms have disconnected from your body. Keep every rep to a HALF or THREE-QUARTER swing — going full defeats the drill. Transfers to ROTATIONAL, cross-bat hitting (pull, hook, slog-sweep, flat-batted leg-side power), which is mechanically close to a baseball swing. ⚠ Do NOT use it for the vertical-bat drive: it pulls the front elbow down and shortens the arc out in front, fighting the high elbow and full extension through the line that a drive is built on. Off-season / technique-block work only — never in match week.',
  },
];

/** Drills safe to run in match week (everything not flagged 'off-season'). */
export const matchWeekDrills = (drills: PowerDrill[] = POWER_DRILLS): PowerDrill[] =>
  drills.filter((d) => d.phase !== 'off-season');
