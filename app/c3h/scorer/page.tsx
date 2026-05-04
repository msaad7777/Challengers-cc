"use client";

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { db, firebaseAuthReady } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { isC3HAdmin } from '@/lib/c3h-access';
import {
  Match, Player, BallEvent, Innings,
  C3H_PLAYERS, LCL_TEAMS, WICKET_TYPES,
  createEmptyInnings, getBattingStats, getBowlingStats,
  getOversBalls, getRunRate, getRequiredRunRate,
} from './types';
import MatchSummary from '../lib/MatchSummary';

type View = 'home' | 'setup' | 'toss' | 'players' | 'scoring' | 'scorecard' | 'matches';

export default function ScorerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-primary-400">Loading…</div></div>}>
      <ScorerInner />
    </Suspense>
  );
}

function ScorerInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>('home');
  const [match, setMatch] = useState<Match | null>(null);
  const [matchId, setMatchId] = useState('');
  const [savedMatches, setSavedMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  // Auto-save status feedback — shows "Saving…" briefly then "Saved ✓ HH:MM"
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  // Takeover confirmation — set to the match the user is about to claim
  const [takeoverPrompt, setTakeoverPrompt] = useState<Match | null>(null);

  // Setup state
  const [matchType, setMatchType] = useState<'league' | 'practice'>('practice');
  const [team1, setTeam1] = useState('Challengers Cricket Club');
  const [team2, setTeam2] = useState('');
  const [customTeam, setCustomTeam] = useState('');
  const [pastTeams, setPastTeams] = useState<string[]>([]);
  const [totalOvers, setTotalOvers] = useState(30);
  const [maxWickets, setMaxWickets] = useState(10);
  const [venue, setVenue] = useState('');
  const [customVenue, setCustomVenue] = useState('');
  const [showExtrasMenu, setShowExtrasMenu] = useState<'wide' | 'noball' | 'bye' | 'legbye' | null>(null);

  // Toss
  const [tossFlipping, setTossFlipping] = useState(false);
  const [tossResult, setTossResult] = useState<'heads' | 'tails' | null>(null);
  const [tossWinner, setTossWinner] = useState('');
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat');

  // Players
  const [team1Players, setTeam1Players] = useState<Player[]>([]);
  const [team2Players, setTeam2Players] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [addingTo, setAddingTo] = useState<1 | 2>(1);

  // Scoring
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [wicketType, setWicketType] = useState('');
  const [dismissedPlayer, setDismissedPlayer] = useState('');
  const [fielder, setFielder] = useState('');
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showBatterSelect, setShowBatterSelect] = useState(false);
  const [showPlayerRename, setShowPlayerRename] = useState(false);
  const [addStrikerName, setAddStrikerName] = useState('');
  const [addNonStrikerName, setAddNonStrikerName] = useState('');
  const [addBowlerName, setAddBowlerName] = useState('');
  const [retireTarget, setRetireTarget] = useState<'batter1' | 'batter2' | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  const loadMatches = useCallback(async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      // Wait for Firebase Anonymous Auth before any read — prevents
      // race-condition permission-denied errors on first page load.
      await firebaseAuthReady();
      const userEmail = session.user.email.toLowerCase();
      const userIsAdmin = isC3HAdmin(userEmail);

      // Admins see ALL matches across the club (helps clean up stale
      // matches created by anyone). Non-admins see only their own.
      const q1 = userIsAdmin
        ? query(collection(db, 'matches'))
        : query(collection(db, 'matches'), where('createdBy', '==', userEmail));
      const snap1 = await getDocs(q1);
      const ownMatches = snap1.docs
        .map(d => ({ ...d.data(), id: d.id } as Match))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

      // Load ALL in-progress matches (playing + innings_break + setup
      // + toss) — covers stale drafts AND active matches so anyone can
      // take over or admins can clean up.
      try {
        const q2 = query(
          collection(db, 'matches'),
          where('status', 'in', ['playing', 'innings_break', 'setup', 'toss', 'players']),
        );
        const snap2 = await getDocs(q2);
        const activeMatches = snap2.docs
          .map(d => ({ ...d.data(), id: d.id } as Match))
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        // Merge without duplicates
        const allIds = new Set(ownMatches.map(m => m.id));
        const merged = [...ownMatches, ...activeMatches.filter(m => !allIds.has(m.id))];
        setSavedMatches(merged);

        // Extract unique opponent names from any past match (own + active)
        // — feeds the Team 2 autocomplete for practice matches
        const seen = new Set<string>();
        const uniques: string[] = [];
        for (const m of merged) {
          for (const team of [m.team1, m.team2]) {
            const t = (team || '').trim();
            if (!t || t === 'Challengers Cricket Club') continue;
            if (LCL_TEAMS.includes(t)) continue; // already in the canonical league list
            if (seen.has(t)) continue;
            seen.add(t);
            uniques.push(t);
          }
        }
        setPastTeams(uniques);
      } catch {
        setSavedMatches(ownMatches);
      }
    } catch { /* index building */ }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (session?.user?.email) loadMatches();
  }, [session, loadMatches]);

  // Refresh saved-matches whenever the user returns to the home view
  // (e.g. after exiting a match via the in-app back button). Catches
  // the case where another scorer's writes happened while we were
  // inside another view.
  useEffect(() => {
    if (view === 'home' && session?.user?.email) loadMatches();
  }, [view, session, loadMatches]);

  // Auto-open a specific match if the URL has ?match=ID — used by
  // /c3h/live's "Continue Scoring" link to drop the user straight
  // into the match (with takeover prompt if someone else is the
  // current scorer). Runs once after savedMatches loads.
  const requestedMatchId = searchParams.get('match');
  useEffect(() => {
    if (!requestedMatchId || savedMatches.length === 0 || view !== 'home') return;
    const m = savedMatches.find((sm) => sm.id === requestedMatchId);
    if (!m) return; // Match not found — leave on home view, user sees Recent Matches
    const isOtherScorer = m.status !== 'completed' && m.scorer && m.scorer !== session?.user?.email;
    if (isOtherScorer) {
      setTakeoverPrompt(m);
    } else {
      setMatch(m);
      setMatchId(m.id);
      setLastSavedAt(m.updatedAt || null);
      setSaveStatus(m.updatedAt ? 'saved' : 'idle');
      setView(m.status === 'completed' ? 'scorecard' : 'scoring');
    }
    // Clear the query param so a refresh doesn't loop
    router.replace('/c3h/scorer');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedMatchId, savedMatches.length]);

  // Auto-show the bowler modal when the over just ended AND a new
  // bowler hasn't been picked yet. The "fresh bowler chosen" signal
  // is `previousBowler !== currentBowler` — recordBall's end-of-
  // over branch sets previousBowler to the finishing bowler and
  // clears currentBowler, then selectBowler sets currentBowler to
  // the user's pick (leaving previousBowler different). So they
  // diverge as soon as a real change happens.
  //
  // Earlier versions compared lastBall.bowler === currentBowler,
  // which broke when the new bowler's first delivery was a wide:
  // the wide doesn't increment legalBalls, atOverBoundary stays
  // true, and lastBall.bowler === currentBowler (the new bowler
  // bowled the wide) — so the modal re-opened mid-over.
  useEffect(() => {
    if (view !== 'scoring') return;
    const inn = match
      ? (match.currentInnings === 1 ? match.innings1 : match.innings2)
      : null;
    if (!inn || inn.isComplete) return;
    const legalBalls = inn.balls.filter(
      (b) => b.extraType !== 'wide' && b.extraType !== 'noball',
    ).length;
    const atOverBoundary = legalBalls > 0 && legalBalls % 6 === 0;
    const bowlerNotChangedSinceOverEnd =
      atOverBoundary &&
      !!inn.currentBowler &&
      inn.previousBowler === inn.currentBowler;
    const needsBowler =
      inn.balls.length > 0 &&
      (!inn.currentBowler || bowlerNotChangedSinceOverEnd);
    if (needsBowler) setShowBowlerModal(true);
  }, [view, match]);

  // Auto-show the batter-select modal whenever a batter slot is
  // empty mid-innings. Covers:
  //   1. Reload after a wicket where the new batter wasn't picked
  //   2. Takeover landing on a match left in a half-picked state
  //   3. Legacy data where an earlier scorer bug cleared the wrong
  //      slot (stuck "Select batter*" placeholder with no UI to fix)
  // Only fires once balls are recorded so the start-of-match flow
  // (Start Match / Start 2nd Innings) still controls the initial open.
  useEffect(() => {
    if (view !== 'scoring') return;
    const inn = match
      ? (match.currentInnings === 1 ? match.innings1 : match.innings2)
      : null;
    if (!inn || inn.isComplete) return;
    if (inn.balls.length === 0) return;
    // Also catches the rare case where undo collapses both slots
    // onto the same player (BallEvent doesn't store the non-
    // striker, so undo can't always reconstruct it). undoLastBall
    // pre-clears batter2 in that case, but checking duplicate here
    // is a cheap belt-and-suspenders for any other drift path.
    const needsBatter =
      !inn.currentBatter1 ||
      !inn.currentBatter2 ||
      inn.currentBatter1 === inn.currentBatter2;
    if (needsBatter) setShowBatterSelect(true);
  }, [view, match]);

  // Browser-level guard: if the user tries to close the tab, refresh,
  // or click the browser back button while in the scoring view, show
  // the native "Are you sure you want to leave?" prompt. The match is
  // auto-saved every ball, so even if they confirm leaving, no data
  // is lost — the match will still be in Firestore. This is purely
  // a "wait, did you mean to do that?" prompt to avoid a misclick
  // mid-innings.
  useEffect(() => {
    if (view !== 'scoring') return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore the message and show their own,
      // but setting returnValue is required to trigger the prompt.
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [view]);

  // Pass forceNew=true when starting a fresh match — bypasses the
  // matchId state read (which can be stale within a single render
  // tick) and always creates a brand-new Firestore doc. Without this,
  // clicking "Start Match" while a previous match's matchId was still
  // in state would overwrite that match's data via updateDoc.
  const saveMatch = async (m: Match, opts?: { forceNew?: boolean }) => {
    setSaveStatus('saving');
    const stamp = new Date().toISOString();
    const data = { ...m, scorer: session?.user?.email || m.scorer, updatedAt: stamp };
    try {
      if (matchId && !opts?.forceNew) {
        await updateDoc(doc(db, 'matches', matchId), data);
      } else {
        const ref = await addDoc(collection(db, 'matches'), data);
        setMatchId(ref.id);
      }
      setLastSavedAt(stamp);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('idle');
    }
  };

  const getCurrentInnings = (): Innings | null => {
    if (!match) return null;
    return match.currentInnings === 1 ? match.innings1 : match.innings2;
  };

  const getOtherInnings = (): Innings | null => {
    if (!match) return null;
    return match.currentInnings === 1 ? match.innings2 : match.innings1;
  };

  const undoLastBall = async () => {
    if (!match) return;
    const inn = getCurrentInnings()!;
    if (inn.balls.length === 0) return;

    const newBalls = inn.balls.slice(0, -1);
    const lastBall = inn.balls[inn.balls.length - 1];
    const totalRuns = newBalls.reduce((sum, b) => sum + b.runs + b.extras, 0);
    const totalWickets = newBalls.filter(b => b.isWicket).length;
    const legalBalls = newBalls.filter(b => b.extraType !== 'wide' && b.extraType !== 'noball').length;

    const updatedExtras = { wides: 0, noballs: 0, byes: 0, legbyes: 0, penalty: 0 };
    newBalls.forEach(b => {
      if (b.extraType === 'wide') updatedExtras.wides += 1 + b.runs;
      if (b.extraType === 'noball') updatedExtras.noballs += 1 + b.runs;
      if (b.extraType === 'bye') updatedExtras.byes += b.runs;
      if (b.extraType === 'legbye') updatedExtras.legbyes += b.runs;
    });

    // Restore batters from before this ball. Each ball records both
    // the striker (batter) and the non-striker, so we can fully
    // reconstruct the at-the-crease pair without guessing. Older
    // balls predate the nonStriker field — fall back to the
    // existing inn.currentBatter2 in that case so undo on legacy
    // data degrades gracefully (same behavior as before this fix).
    const updatedInnings: Innings = {
      ...inn,
      balls: newBalls,
      totalRuns,
      totalWickets,
      totalOvers: Math.floor(legalBalls / 6),
      totalBalls: legalBalls,
      extras: updatedExtras,
      currentBatter1: lastBall.batter || inn.currentBatter1,
      currentBatter2: lastBall.nonStriker ?? inn.currentBatter2,
      currentBowler: lastBall.bowler || inn.currentBowler,
      isComplete: false,
    };

    // For balls recorded BEFORE the nonStriker field existed, fall
    // back to the heuristic reversal logic (wicket-restore, strike-
    // rotation reversal, end-of-over swap-back). Newer balls have
    // an exact nonStriker snapshot so none of these compensations
    // are needed — running them on top of the exact restore would
    // double-undo and recreate the duplicate-batter bug.
    if (lastBall.nonStriker === undefined) {
      if (lastBall.isWicket && lastBall.dismissedPlayer) {
        if (lastBall.dismissedPlayer === inn.currentBatter1 || !inn.currentBatter1) {
          updatedInnings.currentBatter1 = lastBall.dismissedPlayer;
        } else {
          updatedInnings.currentBatter2 = lastBall.dismissedPlayer;
        }
      }
      if (lastBall.extraType !== 'wide' && lastBall.extraType !== 'noball') {
        if (legalBalls % 6 === 0 && legalBalls > 0) {
          const temp = updatedInnings.currentBatter1;
          updatedInnings.currentBatter1 = updatedInnings.currentBatter2;
          updatedInnings.currentBatter2 = temp;
        }
      }
      if (lastBall.runs % 2 === 1) {
        const temp = updatedInnings.currentBatter1;
        updatedInnings.currentBatter1 = updatedInnings.currentBatter2;
        updatedInnings.currentBatter2 = temp;
      }
      // Defensive: legacy heuristic can still collide on the same
      // player. Clear batter2 and let the auto-show modal prompt.
      if (
        updatedInnings.currentBatter1 &&
        updatedInnings.currentBatter1 === updatedInnings.currentBatter2
      ) {
        updatedInnings.currentBatter2 = '';
      }
    }

    const updatedMatch = {
      ...match,
      status: 'playing' as const,
      [match.currentInnings === 1 ? 'innings1' : 'innings2']: updatedInnings,
    };

    setMatch(updatedMatch);
    setShowBowlerModal(false);
    setShowBatterSelect(false);
    await saveMatch(updatedMatch);
  };

  // Rename a player everywhere they appear in the match doc:
  // both team rosters, current batter/bowler/previousBowler slots
  // in both innings, and every ball event (batter, nonStriker,
  // bowler, dismissedPlayer, fielder). Used to fix typos or
  // replace placeholder names like "12" with the real name without
  // losing any stats — every existing aggregation keys off these
  // strings so a single-pass replace is sufficient.
  const renamePlayer = async (oldName: string, newName: string) => {
    if (!match) return;
    const trimmed = newName.trim();
    if (!oldName || !trimmed || trimmed === oldName) return;

    const renameInInnings = (inn: Innings): Innings => ({
      ...inn,
      currentBatter1: inn.currentBatter1 === oldName ? trimmed : inn.currentBatter1,
      currentBatter2: inn.currentBatter2 === oldName ? trimmed : inn.currentBatter2,
      currentBowler: inn.currentBowler === oldName ? trimmed : inn.currentBowler,
      previousBowler: inn.previousBowler === oldName ? trimmed : inn.previousBowler,
      balls: inn.balls.map(b => ({
        ...b,
        batter: b.batter === oldName ? trimmed : b.batter,
        nonStriker: b.nonStriker === oldName ? trimmed : b.nonStriker,
        bowler: b.bowler === oldName ? trimmed : b.bowler,
        dismissedPlayer: b.dismissedPlayer === oldName ? trimmed : b.dismissedPlayer,
        fielder: b.fielder === oldName ? trimmed : b.fielder,
      })),
    });

    const renameInRoster = (players: typeof match.team1Players) =>
      players.map(p => (p.name === oldName ? { ...p, name: trimmed } : p));

    const updated: Match = {
      ...match,
      team1Players: renameInRoster(match.team1Players),
      team2Players: renameInRoster(match.team2Players),
      innings1: renameInInnings(match.innings1),
      innings2: renameInInnings(match.innings2),
    };
    setMatch(updated);
    await saveMatch(updated);
  };

  // Pure roster-extension helper — used when the scorer forgot to
  // include someone during setup (late arrivals, last-minute squad
  // changes) and needs to add them mid-match. Returns the updated
  // match doc + the trimmed name without saving, so the caller can
  // chain the add with an auto-select (e.g. drop the new batter
  // straight onto strike) and persist both in a single saveMatch.
  //
  // Dedup is intentionally per-team only, not cross-team. Practice
  // matches rotate the same player between batting and bowling
  // sides, and stats key off the name string — so a player on
  // both rosters naturally accumulates their full contribution.
  // Returns null on empty name or same-team duplicate.
  const addPlayerToTeam = (
    snapshot: Match,
    teamName: string,
    name: string,
  ): { match: Match; addedName: string } | null => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const targetRoster =
      teamName === snapshot.team1 ? snapshot.team1Players :
      teamName === snapshot.team2 ? snapshot.team2Players :
      null;
    if (!targetRoster) return null;
    if (targetRoster.some(p => p.name === trimmed)) return null;

    const newPlayer = { id: `p${Date.now()}`, name: trimmed, isC3H: false };
    const updated: Match = {
      ...snapshot,
      team1Players: teamName === snapshot.team1 ? [...snapshot.team1Players, newPlayer] : snapshot.team1Players,
      team2Players: teamName === snapshot.team2 ? [...snapshot.team2Players, newPlayer] : snapshot.team2Players,
    };
    return { match: updated, addedName: trimmed };
  };

  // Pure swap of striker ↔ non-striker. Used when the wrong batter
  // was set on strike at the start of an over / new partnership and
  // we need to fix it without altering balls, runs, or extras.
  const swapBatters = async () => {
    if (!match) return;
    const inn = getCurrentInnings()!;
    if (!inn.currentBatter1 || !inn.currentBatter2) return;
    const updatedInnings: Innings = {
      ...inn,
      currentBatter1: inn.currentBatter2,
      currentBatter2: inn.currentBatter1,
    };
    const updatedMatch = {
      ...match,
      [match.currentInnings === 1 ? 'innings1' : 'innings2']: updatedInnings,
    };
    setMatch(updatedMatch);
    await saveMatch(updatedMatch);
  };

  const recordBall = async (runs: number, extraType: '' | 'wide' | 'noball' | 'bye' | 'legbye' = '', isWicket = false) => {
    if (!match) return;
    const inn = getCurrentInnings()!;
    // Block recording if no bowler is set (forces selection at start
    // of every over). The modal is auto-shown by the effect above.
    if (!inn.currentBowler) {
      setShowBowlerModal(true);
      return;
    }
    const isLegal = extraType !== 'wide' && extraType !== 'noball';
    const currentLegalBalls = inn.balls.filter(b => b.extraType !== 'wide' && b.extraType !== 'noball').length;
    const currentOver = Math.floor(currentLegalBalls / 6);
    const currentBallInOver = (currentLegalBalls % 6) + 1;

    const ball: BallEvent = {
      id: Date.now().toString(),
      over: currentOver,
      ball: isLegal ? currentBallInOver : currentLegalBalls % 6,
      batter: inn.currentBatter1,
      nonStriker: inn.currentBatter2,
      bowler: inn.currentBowler,
      runs: extraType === 'wide' || extraType === 'bye' || extraType === 'legbye' ? 0 : runs,
      extras: extraType ? (extraType === 'wide' || extraType === 'noball' ? 1 + runs : runs) : 0,
      extraType,
      isWicket,
      wicketType: isWicket ? wicketType : '',
      dismissedPlayer: isWicket ? dismissedPlayer : '',
      fielder: isWicket ? fielder : '',
      isBoundary: runs === 4 && !extraType,
      isSix: runs === 6 && !extraType,
      isDotBall: runs === 0 && !extraType && !isWicket,
      timestamp: new Date().toISOString(),
    };

    const newBalls = [...inn.balls, ball];
    const totalRuns = newBalls.reduce((sum, b) => sum + b.runs + b.extras, 0);
    const totalWickets = newBalls.filter(b => b.isWicket).length;
    const legalBalls = newBalls.filter(b => b.extraType !== 'wide' && b.extraType !== 'noball').length;

    const updatedExtras = { ...inn.extras };
    if (extraType === 'wide') updatedExtras.wides += 1 + runs;
    if (extraType === 'noball') updatedExtras.noballs += 1 + runs;
    if (extraType === 'bye') updatedExtras.byes += runs;
    if (extraType === 'legbye') updatedExtras.legbyes += runs;

    const updatedInnings: Innings = {
      ...inn,
      balls: newBalls,
      totalRuns,
      totalWickets,
      totalOvers: Math.floor(legalBalls / 6),
      totalBalls: legalBalls,
      extras: updatedExtras,
      isComplete: legalBalls >= match.totalOvers * 6 || totalWickets >= (match.maxWickets || 10) ||
        (match.currentInnings === 2 && totalRuns > match.innings1.totalRuns),
    };

    // Rotate strike on odd runs (1, 3) or end of over.
    // End-of-over: swap batters, mark current bowler as previous
    // (locks them out of next over per cricket rules), and clear
    // currentBowler so a new selection is forced.
    const isOverComplete = isLegal && legalBalls % 6 === 0;
    if (isOverComplete) {
      const temp = updatedInnings.currentBatter1;
      updatedInnings.currentBatter1 = updatedInnings.currentBatter2;
      updatedInnings.currentBatter2 = temp;
      updatedInnings.previousBowler = updatedInnings.currentBowler;
      updatedInnings.currentBowler = '';
    } else if (runs % 2 === 1) {
      const temp = updatedInnings.currentBatter1;
      updatedInnings.currentBatter1 = updatedInnings.currentBatter2;
      updatedInnings.currentBatter2 = temp;
    }

    // Wicket cleanup must happen AFTER the over-end swap so we
    // clear whichever slot the dismissed batter occupies post-swap.
    // Doing it here (in one immutable update) avoids the
    // setMatch → await → mutate-state-in-place → setMatch pattern
    // that previously raced with the over-boundary modal logic
    // and could leave the new-batter picker hidden.
    if (isWicket && dismissedPlayer) {
      if (dismissedPlayer === updatedInnings.currentBatter1) {
        updatedInnings.currentBatter1 = '';
      } else if (dismissedPlayer === updatedInnings.currentBatter2) {
        updatedInnings.currentBatter2 = '';
      }
    }

    const updatedMatch = {
      ...match,
      [match.currentInnings === 1 ? 'innings1' : 'innings2']: updatedInnings,
    };

    // Check if innings is complete
    if (updatedInnings.isComplete) {
      if (match.currentInnings === 1) {
        updatedMatch.status = 'innings_break' as const;
      } else {
        updatedMatch.status = 'completed' as const;
        const i1 = updatedMatch.innings1.totalRuns;
        const i2 = updatedInnings.totalRuns;
        if (i2 > i1) {
          updatedMatch.result = `${updatedInnings.battingTeam} won by ${(match.maxWickets || 10) - updatedInnings.totalWickets} wickets`;
        } else if (i1 > i2) {
          updatedMatch.result = `${updatedMatch.innings1.battingTeam} won by ${i1 - i2} runs`;
        } else {
          updatedMatch.result = 'Match Tied';
        }
      }
    }

    setMatch(updatedMatch);
    await saveMatch(updatedMatch);

    // Open the right modal(s) for what the user needs to pick next.
    // When BOTH a new batter and a new bowler are needed (wicket on
    // last ball of an over), the batter-select modal handles both in
    // a single unified UI — its render is preferred over the
    // bowler-change modal (see render guard below). Only fire
    // selection prompts while the innings is still live.
    if (!updatedInnings.isComplete) {
      if (isWicket) setShowBatterSelect(true);
      if (isOverComplete) setShowBowlerModal(true);
    }
    if (isWicket) {
      setShowWicketModal(false);
      setWicketType('');
      setDismissedPlayer('');
      setFielder('');
    }
  };

  if (status === 'loading' || !session) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-primary-400">Loading...</div></div>;
  }

  const inn = getCurrentInnings();
  const otherInn = getOtherInnings();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-32 md:pt-40">
        <div className="max-w-3xl mx-auto">

          <div className="mb-6">
            <Link href="/c3h/dashboard" className="text-gray-500 text-sm hover:text-primary-400">&larr; Dashboard</Link>
            <h1 className="text-3xl font-bold text-white mt-2"><span className="gradient-text">Scorer</span></h1>
          </div>

          {/* HOME */}
          {view === 'home' && (
            <div className="space-y-4">
              <button onClick={() => setView('setup')} className="w-full glass rounded-2xl p-6 border-2 border-primary-500/20 hover:border-primary-500/50 transition-all text-left">
                <div className="text-3xl mb-2">🏏</div>
                <h3 className="text-xl font-bold text-white">New Match</h3>
                <p className="text-gray-400 text-sm">Start scoring a new match or practice game</p>
              </button>

              {savedMatches.length > 0 && (
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Recent Matches</h3>
                  <div className="space-y-3">
                    {savedMatches.slice(0, 20).map(m => {
                      const isOtherScorer = m.status !== 'completed' && m.scorer && m.scorer !== session?.user?.email;
                      const isOwn = m.createdBy === session?.user?.email?.toLowerCase();
                      const userIsAdmin = isC3HAdmin(session?.user?.email);
                      const canDelete = isOwn || userIsAdmin;
                      const openMatch = () => {
                        if (isOtherScorer) {
                          // Confirm takeover before claiming the scorer slot
                          setTakeoverPrompt(m);
                        } else {
                          setMatch(m);
                          setMatchId(m.id);
                          setLastSavedAt(m.updatedAt || null);
                          setSaveStatus(m.updatedAt ? 'saved' : 'idle');
                          setView(m.status === 'completed' ? 'scorecard' : 'scoring');
                        }
                      };
                      const handleDelete = async (e: React.MouseEvent) => {
                        e.stopPropagation();
                        const ok = window.confirm(
                          `Delete this match permanently?\n\n${m.team1} vs ${m.team2}\n${m.date}\n\nThis cannot be undone.`,
                        );
                        if (!ok) return;
                        try {
                          await deleteDoc(doc(db, 'matches', m.id));
                          setSavedMatches((prev) => prev.filter((x) => x.id !== m.id));
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
                      return (
                        <div key={m.id} className="relative">
                          <button onClick={openMatch} className="w-full text-left glass rounded-xl p-4 pr-12 border border-white/10 hover:border-primary-500/30 transition-all">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-bold text-sm">{m.team1} vs {m.team2}</p>
                              <p className="text-gray-500 text-xs">{m.date} | {m.totalOvers} overs</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${m.status === 'completed' ? 'bg-primary-500/20 text-primary-400' : 'bg-accent-500/20 text-accent-400'}`}>
                              {m.status === 'completed' ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                          {m.result && <p className="text-primary-400 text-xs mt-1">{m.result}</p>}
                          {isOtherScorer && (
                            <p className="text-accent-400 text-xs mt-1">
                              Currently scored by {m.scorer!.split('@')[0]} — tap to take over
                            </p>
                          )}
                          </button>
                          {/* Delete button — shown on user's own matches OR
                              when current user is an admin (so admins can
                              clean up stale drafts created by anyone).
                              Stops click propagation so it doesn't open the match. */}
                          {canDelete && (
                            <button
                              onClick={handleDelete}
                              title="Delete this match permanently"
                              aria-label="Delete match"
                              className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SETUP */}
          {view === 'setup' && (
            <div className="space-y-4">
              <button onClick={() => setView('home')} className="text-gray-500 text-sm hover:text-primary-400">&larr; Back</button>

              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Match Setup</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Match Type</label>
                    <div className="flex gap-2">
                      {(['practice', 'league'] as const).map(t => (
                        <button key={t} onClick={() => setMatchType(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${matchType === t ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                          {t === 'practice' ? 'Practice Match' : 'League Match'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Team 1</label>
                    <input value={team1} onChange={e => setTeam1(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Team 2</label>
                    {matchType === 'league' ? (
                      <select value={team2} onChange={e => setTeam2(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500">
                        <option value="" className="bg-gray-900">Select opponent...</option>
                        {LCL_TEAMS.filter(t => t !== team1).map(t => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
                      </select>
                    ) : (
                      <>
                        <input
                          value={customTeam}
                          onChange={e => { setCustomTeam(e.target.value); setTeam2(e.target.value); }}
                          placeholder="Start typing — autofill from teams we've played"
                          list="team2-suggestions"
                          autoComplete="off"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500 placeholder-gray-600"
                        />
                        <datalist id="team2-suggestions">
                          {/* Past opponents we've actually scored against */}
                          {pastTeams.filter(t => t !== team1).map(t => (
                            <option key={`past-${t}`} value={t}>Previously played</option>
                          ))}
                          {/* All league teams as suggestions even in practice mode */}
                          {LCL_TEAMS.filter(t => t !== team1 && !pastTeams.includes(t)).map(t => (
                            <option key={`lcl-${t}`} value={t}>League team</option>
                          ))}
                        </datalist>
                        {pastTeams.length > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            💡 Suggestions include {pastTeams.length} team{pastTeams.length === 1 ? '' : 's'} you&apos;ve played before + all league teams
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Overs</label>
                      <select value={totalOvers} onChange={e => setTotalOvers(Number(e.target.value))} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500">
                        {[5, 6, 8, 10, 15, 20, 25, 30, 35, 40, 50].map(o => <option key={o} value={o} className="bg-gray-900">{o} overs</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Wickets</label>
                      <select value={maxWickets} onChange={e => setMaxWickets(Number(e.target.value))} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500">
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(w => <option key={w} value={w} className="bg-gray-900">{w} wickets</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Venue</label>
                      <select value={venue} onChange={e => { setVenue(e.target.value); if (e.target.value !== 'custom') setCustomVenue(''); }} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500">
                        <option value="" className="bg-gray-900">Select venue...</option>
                        <option value="Northridge Cricket Ground" className="bg-gray-900">Northridge Cricket Ground</option>
                        <option value="North London Athletic Fields" className="bg-gray-900">North London Athletic Fields</option>
                        <option value="Silverwoods Cricket Ground" className="bg-gray-900">Silverwoods Cricket Ground</option>
                        <option value="Mike Vier Park, Sarnia" className="bg-gray-900">Mike Vier Park, Sarnia</option>
                        <option value="Thamesville" className="bg-gray-900">Thamesville</option>
                        <option value="Kover Drive Sports (Indoor)" className="bg-gray-900">Kover Drive Sports (Indoor)</option>
                        <option value="custom" className="bg-gray-900">Other — Enter manually</option>
                      </select>
                      {venue === 'custom' && (
                        <input value={customVenue} onChange={e => setCustomVenue(e.target.value)} placeholder="Enter ground name" className="w-full mt-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500 placeholder-gray-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => { if (team1 && team2) setView('toss'); }} disabled={!team1 || !team2} className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-[1.02] disabled:opacity-40">
                Next — Coin Toss
              </button>
            </div>
          )}

          {/* TOSS */}
          {view === 'toss' && (
            <div className="space-y-4">
              <button onClick={() => setView('setup')} className="text-gray-500 text-sm hover:text-primary-400">&larr; Back</button>
              <div className="glass rounded-2xl p-8 border border-white/10 text-center">
                <h3 className="text-2xl font-bold text-white mb-6">Coin Toss</h3>
                <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl border-4 ${tossFlipping ? 'animate-spin border-accent-500' : tossResult ? 'border-primary-500' : 'border-white/20'}`}
                  style={{ animationDuration: '0.3s' }}>
                  {tossResult ? (tossResult === 'heads' ? '👑' : '🦅') : '🪙'}
                </div>
                {!tossResult ? (
                  <button onClick={() => {
                    setTossFlipping(true);
                    setTimeout(() => {
                      setTossResult(Math.random() > 0.5 ? 'heads' : 'tails');
                      setTossFlipping(false);
                    }, 1500);
                  }} disabled={tossFlipping} className="px-8 py-3 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold shadow-xl hover:scale-105 transition-all disabled:opacity-50">
                    {tossFlipping ? 'Flipping...' : 'Flip Coin'}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-2xl font-bold text-accent-400">{tossResult === 'heads' ? '👑 Heads!' : '🦅 Tails!'}</p>
                    <button onClick={() => { setTossResult(null); setTossWinner(''); setTossDecision('bat'); }} className="text-gray-400 text-xs underline hover:text-primary-400">Toss Again</button>
                    <div>
                      <label className="text-gray-400 text-xs block mb-2">Who won the toss?</label>
                      <div className="flex gap-2">
                        <button onClick={() => setTossWinner(team1)} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${tossWinner === team1 ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{team1}</button>
                        <button onClick={() => setTossWinner(team2)} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${tossWinner === team2 ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{team2}</button>
                      </div>
                    </div>
                    {tossWinner && (
                      <div>
                        <label className="text-gray-400 text-xs block mb-2">{tossWinner} elected to?</label>
                        <div className="flex gap-2">
                          <button onClick={() => setTossDecision('bat')} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${tossDecision === 'bat' ? 'bg-accent-500/20 text-accent-400 border-accent-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>Bat First</button>
                          <button onClick={() => setTossDecision('bowl')} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${tossDecision === 'bowl' ? 'bg-accent-500/20 text-accent-400 border-accent-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>Bowl First</button>
                        </div>
                      </div>
                    )}
                    {tossWinner && (
                      <button onClick={() => setView('players')} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-xl transition-all hover:scale-[1.02]">
                        Next — Add Players
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PLAYERS */}
          {view === 'players' && (
            <div className="space-y-4">
              <button onClick={() => setView('toss')} className="text-gray-500 text-sm hover:text-primary-400">&larr; Back</button>

              {[{ team: team1, players: team1Players, setPlayers: setTeam1Players, num: 1 as const },
                { team: team2, players: team2Players, setPlayers: setTeam2Players, num: 2 as const }].map(({ team, players, setPlayers, num }) => (
                <div key={num} className="glass rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">{team} ({players.length})</h3>
                  {team === 'Challengers Cricket Club' && (
                    <div className="mb-3">
                      <p className="text-gray-500 text-xs mb-2">Quick add from roster:</p>
                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                        {C3H_PLAYERS.filter(p => !players.find(pp => pp.name === p.name)).map(p => (
                          <button key={p.id} onClick={() => setPlayers([...players, p])} className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/10 hover:bg-primary-500/20 hover:text-primary-400 transition-all">+ {p.name}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {players.map((p, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30 flex items-center gap-1">
                        {p.name}
                        <button onClick={() => setPlayers(players.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300 ml-1">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={addingTo === num ? newPlayerName : ''} onFocus={() => setAddingTo(num)} onChange={e => { setAddingTo(num); setNewPlayerName(e.target.value); }} placeholder="Add player manually..." className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-primary-500 placeholder-gray-600" />
                    <button onClick={() => { if (newPlayerName && addingTo === num) { setPlayers([...players, { id: Date.now().toString(), name: newPlayerName, isC3H: false }]); setNewPlayerName(''); } }} className="px-3 py-2 bg-primary-500/20 text-primary-400 rounded-lg text-xs font-medium border border-primary-500/30">Add</button>
                  </div>
                </div>
              ))}

              <button onClick={async () => {
                const battingFirst = tossDecision === 'bat' ? tossWinner : (tossWinner === team1 ? team2 : team1);
                const bowlingFirst = battingFirst === team1 ? team2 : team1;
                const newMatch: Match = {
                  id: '',
                  createdBy: session.user!.email!.toLowerCase(),
                  matchType, matchLabel: `${team1} vs ${team2}`,
                  team1, team2,
                  team1Players, team2Players,
                  tossWinner, tossDecision,
                  totalOvers, maxWickets, venue: venue === 'custom' ? customVenue : venue,
                  date: new Date().toISOString().split('T')[0],
                  innings1: createEmptyInnings(battingFirst, bowlingFirst),
                  innings2: createEmptyInnings(bowlingFirst, battingFirst),
                  currentInnings: 1,
                  status: 'playing',
                  result: '',
                  scorer: session.user!.email!,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                setMatch(newMatch);
                // Force a fresh Firestore doc — saveMatch(forceNew) ignores
                // any stale matchId still in state from a previously opened
                // match. Without this, starting a new match could overwrite
                // the previous one.
                await saveMatch(newMatch, { forceNew: true });
                setShowBatterSelect(true);
                setView('scoring');
              }} disabled={team1Players.length < 2 || team2Players.length < 2}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-[1.02] disabled:opacity-40">
                Start Match
              </button>
            </div>
          )}

          {/* SCORING */}
          {view === 'scoring' && match && inn && (
            <div className="space-y-3">
              {/* Score Header */}
              <div className="glass rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-bold text-sm">{inn.battingTeam}</p>
                    <p className="text-3xl font-bold text-white">{inn.totalRuns}/{inn.totalWickets}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Overs</p>
                    <p className="text-2xl font-bold text-primary-400">{getOversBalls(inn.totalBalls)}</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>RR: {getRunRate(inn.totalRuns, inn.totalBalls)}</span>
                  {match.currentInnings === 2 && (
                    <>
                      <span>Target: {match.innings1.totalRuns + 1}</span>
                      <span>RRR: {getRequiredRunRate(match.innings1.totalRuns + 1, inn.totalRuns, match.totalOvers * 6 - inn.totalBalls)}</span>
                    </>
                  )}
                </div>
                {match.scorer && match.scorer !== session?.user?.email && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Scorer: {match.scorer.split('@')[0]}</span>
                    <button onClick={async () => {
                      const updated = { ...match, scorer: session!.user!.email! };
                      setMatch(updated);
                      await saveMatch(updated);
                    }} className="text-xs px-3 py-1 rounded-lg bg-accent-500/20 text-accent-400 border border-accent-500/30 hover:bg-accent-500/30">
                      Take Over Scoring
                    </button>
                  </div>
                )}
                {/* Save status — visible whenever you are the active scorer */}
                {match.scorer && match.scorer === session?.user?.email && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">
                      Scoring as <span className="text-gray-300">{session.user.email!.split('@')[0]}</span>
                    </span>
                    <span className={`font-semibold ${saveStatus === 'saving' ? 'text-accent-400' : saveStatus === 'saved' ? 'text-primary-400' : 'text-gray-500'}`}>
                      {saveStatus === 'saving' ? 'Saving…' :
                        saveStatus === 'saved' && lastSavedAt ? `✓ Saved · ${new Date(lastSavedAt).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true })}` :
                        'Ready'}
                    </span>
                  </div>
                )}
              </div>

              {/* Current Players */}
              {(() => {
                const getBatterScore = (name: string) => {
                  if (!name || !inn) return { runs: 0, balls: 0 };
                  let runs = 0, balls = 0;
                  inn.balls.forEach(b => {
                    if (b.batter === name) {
                      if (b.extraType !== 'wide') balls++;
                      if (!b.extraType || b.extraType === 'noball') runs += b.runs;
                    }
                  });
                  return { runs, balls };
                };
                const getBowlerFigures = (name: string) => {
                  if (!name || !inn) return { wickets: 0, runs: 0, overs: '' };
                  let wickets = 0, runs = 0, legalBalls = 0;
                  inn.balls.forEach(b => {
                    if (b.bowler === name) {
                      runs += b.runs + b.extras;
                      if (b.extraType !== 'wide' && b.extraType !== 'noball') legalBalls++;
                      if (b.isWicket && b.wicketType !== 'Run Out') wickets++;
                    }
                  });
                  return { wickets, runs, overs: `${Math.floor(legalBalls / 6)}.${legalBalls % 6}` };
                };
                const b1 = getBatterScore(inn.currentBatter1);
                const b2 = getBatterScore(inn.currentBatter2);
                const bw = getBowlerFigures(inn.currentBowler);
                return (
                  <div className="glass rounded-xl p-3 border border-white/10">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <div>
                        {inn.currentBatter1 ? (
                          // Clickable so the user can retire / swap out
                          // this batter without using the WICKET flow.
                          <button onClick={() => setRetireTarget('batter1')} title="Retire / change striker" className="hover:text-accent-400 transition-colors">
                            <span className="text-primary-400 font-bold">🏏 {inn.currentBatter1}</span>
                            <span className="text-gray-500 ml-1">*</span>
                            <span className="text-white font-bold ml-2">{b1.runs}({b1.balls})</span>
                            <span className="ml-2 text-gray-600">✎</span>
                          </button>
                        ) : (
                          <button onClick={() => setShowBatterSelect(true)} className="text-primary-400 font-bold underline decoration-dotted">🏏 Select batter*</button>
                        )}
                      </div>
                      {/* Swap striker ↔ non-striker without touching balls
                          or stats. Useful when the wrong batter was put on
                          strike at the start of an over / partnership. */}
                      {inn.currentBatter1 && inn.currentBatter2 && (
                        <button
                          onClick={swapBatters}
                          title="Swap striker"
                          aria-label="Swap striker"
                          className="px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10 hover:bg-primary-500/20 hover:text-primary-400 hover:border-primary-500/30 transition-all text-xs"
                        >
                          ⇄
                        </button>
                      )}
                      <div>
                        {inn.currentBatter2 ? (
                          <button onClick={() => setRetireTarget('batter2')} title="Retire / change non-striker" className="hover:text-accent-400 transition-colors">
                            <span className="text-gray-400">{inn.currentBatter2}</span>
                            <span className="text-white font-bold ml-2">{b2.runs}({b2.balls})</span>
                            <span className="ml-2 text-gray-600">✎</span>
                          </button>
                        ) : (
                          <button onClick={() => setShowBatterSelect(true)} className="text-gray-400 underline decoration-dotted">Select batter</button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {inn.currentBowler ? (
                        // Clickable so the user can fix a wrong-bowler
                        // pick (or change mid-over for an injury) without
                        // waiting for the next over-boundary auto-prompt.
                        <button
                          onClick={() => setShowBowlerModal(true)}
                          title="Change bowler"
                          className="hover:text-accent-400 transition-colors"
                        >
                          🎾 {inn.currentBowler}
                          <span className="text-white font-bold ml-2">{bw.overs}-{bw.runs}-{bw.wickets}</span>
                          <span className="ml-2 text-gray-600">✎</span>
                        </button>
                      ) : (
                        <button onClick={() => setShowBowlerModal(true)} className="underline decoration-dotted">🎾 Select bowler</button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Select Batters Modal */}
              {showBatterSelect && (
                <div className="glass rounded-2xl p-6 border-2 border-primary-500/30">
                  <h3 className="text-lg font-bold text-white mb-3">{inn.totalWickets > 0 && (!inn.currentBatter1 || !inn.currentBatter2) ? 'Select New Batter' : 'Select Batters'}</h3>
                  <div className="space-y-3">
                    {/* Source the player rosters from the persisted match
                        doc, not React state. team1Players/team2Players
                        state is only populated during the setup flow and
                        resets to [] on reload — pulling from match keeps
                        the modal usable after reloads and takeovers. */}
                    {!inn.currentBatter1 && (() => {
                      const dismissed = inn.balls.filter(b => b.isWicket).map(b => b.dismissedPlayer);
                      const available = (inn.battingTeam === match.team1 ? match.team1Players : match.team2Players)
                        .filter(p => p.name !== inn.currentBatter2 && !dismissed.includes(p.name));
                      return (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Striker:</p>
                        <div className="flex flex-wrap gap-1">
                          {available.map(p => (
                              <button key={p.id} onClick={() => {
                                const updated = { ...match, [match.currentInnings === 1 ? 'innings1' : 'innings2']: { ...inn, currentBatter1: p.name } };
                                setMatch(updated);
                                if (inn.currentBatter2 && inn.currentBowler) setShowBatterSelect(false);
                              }} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-primary-500/20 hover:text-primary-400">{p.name}</button>
                            ))}
                        </div>
                        <div className="flex gap-1 mt-2">
                          <input
                            value={addStrikerName}
                            onChange={(e) => setAddStrikerName(e.target.value)}
                            placeholder="+ Other batter…"
                            className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-gray-600 focus:outline-none focus:border-primary-500"
                          />
                          <button
                            onClick={async () => {
                              const added = addPlayerToTeam(match, inn.battingTeam, addStrikerName);
                              if (!added) return;
                              const innKey = match.currentInnings === 1 ? 'innings1' : 'innings2';
                              const innFinal = { ...added.match[innKey], currentBatter1: added.addedName };
                              const matchFinal = { ...added.match, [innKey]: innFinal };
                              setMatch(matchFinal);
                              setAddStrikerName('');
                              if (innFinal.currentBatter2 && innFinal.currentBowler) setShowBatterSelect(false);
                              await saveMatch(matchFinal);
                            }}
                            disabled={!addStrikerName.trim()}
                            className="px-3 py-1 rounded bg-primary-500/20 text-primary-400 text-xs border border-primary-500/30 disabled:opacity-40"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                      );
                    })()}
                    {!inn.currentBatter2 && (() => {
                      const dismissed = inn.balls.filter(b => b.isWicket).map(b => b.dismissedPlayer);
                      const available = (inn.battingTeam === match.team1 ? match.team1Players : match.team2Players)
                        .filter(p => p.name !== inn.currentBatter1 && !dismissed.includes(p.name));
                      return (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Non-Striker:</p>
                        <div className="flex flex-wrap gap-1">
                          {available.map(p => (
                              <button key={p.id} onClick={() => {
                                const updated = { ...match, [match.currentInnings === 1 ? 'innings1' : 'innings2']: { ...inn, currentBatter2: p.name } };
                                setMatch(updated);
                                if (inn.currentBatter1 && inn.currentBowler) setShowBatterSelect(false);
                              }} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-primary-500/20 hover:text-primary-400">{p.name}</button>
                            ))}
                        </div>
                        <div className="flex gap-1 mt-2">
                          <input
                            value={addNonStrikerName}
                            onChange={(e) => setAddNonStrikerName(e.target.value)}
                            placeholder="+ Other batter…"
                            className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-gray-600 focus:outline-none focus:border-primary-500"
                          />
                          <button
                            onClick={async () => {
                              const added = addPlayerToTeam(match, inn.battingTeam, addNonStrikerName);
                              if (!added) return;
                              const innKey = match.currentInnings === 1 ? 'innings1' : 'innings2';
                              const innFinal = { ...added.match[innKey], currentBatter2: added.addedName };
                              const matchFinal = { ...added.match, [innKey]: innFinal };
                              setMatch(matchFinal);
                              setAddNonStrikerName('');
                              if (innFinal.currentBatter1 && innFinal.currentBowler) setShowBatterSelect(false);
                              await saveMatch(matchFinal);
                            }}
                            disabled={!addNonStrikerName.trim()}
                            className="px-3 py-1 rounded bg-primary-500/20 text-primary-400 text-xs border border-primary-500/30 disabled:opacity-40"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                      );
                    })()}
                    {!inn.currentBowler && (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">
                          {inn.previousBowler ? 'Next Bowler:' : 'Opening Bowler:'}
                        </p>
                        {inn.previousBowler && (
                          <p className="text-xs text-gray-500 mb-2">
                            <span className="text-accent-400">{inn.previousBowler}</span> just bowled — they cannot bowl two overs in a row.
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {(inn.bowlingTeam === match.team1 ? match.team1Players : match.team2Players)
                            .filter(p => p.name !== inn.previousBowler)
                            .map(p => (
                            <button key={p.id} onClick={async () => {
                              // Mirror the bowler-change modal: persist
                              // previousBowler so the rule keeps firing
                              // for the over after this one too.
                              const justFinished = inn.currentBowler || inn.previousBowler || '';
                              const updatedInn = { ...inn, currentBowler: p.name, previousBowler: justFinished };
                              const updated = { ...match, [match.currentInnings === 1 ? 'innings1' : 'innings2']: updatedInn };
                              setMatch(updated);
                              setShowBowlerModal(false);
                              if (updatedInn.currentBatter1 && updatedInn.currentBatter2) setShowBatterSelect(false);
                              await saveMatch(updated);
                            }} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-accent-500/20 hover:text-accent-400">{p.name}</button>
                          ))}
                        </div>
                        <div className="flex gap-1 mt-2">
                          <input
                            value={addBowlerName}
                            onChange={(e) => setAddBowlerName(e.target.value)}
                            placeholder="+ Other bowler…"
                            className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-gray-600 focus:outline-none focus:border-accent-500"
                          />
                          <button
                            onClick={async () => {
                              const added = addPlayerToTeam(match, inn.bowlingTeam, addBowlerName);
                              if (!added) return;
                              const innKey = match.currentInnings === 1 ? 'innings1' : 'innings2';
                              const justFinished = inn.currentBowler || inn.previousBowler || '';
                              const innFinal = { ...added.match[innKey], currentBowler: added.addedName, previousBowler: justFinished };
                              const matchFinal = { ...added.match, [innKey]: innFinal };
                              setMatch(matchFinal);
                              setAddBowlerName('');
                              setShowBowlerModal(false);
                              if (innFinal.currentBatter1 && innFinal.currentBatter2) setShowBatterSelect(false);
                              await saveMatch(matchFinal);
                            }}
                            disabled={!addBowlerName.trim()}
                            className="px-3 py-1 rounded bg-accent-500/20 text-accent-400 text-xs border border-accent-500/30 disabled:opacity-40"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bowler Change Modal — suppressed when batter-select
                  is open, since that modal renders its own bowler
                  picker so the user picks both in one place. */}
              {showBowlerModal && !showBatterSelect && (() => {
                const bowlerStats: Record<string, { balls: number; runs: number; wickets: number; maidens: number; wides: number; noballs: number }> = {};
                inn!.balls.forEach(b => {
                  if (!b.bowler) return;
                  if (!bowlerStats[b.bowler]) bowlerStats[b.bowler] = { balls: 0, runs: 0, wickets: 0, maidens: 0, wides: 0, noballs: 0 };
                  bowlerStats[b.bowler].runs += b.runs + b.extras;
                  if (b.extraType !== 'wide' && b.extraType !== 'noball') bowlerStats[b.bowler].balls++;
                  if (b.isWicket && b.wicketType !== 'Run Out') bowlerStats[b.bowler].wickets++;
                  if (b.extraType === 'wide') bowlerStats[b.bowler].wides++;
                  if (b.extraType === 'noball') bowlerStats[b.bowler].noballs++;
                });
                return (
                <div className="glass rounded-2xl p-6 border-2 border-accent-500/30">
                  <h3 className="text-lg font-bold text-white mb-3">Select Next Bowler</h3>
                  {inn!.previousBowler && (
                    <p className="text-xs text-gray-500 mb-3">
                      <span className="text-accent-400">{inn!.previousBowler}</span> just bowled — they cannot bowl two overs in a row, so they&apos;re hidden below.
                    </p>
                  )}
                  <div className="space-y-2">
                    {/* Pull players from the persisted match doc rather than
                        React state — survives page reloads and takeovers. */}
                    {(inn!.bowlingTeam === match!.team1 ? match!.team1Players : match!.team2Players)
                      .filter(p => p.name !== inn!.currentBowler && p.name !== inn!.previousBowler)
                      .map(p => {
                        const s = bowlerStats[p.name];
                        const overs = s ? `${Math.floor(s.balls / 6)}.${s.balls % 6}` : '0';
                        return (
                        <button key={p.id} onClick={async () => {
                          // The bowler who just finished is whichever
                          // is currently set OR the explicit previousBowler
                          // from the data. This becomes the new previousBowler
                          // so the modal will exclude them next over too.
                          const justFinished = inn!.currentBowler || inn!.previousBowler || '';
                          const updatedInn = {
                            ...inn!,
                            currentBowler: p.name,
                            previousBowler: justFinished,
                          };
                          const updated = {
                            ...match!,
                            [match!.currentInnings === 1 ? 'innings1' : 'innings2']: updatedInn,
                          };
                          setMatch(updated);
                          setShowBowlerModal(false);
                          // Persist to Firestore immediately so a takeover
                          // / refresh sees the new bowler.
                          await saveMatch(updated);
                        }} className="w-full text-left px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-accent-500/20 hover:border-accent-500/30 transition-all flex justify-between items-center">
                          <span className="text-sm text-gray-300">{p.name}</span>
                          {s ? (
                            <span className="text-xs text-gray-500">{overs}-{s.maidens}-{s.runs}-{s.wickets} | Wd:{s.wides} Nb:{s.noballs}</span>
                          ) : (
                            <span className="text-xs text-gray-600">Not bowled yet</span>
                          )}
                        </button>
                        );
                      })}
                    <div className="flex gap-1 mt-2">
                      <input
                        value={addBowlerName}
                        onChange={(e) => setAddBowlerName(e.target.value)}
                        placeholder="+ Other bowler…"
                        className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-gray-600 focus:outline-none focus:border-accent-500"
                      />
                      <button
                        onClick={async () => {
                          if (!match || !inn) return;
                          const added = addPlayerToTeam(match, inn.bowlingTeam, addBowlerName);
                          if (!added) return;
                          const innKey = match.currentInnings === 1 ? 'innings1' : 'innings2';
                          const justFinished = inn.currentBowler || inn.previousBowler || '';
                          const innFinal = { ...added.match[innKey], currentBowler: added.addedName, previousBowler: justFinished };
                          const matchFinal = { ...added.match, [innKey]: innFinal };
                          setMatch(matchFinal);
                          setAddBowlerName('');
                          setShowBowlerModal(false);
                          await saveMatch(matchFinal);
                        }}
                        disabled={!addBowlerName.trim()}
                        className="px-3 py-1 rounded bg-accent-500/20 text-accent-400 text-xs border border-accent-500/30 disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                );
              })()}

              {/* Scoring Buttons */}
              {!showBatterSelect && !showBowlerModal && !showWicketModal && inn.currentBatter1 && inn.currentBowler && (
                <div className="glass rounded-2xl p-4 border border-white/10">
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[0, 1, 2, 3].map(r => (
                      <button key={r} onClick={() => recordBall(r)} className="py-4 rounded-xl bg-white/5 text-white font-bold text-lg border border-white/10 hover:bg-white/10 active:bg-primary-500/20 transition-all">{r}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button onClick={() => recordBall(4)} className="py-3 rounded-xl bg-primary-500/20 text-primary-400 font-bold border border-primary-500/30 hover:bg-primary-500/30 transition-all">4 FOUR</button>
                    <button onClick={() => recordBall(6)} className="py-3 rounded-xl bg-accent-500/20 text-accent-400 font-bold border border-accent-500/30 hover:bg-accent-500/30 transition-all">6 SIX</button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <button onClick={() => setShowExtrasMenu(showExtrasMenu === 'wide' ? null : 'wide')} className={`py-2 rounded-lg text-xs font-medium border transition-all ${showExtrasMenu === 'wide' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>Wide</button>
                    <button onClick={() => setShowExtrasMenu(showExtrasMenu === 'noball' ? null : 'noball')} className={`py-2 rounded-lg text-xs font-medium border transition-all ${showExtrasMenu === 'noball' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>No Ball</button>
                    <button onClick={() => setShowExtrasMenu(showExtrasMenu === 'bye' ? null : 'bye')} className={`py-2 rounded-lg text-xs font-medium border transition-all ${showExtrasMenu === 'bye' ? 'bg-gray-500/20 text-gray-300 border-gray-500/50' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>Bye</button>
                    <button onClick={() => setShowExtrasMenu(showExtrasMenu === 'legbye' ? null : 'legbye')} className={`py-2 rounded-lg text-xs font-medium border transition-all ${showExtrasMenu === 'legbye' ? 'bg-gray-500/20 text-gray-300 border-gray-500/50' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>Leg Bye</button>
                  </div>
                  {showExtrasMenu && (
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {(showExtrasMenu === 'bye' || showExtrasMenu === 'legbye' ? [1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4, 5, 6]).map(r => (
                        <button key={r} onClick={() => { recordBall(r, showExtrasMenu); setShowExtrasMenu(null); }}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                            showExtrasMenu === 'wide' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20' :
                            showExtrasMenu === 'noball' ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' :
                            'bg-gray-500/10 text-gray-300 border-gray-500/30 hover:bg-gray-500/20'
                          }`}>
                          {showExtrasMenu === 'wide' ? 'Wd' : showExtrasMenu === 'noball' ? 'Nb' : showExtrasMenu === 'bye' ? 'B' : 'Lb'}{r > 0 ? `+${r}` : showExtrasMenu === 'wide' || showExtrasMenu === 'noball' ? '' : ''}
                        </button>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setShowWicketModal(true)} className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 font-bold border border-red-500/30 hover:bg-red-500/30 transition-all">WICKET</button>

                  {/* This Over */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-gray-500 text-xs mb-1">This Over:</p>
                    <div className="flex gap-1 flex-wrap">
                      {(() => {
                        // The in-progress over is `floor(legalBalls / 6)`,
                        // not `floor((legalBalls - 1) / 6)`. The minus-one
                        // form anchored on the last ball, so at an over
                        // boundary it kept pointing back at the over that
                        // just finished — making the new bowler's "This
                        // Over:" panel display the previous bowler's
                        // last 6 deliveries before they'd bowled at all.
                        // Each ball already stores its own `over` index
                        // (set in recordBall before any swap), so the
                        // filter is just `b.over === currentOver` — the
                        // old `|| extraType === 'wide'/'noball'` clause
                        // was a leftover that pulled wides from past
                        // overs in too.
                        const legalCount = inn.balls.filter(b => b.extraType !== 'wide' && b.extraType !== 'noball').length;
                        const currentOver = Math.floor(legalCount / 6);
                        return inn.balls.filter(b => b.over === currentOver).slice(-8);
                      })().map((b, i) => (
                        <span key={i} className={`text-xs px-2 py-1 rounded ${b.isWicket ? 'bg-red-500/20 text-red-400' : b.isSix ? 'bg-accent-500/20 text-accent-400' : b.isBoundary ? 'bg-primary-500/20 text-primary-400' : b.extraType ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400'}`}>
                          {b.isWicket ? 'W' : b.extraType === 'wide' ? `Wd${b.runs > 0 ? '+' + b.runs : ''}` : b.extraType === 'noball' ? `Nb${b.runs > 0 ? '+' + b.runs : ''}` : b.extraType ? `${b.runs}${b.extraType[0]}` : b.runs}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Undo & Scorecard — always visible while in scoring view
                  (independent of any modal) so the user can undo their
                  way out of a stuck state inherited from a takeover or
                  a half-completed wicket flow. */}
              {inn.balls.length > 0 && (
                <div className="flex gap-2">
                  <button onClick={undoLastBall} className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs border border-red-500/20 hover:bg-red-500/20 transition-all">Undo Last Ball</button>
                  <button onClick={() => setView('scorecard')} className="flex-1 py-2 rounded-lg bg-white/5 text-gray-400 text-xs border border-white/10 hover:bg-white/10">View Scorecard</button>
                </div>
              )}

              {/* Retire-batter action sheet — opened by clicking on a
                  batter name in the status card. Two paths:
                  • "Retire & replace" just clears the slot (no wicket
                    counted) so the auto-show batter modal prompts for
                    the replacement. Common in practice rotation.
                  • "Retire Out" pre-fills the existing wicket modal
                    with the right wicketType + dismissedPlayer, so
                    one tap on Confirm Wicket records it cricket-
                    correctly. */}
              {retireTarget && (() => {
                const name = retireTarget === 'batter1' ? inn.currentBatter1 : inn.currentBatter2;
                if (!name) { setRetireTarget(null); return null; }
                return (
                  <div className="glass rounded-2xl p-5 border-2 border-accent-500/30">
                    <h3 className="text-base font-bold text-white mb-1">Retire <span className="text-primary-400">{name}</span>?</h3>
                    <p className="text-xs text-gray-500 mb-4">Choose how to record this. The new batter picker will open after.</p>
                    <div className="space-y-2">
                      <button
                        onClick={async () => {
                          if (!match) return;
                          const innKey = match.currentInnings === 1 ? 'innings1' : 'innings2';
                          const updatedInn = {
                            ...inn,
                            ...(retireTarget === 'batter1' ? { currentBatter1: '' } : { currentBatter2: '' }),
                          };
                          const updatedMatch = { ...match, [innKey]: updatedInn };
                          setMatch(updatedMatch);
                          setRetireTarget(null);
                          await saveMatch(updatedMatch);
                        }}
                        className="w-full py-2 rounded-lg bg-white/5 text-gray-300 text-sm border border-white/10 hover:bg-white/10 transition-all text-left px-3"
                      >
                        🔄 Retire &amp; replace <span className="text-gray-500 text-xs">— no wicket (practice rotation)</span>
                      </button>
                      <button
                        onClick={() => {
                          // Pre-load the wicket modal so the user just
                          // taps Confirm Wicket. Reuses the existing
                          // wicket-recording flow (recordBall handles
                          // the synthetic ball + dismissal stats).
                          setWicketType('Retired Out');
                          setDismissedPlayer(name);
                          setShowWicketModal(true);
                          setRetireTarget(null);
                        }}
                        className="w-full py-2 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20 hover:bg-red-500/20 transition-all text-left px-3"
                      >
                        🎯 Retire Out <span className="text-red-400/60 text-xs">— counts as a wicket</span>
                      </button>
                      <button
                        onClick={() => setRetireTarget(null)}
                        className="w-full py-2 rounded-lg bg-white/5 text-gray-500 text-xs border border-white/10 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Rename Players — small affordance for fixing typos /
                  placeholder names like "12". Always available. */}
              <div className="text-center">
                <button
                  onClick={() => setShowPlayerRename(true)}
                  className="text-xs text-gray-500 hover:text-primary-400 underline decoration-dotted"
                >
                  ✏️ Edit player names
                </button>
              </div>

              {/* Rename modal — propagates the new name everywhere
                  (roster, current selections, all ball events) via
                  renamePlayer. Each input fires onBlur so the user
                  can rename multiple players in one panel. */}
              {showPlayerRename && (
                <div className="glass rounded-2xl p-4 border-2 border-primary-500/30">
                  <h3 className="text-lg font-bold text-white mb-1">Edit Player Names</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Renames apply across the roster, current striker/non-striker/bowler, and every recorded ball. Tab or click out of a field to apply.
                  </p>
                  {[
                    { team: match.team1, players: match.team1Players },
                    { team: match.team2, players: match.team2Players },
                  ].map(({ team, players }) => (
                    <div key={team} className="mb-3">
                      <p className="text-xs font-bold text-primary-400 mb-2">{team}</p>
                      <div className="space-y-1">
                        {players.map(p => (
                          <input
                            key={p.id}
                            defaultValue={p.name}
                            onBlur={async (e) => {
                              const v = e.target.value.trim();
                              if (v && v !== p.name) await renamePlayer(p.name, v);
                            }}
                            className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowPlayerRename(false)}
                    className="w-full mt-2 py-2 rounded-lg bg-primary-500/20 text-primary-400 text-sm font-bold border border-primary-500/30"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Wicket Modal */}
              {showWicketModal && (
                <div className="glass rounded-2xl p-6 border-2 border-red-500/30">
                  <h3 className="text-lg font-bold text-red-400 mb-3">Wicket</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-xs mb-2">How out?</p>
                      <div className="flex flex-wrap gap-1">
                        {WICKET_TYPES.map(w => (
                          <button key={w} onClick={() => setWicketType(w)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${wicketType === w ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{w}</button>
                        ))}
                      </div>
                    </div>
                    {wicketType && (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Who is out?</p>
                        <div className="flex flex-wrap gap-1">
                          {[inn.currentBatter1, inn.currentBatter2].filter(Boolean).map(b => (
                            <button key={b} onClick={() => setDismissedPlayer(b)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${dismissedPlayer === b ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{b}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {wicketType && ['Caught', 'Caught & Bowled', 'Stumped', 'Run Out'].includes(wicketType) && (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Fielder:</p>
                        <div className="flex flex-wrap gap-1">
                          {(inn.bowlingTeam === match.team1 ? match.team1Players : match.team2Players).map(p => (
                            <button key={p.id} onClick={() => setFielder(p.name)} className={`text-xs px-2 py-1 rounded-lg border transition-all ${fielder === p.name ? 'bg-accent-500/20 text-accent-400 border-accent-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{p.name}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => { setShowWicketModal(false); setWicketType(''); setDismissedPlayer(''); setFielder(''); }} className="flex-1 py-2 rounded-lg bg-white/5 text-gray-400 text-sm border border-white/10">Cancel</button>
                      <button onClick={() => { if (wicketType && dismissedPlayer) recordBall(0, '', true); }} disabled={!wicketType || !dismissedPlayer} className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-bold border border-red-500/30 disabled:opacity-40">Confirm Wicket</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Innings Break */}
              {match.status === 'innings_break' && (
                <div className="glass rounded-2xl p-8 border-2 border-accent-500/30 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Innings Break</h3>
                  <p className="text-gray-400 mb-4">{match.innings1.battingTeam} scored {match.innings1.totalRuns}/{match.innings1.totalWickets} in {getOversBalls(match.innings1.totalBalls)} overs</p>
                  <p className="text-accent-400 font-bold mb-6">Target: {match.innings1.totalRuns + 1}</p>
                  <button onClick={() => {
                    setMatch({ ...match, currentInnings: 2, status: 'playing' });
                    setShowBatterSelect(true);
                  }} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold shadow-xl hover:scale-105 transition-all">
                    Start 2nd Innings
                  </button>
                </div>
              )}

              {/* Match Complete */}
              {match.status === 'completed' && (
                <div className="glass rounded-2xl p-8 border-2 border-primary-500/30 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Match Complete</h3>
                  <p className="text-primary-400 font-bold text-lg mb-4">{match.result}</p>
                  <button onClick={() => setView('scorecard')} className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold shadow-xl hover:scale-105 transition-all">
                    View Full Scorecard
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SCORECARD */}
          {view === 'scorecard' && match && (
            <div className="space-y-4">
              <button onClick={() => setView(match.status === 'completed' ? 'home' : 'scoring')} className="text-gray-500 text-sm hover:text-primary-400">&larr; {match.status === 'completed' ? 'Back' : 'Back to Scoring'}</button>

              <div className="glass rounded-2xl p-6 border border-white/10 text-center">
                <p className="text-gray-400 text-sm">{match.team1} vs {match.team2}</p>
                <p className="text-gray-500 text-xs">{match.date} | {match.venue} | {match.totalOvers} overs</p>
                <p className="text-gray-500 text-xs">Toss: {match.tossWinner} elected to {match.tossDecision}</p>
                {match.result && <p className="text-primary-400 font-bold mt-2">{match.result}</p>}
              </div>

              {/* MVP / Best Batter / Best Bowler / Best Fielder / Top-3
                  Impact — same component the public /c3h/live page
                  renders for completed matches. Lives above the
                  per-innings tables so the headline awards land before
                  the detailed scorecard. */}
              <MatchSummary match={match} />

              {/* Replay URL editor — scorer attaches the YouTube /
                  highlights link here after the upload is live. Once
                  saved, MatchSummary picks it up and embeds the
                  player on /c3h/live + the share text includes it. */}
              <div className="glass rounded-2xl p-4 border border-white/10">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">📺 Match Replay URL</p>
                <p className="text-gray-500 text-xs mb-3">
                  Paste the YouTube full-match or highlights link. It will appear on the public live page and in the shared scorecard.
                </p>
                <div className="flex gap-2">
                  <input
                    defaultValue={match.replayUrl || ''}
                    placeholder="https://www.youtube.com/watch?v=..."
                    onBlur={async (e) => {
                      const v = e.target.value.trim();
                      if (v === (match.replayUrl || '')) return;
                      const updated: Match = { ...match, replayUrl: v || undefined };
                      setMatch(updated);
                      await saveMatch(updated);
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-primary-500"
                  />
                </div>
                {match.replayUrl && (
                  <p className="text-xs text-primary-400 mt-2">
                    ✓ Replay attached — it&apos;ll show on the public live page.
                  </p>
                )}
              </div>

              {[match.innings1, match.innings2].map((inning, idx) => {
                if (inning.balls.length === 0) return null;
                const batStats = getBattingStats(inning);
                const bowlStats = getBowlingStats(inning);
                return (
                  <div key={idx} className="glass rounded-2xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-white">{inning.battingTeam}</h3>
                      <p className="text-xl font-bold text-primary-400">{inning.totalRuns}/{inning.totalWickets} ({getOversBalls(inning.totalBalls)})</p>
                    </div>

                    {/* Batting */}
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-xs">
                        <thead><tr className="text-gray-500 border-b border-white/10">
                          <th className="text-left py-2 pr-2">Batter</th><th className="text-right px-1">R</th><th className="text-right px-1">B</th><th className="text-right px-1">4s</th><th className="text-right px-1">6s</th><th className="text-right pl-1">SR</th>
                        </tr></thead>
                        <tbody>{batStats.map(b => (
                          <tr key={b.name} className="border-b border-white/5">
                            <td className="py-1.5 pr-2"><span className="text-white">{b.name}</span>{b.isOut && <span className="text-red-400 text-xs block">{b.howOut}</span>}{!b.isOut && <span className="text-primary-400 text-xs"> not out</span>}</td>
                            <td className="text-right px-1 text-white font-bold">{b.runs}</td>
                            <td className="text-right px-1 text-gray-400">{b.balls}</td>
                            <td className="text-right px-1 text-gray-400">{b.fours}</td>
                            <td className="text-right px-1 text-gray-400">{b.sixes}</td>
                            <td className="text-right pl-1 text-gray-400">{b.sr}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Extras: {inning.extras.wides}w {inning.extras.noballs}nb {inning.extras.byes}b {inning.extras.legbyes}lb (Total: {inning.extras.wides + inning.extras.noballs + inning.extras.byes + inning.extras.legbyes})</p>

                    {/* Bowling */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="text-gray-500 border-b border-white/10">
                          <th className="text-left py-2 pr-2">Bowler</th><th className="text-right px-1">O</th><th className="text-right px-1">R</th><th className="text-right px-1">W</th><th className="text-right px-1">Dots</th><th className="text-right pl-1">Eco</th>
                        </tr></thead>
                        <tbody>{bowlStats.map(b => (
                          <tr key={b.name} className="border-b border-white/5">
                            <td className="py-1.5 pr-2 text-white">{b.name}</td>
                            <td className="text-right px-1 text-gray-400">{b.oversDisplay}</td>
                            <td className="text-right px-1 text-white">{b.runs}</td>
                            <td className="text-right px-1 text-primary-400 font-bold">{b.wickets}</td>
                            <td className="text-right px-1 text-gray-400">{b.dots}</td>
                            <td className="text-right pl-1 text-gray-400">{b.economy}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Takeover confirmation modal — shown when opening a match
          currently being scored by someone else. Confirms intent
          before claiming the scorer slot. */}
      {takeoverPrompt && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setTakeoverPrompt(null); }}
        >
          <div className="glass rounded-2xl p-6 max-w-md w-full border-2 border-accent-500/40">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">🔄</span>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Take over scoring?</h3>
                <p className="text-sm text-gray-300">
                  This match is currently being scored by{' '}
                  <strong className="text-accent-400">{takeoverPrompt.scorer?.split('@')[0]}</strong>.
                  Taking over hands the scoring controls to you — they will see a notice on their next save.
                </p>
              </div>
            </div>
            <div className="rounded-xl p-3 mb-4 bg-white/5 border border-white/10">
              <p className="text-xs text-gray-500">Match</p>
              <p className="text-sm font-bold text-white">{takeoverPrompt.team1} vs {takeoverPrompt.team2}</p>
              <p className="text-xs text-gray-500 mt-1">
                Last saved: {takeoverPrompt.updatedAt
                  ? new Date(takeoverPrompt.updatedAt).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true })
                  : '—'}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setTakeoverPrompt(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const m = takeoverPrompt;
                    setMatch(m);
                    setMatchId(m.id);
                    setLastSavedAt(m.updatedAt || null);
                    setSaveStatus(m.updatedAt ? 'saved' : 'idle');
                    setView(m.status === 'completed' ? 'scorecard' : 'scoring');
                    setTakeoverPrompt(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-accent-500/20 text-accent-400 border border-accent-500/40 hover:bg-accent-500/30 text-sm font-bold"
                >
                  Take Over &amp; Resume
                </button>
              </div>
              <Link
                href="/c3h/live"
                onClick={() => setTakeoverPrompt(null)}
                className="block w-full text-center px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-sm font-semibold"
              >
                📡 Just watch live (read-only) →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
