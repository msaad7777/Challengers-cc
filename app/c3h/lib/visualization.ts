// visualization.ts — pure logic for the NeuroVision "Visualization & Bowler
// Read" module. Two concerns, both LLM-free and deterministic so they stay
// unit-testable (tests/visualization.test.ts):
//   1. buildRehearsalScript() — a guided mental-rehearsal script, personalized
//      to the ground / situation / bowler the player is about to face.
//   2. scoreRead() — scores a "read the delivery" rep on accuracy (line +
//      length) AND anticipation (how early the player committed).
//
// Grounded in the Dr. Shah "See → Process → Act" visualization approach — the
// wording here is original, not his audio, so nothing licensed ships.

import type { BowlerType } from './fieldScanner';

export interface Ground {
  id: string;
  name: string;
  /** A short evocative phrase used inside the rehearsal script. */
  scene: string;
}

// The club's real 2026 venues (kept in sync with VENUE_FULL_NAME in the
// availability page, but only the names the player would recognise).
export const GROUNDS: Ground[] = [
  { id: 'Northridge', name: 'Northridge', scene: 'the Northridge square, boundaries close on the straight' },
  { id: 'Silverwoods', name: 'Silverwoods', scene: 'the wide-open Silverwoods outfield' },
  { id: 'NLAF', name: 'North London Athletic Fields', scene: 'the NLAF strip with the fields stretching out behind the bowler' },
  { id: 'Thamesville', name: 'Thamesville', scene: 'the quiet Thamesville ground' },
  { id: 'Sarnia', name: 'Mike Vier Park, Sarnia', scene: 'the Sarnia ground by the water' },
];

export interface Situation {
  id: string;
  label: string;
  /** The one thing to focus on in this situation — woven into the script. */
  focus: string;
}

export const SITUATIONS: Situation[] = [
  { id: 'new-ball', label: 'Facing the new ball', focus: 'watch for the swing and the fuller length early — get forward' },
  { id: 'spinners', label: 'Spinners on', focus: 'read it out of the hand, judge the length, use your feet or your depth' },
  { id: 'chasing', label: 'Chasing under pressure', focus: 'stay calm, rotate the strike, and wait for your boundary ball' },
  { id: 'set', label: 'Set and going big', focus: 'trust your eyes and back your range — you are in' },
];

const bowlerPhrase = (b: BowlerType): string =>
  b === 'pace' ? 'quick bowler' : b === 'off-spin' ? 'off-spinner' : 'leg-spinner';

export interface RehearsalStep {
  text: string;
  seconds: number;
  /** breathe steps drive the pacer circle in the UI. */
  breathe: boolean;
}

/**
 * Build the guided rehearsal — a fixed 7-beat arc (arrive → guard → settle →
 * watch run-up → release → track → reset), personalised by ground/situation/
 * bowler. Deterministic: same inputs → same script.
 */
export function buildRehearsalScript(
  ground: Ground,
  situation: Situation,
  bowler: BowlerType,
): RehearsalStep[] {
  const b = bowlerPhrase(bowler);
  return [
    { seconds: 16, breathe: true, text: `Close your eyes. You are walking out to bat at ${ground.name} — ${ground.scene}. Feel the grass under your spikes and the bat in your hands. Breathe in for 4… out for 6.` },
    { seconds: 12, breathe: false, text: `Take your guard. Look around the field and picture the gaps. Today you are ${situation.label.toLowerCase()} — ${situation.focus}.` },
    { seconds: 9, breathe: true, text: `One more slow breath. Quiet eyes. Let your focus rest softly on the ${b} at the top of his mark.` },
    { seconds: 10, breathe: false, text: `The ${b} is running in. Watch his rhythm, his arm, the seam sitting in his hand. Stay still, stay balanced.` },
    { seconds: 9, breathe: false, text: `See the ball leave the hand. Pick it up early — line and length in that very first instant, before it has travelled a foot.` },
    { seconds: 9, breathe: false, text: `Track it all the way down… onto the middle of the bat, right under your head. Feel the clean contact and the ball racing away.` },
    { seconds: 7, breathe: true, text: `Ball done. Breathe out and reset for the next one. You have done this a hundred times. You belong here.` },
  ];
}

// ── Bowler-read scoring ──────────────────────────────────────────────────

