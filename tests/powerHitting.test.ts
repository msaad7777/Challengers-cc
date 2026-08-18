import { describe, it, expect } from 'vitest';
import {
  POWER_PRINCIPLES,
  POWER_PROTOCOLS,
  POWER_DRILLS,
  totalReps,
  matchWeekDrills,
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

  it('gives every drill a name, a coaching note and a phase', () => {
    for (const d of POWER_DRILLS) {
      expect(d.name.length).toBeGreaterThan(0);
      expect(d.note.length).toBeGreaterThan(10);
      expect(['any', 'off-season']).toContain(d.phase);
    }
  });

  it('flags the towel connection drill as off-season, not match week', () => {
    const towel = POWER_DRILLS.find((d) => d.source === 'Added')!;
    expect(towel.phase).toBe('off-season');
    const note = towel.note.toLowerCase();
    // It must not be sold as a bat-speed drill, and must steer the player to
    // cross-bat hitting rather than the vertical-bat drive it used to name.
    expect(note).toContain('not a bat-speed drill');
    expect(note).toMatch(/pull|hook|slog-sweep|cross-bat/);
    expect(note).toMatch(/do not use it for the vertical-bat drive/);
    expect(note).toMatch(/half or three-quarter/);
  });

  it('keeps every ProVelocity drill runnable in any phase', () => {
    for (const d of POWER_DRILLS.filter((x) => x.source === 'ProVelocity')) {
      expect(d.phase).toBe('any');
    }
  });
});

describe('matchWeekDrills', () => {
  it('drops off-season drills and keeps the rest in order', () => {
    const safe = matchWeekDrills();
    expect(safe).toHaveLength(POWER_DRILLS.length - 1);
    expect(safe.every((d) => d.phase !== 'off-season')).toBe(true);
    expect(safe.map((d) => d.n)).toEqual([...safe.map((d) => d.n)].sort((a, b) => a - b));
  });

  it('accepts an explicit list', () => {
    const drills: typeof POWER_DRILLS = [
      { n: 1, name: 'a', note: 'a note long enough', source: 'ProVelocity', phase: 'any' },
      { n: 2, name: 'b', note: 'b note long enough', source: 'Added', phase: 'off-season' },
    ];
    expect(matchWeekDrills(drills).map((d) => d.n)).toEqual([1]);
  });
});
