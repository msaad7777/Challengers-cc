import { describe, it, expect } from 'vitest';
import {
  computePlayerTracker,
  gamesPlayed,
  availableCount,
  requiredForLeague,
  matchesInLeague,
  type TrackerMatch,
  type SquadsMap,
  type AvailabilityMap,
} from '@/app/c3h/lib/playerTracker';

const MATCHES: TrackerMatch[] = [
  { id: 'lcl-1', league: 'LCL T30', fullDate: '2026-05-10' },
  { id: 'lcl-2', league: 'LCL T30', fullDate: '2026-05-18' },
  { id: 'lcl-3', league: 'LCL T30', fullDate: '2026-06-14' },
  { id: 'lpl-1', league: 'LPL T30', fullDate: '2026-05-10' },
  { id: 'lpl-2', league: 'LPL T30', fullDate: '2026-05-24' },
];

const SQUADS: SquadsMap = {
  'lcl-1': ['Saad', 'Tarek'],
  'lcl-2': ['Saad'],
  'lpl-1': ['Saad', 'Tarek'],
  // lcl-3 and lpl-2 squads not recorded yet
};

const AVAILABILITY: AvailabilityMap = {
  Saad: { 'lcl-1': 'available', 'lcl-2': 'available', 'lcl-3': 'maybe', 'lpl-1': 'available' },
  Tarek: { 'lcl-1': 'available', 'lpl-1': 'unavailable' },
};

describe('matchesInLeague', () => {
  it('splits fixtures by league', () => {
    expect(matchesInLeague(MATCHES, 'LCL T30')).toHaveLength(3);
    expect(matchesInLeague(MATCHES, 'LPL T30')).toHaveLength(2);
  });
});

describe('gamesPlayed', () => {
  it('counts playing-12 membership within a league only', () => {
    expect(gamesPlayed('Saad', 'LCL T30', MATCHES, SQUADS)).toBe(2);
    expect(gamesPlayed('Saad', 'LPL T30', MATCHES, SQUADS)).toBe(1);
    expect(gamesPlayed('Tarek', 'LCL T30', MATCHES, SQUADS)).toBe(1);
    expect(gamesPlayed('Tarek', 'LPL T30', MATCHES, SQUADS)).toBe(1);
  });

  it('ignores matches with no recorded squad', () => {
    // lcl-3 has no squad — nobody gets a game for it
    expect(gamesPlayed('Nobody', 'LCL T30', MATCHES, SQUADS)).toBe(0);
  });

  it('does not count matches in the future (squad is just a plan)', () => {
    // As of 2026-05-15, only lcl-1 (May 10) has been played; lcl-2 (May 18) is
    // still upcoming, so Saad's pre-picked squad for it must not count yet.
    expect(gamesPlayed('Saad', 'LCL T30', MATCHES, SQUADS, '2026-05-15')).toBe(1);
    // Once both have passed, both count.
    expect(gamesPlayed('Saad', 'LCL T30', MATCHES, SQUADS, '2026-05-20')).toBe(2);
    // A match on exactly today counts (match day).
    expect(gamesPlayed('Saad', 'LCL T30', MATCHES, SQUADS, '2026-05-18')).toBe(2);
  });
});

describe('availableCount', () => {
  it('counts only available marks, per league', () => {
    expect(availableCount('Saad', 'LCL T30', MATCHES, AVAILABILITY)).toBe(2); // maybe on lcl-3 excluded
    expect(availableCount('Saad', 'LPL T30', MATCHES, AVAILABILITY)).toBe(1);
    expect(availableCount('Tarek', 'LPL T30', MATCHES, AVAILABILITY)).toBe(0); // unavailable
  });
});

describe('requiredForLeague', () => {
  it('returns the configured LPL Division-2 threshold (Rule 23)', () => {
    expect(requiredForLeague('LPL T30')).toBe(5);
  });
  it('returns 0 for an unconfigured league', () => {
    expect(requiredForLeague('T20 Cup')).toBe(0);
  });
});

describe('computePlayerTracker', () => {
  const rows = computePlayerTracker(['Saad', 'Tarek', 'Bench'], MATCHES, SQUADS, AVAILABILITY);
  const bySaad = rows.find((r) => r.player === 'Saad')!;
  const byBench = rows.find((r) => r.player === 'Bench')!;

  it('produces one row per requested player, including the uninvolved', () => {
    expect(rows).toHaveLength(3);
    expect(byBench.totalPlayed).toBe(0);
    expect(byBench.lcl.available).toBe(0);
  });

  it('aggregates per-league played + available and combined total', () => {
    expect(bySaad.lcl.played).toBe(2);
    expect(bySaad.lpl.played).toBe(1);
    expect(bySaad.totalPlayed).toBe(3);
    expect(bySaad.lcl.available).toBe(2);
  });

  it('computes remaining-needed toward the playoff threshold', () => {
    // LPL threshold 5, Saad has 1 → needs 4 more, not yet eligible
    expect(bySaad.lpl.requiredForPlayoff).toBe(5);
    expect(bySaad.lpl.remainingNeeded).toBe(4);
    expect(bySaad.lpl.eligible).toBe(false);
  });

  it('marks eligible once the threshold is met', () => {
    const bigSquads: SquadsMap = {};
    MATCHES.filter((m) => m.league === 'LPL T30').forEach((m) => (bigSquads[m.id] = ['Star']));
    // Only 2 LPL fixtures exist here, threshold 5 — still not eligible,
    // but remainingNeeded should reflect the gap correctly.
    const r = computePlayerTracker(['Star'], MATCHES, bigSquads, {})[0];
    expect(r.lpl.played).toBe(2);
    expect(r.lpl.remainingNeeded).toBe(3);
    expect(r.lpl.eligible).toBe(false);
  });
});
