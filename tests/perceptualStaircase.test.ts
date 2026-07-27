import { describe, it, expect } from 'vitest';
import {
  createStaircase,
  nextStaircase,
  thresholdEstimate,
  staircaseComplete,
} from '@/app/c3h/lib/perceptualStaircase';

describe('perceptual staircase (2-down / 1-up)', () => {
  it('holds contrast after a single correct answer', () => {
    const s0 = createStaircase(0.4);
    const s1 = nextStaircase(s0, true);
    expect(s1.contrast).toBeCloseTo(0.4);
    expect(s1.consecutiveCorrect).toBe(1);
    expect(s1.trials).toBe(1);
  });

  it('steps down (fainter) after two consecutive correct', () => {
    let s = createStaircase(0.4);
    s = nextStaircase(s, true);
    s = nextStaircase(s, true);
    expect(s.contrast).toBeCloseTo(0.4 * 0.8);
    expect(s.lastDirection).toBe('down');
    expect(s.consecutiveCorrect).toBe(0);
  });

  it('steps up (brighter) after any wrong answer', () => {
    let s = createStaircase(0.4);
    s = nextStaircase(s, false);
    expect(s.contrast).toBeCloseTo(0.4 * 1.25);
    expect(s.lastDirection).toBe('up');
  });

  it('records a reversal when direction flips down→up→down', () => {
    let s = createStaircase(0.4);
    s = nextStaircase(s, true);
    s = nextStaircase(s, true); // down (no reversal — first step)
    s = nextStaircase(s, false); // up → reversal #1
    expect(s.reversals.length).toBe(1);
    s = nextStaircase(s, true);
    s = nextStaircase(s, true); // down → reversal #2
    expect(s.reversals.length).toBe(2);
  });

  it('never lets contrast escape [0.008, 1]', () => {
    let s = createStaircase(0.02);
    for (let i = 0; i < 20; i++) s = nextStaircase(s, true);
    expect(s.contrast).toBeGreaterThanOrEqual(0.008);
    s = createStaircase(0.9);
    for (let i = 0; i < 20; i++) s = nextStaircase(s, false);
    expect(s.contrast).toBeLessThanOrEqual(1);
  });

  it('estimates threshold as the mean of recent reversals', () => {
    const s = createStaircase(0.4);
    s.reversals.push(0.2, 0.25, 0.15, 0.2);
    expect(thresholdEstimate(s)).toBeCloseTo((0.2 + 0.25 + 0.15 + 0.2) / 4);
  });

  it('falls back to current contrast before any reversal', () => {
    const s = createStaircase(0.33);
    expect(thresholdEstimate(s)).toBeCloseTo(0.33);
  });

  it('completes on reversal count or trial ceiling', () => {
    const s = createStaircase();
    s.reversals = [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2];
    expect(staircaseComplete(s)).toBe(true);
    const t = createStaircase();
    t.trials = 45;
    expect(staircaseComplete(t)).toBe(true);
    expect(staircaseComplete(createStaircase())).toBe(false);
  });
});
