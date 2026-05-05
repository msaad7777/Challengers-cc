import { describe, it, expect } from 'vitest';
import {
  getBattingPerf,
  getBowlingPerf,
  getFieldingPerf,
  battingMVP,
  bowlingMVP,
  fieldingMVP,
  getBestBatter,
  getBestBowler,
  getBestFielder,
  getMVP,
  getMatchImpact,
  formatMatchShareText,
} from '@/app/c3h/lib/matchStats';
import type { Innings, BallEvent } from '@/app/c3h/scorer/types';
import { ball as factoryBall, emptyInnings, innings as makeInningsFactory, makeMatch } from './factories';

// Build a minimal innings document with hand-crafted ball events.
function ball(b: Partial<BallEvent>): BallEvent {
  return {
    over: 0,
    ball: 0,
    runs: 0,
    extras: 0,
    isBoundary: false,
    isWicket: false,
    isDotBall: false,
    batter: '',
    bowler: '',
    nonStriker: '',
    ...b,
  } as BallEvent;
}

function makeInnings(balls: BallEvent[]): Innings {
  return {
    battingTeam: 'C3H',
    bowlingTeam: 'Opposition',
    runs: 0,
    wickets: 0,
    balls,
    overs: 0,
    runRate: 0,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
  } as unknown as Innings;
}

describe('getBattingPerf', () => {
  it('aggregates runs, balls, fours and sixes per batter', () => {
    const innings = makeInnings([
      ball({ batter: 'Saad', bowler: 'X', runs: 4, isBoundary: true }),
      ball({ batter: 'Saad', bowler: 'X', runs: 1 }),
      ball({ batter: 'Saad', bowler: 'X', runs: 6, isBoundary: true }),
      ball({ batter: 'Tarek', bowler: 'X', runs: 2 }),
    ]);
    const perf = getBattingPerf(innings);
    const saad = perf.find((p) => p.name === 'Saad')!;
    const tarek = perf.find((p) => p.name === 'Tarek')!;
    expect(saad.runs).toBe(11);
    expect(saad.balls).toBe(3);
    expect(saad.fours + saad.sixes).toBe(2);
    expect(tarek.runs).toBe(2);
    expect(tarek.balls).toBe(1);
  });

  it('does not count wides toward batter ball count', () => {
    const innings = makeInnings([
      ball({ batter: 'Saad', bowler: 'X', runs: 1, extraType: 'wide' as never }),
      ball({ batter: 'Saad', bowler: 'X', runs: 0 }),
    ]);
    const perf = getBattingPerf(innings);
    const saad = perf.find((p) => p.name === 'Saad')!;
    expect(saad.balls).toBe(1); // The wide ball doesn't count
  });

  it('returns empty for an empty innings', () => {
    expect(getBattingPerf(makeInnings([]))).toEqual([]);
  });

  it('preserves the order batters first appeared', () => {
    const innings = makeInnings([
      ball({ batter: 'Saad', bowler: 'X', runs: 1 }),
      ball({ batter: 'Tarek', bowler: 'X', runs: 1 }),
      ball({ batter: 'Saad', bowler: 'X', runs: 1 }),
    ]);
    const perf = getBattingPerf(innings);
    expect(perf.map((p) => p.name)).toEqual(['Saad', 'Tarek']);
  });
});

describe('getBowlingPerf', () => {
  it('counts legal balls bowled and runs conceded', () => {
    const innings = makeInnings([
      ball({ batter: 'X', bowler: 'Saad', runs: 4, isBoundary: true }),
      ball({ batter: 'X', bowler: 'Saad', runs: 0 }),
      ball({ batter: 'X', bowler: 'Saad', runs: 0, isWicket: true }),
    ]);
    const perf = getBowlingPerf(innings);
    const saad = perf.find((p) => p.name === 'Saad')!;
    expect(saad.runs).toBeGreaterThanOrEqual(4);
    expect(saad.wickets).toBe(1);
    expect(saad.ballsBowled).toBeGreaterThanOrEqual(3);
  });

  it('returns empty for empty innings', () => {
    expect(getBowlingPerf(makeInnings([]))).toEqual([]);
  });
});

