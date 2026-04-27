"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

const ALL_PLAYERS = [
  'Mohammed Saad', 'Tarek Islam', 'Gokul Prakash', 'Qaiser Mahmood', 'Madhu Reddy',
  'Ankush Arora', 'Roman Mahmud', 'Judin Thomas', 'Saikrishna Goriparthi', 'Shoeb Ahmad',
  'Fahad Aktar', 'Denison Davis', 'Abhishek Ladva',
  'Salman Ahmed', 'Farooq Choudhary', 'Vijay Yadav', 'Shivam Rajput',
  'Manohar Anukuri', 'Mohayminul', 'Andrew Jebarson', 'Guru Raga', 'Noman',
  'Shafiul', 'Sujel Ahmed', 'Syed Shahriar', 'Atik Rahman', 'Majharul Alam', 'Siva Sriram', 'Rajath Shetty', 'Murshad Azad',
];

// Players restricted to specific leagues
const LPL_ONLY = ['Siva Sriram', 'Rajath Shetty', 'Noman'];
const LCL_ONLY = ['Shivam Rajput'];

// Get players for a specific match based on league
const getPlayersForMatch = (league: string) => {
  return ALL_PLAYERS.filter(p => {
    if (LPL_ONLY.includes(p) && league !== 'LPL T30') return false;
    if (LCL_ONLY.includes(p) && league !== 'LCL T30') return false;
    return true;
  });
};

// Keep PLAYER_NAMES for backward compatibility (all players)
const PLAYER_NAMES = ALL_PLAYERS;

// Short display names — use last name or nickname where first name is ambiguous
const SHORT_NAMES: Record<string, string> = {
  'Mohammed Saad': 'Saad',
  'Syed Shahriar': 'Shahriar',
};
const shortName = (fullName: string) => SHORT_NAMES[fullName] || fullName.split(' ')[0];

