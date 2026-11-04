import { describe, it, expect } from 'vitest';
import { ACTIVE_SEASON, SEASON_PLAYERS, isSeasonPlayer, isActiveSeasonPlayer } from '@/lib/c3h-seasons';

const seasons = { 2026: ['old@example.com', 'stays@example.com'], 2027: ['stays@example.com', 'new@example.com'] };

describe('isSeasonPlayer', () => {
  it('only allows players listed for that season', () => {
    expect(isSeasonPlayer('old@example.com', 2026, seasons)).toBe(true);
    expect(isSeasonPlayer('old@example.com', 2027, seasons)).toBe(false);
    expect(isSeasonPlayer('new@example.com', 2026, seasons)).toBe(false);
    expect(isSeasonPlayer('new@example.com', 2027, seasons)).toBe(true);
  });

  it('denies everyone for a season with no list', () => {
    expect(isSeasonPlayer('stays@example.com', 2030, seasons)).toBe(false);
  });

  it('ignores case and stray spaces in the address', () => {
    expect(isSeasonPlayer(' STAYS@example.com ', 2027, seasons)).toBe(true);
  });

  it('denies an empty address', () => {
    expect(isSeasonPlayer('', 2026, seasons)).toBe(false);
  });
});

describe('SEASON_PLAYERS', () => {
  it('has players for the active season, so a rollover cannot lock out everyone', () => {
    expect(SEASON_PLAYERS[ACTIVE_SEASON]?.length).toBeGreaterThan(0);
  });

  it('stores every address in lowercase without duplicates', () => {
    for (const list of Object.values(SEASON_PLAYERS)) {
      expect(list.every((e) => e === e.trim().toLowerCase() && e.includes('@'))).toBe(true);
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it('checks the active season', () => {
    const first = SEASON_PLAYERS[ACTIVE_SEASON][0];
    expect(isActiveSeasonPlayer(first)).toBe(true);
    expect(isActiveSeasonPlayer('not-on-the-list@example.com')).toBe(false);
  });
});
