export interface Player {
  id: string;
  name: string;
  isC3H: boolean; // from C3H roster or manually added
}

export interface BallEvent {
  id: string;
  over: number;
  ball: number; // 1-6 (legal deliveries)
  batter: string;
  bowler: string;
  runs: number;
  extras: number;
  extraType: '' | 'wide' | 'noball' | 'bye' | 'legbye' | 'penalty';
  isWicket: boolean;
  wicketType: string;
  dismissedPlayer: string;
  fielder: string;
  isBoundary: boolean;
  isSix: boolean;
  isDotBall: boolean;
  timestamp: string;
}

export interface Innings {
  battingTeam: string;
  bowlingTeam: string;
  balls: BallEvent[];
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  totalBalls: number;
  extras: {
    wides: number;
    noballs: number;
    byes: number;
    legbyes: number;
    penalty: number;
  };
  currentBatter1: string;
  currentBatter2: string;
  currentBowler: string;
  isComplete: boolean;
}

export interface Match {
  id: string;
  createdBy: string;
  matchType: 'league' | 'practice';
  matchLabel: string;
  team1: string;
  team2: string;
  team1Players: Player[];
  team2Players: Player[];
  tossWinner: string;
  tossDecision: 'bat' | 'bowl';
  totalOvers: number;
  venue: string;
  date: string;
  innings1: Innings;
  innings2: Innings;
  currentInnings: 1 | 2;
  status: 'setup' | 'toss' | 'playing' | 'innings_break' | 'completed';
  result: string;
  scorer: string;
  createdAt: string;
  updatedAt: string;
}

export const WICKET_TYPES = [
  'Bowled',
  'Caught',
  'Caught & Bowled',
  'LBW',
  'Run Out',
  'Stumped',
  'Hit Wicket',
  'Retired Hurt',
  'Retired Out',
  'Obstructing the Field',
  'Hit the Ball Twice',
  'Timed Out',
];

export const C3H_PLAYERS: Player[] = [
  { id: '1', name: 'Mohammed Saad', isC3H: true },
  { id: '2', name: 'Tarek Islam', isC3H: true },
  { id: '3', name: 'Gokul Prakash', isC3H: true },
  { id: '4', name: 'Qaiser Mahmood', isC3H: true },
  { id: '5', name: 'Madhu Reddy', isC3H: true },
  { id: '6', name: 'Ankush Arora', isC3H: true },
  { id: '7', name: 'Roman Mahmud', isC3H: true },
  { id: '8', name: 'Judin Thomas', isC3H: true },
  { id: '9', name: 'Saikrishna Goriparthi', isC3H: true },
  { id: '10', name: 'Dr. Shoab Ahmad', isC3H: true },
  { id: '11', name: 'Fahad Aktar', isC3H: true },
  { id: '12', name: 'Denison Davis', isC3H: true },
  { id: '13', name: 'Abhishek Ladva', isC3H: true },
  { id: '14', name: 'Ashvak Sheik', isC3H: true },
  { id: '15', name: 'Bhupinder Singh', isC3H: true },
  { id: '16', name: 'Salman Ahmed', isC3H: true },
  { id: '17', name: 'Farooq Choudhary', isC3H: true },
  { id: '18', name: 'Vijay Yadav', isC3H: true },
  { id: '19', name: 'Shivam Rajput', isC3H: true },
  { id: '20', name: 'Shaby Ansari', isC3H: true },
  { id: '21', name: 'Manohar Anukuri', isC3H: true },
  { id: '22', name: 'Mohayminul', isC3H: true },
  { id: '23', name: 'Andrew Jebarson', isC3H: true },
  { id: '24', name: 'Guru Raga', isC3H: true },
  { id: '25', name: 'Noman', isC3H: true },
  { id: '26', name: 'Shafiul', isC3H: true },
  { id: '27', name: 'Sujel Ahmed', isC3H: true },
  { id: '28', name: 'Shahriar', isC3H: true },
  { id: '29', name: 'Atik Rahman', isC3H: true },
  { id: '30', name: 'Majharul Alam', isC3H: true },
  { id: '31', name: 'Makhan', isC3H: true },
];

