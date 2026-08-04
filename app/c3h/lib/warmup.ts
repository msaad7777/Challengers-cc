// warmup.ts — the daily eye/neural warm-up for the NeuroVision Lab.
// Monocular eye stretches (one eye at a time) to activate each eye's full range
// of motion, then near-far focus + convergence to switch on the eye-brain link.
// Meant to be run FIRST, every day, before any other drill or a game — low
// intensity, no fatigue. Pure data so it stays testable. Shape matches the
// RoutinePlayer step ({text, seconds, breathe}).

export interface WarmupStep { text: string; seconds: number; breathe: boolean; }

export const WARMUP_STEPS: WarmupStep[] = [
  { seconds: 12, breathe: false, text: 'Relax first. Rub your palms together until warm, then cup them gently over your closed eyes for a few seconds. Let the eyes settle.' },
  { seconds: 14, breathe: false, text: 'Cover your LEFT eye. With your right eye only, look all the way UP… and all the way DOWN. Slow, full range. 4 times.' },
  { seconds: 14, breathe: false, text: 'Right eye only: look far LEFT… and far RIGHT. Full stretch into each corner. 4 times.' },
  { seconds: 14, breathe: false, text: 'Right eye only: trace the DIAGONALS — top-left to bottom-right, then top-right to bottom-left. 3 each way.' },
  { seconds: 14, breathe: false, text: 'Right eye only: draw big, slow CIRCLES — 3 clockwise, 3 anti-clockwise, right out to the edges.' },
  { seconds: 14, breathe: false, text: 'Switch. Cover your RIGHT eye. Left eye only: UP and DOWN, full range, 4 times.' },
  { seconds: 14, breathe: false, text: 'Left eye only: far LEFT and far RIGHT, 4 times.' },
  { seconds: 16, breathe: false, text: 'Left eye only: DIAGONALS both ways, 3 each — then big CIRCLES, 3 clockwise and 3 anti-clockwise.' },
  { seconds: 14, breathe: false, text: 'Both eyes now. Hold a finger at arm’s length. Focus on it, then snap your focus to something far away, and back. 8 times.' },
  { seconds: 14, breathe: false, text: 'Convergence: bring your finger slowly toward the tip of your nose, keeping it single as long as you can. When it doubles, ease back out. 5 slow reps.' },
  { seconds: 8, breathe: false, text: 'Finish: blink softly 10 times and relax. Your eyes are switched on — now go into your session.' },
];

export const WARMUP_SAFETY = 'Stop if you feel eye strain, a headache, blur or dizziness. Slow and gentle — this is activation, not effort.';
