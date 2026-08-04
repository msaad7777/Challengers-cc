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

// ── Foundational Visual Control (Neurovision Edge "Week 5") ───────────────
// The week's off-screen drill set — binocular vision, depth perception,
// hand-eye and dual-task processing. Drill 1 is the daily warm-up above.
// Reference only (equipment drills); the exact method follows the course.

export interface FoundationDrill {
  n: number;
  name: string;
  what: string;
  protocol: string;
  cricket: string;
}

export const FOUNDATIONAL_DRILLS: FoundationDrill[] = [
  {
    n: 1, name: 'Monocular Eye Stretches',
    what: 'Patch one eye, move the open eye through its full range; switch eyes.',
    protocol: 'This is your daily warm-up above — do it first, every day, before the rest.',
    cricket: 'Eye mobility → better tracking of swing, seam and spin.',
  },
  {
    n: 2, name: 'Pencil in Straw (the hard one)',
    what: 'Patch one eye. Dominant hand holds the pencil, other hand holds a wide (boba) straw. Thread the pencil through, looking straight ahead — centre gaze only.',
    protocol: '3 slow accuracy reps, then 10 FAST reps — speed is the goal. Switch the patch to the other eye and repeat. Note which eye was harder (your weaker visual side).',
    cricket: 'One eye estimates distance, angle & trajectory — exactly picking length, catching, fielding, middling the ball.',
  },
  {
    n: 3, name: 'Brock String + Balance',
    what: 'In your batting stance, on your dominant leg (or a balance board), watch the bead — the string “X” must cross exactly at the bead every rep.',
    protocol: '25 quality cycles, then switch legs for 25. Push for quality, not speed.',
    cricket: 'Balance + convergence + head stability — very like batting against pace.',
  },
  {
    n: 4, name: 'Pencil Push-ups',
    what: 'No patch, both eyes. Start ~40 cm out and bring the pencil slowly toward your nose, keeping it clear and single; pause and refocus at any blur, then continue to almost-touching and back out.',
    protocol: '25 reps (in and out = 1 cycle).',
    cricket: 'Convergence & depth — holding focus as the ball closes from 22 yards to contact.',
  },
  {
    n: 5, name: 'Heart Chart + Jump Rope',
    what: 'Hart chart 6–8 ft away (6 easier, 8 harder). Skip rope continuously while reading the chart aloud — no stops, no missed letters, in sync.',
    protocol: 'Read the whole chart once in rhythm; if it was jerky, smooth it out and read it once more.',
    cricket: 'Multitasking under movement — watch the ball, move the feet, decide the shot and balance, all at once.',
  },
];

export const FOUNDATION_NOTE = 'Week numbers are just guidelines. If these still feel shaky after a week — losing the rope, losing your place on the chart — repeat the week until they’re smooth before moving on. You’re building a foundation.';
