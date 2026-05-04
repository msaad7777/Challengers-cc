"use client";

// Match Summary card — shown for completed matches on /c3h/live and
// /c3h/scorer scorecard view. Surfaces MVP, Best Batter, Best Bowler,
// Best Fielder, and a top-3 impact leaderboard.

import { useState } from 'react';
import type { Match } from '../scorer/types';
import {
  getMVP, getBestBatter, getBestBowler, getBestFielder, getMatchImpact,
  formatMatchShareText,
} from './matchStats';

export default function MatchSummary({ match }: { match: Match }) {
  const [shareNote, setShareNote] = useState<string | null>(null);

  if (match.status !== 'completed' && match.innings1.balls.length === 0) return null;

  const mvp = getMVP(match);
  const bestBat = getBestBatter(match);
  const bestBowl = getBestBowler(match);
  const bestField = getBestFielder(match);
  const top3 = getMatchImpact(match).slice(0, 3);

  const handleShare = async () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://challengerscc.ca';
    const text = formatMatchShareText(match, baseUrl);
    const title = `${match.team1} vs ${match.team2} — Scorecard`;
    // Web Share API is the right tool on mobile (native share sheet).
    // Falls back to clipboard on desktop / unsupported browsers.
    try {
      const nav = typeof navigator !== 'undefined' ? navigator : null;
      if (nav?.share) {
        await nav.share({ title, text });
        setShareNote('Shared');
      } else if (nav?.clipboard) {
        await nav.clipboard.writeText(text);
        setShareNote('Copied to clipboard');
      } else {
        throw new Error('No share / clipboard API available');
      }
    } catch (err) {
      // User cancelled the share sheet or clipboard write failed.
      // Either way we don't surface an error — the share sheet's
      // own "Cancel" UX is enough.
      const aborted = (err as { name?: string })?.name === 'AbortError';
      if (!aborted) setShareNote('Could not share');
    }
    if (shareNote) setTimeout(() => setShareNote(null), 2500);
  };

  const ytEmbed = (() => {
    if (!match.replayUrl) return null;
    // Accept both watch?v= and youtu.be/ formats.
    const m1 = match.replayUrl.match(/[?&]v=([^&]+)/);
    if (m1) return `https://www.youtube.com/embed/${m1[1]}`;
    const m2 = match.replayUrl.match(/youtu\.be\/([^?&]+)/);
    if (m2) return `https://www.youtube.com/embed/${m2[1]}`;
    return null;
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 mt-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h3 className="text-lg font-bold text-white">Match Summary</h3>
        </div>
        <button
          onClick={handleShare}
          className="px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-bold border border-primary-500/30 hover:bg-primary-500/30 transition-all"
        >
          📤 Share
        </button>
      </div>
      {shareNote && (
        <p className="text-xs text-primary-400 text-right">{shareNote}</p>
      )}

      {match.result && (
        <div className="glass rounded-2xl p-5 border-2 border-primary-500/30 bg-primary-500/5">
          <p className="text-primary-400 text-xs uppercase tracking-wider mb-1">Result</p>
          <p className="text-white font-bold text-lg">{match.result}</p>
        </div>
      )}

      {/* Match replay — only shown when the scorer has attached a
          highlights / full-match URL on the scorecard view. Embedded
          inline if it's a YouTube link we can parse; otherwise just
          render an external "Watch" button. */}
      {match.replayUrl && (
        <div className="glass rounded-2xl p-4 border border-red-500/20">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-red-400 text-xs uppercase tracking-wider font-bold">📺 Match Replay</p>
            <a
              href={match.replayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-red-400 underline"
            >
              Open on YouTube ↗
            </a>
          </div>
          {ytEmbed ? (
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={ytEmbed}
                title="Match replay"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            <a
              href={match.replayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 text-center rounded-lg bg-red-500/10 text-red-400 text-sm font-bold border border-red-500/30 hover:bg-red-500/20"
            >
              ▶ Watch the Match
            </a>
          )}
        </div>
      )}

      {/* MVP */}
      {mvp && mvp.totalPts > 0 && (
        <div className="glass rounded-2xl p-5 border-2 border-accent-500/40 bg-gradient-to-br from-accent-500/10 to-yellow-500/5">
          <div className="flex items-start gap-3">
            <span className="text-4xl">🥇</span>
            <div className="flex-1 min-w-0">
              <p className="text-accent-400 text-xs uppercase tracking-wider mb-1">Most Valuable Player</p>
              <p className="text-white text-2xl font-bold truncate">{mvp.name}</p>
              <p className="text-accent-300 text-sm mt-1 tabular-nums">
                {mvp.totalPts} pts
                <span className="text-gray-500 ml-2 text-xs">
                  ({mvp.battingPts > 0 && `bat ${mvp.battingPts}`}{mvp.bowlingPts > 0 && ` · bowl ${mvp.bowlingPts}`}{mvp.fieldingPts > 0 && ` · field ${mvp.fieldingPts}`})
                </span>
              </p>
              {/* Quick narrative */}
              <p className="text-gray-400 text-xs mt-2">
                {mvp.battingPerf && mvp.battingPerf.runs > 0 && (
                  <span>{mvp.battingPerf.runs}({mvp.battingPerf.balls}) </span>
                )}
                {mvp.bowlingPerf && mvp.bowlingPerf.wickets > 0 && (
                  <span>· {mvp.bowlingPerf.wickets}/{mvp.bowlingPerf.runs} in {mvp.bowlingPerf.oversDisplay} </span>
                )}
                {mvp.fieldingPerf && (mvp.fieldingPerf.catches + mvp.fieldingPerf.stumpings + mvp.fieldingPerf.runOuts) > 0 && (
                  <span>· {mvp.fieldingPerf.catches}c {mvp.fieldingPerf.stumpings > 0 ? `${mvp.fieldingPerf.stumpings}st ` : ''}{mvp.fieldingPerf.runOuts > 0 ? `${mvp.fieldingPerf.runOuts}ro` : ''}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Best of categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {bestBat && bestBat.runs > 0 && (
          <div className="glass rounded-xl p-4 border border-primary-500/20">
            <p className="text-primary-400 text-[10px] uppercase tracking-wider mb-1">🏏 Best Batter</p>
            <p className="text-white font-bold truncate">{bestBat.name}</p>
            <p className="text-gray-300 text-sm tabular-nums mt-0.5">
              {bestBat.runs}({bestBat.balls})
            </p>
            <p className="text-gray-500 text-[10px] mt-1 tabular-nums">
              SR {bestBat.sr.toFixed(1)} · 4×{bestBat.fours} · 6×{bestBat.sixes}
            </p>
          </div>
        )}
        {bestBowl && bestBowl.wickets > 0 && (
          <div className="glass rounded-xl p-4 border border-red-500/20">
            <p className="text-red-400 text-[10px] uppercase tracking-wider mb-1">🎯 Best Bowler</p>
            <p className="text-white font-bold truncate">{bestBowl.name}</p>
            <p className="text-gray-300 text-sm tabular-nums mt-0.5">
              {bestBowl.wickets}/{bestBowl.runs} · {bestBowl.oversDisplay} ov
            </p>
            <p className="text-gray-500 text-[10px] mt-1 tabular-nums">
              Econ {bestBowl.economy.toFixed(2)} · {bestBowl.dots} dots
            </p>
          </div>
        )}
        {bestField && (bestField.catches + bestField.stumpings + bestField.runOuts) > 0 && (
          <div className="glass rounded-xl p-4 border border-blue-500/20">
            <p className="text-blue-400 text-[10px] uppercase tracking-wider mb-1">🧤 Best Fielder</p>
            <p className="text-white font-bold truncate">{bestField.name}</p>
            <p className="text-gray-300 text-sm tabular-nums mt-0.5">
              {bestField.catches > 0 && `${bestField.catches} catch${bestField.catches !== 1 ? 'es' : ''} `}
              {bestField.stumpings > 0 && `· ${bestField.stumpings} st `}
              {bestField.runOuts > 0 && `· ${bestField.runOuts} run-out${bestField.runOuts !== 1 ? 's' : ''}`}
            </p>
          </div>
        )}
      </div>

      {/* Top 3 impact leaderboard */}
      {top3.length > 1 && (
        <div className="glass rounded-2xl p-5 border border-white/10">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Top 3 Impact</p>
          <div className="space-y-2">
            {top3.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between gap-2 py-1.5 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl flex-shrink-0">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <p className="text-white font-semibold truncate">{p.name}</p>
                </div>
                <p className="text-accent-400 font-bold tabular-nums whitespace-nowrap">{p.totalPts} pts</p>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-[10px] mt-3 italic">
            Impact = Batting + Bowling + Fielding points (CricHeroes-style formula)
          </p>
        </div>
      )}
    </div>
  );
}
