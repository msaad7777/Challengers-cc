// Test factories for Match / Innings / BallEvent — keeps individual
// test files focused on assertions rather than fixture boilerplate.

import type { BallEvent, Innings, Match, Player } from '@/app/c3h/scorer/types';

export function ball(b: Partial<BallEvent> = {}): BallEvent {
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

export function emptyInnings(battingTeam: string, bowlingTeam: string): Innings {
  return {
    battingTeam,
    bowlingTeam,
    balls: [],
    totalRuns: 0,
    totalWickets: 0,
    totalOvers: 0,
    totalBalls: 0,
    extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0, penalty: 0 },
    currentBatter1: '',
    currentBatter2: '',
    currentBowler: '',
    isComplete: false,
  };
}

export function innings(battingTeam: string, bowlingTeam: string, balls: BallEvent[]): Innings {
  return { ...emptyInnings(battingTeam, bowlingTeam), balls };
}

export function makePlayer(name: string): Player {
  return { id: name, name, isC3H: true };
}

export function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 'M1',
    createdBy: 'saad@challengerscc.ca',
    matchType: 'practice',
    matchLabel: 'Practice — 5 May 2026',
    team1: 'C3H A',
    team2: 'C3H B',
    team1Players: [makePlayer('Saad'), makePlayer('Tarek'), makePlayer('Gokul')],
    team2Players: [makePlayer('Ankush'), makePlayer('Sazzad'), makePlayer('Madhu')],
    tossWinner: 'C3H A',
    tossDecision: 'bat',
    totalOvers: 20,
    maxWickets: 10,
    venue: 'NLAF',
    date: '2026-05-05',
    innings1: emptyInnings('C3H A', 'C3H B'),
    innings2: emptyInnings('C3H B', 'C3H A'),
    currentInnings: 1,
    status: 'completed',
    result: 'C3H A won',
    scorer: 'Saad',
    createdAt: '2026-05-05T10:00:00Z',
    updatedAt: '2026-05-05T13:00:00Z',
    ...overrides,
  };
}
