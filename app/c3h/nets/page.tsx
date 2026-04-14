"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Reflection {
  id: string;
  email: string;
  date: string;
  matchIndex: number;
  match: string;
  opponent: string;
  howGotOut: string | string[];
  whatWentRight: string[];
  whatWentWrong: string[];
  mindsetWord: string;
  nextInningsPlan: string;
  strengthToBuild: string;
  pressureResponse: string;
  intentScore: number;
  notes: string;
  createdAt: string;
}

const HOW_GOT_OUT_OPTIONS = [
  'Bowled', 'Caught — Slips/Gully', 'Caught — Infield', 'Caught — Boundary',
  'Caught — Keeper', 'Caught — Hit straight to fielder', 'LBW', 'Run Out',
  'Stumped', 'Hit Wicket', 'Did not bat', 'Not out',
];

const WHAT_WENT_RIGHT_OPTIONS = [
  'Good shot selection', 'Rotated strike well', 'Played to my strengths',
  'Stayed patient early', 'Good footwork', 'Read the bowler well',
  'Stayed calm under pressure', 'Used my pre-ball routine', 'Good intent throughout',
  'Converted a start into a score', 'Good running between wickets', 'Adapted to conditions',
];

const WHAT_WENT_WRONG_OPTIONS = [
  'Poor shot selection', 'Played too early', 'Played too late', 'Rushed my innings',
  'No clear plan', 'Froze under pressure', 'Chased a wide delivery', 'Forgot my routine',
  'Overthinking', 'Lost concentration', 'Poor footwork', 'Tried to hit too hard',
  'Defensive mindset', 'Did not rotate strike', 'Fatigue or distraction',
];

const MATCHES = [
  { label: 'M1 — vs London Predators (May 10)', index: 1 },
  { label: 'M2 — vs Forest City Cricketers (May 18)', index: 2 },
  { label: 'M3 — vs Sarnia Spartans (Jun 14)', index: 3 },
  { label: 'M4 — vs Western Cricket Academy B (Jun 27)', index: 4 },
  { label: 'M5 — vs London Rising Stars (Jul 1)', index: 5 },
  { label: 'M6 — vs LCC Maple Stars (Jul 11)', index: 6 },
  { label: 'M7 — vs LCC Mavericks (Jul 25)', index: 7 },
  { label: 'M8 — vs London Rising Stars (Jul 26)', index: 8 },
  { label: 'M9 — vs Western Cricket Academy B (Aug 2)', index: 9 },
  { label: 'M10 — vs Forest City Cricketers (Aug 8)', index: 10 },
  { label: 'M11 — vs Sarnia Spartans (Aug 23)', index: 11 },
  { label: 'M12 — vs London Eagle Predators (Sep 5)', index: 12 },
  { label: 'M13 — vs Inferno Spartans (Sep 12)', index: 13 },
  { label: 'M14 — vs Tigers Cricket Club (Sep 13)', index: 14 },
  { label: 'Practice Session', index: 99 },
];

