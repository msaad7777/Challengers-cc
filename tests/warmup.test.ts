import { describe, it, expect } from 'vitest';
import { WARMUP_STEPS, WARMUP_SAFETY, FOUNDATIONAL_DRILLS } from '@/app/c3h/lib/warmup';

describe('WARMUP_STEPS', () => {
  it('is a short routine with valid durations', () => {
    expect(WARMUP_STEPS.length).toBeGreaterThanOrEqual(8);
    expect(WARMUP_STEPS.every((s) => s.seconds > 0 && s.text.length > 0)).toBe(true);
  });

  it('works each eye monocularly (covers left and right)', () => {
    const joined = WARMUP_STEPS.map((s) => s.text).join(' ');
    expect(joined).toContain('Cover your LEFT eye');
    expect(joined).toContain('Cover your RIGHT eye');
  });

  it('includes near-far focus and convergence', () => {
    const joined = WARMUP_STEPS.map((s) => s.text).join(' ').toLowerCase();
    expect(joined).toContain('far away');
    expect(joined).toContain('convergence');
  });

  it('carries a safety note', () => {
    expect(WARMUP_SAFETY.toLowerCase()).toMatch(/strain|dizz|blur/);
  });
});

describe('FOUNDATIONAL_DRILLS', () => {
  it('lists the 5 Week-5 drills with what/protocol/cricket detail', () => {
    expect(FOUNDATIONAL_DRILLS).toHaveLength(5);
    for (const d of FOUNDATIONAL_DRILLS) {
      expect(d.what.length).toBeGreaterThan(10);
      expect(d.protocol.length).toBeGreaterThan(10);
      expect(d.cricket.length).toBeGreaterThan(10);
    }
  });

  it('captures the pencil-in-straw accuracy-then-speed protocol', () => {
    const straw = FOUNDATIONAL_DRILLS.find((d) => d.name.toLowerCase().includes('straw'))!;
    expect(straw.protocol.toLowerCase()).toContain('accuracy');
    expect(straw.protocol.toLowerCase()).toContain('fast');
    expect(straw.protocol.toLowerCase()).toContain('switch');
  });
});
