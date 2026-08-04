import { describe, it, expect } from 'vitest';
import { WARMUP_STEPS, WARMUP_SAFETY } from '@/app/c3h/lib/warmup';

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
