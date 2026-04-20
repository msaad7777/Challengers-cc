"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const ALL_MATCHES = [
  // LCL T30
  { id: 'lcl-1', league: 'LCL T30', date: 'May 10', fullDate: '2026-05-10', opponent: 'London Predators', time: '1:00 PM', venue: 'Northridge', clash: true },
  { id: 'lcl-2', league: 'LCL T30', date: 'May 18', fullDate: '2026-05-18', opponent: 'Forest City Cricketers', time: '8:00 AM', venue: 'NLAF', clash: false },
  { id: 'lcl-3', league: 'LCL T30', date: 'Jun 14', fullDate: '2026-06-14', opponent: 'Sarnia Spartans', time: '10:00 AM', venue: 'Sarnia', clash: false },
  { id: 'lcl-4', league: 'LCL T30', date: 'Jun 27', fullDate: '2026-06-27', opponent: 'Western Cricket Academy B', time: '8:00 AM', venue: 'Silverwoods', clash: true },
  { id: 'lcl-5', league: 'LCL T30', date: 'Jul 1', fullDate: '2026-07-01', opponent: 'London Rising Stars', time: '8:00 AM', venue: 'NLAF', clash: false },
  { id: 'lcl-6', league: 'LCL T30', date: 'Jul 11', fullDate: '2026-07-11', opponent: 'LCC Maple Stars', time: '8:00 AM', venue: 'Northridge', clash: false },
  { id: 'lcl-7', league: 'LCL T30', date: 'Jul 25', fullDate: '2026-07-25', opponent: 'LCC Mavericks', time: '1:00 PM', venue: 'NLAF', clash: true },
  { id: 'lcl-8', league: 'LCL T30', date: 'Jul 26', fullDate: '2026-07-26', opponent: 'London Rising Stars', time: '1:00 PM', venue: 'NLAF', clash: false },
  { id: 'lcl-9', league: 'LCL T30', date: 'Aug 2', fullDate: '2026-08-02', opponent: 'Western Cricket Academy B', time: '8:00 AM', venue: 'Northridge', clash: true },
  { id: 'lcl-10', league: 'LCL T30', date: 'Aug 8', fullDate: '2026-08-08', opponent: 'Forest City Cricketers', time: '1:00 PM', venue: 'NLAF', clash: false },
  { id: 'lcl-11', league: 'LCL T30', date: 'Aug 23', fullDate: '2026-08-23', opponent: 'Sarnia Spartans', time: '1:00 PM', venue: 'Northridge', clash: false },
  { id: 'lcl-12', league: 'LCL T30', date: 'Sep 5', fullDate: '2026-09-05', opponent: 'London Eagle Predators', time: '3:00 PM', venue: 'Silverwoods', clash: false },
  { id: 'lcl-13', league: 'LCL T30', date: 'Sep 12', fullDate: '2026-09-12', opponent: 'Inferno Spartans', time: '1:00 PM', venue: 'NLAF', clash: false },
  { id: 'lcl-14', league: 'LCL T30', date: 'Sep 13', fullDate: '2026-09-13', opponent: 'Tigers Cricket Club', time: '3:00 PM', venue: 'Northridge', clash: false },
  // LPL T30
  { id: 'lpl-1', league: 'LPL T30', date: 'May 10', fullDate: '2026-05-10', opponent: 'Maple Tigers', time: '10:00 AM', venue: 'Silverwoods', clash: true },
  { id: 'lpl-2', league: 'LPL T30', date: 'May 24', fullDate: '2026-05-24', opponent: 'London Rhinos', time: '10:00 AM', venue: 'NLAF', clash: false },
  { id: 'lpl-3', league: 'LPL T30', date: 'May 31', fullDate: '2026-05-31', opponent: 'NLCC', time: '2:00 PM', venue: 'Thamesville', clash: false },
  { id: 'lpl-4', league: 'LPL T30', date: 'Jun 7', fullDate: '2026-06-07', opponent: 'Royal Tigers', time: '10:00 AM', venue: 'Silverwoods', clash: false },
  { id: 'lpl-5', league: 'LPL T30', date: 'Jun 13', fullDate: '2026-06-13', opponent: 'Maple Tigers', time: '8:00 AM', venue: 'Northridge', clash: false },
  { id: 'lpl-6', league: 'LPL T30', date: 'Jun 27', fullDate: '2026-06-27', opponent: 'Premier XI', time: '9:00 AM', venue: 'Thamesville', clash: true },
  { id: 'lpl-7', league: 'LPL T30', date: 'Jul 4', fullDate: '2026-07-04', opponent: 'London Stars', time: '10:00 AM', venue: 'Northridge', clash: false },
  { id: 'lpl-8', league: 'LPL T30', date: 'Jul 18', fullDate: '2026-07-18', opponent: 'Premier XI', time: '10:00 AM', venue: 'Northridge', clash: false },
  { id: 'lpl-9', league: 'LPL T30', date: 'Jul 25', fullDate: '2026-07-25', opponent: 'London Rhinos', time: '9:00 AM', venue: 'Thamesville', clash: true },
  { id: 'lpl-10', league: 'LPL T30', date: 'Aug 2', fullDate: '2026-08-02', opponent: 'NLCC', time: '10:00 AM', venue: 'Silverwoods', clash: true },
  { id: 'lpl-11', league: 'LPL T30', date: 'Aug 30', fullDate: '2026-08-30', opponent: 'Royal Tigers', time: '10:00 AM', venue: 'Silverwoods', clash: false },
  { id: 'lpl-12', league: 'LPL T30', date: 'Sep 6', fullDate: '2026-09-06', opponent: 'London Stars', time: '1:00 PM', venue: 'NLAF', clash: false },
];

