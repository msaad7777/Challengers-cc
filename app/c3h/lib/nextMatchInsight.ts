// Cross-reflection "Next Match Coach Review" — aggregates the
// player's reflections across competitions (LCL / LPL / Practice /
// other) and produces (a) per-competition stats and (b) a synthesised
// pre-match coach voice. Rendered on the Nets list view.
//
// Pure function, rule-based, LLM-free — same auditability bar as
// coachInsight.ts. Inputs are the player's reflection array;
// nothing Firestore- or session-specific lives here.

export interface NextMatchReflectionInput {
  // Subset of the Reflection interface that this function needs.
  // Kept narrow on purpose so the function is decoupled from the
  // page-level Reflection type (which carries Firestore + UI state).
  match: string;
  matchIndex: number;
  howGotOut: string | string[];
  whatWentRight: string[];
  whatWentWrong: string[];
  intentScore: number;
  feeling?: number;
  runsScored?: number;
  ballsFaced?: number;
  dotBallsFaced?: number;
  dismissalBowlerArm?: 'right' | 'left';
  dismissalBowlerStyle?: 'fast' | 'medium' | 'off-spin' | 'leg-spin';
}

export interface CompetitionStats {
  key: 'LPL' | 'LCL' | 'Practice' | 'Other';
  label: string;
  matches: number;             // reflections counted (one reflection ≈ one match for the player)
  runs: number;
  balls: number;
  strikeRate: number | null;   // (runs / balls * 100), null if balls === 0
  runsPer10Balls: number | null;
  dotBalls: number;
  dotBallPercent: number | null;
  intentAvg: number | null;    // average of intentScore across reflections in this competition
}

export interface NextMatchInsight {
  competitionStats: CompetitionStats[];   // all competitions the player has reflections for
  aggregate: CompetitionStats;             // rolled-up across every competition (label = "All")
  topDismissalPattern: { dismissal: string; count: number } | null;
  topMistakePattern: { mistake: string; count: number } | null;
  topBowlerStyle: { arm: 'right' | 'left' | 'any'; style: 'fast' | 'medium' | 'off-spin' | 'leg-spin'; count: number } | null;
  coachReview: string[];                   // 2-4 sentence pre-match coach voice, ordered most → least urgent
  goIntoNextMatchWith: string;             // one-line rallying cue
}

// ── Competition detection ─────────────────────────────────────────
// Reflection.match is a human label like:
//   "LPL M3 — vs NLCC (May 31)"
//   "LCL M2 — vs Forest City Cricketers (May 18)"
//   "Practice Match"
//   "Nets — Saturday session"
// We detect the competition by prefix; anything we don't recognise
// falls into "Other".

function detectCompetition(matchLabel: string): CompetitionStats['key'] {
  const m = (matchLabel || '').trim().toLowerCase();
  if (m.startsWith('lpl')) return 'LPL';
  if (m.startsWith('lcl')) return 'LCL';
  if (m.includes('practice') || m.includes('nets')) return 'Practice';
  return 'Other';
}

const COMPETITION_LABELS: Record<CompetitionStats['key'], string> = {
  LPL: 'London Premier League',
  LCL: 'London Cricket League',
  Practice: 'Practice / Nets',
  Other: 'Other matches',
};

function emptyStats(key: CompetitionStats['key']): CompetitionStats {
  return {
    key,
    label: COMPETITION_LABELS[key],
    matches: 0,
    runs: 0,
    balls: 0,
    strikeRate: null,
    runsPer10Balls: null,
    dotBalls: 0,
    dotBallPercent: null,
    intentAvg: null,
  };
}

function finalise(stats: CompetitionStats, intentSum: number, intentCount: number): CompetitionStats {
  return {
    ...stats,
    strikeRate: stats.balls > 0 ? Math.round((stats.runs / stats.balls) * 100 * 10) / 10 : null,
    runsPer10Balls: stats.balls > 0 ? Math.round((stats.runs / stats.balls) * 10 * 10) / 10 : null,
    dotBallPercent: stats.balls > 0 ? Math.round((stats.dotBalls / stats.balls) * 100 * 10) / 10 : null,
    intentAvg: intentCount > 0 ? Math.round((intentSum / intentCount) * 10) / 10 : null,
  };
}

// ── Coach review generation ───────────────────────────────────────
// Synthesises 2-4 sentences from the aggregated state. Most urgent
// findings first; pulled from patterns + KPIs. Tone is concrete and
// directive — like a coach talking to a player in the changing room
// before the next match, not a generic motivational caption.

