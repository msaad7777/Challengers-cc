import { describe, it, expect } from 'vitest';
import { WARMUP_STEPS, WARMUP_SAFETY, NEUROVISION_WEEKS } from '@/app/c3h/lib/warmup';

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

describe('NEUROVISION_WEEKS', () => {
  it('covers weeks 3, 4 and 5, each with a theme, drills and a note', () => {
    expect(NEUROVISION_WEEKS.map((w) => w.week)).toEqual([3, 4, 5]);
    for (const w of NEUROVISION_WEEKS) {
      expect(w.theme.length).toBeGreaterThan(10);
      expect(w.note.length).toBeGreaterThan(10);
      expect(w.drills.length).toBeGreaterThanOrEqual(3);
      for (const d of w.drills) {
        expect(d.what.length).toBeGreaterThan(10);
        expect(d.protocol.length).toBeGreaterThan(10);
        expect(d.cricket.length).toBeGreaterThan(10);
      }
    }
  });

  it('captures the Week 5 pencil-in-straw accuracy-then-speed protocol', () => {
    const wk5 = NEUROVISION_WEEKS.find((w) => w.week === 5)!;
    const straw = wk5.drills.find((d) => d.name.toLowerCase().includes('straw'))!;
    expect(straw.protocol.toLowerCase()).toContain('accuracy');
    expect(straw.protocol.toLowerCase()).toContain('fast');
    expect(straw.protocol.toLowerCase()).toContain('switch');
  });

  it('has Week 4 emphasise speed and multi-gaze', () => {
    const wk4 = NEUROVISION_WEEKS.find((w) => w.week === 4)!;
    const joined = wk4.drills.map((d) => `${d.name} ${d.protocol}`).join(' ').toLowerCase();
    expect(joined).toContain('speed');
    expect(joined).toContain('multi-gaze');
  });
});
