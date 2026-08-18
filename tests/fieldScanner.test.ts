import { describe, it, expect } from 'vitest';
import {
  scanField,
  generateField,
  regionForScreenAngle,
  toCanonical,
  PRESET_FIELDS,
  type Fielder,
} from '@/app/c3h/lib/fieldScanner';

// Deterministic RNG (mulberry32) so generateField tests are reproducible.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A packed off side with the whole leg side (roughly 200–330°) left empty.
const OFF_HEAVY: Fielder[] = [
  { id: 'a', label: 'Mid-off', angle: 30, ring: 'in' },
  { id: 'b', label: 'Cover', angle: 60, ring: 'in' },
  { id: 'c', label: 'Point', angle: 90, ring: 'in' },
  { id: 'd', label: 'Gully', angle: 120, ring: 'in' },
  { id: 'e', label: 'Third man', angle: 150, ring: 'out' },
  { id: 'f', label: 'Straight', angle: 0, ring: 'out' },
];

describe('toCanonical', () => {
  it('is identity for a right-hander', () => {
    expect(toCanonical(60, 'RH')).toBe(60);
    expect(toCanonical(300, 'RH')).toBe(300);
  });

  it('mirrors across the vertical for a left-hander', () => {
    // Screen-left (300°) for a lefty is their OFF side → canonical 60° (cover).
    expect(toCanonical(300, 'LH')).toBe(60);
    expect(toCanonical(0, 'LH')).toBe(0);
  });
});

describe('regionForScreenAngle', () => {
  it('maps the off side to cover for a right-hander', () => {
    expect(regionForScreenAngle(60, 'RH').region).toBe('Cover');
    expect(regionForScreenAngle(60, 'RH').side).toBe('off');
  });

  it('maps the leg side to mid-wicket for a right-hander', () => {
    expect(regionForScreenAngle(305, 'RH').region).toBe('Mid-wicket');
    expect(regionForScreenAngle(305, 'RH').side).toBe('leg');
  });

  it('treats the straight zone as wrapping through 0°', () => {
    expect(regionForScreenAngle(5, 'RH').side).toBe('straight');
    expect(regionForScreenAngle(350, 'RH').side).toBe('straight');
  });

  it('flags the behind-the-bat zone as non-scoring', () => {
    expect(regionForScreenAngle(180, 'RH').isScoringGap).toBe(false);
  });

  it('mirrors cover to the screen-left for a left-hander', () => {
    expect(regionForScreenAngle(300, 'LH').region).toBe('Cover');
    expect(regionForScreenAngle(300, 'LH').side).toBe('off');
  });
});

describe('scanField', () => {
  it('finds the biggest scoring gap on the empty leg side', () => {
    const { topGap } = scanField(OFF_HEAVY, 'RH');
    expect(topGap).not.toBeNull();
    expect(topGap!.side).toBe('leg');
    // Somewhere between fine leg and mid-wicket.
    expect(topGap!.centerAngle).toBeGreaterThan(200);
    expect(topGap!.centerAngle).toBeLessThan(340);
    expect(topGap!.shot.length).toBeGreaterThan(0);
    expect(topGap!.bowlingPlan.length).toBeGreaterThan(0);
  });

  it('never returns the keeper zone as the top scoring gap', () => {
    const { topGap } = scanField(OFF_HEAVY, 'RH');
    expect(topGap!.isScoringGap).toBe(true);
  });

  it('reports one wide-open gap when no fielders are placed', () => {
    const { gaps, topGap } = scanField([], 'RH');
    expect(gaps.length).toBe(1);
    expect(gaps[0].widthDeg).toBe(360);
    expect(topGap).not.toBeNull();
  });

  it('drops noise-width gaps but keeps real lanes for a preset', () => {
    const { gaps } = scanField(PRESET_FIELDS['Standard T20'], 'RH');
    expect(gaps.every(g => g.widthDeg >= 12)).toBe(true);
    expect(gaps.length).toBeGreaterThan(0);
  });

  it('mirrors the open lane to the off side for a left-hander', () => {
    // Same physical placements, but read as a left-hander: the empty
    // screen-leg-side becomes the off side.
    const { topGap } = scanField(OFF_HEAVY, 'LH');
    expect(topGap!.side).toBe('off');
  });

  it('adds a spin-specific note when a bowler type is given', () => {
    const withSpin = scanField(OFF_HEAVY, 'RH', 'leg-spin');
    expect(withSpin.topGap!.bowlingPlan).toMatch(/leg-spinner/);
  });
});

describe('generateField (Rapid-scan drill)', () => {
  it('is deterministic for a given rng seed', () => {
    const a = generateField(mulberry32(42));
    const b = generateField(mulberry32(42));
    expect(a).toEqual(b);
  });

  it('produces a varied but plausible field size', () => {
    const f = generateField(mulberry32(7));
    expect(f.length).toBeGreaterThanOrEqual(5);
    expect(f.length).toBeLessThanOrEqual(10);
    expect(f.every(x => x.angle >= 0 && x.angle < 360)).toBe(true);
  });

  it('always leaves one clear run-scoring gap for the drill to score', () => {
    // The drill needs a definite right answer every round.
    for (let seed = 0; seed < 60; seed++) {
      const { topGap } = scanField(generateField(mulberry32(seed)), 'RH');
      expect(topGap).not.toBeNull();
      expect(topGap!.isScoringGap).toBe(true);
      expect(topGap!.widthDeg).toBeGreaterThanOrEqual(40);
    }
  });

  it('generates different fields across rounds', () => {
    const rng = mulberry32(99);
    const fields = Array.from({ length: 5 }, () => generateField(rng));
    const signatures = new Set(fields.map(f => f.map(x => Math.round(x.angle)).join(',')));
    expect(signatures.size).toBeGreaterThan(1);
  });
});
