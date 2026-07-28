import { describe, it, expect } from 'vitest';
import { scoreMot, nextMotConfig, MOT_DIFFICULTY } from '@/app/c3h/lib/mot';

describe('scoreMot', () => {
  it('scores a perfect round', () => {
    const s = scoreMot([1, 2, 3], [3, 1, 2]);
    expect(s.correct).toBe(3);
    expect(s.total).toBe(3);
    expect(s.accuracy).toBe(100);
    expect(s.perfect).toBe(true);
  });

  it('scores a partial round', () => {
    const s = scoreMot([1, 2, 3], [1, 2, 9]);
    expect(s.correct).toBe(2);
    expect(s.accuracy).toBe(67);
    expect(s.perfect).toBe(false);
  });

  it('is not perfect if a decoy is picked even when all targets are found', () => {
    // Picked all 2 targets plus a decoy -> not a clean round.
    const s = scoreMot([1, 2], [1, 2, 5]);
    expect(s.correct).toBe(2);
    expect(s.perfect).toBe(false);
  });

  it('handles an empty pick', () => {
    const s = scoreMot([1, 2], []);
    expect(s.correct).toBe(0);
    expect(s.accuracy).toBe(0);
  });
});

describe('nextMotConfig', () => {
  it('ramps up after a perfect round', () => {
    const next = nextMotConfig(MOT_DIFFICULTY.easy, true);
    expect(next.total).toBeGreaterThan(MOT_DIFFICULTY.easy.total);
    expect(next.speed).toBeGreaterThan(MOT_DIFFICULTY.easy.speed);
  });

  it('eases back after a miss', () => {
    const next = nextMotConfig(MOT_DIFFICULTY.hard, false);
    expect(next.total).toBeLessThan(MOT_DIFFICULTY.hard.total);
    expect(next.speed).toBeLessThan(MOT_DIFFICULTY.hard.speed);
  });

  it('stays within bounds at the extremes', () => {
    let cfg = MOT_DIFFICULTY.hard;
    for (let i = 0; i < 30; i++) cfg = nextMotConfig(cfg, true);
    expect(cfg.total).toBeLessThanOrEqual(14);
    expect(cfg.targets).toBeLessThanOrEqual(6);
    expect(cfg.speed).toBeLessThanOrEqual(3.4);

    let low = MOT_DIFFICULTY.easy;
    for (let i = 0; i < 30; i++) low = nextMotConfig(low, false);
    expect(low.total).toBeGreaterThanOrEqual(5);
    expect(low.targets).toBeGreaterThanOrEqual(2);
    expect(low.speed).toBeGreaterThanOrEqual(1);
  });
});
