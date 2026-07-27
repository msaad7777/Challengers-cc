// perceptualStaircase.ts — adaptive staircase for the NeuroVision "Perceptual
// Learning" trainer (contrast-sensitivity training).
//
// Background: UC Riverside's baseball perceptual-learning study (Deveau, Ozer
// & Seitz, Current Biology 2014) showed that training the brain to detect
// low-contrast oriented gratings (Gabor patches) transferred to real on-field
// vision — fewer strikeouts, better acuity. This module drives that training
// with a classic 2-down / 1-up staircase: after two correct answers we make
// the patch fainter (harder); after one wrong we make it more visible. The
// contrast at which the staircase oscillates is the player's ~70.7% detection
// threshold — LOWER is better (they can see fainter targets).
//
// Pure + deterministic — no React, no Firestore, no randomness — so it stays
// unit-testable (tests/perceptualStaircase.test.ts).

export interface StaircaseState {
  /** Current stimulus contrast, 0..1. */
  contrast: number;
  /** Correct answers since the last downward step (need 2 to step down). */
  consecutiveCorrect: number;
  /** Direction of the most recent step, or null before the first step. */
  lastDirection: 'down' | 'up' | null;
  /** Contrast values captured at each reversal (direction change). */
  reversals: number[];
  /** Total trials answered. */
  trials: number;
}

const MIN_CONTRAST = 0.008;
const MAX_CONTRAST = 1;
const FACTOR_DOWN = 0.8; // fainter → harder
const FACTOR_UP = 1.25; // brighter → easier
const REVERSALS_FOR_THRESHOLD = 6;

const clamp = (c: number) => Math.min(MAX_CONTRAST, Math.max(MIN_CONTRAST, c));

export function createStaircase(startContrast = 0.4): StaircaseState {
  return {
    contrast: clamp(startContrast),
    consecutiveCorrect: 0,
    lastDirection: null,
    reversals: [],
    trials: 0,
  };
}

/**
 * Advance the staircase by one trial. Returns a NEW state (pure) — the caller
 * renders the next Gabor at `next.contrast`.
 */
export function nextStaircase(state: StaircaseState, correct: boolean): StaircaseState {
  const next: StaircaseState = {
    ...state,
    reversals: [...state.reversals],
    trials: state.trials + 1,
  };

  if (correct) {
    next.consecutiveCorrect = state.consecutiveCorrect + 1;
    if (next.consecutiveCorrect >= 2) {
      // Step DOWN (harder). A down-step after an up-step is a reversal.
      if (state.lastDirection === 'up') next.reversals.push(state.contrast);
      next.contrast = clamp(state.contrast * FACTOR_DOWN);
      next.lastDirection = 'down';
      next.consecutiveCorrect = 0;
    }
    // else: one correct isn't enough to move — hold contrast.
  } else {
    // Any wrong answer steps UP (easier). An up-step after a down-step is a reversal.
    if (state.lastDirection === 'down') next.reversals.push(state.contrast);
    next.contrast = clamp(state.contrast * FACTOR_UP);
    next.lastDirection = 'up';
    next.consecutiveCorrect = 0;
  }

  return next;
}

/**
 * Estimated detection threshold — the mean contrast over the last few
 * reversals. Falls back to the current contrast before enough reversals exist.
 */
export function thresholdEstimate(state: StaircaseState): number {
  if (state.reversals.length === 0) return state.contrast;
  const tail = state.reversals.slice(-REVERSALS_FOR_THRESHOLD);
  return tail.reduce((a, b) => a + b, 0) / tail.length;
}

/** A run is "done" once it has enough reversals or hits the trial ceiling. */
export function staircaseComplete(state: StaircaseState, maxTrials = 45): boolean {
  return state.reversals.length >= 8 || state.trials >= maxTrials;
}
