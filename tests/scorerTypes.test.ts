import { describe, it, expect } from 'vitest';
import {
  createEmptyInnings,
  getBattingStats,
  getBowlingStats,
  getOversBalls,
  getRunRate,
  getRequiredRunRate,
} from '@/app/c3h/scorer/types';
import type { BallEvent, Innings } from '@/app/c3h/scorer/types';

function ball(b: Partial<BallEvent>): BallEvent {
  return {
    id: '',
    over: 0,
    ball: 0,
    runs: 0,
    extras: 0,
    extraType: '',
    isBoundary: false,
    isSix: false,
    isWicket: false,
    isDotBall: false,
    wicketType: '',
    dismissedPlayer: '',
    fielder: '',
    batter: '',
    bowler: '',
    timestamp: '',
    ...b,
  };
}

describe('getOversBalls', () => {
  it.each([
    [0, '0.0'],
    [1, '0.1'],
    [5, '0.5'],
    [6, '1.0'],
    [7, '1.1'],
    [36, '6.0'],
    [37, '6.1'],
  ])('totalLegalBalls=%i → "%s"', (input, expected) => {
    expect(getOversBalls(input)).toBe(expected);
  });
});

describe('getRunRate', () => {
  it('returns "0.00" when zero balls', () => {
    expect(getRunRate(0, 0)).toBe('0.00');
    expect(getRunRate(50, 0)).toBe('0.00');
  });
  it('60 runs in 60 balls = 6.00', () => {
    expect(getRunRate(60, 60)).toBe('6.00');
  });
  it('120 runs in 120 balls = 6.00', () => {
    expect(getRunRate(120, 120)).toBe('6.00');
  });
  it('30 runs in 6 balls = 30.00', () => {
    expect(getRunRate(30, 6)).toBe('30.00');
  });
});

describe('getRequiredRunRate', () => {
  it('50 runs needed in 5 overs = 10.00', () => {
    expect(getRequiredRunRate(100, 50, 30)).toBe('10.00');
  });
  it('returns "0.00" when target reached', () => {
    expect(getRequiredRunRate(100, 100, 30)).toBe('0.00');
    expect(getRequiredRunRate(100, 110, 30)).toBe('0.00');
  });
  it('returns "0.00" when no balls remain', () => {
    expect(getRequiredRunRate(100, 50, 0)).toBe('0.00');
    expect(getRequiredRunRate(100, 50, -3)).toBe('0.00');
  });
});

describe('createEmptyInnings', () => {
  it('initialises team names + zero counts', () => {
    const inn = createEmptyInnings('Team A', 'Team B');
    expect(inn.battingTeam).toBe('Team A');
    expect(inn.bowlingTeam).toBe('Team B');
    expect(inn.balls).toEqual([]);
    expect(inn.totalRuns).toBe(0);
    expect(inn.totalWickets).toBe(0);
    expect(inn.totalOvers).toBe(0);
    expect(inn.isComplete).toBe(false);
  });
  it('initialises all extras to zero', () => {
    const inn = createEmptyInnings('A', 'B');
    expect(inn.extras).toEqual({ wides: 0, noballs: 0, byes: 0, legbyes: 0, penalty: 0 });
  });
});

function innings(balls: BallEvent[]): Innings {
  return {
    ...createEmptyInnings('C3H', 'Opposition'),
    balls,
  };
}