// Map all emails (board + personal) to a single player name
const EMAIL_TO_PLAYER: Record<string, string> = {
  'contact@challengerscc.ca': 'Mohammed Saad',
  'saad@challengerscc.ca': 'Mohammed Saad',
  'mbadru3434@gmail.com': 'Mohammed Saad',
  'tarek@challengerscc.ca': 'Tarek Islam',
  'monirulislambd64@gmail.com': 'Tarek Islam',
  'gokul@challengerscc.ca': 'Gokul Prakash',
  'gokulprakash663@gmail.com': 'Gokul Prakash',
  'qaiser@challengerscc.ca': 'Qaiser Mahmood',
  'qureshiqaiser007@gmail.com': 'Qaiser Mahmood',
  'madhu@challengerscc.ca': 'Madhu Reddy',
  'vantarimadhu@gmail.com': 'Madhu Reddy',
  'ankush@challengerscc.ca': 'Ankush Arora',
  '92ankusharora@gmail.com': 'Ankush Arora',
  'roman@challengerscc.ca': 'Roman Mahmud',
  'romans987@gmail.com': 'Roman Mahmud',
  'shariar@challengerscc.ca': 'Syed Shahriar',
  'syedshahriar77@gmail.com': 'Syed Shahriar',
  'denisondavis9@gmail.com': 'Denison Davis',
  'judinthomas96@gmail.com': 'Judin Thomas',
  'abhishekladva09@gmail.com': 'Abhishek Ladva',
  'ashvak.realtor07@gmail.com': 'Ashvak Sheik',
  'bhindadhesi18@gmail.com': 'Bhupinder Singh',
  'sallu.ahmed8@gmail.com': 'Salman Ahmed',
  'saiakhira@gmail.com': 'Saikrishna Goriparthi',
  'farooqchoudhary123@gmail.com': 'Farooq Choudhary',
  'vijayvyadav1998@gmail.com': 'Vijay Yadav',
  'rajputshivam9558@gmail.com': 'Shivam Rajput',
  'shabyansari0023@gmail.com': 'Shoeb Ahmad',
  'manoharanukuri9@gmail.com': 'Manohar Anukuri',
  'mohayminul13@gmail.com': 'Mohayminul',
  'fahadakbar@gmail.com': 'Fahad Aktar',
  'andrewjebarson18@gmail.com': 'Andrew Jebarson',
  'tgururaga@gmail.com': 'Guru Raga',
  '108.noman@gmail.com': 'Noman',
  'shafiul078.aust@gmail.com': 'Shafiul',
  'sujelahmed06@gmail.com': 'Sujel Ahmed',
  'atik1991rah@gmail.com': 'Atik Rahman',
  'majharulalam456@gmail.com': 'Majharul Alam',
  'georgefreddy963@gmail.com': 'Fahad Aktar',
  'siva4593@gmail.com': 'Siva Sriram',
  'rajath.s.shetty@gmail.com': 'Rajath Shetty',
};

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
  const [squads, setSquads] = useState<Record<string, string[]>>({});
  const [squadRoles, setSquadRoles] = useState<Record<string, Record<string, string>>>({});
  const [squadMeta, setSquadMeta] = useState<Record<string, { updatedBy?: string; updatedAt?: string }>>({});
  const [showSquadCard, setShowSquadCard] = useState<string | null>(null);
  const [selectingSquad, setSelectingSquad] = useState<string | null>(null);
  const [playerMenu, setPlayerMenu] = useState<{ matchId: string; player: string } | null>(null);

  // isCaptain moved after isBoard declaration
  const [leagueFilter, setLeagueFilter] = useState<'all' | 'LCL T30' | 'LPL T30'>('all');
  const [viewMode, setViewMode] = useState<'player' | 'captain'>('player');

  const isBoard = session?.user?.email?.endsWith('@challengerscc.ca');
  const CAPTAIN_EMAILS = [
    'syedshahriar77@gmail.com', 'shariar@challengerscc.ca',
    'monirulislambd64@gmail.com', 'tarek@challengerscc.ca',
    'contact@challengerscc.ca', 'saad@challengerscc.ca', 'mbadru3434@gmail.com',
  ];
  const isCaptain = CAPTAIN_EMAILS.includes(session?.user?.email?.toLowerCase() || '');
  const playerName = (() => {
    const email = session?.user?.email?.toLowerCase() || '';
    // First try exact email mapping (most reliable)
    if (EMAIL_TO_PLAYER[email]) return EMAIL_TO_PLAYER[email];
    // Then try @challengerscc.ca prefix match
    if (email.endsWith('@challengerscc.ca')) {
      const prefix = email.split('@')[0];
      const found = Object.entries(EMAIL_TO_PLAYER).find(([e]) => e.startsWith(prefix));
      if (found) return found[1];
    }
    // Fallback to display name
    const name = session?.user?.name?.toLowerCase() || '';
    const byName = PLAYER_NAMES.find(n =>
      name.includes(n.split(' ')[0].toLowerCase())
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
    // Load squads
    try {
      const squadSnap = await getDocs(collection(db, 'squads'));
      const squadData: Record<string, string[]> = {};
      const rolesData: Record<string, Record<string, string>> = {};
      const metaData: Record<string, { updatedBy?: string; updatedAt?: string }> = {};
      squadSnap.docs.forEach(d => {
        const docData = d.data();
        squadData[d.id] = (docData.players || []) as string[];
        rolesData[d.id] = (docData.roles || {}) as Record<string, string>;
        metaData[d.id] = {
          updatedBy: docData.updatedBy as string | undefined,
          updatedAt: docData.updatedAt as string | undefined,
        };
      });
      setSquads(squadData);
      setSquadRoles(rolesData);
      setSquadMeta(metaData);
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const toggleSquadPlayer = async (matchId: string, playerN: string) => {
    const current = squads[matchId] || [];
    const currentRoles = squadRoles[matchId] || {};
    // Block selecting unavailable players
    if (!current.includes(playerN) && getPlayerStatus(playerN, matchId) === 'unavailable') return;
    const updated = current.includes(playerN)
      ? current.filter(p => p !== playerN)
      : current.length < 12 ? [...current, playerN] : current;
    // Remove role if player removed
    if (!updated.includes(playerN)) delete currentRoles[playerN];
    const stamp = new Date().toISOString();
    const editor = session?.user?.email || '';
    await setDoc(doc(db, 'squads', matchId), { players: updated, roles: currentRoles, updatedBy: editor, updatedAt: stamp });
    setSquads(prev => ({ ...prev, [matchId]: updated }));
    setSquadRoles(prev => ({ ...prev, [matchId]: currentRoles }));
    setSquadMeta(prev => ({ ...prev, [matchId]: { updatedBy: editor, updatedAt: stamp } }));
  };

  const movePlayer = async (matchId: string, fromIdx: number, toIdx: number) => {
    const current = [...(squads[matchId] || [])];
    if (fromIdx < 0 || fromIdx >= current.length || toIdx < 0 || toIdx >= current.length) return;
    const [player] = current.splice(fromIdx, 1);
    current.splice(toIdx, 0, player);
    const currentRoles = squadRoles[matchId] || {};
    const stamp = new Date().toISOString();
    const editor = session?.user?.email || '';
    await setDoc(doc(db, 'squads', matchId), { players: current, roles: currentRoles, updatedBy: editor, updatedAt: stamp });
    setSquads(prev => ({ ...prev, [matchId]: current }));
    setSquadMeta(prev => ({ ...prev, [matchId]: { updatedBy: editor, updatedAt: stamp } }));
  };

  const toggleRole = async (matchId: string, playerN: string, role: string) => {
    const currentRoles = { ...(squadRoles[matchId] || {}) };
    const playerAlreadyHasThisRole = currentRoles[playerN] === role;

    if (playerAlreadyHasThisRole) {
      // Second click on the same role for the same player — toggle OFF.
      // Just remove this player's role assignment.
      delete currentRoles[playerN];
    } else {
      // Assigning the role to this player. First clear any OTHER player
      // who currently holds this role (only one bat-sub / bowl-sub / wk
      // / captain / vc allowed at a time), then assign to this player.
      Object.keys(currentRoles).forEach((k) => {
        if (currentRoles[k] === role) delete currentRoles[k];
      });
      currentRoles[playerN] = role;
    }

    const stamp = new Date().toISOString();
    const editor = session?.user?.email || '';
    await setDoc(doc(db, 'squads', matchId), { players: squads[matchId] || [], roles: currentRoles, updatedBy: editor, updatedAt: stamp }, { merge: true });
    setSquadRoles(prev => ({ ...prev, [matchId]: currentRoles }));
    setSquadMeta(prev => ({ ...prev, [matchId]: { updatedBy: editor, updatedAt: stamp } }));
  };

  const updateAvailability = async (name: string, matchId: string, newStatus: AvailabilityStatus) => {
    // Players can ONLY mark their own availability. Captains and board
    // members cannot edit another player's availability — they can see
    // who has not responded but cannot change anyone's status on their
    // behalf. This avoids the captain accidentally marking someone
    // available when they are not.
    if (name !== playerName) return;
    setSaving(true);
    const current = allAvailability[name] || {};
    const updated: PlayerAvailability = { ...current, [matchId]: newStatus };
    const saveData = { ...updated, _email: session?.user?.email || '', _updatedAt: new Date().toISOString(), _updatedBy: 'self' };
    await setDoc(doc(db, 'availability', name), saveData);
    setAllAvailability(prev => ({ ...prev, [name]: updated }));
    setSaving(false);
  };

  if (status === 'loading' || !session) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-primary-400">Loading...</div></div>;
  }

  const filteredMatches = (leagueFilter === 'all' ? ALL_MATCHES : ALL_MATCHES.filter(m => m.league === leagueFilter))
    .sort((a, b) => {
      const dateCompare = a.fullDate.localeCompare(b.fullDate);
      if (dateCompare !== 0) return dateCompare;
      // Same date — sort by time (convert to 24hr for comparison)
      const toMinutes = (t: string) => {
        const [time, period] = t.split(' ');
        const parts = time.split(':').map(Number);
        let hours = parts[0];
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + parts[1];
      };
      return toMinutes(a.time) - toMinutes(b.time);
    });

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

  const getMatchCounts = (matchId: string, league: string) => {
    const players = getPlayersForMatch(league);
    let available = 0, maybe = 0, unavailable = 0, noResponse = 0;
    players.forEach(n => {
      const s = getPlayerStatus(n, matchId);
      if (s === 'available') available++;
      else if (s === 'maybe') maybe++;
      else if (s === 'unavailable') unavailable++;
      else noResponse++;
    });
    return { available, maybe, unavailable, noResponse, total: players.length };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-32 md:pt-40">
        <div className="max-w-4xl mx-auto">

          <div className="mb-8">
            <Link href="/c3h/dashboard" className="text-gray-500 text-sm hover:text-primary-400 mb-2 inline-block">&larr; Dashboard</Link>
            <h1 className="text-3xl font-bold text-white">The <span className="gradient-text">Dugout</span></h1>
            <p className="text-gray-500 text-sm mt-1">Squad availability and team selection for the 2026 season</p>
          </div>

          {/* Filters */}
          <div className="glass rounded-2xl p-4 mb-6 border border-white/5">
            <div className="flex flex-wrap gap-2 items-center">
              {(['all', 'LCL T30', 'LPL T30'] as const).map(f => (
                <button key={f} onClick={() => setLeagueFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${leagueFilter === f ? 'bg-primary-500/20 text-primary-400 border-primary-500/50 shadow-lg shadow-primary-500/10' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                  {f === 'all' ? 'All (' + filteredMatches.length + ')' : f}
                </button>
              ))}
              {isBoard && (
                <button onClick={() => setViewMode(viewMode === 'player' ? 'captain' : 'player')} className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all ml-auto ${viewMode === 'captain' ? 'bg-accent-500/20 text-accent-400 border-accent-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                  {viewMode === 'captain' ? '👑 Captain' : '🏏 Player'}
                </button>
              )}
            </div>
          </div>

          {saving && <p className="text-accent-400 text-xs mb-2">Saving...</p>}

          {/* PLAYER VIEW — mark your own availability */}
          {viewMode === 'player' && (
            <div className="space-y-3">
              {filteredMatches.map(m => {
                const matchPlayers = getPlayersForMatch(m.league);
                const isEligible = matchPlayers.includes(playerName);
                const myStatus = getPlayerStatus(playerName, m.id);
                const counts = getMatchCounts(m.id, m.league);
                if (!isEligible) return null;
                return (
                  <div key={m.id} className={`glass rounded-2xl p-5 border-2 transition-all hover:border-primary-500/20 ${m.clash ? 'border-red-500/30' : 'border-white/5'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.league === 'LCL T30' ? 'bg-primary-500/20 text-primary-400' : 'bg-accent-500/20 text-accent-400'}`}>{m.league}</span>
                          {m.clash && <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse"></span>}
                        </div>
                        <p className="text-white font-bold text-base">vs {m.opponent}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{m.date} &middot; {m.time} &middot; {m.venue}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-3 text-sm font-bold">
                          <span className="text-primary-400">✅{counts.available}</span>
                          <span className="text-accent-400">❓{counts.maybe}</span>
                          <span className="text-red-400">❌{counts.unavailable}</span>
                        </div>
                        {counts.noResponse > 0 && <p className="text-gray-600 text-xs mt-0.5">{counts.noResponse} pending</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(['available', 'maybe', 'unavailable'] as AvailabilityStatus[]).map(s => (
                        <button key={s} onClick={() => updateAvailability(playerName, m.id, myStatus === s ? '' as AvailabilityStatus : s)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${myStatus === s ? getStatusColor(s) + ' scale-105 shadow-lg' : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'}`}>
                          {s === 'available' ? '✅ Yes' : s === 'maybe' ? '❓ Maybe' : '❌ No'}
                        </button>
                      ))}
                    </div>
                    {(squads[m.id] || []).includes(playerName) && (() => {
                      const matchDate = new Date(m.fullDate);
                      const today = new Date();
                      const daysUntil = Math.ceil((matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return daysUntil <= 2 ? (
                        <div className="mt-2 pt-2 border-t border-primary-500/20 text-center">
                          <span className="text-xs font-bold text-primary-400">🏏 You are selected for this match!</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                );
              })}
            </div>
          )}

          {/* CAPTAIN VIEW — see all players */}
          {viewMode === 'captain' && isBoard && (
            <div className="space-y-4">
              {filteredMatches.map(m => {
                const matchPlayers = getPlayersForMatch(m.league);
                const available = matchPlayers.filter(n => getPlayerStatus(n, m.id) === 'available');
                const maybe = matchPlayers.filter(n => getPlayerStatus(n, m.id) === 'maybe');
                const unavailable = matchPlayers.filter(n => getPlayerStatus(n, m.id) === 'unavailable');
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
                      {/* Player Menu Popup */}
                      {playerMenu && playerMenu.matchId === m.id && (
                        <div className="glass rounded-xl p-3 border-2 border-primary-500/30 mb-2">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white text-xs font-bold">{playerMenu.player}</p>
                            <button onClick={() => setPlayerMenu(null)} className="text-gray-500 text-xs">&times;</button>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {playerMenu.player === playerName ? (
                              <>
                                {/* Only the player themselves can change their own availability */}
                                <button onClick={() => { updateAvailability(playerMenu.player, m.id, 'available'); setPlayerMenu(null); }} className="text-xs px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 border border-primary-500/30">✅ Available</button>
                                <button onClick={() => { updateAvailability(playerMenu.player, m.id, 'maybe'); setPlayerMenu(null); }} className="text-xs px-3 py-1.5 rounded-lg bg-accent-500/20 text-accent-400 border border-accent-500/30">❓ Maybe</button>
                                <button onClick={() => { updateAvailability(playerMenu.player, m.id, 'unavailable'); setPlayerMenu(null); }} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">❌ Unavailable</button>
                              </>
                            ) : (
                              <p className="text-xs text-gray-500 italic px-1 py-1.5">
                                {getPlayerStatus(playerMenu.player, m.id)
                                  ? `Availability set by ${playerMenu.player.split(' ')[0]} — only they can change it.`
                                  : `${playerMenu.player.split(' ')[0]} has not marked availability yet — only they can mark it.`}
                              </p>
                            )}
                            {isCaptain && !(squads[m.id] || []).includes(playerMenu.player) && (squads[m.id] || []).length < 12 && getPlayerStatus(playerMenu.player, m.id) !== 'unavailable' && (
                              <button onClick={() => { toggleSquadPlayer(m.id, playerMenu.player); setPlayerMenu(null); }} className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">🏏 Select</button>
                            )}
                            {isCaptain && (squads[m.id] || []).includes(playerMenu.player) && (
                              <button onClick={() => { toggleSquadPlayer(m.id, playerMenu.player); setPlayerMenu(null); }} className="text-xs px-3 py-1.5 rounded-lg bg-gray-500/20 text-gray-400 border border-gray-500/30">Remove from Squad</button>
                            )}
                          </div>
                        </div>
                      )}
                      {available.length > 0 && (
                        <div>
                          <p className="text-primary-400 text-xs font-bold mb-1">✅ Available ({available.length})</p>
                          <div className="flex flex-wrap gap-1">{available.map(n => {
                            const inSquad = (squads[m.id] || []).includes(n);
                            return (
                              <button key={n} onClick={() => setPlayerMenu({ matchId: m.id, player: n })} className={`text-xs px-2 py-0.5 rounded transition-all ${inSquad ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold' : 'bg-primary-500/10 text-primary-400 hover:bg-primary-500/20'}`}>{inSquad ? '🏏 ' : ''}{shortName(n)}</button>
                            );
                          })}</div>
                        </div>
                      )}
                      {maybe.length > 0 && (
                        <div>
                          <p className="text-accent-400 text-xs font-bold mb-1">❓ Maybe ({maybe.length})</p>
                          <div className="flex flex-wrap gap-1">{maybe.map(n => {
                            const inSquad = (squads[m.id] || []).includes(n);
                            return (
                              <button key={n} onClick={() => setPlayerMenu({ matchId: m.id, player: n })} className={`text-xs px-2 py-0.5 rounded transition-all ${inSquad ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold' : 'bg-accent-500/10 text-accent-400 hover:bg-accent-500/20'}`}>{inSquad ? '🏏 ' : ''}{shortName(n)}</button>
                            );
                          })}</div>
                        </div>
                      )}
                      {unavailable.length > 0 && (
                        <div>
                          <p className="text-red-400 text-xs font-bold mb-1">❌ Unavailable ({unavailable.length})</p>
                          <div className="flex flex-wrap gap-1">{unavailable.map(n => (
                            <button key={n} onClick={() => setPlayerMenu({ matchId: m.id, player: n })} className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">{shortName(n)}</button>
                          ))}</div>
                        </div>
                      )}
                      {(() => {
                        const noResp = matchPlayers.filter(n => !getPlayerStatus(n, m.id));
                        return noResp.length > 0 ? (
                          <div>
                            <p className="text-gray-500 text-xs font-bold mb-1">Did Not Mark Availability ({noResp.length})</p>
                            <div className="flex flex-wrap gap-1">{noResp.map(n => (
                              <button key={n} onClick={() => setPlayerMenu({ matchId: m.id, player: n })} className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-600 hover:bg-primary-500/20 hover:text-primary-400 transition-all">{shortName(n)}</button>
                            ))}</div>
                          </div>
                        ) : null;
                      })()}

                      {/* Squad Selection — Captains Only */}
                      {isCaptain && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <p className="text-white text-xs font-bold">Playing 12 ({(squads[m.id] || []).length}/12)</p>
                            <div className="flex gap-1">
                              {(squads[m.id] || []).length > 0 && isCaptain && (
                                <button onClick={async () => {
                                  if (confirm('Clear entire squad for this match?')) {
                                    const stamp = new Date().toISOString();
                                    const editor = session?.user?.email || '';
                                    await setDoc(doc(db, 'squads', m.id), { players: [], roles: {}, updatedBy: editor, updatedAt: stamp });
                                    setSquads(prev => ({ ...prev, [m.id]: [] }));
                                    setSquadRoles(prev => ({ ...prev, [m.id]: {} }));
                                    setSquadMeta(prev => ({ ...prev, [m.id]: { updatedBy: editor, updatedAt: stamp } }));
                                  }
                                }} className="text-xs px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">
                                  Clear
                                </button>
                              )}
                              <button onClick={() => setSelectingSquad(selectingSquad === m.id ? null : m.id)} className="text-xs px-3 py-1 rounded-lg bg-primary-500/20 text-primary-400 border border-primary-500/30 hover:bg-primary-500/30">
                                {selectingSquad === m.id ? 'Done' : 'Select Squad'}
                              </button>
                            </div>
                          </div>

                          {/* Last edited by — visible to captains + board */}
                          {(isCaptain || isBoard) && squadMeta[m.id]?.updatedBy && (
                            <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                              <svg className="w-3.5 h-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                              </svg>
                              <span>
                                Last saved by <span className="text-gray-300 font-semibold">{squadMeta[m.id].updatedBy}</span>
                                {squadMeta[m.id].updatedAt && (
                                  <span className="text-gray-600">
                                    {' · '}
                                    {new Date(squadMeta[m.id].updatedAt!).toLocaleString('en-CA', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {(squads[m.id] || []).length > 0 && (() => {
                            const roles = squadRoles[m.id] || {};
                            // Auto-assign defaults if not set
                            const getDisplayRole = (name: string) => {
                              if (roles[name]) return roles[name];
                              if (name === 'Syed Shahriar' && m.league === 'LCL T30') return 'captain';
                              if (name === 'Tarek Islam' && m.league === 'LPL T30') return 'captain';
                              if (name === 'Ankush Arora' && m.league === 'LCL T30') return 'vc';
                              if (name === 'Mohammed Saad' && m.league === 'LPL T30') return 'vc';
                              if (name === 'Mohammed Saad') return 'wk';
                              return '';
                            };
                            const roleLabel = (r: string) => {
                              if (r === 'captain') return ' (c)';
                              if (r === 'vc') return ' (vc)';
                              if (r === 'wk') return ' (wk)';
                              if (r === 'bat-sub') return ' (Bat Sub)';
                              if (r === 'bowl-sub') return ' (Bowl Sub)';
                              return '';
                            };
                            const roleColor = (r: string) => {
                              if (r === 'captain') return 'bg-accent-500/20 text-accent-400';
                              if (r === 'vc') return 'bg-purple-500/20 text-purple-400';
                              if (r === 'wk') return 'bg-blue-500/20 text-blue-400';
                              if (r === 'bat-sub') return 'bg-accent-500/20 text-accent-400';
                              if (r === 'bowl-sub') return 'bg-blue-500/20 text-blue-400';
                              return 'bg-primary-500/20 text-primary-400';
                            };
                            const WK_ELIGIBLE = ['Mohammed Saad', 'Denison Davis', 'Atik Rahman', 'Qaiser Mahmood', 'Rajath Shetty'];
                            return (
                            <div className="space-y-1 mb-2">
                              {(squads[m.id] || []).map((n, i) => {
                                const role = getDisplayRole(n);
                                return (
                                  <div key={n} className="flex items-center gap-2">
                                    {isCaptain && (
                                      <div className="flex flex-col">
                                        <button onClick={() => movePlayer(m.id, i, i - 1)} disabled={i === 0} className={`text-[10px] leading-none px-1 ${i === 0 ? 'text-gray-700' : 'text-gray-400 hover:text-white'}`}>▲</button>
                                        <button onClick={() => movePlayer(m.id, i, i + 1)} disabled={i === (squads[m.id] || []).length - 1} className={`text-[10px] leading-none px-1 ${i === (squads[m.id] || []).length - 1 ? 'text-gray-700' : 'text-gray-400 hover:text-white'}`}>▼</button>
                                      </div>
                                    )}
                                    <span className={`text-xs px-2 py-0.5 rounded ${roleColor(role)}`}>
                                      {i + 1}. {shortName(n)}{roleLabel(role)}
                                    </span>
                                    {isCaptain && (
                                      <div className="flex gap-1">
                                        <button onClick={() => toggleRole(m.id, n, 'bat-sub')} className={`text-xs px-1.5 py-0.5 rounded ${roles[n] === 'bat-sub' ? 'bg-accent-500/30 text-accent-400' : 'bg-white/5 text-gray-600 hover:bg-white/10'}`}>B</button>
                                        <button onClick={() => toggleRole(m.id, n, 'bowl-sub')} className={`text-xs px-1.5 py-0.5 rounded ${roles[n] === 'bowl-sub' ? 'bg-blue-500/30 text-blue-400' : 'bg-white/5 text-gray-600 hover:bg-white/10'}`}>W</button>
                                        {WK_ELIGIBLE.includes(n) && (
                                          <button onClick={() => toggleRole(m.id, n, 'wk')} className={`text-xs px-1.5 py-0.5 rounded ${roles[n] === 'wk' ? 'bg-blue-500/30 text-blue-400' : 'bg-white/5 text-gray-600 hover:bg-white/10'}`}>WK</button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              {(squads[m.id] || []).length >= 11 && isCaptain && (
                                <div className="flex gap-2 mt-2">
                                  <button onClick={() => setShowSquadCard(showSquadCard === m.id ? null : m.id)} className="text-xs px-3 py-1.5 rounded-lg bg-accent-500/20 text-accent-400 border border-accent-500/30 hover:bg-accent-500/30">
                                    {showSquadCard === m.id ? 'Hide Card' : 'View Squad Card'}
                                  </button>
                                  <a href={`/c3h/field-editor?match=${m.id}`} className="text-xs px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 border border-primary-500/30 hover:bg-primary-500/30">
                                    Field Editor
                                  </a>
                                </div>
                              )}
                            </div>
                            );
                          })()}
                          {/* Squad card rendered via portal below */}
                          {selectingSquad === m.id && (
                            <div className="glass rounded-xl p-3 border border-primary-500/20 mt-2">
                              <p className="text-gray-500 text-xs mb-2">Tap to select/deselect (max 12). Use B/W buttons for subs:</p>
                              <div className="flex flex-wrap gap-1">
                                {available.map(n => {
                                  const selected = (squads[m.id] || []).includes(n);
                                  return (
                                    <button key={n} onClick={() => toggleSquadPlayer(m.id, n)} className={`text-xs px-2 py-1 rounded border transition-all ${selected ? 'bg-primary-500/30 text-primary-400 border-primary-500/50 font-bold' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                                      {selected ? '✓ ' : ''}{shortName(n)}
                                    </button>
                                  );
                                })}
                                {maybe.map(n => {
                                  const selected = (squads[m.id] || []).includes(n);
                                  return (
                                    <button key={n} onClick={() => toggleSquadPlayer(m.id, n)} className={`text-xs px-2 py-1 rounded border transition-all ${selected ? 'bg-accent-500/30 text-accent-400 border-accent-500/50 font-bold' : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10'}`}>
                                      {selected ? '✓ ' : ''}{shortName(n)} ❓
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Squad Card Modal — rendered via portal to document.body */}
      {showSquadCard && typeof document !== 'undefined' && (() => {
        const matchData = filteredMatches.find(mm => mm.id === showSquadCard) || ALL_MATCHES.find(mm => mm.id === showSquadCard);
        const squadPlayers = squads[showSquadCard] || [];
        if (!matchData || squadPlayers.length < 11) return null;
        return createPortal(
          <SquadCardModal
            match={matchData}
            players={squadPlayers}
            roles={squadRoles[showSquadCard] || {}}
            shortName={shortName}
            onClose={() => setShowSquadCard(null)}
          />,
          document.body
        );
      })()}
    </div>
  );
}

function SquadCardModal({ match, players, roles, shortName, onClose }: {
  match: { id: string; league: string; date: string; time: string; venue: string; opponent: string };
  players: string[];
  roles: Record<string, string>;
  shortName: (n: string) => string;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-2 sm:p-4"
      style={{ zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm sm:max-w-md">
        <button onClick={onClose} className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 text-lg sm:text-xl font-bold">&times;</button>

        <div className="rounded-2xl p-4 sm:p-8" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0d2818 30%, #1a2e1a 50%, #0d2818 70%, #0a0a0a 100%)', border: '2px solid #10b981', boxShadow: '0 0 80px rgba(16,185,129,0.2)' }}>
          <div className="text-center mb-3 sm:mb-6">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🏏</div>
            <h3 className="text-lg sm:text-2xl font-bold text-primary-400 tracking-wider">CHALLENGERS CC</h3>
            <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto my-2 sm:my-3 rounded-full"></div>
            <p className="text-white font-bold text-sm sm:text-lg">vs {match.opponent}</p>
            <p className="text-gray-400 text-[10px] sm:text-xs mt-1">{match.league} | {match.date} | {match.time}</p>
            <p className="text-gray-500 text-[10px] sm:text-xs">{match.venue}</p>
            <p className="text-white font-bold text-xs sm:text-sm mt-2 sm:mt-3">Playing 12</p>
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            {players.map((n, i) => {
              const savedRole = roles[n];
              const displayRole = savedRole || (n === 'Syed Shahriar' && match.league === 'LCL T30' ? 'captain' : n === 'Tarek Islam' && match.league === 'LPL T30' ? 'captain' : n === 'Ankush Arora' && match.league === 'LCL T30' ? 'vc' : n === 'Mohammed Saad' && match.league === 'LPL T30' ? 'vc' : n === 'Mohammed Saad' ? 'wk' : '');
              const roleText = displayRole === 'captain' ? '(c)' : displayRole === 'vc' ? '(vc)' : displayRole === 'wk' ? '(wk)' : displayRole === 'bat-sub' ? 'BAT SUB' : displayRole === 'bowl-sub' ? 'BOWL SUB' : '';
              const roleColor = displayRole === 'captain' ? 'text-accent-400' : displayRole === 'vc' ? 'text-purple-400' : displayRole === 'wk' ? 'text-blue-400' : displayRole === 'bat-sub' ? 'text-accent-400' : 'text-blue-400';
              return (
                <div key={n} className={`flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg ${displayRole ? 'bg-white/5' : i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <span className="text-white text-xs sm:text-sm font-medium">{i + 1}. {shortName(n)}</span>
                  {roleText && <span className={`text-[10px] sm:text-xs font-bold ${roleColor}`}>{roleText}</span>}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
            <a href={`/c3h/field-editor?match=${match.id}`} className="text-blue-400 text-[10px] sm:text-xs font-medium hover:text-blue-300 underline">View Field Positions</a>
            <p className="text-primary-400 text-[10px] sm:text-xs font-medium mt-1">challengerscc.ca</p>
          </div>
        </div>
      </div>
    </div>
  );
}
