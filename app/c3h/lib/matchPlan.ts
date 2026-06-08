// Match Plan — captain + vice-captain pre-match planning tool.
//
// One plan per match. Captains and VCs author it; all authenticated
// players can read their own match plan so they know their role
// before walking out to play. Stored in Firestore `match_plans`
// collection, keyed by matchId.
//
// Pure types + helpers only — no Firestore I/O in this file so it
// stays unit-testable.

export const BATTING_ROLES = [
  'opener',
  'top-order',
  'anchor',
  'pinch-hitter',
  'finisher',
  'lower-order',
] as const;

// T30-tuned (30 overs) responsibility briefs for each batting role.
// Surfaced inline in the Match Planner so captains/VCs and players see
// the same definition of what each role actually does at the crease.
//
// Phases referenced:
//   Phase 1 (1-10):  Powerplay + early consolidation
//   Phase 2 (11-22): Middle overs / build
//   Phase 3 (23-30): Death / acceleration
export const BATTING_ROLE_BRIEF: Record<(typeof BATTING_ROLES)[number], {
  position: string;
  battingPhase: string;
  target: string;
  strikeRate: string;
  responsibility: string;
}> = {
  'opener': {
    position: '#1-2',
    battingPhase: 'Overs 1-12',
    target: '30-60 runs each',
    strikeRate: '90-110',
    responsibility: 'Survive the new ball, capitalise on powerplay field restrictions, give the team a platform. At least one opener should bat to over 12-15. Worst case: don\'t get out in the first 3 overs.',
  },
  'top-order': {
    position: '#3-4',
    battingPhase: 'Overs 5-22',
    target: '40-70 runs',
    strikeRate: '90-110',
    responsibility: 'The most important position. Build a big innings, anchor + rotate, set up the death overs. If a top-order batter is set at over 20, the team usually wins.',
  },
  'anchor': {
    position: '#3-5',
    battingPhase: 'Overs 5-28',
    target: '60+ off 70-80 balls',
    strikeRate: '80-100',
    responsibility: 'The "stay till the end" specialist. One end stays solid while others attack. Bats the longest innings of the team. Accelerates only in the last 5 overs.',
  },
  'pinch-hitter': {
    position: '#3-5 (situational)',
    battingPhase: 'Overs 8-18',
    target: '25-40 off 15-25 balls',
    strikeRate: '140+',
    responsibility: 'Mid-innings momentum shifter. Walks in to take down a specific bowler (often spin). High-risk, high-reward. If it works the team explodes; if it fails, next batter consolidates.',
  },
  'finisher': {
    position: '#5-7',
    battingPhase: 'Overs 22-30',
    target: '30-60 off 15-30 balls',
    strikeRate: '140+',
    responsibility: 'Death-overs specialist. Walks in for the last 5-8 overs to maximise the run rate. Must be able to clear the boundary on demand. Pre-meditated scoring zones.',
  },
  'lower-order': {
    position: '#8-11',
    battingPhase: 'Overs 25-30 (if needed)',
    target: '5-25 off 5-20 balls',
    strikeRate: '110+',
    responsibility: 'Support the recognised batters. Don\'t waste balls. Hit cleanly when set. Often all-rounders who can bowl too.',
  },
};

export const BOWLING_ROLES = [
  'none',
  'opening',
  'first-change',
  'spinner-off',
  'spinner-leg',
  'spinner-orthodox',
  'spinner-wrist',
  'death',
  'part-time',
] as const;

// T30-tuned (30 overs) bowling-role briefs. Mirrors BATTING_ROLE_BRIEF
// so the planner surfaces consistent guidance on both halves of the
// game. Each bowler bowls a max of 6 overs in T30.
export const BOWLING_ROLE_BRIEF: Record<(typeof BOWLING_ROLES)[number], {
  whenBowling: string;
  oversInGame: string;
  responsibility: string;
}> = {
  'none': {
    whenBowling: '—',
    oversInGame: '0',
    responsibility: 'Specialist batter / fielder only. Will not bowl in this match.',
  },
  'opening': {
    whenBowling: 'Powerplay (overs 1-6)',
    oversInGame: '4-6 (1-2 spells)',
    responsibility: 'Take wickets with the new ball; restrict scoring while the field is up. Pace bowlers, swing if conditions help.',
  },
  'first-change': {
    whenBowling: 'Overs 7-12',
    oversInGame: '3-5',
    responsibility: 'Continue pressure after the powerplay. Often a medium-pacer or quality seamer. Bridge to the spinners.',
  },
  'spinner-off': {
    whenBowling: 'Middle (overs 8-22)',
    oversInGame: '5-8',
    responsibility: 'Off-spin. Ball turns into a right-hander. Build dot-ball pressure. Best vs left-handers when the ball turns away.',
  },
  'spinner-leg': {
    whenBowling: 'Middle (overs 8-22)',
    oversInGame: '5-8',
    responsibility: 'Leg-spin. Wicket-taking option. Ball turns away from a right-hander. Attacking field.',
  },
  'spinner-orthodox': {
    whenBowling: 'Middle (overs 8-22)',
    oversInGame: '5-8',
    responsibility: 'Left-arm orthodox (SLA). Restrict + take wickets. Ball turns into a right-hander. Consistent.',
  },
  'spinner-wrist': {
    whenBowling: 'Middle (overs 12-22)',
    oversInGame: '4-7',
    responsibility: 'Left-arm wrist-spin (chinaman). Specialist wicket-taker. Attacking option vs right-handers.',
  },
  'death': {
    whenBowling: 'Overs 23-30',
    oversInGame: '4-6',
    responsibility: 'Yorkers, slower balls, wide yorkers. Best pacer of the side. Defend low totals; restrict acceleration to single-digit overs.',
  },
  'part-time': {
    whenBowling: 'Middle (overs 10-20)',
    oversInGame: '1-3',
    responsibility: 'Fill gaps to rest main bowlers. Surprise option, change of angle. Usually a batting all-rounder.',
  },
};

