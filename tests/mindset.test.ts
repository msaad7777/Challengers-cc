import { describe, it, expect } from 'vitest';
import {
  PRINCIPLES,
  BREATH_PATTERNS,
  buildCenteringRoutine,
  RESET_ROUTINE,
  regulateFor,
} from '@/app/c3h/lib/mindset';

describe('PRINCIPLES', () => {
  it('has several principles, each with a title, body and cue', () => {
    expect(PRINCIPLES.length).toBeGreaterThanOrEqual(6);
    for (const p of PRINCIPLES) {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.body.length).toBeGreaterThan(20);
      expect(p.cue.length).toBeGreaterThan(0);
    }
  });
});

describe('buildCenteringRoutine', () => {
  it('personalises with the cue word and includes a breathing step', () => {
    const steps = buildCenteringRoutine('still head', 'calm');
    expect(steps).toHaveLength(4);
    expect(steps.some((s) => s.breathe)).toBe(true);
    expect(steps.some((s) => s.text.includes('still head'))).toBe(true);
  });

  it('falls back to a default cue when none is given', () => {
    const steps = buildCenteringRoutine('   ', 'calm');
    expect(steps.some((s) => s.text.toLowerCase().includes('watch the ball'))).toBe(true);
  });

  it('uses the chosen breath pattern text', () => {
    const box = BREATH_PATTERNS.find((p) => p.id === 'box')!;
    const steps = buildCenteringRoutine('go', 'box');
    expect(steps.some((s) => s.text === box.text)).toBe(true);
  });

  it('falls back to the first pattern for an unknown id', () => {
    const steps = buildCenteringRoutine('go', 'nope');
    expect(steps.some((s) => s.text === BREATH_PATTERNS[0].text)).toBe(true);
  });
});

describe('RESET_ROUTINE', () => {
  it('is a short fixed flush with a breathing beat', () => {
    expect(RESET_ROUTINE.length).toBeGreaterThanOrEqual(3);
    expect(RESET_ROUTINE.some((s) => s.breathe)).toBe(true);
  });
});

describe('regulateFor', () => {
  it('gives distinct tools for flat / dialled / amped', () => {
    const flat = regulateFor('flat');
    const dialled = regulateFor('dialled');
    const amped = regulateFor('amped');
    expect(flat.title).not.toBe(amped.title);
    expect(dialled.title.toLowerCase()).toContain('zone');
    expect(flat.body.length).toBeGreaterThan(20);
    expect(amped.body.toLowerCase()).toContain('exhale');
  });
});
