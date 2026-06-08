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

  // Batting plan
  teamTarget?: number;
  startSmartTactic?: string; // balls 1-10
  buildFastTactic?: string; // balls 11-25
  finishStrongTactic?: string; // balls 25+

  // Bowling plan
  powerplayPlan?: string;
  middleOversPlan?: string;
  deathOversPlan?: string;

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
