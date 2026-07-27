// fieldScanner.ts — pure logic behind the NeuroVision "Quick Field Scanner".
//
// Given a set of placed fielders, compute where the gaps are and translate
// each gap into (a) the attacking shot a batsman should play to exploit it
// and (b) how the bowler should bowl to protect it. No Firestore, no React —
// keep it pure so it stays unit-testable (see tests/fieldScanner.test.ts).
//
// GEOMETRY / ANGLE CONVENTION
// ---------------------------
// Everything the UI hands us is in SCREEN degrees: 0° points straight up the
// ground (toward the bowler), increasing CLOCKWISE (90° = screen-right,
// 180° = straight behind the batsman / keeper, 270° = screen-left).
//
// The shot/region logic, however, is written in a handedness-normalized
// "batsman frame" where the OFF side is always the right half (canonical
// 0–180°). For a right-hander screen == canonical; for a left-hander we
// mirror across the vertical axis (canonical = 360 − screen) so that, e.g.,
// a fielder placed screen-left for a lefty is correctly read as an off-side
// cover. Gap geometry is computed in SCREEN space; only the region lookup
// converts to canonical.

export type Handedness = 'RH' | 'LH';
export type Ring = 'in' | 'out';
export type BowlerType = 'pace' | 'off-spin' | 'leg-spin';

export interface Fielder {
  id: string;
  label: string;
  /** Screen degrees, 0 = straight (toward bowler), clockwise. 0..360. */
  angle: number;
  ring: Ring;
}

export type FieldSide = 'off' | 'leg' | 'straight' | 'behind';

export interface FieldGap {
  /** Screen degrees at the middle of the gap (for drawing the wedge). */
  centerAngle: number;
  /** Angular width of the uncovered arc, in degrees. */
  widthDeg: number;
  region: string;
  side: FieldSide;
  shot: string;
  shotDetail: string;
  bowlingPlan: string;
  /** False for the keeper/slip zone directly behind — not a run-scoring lane. */
  isScoringGap: boolean;
}

export interface ScanResult {
  /** All gaps above the noise floor, widest first. */
  gaps: FieldGap[];
  /** Widest run-scoring gap, or null if the field is packed. */
  topGap: FieldGap | null;
}

const norm360 = (deg: number): number => ((deg % 360) + 360) % 360;

/** Screen degrees → handedness-normalized batsman frame (off side = right). */
export const toCanonical = (screenAngle: number, hand: Handedness): number =>
  hand === 'RH' ? norm360(screenAngle) : norm360(360 - screenAngle);

interface RegionSpec {
  region: string;
  side: FieldSide;
  shot: string;
  shotDetail: string;
  bowlingPlan: string;
  isScoringGap: boolean;
}

