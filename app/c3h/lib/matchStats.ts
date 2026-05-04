// Aggregations + MVP/best-of computations for completed matches.
// CricHeroes-aligned formula. Pure functions — easy to test, no
// Firestore reads, just operates on a Match document.

import type { Match, Innings, BallEvent } from '../scorer/types';

// ── Per-player aggregations ─────────────────────────────────────

export interface BattingPerf {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  sr: number; // strike rate
  isOut: boolean;
  howOut: string;
  battingPos: number; // 1 = opener, 2 = ..., used for par-score bonus
}

export interface BowlingPerf {
  name: string;
  ballsBowled: number;
  oversDisplay: string; // "3.4"
  runs: number;
  wickets: number;
  maidens: number;
  dots: number;
  economy: number;
  fiveFor: boolean;
}

export interface FieldingPerf {
  name: string;
  catches: number;
  stumpings: number;
  runOuts: number;
  directHits: number; // run-outs where fielder === bowler implies direct (rough heuristic)
}

// Aggregate batting perf across an innings, preserving order they came in
export function getBattingPerf(innings: Innings): BattingPerf[] {
  const seenOrder: string[] = [];
  const stats: Record<string, Omit<BattingPerf, 'sr' | 'battingPos'>> = {};

  for (const b of innings.balls) {
    if (b.batter && !stats[b.batter]) {
      stats[b.batter] = { name: b.batter, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, howOut: '' };
      seenOrder.push(b.batter);
    }
    if (!b.batter) continue;

    if (b.extraType !== 'wide') stats[b.batter].balls++;
    if (!b.extraType || b.extraType === 'noball') {
      stats[b.batter].runs += b.runs;
      if (b.isBoundary) stats[b.batter].fours++;
      if (b.isSix) stats[b.batter].sixes++;
    }
    if (b.isWicket && b.dismissedPlayer) {
      if (!stats[b.dismissedPlayer]) {
        stats[b.dismissedPlayer] = { name: b.dismissedPlayer, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, howOut: '' };
        seenOrder.push(b.dismissedPlayer);
      }
      stats[b.dismissedPlayer].isOut = true;
      stats[b.dismissedPlayer].howOut = b.wicketType + (b.fielder ? ` (${b.fielder})` : '') + (b.bowler ? ` b ${b.bowler}` : '');
    }
  }

  return seenOrder.map((name, idx) => {
    const s = stats[name];
    return {
      ...s,
      sr: s.balls > 0 ? Math.round((s.runs / s.balls) * 1000) / 10 : 0,
      battingPos: idx + 1,
    };
  });
}

export function getBowlingPerf(innings: Innings): BowlingPerf[] {
  const stats: Record<string, Omit<BowlingPerf, 'oversDisplay' | 'economy' | 'fiveFor'>> = {};

  // Group balls by over to compute maidens
  const byOver: Record<string, BallEvent[]> = {};

  for (const b of innings.balls) {
    if (!b.bowler) continue;
    if (!stats[b.bowler]) {
      stats[b.bowler] = { name: b.bowler, ballsBowled: 0, runs: 0, wickets: 0, maidens: 0, dots: 0 };
    }
    stats[b.bowler].runs += b.runs + b.extras;
    if (b.extraType !== 'wide' && b.extraType !== 'noball') {
      stats[b.bowler].ballsBowled++;
    }
    if (b.isWicket && b.wicketType !== 'Run Out') stats[b.bowler].wickets++;
    if (b.isDotBall && !b.extraType) stats[b.bowler].dots++;

    const overKey = `${b.bowler}__${b.over}`;
    if (!byOver[overKey]) byOver[overKey] = [];
    byOver[overKey].push(b);
  }

  // Compute maidens: 6 legal balls, 0 runs (incl. extras)
  for (const key of Object.keys(byOver)) {
    const balls = byOver[key];
    const legal = balls.filter((b) => b.extraType !== 'wide' && b.extraType !== 'noball');
    if (legal.length !== 6) continue;
    const runs = balls.reduce((s, b) => s + b.runs + b.extras, 0);
    if (runs === 0) {
      const bowler = key.split('__')[0];
      stats[bowler].maidens++;
    }
  }

  return Object.values(stats).map((s) => ({
    ...s,
    oversDisplay: `${Math.floor(s.ballsBowled / 6)}.${s.ballsBowled % 6}`,
    economy: s.ballsBowled > 0 ? Math.round((s.runs / (s.ballsBowled / 6)) * 100) / 100 : 0,
    fiveFor: s.wickets >= 5,
  }));
}

