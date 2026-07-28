import { describe, it, expect } from 'vitest';
import {
  buildRehearsalScript,
  scoreRead,
  GROUNDS,
  SITUATIONS,
  IMAGERY_SESSIONS,
  type Delivery,
} from '@/app/c3h/lib/visualization';

const ground = GROUNDS[0];
const situation = SITUATIONS[0];

describe('buildRehearsalScript', () => {
  it('produces the 7-beat arc and mentions the chosen ground', () => {
    const steps = buildRehearsalScript(ground, situation, 'pace');
    expect(steps).toHaveLength(7);
    expect(steps[0].text).toContain(ground.name);
    expect(steps[0].breathe).toBe(true);
    expect(steps.every((s) => s.seconds > 0)).toBe(true);
  });

  it('weaves in the situation focus and bowler type', () => {
    const steps = buildRehearsalScript(ground, situation, 'leg-spin');
    const joined = steps.map((s) => s.text).join(' ');
    expect(joined).toContain(situation.focus);
    expect(joined.toLowerCase()).toContain('leg-spinner');
  });

  it('is deterministic for the same inputs', () => {
    const a = buildRehearsalScript(ground, situation, 'off-spin');
    const b = buildRehearsalScript(ground, situation, 'off-spin');
    expect(a).toEqual(b);
  });
});

describe('scoreRead', () => {
  const actual: Delivery = { line: 'off', length: 'good' };

  it('rewards a correct, early read near the top', () => {
    const s = scoreRead(actual, { line: 'off', length: 'good' }, 0);
    expect(s.lineCorrect).toBe(true);
    expect(s.lengthCorrect).toBe(true);
    expect(s.total).toBe(100);
    expect(s.label).toBe('Read it off the hand!');
  });

  it('gives accuracy but little anticipation for a correct-but-late read', () => {
    const s = scoreRead(actual, { line: 'off', length: 'good' }, 1);
    expect(s.total).toBe(60); // full accuracy, zero earliness
    expect(s.earliness).toBe(0);
  });

  it('never rewards earliness when the read is wrong', () => {
    const s = scoreRead(actual, { line: 'leg', length: 'short' }, 0);
    expect(s.total).toBe(0);
    expect(s.label).toBe('Missed it');
  });

  it('scores a half read (one of two correct)', () => {
    const s = scoreRead(actual, { line: 'off', length: 'short' }, 1);
    expect(s.lineCorrect).toBe(true);
    expect(s.lengthCorrect).toBe(false);
    expect(s.total).toBe(30);
    expect(s.label).toBe('Half read — one right');
  });

  it('clamps a run-up (negative fraction) commit to earliest', () => {
    const s = scoreRead(actual, { line: 'off', length: 'good' }, -0.5);
    expect(s.earliness).toBe(100);
    expect(s.total).toBe(100);
  });
});

describe('IMAGERY_SESSIONS', () => {
  it('includes The Bat and The Ball, each opening with a breathing prepare step', () => {
    const ids = IMAGERY_SESSIONS.map((s) => s.id);
    expect(ids).toContain('bat');
    expect(ids).toContain('ball');
    for (const s of IMAGERY_SESSIONS) {
      expect(s.steps.length).toBeGreaterThanOrEqual(4);
      expect(s.steps[0].breathe).toBe(true);
      expect(s.steps.every((st) => st.seconds > 0)).toBe(true);
    }
  });
});