export const FIELDING_POSITIONS = [
  'Keeper',
  'Slip',
  'Gully',
  'Point',
  'Backward point',
  'Cover',
  'Extra cover',
  'Mid-off',
  'Mid-on',
  'Midwicket',
  'Square leg',
  'Fine leg',
  'Third man',
  'Deep cover',
  'Long off',
  'Long on',
  'Deep midwicket',
  'Deep square leg',
] as const;

export const MINDSET_WORDS = [
  'Calm',
  'Brave',
  'Clear',
  'Focused',
  'Decisive',
  'Patient',
  'Composed',
  'Fearless',
  'Disciplined',
  'Ready',
  'Locked in',
  'Sharp',
] as const;

export type BattingRole = (typeof BATTING_ROLES)[number];
export type BowlingRole = (typeof BOWLING_ROLES)[number];

export interface PlayerAssignment {
  playerName: string;
  email: string;
  battingRole?: BattingRole;
  battingOrder?: number; // 1-12, where 12 is twelfth man
  bowlingRole?: BowlingRole;
  fieldingPosition?: string;
  isWicketkeeper?: boolean;
  notes?: string;
}

export type LeagueKey = 'LPL' | 'LCL' | 'Practice' | 'Other';

export interface MatchPlan {
  matchId: string;
  matchLabel: string;
  league: LeagueKey;
  opponent?: string;
  date?: string;
  venue?: string;

  captainName?: string;
  captainEmail?: string;
  vcName?: string;
  vcEmail?: string;

  squad: PlayerAssignment[];

  // Batting plan — if batting first (setting a target)
  teamTarget?: number;
  startSmartTactic?: string; // overs 1-10
  buildFastTactic?: string; // overs 11-25
  finishStrongTactic?: string; // overs 25+

  // Chase plan — if batting second (chasing a target)
  chaseStandardTactic?: string;   // required run-rate ≤ 5.5/over
  chaseAggressiveTactic?: string; // required run-rate > 5.5/over

  // Bowling plan — if bowling first (restricting an unknown total)
  powerplayPlan?: string;
  middleOversPlan?: string;
  deathOversPlan?: string;

  // Defending plan — if bowling second (defending a known target)
  defendBelowParPlan?: string;     // defending under 130 in T30
  defendParOrAbovePlan?: string;   // defending 130+ in T30

  // Mindset & strategy
  mindsetWord?: string;
  processFocuses?: string[]; // up to 3 short focus points
  huddleLine?: string; // captain's pre-match line

  // Sign-off
  captainSignedAt?: string;
  vcSignedAt?: string;
  status: 'draft' | 'signed' | 'archived';