export default function NetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [view, setView] = useState<'list' | 'new' | 'detail' | 'patterns'>('list');
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [match, setMatch] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);
  const [howGotOut, setHowGotOut] = useState<string[]>([]);
  const [whatWentRight, setWhatWentRight] = useState<string[]>([]);
  const [whatWentWrong, setWhatWentWrong] = useState<string[]>([]);
  const [mindsetWord, setMindsetWord] = useState('');
  const [nextInningsPlan, setNextInningsPlan] = useState('');
  const [strengthToBuild, setStrengthToBuild] = useState('');
  const [pressureResponse, setPressureResponse] = useState('');
  const [intentScore, setIntentScore] = useState(3);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  const loadReflections = async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    const q = query(
      collection(db, 'reflections'),
      where('email', '==', session.user.email.toLowerCase()),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Reflection));

    // Auto-delete reflections older than 3 matches (keep last 3 match reflections + all practice)
    const matchReflections = data.filter(r => r.matchIndex !== 99);
    const practiceReflections = data.filter(r => r.matchIndex === 99);
    if (matchReflections.length > 3) {
      const toDelete = matchReflections.slice(3);
      for (const r of toDelete) {
        await deleteDoc(doc(db, 'reflections', r.id));
      }
    }
    const kept = [...matchReflections.slice(0, 3), ...practiceReflections.slice(0, 3)];
    setReflections(kept);
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.email) loadReflections().catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (status === 'loading' || !session) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-primary-400">Loading...</div></div>;
  }

  const toggleCheckbox = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const handleSubmit = async () => {
    if (!match || !session.user?.email) return;
    setSaving(true);
    const opponent = match.includes('vs') ? match.split('vs ')[1]?.split(' (')[0] || '' : '';
    await addDoc(collection(db, 'reflections'), {
      email: session.user.email.toLowerCase(),
      date: new Date().toISOString().split('T')[0],
      matchIndex,
      match,
      opponent,
      howGotOut,
      whatWentRight,
      whatWentWrong,
      mindsetWord,
      nextInningsPlan,
      strengthToBuild,
      pressureResponse,
      intentScore,
      notes,
      createdAt: new Date().toISOString(),
    });
    try { await loadReflections(); } catch { /* index may still be building */ }
    setSaving(false);
    setView('list');
    setMatch(''); setMatchIndex(0); setHowGotOut([]); setWhatWentRight([]);
    setWhatWentWrong([]); setMindsetWord(''); setNextInningsPlan('');
    setStrengthToBuild(''); setPressureResponse(''); setIntentScore(3); setNotes('');
  };

  // Pattern analysis
  const getPatterns = () => {
    const matchRefs = reflections.filter(r => r.matchIndex !== 99);
    if (matchRefs.length < 2) return null;

    const mistakeCounts: Record<string, number> = {};
    const strengthCounts: Record<string, number> = {};
    const dismissalCounts: Record<string, number> = {};

    matchRefs.forEach(r => {
      r.whatWentWrong.forEach(w => { mistakeCounts[w] = (mistakeCounts[w] || 0) + 1; });
      r.whatWentRight.forEach(w => { strengthCounts[w] = (strengthCounts[w] || 0) + 1; });
      const outs = Array.isArray(r.howGotOut) ? r.howGotOut : r.howGotOut ? [r.howGotOut] : [];
      outs.filter(o => o !== 'Not out' && o !== 'Did not bat').forEach(o => {
        dismissalCounts[o] = (dismissalCounts[o] || 0) + 1;
      });
    });

    const topMistakes = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topStrengths = Object.entries(strengthCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topDismissals = Object.entries(dismissalCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const intentTrend = matchRefs.map(r => ({ match: r.match.split(' —')[0], score: r.intentScore })).reverse();

    return { topMistakes, topStrengths, topDismissals, intentTrend, matchRefs };
  };

  const patterns = getPatterns();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-32 md:pt-40">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <Link href="/c3h/dashboard" className="text-gray-500 text-sm hover:text-primary-400 transition-colors mb-2 inline-block">&larr; Dashboard</Link>
              <h1 className="text-3xl font-bold text-white">The <span className="gradient-text">Nets</span></h1>
            </div>
            <div className="flex gap-2">
              {patterns && (
                <button
                  onClick={() => setView(view === 'patterns' ? 'list' : 'patterns')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    view === 'patterns' ? 'bg-accent-500/20 text-accent-400 border-accent-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  My Patterns
                </button>
              )}
              {view !== 'new' && (
                <button
                  onClick={() => setView('new')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium text-sm shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-105"
                >
                  + Reflection
                </button>
              )}
            </div>
          </div>

          {/* PATTERNS VIEW */}
          {view === 'patterns' && patterns && (
            <div className="space-y-6">
              {/* Growth Path */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">My Growth Path</h3>
                <div className="space-y-4">
                  {patterns.matchRefs.slice().reverse().map((r, i) => {
                    const prevRef = i > 0 ? patterns.matchRefs.slice().reverse()[i - 1] : null;
                    const fixedFromLast = prevRef ? r.whatWentRight.filter(w =>
                      prevRef.whatWentWrong.some(pw => w.toLowerCase().includes(pw.split(' ')[0].toLowerCase()))
                    ) : [];
                    return (
                      <div key={r.id} className="glass rounded-xl p-4 border-l-4 border-l-primary-500">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-bold text-sm">{r.match.split(' —')[0]}</span>
                          <span className="text-xs text-gray-500">{r.date}</span>
                        </div>
                        {r.whatWentWrong.length > 0 && (
                          <p className="text-red-400 text-xs mb-1">Mistake: {r.whatWentWrong[0]}</p>
                        )}
                        {r.nextInningsPlan && (
                          <p className="text-accent-400 text-xs mb-1">Plan: {r.nextInningsPlan}</p>
                        )}
                        {fixedFromLast.length > 0 && (
                          <p className="text-primary-400 text-xs font-bold">Improved from last match!</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Intent Trend */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Intent Score Trend</h3>
                <div className="flex items-end gap-3 justify-center h-32">
                  {patterns.intentTrend.map((t, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-xs text-primary-400 font-bold">{t.score}</span>
                      <div
                        className="w-10 rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400"
                        style={{ height: `${(t.score / 5) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-500">{t.match}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Mistakes */}
              {patterns.topMistakes.length > 0 && (
                <div className="glass rounded-2xl p-6 border border-red-500/20">
                  <h3 className="text-lg font-bold text-white mb-4">Recurring Mistakes</h3>
                  <div className="space-y-2">
                    {patterns.topMistakes.map(([mistake, count]) => (
                      <div key={mistake} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300 text-sm">{mistake}</span>
                            <span className="text-red-400 text-xs font-bold">{count}x</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-red-500/60 h-2 rounded-full" style={{ width: `${(count / reflections.length) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Strengths */}
              {patterns.topStrengths.length > 0 && (
                <div className="glass rounded-2xl p-6 border border-primary-500/20">
                  <h3 className="text-lg font-bold text-white mb-4">Consistent Strengths</h3>
                  <div className="space-y-2">
                    {patterns.topStrengths.map(([strength, count]) => (
                      <div key={strength} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300 text-sm">{strength}</span>
                            <span className="text-primary-400 text-xs font-bold">{count}x</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-primary-500/60 h-2 rounded-full" style={{ width: `${(count / reflections.length) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* How I Get Out */}
              {patterns.topDismissals.length > 0 && (
                <div className="glass rounded-2xl p-6 border border-accent-500/20">
                  <h3 className="text-lg font-bold text-white mb-4">How I Get Out</h3>
                  <div className="flex flex-wrap gap-3">
                    {patterns.topDismissals.map(([dismissal, count]) => (
                      <div key={dismissal} className="glass rounded-xl p-4 text-center border border-white/10">
                        <p className="text-white font-bold text-sm">{dismissal}</p>
                        <p className="text-accent-400 text-xs mt-1">{count} time{count > 1 ? 's' : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400">&larr; Back to reflections</button>
            </div>
          )}

          {/* LIST VIEW */}
          {view === 'list' && (
            <>
              {loading ? (
                <div className="text-center py-12"><span className="text-gray-500">Loading reflections...</span></div>
              ) : reflections.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center border border-white/10">
                  <div className="text-5xl mb-4">🏏</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Reflections Yet</h3>
                  <p className="text-gray-400 mb-6">After each match or practice, create a reflection to track your growth.</p>
                  <button onClick={() => setView('new')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-105">
                    Create Your First Reflection
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reflections.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setSelectedReflection(r); setView('detail'); }}
                      className="w-full text-left glass rounded-xl p-5 border border-white/10 hover:border-primary-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-bold text-sm">{r.match}</span>
                        <span className="text-gray-500 text-xs">{r.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>Out: {Array.isArray(r.howGotOut) ? r.howGotOut.join(', ') || 'N/A' : r.howGotOut || 'N/A'}</span>
                        <span>Intent: {r.intentScore}/5</span>
                        <span className="text-primary-400">{r.mindsetWord || '—'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-6 glass rounded-xl p-4 border border-primary-500/20 text-center">
                <Link href="/mental-game" className="text-primary-400 text-sm font-medium hover:text-primary-300 underline">Open The Mental Game Guide &rarr;</Link>
              </div>
            </>
          )}

          {/* DETAIL VIEW */}
          {view === 'detail' && selectedReflection && (
            <>
              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400 mb-4 inline-block">&larr; Back</button>
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">{selectedReflection.match}</h2>
                  <span className="text-gray-500 text-sm">{selectedReflection.date}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-gray-500 text-xs mb-1">Got Out</p>
                    <p className="text-white font-bold text-xs">{Array.isArray(selectedReflection.howGotOut) ? selectedReflection.howGotOut.join(', ') || 'N/A' : selectedReflection.howGotOut || 'N/A'}</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-gray-500 text-xs mb-1">Intent</p>
                    <p className="text-white font-bold text-xs">{selectedReflection.intentScore}/5</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-gray-500 text-xs mb-1">Mindset</p>
                    <p className="text-primary-400 font-bold text-xs">{selectedReflection.mindsetWord || '—'}</p>
                  </div>
                </div>
                {selectedReflection.whatWentRight.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-primary-400 font-bold text-xs mb-2">What Went Right</h4>
                    <div className="flex flex-wrap gap-1">{selectedReflection.whatWentRight.map(w => (
                      <span key={w} className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">{w}</span>
                    ))}</div>
                  </div>
                )}
                {selectedReflection.whatWentWrong.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-red-400 font-bold text-xs mb-2">What Went Wrong</h4>
                    <div className="flex flex-wrap gap-1">{selectedReflection.whatWentWrong.map(w => (
                      <span key={w} className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">{w}</span>
                    ))}</div>
                  </div>
                )}
                {selectedReflection.nextInningsPlan && <div className="mb-3"><h4 className="text-accent-400 font-bold text-xs mb-1">Next Innings Plan</h4><p className="text-gray-300 text-sm">{selectedReflection.nextInningsPlan}</p></div>}
                {selectedReflection.strengthToBuild && <div className="mb-3"><h4 className="text-blue-400 font-bold text-xs mb-1">Strength to Back</h4><p className="text-gray-300 text-sm">{selectedReflection.strengthToBuild}</p></div>}
                {selectedReflection.pressureResponse && <div className="mb-3"><h4 className="text-purple-400 font-bold text-xs mb-1">If I Feel Pressure</h4><p className="text-gray-300 text-sm">{selectedReflection.pressureResponse}</p></div>}
                {selectedReflection.notes && <div className="mb-3"><h4 className="text-gray-400 font-bold text-xs mb-1">Notes</h4><p className="text-gray-300 text-sm">{selectedReflection.notes}</p></div>}
              </div>
            </>
          )}

          {/* NEW REFLECTION FORM */}
          {view === 'new' && (
            <>
              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400 mb-4 inline-block">&larr; Cancel</button>
              <div className="space-y-5">
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">Match</h3>
                  <select value={match} onChange={e => { setMatch(e.target.value); const m = MATCHES.find(x => x.label === e.target.value); setMatchIndex(m?.index || 0); }} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm">
                    <option value="" className="bg-gray-900">Select match...</option>
                    {MATCHES.map(m => <option key={m.label} value={m.label} className="bg-gray-900">{m.label}</option>)}
                  </select>
                </div>

                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">How Did You Get Out?</h3>
                  {matchIndex === 99 && <p className="text-gray-500 text-xs mb-3">Practice session — select all that apply</p>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {HOW_GOT_OUT_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => {
                        if (matchIndex === 99) {
                          toggleCheckbox(opt, howGotOut, setHowGotOut);
                        } else {
                          setHowGotOut(howGotOut.includes(opt) && howGotOut.length === 1 ? [] : [opt]);
                        }
                      }} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${howGotOut.includes(opt) ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>{howGotOut.includes(opt) ? '✓ ' : ''}{opt}</button>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-primary-500/20">
                  <h3 className="text-lg font-bold text-white mb-3">What Went Right?</h3>
                  <div className="flex flex-wrap gap-2">
                    {WHAT_WENT_RIGHT_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => toggleCheckbox(opt, whatWentRight, setWhatWentRight)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${whatWentRight.includes(opt) ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>{whatWentRight.includes(opt) ? '✓ ' : ''}{opt}</button>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-red-500/20">
                  <h3 className="text-lg font-bold text-white mb-3">What Went Wrong?</h3>
                  <div className="flex flex-wrap gap-2">
                    {WHAT_WENT_WRONG_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => toggleCheckbox(opt, whatWentWrong, setWhatWentWrong)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${whatWentWrong.includes(opt) ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>{whatWentWrong.includes(opt) ? '✓ ' : ''}{opt}</button>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">Intent Score</h3>
                  <div className="flex gap-3 justify-center">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setIntentScore(n)} className={`w-12 h-12 rounded-xl text-lg font-bold border transition-all ${intentScore === n ? 'bg-accent-500/20 text-accent-400 border-accent-500/50 scale-110' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>{n}</button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2"><span>Froze</span><span>Total clarity</span></div>
                </div>

                <div className="glass rounded-2xl p-6 border border-accent-500/20">
                  <h3 className="text-lg font-bold text-white mb-3">Next Innings Reset Card</h3>
                  <div className="space-y-3">
                    <div><label className="text-gray-400 text-xs block mb-1">Next time I bat, I want to...</label><input type="text" value={nextInningsPlan} onChange={e => setNextInningsPlan(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600" placeholder="e.g. Attack spin early" /></div>
                    <div><label className="text-gray-400 text-xs block mb-1">Strength I want to back...</label><input type="text" value={strengthToBuild} onChange={e => setStrengthToBuild(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600" placeholder="e.g. My pull shot" /></div>
                    <div><label className="text-gray-400 text-xs block mb-1">If I feel pressure, I will...</label><input type="text" value={pressureResponse} onChange={e => setPressureResponse(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600" placeholder="e.g. Breathe, tap bat" /></div>
                    <div><label className="text-gray-400 text-xs block mb-1">My mindset word...</label><input type="text" value={mindsetWord} onChange={e => setMindsetWord(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600" placeholder="e.g. Brave, Calm" /></div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">Notes</h3>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600 resize-none" placeholder="Anything else..." />
                </div>

                <button onClick={handleSubmit} disabled={!match || saving} className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-[1.02] disabled:opacity-40">
                  {saving ? 'Saving...' : 'Save Reflection'}
                </button>
              </div>
            </>
          )}

        </div>
      </section>
    </div>
  );
}