const PLAYER_NAMES = [
  'Mohammed Saad', 'Tarek Islam', 'Gokul Prakash', 'Qaiser Mahmood', 'Madhu Reddy',
  'Ankush Arora', 'Roman Mahmud', 'Judin Thomas', 'Saikrishna Goriparthi', 'Dr. Shoab Ahmad',
  'Fahad Aktar', 'Denison Davis', 'Abhishek Ladva', 'Ashvak Sheik', 'Bhupinder Singh',
  'Salman Ahmed', 'Farooq Choudhary', 'Vijay Yadav', 'Shivam Rajput', 'Shaby Ansari',
  'Manohar Anukuri', 'Mohayminul', 'Andrew Jebarson', 'Guru Raga', 'Noman',
  'Shafiul', 'Sujel Ahmed', 'Shariar Hussain', 'Atik Rahman', 'Majharul Alam', 'Makhan',
];

type AvailabilityStatus = 'available' | 'unavailable' | 'maybe' | '';

interface PlayerAvailability {
  [matchId: string]: AvailabilityStatus;
}

interface AllAvailability {
  [playerName: string]: PlayerAvailability;
}

export default function AvailabilityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allAvailability, setAllAvailability] = useState<AllAvailability>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [leagueFilter, setLeagueFilter] = useState<'all' | 'LCL T30' | 'LPL T30'>('all');
  const [viewMode, setViewMode] = useState<'player' | 'captain'>('player');

  const isBoard = session?.user?.email?.endsWith('@challengerscc.ca');
  const playerName = (() => {
    const email = session?.user?.email?.toLowerCase() || '';
    const name = session?.user?.name?.toLowerCase() || '';
    // Try matching by email prefix first (most reliable)
    const emailPrefix = email.split('@')[0].replace(/[0-9]/g, '');
    const byEmail = PLAYER_NAMES.find(n => {
      const firstName = n.split(' ')[0].toLowerCase();
      return emailPrefix.includes(firstName) || firstName.includes(emailPrefix);
    });
    if (byEmail) return byEmail;
    // Then try matching by display name
    const byName = PLAYER_NAMES.find(n =>
      name.includes(n.split(' ')[0].toLowerCase()) || n.split(' ')[0].toLowerCase().includes(name.split(' ')[0])
    );
    return byName || session?.user?.name || '';
  })();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'availability'));
      const data: AllAvailability = {};
      snap.docs.forEach(d => {
        data[d.id] = d.data() as PlayerAvailability;
      });
      setAllAvailability(data);
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const updateAvailability = async (name: string, matchId: string, newStatus: AvailabilityStatus) => {
    // Players can update their own, board/captains can update anyone
    if (name !== playerName && !isBoard) return;
    setSaving(true);
    const current = allAvailability[name] || {};
    const updated: PlayerAvailability = { ...current, [matchId]: newStatus };
    const saveData = { ...updated, _email: session?.user?.email || '', _updatedAt: new Date().toISOString(), _updatedBy: name === playerName ? 'self' : session?.user?.email || '' };
    await setDoc(doc(db, 'availability', name), saveData);
    setAllAvailability(prev => ({ ...prev, [name]: updated }));
    setSaving(false);
  };

  if (status === 'loading' || !session) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-primary-400">Loading...</div></div>;
  }

  const filteredMatches = (leagueFilter === 'all' ? ALL_MATCHES : ALL_MATCHES.filter(m => m.league === leagueFilter))
    .sort((a, b) => a.fullDate.localeCompare(b.fullDate));

  const getStatusColor = (s: AvailabilityStatus) => {
    if (s === 'available') return 'bg-primary-500/20 text-primary-400 border-primary-500/50';
    if (s === 'unavailable') return 'bg-red-500/20 text-red-400 border-red-500/50';
    if (s === 'maybe') return 'bg-accent-500/20 text-accent-400 border-accent-500/50';
    return 'bg-white/5 text-gray-500 border-white/10';
  };

  const getStatusEmoji = (s: AvailabilityStatus) => {
    if (s === 'available') return '✅';
    if (s === 'unavailable') return '❌';
    if (s === 'maybe') return '❓';
    return '—';
  };

  const getPlayerStatus = (name: string, matchId: string): AvailabilityStatus => {
    const status = (allAvailability[name] || {})[matchId];
    return status || ''; // no default — only show what players have marked
  };

  const getMatchCounts = (matchId: string) => {
    let available = 0, maybe = 0, unavailable = 0, noResponse = 0;
    PLAYER_NAMES.forEach(n => {
      const s = getPlayerStatus(n, matchId);
      if (s === 'available') available++;
      else if (s === 'maybe') maybe++;
      else if (s === 'unavailable') unavailable++;
      else noResponse++;
    });
    return { available, maybe, unavailable, noResponse, total: PLAYER_NAMES.length };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-32 md:pt-40">
        <div className="max-w-4xl mx-auto">

          <div className="mb-6">
            <Link href="/c3h/dashboard" className="text-gray-500 text-sm hover:text-primary-400">&larr; Dashboard</Link>
            <h1 className="text-3xl font-bold text-white mt-2">Squad <span className="gradient-text">Availability</span></h1>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(['all', 'LCL T30', 'LPL T30'] as const).map(f => (
              <button key={f} onClick={() => setLeagueFilter(f)} className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${leagueFilter === f ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                {f === 'all' ? 'All Matches' : f}
              </button>
            ))}
            {isBoard && (
              <button onClick={() => setViewMode(viewMode === 'player' ? 'captain' : 'player')} className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ml-auto ${viewMode === 'captain' ? 'bg-accent-500/20 text-accent-400 border-accent-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                {viewMode === 'captain' ? 'Captain View' : 'My Availability'}
              </button>
            )}
          </div>

          {saving && <p className="text-accent-400 text-xs mb-2">Saving...</p>}

          {/* PLAYER VIEW — mark your own availability */}
          {viewMode === 'player' && (
            <div className="space-y-3">
              {filteredMatches.map(m => {
                const myStatus = getPlayerStatus(playerName, m.id);
                const counts = getMatchCounts(m.id);
                return (
                  <div key={m.id} className={`glass rounded-xl p-4 border ${m.clash ? 'border-red-500/30' : 'border-white/10'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs text-gray-500">{m.league}</span>
                        {m.clash && <span className="ml-2 w-2 h-2 rounded-full bg-red-500 inline-block"></span>}
                        <p className="text-white font-bold text-sm">vs {m.opponent}</p>
                        <p className="text-gray-500 text-xs">{m.date} | {m.time} | {m.venue}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-2 text-xs">
                          <span className="text-primary-400">✅{counts.available}</span>
                          <span className="text-accent-400">❓{counts.maybe}</span>
                          <span className="text-red-400">❌{counts.unavailable}</span>
                          {counts.noResponse > 0 && <span className="text-gray-500">—{counts.noResponse}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(['available', 'maybe', 'unavailable'] as AvailabilityStatus[]).map(s => (
                        <button key={s} onClick={() => updateAvailability(playerName, m.id, s)} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${myStatus === s ? getStatusColor(s) : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'}`}>
                          {s === 'available' ? '✅ Yes' : s === 'maybe' ? '❓ Maybe' : '❌ No'}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CAPTAIN VIEW — see all players */}
          {viewMode === 'captain' && isBoard && (
            <div className="space-y-4">
              {filteredMatches.map(m => {
                const available = PLAYER_NAMES.filter(n => getPlayerStatus(n, m.id) === 'available');
                const maybe = PLAYER_NAMES.filter(n => getPlayerStatus(n, m.id) === 'maybe');
                const unavailable = PLAYER_NAMES.filter(n => getPlayerStatus(n, m.id) === 'unavailable');
                return (
                  <div key={m.id} className={`glass rounded-2xl p-5 border ${m.clash ? 'border-red-500/30' : 'border-white/10'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs text-gray-500">{m.league}</span>
                        {m.clash && <span className="ml-2 w-2 h-2 rounded-full bg-red-500 inline-block"></span>}
                        <p className="text-white font-bold text-sm">vs {m.opponent}</p>
                        <p className="text-gray-500 text-xs">{m.date} | {m.time} | {m.venue}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${available.length >= 11 ? 'text-primary-400' : available.length >= 8 ? 'text-accent-400' : 'text-red-400'}`}>{available.length}</span>
                        <p className="text-xs text-gray-500">available</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {available.length > 0 && (
                        <div>
                          <p className="text-primary-400 text-xs font-bold mb-1">✅ Available ({available.length})</p>
                          <div className="flex flex-wrap gap-1">{available.map(n => (
                            <button key={n} onClick={() => {
                              const next: AvailabilityStatus = 'maybe';
                              updateAvailability(n, m.id, next);
                            }} className="text-xs px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-all" title="Click to change">{n.split(' ')[0]}</button>
                          ))}</div>
                        </div>
                      )}
                      {maybe.length > 0 && (
                        <div>
                          <p className="text-accent-400 text-xs font-bold mb-1">❓ Maybe ({maybe.length})</p>
                          <div className="flex flex-wrap gap-1">{maybe.map(n => (
                            <button key={n} onClick={() => {
                              const next: AvailabilityStatus = 'unavailable';
                              updateAvailability(n, m.id, next);
                            }} className="text-xs px-2 py-0.5 rounded bg-accent-500/10 text-accent-400 hover:bg-accent-500/20 transition-all" title="Click to change">{n.split(' ')[0]}</button>
                          ))}</div>
                        </div>
                      )}
                      {unavailable.length > 0 && (
                        <div>
                          <p className="text-red-400 text-xs font-bold mb-1">❌ Unavailable ({unavailable.length})</p>
                          <div className="flex flex-wrap gap-1">{unavailable.map(n => (
                            <button key={n} onClick={() => {
                              const next: AvailabilityStatus = 'available';
                              updateAvailability(n, m.id, next);
                            }} className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all" title="Click to change">{n.split(' ')[0]}</button>
                          ))}</div>
                        </div>
                      )}
                      {(() => {
                        const noResp = PLAYER_NAMES.filter(n => !getPlayerStatus(n, m.id));
                        return noResp.length > 0 ? (
                          <div>
                            <p className="text-gray-500 text-xs font-bold mb-1">No Response ({noResp.length})</p>
                            <div className="flex flex-wrap gap-1">{noResp.map(n => (
                              <button key={n} onClick={() => updateAvailability(n, m.id, 'available')} className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-600 hover:bg-primary-500/20 hover:text-primary-400 transition-all" title="Click to mark available">{n.split(' ')[0]}</button>
                            ))}</div>
                          </div>
                        ) : null;
                      })()}
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
