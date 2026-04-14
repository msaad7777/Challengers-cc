"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Reflection {
  id: string;
  date: string;
  match: string;
  opponent: string;
  howGotOut: string;
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
  'Bowled',
  'Caught — Slips/Gully',
  'Caught — Infield',
  'Caught — Boundary',
  'LBW',
  'Run Out',
  'Stumped',
  'Hit Wicket',
  'Did not bat',
  'Not out',
];

const WHAT_WENT_RIGHT_OPTIONS = [
  'Good shot selection',
  'Rotated strike well',
  'Played to my strengths',
  'Stayed patient early',
  'Good footwork',
  'Read the bowler well',
  'Stayed calm under pressure',
  'Used my pre-ball routine',
  'Good intent throughout',
  'Converted a start into a score',
  'Good running between wickets',
  'Adapted to conditions',
];

const WHAT_WENT_WRONG_OPTIONS = [
  'Poor shot selection',
  'Played too early',
  'Played too late',
  'Rushed my innings',
  'No clear plan',
  'Froze under pressure',
  'Chased a wide delivery',
  'Forgot my routine',
  'Overthinking',
  'Lost concentration',
  'Poor footwork',
  'Tried to hit too hard',
  'Defensive mindset',
  'Did not rotate strike',
  'Fatigue or distraction',
];

const MATCHES = [
  'M1 — vs London Predators (May 10)',
  'M2 — vs Forest City Cricketers (May 18)',
  'M3 — vs Sarnia Spartans (Jun 14)',
  'M4 — vs Western Cricket Academy B (Jun 27)',
  'M5 — vs London Rising Stars (Jul 1)',
  'M6 — vs LCC Maple Stars (Jul 11)',
  'M7 — vs LCC Mavericks (Jul 25)',
  'M8 — vs London Rising Stars (Jul 26)',
  'M9 — vs Western Cricket Academy B (Aug 2)',
  'M10 — vs Forest City Cricketers (Aug 8)',
  'M11 — vs Sarnia Spartans (Aug 23)',
  'M12 — vs London Eagle Predators (Sep 5)',
  'M13 — vs Inferno Spartans (Sep 12)',
  'M14 — vs Tigers Cricket Club (Sep 13)',
  'Practice Session',
  'Other',
];

function getReflections(email: string): Reflection[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(`c3h-reflections-${email}`);
  return data ? JSON.parse(data) : [];
}

function saveReflection(email: string, reflection: Reflection) {
  const existing = getReflections(email);
  existing.unshift(reflection);
  localStorage.setItem(`c3h-reflections-${email}`, JSON.stringify(existing));
}

