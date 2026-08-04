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
// The ProVelocity swing progression (their branded drills — follow their own
// videos for the exact method; the notes here are brief, general hitting cues
// only) plus an added golf-style "connection" drill Saad asked for.

export interface PowerDrill { n: number; name: string; note: string; source: 'ProVelocity' | 'Added'; }

export const POWER_DRILLS: PowerDrill[] = [
  { n: 1, name: 'One Click Hand Slot', note: 'Load into a strong, repeatable hitting position — hands “slotted” and ready to fire.', source: 'ProVelocity' },
  { n: 2, name: 'Separation Drill', note: 'Create separation between the lower half and the hands so the swing uncoils in sequence, not all at once.', source: 'ProVelocity' },
  { n: 3, name: 'Hand Slot & Separation', note: 'Combine the loaded hand slot with hip–hand separation into one move.', source: 'ProVelocity' },
  { n: 4, name: 'Stop on Contact', note: 'Swing and freeze at the contact point to check your strike position and bat face.', source: 'ProVelocity' },
  { n: 5, name: 'Three-Quarter Swing', note: 'Controlled ¾ swing to groove the path before adding full effort.', source: 'ProVelocity' },
  { n: 6, name: 'Follow Thru', note: 'Full, balanced follow-through — finish under control every time.', source: 'ProVelocity' },
  { n: 7, name: 'Full Swing', note: 'Complete swing at rhythm with a clean strike.', source: 'ProVelocity' },
  { n: 8, name: 'Max Out', note: 'Full-intent, maximum bat-speed swings. Quality first — stop if it slows.', source: 'ProVelocity' },
  { n: 9, name: 'Top Hand Isolation', note: 'Swing with the top hand only to train its control and swing path.', source: 'ProVelocity' },
  { n: 10, name: 'Bottom Hand Isolation', note: 'Swing with the bottom hand only to train its power and whip.', source: 'ProVelocity' },
  { n: 11, name: 'Full Toss', note: 'Hit full tosses to groove timing and clean contact.', source: 'ProVelocity' },
  { n: 12, name: 'Half Volley', note: 'Drive the half-volley length — the classic scoring length.', source: 'ProVelocity' },
  { n: 13, name: 'Self Feed', note: 'Drop/toss to yourself and hit — a solo rep builder.', source: 'ProVelocity' },
  { n: 14, name: 'Cut Shot', note: 'Back-foot cut to width — free the arms through point.', source: 'ProVelocity' },
  {
    n: 15, name: 'Towel Connection (added)', source: 'Added',
    note: 'Golf-style connection drill. Tuck a small towel or glove under your top-hand armpit and shadow-swing straight drives, keeping it pinned through contact and the follow-through. If it drops, your arms disconnected from your body. Trains a connected, body-driven swing and a compact arc = better power transfer. Best for straight-bat drives / down-the-ground hitting — not cross-bat pull or cut.',
  },
];