function buildCoachReview(
  agg: CompetitionStats,
  competitionStats: CompetitionStats[],
  topMistake: NextMatchInsight['topMistakePattern'],
  topDismissal: NextMatchInsight['topDismissalPattern'],
  topBowlerStyle: NextMatchInsight['topBowlerStyle'],
): { coachReview: string[]; goIntoNextMatchWith: string } {
  const lines: string[] = [];

  // 1. Strike rate framing — the headline KPI for "how aggressive am I scoring"
  if (agg.strikeRate !== null) {
    if (agg.strikeRate >= 130) {
      lines.push(`Your aggregate strike rate is ${agg.strikeRate} — that's elite-tempo scoring across ${agg.matches} reflection${agg.matches === 1 ? '' : 's'}. Trust the intent; the runs follow it.`);
    } else if (agg.strikeRate >= 100) {
      lines.push(`Your aggregate strike rate is ${agg.strikeRate} across ${agg.matches} reflection${agg.matches === 1 ? '' : 's'}. Healthy T20 tempo — push it toward 130+ by scoring earlier in the innings, not by hitting harder.`);
    } else if (agg.strikeRate >= 75) {
      lines.push(`Aggregate strike rate ${agg.strikeRate} — solid but conservative. You're getting balls in but leaving runs on the table. Plan a scoring option for every ball before the bowler runs in.`);
    } else {
      lines.push(`Aggregate strike rate ${agg.strikeRate} — too slow. Watch the dot balls; every dot is pressure you're handing back. Use the Dot Ball Destroyer tactics — Drop and Run, Shuffle and Clip.`);
    }
  }

  // 2. Cross-competition delta — if there's a meaningful gap between
  // competitions, surface it. Often the most actionable single insight
  // because it tells the player what to bring from one format to another.
  const formats = competitionStats.filter((s) => s.strikeRate !== null && s.matches >= 1);
  if (formats.length >= 2) {
    const sorted = [...formats].sort((a, b) => (b.strikeRate ?? 0) - (a.strikeRate ?? 0));
    const high = sorted[0];
    const low = sorted[sorted.length - 1];
    const gap = (high.strikeRate ?? 0) - (low.strikeRate ?? 0);
    if (gap >= 25 && high.key !== low.key) {
      lines.push(`You strike at ${high.strikeRate} in ${high.label} but only ${low.strikeRate} in ${low.label} — that's a ${Math.round(gap)}-point gap. Take the intent from ${high.label} into your next ${low.label} innings; the bowling difference doesn't justify that gap.`);
    }
  }

  // 3. Dot ball % — second-tier KPI, key for tempo
  if (agg.dotBallPercent !== null) {
    if (agg.dotBallPercent > 50) {
      lines.push(`Dot ball % is ${agg.dotBallPercent}% — over half your balls aren't scoring. The single is the cheapest run in cricket. Drop and Run, Shuffle and Clip, Late Dab — pick one per over.`);
    } else if (agg.dotBallPercent > 40) {
      lines.push(`Dot ball % is ${agg.dotBallPercent}% — slightly above the 40% threshold. Tighten rotation in the next innings; a single off every other ball flips the pressure back on the bowler.`);
    }
  }

  // 4. Dismissal pattern — the "fix this or it'll happen again" line
  if (topDismissal && topDismissal.count >= 2) {
    lines.push(`You've been dismissed "${topDismissal.dismissal}" ${topDismissal.count} times. That's not luck — it's a pattern. Before your next innings, walk through what you'll do differently against the kind of ball that gets you out this way.`);
  }

  // 5. Mistake pattern — slightly softer than dismissal pattern
  if (topMistake && topMistake.count >= 2 && (!topDismissal || topDismissal.count < topMistake.count)) {
    lines.push(`Recurring mistake: "${topMistake.mistake}" — ${topMistake.count} times across recent reflections. Make this the one thing you fix in your next innings; everything else follows.`);
  }

  // 6. Bowler style pattern — only surfaces if the player has been
  // tracking bowler types and a clear pattern emerges.
  if (topBowlerStyle && topBowlerStyle.count >= 2) {
    const armLabel = topBowlerStyle.arm === 'any' ? '' : `${topBowlerStyle.arm}-arm `;
    lines.push(`${topBowlerStyle.count} of your recent dismissals were to ${armLabel}${topBowlerStyle.style} bowlers. That's the bowler type to mentally rehearse against before next match — visualise the line, plan your release shot.`);
  }

  // ── Rallying cue — one short sentence, the "north star" mindset ──
  let goIntoNextMatchWith = 'Trust your plan. Score with intent. Bounce back fast.';
  if (agg.strikeRate !== null && agg.strikeRate < 75) {
    goIntoNextMatchWith = 'Rotate first, boundary second. Every ball is a chance.';
  } else if (topDismissal && topDismissal.count >= 2) {
    goIntoNextMatchWith = 'You know the pattern. Break it. New ball, new innings, new response.';
  } else if (agg.strikeRate !== null && agg.strikeRate >= 130) {
    goIntoNextMatchWith = 'Same intent. Same tempo. The runs are already on their way.';
  } else if (formats.length >= 2 && lines.some((l) => l.includes('-point gap'))) {
    goIntoNextMatchWith = 'Bring your best format into every format. The opposition doesn\'t dictate your tempo — you do.';
  }

  return { coachReview: lines, goIntoNextMatchWith };
}

// ── Main entry ───────────────────────────────────────────────────