export const LCL_TEAMS = [
  'Challengers Cricket Club',
  'London Predators',
  'Forest City Cricketers',
  'Sarnia Spartans',
  'Western Cricket Academy B',
  'London Rising Stars',
  'LCC - Maple Stars',
  'LCC Mavericks',
  'London Eagle Predators',
  'Inferno Spartans',
  'Tigers Cricket Club',
];

export function createEmptyInnings(battingTeam: string, bowlingTeam: string): Innings {
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

export function getBattingStats(innings: Innings) {
  const stats: Record<string, { runs: number; balls: number; fours: number; sixes: number; isOut: boolean; howOut: string }> = {};

  innings.balls.forEach(b => {
    if (!b.batter) return;
    if (!stats[b.batter]) stats[b.batter] = { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, howOut: '' };

    // Count ball faced (not wides)
    if (b.extraType !== 'wide') stats[b.batter].balls++;

    // Runs scored by batter (not extras)
    if (!b.extraType || b.extraType === 'noball') {
      stats[b.batter].runs += b.runs;
      if (b.isBoundary) stats[b.batter].fours++;
      if (b.isSix) stats[b.batter].sixes++;
    }

    if (b.isWicket && b.dismissedPlayer) {
      if (!stats[b.dismissedPlayer]) stats[b.dismissedPlayer] = { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, howOut: '' };
      stats[b.dismissedPlayer].isOut = true;
      stats[b.dismissedPlayer].howOut = b.wicketType + (b.fielder ? ` (${b.fielder})` : '') + (b.bowler ? ` b ${b.bowler}` : '');
    }
  });

  return Object.entries(stats).map(([name, s]) => ({
    name,
    ...s,
    sr: s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : '0.0',
  }));
}

export function getBowlingStats(innings: Innings) {
  const stats: Record<string, { overs: number; balls: number; runs: number; wickets: number; maidens: number; wides: number; noballs: number; dots: number }> = {};

  innings.balls.forEach(b => {
    if (!b.bowler) return;
    if (!stats[b.bowler]) stats[b.bowler] = { overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0, wides: 0, noballs: 0, dots: 0 };

    // Runs conceded
    stats[b.bowler].runs += b.runs + b.extras;

    // Legal delivery
    if (b.extraType !== 'wide' && b.extraType !== 'noball') {
      stats[b.bowler].balls++;
    }

    if (b.extraType === 'wide') stats[b.bowler].wides++;
    if (b.extraType === 'noball') stats[b.bowler].noballs++;
    if (b.isWicket && b.wicketType !== 'Run Out') stats[b.bowler].wickets++;
    if (b.isDotBall && !b.extraType) stats[b.bowler].dots++;
  });

  return Object.entries(stats).map(([name, s]) => ({
    name,
    ...s,
    oversDisplay: `${Math.floor(s.balls / 6)}.${s.balls % 6}`,
    economy: s.balls > 0 ? ((s.runs / (s.balls / 6))).toFixed(2) : '0.00',
  }));
}

export function getOversBalls(totalLegalBalls: number): string {
  return `${Math.floor(totalLegalBalls / 6)}.${totalLegalBalls % 6}`;
}

export function getRunRate(runs: number, balls: number): string {
  if (balls === 0) return '0.00';
  return ((runs / (balls / 6))).toFixed(2);
}

export function getRequiredRunRate(target: number, currentRuns: number, ballsRemaining: number): string {
  if (ballsRemaining <= 0) return '0.00';
  const runsNeeded = target - currentRuns;
  if (runsNeeded <= 0) return '0.00';
  return ((runsNeeded / (ballsRemaining / 6))).toFixed(2);
}
