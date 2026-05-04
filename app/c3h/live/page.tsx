"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { db } from '@/lib/firebase';
import {
  collection, query, where, onSnapshot, doc as docRef, deleteDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import { isC3HAdmin } from '@/lib/c3h-access';
import {
  Match, Innings,
  getOversBalls, getRunRate, getRequiredRunRate,
  getBattingStats, getBowlingStats,
} from '../scorer/types';
import MatchSummary from '../lib/MatchSummary';

// Read-only live scoreboard — open to anyone on the internet, no
// authentication required. Subscribes to Firestore via onSnapshot
// so the score updates within ~1 second of every ball the scorer
// taps. Requires Firestore Security Rules to allow public reads
// on matches with status in ['playing', 'innings_break',
// 'completed'].

export default function LiveScorePage() {
  // useSearchParams needs a Suspense boundary in Next 15 App Router.
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LiveScorePageInner />
    </Suspense>
  );
}

function LiveScorePageInner() {
  const { data: session } = useSession();
  const userIsAdmin = isC3HAdmin(session?.user?.email);
  // Deep-link support: /c3h/live?id=<matchId> jumps straight to that
  // match (works for completed matches too — Firestore doc subscribe
  // doesn't care about status). Used by the Share button on
  // MatchSummary so a single tap from a chat opens the right match.
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get('id');
  const [openMatches, setOpenMatches] = useState<Match[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(idFromUrl);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin-only delete from this page. Confirms before deletion.
  const handleDelete = async (m: Match, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = window.confirm(
      `Delete this match permanently?\n\n${m.team1} vs ${m.team2}\nLast update ${m.updatedAt ? new Date(m.updatedAt).toLocaleString() : '—'}\n\nThis cannot be undone. The match will disappear from /c3h/live for everyone.`,
    );
    if (!ok) return;
    try {
      await deleteDoc(docRef(db, 'matches', m.id));
      // onSnapshot will auto-update the list within ~1 sec
    } catch (err) {
      console.error('Delete failed:', err);
      const code = (err as { code?: string })?.code || '';
      const msg = (err as Error)?.message || 'Unknown error';
      let hint = '';
      if (code === 'permission-denied' || msg.toLowerCase().includes('permission')) {
        hint = '\n\nFirestore rules are blocking the delete. Open Firebase Console → Firestore → Rules and confirm the matches collection write rule is published correctly.';
      }
      window.alert(`Could not delete the match.\n\nError: ${msg}${hint}`);
    }
  };

  // Where to send the user when they tap "Continue scoring" on a
  // SPECIFIC match. Includes the matchId so the scorer can auto-load
  // and open that match (with takeover modal if someone else is
  // currently scoring it). Login redirect preserves the destination.
  const continueScoringHrefFor = (matchId?: string) => {
    if (!matchId) return session ? '/c3h/scorer' : '/c3h/login';
    return session
      ? `/c3h/scorer?match=${matchId}`
      : `/c3h/login?callbackUrl=${encodeURIComponent(`/c3h/scorer?match=${matchId}`)}`;
  };

  // Subscribe to all in-progress matches (live list).
  useEffect(() => {
    // No orderBy — avoids a composite-index requirement. We sort
    // client-side by updatedAt below.
    const q = query(
      collection(db, 'matches'),
      where('status', 'in', ['playing', 'innings_break']),
    );
    const unsub: Unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as Match[];
        list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        setOpenMatches(list);
        setLoading(false);
        setError(null);
        // Auto-select the most-recently-updated match — there's only
        // one truly live match at a time, even if stale drafts exist.
        if (!selectedId && list.length > 0) setSelectedId(list[0].id);
      },
      (err) => {
        console.error('Live match query failed:', err);
        setError(err.message || 'Failed to load matches');
        setLoading(false);
      },
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to the selected match document for real-time updates.
  useEffect(() => {
    if (!selectedId) { setMatch(null); return; }
    const unsub: Unsubscribe = onSnapshot(docRef(db, 'matches', selectedId), (snap) => {
      if (snap.exists()) setMatch({ id: snap.id, ...(snap.data() as object) } as Match);
    });
    return () => unsub();
  }, [selectedId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />
      <section className="section-padding pt-32 md:pt-36">
        <div className="max-w-4xl mx-auto px-4">

          {/* Header — status-aware. The selected match might be live OR
              completed (deep-link via ?id=…), so the badge/title/sub
              all reflect the actual match state instead of always
              advertising "Live Scoring". */}
          {(() => {
            const isCompleted = match?.status === 'completed';
            return (
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    {isCompleted ? (
                      <>
                        <span className="text-base">🏆</span>
                        <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">Match Complete</span>
                      </>
                    ) : (
                      <>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
                      </>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">
                    {isCompleted ? 'Match Scorecard' : 'Live Scoring'}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {isCompleted
                      ? 'Read-only scorecard with MVP, best-of, and the full per-innings detail.'
                      : 'Read-only view — updates as the scorer taps each ball.'}
                  </p>
                </div>
                <Link href="/c3h/dashboard" className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10">← Dashboard</Link>
              </div>
            );
          })()}

          {/* Single live match — auto-selects the most-recently-updated
              match in playing/innings_break. No multi-match list. */}
          {!selectedId && (
            <div className="space-y-3">
              {loading && <p className="text-gray-500 text-sm">Looking for the live match…</p>}
              {error && (
                <div className="glass rounded-2xl p-6 border-2 border-red-500/40 bg-red-500/5">
                  <p className="text-red-400 font-bold text-sm mb-2">⚠️ Could not load live match</p>
                  <p className="text-gray-300 text-xs mb-3 font-mono break-all">{error}</p>
                  <p className="text-gray-400 text-xs">
                    Most common cause: <strong>Firestore Security Rules</strong> are not yet published, or are blocking reads.
                  </p>
                </div>
              )}
              {!loading && !error && openMatches.length === 0 && (
                <div className="glass rounded-2xl p-8 text-center border border-white/5">
                  <p className="text-gray-400 font-bold">No live match right now</p>
                  <p className="text-gray-600 text-xs mt-2">When a scorer starts a match, it will appear here automatically.</p>
                  {session && (
                    <Link href="/c3h/scorer" className="inline-block mt-4 px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 border border-primary-500/30 text-sm font-semibold hover:bg-primary-500/30">
                      🏏 Start a match →
                    </Link>
                  )}
                </div>
              )}
              {/* Auto-select happens in the onSnapshot callback above —
                  the most-recently-updated match is selected automatically
                  on first load. The user lands directly on the scoreboard
                  with no list-of-matches step. */}

              {/* Admin maintenance — visible only to admins when stale
                  drafts exist. Lets them clean up without leaving this
                  page. */}
              {userIsAdmin && openMatches.length > 1 && (
                <div className="glass rounded-2xl p-5 border-2 border-amber-500/30 bg-amber-500/5 mt-6">
                  <p className="text-amber-400 text-xs uppercase tracking-wider font-bold mb-2">
                    ⚠️ {openMatches.length} matches in progress
                  </p>
                  <p className="text-gray-300 text-sm mb-3">
                    Multiple matches are flagged as live. The most recent one is shown above. Older drafts probably need cleanup:
                  </p>
                  <div className="space-y-2">
                    {openMatches.slice(1).map((m) => (
                      <div key={m.id} className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-white/5">
                        <div className="min-w-0">
                          <p className="text-white text-sm truncate">{m.team1} vs {m.team2}</p>
                          <p className="text-gray-600 text-[10px]">
                            Last update {m.updatedAt ? new Date(m.updatedAt).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : '—'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDelete(m, e)}
                          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-gray-500/15 text-gray-400 border border-gray-500/30 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30 text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Selected match scoreboard */}
          {selectedId && match && (
            <ScoreboardView
              match={match}
              onBack={() => setSelectedId(null)}
              continueScoringHref={continueScoringHrefFor(match.id)}
              isLoggedIn={!!session}
            />
          )}

        </div>
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Scoreboard view — renders the active innings cleanly
// ────────────────────────────────────────────────────────────────

function ScoreboardView({ match, onBack, continueScoringHref, isLoggedIn }: {
  match: Match;
  onBack: () => void;
  continueScoringHref: string;
  isLoggedIn: boolean;
}) {
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button onClick={onBack} className="text-xs text-gray-400 hover:text-white">← All live matches</button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">
            Scorer: <span className="text-gray-400">{match.scorer?.split('@')[0] || '—'}</span>
            {match.status === 'completed' ? ' · Match complete' : ' · Updates live'}
          </span>
          {/* Action button — context-dependent. The "Take Over /
              Sign in to Score" CTA only makes sense for live matches.
              On a completed match, hide it for public viewers (no
              scoring to do, and the red CTA is confusing in a result
              context) and downgrade to a quiet "Edit Scorecard" link
              for logged-in scorers who may need to fix a dismissal,
              attach a replay URL, or rename a player. */}
          {match.status === 'completed' ? (
            isLoggedIn && (
              <Link
                href={continueScoringHref}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
              >
                ✏️ Edit Scorecard →
              </Link>
            )
          ) : (
            <Link
              href={continueScoringHref}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 font-semibold"
            >
              ✏️ {isLoggedIn ? 'Take Over Scoring →' : 'Sign in to Score →'}
            </Link>
          )}
        </div>
      </div>

      {/* Match header */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{match.matchLabel || match.matchType}</p>
        <h2 className="text-2xl font-bold text-white">{match.team1} <span className="text-gray-500 text-lg">vs</span> {match.team2}</h2>
        <p className="text-gray-500 text-xs mt-2">{match.venue || 'venue TBD'} · {match.totalOvers} overs · {match.maxWickets} wickets</p>
      </div>

      {/* Score block — completed matches show a "Final Score" card
          with both innings side-by-side + the result headline.
          Live matches keep the single-innings flow with target /
          required rate / extras / innings number. */}
      {match.status === 'completed' ? (
        <div className="glass rounded-2xl p-6 border-2 border-primary-500/40 bg-primary-500/5">
          <p className="text-primary-400 text-xs uppercase tracking-wider mb-3">Final Score</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[match.innings1, match.innings2].map((inn, i) => {
              if (inn.balls.length === 0) return null;
              const inOversBalls = `${Math.floor(inn.totalBalls / 6)}.${inn.totalBalls % 6}`;
              return (
                <div key={i}>
                  <p className="text-gray-500 text-[11px] uppercase tracking-wider truncate">{inn.battingTeam}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-bold text-white tabular-nums">{inn.totalRuns}</p>
                    <p className="text-lg text-gray-400">/{inn.totalWickets}</p>
                  </div>
                  <p className="text-gray-500 text-xs tabular-nums">({inOversBalls} ov)</p>
                </div>
              );
            })}
          </div>
          {match.result && (
            <div className="pt-3 border-t border-primary-500/20">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Result</p>
              <p className="text-primary-400 font-bold text-lg">🏆 {match.result}</p>
            </div>
          )}
        </div>
      ) : (
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
      )}

      {/* Current batters + bowler — only meaningful while a match is
          in flight. Completed matches don't have anyone "at the
          crease" any more, and the per-innings tables below already
          show every batter / bowler with their final figures. */}
      {match.status !== 'completed' && (
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
      )}

      {/* Last 6 balls — also live-only. */}
      {match.status !== 'completed' && (
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
      )}

      {/* Match Summary + MVP — only for completed matches */}
      {match.status === 'completed' && <MatchSummary match={match} />}

      {/* Full scorecard — current innings */}
      <ScorecardTables innings={innings} label={`${innings.battingTeam} — innings ${match.currentInnings}`} />

      {/* Other innings (if it has any balls) */}
      {otherInnings.balls.length > 0 && (
        <ScorecardTables innings={otherInnings} label={`${otherInnings.battingTeam} — innings ${match.currentInnings === 1 ? 2 : 1}`} />
      )}

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

// ────────────────────────────────────────────────────────────────
// Full scorecard tables — batting + bowling for one innings
// ────────────────────────────────────────────────────────────────

function ScorecardTables({ innings, label }: { innings: Innings; label: string }) {
  const batting = getBattingStats(innings);
  const bowling = getBowlingStats(innings);

  if (batting.length === 0 && bowling.length === 0) return null;

  const totalExtras =
    innings.extras.byes + innings.extras.legbyes + innings.extras.wides +
    innings.extras.noballs + innings.extras.penalty;

  return (
    <div className="space-y-3">
      <p className="text-gray-500 text-xs uppercase tracking-wider mt-4">{label}</p>

      {/* Batting */}
      {batting.length > 0 && (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="bg-white/5 px-4 py-2 flex items-center justify-between">
            <p className="text-white font-bold text-sm">🏏 Batting</p>
            <p className="text-gray-500 text-xs">R / B / 4s / 6s / SR</p>
          </div>
          <div className="divide-y divide-white/5">
            {batting.map((p) => {
              const stillIn = !p.isOut && p.balls > 0;
              return (
                <div key={p.name} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`text-sm font-semibold truncate ${stillIn ? 'text-primary-400' : 'text-white'}`}>
                      {p.name}{stillIn ? ' *' : ''}
                    </p>
                    <p className="text-sm font-bold text-white tabular-nums whitespace-nowrap">
                      {p.runs} ({p.balls})
                    </p>
                  </div>
                  <div className="flex justify-between items-baseline mt-0.5">
                    <p className="text-[11px] text-gray-500 truncate">
                      {p.isOut ? p.howOut : (stillIn ? 'not out' : 'did not bat')}
                    </p>
                    <p className="text-[11px] text-gray-500 tabular-nums whitespace-nowrap">
                      4×{p.fours} · 6×{p.sixes} · SR {p.sr}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Extras + total */}
          <div className="bg-white/5 px-4 py-2 flex items-baseline justify-between text-xs">
            <p className="text-gray-400">
              Extras{' '}
              <span className="text-gray-300 tabular-nums">
                {totalExtras}
                {totalExtras > 0 && (
                  <span className="text-gray-500 ml-1">
                    (b{innings.extras.byes}, lb{innings.extras.legbyes}, w{innings.extras.wides}, nb{innings.extras.noballs}{innings.extras.penalty > 0 ? `, p${innings.extras.penalty}` : ''})
                  </span>
                )}
              </span>
            </p>
            <p className="text-white font-bold tabular-nums">
              Total {innings.totalRuns}/{innings.totalWickets} ({getOversBalls(innings.totalBalls)} ov)
            </p>
          </div>
        </div>
      )}

      {/* Bowling */}
      {bowling.length > 0 && (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="bg-white/5 px-4 py-2 flex items-center justify-between">
            <p className="text-white font-bold text-sm">🎯 Bowling</p>
            <p className="text-gray-500 text-xs">O / R / W / Econ</p>
          </div>
          <div className="divide-y divide-white/5">
            {bowling.map((p) => (
              <div key={p.name} className="px-4 py-3 flex items-baseline justify-between gap-2">
                <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                <p className="text-sm tabular-nums text-gray-300 whitespace-nowrap">
                  <span className="text-white font-bold">{p.oversDisplay}</span>
                  <span className="mx-1 text-gray-600">·</span>
                  <span className="text-white">{p.runs}</span>r
                  <span className="mx-1 text-gray-600">·</span>
                  <span className={p.wickets > 0 ? 'text-accent-400 font-bold' : 'text-white'}>{p.wickets}</span>w
                  <span className="mx-1 text-gray-600">·</span>
                  <span className="text-gray-400">{p.economy}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