export function getFieldingPerf(innings: Innings): FieldingPerf[] {
  const stats: Record<string, FieldingPerf> = {};

  for (const b of innings.balls) {
    if (!b.isWicket || !b.fielder) continue;
    if (!stats[b.fielder]) {
      stats[b.fielder] = { name: b.fielder, catches: 0, stumpings: 0, runOuts: 0, directHits: 0 };
    }
    if (b.wicketType === 'Caught' || b.wicketType === 'Caught & Bowled') stats[b.fielder].catches++;
    else if (b.wicketType === 'Stumped') stats[b.fielder].stumpings++;
    else if (b.wicketType === 'Run Out') {
      stats[b.fielder].runOuts++;
      // Direct hit heuristic: only one fielder credited (no separate thrower).
      // Rough — real direct-hit attribution would need a separate field.
    }
  }

  return Object.values(stats);
}

// ── MVP scoring ────────────────────────────────────────────────

// Par scores by batting position — CricHeroes-derived.
function parScore(pos: number): number {
  if (pos <= 1) return 42; // opener
  if (pos === 2) return 40;
  if (pos === 3) return 32;
  if (pos === 4) return 28;
  if (pos === 5) return 22;
  if (pos === 6) return 18;
  if (pos === 7) return 14;
  return 12;
}

export function battingMVP(p: BattingPerf): number {
  let pts = p.runs / 10; // 1 pt per 10 runs
  // Par-score bonus
  if (p.runs > parScore(p.battingPos)) {
    pts += (p.runs - parScore(p.battingPos)) * 0.06;
  }
  // Boundary bonus
  pts += p.fours * 0.5;
  pts += p.sixes * 1;
  // Strike rate bonus (T20 context)
  if (p.balls >= 10) {
    if (p.sr > 150) pts += 2;
    else if (p.sr > 130) pts += 1;
    else if (p.sr < 80) pts -= 1;
  }
  // Cheap dismissal penalty if top-order
  if (p.isOut && p.runs < 10 && p.battingPos <= 4) pts -= 2;
  return Math.max(0, Math.round(pts * 10) / 10);
}

export function bowlingMVP(p: BowlingPerf): number {
  let pts = p.wickets * 10; // 1 pt per 10 = wickets × 10
  pts += p.maidens * 5;
  pts += p.dots * 0.1;
  if (p.fiveFor) pts += 20;
  // Economy adjustment
  if (p.ballsBowled >= 12) {
    if (p.economy < 5) pts += 4;
    else if (p.economy < 6) pts += 2;
    else if (p.economy > 10) pts -= 3;
  }
  return Math.max(0, Math.round(pts * 10) / 10);
}

export function fieldingMVP(p: FieldingPerf): number {
  let pts = 0;
  pts += p.catches * 5;
  pts += p.stumpings * 5;
  pts += p.runOuts * 5;
  pts += p.directHits * 5; // additional 5 for direct hits, total 10
  return Math.round(pts * 10) / 10;
}

// ── Combined match-wide MVP calculation ─────────────────────────

export interface MatchPlayerImpact {
  name: string;
  battingPts: number;
  bowlingPts: number;
  fieldingPts: number;
  totalPts: number;
  battingPerf?: BattingPerf;
  bowlingPerf?: BowlingPerf;
  fieldingPerf?: FieldingPerf;
}

export function getMatchImpact(match: Match): MatchPlayerImpact[] {
  const all: Record<string, MatchPlayerImpact> = {};

  const ensure = (name: string) => {
    if (!all[name]) {
      all[name] = { name, battingPts: 0, bowlingPts: 0, fieldingPts: 0, totalPts: 0 };
    }
    return all[name];
  };

  for (const innings of [match.innings1, match.innings2]) {
    if (!innings || innings.balls.length === 0) continue;
    const bat = getBattingPerf(innings);
    const bowl = getBowlingPerf(innings);
    const field = getFieldingPerf(innings);
    for (const p of bat) {
      const e = ensure(p.name);
      e.battingPts += battingMVP(p);
      e.battingPerf = p;
    }
    for (const p of bowl) {
      const e = ensure(p.name);
      e.bowlingPts += bowlingMVP(p);
      e.bowlingPerf = p;
    }
    for (const p of field) {
      const e = ensure(p.name);
      e.fieldingPts += fieldingMVP(p);
      e.fieldingPerf = p;
    }
  }

  for (const e of Object.values(all)) {
    e.totalPts = Math.round((e.battingPts + e.bowlingPts + e.fieldingPts) * 10) / 10;
  }

  return Object.values(all).sort((a, b) => b.totalPts - a.totalPts);
}

// ── Best of categories ─────────────────────────────────────────

export function getBestBatter(match: Match): BattingPerf | null {
  const all = [
    ...getBattingPerf(match.innings1),
    ...getBattingPerf(match.innings2),
  ].filter((p) => p.balls > 0);
  if (all.length === 0) return null;
  return all.sort((a, b) => {
    if (b.runs !== a.runs) return b.runs - a.runs;
    if (a.balls < 10 || b.balls < 10) return b.runs - a.runs;
    return b.sr - a.sr;
  })[0];
}