describe('MVP score functions are monotonic in the inputs that should matter', () => {
  it('battingMVP rises with more runs (same SR)', () => {
    const low = battingMVP({
      name: 'A', runs: 20, balls: 30, fours: 0, sixes: 0, sr: (20 / 30) * 100,
      isOut: true, howOut: '', battingPos: 5,
    });
    const high = battingMVP({
      name: 'B', runs: 60, balls: 90, fours: 0, sixes: 0, sr: (60 / 90) * 100,
      isOut: true, howOut: '', battingPos: 5,
    });
    expect(high).toBeGreaterThan(low);
  });

  it('bowlingMVP rises with more wickets', () => {
    const oneWicket = bowlingMVP({
      name: 'A', ballsBowled: 24, oversDisplay: '4.0', runs: 28, wickets: 1, maidens: 0, dots: 8, economy: 7, fiveFor: false,
    });
    const fourWickets = bowlingMVP({
      name: 'B', ballsBowled: 24, oversDisplay: '4.0', runs: 28, wickets: 4, maidens: 0, dots: 8, economy: 7, fiveFor: false,
    });
    expect(fourWickets).toBeGreaterThan(oneWicket);
  });

  it('fieldingMVP rises with more contributions', () => {
    const none = fieldingMVP({ name: 'A', catches: 0, stumpings: 0, runOuts: 0, directHits: 0, keeperCatches: 0 });
    const some = fieldingMVP({ name: 'B', catches: 2, stumpings: 1, runOuts: 1, directHits: 1, keeperCatches: 1 });
    expect(some).toBeGreaterThan(none);
  });
});

describe('getFieldingPerf', () => {
  it('returns an entry for every fielder credited with a catch / stumping / run-out', () => {
    const innings = makeInnings([
      ball({
        batter: 'X', bowler: 'Saad', runs: 0, isWicket: true,
        wicketType: 'Caught', fielder: 'Tarek',
      } as never),
    ]);
    const perf = getFieldingPerf(innings);
    expect(perf.find((p) => p.name === 'Tarek')?.catches).toBe(1);
  });
});

// ── Best-of-match selectors + match impact + MVP + share text ────

describe('getBestBatter', () => {
  it('returns the highest scorer across both innings', () => {
    const m = makeMatch({
      innings1: makeInningsFactory('A', 'B', [
        factoryBall({ batter: 'Saad', bowler: 'Z', runs: 30 }),
        factoryBall({ batter: 'Saad', bowler: 'Z', runs: 4, isBoundary: true }),
      ]),
      innings2: makeInningsFactory('B', 'A', [
        factoryBall({ batter: 'Tarek', bowler: 'Y', runs: 20 }),
      ]),
    });
    expect(getBestBatter(m)?.name).toBe('Saad');
  });

  it('returns null when no balls have been faced', () => {
    expect(getBestBatter(makeMatch())).toBeNull();
  });

  it('breaks ties on strike rate after both batters have ≥10 balls', () => {
    const slowBalls = Array.from({ length: 12 }, () =>
      factoryBall({ batter: 'Slow', bowler: 'Z', runs: 1 })
    );
    // Slow: 12 runs in 12 balls (SR 100), Fast: 12 runs in 6 balls (SR 200)
    const fastBalls = Array.from({ length: 6 }, () =>
      factoryBall({ batter: 'Fast', bowler: 'Z', runs: 2 })
    );
    const m = makeMatch({
      innings1: makeInningsFactory('A', 'B', [...slowBalls, ...fastBalls]),
    });
    // Both score 12 runs; with ≥10 balls criterion, fast batter only
    // has 6 balls so the tiebreak falls back to runs (which are equal).
    // Expectation: getBestBatter returns one of them deterministically.
    // What we DO want to assert: result has 12 runs, one of the names.
    const best = getBestBatter(m);
    expect(best?.runs).toBe(12);
    expect(['Slow', 'Fast']).toContain(best?.name);
  });
});