export function generateNextMatchInsight(reflections: readonly NextMatchReflectionInput[]): NextMatchInsight {
  // Exclude reflections without a real match link (matchIndex === 99
  // is the "I want to reflect without a match" placeholder).
  const matchRefs = reflections.filter((r) => r.matchIndex !== 99);

  // Per-competition aggregation.
  const byKey: Record<CompetitionStats['key'], CompetitionStats> = {
    LPL: emptyStats('LPL'),
    LCL: emptyStats('LCL'),
    Practice: emptyStats('Practice'),
    Other: emptyStats('Other'),
  };
  const intentByKey: Record<CompetitionStats['key'], { sum: number; count: number }> = {
    LPL: { sum: 0, count: 0 },
    LCL: { sum: 0, count: 0 },
    Practice: { sum: 0, count: 0 },
    Other: { sum: 0, count: 0 },
  };

  // Aggregated across everything.
  let aggRuns = 0;
  let aggBalls = 0;
  let aggDots = 0;
  let aggMatches = 0;
  let aggIntentSum = 0;
  let aggIntentCount = 0;

  // Pattern counters.
  const mistakeCounts: Record<string, number> = {};
  const dismissalCounts: Record<string, number> = {};
  const bowlerStyleCounts: Record<string, { arm: 'right' | 'left' | 'any'; style: NonNullable<NextMatchReflectionInput['dismissalBowlerStyle']>; count: number }> = {};

  for (const r of matchRefs) {
    const key = detectCompetition(r.match);
    const slot = byKey[key];
    slot.matches += 1;
    aggMatches += 1;

    if (r.runsScored !== undefined) {
      slot.runs += r.runsScored;
      aggRuns += r.runsScored;
    }
    if (r.ballsFaced !== undefined) {
      slot.balls += r.ballsFaced;
      aggBalls += r.ballsFaced;
    }
    if (r.dotBallsFaced !== undefined) {
      slot.dotBalls += r.dotBallsFaced;
      aggDots += r.dotBallsFaced;
    }

    if (typeof r.intentScore === 'number') {
      intentByKey[key].sum += r.intentScore;
      intentByKey[key].count += 1;
      aggIntentSum += r.intentScore;
      aggIntentCount += 1;
    }

    // Mistakes
    for (const w of r.whatWentWrong) {
      mistakeCounts[w] = (mistakeCounts[w] || 0) + 1;
    }
    // Dismissals — only "real" outs, not Not out / Did not bat
    const outs = Array.isArray(r.howGotOut) ? r.howGotOut : r.howGotOut ? [r.howGotOut] : [];
    for (const o of outs) {
      if (o === 'Not out' || o === 'Did not bat' || !o) continue;
      dismissalCounts[o] = (dismissalCounts[o] || 0) + 1;
    }
    // Bowler style (only when player has captured it on the dismissal)
    if (r.dismissalBowlerStyle) {
      const arm = r.dismissalBowlerArm ?? 'any';
      const k = `${arm}::${r.dismissalBowlerStyle}`;
      const existing = bowlerStyleCounts[k];
      if (existing) {
        existing.count += 1;
      } else {
        bowlerStyleCounts[k] = { arm, style: r.dismissalBowlerStyle, count: 1 };
      }
    }
  }

  // Finalise per-competition stats.
  const competitionStats: CompetitionStats[] = (['LPL', 'LCL', 'Practice', 'Other'] as const)
    .map((k) => finalise(byKey[k], intentByKey[k].sum, intentByKey[k].count))
    .filter((s) => s.matches > 0);

  // Finalise aggregate.
  const aggregate = finalise(
    {
      key: 'Other',
      label: 'All competitions',
      matches: aggMatches,
      runs: aggRuns,
      balls: aggBalls,
      strikeRate: null,
      runsPer10Balls: null,
      dotBalls: aggDots,
      dotBallPercent: null,
      intentAvg: null,
    },
    aggIntentSum,
    aggIntentCount,
  );
  // Override key + label so callers can distinguish the aggregate row.
  aggregate.label = 'All competitions';

  // Top patterns.
  const topMistakeEntry = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1])[0];
  const topDismissalEntry = Object.entries(dismissalCounts).sort((a, b) => b[1] - a[1])[0];
  const topBowlerStyleEntry = Object.values(bowlerStyleCounts).sort((a, b) => b.count - a.count)[0];

  const topMistakePattern = topMistakeEntry ? { mistake: topMistakeEntry[0], count: topMistakeEntry[1] } : null;
  const topDismissalPattern = topDismissalEntry ? { dismissal: topDismissalEntry[0], count: topDismissalEntry[1] } : null;
  const topBowlerStyle = topBowlerStyleEntry ?? null;

  const { coachReview, goIntoNextMatchWith } = buildCoachReview(
    aggregate,
    competitionStats,
    topMistakePattern,
    topDismissalPattern,
    topBowlerStyle,
  );

  return {
    competitionStats,
    aggregate,
    topDismissalPattern,
    topMistakePattern,
    topBowlerStyle,
    coachReview,
    goIntoNextMatchWith,
  };
}