describe('getBattingStats', () => {
  it('aggregates runs, balls, boundaries with strike rate', () => {
    const stats = getBattingStats(innings([
      ball({ batter: 'Saad', bowler: 'X', runs: 4, isBoundary: true }),
      ball({ batter: 'Saad', bowler: 'X', runs: 1 }),
      ball({ batter: 'Saad', bowler: 'X', runs: 6, isSix: true }),
    ]));
    const saad = stats.find(s => s.name === 'Saad');
    expect(saad?.runs).toBe(11);
    expect(saad?.balls).toBe(3);
    expect(saad?.fours).toBe(1);
    expect(saad?.sixes).toBe(1);
    expect(saad?.sr).toBe('366.7');
  });

  it('does not credit batter for wides', () => {
    const stats = getBattingStats(innings([
      ball({ batter: 'Saad', bowler: 'X', runs: 0, extras: 1, extraType: 'wide' }),
      ball({ batter: 'Saad', bowler: 'X', runs: 0 }),
    ]));
    expect(stats.find(s => s.name === 'Saad')?.balls).toBe(1);
  });

  it('marks dismissed player out + records howOut for caught', () => {
    const stats = getBattingStats(innings([
      ball({
        batter: 'Saad', bowler: 'Tarek', runs: 0,
        isWicket: true, wicketType: 'Caught',
        dismissedPlayer: 'Saad', fielder: 'Gokul',
      }),
    ]));
    const saad = stats.find(s => s.name === 'Saad');
    expect(saad?.isOut).toBe(true);
    expect(saad?.howOut).toContain('Caught');
    expect(saad?.howOut).toContain('Gokul');
    expect(saad?.howOut).toContain('Tarek');
  });

  it('Run Out shows fielder, no bowler credit', () => {
    const stats = getBattingStats(innings([
      ball({
        batter: 'Saad', bowler: 'Tarek', runs: 0,
        isWicket: true, wicketType: 'Run Out',
        dismissedPlayer: 'Saad', fielder: 'Gokul',
      }),
    ]));
    expect(stats.find(s => s.name === 'Saad')?.howOut).toBe('Run Out (Gokul)');
  });

  it('Retired Hurt does not show bowler/fielder', () => {
    const stats = getBattingStats(innings([
      ball({
        batter: 'Saad', bowler: 'Tarek', runs: 0,
        isWicket: true, wicketType: 'Retired Hurt',
        dismissedPlayer: 'Saad',
      }),
    ]));
    expect(stats.find(s => s.name === 'Saad')?.howOut).toBe('Retired Hurt');
  });
});

describe('getBowlingStats', () => {
  it('aggregates economy + wickets', () => {
    const stats = getBowlingStats(innings([
      ball({ batter: 'X', bowler: 'Saad', runs: 4, isBoundary: true }),
      ball({ batter: 'X', bowler: 'Saad', runs: 0, isDotBall: true }),
      ball({ batter: 'X', bowler: 'Saad', runs: 0, isWicket: true, wicketType: 'Bowled' }),
    ]));
    const saad = stats.find(s => s.name === 'Saad');
    expect(saad?.balls).toBe(3);
    expect(saad?.wickets).toBe(1);
    expect(saad?.dots).toBe(1);
  });

  it('Run Out does not credit bowler with wicket', () => {
    const stats = getBowlingStats(innings([
      ball({ bowler: 'Saad', batter: 'X', runs: 1, isWicket: true, wicketType: 'Run Out', fielder: 'Y' }),
    ]));
    expect(stats.find(s => s.name === 'Saad')?.wickets).toBe(0);
  });

  it('wides do not count as legal balls but do add to runs', () => {
    const stats = getBowlingStats(innings([
      ball({ bowler: 'Saad', batter: 'X', runs: 0, extras: 1, extraType: 'wide' }),
      ball({ bowler: 'Saad', batter: 'X', runs: 0 }),
    ]));
    expect(stats.find(s => s.name === 'Saad')?.balls).toBe(1);
    expect(stats.find(s => s.name === 'Saad')?.runs).toBe(1);
    expect(stats.find(s => s.name === 'Saad')?.wides).toBe(1);
  });

  it('overs display formats balls correctly', () => {
    const balls = Array.from({ length: 10 }, () => ball({ bowler: 'Saad', batter: 'X', runs: 0 }));
    const stats = getBowlingStats(innings(balls));
    expect(stats.find(s => s.name === 'Saad')?.oversDisplay).toBe('1.4');
  });
});
