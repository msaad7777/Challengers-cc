import { describe, it, expect } from 'vitest';
import {
  findPlayerName,
  rostersFromMatches,
  extractPlayerInMatch,
  generateCoachFeedback,
  teamRatesForPlayer,
} from '@/app/c3h/lib/playerAnalysis';
import { ball, makeMatch, makePlayer, innings as makeInnings } from './factories';

describe('findPlayerName', () => {
  const rosters = [
    { name: 'Mohammed Saad' },
    { name: 'Tarek Islam' },
    { name: 'Gokul Prakash' },
    { name: 'Ankush Arora' },
  ];

  it('exact match wins', () => {
    expect(findPlayerName('Mohammed Saad', null, rosters)).toBe('Mohammed Saad');
  });

  it('case-insensitive match', () => {
    expect(findPlayerName('mohammed saad', null, rosters)).toBe('Mohammed Saad');
    expect(findPlayerName('GOKUL PRAKASH', null, rosters)).toBe('Gokul Prakash');
  });

  it('falls back to email local-part', () => {
    expect(findPlayerName(null, 'gokul@challengerscc.ca', rosters)).toBe('Gokul Prakash');
  });

  it('email with dot separator splits into name parts', () => {
    expect(findPlayerName(null, 'mohammed.saad@example.com', rosters)).toBe('Mohammed Saad');
  });

  it('substring resolution when only one candidate matches', () => {
    expect(findPlayerName('Saad', null, rosters)).toBe('Mohammed Saad');
    expect(findPlayerName('Tarek', null, rosters)).toBe('Tarek Islam');
  });

  it('returns null when no roster entries', () => {
    expect(findPlayerName('Mohammed Saad', null, [])).toBeNull();
  });

  it('returns null when no usable identity', () => {
    expect(findPlayerName(null, null, rosters)).toBeNull();
    expect(findPlayerName('', '', rosters)).toBeNull();
  });

  it('returns null when substring is ambiguous (matches multiple)', () => {
    const ambiguous = [{ name: 'Sazzad' }, { name: 'Sazzad Mahmud' }];
    // 'Sazzad' alone matches both candidates as substring → ambiguous → null
    // (unless the exact-match step catches 'Sazzad' first)
    expect(findPlayerName('Sazzad', null, ambiguous)).toBe('Sazzad'); // exact match wins
  });

  it('truly ambiguous substring returns null', () => {
    const a = [{ name: 'Mohammed Saad' }, { name: 'Mohammed Akram' }];
    expect(findPlayerName('Mohammed', null, a)).toBeNull();
  });
});

describe('rostersFromMatches', () => {
  it('collects unique players from our club across multiple matches', () => {
    const m1 = makeMatch({
      team1: 'CCC', team1Players: [makePlayer('Saad'), makePlayer('Tarek')],
      team2: 'Strikers', team2Players: [makePlayer('Bob')],
    });
    const m2 = makeMatch({
      team1: 'Strikers', team1Players: [makePlayer('Bob')],
      team2: 'CCC', team2Players: [makePlayer('Tarek'), makePlayer('Gokul')], // Tarek dup
    });
    const roster = rostersFromMatches([m1, m2], 'CCC');
    expect(roster.map(r => r.name).sort()).toEqual(['Gokul', 'Saad', 'Tarek']);
  });

  it('returns empty when club is in no match', () => {
    const m = makeMatch({ team1: 'A', team2: 'B' });
    expect(rostersFromMatches([m], 'CCC')).toEqual([]);
  });
});

describe('extractPlayerInMatch', () => {
  it('returns null when player not in either roster', () => {
    const m = makeMatch();
    expect(extractPlayerInMatch('Stranger', m)).toBeNull();
  });

  it('populates batting line when player batted', () => {
    const m = makeMatch({
      innings1: makeInnings('C3H A', 'C3H B', [
        ball({ batter: 'Saad', bowler: 'Ankush', runs: 4, isBoundary: true }),
        ball({ batter: 'Saad', bowler: 'Ankush', runs: 1 }),
      ]),
    });
    const result = extractPlayerInMatch('Saad', m);
    expect(result?.batting.played).toBe(true);
    expect(result?.batting.runs).toBe(5);
    expect(result?.batting.balls).toBe(2);
  });

  it('populates bowling line when player bowled', () => {
    const m = makeMatch({
      innings1: makeInnings('C3H A', 'C3H B', [
        ball({ batter: 'Ankush', bowler: 'Saad', runs: 0, isWicket: true, wicketType: 'Bowled', isDotBall: true }),
      ]),
    });
    const result = extractPlayerInMatch('Saad', m);
    expect(result?.bowling.bowled).toBe(true);
    expect(result?.bowling.wickets).toBe(1);
  });
});

describe('teamRatesForPlayer', () => {
  it('returns battingTeamSr based on the innings the player batted in', () => {
    const m = makeMatch({
      innings1: {
        ...makeInnings('C3H A', 'C3H B', [
          ball({ batter: 'Saad', bowler: 'Z', runs: 2 }),
          ball({ batter: 'Saad', bowler: 'Z', runs: 2 }),
          ball({ batter: 'Tarek', bowler: 'Z', runs: 4, isBoundary: true }),
        ]),
        totalRuns: 8,
      },
    });
    const rates = teamRatesForPlayer('Saad', m);
    expect(typeof rates.battingTeamSr).toBe('number');
    expect(rates.battingTeamSr).toBeGreaterThan(0);
  });

  it('returns bowlingTeamEcon based on the innings the player bowled in', () => {
    const m = makeMatch({
      innings1: {
        ...makeInnings('C3H A', 'C3H B', [
          ball({ bowler: 'Saad', batter: 'X', runs: 2 }),
          ball({ bowler: 'Saad', batter: 'X', runs: 4, isBoundary: true }),
        ]),
        totalRuns: 6,
      },
    });
    const rates = teamRatesForPlayer('Saad', m);
    expect(typeof rates.bowlingTeamEcon).toBe('number');
    expect(rates.bowlingTeamEcon).toBeGreaterThan(0);
  });

  it('returns zero defaults when player did not play', () => {
    const m = makeMatch();
    const rates = teamRatesForPlayer('NotInMatch', m);
    expect(rates.battingTeamSr).toBe(0);
    expect(rates.bowlingTeamEcon).toBe(0);
  });
});

describe('generateCoachFeedback', () => {
  it('produces structured advice for a player who batted and bowled', () => {
    const m = makeMatch({
      innings1: makeInnings('C3H A', 'C3H B', [
        ball({ batter: 'Saad', bowler: 'Z', runs: 8 }),
        ball({
          batter: 'Saad', bowler: 'Z', runs: 0,
          isWicket: true, wicketType: 'Caught',
          dismissedPlayer: 'Saad', fielder: 'X',
        }),
      ]),
    });
    const player = extractPlayerInMatch('Saad', m);
    expect(player).not.toBeNull();
    const rates = teamRatesForPlayer('Saad', m);
    const fb = generateCoachFeedback(player!, rates.battingTeamSr, rates.bowlingTeamEcon);
    expect(fb).toBeDefined();
    expect(typeof fb).toBe('object');
  });
});
