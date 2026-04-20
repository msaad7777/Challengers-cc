"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  Match, Player, BallEvent, Innings,
  C3H_PLAYERS, LCL_TEAMS, WICKET_TYPES,
  createEmptyInnings, getBattingStats, getBowlingStats,
  getOversBalls, getRunRate, getRequiredRunRate,
} from './types';

type View = 'home' | 'setup' | 'toss' | 'players' | 'scoring' | 'scorecard' | 'matches';

export default function ScorerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [view, setView] = useState<View>('home');
  const [match, setMatch] = useState<Match | null>(null);
  const [matchId, setMatchId] = useState('');
  const [savedMatches, setSavedMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  // Setup state
  const [matchType, setMatchType] = useState<'league' | 'practice'>('practice');
  const [team1, setTeam1] = useState('Challengers Cricket Club');
  const [team2, setTeam2] = useState('');
  const [customTeam, setCustomTeam] = useState('');
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
  const [newBatter, setNewBatter] = useState('');
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showBatterSelect, setShowBatterSelect] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  const loadMatches = useCallback(async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      // Load own matches
      const q1 = query(collection(db, 'matches'), where('createdBy', '==', session.user.email.toLowerCase()), orderBy('createdAt', 'desc'));
      const snap1 = await getDocs(q1);
      const ownMatches = snap1.docs.map(d => ({ ...d.data(), id: d.id } as Match));

      // Load all in-progress matches (for scorer takeover)
      try {
        const q2 = query(collection(db, 'matches'), where('status', '==', 'playing'), orderBy('createdAt', 'desc'));
        const snap2 = await getDocs(q2);
        const activeMatches = snap2.docs.map(d => ({ ...d.data(), id: d.id } as Match));

        // Merge without duplicates
        const allIds = new Set(ownMatches.map(m => m.id));
        const merged = [...ownMatches, ...activeMatches.filter(m => !allIds.has(m.id))];
        setSavedMatches(merged);
      } catch {
        setSavedMatches(ownMatches);
      }
    } catch { /* index building */ }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (session?.user?.email) loadMatches();
  }, [session, loadMatches]);

  const saveMatch = async (m: Match) => {
    const data = { ...m, scorer: session?.user?.email || m.scorer, updatedAt: new Date().toISOString() };
    if (matchId) {
      await updateDoc(doc(db, 'matches', matchId), data);
    } else {
      const ref = await addDoc(collection(db, 'matches'), data);
      setMatchId(ref.id);
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

    // Restore batters from before this ball
    const updatedInnings: Innings = {
      ...inn,
      balls: newBalls,
      totalRuns,
      totalWickets,
      totalOvers: Math.floor(legalBalls / 6),
      totalBalls: legalBalls,
      extras: updatedExtras,
      currentBatter1: lastBall.batter || inn.currentBatter1,
      currentBowler: lastBall.bowler || inn.currentBowler,
      isComplete: false,
    };

    // If wicket was undone, restore dismissed player
    if (lastBall.isWicket && lastBall.dismissedPlayer) {
      if (lastBall.dismissedPlayer === inn.currentBatter1 || !inn.currentBatter1) {
        updatedInnings.currentBatter1 = lastBall.dismissedPlayer;
      } else {
        updatedInnings.currentBatter2 = lastBall.dismissedPlayer;
      }
    }

    // Reverse strike rotation
    if (lastBall.extraType !== 'wide' && lastBall.extraType !== 'noball') {
      if (legalBalls % 6 === 0 && legalBalls > 0) {
        // Was end of over — swap back
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

  const recordBall = async (runs: number, extraType: '' | 'wide' | 'noball' | 'bye' | 'legbye' = '', isWicket = false) => {
    if (!match) return;
    const inn = getCurrentInnings()!;
    const isLegal = extraType !== 'wide' && extraType !== 'noball';
    const currentLegalBalls = inn.balls.filter(b => b.extraType !== 'wide' && b.extraType !== 'noball').length;
    const currentOver = Math.floor(currentLegalBalls / 6);
    const currentBallInOver = (currentLegalBalls % 6) + 1;

    const ball: BallEvent = {
      id: Date.now().toString(),
      over: currentOver,
      ball: isLegal ? currentBallInOver : currentLegalBalls % 6,
      batter: inn.currentBatter1,
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

    // Rotate strike on odd runs (1, 3) or end of over
    if (isLegal && legalBalls % 6 === 0) {
      // End of over - swap batters
      const temp = updatedInnings.currentBatter1;
      updatedInnings.currentBatter1 = updatedInnings.currentBatter2;
      updatedInnings.currentBatter2 = temp;
      setShowBowlerModal(true);
    } else if (runs % 2 === 1) {
      const temp = updatedInnings.currentBatter1;
      updatedInnings.currentBatter1 = updatedInnings.currentBatter2;
      updatedInnings.currentBatter2 = temp;
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

    // Reset wicket modal and clear dismissed batter
    if (isWicket) {
      // Clear the dismissed player from current batters
      const innKey = match.currentInnings === 1 ? 'innings1' : 'innings2';
      const latestInn = updatedMatch[innKey];
      if (dismissedPlayer === latestInn.currentBatter1) {
        latestInn.currentBatter1 = '';
      } else if (dismissedPlayer === latestInn.currentBatter2) {
        latestInn.currentBatter2 = '';
      }
      setMatch({ ...updatedMatch, [innKey]: latestInn });

      setShowWicketModal(false);
      setWicketType('');
      setDismissedPlayer('');
      setFielder('');
      setShowBatterSelect(true);
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
            <h1 className="text-3xl font-bold text-white mt-2">The <span className="gradient-text">Scorer</span></h1>
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
                    {savedMatches.slice(0, 5).map(m => (
                      <button key={m.id} onClick={() => { setMatch(m); setMatchId(m.id); setView(m.status === 'completed' ? 'scorecard' : 'scoring'); }} className="w-full text-left glass rounded-xl p-4 border border-white/10 hover:border-primary-500/30 transition-all">
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
                        {m.status !== 'completed' && m.scorer && m.scorer !== session?.user?.email && (
                          <p className="text-gray-500 text-xs mt-1">Scorer: {m.scorer.split('@')[0]}</p>
                        )}
                      </button>
                    ))}
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
                      <input value={customTeam} onChange={e => { setCustomTeam(e.target.value); setTeam2(e.target.value); }} placeholder="Enter team name" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500 placeholder-gray-600" />
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
                setMatchId('');
                await saveMatch(newMatch);
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
                    <div className="flex justify-between text-xs mb-1">
                      <div>
                        <span className="text-primary-400 font-bold">🏏 {inn.currentBatter1 || 'Select batter'}</span>
                        <span className="text-gray-500 ml-1">*</span>
                        {inn.currentBatter1 && <span className="text-white font-bold ml-2">{b1.runs}({b1.balls})</span>}
                      </div>
                      <div>
                        <span className="text-gray-400">{inn.currentBatter2 || 'Select batter'}</span>
                        {inn.currentBatter2 && <span className="text-white font-bold ml-2">{b2.runs}({b2.balls})</span>}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      🎾 {inn.currentBowler || 'Select bowler'}
                      {inn.currentBowler && <span className="text-white font-bold ml-2">{bw.overs}-{bw.runs}-{bw.wickets}</span>}
                    </div>
                  </div>
                );
              })()}

              {/* Select Batters Modal */}
              {showBatterSelect && (
                <div className="glass rounded-2xl p-6 border-2 border-primary-500/30">
                  <h3 className="text-lg font-bold text-white mb-3">{inn.totalWickets > 0 && (!inn.currentBatter1 || !inn.currentBatter2) ? 'Select New Batter' : 'Select Batters'}</h3>
                  <div className="space-y-3">
                    {!inn.currentBatter1 && (() => {
                      const dismissed = inn.balls.filter(b => b.isWicket).map(b => b.dismissedPlayer);
                      const available = (inn.battingTeam === team1 ? team1Players : team2Players)
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
                      </div>
                      );
                    })()}
                    {!inn.currentBatter2 && (() => {
                      const dismissed = inn.balls.filter(b => b.isWicket).map(b => b.dismissedPlayer);
                      const available = (inn.battingTeam === team1 ? team1Players : team2Players)
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
                      </div>
                      );
                    })()}
                    {!inn.currentBowler && (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Opening Bowler:</p>
                        <div className="flex flex-wrap gap-1">
                          {(inn.bowlingTeam === team1 ? team1Players : team2Players).map(p => (
                            <button key={p.id} onClick={() => {
                              const updated = { ...match, [match.currentInnings === 1 ? 'innings1' : 'innings2']: { ...inn, currentBowler: p.name } };
                              setMatch(updated);
                              if (inn.currentBatter1 && inn.currentBatter2) setShowBatterSelect(false);
                            }} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-accent-500/20 hover:text-accent-400">{p.name}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bowler Change Modal */}
              {showBowlerModal && (() => {
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
                  <div className="space-y-2">
                    {(inn!.bowlingTeam === team1 ? team1Players : team2Players)
                      .filter(p => p.name !== inn!.currentBowler)
                      .map(p => {
                        const s = bowlerStats[p.name];
                        const overs = s ? `${Math.floor(s.balls / 6)}.${s.balls % 6}` : '0';
                        return (
                        <button key={p.id} onClick={() => {
                          const updated = { ...match!, [match!.currentInnings === 1 ? 'innings1' : 'innings2']: { ...inn!, currentBowler: p.name } };
                          setMatch(updated);
                          setShowBowlerModal(false);
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
                      {(showExtrasMenu === 'bye' || showExtrasMenu === 'legbye' ? [1, 2, 3, 4] : [0, 1, 2, 3, 4]).map(r => (
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
                      {inn.balls.filter(b => {
                        const legal = inn.balls.filter(bb => bb.extraType !== 'wide' && bb.extraType !== 'noball');
                        const currentOver = Math.floor(legal.length > 0 ? (legal.length - 1) / 6 : 0);
                        return b.over === currentOver || (b.extraType === 'wide' || b.extraType === 'noball');
                      }).slice(-8).map((b, i) => (
                        <span key={i} className={`text-xs px-2 py-1 rounded ${b.isWicket ? 'bg-red-500/20 text-red-400' : b.isSix ? 'bg-accent-500/20 text-accent-400' : b.isBoundary ? 'bg-primary-500/20 text-primary-400' : b.extraType ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400'}`}>
                          {b.isWicket ? 'W' : b.extraType === 'wide' ? `Wd${b.runs > 0 ? '+' + b.runs : ''}` : b.extraType === 'noball' ? `Nb${b.runs > 0 ? '+' + b.runs : ''}` : b.extraType ? `${b.runs}${b.extraType[0]}` : b.runs}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Undo & Scorecard */}
                  <div className="mt-3 flex gap-2">
                    <button onClick={undoLastBall} disabled={!inn || inn.balls.length === 0} className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs border border-red-500/20 hover:bg-red-500/20 disabled:opacity-30 transition-all">Undo Last Ball</button>
                    <button onClick={() => setView('scorecard')} className="flex-1 py-2 rounded-lg bg-white/5 text-gray-400 text-xs border border-white/10 hover:bg-white/10">View Scorecard</button>
                  </div>
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
                          {(inn.bowlingTeam === team1 ? team1Players : team2Players).map(p => (
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
    </div>
  );
}