export type Line = 'off' | 'straight' | 'leg';
export type Length = 'full' | 'good' | 'short';

export interface Delivery { line: Line; length: Length; }
export interface ReadGuess { line: Line; length: Length; }

export interface ReadScore {
  lineCorrect: boolean;
  lengthCorrect: boolean;
  /** 0-100: how early the read was committed (higher = earlier). */
  earliness: number;
  /** 0-100 overall. */
  total: number;
  label: string;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Score a delivery read.
 * @param commitFraction where in the ball's flight the player locked their
 *   call, 0 = at release (earliest/best), 1 = at the bat (latest). Values < 0
 *   (committed during the run-up) clamp to earliest.
 *
 * Accuracy is worth up to 60 (30 for line, 30 for length). Anticipation adds
 * up to 40 — but ONLY when the read is correct, so guessing early-but-wrong is
 * never rewarded. A perfect, off-the-hand read approaches 100.
 */
export function scoreRead(actual: Delivery, guess: ReadGuess, commitFraction: number): ReadScore {
  const lineCorrect = guess.line === actual.line;
  const lengthCorrect = guess.length === actual.length;
  const correct = (lineCorrect ? 1 : 0) + (lengthCorrect ? 1 : 0);

  const accuracy = correct * 30; // 0, 30, or 60
  const early = clamp01(1 - commitFraction);
  const earlinessScore = correct > 0 ? Math.round(early * 40 * (correct / 2)) : 0;
  const total = Math.min(100, accuracy + earlinessScore);

  const label =
    correct === 2 ? (early > 0.6 ? 'Read it off the hand!' : 'Good read') :
    correct === 1 ? 'Half read — one right' :
    'Missed it';

  return { lineCorrect, lengthCorrect, earliness: Math.round(early * 100), total, label };
}

export const LINES: Line[] = ['off', 'straight', 'leg'];
export const LENGTHS: Length[] = ['full', 'good', 'short'];

// ── Guided imagery (Neurovision Edge "Daily Practice") ───────────────────
// Foundational mental-representation drills: build a vivid, controllable image
// of the equipment you use every innings (bat, ball). Prepare → visualize →
// feel → combine, then self-rate Vividness + Control (1-5) to track progress.
// Same structure as the course's Week 1 daily practice; original wording.

export interface ImageryStep { text: string; seconds: number; breathe: boolean; }
export interface ImagerySession { id: string; name: string; steps: ImageryStep[]; }

const PREPARE_STEP: ImageryStep = {
  seconds: 20, breathe: true,
  text: 'Find a quiet spot. Close your eyes or soften your gaze. Take three slow breaths — each exhale longer than the inhale. Settle into a calm but alert state.',
};

export const IMAGERY_SESSIONS: ImagerySession[] = [
  {
    id: 'bat',
    name: 'The Bat',
    steps: [
      PREPARE_STEP,
      { seconds: 16, breathe: false, text: 'Picture your own bat resting in front of you. See its full length, the shape of the blade and the shoulders, the swell on the back, the handle.' },
      { seconds: 14, breathe: false, text: 'Notice the detail — the willow grain, the ball marks in the middle, the colour and condition of the grip, the worn areas where your hands normally hold it.' },
      { seconds: 16, breathe: false, text: 'Now imagine picking it up. Feel its weight, its balance and pickup, the texture of the grip. Let your hands settle into your normal batting grip.' },
      { seconds: 14, breathe: false, text: 'Combine what you see and what you feel into one complete, realistic image. If it fades, calmly bring it back.' },
    ],
  },
  {
    id: 'ball',
    name: 'The Ball',
    steps: [
      PREPARE_STEP,
      { seconds: 16, breathe: false, text: 'Picture a cricket ball in front of you — the deep red leather, the raised seam circling it, the stitching, the maker’s stamp, the shine on one side and the rough on the other.' },
      { seconds: 14, breathe: false, text: 'Notice the detail — the scuffs and grass stains, the lacquer catching the light, the exact size sitting in your palm.' },
      { seconds: 16, breathe: false, text: 'Now imagine holding it. Feel the weight, the hardness, the seam under your fingers, and your grip as you would hold it to bowl or throw.' },
      { seconds: 14, breathe: false, text: 'Combine what you see and what you feel into one complete, realistic image. If it fades, calmly bring it back.' },
    ],
  },
];