export default function NetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [view, setView] = useState<'list' | 'new' | 'detail'>('list');
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);

  // Form state
  const [match, setMatch] = useState('');
  const [opponent, setOpponent] = useState('');
  const [howGotOut, setHowGotOut] = useState('');
  const [whatWentRight, setWhatWentRight] = useState<string[]>([]);
  const [whatWentWrong, setWhatWentWrong] = useState<string[]>([]);
  const [mindsetWord, setMindsetWord] = useState('');
  const [nextInningsPlan, setNextInningsPlan] = useState('');
  const [strengthToBuild, setStrengthToBuild] = useState('');
  const [pressureResponse, setPressureResponse] = useState('');
  const [intentScore, setIntentScore] = useState(3);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      setReflections(getReflections(session.user.email));
    }
  }, [session]);

  if (status === 'loading' || !session) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-primary-400">Loading...</div></div>;
  }

  const toggleCheckbox = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const handleSubmit = () => {
    const reflection: Reflection = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      match,
      opponent: match.includes('vs') ? match.split('vs ')[1]?.split(' (')[0] || '' : opponent,
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
    };
    saveReflection(session.user!.email!, reflection);
    setReflections(getReflections(session.user!.email!));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setView('list');
      // Reset form
      setMatch(''); setOpponent(''); setHowGotOut(''); setWhatWentRight([]);
      setWhatWentWrong([]); setMindsetWord(''); setNextInningsPlan('');
      setStrengthToBuild(''); setPressureResponse(''); setIntentScore(3); setNotes('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-32 md:pt-40">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/c3h/dashboard" className="text-gray-500 text-sm hover:text-primary-400 transition-colors mb-2 inline-block">&larr; Back to Dashboard</Link>
              <h1 className="text-3xl font-bold text-white">The <span className="gradient-text">Nets</span></h1>
              <p className="text-gray-400 text-sm mt-1">Your personal reflection cards and mindset tools</p>
            </div>
            {view === 'list' && (
              <button
                onClick={() => setView('new')}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-105 text-sm"
              >
                + New Reflection
              </button>
            )}
          </div>

          {/* LIST VIEW */}
          {view === 'list' && (
            <>
              {reflections.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center border border-white/10">
                  <div className="text-5xl mb-4">🏏</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Reflections Yet</h3>
                  <p className="text-gray-400 mb-6">After each match or practice, create a reflection to track your growth.</p>
                  <button
                    onClick={() => setView('new')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-105"
                  >
                    Create Your First Reflection
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
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
                        <span>Got out: {r.howGotOut || 'N/A'}</span>
                        <span>Intent: {r.intentScore}/5</span>
                        <span>Mindset: {r.mindsetWord || '—'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Mental Game Quick Link */}
              <div className="mt-8 glass rounded-xl p-5 border border-primary-500/20 text-center">
                <p className="text-gray-400 text-sm mb-3">Need a mental reset before your next innings?</p>
                <Link href="/mental-game" className="text-primary-400 text-sm font-medium hover:text-primary-300 underline">
                  Open The Mental Game Guide &rarr;
                </Link>
              </div>
            </>
          )}

          {/* DETAIL VIEW */}
          {view === 'detail' && selectedReflection && (
            <>
              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400 mb-4 inline-block">&larr; Back to reflections</button>
              <div className="glass rounded-2xl p-8 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">{selectedReflection.match}</h2>
                  <span className="text-gray-500 text-sm">{selectedReflection.date}</span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="glass rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-xs mb-1">How Got Out</p>
                    <p className="text-white font-bold text-sm">{selectedReflection.howGotOut || 'N/A'}</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-xs mb-1">Intent Score</p>
                    <p className="text-white font-bold text-sm">{selectedReflection.intentScore}/5</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-xs mb-1">Mindset Word</p>
                    <p className="text-primary-400 font-bold text-sm">{selectedReflection.mindsetWord || '—'}</p>
                  </div>
                </div>

                {selectedReflection.whatWentRight.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-primary-400 font-bold text-sm mb-2">What Went Right</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReflection.whatWentRight.map(w => (
                        <span key={w} className="text-xs px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">{w}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReflection.whatWentWrong.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-red-400 font-bold text-sm mb-2">What Went Wrong</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReflection.whatWentWrong.map(w => (
                        <span key={w} className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">{w}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReflection.nextInningsPlan && (
                  <div className="mb-4">
                    <h4 className="text-accent-400 font-bold text-sm mb-1">Next Innings Plan</h4>
                    <p className="text-gray-300 text-sm">{selectedReflection.nextInningsPlan}</p>
                  </div>
                )}

                {selectedReflection.strengthToBuild && (
                  <div className="mb-4">
                    <h4 className="text-blue-400 font-bold text-sm mb-1">Strength to Back</h4>
                    <p className="text-gray-300 text-sm">{selectedReflection.strengthToBuild}</p>
                  </div>
                )}

                {selectedReflection.pressureResponse && (
                  <div className="mb-4">
                    <h4 className="text-purple-400 font-bold text-sm mb-1">If I Feel Pressure</h4>
                    <p className="text-gray-300 text-sm">{selectedReflection.pressureResponse}</p>
                  </div>
                )}

                {selectedReflection.notes && (
                  <div className="mb-4">
                    <h4 className="text-gray-400 font-bold text-sm mb-1">Notes</h4>
                    <p className="text-gray-300 text-sm">{selectedReflection.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* NEW REFLECTION FORM */}
          {view === 'new' && (
            <>
              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400 mb-4 inline-block">&larr; Cancel</button>

              {saved ? (
                <div className="glass rounded-2xl p-12 text-center border border-primary-500/30">
                  <div className="text-5xl mb-4">&#9989;</div>
                  <h3 className="text-xl font-bold text-white mb-2">Reflection Saved!</h3>
                  <p className="text-gray-400">Great job reflecting on your performance. Keep growing.</p>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* Match Selection */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Match Details</h3>
                    <select
                      value={match}
                      onChange={e => setMatch(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm"
                    >
                      <option value="" className="bg-gray-900">Select match...</option>
                      {MATCHES.map(m => (
                        <option key={m} value={m} className="bg-gray-900">{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* How Got Out */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">How Did You Get Out?</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {HOW_GOT_OUT_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setHowGotOut(opt)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                            howGotOut === opt
                              ? 'bg-primary-500/20 text-primary-400 border-primary-500/50'
                              : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* What Went Right */}
                  <div className="glass rounded-2xl p-6 border border-primary-500/20">
                    <h3 className="text-lg font-bold text-white mb-4">What Went Right?</h3>
                    <div className="flex flex-wrap gap-2">
                      {WHAT_WENT_RIGHT_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => toggleCheckbox(opt, whatWentRight, setWhatWentRight)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                            whatWentRight.includes(opt)
                              ? 'bg-primary-500/20 text-primary-400 border-primary-500/50'
                              : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {whatWentRight.includes(opt) ? '✓ ' : ''}{opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* What Went Wrong */}
                  <div className="glass rounded-2xl p-6 border border-red-500/20">
                    <h3 className="text-lg font-bold text-white mb-4">What Went Wrong?</h3>
                    <div className="flex flex-wrap gap-2">
                      {WHAT_WENT_WRONG_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => toggleCheckbox(opt, whatWentWrong, setWhatWentWrong)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                            whatWentWrong.includes(opt)
                              ? 'bg-red-500/20 text-red-400 border-red-500/50'
                              : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {whatWentWrong.includes(opt) ? '✓ ' : ''}{opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Intent Score */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Intent Score</h3>
                    <p className="text-gray-500 text-xs mb-4">How decisive and purposeful did you feel at the crease?</p>
                    <div className="flex gap-3 justify-center">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => setIntentScore(n)}
                          className={`w-12 h-12 rounded-xl text-lg font-bold border transition-all ${
                            intentScore === n
                              ? 'bg-accent-500/20 text-accent-400 border-accent-500/50 scale-110'
                              : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                      <span>Froze</span>
                      <span>Total clarity</span>
                    </div>
                  </div>

                  {/* Reset Card */}
                  <div className="glass rounded-2xl p-6 border border-accent-500/20">
                    <h3 className="text-lg font-bold text-white mb-4">Next Innings Reset Card</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Next time I bat, I want to...</label>
                        <input
                          type="text"
                          value={nextInningsPlan}
                          onChange={e => setNextInningsPlan(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600"
                          placeholder="e.g. Attack spin early, play straighter through V"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">The strength I want to back is...</label>
                        <input
                          type="text"
                          value={strengthToBuild}
                          onChange={e => setStrengthToBuild(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600"
                          placeholder="e.g. My pull shot, scoring through covers"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">If I feel pressure, I will...</label>
                        <input
                          type="text"
                          value={pressureResponse}
                          onChange={e => setPressureResponse(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600"
                          placeholder="e.g. Breathe, tap bat, say 'I'm ready'"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">My mindset word is...</label>
                        <input
                          type="text"
                          value={mindsetWord}
                          onChange={e => setMindsetWord(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600"
                          placeholder="e.g. Brave, Calm, Clear, Free"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Additional Notes</h3>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600 resize-none"
                      placeholder="Anything else you want to remember about this match..."
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={!match}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
                  >
                    Save Reflection
                  </button>

                </div>
              )}
            </>
          )}

        </div>
      </section>
    </div>
  );
}