// Canonical-frame region table. Buckets are checked in order; the first whose
// [lo, hi) contains the angle wins. The straight-bat zone wraps 345→360→20,
// handled explicitly at the top.
const REGION_TABLE: { lo: number; hi: number; spec: RegionSpec }[] = [
  {
    lo: 20, hi: 55,
    spec: {
      region: 'Extra cover', side: 'off',
      shot: 'Cover drive', shotDetail: 'Wait for the fuller ball and drive along the ground into the gap.',
      bowlingPlan: 'Pull the length back and hold a top-of-off line — starve the half-volley the drive feeds on.',
      isScoringGap: true,
    },
  },
  {
    lo: 55, hi: 85,
    spec: {
      region: 'Cover', side: 'off',
      shot: 'Cover drive / square drive', shotDetail: 'Punch off the back foot if short, drive if full — both run into this gap.',
      bowlingPlan: 'Straighten the line onto the stumps and cut off the width the square drive needs.',
      isScoringGap: true,
    },
  },
  {
    lo: 85, hi: 110,
    spec: {
      region: 'Point', side: 'off',
      shot: 'Square cut', shotDetail: 'Back-foot cut to anything short and wide — free the arms through point.',
      bowlingPlan: 'Bowl fuller and straighter; a cut needs both width and length to work.',
      isScoringGap: true,
    },
  },
  {
    lo: 110, hi: 145,
    spec: {
      region: 'Backward point / gully', side: 'off',
      shot: 'Late cut / steer', shotDetail: 'Use the pace — angle the face and steer down to third.',
      bowlingPlan: 'Keep it up and straight; deny the back-of-length width the steer runs on.',
      isScoringGap: true,
    },
  },
  {
    lo: 145, hi: 200,
    spec: {
      region: 'Keeper / slips (behind off)', side: 'behind',
      shot: '—', shotDetail: 'This is the edge zone behind the bat, not a run-scoring lane.',
      bowlingPlan: 'Leave your catchers here — inviting the edge, not defending a gap.',
      isScoringGap: false,
    },
  },
  {
    lo: 200, hi: 235,
    spec: {
      region: 'Fine leg', side: 'leg',
      shot: 'Glance / paddle sweep', shotDetail: 'Deflect fine off the hip or paddle the fuller ball down to fine leg.',
      bowlingPlan: 'Hold a fourth-stump line — straying onto the pads gifts the glance.',
      isScoringGap: true,
    },
  },
  {
    lo: 235, hi: 290,
    spec: {
      region: 'Square leg', side: 'leg',
      shot: 'Pull / square sweep', shotDetail: 'Rock back and pull the short ball, or sweep the spinner square.',
      bowlingPlan: 'Deny the short ball into the body; keep it full and outside off.',
      isScoringGap: true,
    },
  },
  {
    lo: 290, hi: 325,
    spec: {
      region: 'Mid-wicket', side: 'leg',
      shot: 'Flick / clip / pull', shotDetail: 'Work the ball off the pads through the biggest gap in the leg field.',
      bowlingPlan: 'Straighten the line to off stump; leg-stump bowling feeds the clip.',
      isScoringGap: true,
    },
  },
];

// Straight zone (wraps): canonical [325, 360) ∪ [0, 20).
const STRAIGHT_SPEC: RegionSpec = {
  region: 'Down the ground', side: 'straight',
  shot: 'Straight drive / on-drive', shotDetail: 'Present the full face and drive straight past the bowler.',
  bowlingPlan: 'Bowl wider of off or into the pads to take the straight lane away.',
  isScoringGap: true,
};

export function regionForScreenAngle(screenAngle: number, hand: Handedness): RegionSpec {
  const a = toCanonical(screenAngle, hand);
  if (a >= 325 || a < 20) return STRAIGHT_SPEC;
  const hit = REGION_TABLE.find(r => a >= r.lo && a < r.hi);
  return hit ? hit.spec : STRAIGHT_SPEC;
}

// How much arc a single fielder is treated as "covering". Deep fielders guard
// a wider boundary arc than an infielder guards for singles.
const COVER_HALF_WIDTH: Record<Ring, number> = { in: 15, out: 20 };

// Gaps narrower than this are noise, not exploitable lanes.
const MIN_GAP_DEG = 12;

/**
 * Compute the open lanes in a field. Coverage is sampled at 1° resolution
 * around the full circle (robust for wrap-around), then maximal uncovered
 * runs become gaps, each translated to a shot + bowling plan.
 */
export function scanField(
  fielders: Fielder[],
  hand: Handedness = 'RH',
  bowler?: BowlerType,
): ScanResult {
  const covered = new Array<boolean>(360).fill(false);
  for (const f of fielders) {
    const half = COVER_HALF_WIDTH[f.ring];
    for (let d = -half; d <= half; d++) {
      covered[norm360(Math.round(f.angle) + d)] = true;
    }
  }

  // Find maximal runs of `false` on the circular array. Rotate the start to a
  // covered index first so no genuine gap is split across the 0/360 seam;
  // if everything is uncovered, the whole circle is one gap.
  const firstCovered = covered.indexOf(true);
  const gaps: FieldGap[] = [];

  const pushGap = (startDeg: number, len: number) => {
    if (len < MIN_GAP_DEG) return;
    // A fully-open field has no meaningful centre — anchor it straight so it
    // reads as a scoring lane rather than landing on the behind-the-bat zone.
    const center = len >= 360 ? 0 : norm360(startDeg + len / 2);
    const spec = regionForScreenAngle(center, hand);
    gaps.push({
      centerAngle: center,
      widthDeg: len,
      region: spec.region,
      side: spec.side,
      shot: spec.shot,
      shotDetail: spec.shotDetail,
      bowlingPlan: withBowlerNuance(spec, bowler),
      isScoringGap: spec.isScoringGap,
    });
  };

  if (firstCovered === -1) {
    // No fielders / nothing covered — treat as one wide-open field.
    pushGap(0, 360);
  } else {
    let runStart = -1;
    let runLen = 0;
    for (let i = 0; i < 360; i++) {
      const idx = (firstCovered + i) % 360;
      if (!covered[idx]) {
        if (runStart === -1) runStart = idx;
        runLen++;
      } else if (runStart !== -1) {
        pushGap(runStart, runLen);
        runStart = -1;
        runLen = 0;
      }
    }
    if (runStart !== -1) pushGap(runStart, runLen);
  }

  gaps.sort((a, b) => b.widthDeg - a.widthDeg);
  const topGap = gaps.find(g => g.isScoringGap) ?? null;
  return { gaps, topGap };
}

