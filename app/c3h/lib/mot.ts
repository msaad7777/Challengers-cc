// mot.ts — pure logic for the NeuroVision "Multiple Object Tracking" (MOT)
// trainer. MOT is a classic sports-vision drill (the NeuroTracker family):
// hold several moving targets in your peripheral vision while soft-focusing a
// central point, then pick them out once everything freezes. It trains the
// dynamic, divided attention a fielder/batter uses to read play under load.
//
// Pure + deterministic (no React, no randomness) so it stays unit-testable.

export interface MotConfig {
  /** Total balls on screen. */
  total: number;
  /** How many are targets to track. */
  targets: number;
  /** Motion speed multiplier. */
  speed: number;
  /** How long the tracking phase lasts, ms. */
  trackMs: number;
}

export type MotDifficulty = 'easy' | 'medium' | 'hard';

export const MOT_DIFFICULTY: Record<MotDifficulty, MotConfig> = {
  easy: { total: 6, targets: 2, speed: 1.2, trackMs: 8000 },
  medium: { total: 8, targets: 3, speed: 1.8, trackMs: 10000 },
  hard: { total: 10, targets: 4, speed: 2.6, trackMs: 12000 },
};

export interface MotScore {
  correct: number;
  total: number;
  /** 0-100. */
  accuracy: number;
  /** True only when every target was found and no decoy was picked. */
  perfect: boolean;
}

/**
 * Score a round: how many of the picked balls were actual targets.
 * A pick that isn't a target counts against a perfect round but the accuracy
 * is reported against the number of targets (the thing you were asked to hold).
 */
export function scoreMot(targetIds: number[], pickedIds: number[]): MotScore {
  const targetSet = new Set(targetIds);
  const pickedSet = new Set(pickedIds);
  let correct = 0;
  pickedSet.forEach((id) => { if (targetSet.has(id)) correct++; });
  const total = targetIds.length;
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
  const perfect = correct === total && pickedSet.size === total;
  return { correct, total, accuracy, perfect };
}

/**
 * Adaptive nudge: a perfect round nudges the config harder (more balls, a
 * little faster; occasionally one more target), a miss eases it back. Bounded
 * so it never runs away. Returns a NEW config (pure).
 */
export function nextMotConfig(cfg: MotConfig, perfect: boolean): MotConfig {
  if (perfect) {
    const total = Math.min(14, cfg.total + 1);
    const targets = total >= cfg.targets * 3 ? Math.min(6, cfg.targets + 1) : cfg.targets;
    return { total, targets, speed: Math.min(3.4, cfg.speed + 0.2), trackMs: cfg.trackMs };
  }
  return {
    total: Math.max(5, cfg.total - 1),
    targets: Math.max(2, cfg.targets),
    speed: Math.max(1, cfg.speed - 0.3),
    trackMs: cfg.trackMs,
  };
}
