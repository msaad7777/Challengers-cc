import { describe, it, expect } from 'vitest';
import {
  POWER_PRINCIPLES,
  POWER_PROTOCOLS,
  POWER_DRILLS,
  totalReps,
} from '@/app/c3h/lib/powerHitting';

describe('POWER_PRINCIPLES', () => {
  it('leads with the quality-over-grind principle and warns on injury', () => {
    expect(POWER_PRINCIPLES.length).toBeGreaterThanOrEqual(4);
    const joined = POWER_PRINCIPLES.map((p) => `${p.title} ${p.body}`).join(' ').toLowerCase();
    expect(joined).toContain('quality');
    expect(joined).toMatch(/overuse|elbow|wrist|shoulder/);
    expect(joined).toContain('taper');
  });
});

describe('POWER_PROTOCOLS', () => {
  it('offers distinct protocols including a light taper option', () => {
    const ids = POWER_PROTOCOLS.map((p) => p.id);
    expect(ids).toContain('taper');
    expect(new Set(ids).size).toBe(POWER_PROTOCOLS.length);
    for (const p of POWER_PROTOCOLS) {
      expect(p.sets).toBeGreaterThan(0);
      expect(p.reps).toBeGreaterThan(0);
      expect(p.restSec).toBeGreaterThan(0);
      expect(p.cue.length).toBeGreaterThan(10);
    }
  });

  it('keeps the taper protocol low-volume vs the peak', () => {
    const taper = POWER_PROTOCOLS.find((p) => p.id === 'taper')!;
    const volume = POWER_PROTOCOLS.find((p) => p.id === 'volume')!;
    expect(totalReps(taper)).toBeLessThan(totalReps(volume));
  });
});

describe('totalReps', () => {
  it('multiplies sets by reps', () => {
    expect(totalReps({ id: 'x', name: 'x', sets: 8, reps: 15, restSec: 60, contact: '', cue: 'xxxxxxxxxxx' })).toBe(120);
  });
});

describe('POWER_DRILLS', () => {
  it('has the 14 ProVelocity drills in order plus the added connection drill', () => {
    const pv = POWER_DRILLS.filter((d) => d.source === 'ProVelocity');
    expect(pv).toHaveLength(14);
    POWER_DRILLS.forEach((d, i) => expect(d.n).toBe(i + 1));
    const added = POWER_DRILLS.filter((d) => d.source === 'Added');
    expect(added).toHaveLength(1);
    expect(added[0].note.toLowerCase()).toContain('towel');
    expect(added[0].note.toLowerCase()).toContain('connect');
  });

  it('gives every drill a name and a coaching note', () => {
    for (const d of POWER_DRILLS) {
      expect(d.name.length).toBeGreaterThan(0);
      expect(d.note.length).toBeGreaterThan(10);
    }
  });
});
