import { describe, it, expect } from 'vitest';
import {
  STRIKING_DRILLS, byKind, drillById, pickFeed, scoreSet,
} from '@/app/c3h/lib/strikingDrills';

describe('strikingDrills', () => {
  it('gives every drill an id, a skill it trains, and rules', () => {
    for (const d of STRIKING_DRILLS) {
      expect(d.id).toBeTruthy();
      expect(d.trains.length).toBeGreaterThan(20);
      expect(d.rules.length).toBeGreaterThan(1);
    }
    expect(new Set(STRIKING_DRILLS.map((d) => d.id)).size).toBe(STRIKING_DRILLS.length);
  });

  it('filters by kind and looks up by id', () => {
    expect(byKind('decision').length).toBeGreaterThan(0);
    expect(drillById('colour-ball-leave-or-hit').kind).toBe('decision');
    expect(() => drillById('nope')).toThrow(/nope/);
  });

  describe('pickFeed', () => {
    it('is deterministic for a given rng', () => {
      expect(pickFeed(() => 0.1)).toBe('hit');
      expect(pickFeed(() => 0.9)).toBe('leave');
    });

    it('honours hitShare', () => {
      expect(pickFeed(() => 0.7, 0.9)).toBe('hit');
      expect(pickFeed(() => 0.7, 0.5)).toBe('leave');
    });

    it('rejects an out-of-range hitShare rather than silently clamping', () => {
      expect(() => pickFeed(Math.random, 1.5)).toThrow(/between 0 and 1/);
      expect(() => pickFeed(Math.random, -1)).toThrow(/between 0 and 1/);
    });

    it('splits roughly evenly over a seeded sequence', () => {
      let i = 0;
      const seq = [0.1, 0.6, 0.2, 0.8, 0.3, 0.7, 0.4, 0.9];
      const rng = () => seq[i++ % seq.length];
      const out = Array.from({ length: 8 }, () => pickFeed(rng));
      expect(out.filter((x) => x === 'hit')).toHaveLength(4);
    });
  });

  describe('scoreSet', () => {
    // The whole point of the drill: leaving correctly scores as highly as
    // hitting correctly. A batter who hits everything has not passed.
    it('scores a correct leave as highly as a correct hit', () => {
      const r = scoreSet([
        { fed: 'hit', played: true },
        { fed: 'leave', played: false },
      ]);
      expect(r.correct).toBe(2);
      expect(r.total).toBe(2);
    });

    it('separates missed hits from played leaves', () => {
      const r = scoreSet([
        { fed: 'hit', played: false },
        { fed: 'leave', played: true },
        { fed: 'leave', played: true },
      ]);
      expect(r.correct).toBe(0);
      expect(r.missedHits).toBe(1);
      expect(r.playedLeaves).toBe(2);
    });

    it('gives a batter who swings at everything no credit for the leaves', () => {
      const r = scoreSet([
        { fed: 'hit', played: true },
        { fed: 'leave', played: true },
        { fed: 'hit', played: true },
        { fed: 'leave', played: true },
      ]);
      expect(r.correct).toBe(2);
      expect(r.playedLeaves).toBe(2);
    });

    it('handles an empty set', () => {
      expect(scoreSet([])).toEqual({ correct: 0, total: 0, missedHits: 0, playedLeaves: 0 });
    });
  });

  it('republishes no exit-velocity or percentage figures', () => {
    const text = JSON.stringify(STRIKING_DRILLS).toLowerCase();
    expect(text).not.toMatch(/\d+\s?%/);
    expect(text).not.toMatch(/\d+\s?mph/);
  });
});
