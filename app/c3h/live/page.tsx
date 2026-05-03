"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import {
  collection, query, where, orderBy, onSnapshot, doc as docRef,
  type Unsubscribe,
} from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import { Match, getOversBalls, getRunRate, getRequiredRunRate } from '../scorer/types';

// Read-only live scoreboard. Members can watch a match in progress
// without taking over the scorer slot. Real-time via Firestore
// onSnapshot — updates appear within ~1 second of the scorer's tap.

export default function LiveScorePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [openMatches, setOpenMatches] = useState<Match[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  // Subscribe to all in-progress matches (live list).
  useEffect(() => {
    if (!session?.user?.email) return;
    const q = query(
      collection(db, 'matches'),
      where('status', 'in', ['playing', 'innings_break']),
      orderBy('updatedAt', 'desc'),
    );
    const unsub: Unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as Match[];
      setOpenMatches(list);
      setLoading(false);
      // Auto-select if exactly one match is live
      if (!selectedId && list.length === 1) setSelectedId(list[0].id);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  // Subscribe to the selected match document for real-time updates.
  useEffect(() => {
    if (!selectedId) { setMatch(null); return; }
    const unsub: Unsubscribe = onSnapshot(docRef(db, 'matches', selectedId), (snap) => {
      if (snap.exists()) setMatch({ id: snap.id, ...(snap.data() as object) } as Match);
    });
    return () => unsub();
  }, [selectedId]);

  if (status === 'loading') {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-primary-400">Loading…</div></div>;
  }
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />
      <section className="section-padding pt-32 md:pt-36">
        <div className="max-w-4xl mx-auto px-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Live Scoring</h1>
              <p className="text-gray-500 text-sm mt-1">Read-only view — updates as the scorer taps each ball.</p>
            </div>
            <Link href="/c3h/dashboard" className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10">← Dashboard</Link>
          </div>

          {/* Match list (when multiple, or none selected) */}
          {!selectedId && (
            <div className="space-y-3">
              {loading && <p className="text-gray-500 text-sm">Looking for live matches…</p>}
              {!loading && openMatches.length === 0 && (
                <div className="glass rounded-2xl p-8 text-center border border-white/5">
                  <p className="text-gray-400">No matches in progress right now.</p>
                  <p className="text-gray-600 text-xs mt-2">When a captain or designated scorer starts scoring on the Scorer page, the match will appear here automatically.</p>
                </div>
              )}
              {openMatches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id!)}
                  className="w-full glass rounded-2xl p-5 border border-white/5 hover:border-primary-500/40 transition-all text-left"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-bold">{m.team1} <span className="text-gray-500">vs</span> {m.team2}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {m.matchLabel || m.matchType} · {m.venue || 'venue TBD'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary-400 text-xs font-semibold">View live →</p>
                      <p className="text-gray-600 text-[10px] mt-1">
                        Last update {m.updatedAt ? new Date(m.updatedAt).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true }) : '—'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected match scoreboard */}
          {selectedId && match && <ScoreboardView match={match} onBack={() => setSelectedId(null)} />}

        </div>
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Scoreboard view — renders the active innings cleanly
// ────────────────────────────────────────────────────────────────

function ScoreboardView({ match, onBack }: { match: Match; onBack: () => void }) {
  const innings = match.currentInnings === 1 ? match.innings1 : match.innings2;
  const otherInnings = match.currentInnings === 1 ? match.innings2 : match.innings1;
  const oversBalls = getOversBalls(innings.totalBalls);
  const runRate = getRunRate(innings.totalRuns, innings.totalBalls);

  // Target + RRR (only on 2nd innings)
  const target = match.currentInnings === 2 ? otherInnings.totalRuns + 1 : null;
  const ballsRemaining = match.totalOvers * 6 - innings.totalBalls;
  const requiredRate = target !== null
    ? getRequiredRunRate(target, innings.totalRuns, ballsRemaining)
    : null;

  // Last 6 balls
  const last6 = innings.balls.slice(-6);

  return (
    <div className="space-y-4">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-xs text-gray-400 hover:text-white">← All live matches</button>
        <span className="text-xs text-gray-600">
          Scorer: <span className="text-gray-400">{match.scorer?.split('@')[0] || '—'}</span> · Updates live
        </span>
      </div>

      {/* Match header */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{match.matchLabel || match.matchType}</p>
        <h2 className="text-2xl font-bold text-white">{match.team1} <span className="text-gray-500 text-lg">vs</span> {match.team2}</h2>
        <p className="text-gray-500 text-xs mt-2">{match.venue || 'venue TBD'} · {match.totalOvers} overs · {match.maxWickets} wickets</p>
      </div>

      {/* Score block */}
      <div className="glass rounded-2xl p-6 border-2 border-primary-500/30">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{innings.battingTeam} batting</p>
        <div className="flex items-baseline gap-3 mb-3">
          <p className="text-5xl font-bold text-white tabular-nums">{innings.totalRuns}</p>
          <p className="text-2xl text-gray-400">/{innings.totalWickets}</p>
          <p className="text-gray-500 text-sm ml-auto tabular-nums">({oversBalls} / {match.totalOvers}.0 ov)</p>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5 text-sm">
          <div>
            <p className="text-gray-500 text-[10px] uppercase">Run rate</p>
            <p className="text-white font-bold tabular-nums">{runRate}</p>
          </div>
          {target !== null && (
            <>
              <div>
                <p className="text-gray-500 text-[10px] uppercase">Target</p>
                <p className="text-accent-400 font-bold tabular-nums">{target}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase">Req rate</p>
                <p className="text-accent-400 font-bold tabular-nums">{requiredRate}</p>
              </div>
            </>
          )}
          {target === null && (
            <>
              <div>
                <p className="text-gray-500 text-[10px] uppercase">Extras</p>
                <p className="text-white font-bold tabular-nums">
                  {innings.extras.wides + innings.extras.noballs + innings.extras.byes + innings.extras.legbyes + innings.extras.penalty}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase">Innings</p>
                <p className="text-white font-bold tabular-nums">{match.currentInnings} of 2</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Current batters + bowler */}
      <div className="glass rounded-2xl p-5 border border-white/5">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">At the crease</p>
        <div className="space-y-2 text-sm">
          {innings.currentBatter1 && (
            <p className="text-white"><span className="text-primary-400 mr-2">●</span>{innings.currentBatter1}</p>
          )}
          {innings.currentBatter2 && (
            <p className="text-white"><span className="text-gray-600 mr-2">●</span>{innings.currentBatter2}</p>
          )}
          {!innings.currentBatter1 && !innings.currentBatter2 && (
            <p className="text-gray-500 text-xs italic">Waiting for openers…</p>
          )}
        </div>
        {innings.currentBowler && (
          <>
            <p className="text-gray-500 text-xs uppercase tracking-wider mt-4 mb-2">Bowling</p>
            <p className="text-white text-sm">{innings.currentBowler}</p>
          </>
        )}
      </div>

      {/* Last 6 balls */}
      <div className="glass rounded-2xl p-5 border border-white/5">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Last 6 balls</p>
        {last6.length === 0 ? (
          <p className="text-gray-500 text-xs italic">No balls bowled yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {last6.map((b, i) => {
              let label = String(b.runs);
              let cls = 'bg-white/5 text-gray-300 border-white/10';
              if (b.isWicket) { label = 'W'; cls = 'bg-red-500/20 text-red-400 border-red-500/30'; }
              else if (b.runs === 4) { label = '4'; cls = 'bg-primary-500/20 text-primary-400 border-primary-500/30'; }
              else if (b.runs === 6) { label = '6'; cls = 'bg-accent-500/20 text-accent-400 border-accent-500/30'; }
              else if (b.extraType) { label = `${b.runs}${b.extraType[0].toUpperCase()}`; cls = 'bg-blue-500/20 text-blue-400 border-blue-500/30'; }
              return (
                <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${cls} tabular-nums`}>
                  {label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Match status */}
      {match.status === 'innings_break' && (
        <div className="glass rounded-2xl p-5 border-2 border-accent-500/40 bg-accent-500/5">
          <p className="text-accent-400 font-bold">Innings break</p>
          <p className="text-gray-400 text-sm mt-1">Waiting for second innings to begin…</p>
        </div>
      )}
    </div>
  );
}
