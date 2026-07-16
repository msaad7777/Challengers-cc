// Player Tracker — pure aggregation of per-player games-played and
// availability across LCL and LPL, plus playoff-eligibility progress.
//
// LLM-free, Firestore-free, and pure so it stays unit-testable (see
// tests/playerTracker.test.ts) and can run on either the server or the
// client off whatever data the caller already loaded.
//
// Source of "games played": the `squads/{matchId}` playing-12 records —
// the same board/captain-editable selection captured on the Availability
// page. This is deliberate: it covers games that were never scored through
// C3H (a captain/board member can record the playing XI retroactively and
// it counts here immediately), which is the whole point of the tracker.
// It also mirrors LPL Rule 23, which counts appearances "in the playing
// twelve", not runs or wickets.

export type LeagueKey = 'LCL T30' | 'LPL T30';

/** Minimal shape the tracker needs from a scheduled fixture. */
export interface TrackerMatch {
  id: string;
  league: string;
  fullDate: string;
}

/** matchId -> playing-12 (array of player display names). */
export type SquadsMap = Record<string, string[]>;

/** player display name -> { matchId: availabilityStatus }. */
export type AvailabilityMap = Record<string, Record<string, string | undefined>>;

// Playoff-eligibility thresholds — minimum appearances in the playing
// twelve to qualify for that league's playoffs.
//
//   LPL T30 (Challengers = Division 2): 5 of 12  — LPL 2026 Rule 23.
//   LCL T30:                            6 of 14  — LCL 2026 rulebook.
//
// If a league's threshold is not listed here, `requiredForLeague` returns
// 0 (treated as "no threshold configured" — everyone shows eligible).
export const PLAYOFF_ELIGIBILITY: Record<string, number> = {
  'LPL T30': 5,
  'LCL T30': 6,
};

export function requiredForLeague(league: string): number {
  return PLAYOFF_ELIGIBILITY[league] ?? 0;
}

export interface LeagueStat {
  /** Fixtures in this league on the schedule. */
  totalMatches: number;
  /** Matches where the player was in the recorded playing-12. */
  played: number;
  /** Matches the player marked themselves 'available' for. */
  available: number;
  /** Playoff threshold (0 = not configured). */
  requiredForPlayoff: number;
  /** True once played >= requiredForPlayoff (and a threshold is set). */
  eligible: boolean;
  /** Games still needed to reach the threshold (0 if met/unset). */
  remainingNeeded: number;
}

export interface PlayerTrackerRow {
  player: string;
  lcl: LeagueStat;
  lpl: LeagueStat;
  /** Combined LCL + LPL games in the playing-12. */
  totalPlayed: number;
}

/** Count fixtures in `matches` belonging to `league`. */
export function matchesInLeague(matches: TrackerMatch[], league: string): TrackerMatch[] {
  return matches.filter((m) => m.league === league);
}

/**
 * Games a player appears in for one league, counting membership in the
 * recorded playing-12 (`squads[matchId]`). A squad that hasn't been set
 * yet simply contributes nothing.
 */
export function gamesPlayed(
  player: string,
  league: string,
  matches: TrackerMatch[],
  squads: SquadsMap,
): number {
  return matchesInLeague(matches, league).reduce(
    (n, m) => n + ((squads[m.id] || []).includes(player) ? 1 : 0),
    0,
  );
}

/** Matches in one league the player marked 'available' for. */
export function availableCount(
  player: string,
  league: string,
  matches: TrackerMatch[],
  availability: AvailabilityMap,
): number {
  const marks = availability[player] || {};
  return matchesInLeague(matches, league).reduce(
    (n, m) => n + (marks[m.id] === 'available' ? 1 : 0),
    0,
  );
}

function leagueStat(
  player: string,
  league: string,
  matches: TrackerMatch[],
  squads: SquadsMap,
  availability: AvailabilityMap,
): LeagueStat {
  const totalMatches = matchesInLeague(matches, league).length;
  const played = gamesPlayed(player, league, matches, squads);
  const available = availableCount(player, league, matches, availability);
  const required = requiredForLeague(league);
  const eligible = required > 0 && played >= required;
  const remainingNeeded = required > 0 ? Math.max(0, required - played) : 0;
  return { totalMatches, played, available, requiredForPlayoff: required, eligible, remainingNeeded };
}

/**
 * Build one tracker row per player. `players` controls the row set and
 * order; a player with no squad appearances and no availability marks
 * still gets a (zeroed) row so the board can see who is uninvolved.
 */
export function computePlayerTracker(
  players: string[],
  matches: TrackerMatch[],
  squads: SquadsMap,
  availability: AvailabilityMap,
): PlayerTrackerRow[] {
  return players.map((player) => {
    const lcl = leagueStat(player, 'LCL T30', matches, squads, availability);
    const lpl = leagueStat(player, 'LPL T30', matches, squads, availability);
    return { player, lcl, lpl, totalPlayed: lcl.played + lpl.played };
  });
}