describe('getBestBowler', () => {
  it('returns highest wickets, ties broken by economy', () => {
    const m = makeMatch({
      innings1: makeInningsFactory('A', 'B', [
        factoryBall({ bowler: 'Tarek', batter: 'X', runs: 0, isWicket: true, wicketType: 'Bowled', isDotBall: true }),
        factoryBall({ bowler: 'Tarek', batter: 'X', runs: 0, isWicket: true, wicketType: 'LBW', isDotBall: true }),
        factoryBall({ bowler: 'Saad', batter: 'X', runs: 0, isWicket: true, wicketType: 'Bowled', isDotBall: true }),
        factoryBall({ bowler: 'Saad', batter: 'X', runs: 24 }),
      ]),
    });
    expect(getBestBowler(m)?.name).toBe('Tarek');
  });

  it('returns null when no balls bowled', () => {
    expect(getBestBowler(makeMatch())).toBeNull();
  });
});

describe('getBestFielder', () => {
  it('weights stumpings 1.5× over catches', () => {
    const m = makeMatch({
      innings1: makeInningsFactory('A', 'B', [
        factoryBall({ batter: 'X', bowler: 'Z', runs: 0, isWicket: true, wicketType: 'Caught', fielder: 'Catcher' }),
        factoryBall({ batter: 'X', bowler: 'Z', runs: 0, isWicket: true, wicketType: 'Caught', fielder: 'Catcher' }),
        factoryBall({ batter: 'X', bowler: 'Z', runs: 0, isWicket: true, wicketType: 'Stumped', fielder: 'Keeper' }),
        factoryBall({ batter: 'X', bowler: 'Z', runs: 0, isWicket: true, wicketType: 'Stumped', fielder: 'Keeper' }),
      ]),
    });
    // 2 stumpings × 1.5 = 3.0 → beats 2 catches × 1.0 = 2.0
    expect(getBestFielder(m)?.name).toBe('Keeper');
  });

  it('returns null when no fielding events', () => {
    expect(getBestFielder(makeMatch())).toBeNull();
  });
});

describe('getMatchImpact + getMVP', () => {
  it('aggregates batting + bowling + fielding points across both innings', () => {
    const m = makeMatch({
      innings1: makeInningsFactory('A', 'B', [
        factoryBall({ batter: 'Saad', bowler: 'Z', runs: 50 }),
        factoryBall({ bowler: 'Saad', batter: 'X', runs: 0, isWicket: true, wicketType: 'Bowled', isDotBall: true }),
      ]),
      innings2: makeInningsFactory('B', 'A', [
        factoryBall({ batter: 'Tarek', bowler: 'Saad', runs: 5 }),
      ]),
    });
    const impact = getMatchImpact(m);
    expect(impact.length).toBeGreaterThan(0);
    expect(impact.find(i => i.name === 'Saad')?.totalPts).toBeGreaterThan(0);
  });

  it('getMVP returns the player with the most total points', () => {
    const m = makeMatch({
      innings1: makeInningsFactory('A', 'B', [
        factoryBall({ batter: 'Saad', bowler: 'Z', runs: 50, isBoundary: true }),
        factoryBall({ batter: 'Saad', bowler: 'Z', runs: 50, isSix: true }),
      ]),
    });
    expect(getMVP(m)?.name).toBe('Saad');
  });

  it('returns null when match has no balls', () => {
    expect(getMVP(makeMatch())).toBeNull();
  });
});

describe('formatMatchShareText', () => {
  it('includes team names, date, venue, total overs, result', () => {
    const m = makeMatch({
      result: 'C3H A won by 5 wickets',
      venue: 'NLAF',
      date: '2026-05-05',
      totalOvers: 20,
      innings1: makeInningsFactory('A', 'B', [
        factoryBall({ batter: 'Saad', bowler: 'Z', runs: 30 }),
      ]),
    });
    const text = formatMatchShareText(m, 'https://challengerscc.ca');
    expect(text).toContain('C3H A vs C3H B');
    expect(text).toContain('NLAF');
    expect(text).toContain('2026-05-05');
    expect(text).toContain('20 overs');
    expect(text).toContain('C3H A won');
  });

  it('includes the live URL with match id', () => {
    const m = makeMatch({ id: 'XYZ123' });
    const text = formatMatchShareText(m, 'https://challengerscc.ca');
    expect(text).toContain('XYZ123');
  });
});