// Append a spin/pace-specific nudge to the bowling plan without duplicating
// the whole table per bowler type.
function withBowlerNuance(spec: RegionSpec, bowler?: BowlerType): string {
  if (!bowler || !spec.isScoringGap) return spec.bowlingPlan;
  if (bowler === 'off-spin') {
    return `${spec.bowlingPlan} As an off-spinner, use the turn into the pads and pack the leg side if this gap is square of the wicket.`;
  }
  if (bowler === 'leg-spin') {
    return `${spec.bowlingPlan} As a leg-spinner, drift it in and turn it away — the drift buys you an extra beat before this gap opens.`;
  }
  return `${spec.bowlingPlan} At pace, a heavy back-of-length ball is your safest way to shut this lane.`;
}

// ── Preset fields (screen degrees) ──────────────────────────────────────
// Starting layouts so a director isn't dragging nine dots from scratch.
// Roughly standard T20 sets for a right-hander; the UI mirrors for a lefty.
export const PRESET_FIELDS: Record<string, Fielder[]> = {
  'Standard T20': [
    { id: 'p1', label: 'Mid-off', angle: 35, ring: 'in' },
    { id: 'p2', label: 'Cover', angle: 65, ring: 'in' },
    { id: 'p3', label: 'Point', angle: 95, ring: 'in' },
    { id: 'p4', label: 'Third man', angle: 150, ring: 'out' },
    { id: 'p5', label: 'Fine leg', angle: 215, ring: 'out' },
    { id: 'p6', label: 'Square leg', angle: 265, ring: 'in' },
    { id: 'p7', label: 'Mid-wicket', angle: 305, ring: 'in' },
    { id: 'p8', label: 'Mid-on', angle: 335, ring: 'in' },
    { id: 'p9', label: 'Long-on', angle: 345, ring: 'out' },
  ],
  'Attacking (catchers in)': [
    { id: 'p1', label: 'Slip', angle: 160, ring: 'in' },
    { id: 'p2', label: 'Gully', angle: 130, ring: 'in' },
    { id: 'p3', label: 'Point', angle: 95, ring: 'in' },
    { id: 'p4', label: 'Cover', angle: 60, ring: 'in' },
    { id: 'p5', label: 'Mid-off', angle: 30, ring: 'in' },
    { id: 'p6', label: 'Mid-on', angle: 335, ring: 'in' },
    { id: 'p7', label: 'Mid-wicket', angle: 300, ring: 'in' },
    { id: 'p8', label: 'Square leg', angle: 265, ring: 'in' },
    { id: 'p9', label: 'Fine leg', angle: 215, ring: 'in' },
  ],
  'Boundary (deep set)': [
    { id: 'p1', label: 'Long-off', angle: 25, ring: 'out' },
    { id: 'p2', label: 'Deep cover', angle: 65, ring: 'out' },
    { id: 'p3', label: 'Deep point', angle: 95, ring: 'out' },
    { id: 'p4', label: 'Third man', angle: 150, ring: 'out' },
    { id: 'p5', label: 'Fine leg', angle: 215, ring: 'out' },
    { id: 'p6', label: 'Deep square', angle: 265, ring: 'out' },
    { id: 'p7', label: 'Deep mid-wicket', angle: 305, ring: 'out' },
    { id: 'p8', label: 'Long-on', angle: 340, ring: 'out' },
    { id: 'p9', label: 'Cover', angle: 60, ring: 'in' },
  ],
};