export function getBestBowler(match: Match): BowlingPerf | null {
  const all = [
    ...getBowlingPerf(match.innings1),
    ...getBowlingPerf(match.innings2),
  ].filter((p) => p.ballsBowled > 0);
  if (all.length === 0) return null;
  return all.sort((a, b) => {
    if (b.wickets !== a.wickets) return b.wickets - a.wickets;
    return a.economy - b.economy;
  })[0];
}

export function getBestFielder(match: Match): FieldingPerf | null {
  const all = [
    ...getFieldingPerf(match.innings1),
    ...getFieldingPerf(match.innings2),
  ];
  if (all.length === 0) return null;
  return all.sort((a, b) =>
    (b.catches + b.stumpings + b.runOuts) -
    (a.catches + a.stumpings + a.runOuts),
  )[0];
}

export function getMVP(match: Match): MatchPlayerImpact | null {
  const impact = getMatchImpact(match);
  return impact.length > 0 ? impact[0] : null;
}

// ── Shareable text scorecard ────────────────────────────────────

// WhatsApp-friendly text scorecard. Plain Unicode (not markdown)
// because most chat apps strip formatting. Includes result, MVP,
// best-of trio, top scorers per innings, public live URL, and the
// YouTube replay link if one is attached. Caller passes the
// public base URL so dev/prod both work.
export function formatMatchShareText(match: Match, baseUrl: string): string {
  const lines: string[] = [];
  lines.push(`🏏 ${match.team1} vs ${match.team2}`);
  const meta: string[] = [];
  if (match.date) meta.push(match.date);
  if (match.venue) meta.push(match.venue);
  if (match.totalOvers) meta.push(`${match.totalOvers} overs`);
  if (meta.length > 0) lines.push(`📅 ${meta.join(' · ')}`);
  if (match.result) lines.push('', `🏆 ${match.result}`);

  const mvp = getMVP(match);
  if (mvp && mvp.totalPts > 0) {
    lines.push('', `🥇 MVP: ${mvp.name} (${mvp.totalPts} pts)`);
    const bits: string[] = [];
    if (mvp.battingPerf && mvp.battingPerf.runs > 0) bits.push(`${mvp.battingPerf.runs}(${mvp.battingPerf.balls})`);
    if (mvp.bowlingPerf && mvp.bowlingPerf.wickets > 0) bits.push(`${mvp.bowlingPerf.wickets}/${mvp.bowlingPerf.runs} in ${mvp.bowlingPerf.oversDisplay}`);
    if (mvp.fieldingPerf) {
      const fp = mvp.fieldingPerf;
      const f = fp.catches + fp.stumpings + fp.runOuts;
      if (f > 0) bits.push(`${fp.catches}c${fp.stumpings ? ` ${fp.stumpings}st` : ''}${fp.runOuts ? ` ${fp.runOuts}ro` : ''}`);
    }
    if (bits.length > 0) lines.push(`   ${bits.join(' · ')}`);
  }

  const bestBat = getBestBatter(match);
  const bestBowl = getBestBowler(match);
  const bestField = getBestFielder(match);
  if (bestBat && bestBat.runs > 0) lines.push(`🏏 Best Batter: ${bestBat.name} ${bestBat.runs}(${bestBat.balls})${bestBat.fours ? `, 4×${bestBat.fours}` : ''}${bestBat.sixes ? ` 6×${bestBat.sixes}` : ''}`);
  if (bestBowl && bestBowl.wickets > 0) lines.push(`🎯 Best Bowler: ${bestBowl.name} ${bestBowl.wickets}/${bestBowl.runs} in ${bestBowl.oversDisplay} ov`);
  if (bestField && (bestField.catches + bestField.stumpings + bestField.runOuts) > 0) {
    const fp = bestField;
    const total = fp.catches + fp.stumpings + fp.runOuts;
    lines.push(`🧤 Best Fielder: ${fp.name} — ${total} dismissal${total !== 1 ? 's' : ''}`);
  }

  for (const inn of [match.innings1, match.innings2]) {
    if (!inn || inn.balls.length === 0) continue;
    const oversDisplay = `${Math.floor(inn.totalBalls / 6)}.${inn.totalBalls % 6}`;
    lines.push('', `📋 ${inn.battingTeam}: ${inn.totalRuns}/${inn.totalWickets} (${oversDisplay})`);
    const top = getBattingPerf(inn)
      .filter((p) => p.balls > 0)
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 5)
      .map((p) => `${p.name} ${p.runs}${p.isOut ? '' : '*'}(${p.balls})`)
      .join(', ');
    if (top) lines.push(`   ${top}`);
  }

  if (match.replayUrl) {
    lines.push('', `📺 Watch: ${match.replayUrl}`);
  }
  if (match.id) {
    const base = baseUrl.replace(/\/$/, '');
    lines.push(`🔗 Full scorecard: ${base}/c3h/live?id=${match.id}`);
  }
  lines.push('', '— Challengers Cricket Club');
  return lines.join('\n');
}
