"use client";

// Public live-score widget — visible to anyone on the internet, no
// auth required. Subscribes to Firestore `matches` collection where
// status is 'playing' or 'innings_break' and renders a compact score
// banner that auto-updates within ~1 second of every ball the scorer
// taps.
//
// Requires Firestore Security Rules to permit public reads on
// matches with status in ['playing', 'innings_break'] — see notes
// in the deploy checklist.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import {
  collection, query, where, orderBy, onSnapshot, limit,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Match } from '@/app/c3h/scorer/types';
import { getOversBalls, getRunRate, getRequiredRunRate } from '@/app/c3h/scorer/types';

export default function PublicLiveScore() {
  const [match, setMatch] = useState<Match | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'matches'),
      where('status', 'in', ['playing', 'innings_break']),
      orderBy('updatedAt', 'desc'),
      limit(1),
    );
    const unsub: Unsubscribe = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) { setMatch(null); return; }
        const d = snap.docs[0];
        setMatch({ id: d.id, ...(d.data() as object) } as Match);
        setError(null);
      },
      (err) => {
        // Most likely cause: Firestore security rules block public reads.
        // Render nothing so we don't show a broken state to visitors.
        console.warn('Live score subscription failed:', err.message);
        setError(err.message);
      },
    );
    return () => unsub();
  }, []);

  // No live match? Render nothing — keep the page clean.
  if (!match || error) return null;

  const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;
  const otherInnings = match.currentInnings === 1 ? match.innings2 : match.innings1;
  const oversBalls = getOversBalls(innings.totalBalls);
  const runRate = getRunRate(innings.totalRuns, innings.totalBalls);

  const target = match.currentInnings === 2 ? otherInnings.totalRuns + 1 : null;
  const ballsRemaining = match.totalOvers * 6 - innings.totalBalls;
  const requiredRate = target !== null
    ? getRequiredRunRate(target, innings.totalRuns, ballsRemaining)
    : null;

  const last6 = innings.balls.slice(-6);

  return (
    <Link
      href="/c3h/live"
      className="block w-full max-w-7xl mx-auto px-4 mb-6"
    >
      <div className="glass rounded-2xl p-4 md:p-5 border-2 border-red-500/40 bg-red-500/5 hover:border-red-500/60 transition-all">
        <div className="flex items-start gap-3 md:gap-4">
          {/* Pulsing live indicator */}
          <div className="flex-shrink-0 pt-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>

          {/* Score block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Live Now</span>
              {match.status === 'innings_break' && (
                <span className="text-[10px] font-bold text-accent-400 uppercase tracking-wider">· Innings Break</span>
              )}
              <span className="text-[10px] text-gray-500 ml-auto hidden sm:inline">{match.matchLabel || match.matchType} {match.venue ? `· ${match.venue}` : ''}</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-white font-bold text-base md:text-lg truncate">{innings.battingTeam}</span>
              <span className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                {innings.totalRuns}<span className="text-gray-400 text-lg">/{innings.totalWickets}</span>
              </span>
              <span className="text-gray-500 text-xs md:text-sm tabular-nums">
                ({oversBalls} / {match.totalOvers}.0 ov)
              </span>
              <span className="text-gray-500 text-xs hidden sm:inline">
                · vs {innings.bowlingTeam}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">
              <span className="text-gray-500">RR <span className="text-white font-semibold tabular-nums">{runRate}</span></span>
              {target !== null && (
                <>
                  <span className="text-gray-500">Target <span className="text-accent-400 font-semibold tabular-nums">{target}</span></span>
                  <span className="text-gray-500">RRR <span className="text-accent-400 font-semibold tabular-nums">{requiredRate}</span></span>
                </>
              )}
              {last6.length > 0 && (
                <span className="text-gray-500 ml-auto flex items-center gap-1">
                  Last:
                  <span className="flex gap-1 ml-1">
                    {last6.map((b, i) => {
                      let label = String(b.runs);
                      let cls = 'bg-white/5 text-gray-300';
                      if (b.isWicket) { label = 'W'; cls = 'bg-red-500/20 text-red-400'; }
                      else if (b.runs === 4) { label = '4'; cls = 'bg-primary-500/20 text-primary-400'; }
                      else if (b.runs === 6) { label = '6'; cls = 'bg-accent-500/20 text-accent-400'; }
                      else if (b.extraType) { cls = 'bg-blue-500/20 text-blue-400'; }
                      return <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums ${cls}`}>{label}</span>;
                    })}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0 text-right hidden md:block">
            <span className="text-xs text-red-400 font-semibold">View full →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