  // Audit
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

// ── Helpers ──────────────────────────────────────────────────────

// Detect league from match label (mirrors nextMatchInsight.detectCompetition)
export function detectLeagueFromLabel(label: string): LeagueKey {
  const m = (label || '').trim().toLowerCase();
  if (m.startsWith('lpl')) return 'LPL';
  if (m.startsWith('lcl')) return 'LCL';
  if (m.includes('practice') || m.includes('nets')) return 'Practice';
  return 'Other';
}

// ── Pre-fill templates ────────────────────────────────────────────
// Opinionated T30 batting-first template the captain can apply with
// one click to pre-fill the batting-plan fields. Editable after that.
// Source: CCC coaching playbook 2026 — adapted from ODI structure,
// compressed for the 30-over format.
export const T30_BATTING_FIRST_TEMPLATE = {
  teamTarget: 150,
  startSmartTactic:
    'Protect wickets, target 5.5 RPO (~55 by over 10). Openers: one attacks the powerplay, one anchors. Lose 0-1 wicket by over 10.',
  buildFastTactic:
    'Target 6.5 RPO. Rotate every ball; boundaries in your scoring zones. Top order bats deep; finishers must be in by over 22-23. No more than 4 wickets down by over 15.',
  finishStrongTactic:
    'Target 10 RPO. Finishers clear boundaries on demand — pre-pick the short side. All-out is acceptable; runs over wickets in the last 8 overs.',
};

// Default captain + VC assignments per league (current season).
// Single source of truth for the Match Planner pre-fill. Keep in
// sync with the `Captains/VCs today` comment block in lib/c3h-access.ts.
// Source: Saad's confirmation 2026-06-08.
export const LEAGUE_LEADERSHIP: Record<LeagueKey, { captainName: string; vcName: string }> = {
  LPL: { captainName: 'Tarek Islam', vcName: 'Mohammed Saad' },
  LCL: { captainName: 'Syed Shahriar', vcName: 'Ankush Arora' },
  Practice: { captainName: '', vcName: '' },
  Other: { captainName: '', vcName: '' },
};

// Return the default captain + VC for the given league. Empty strings
// for Practice / Other so the form fields stay user-editable.
export function getLeadership(league: LeagueKey): { captainName: string; vcName: string } {
  return LEAGUE_LEADERSHIP[league];
}

// Return the playing XI ordered by batting order (1-11). Twelfth man
// (battingOrder === 12) is excluded from XI. Players with no batting
// order are sorted to the end in insertion order.
export function getPlayingXI(squad: PlayerAssignment[]): PlayerAssignment[] {
  const withOrder = squad.filter((p) => p.battingOrder !== undefined && p.battingOrder >= 1 && p.battingOrder <= 11);
  const withoutOrder = squad.filter((p) => p.battingOrder === undefined || p.battingOrder < 1 || p.battingOrder > 11);
  return [
    ...withOrder.sort((a, b) => (a.battingOrder ?? 0) - (b.battingOrder ?? 0)),
    ...withoutOrder,
  ].slice(0, 11);
}

// Return the twelfth man (or undefined if none assigned).
export function getTwelfthMan(squad: PlayerAssignment[]): PlayerAssignment | undefined {
  return squad.find((p) => p.battingOrder === 12);
}

// Validate plan completeness. Returns array of missing-field warnings.
// Empty array = plan is ready to sign off.
export function validatePlan(plan: MatchPlan): string[] {
  const issues: string[] = [];
  if (!plan.matchId) issues.push('Match not selected');
  if (!plan.captainName) issues.push('Captain not named');
  if (!plan.vcName) issues.push('Vice-captain not named');
  if (plan.squad.length < 11) issues.push(`Squad has ${plan.squad.length} players — need at least 11`);
  if (plan.squad.length > 12) issues.push(`Squad has ${plan.squad.length} players — max is 12`);
  const playingXI = getPlayingXI(plan.squad);
  if (playingXI.length < 11) issues.push(`Playing XI has ${playingXI.length} players in batting order — need 11`);
  const orders = playingXI.map((p) => p.battingOrder).filter((n) => n !== undefined);
  const duplicateOrders = orders.filter((n, i) => orders.indexOf(n) !== i);
  if (duplicateOrders.length > 0) issues.push(`Duplicate batting orders: ${[...new Set(duplicateOrders)].join(', ')}`);
  const keepers = plan.squad.filter((p) => p.isWicketkeeper);
  if (keepers.length === 0) issues.push('No wicketkeeper assigned');
  if (keepers.length > 1) issues.push(`Multiple wicketkeepers assigned (${keepers.length}) — only one expected`);
  if (!plan.mindsetWord) issues.push('Team mindset word not set');
  return issues;
}

// Generate a short, captain-readable pre-match huddle script from the
// plan. Used both to surface in the UI and to embed in any
// "share to team" output.
export function buildHuddleScript(plan: MatchPlan): string[] {
  const lines: string[] = [];
  if (plan.huddleLine && plan.huddleLine.trim().length > 0) {
    lines.push(plan.huddleLine.trim());
  }
  if (plan.mindsetWord) {
    lines.push(`Team mindset for this match: ${plan.mindsetWord.toUpperCase()}.`);
  }
  if (plan.teamTarget) {
    lines.push(`Team target: ${plan.teamTarget}+. Bat all 30 overs.`);
  }
  if (plan.processFocuses && plan.processFocuses.length > 0) {
    lines.push(`Three process focuses today: ${plan.processFocuses.filter((f) => f.trim().length > 0).join(' · ')}.`);
  }
  const xi = getPlayingXI(plan.squad);
  if (xi.length === 11) {
    const opener1 = xi.find((p) => p.battingOrder === 1);
    const opener2 = xi.find((p) => p.battingOrder === 2);
    if (opener1 && opener2) {
      lines.push(`Openers: ${opener1.playerName} and ${opener2.playerName}.`);
    }
    const openingBowlers = xi.filter((p) => p.bowlingRole === 'opening');
    if (openingBowlers.length > 0) {
      lines.push(`Opening with the ball: ${openingBowlers.map((p) => p.playerName).join(' and ')}.`);
    }
  }
  if (lines.length === 0) {
    lines.push('Play with intent. Trust the plan. Watch the ball.');
  }
  return lines;
}
