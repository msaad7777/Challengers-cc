"use client";

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface FieldPlayer {
  name: string;
  x: number; // 0-100 normalized
  y: number; // 0-100 normalized
  position: string;
  role: 'wk' | 'bowler' | 'fielder';
}

// Standard cricket positions — normalized 0-100 coordinates
// Batter at top, bowler at bottom (standard TV view)
const POSITION_COORDS: Record<string, { x: number; y: number }> = {
  'Wicketkeeper': { x: 50, y: 32 },
  'Slip': { x: 38, y: 29 },
  '2nd Slip': { x: 33, y: 26 },
  '3rd Slip': { x: 28, y: 23 },
  'Gully': { x: 25, y: 32 },
  'Point': { x: 25, y: 40 },
  'Cover': { x: 25, y: 57 },
  'Extra Cover': { x: 30, y: 52 },
  'Mid-off': { x: 35, y: 70 },
  'Mid-on': { x: 65, y: 70 },
  'Mid-wicket': { x: 75, y: 57 },
  'Square Leg': { x: 75, y: 40 },
  'Leg Gully': { x: 75, y: 32 },
  'Leg Slip': { x: 62, y: 29 },
  'Fine Leg': { x: 75, y: 12 },
  'Third Man': { x: 25, y: 12 },
  'Deep Point': { x: 5, y: 50 },
  'Deep Cover': { x: 18, y: 75 },
  'Deep Square Leg': { x: 95, y: 50 },
  'Deep Mid-wicket': { x: 82, y: 75 },
  'Long-off': { x: 43, y: 93 },
  'Long-on': { x: 57, y: 93 },
  'Long Leg': { x: 82, y: 12 },
  'Short Leg': { x: 62, y: 38 },
  'Silly Point': { x: 38, y: 38 },
  'Silly Mid-on': { x: 55, y: 55 },
  'Silly Mid-off': { x: 45, y: 55 },
  'Backward Point': { x: 15, y: 30 },
  'Deep Backward Square': { x: 90, y: 25 },
  'Cow Corner': { x: 80, y: 85 },
  'Bowler': { x: 50, y: 67 },
};

const POSITION_NAMES = Object.keys(POSITION_COORDS).filter(p => p !== 'Bowler' && p !== 'Wicketkeeper');

// Detect nearest position based on coordinates
function getNearestPosition(x: number, y: number): string {
  let closest = 'Fielder';
  let minDist = Infinity;
  for (const [name, coords] of Object.entries(POSITION_COORDS)) {
    if (name === 'Bowler' || name === 'Wicketkeeper') continue;
    const dist = Math.sqrt((x - coords.x) ** 2 + (y - coords.y) ** 2);
    if (dist < minDist) { minDist = dist; closest = name; }
  }
  return closest;
}

// Default starting positions for 11 fielders
const DEFAULT_FIELD: { position: string; role: 'wk' | 'bowler' | 'fielder' }[] = [
  { position: 'Wicketkeeper', role: 'wk' },
  { position: 'Bowler', role: 'bowler' },
  { position: 'Slip', role: 'fielder' },
  { position: 'Point', role: 'fielder' },
  { position: 'Cover', role: 'fielder' },
  { position: 'Mid-off', role: 'fielder' },
  { position: 'Mid-on', role: 'fielder' },
  { position: 'Mid-wicket', role: 'fielder' },
  { position: 'Square Leg', role: 'fielder' },
  { position: 'Fine Leg', role: 'fielder' },
  { position: 'Third Man', role: 'fielder' },
];

function FieldEditorContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get('match') || '';
  const svgRef = useRef<SVGSVGElement>(null);

  const [players, setPlayers] = useState<FieldPlayer[]>([]);
  const [squad, setSquad] = useState<string[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [showNames, setShowNames] = useState(true);
  const [showPositions, setShowPositions] = useState(true);
  const [leftHanded, setLeftHanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  useEffect(() => {
    if (!matchId || !session?.user?.email) return;
    const load = async () => {
      const squadDoc = await getDoc(doc(db, 'squads', matchId));
      const squadPlayers = squadDoc.exists() ? (squadDoc.data().players || []) as string[] : [];
      setSquad(squadPlayers);

      const fieldDoc = await getDoc(doc(db, 'field-positions', matchId));
      if (fieldDoc.exists()) {
        setPlayers(fieldDoc.data().players as FieldPlayer[]);
        setLeftHanded(fieldDoc.data().leftHanded || false);
      } else if (squadPlayers.length >= 11) {
        const initial: FieldPlayer[] = squadPlayers.slice(0, 11).map((name, i) => {
          const def = DEFAULT_FIELD[i] || DEFAULT_FIELD[2];
          const coords = POSITION_COORDS[def.position] || { x: 50, y: 50 };
          return { name, x: coords.x, y: coords.y, position: def.position, role: def.role };
        });
        setPlayers(initial);
      }
      setLoaded(true);
    };
    load();
  }, [matchId, session]);

  const saveField = useCallback(async (updatedPlayers: FieldPlayer[]) => {
    if (!matchId) return;
    setSaving(true);
    await setDoc(doc(db, 'field-positions', matchId), {
      players: updatedPlayers, leftHanded,
      updatedBy: session?.user?.email, updatedAt: new Date().toISOString(),
    });
    setTimeout(() => setSaving(false), 500);
  }, [matchId, leftHanded, session]);

  const getSVGPoint = (e: React.PointerEvent): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(3, Math.min(97, x)), y: Math.max(3, Math.min(97, y)) };
  };

  const handlePointerDown = (idx: number) => setDraggedIdx(idx);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggedIdx === null) return;
    e.preventDefault();
    const pt = getSVGPoint(e);
    if (!pt) return;
    // Clamp to circle boundary
    const dx = pt.x - 50, dy = pt.y - 50;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxR = 46;
    let nx = pt.x, ny = pt.y;
    if (dist > maxR) { nx = 50 + (dx / dist) * maxR; ny = 50 + (dy / dist) * maxR; }
    const position = getNearestPosition(nx, ny);
    const updated = [...players];
    updated[draggedIdx] = { ...updated[draggedIdx], x: nx, y: ny, position };
    setPlayers(updated);
  };

  const handlePointerUp = () => {
    if (draggedIdx !== null) saveField(players);
    setDraggedIdx(null);
  };

  const resetPositions = () => {
    if (squad.length < 11) return;
    const initial: FieldPlayer[] = squad.slice(0, 11).map((name, i) => {
      const def = DEFAULT_FIELD[i] || DEFAULT_FIELD[2];
      const coords = POSITION_COORDS[def.position] || { x: 50, y: 50 };
      return { name, x: coords.x, y: coords.y, position: def.position, role: def.role };
    });
    setPlayers(initial);
    saveField(initial);
  };

  const mirrorField = () => {
    const mirrored = players.map(p => ({
      ...p, x: 100 - p.x, position: getNearestPosition(100 - p.x, p.y)
    }));
    setPlayers(mirrored);
    setLeftHanded(!leftHanded);
    saveField(mirrored);
  };

  if (status === 'loading' || !session) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-primary-400">Loading...</div></div>;
  }

  if (!matchId) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="section-padding pt-32 text-center">
          <p className="text-gray-400">No match selected.</p>
          <Link href="/c3h/availability" className="text-primary-400 underline mt-4 inline-block">Go to The Dugout</Link>
        </div>
      </div>
    );
  }

  const shortN = (n: string) => {
    const SHORT: Record<string, string> = { 'Mohammed Saad': 'Saad', 'Syed Shahriar': 'Shahriar' };
    return SHORT[n] || n.split(' ')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {!screenshotMode && <Navbar />}
      <section className={screenshotMode ? 'py-4 px-3' : 'pt-24 pb-8 px-3 sm:px-4'}>
        <div className="max-w-sm sm:max-w-md md:max-w-lg mx-auto">

          {/* Screenshot mode header */}
          {screenshotMode && (
            <div className="text-center mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-primary-400">CHALLENGERS CC</h2>
              <p className="text-white text-xs font-bold">Field Positions</p>
              <button onClick={() => setScreenshotMode(false)} className="text-gray-500 text-[10px] mt-1 underline">Back to Editor</button>
            </div>
          )}

          {/* Edit mode header */}
          {!screenshotMode && (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Link href="/c3h/availability" className="text-gray-500 text-xs hover:text-primary-400">&larr; Dugout</Link>
                  <h1 className="text-xl font-bold text-white">Field <span className="gradient-text">Editor</span></h1>
                </div>
                {saving && <span className="text-accent-400 text-xs">Saving...</span>}
              </div>

              <div className="flex flex-wrap gap-2 mb-3 text-[10px]">
                <label className="flex items-center gap-1 text-gray-400 glass px-2 py-1 rounded-lg">
                  <input type="checkbox" checked={showNames} onChange={e => setShowNames(e.target.checked)} className="w-3 h-3" />
                  Names
                </label>
                <label className="flex items-center gap-1 text-gray-400 glass px-2 py-1 rounded-lg">
                  <input type="checkbox" checked={showPositions} onChange={e => setShowPositions(e.target.checked)} className="w-3 h-3" />
                  Positions
                </label>
                <button onClick={mirrorField} className="text-blue-400 glass px-2 py-1 rounded-lg hover:bg-blue-500/10">LHB Mirror</button>
                <button onClick={async () => { await saveField(players); }} className="text-primary-400 glass px-3 py-1 rounded-lg hover:bg-primary-500/10 font-bold">{saving ? '...' : 'Save'}</button>
                <button onClick={resetPositions} className="text-red-400 glass px-2 py-1 rounded-lg hover:bg-red-500/10">Reset</button>
                <button onClick={() => { setShowNames(true); setShowPositions(true); setScreenshotMode(true); }} className="text-accent-400 glass px-2 py-1 rounded-lg hover:bg-accent-500/10">Share</button>
              </div>
            </>
          )}

          {/* SVG Cricket Field */}
          <div className="relative">
            <svg
              ref={svgRef}
              viewBox="0 0 100 100"
              className="w-full touch-none select-none"
              style={{ background: 'radial-gradient(circle at 50% 50%, #1a5c30 0%, #0d3318 60%, #071a0d 100%)', borderRadius: '50%', border: '3px solid #2d6b3f' }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* Boundary */}
              <circle cx="50" cy="50" r="47" fill="none" stroke="#3d8b4f" strokeWidth="0.5" />
              {/* 30-yard circle */}
              <circle cx="50" cy="50" r="28" fill="none" stroke="white" strokeWidth="0.3" strokeDasharray="2,1.5" opacity="0.25" />
              {/* Pitch */}
              <rect x="48" y="38" width="4" height="24" rx="0.5" fill="#c4a265" opacity="0.6" />
              {/* Crease lines */}
              <line x1="46" y1="42" x2="54" y2="42" stroke="white" strokeWidth="0.3" opacity="0.4" />
              <line x1="46" y1="58" x2="54" y2="58" stroke="white" strokeWidth="0.3" opacity="0.4" />
              {/* Stumps */}
              <rect x="49" y="41" width="2" height="1.5" rx="0.3" fill="white" opacity="0.6" />
              <rect x="49" y="57.5" width="2" height="1.5" rx="0.3" fill="white" opacity="0.6" />

              {/* Fielders */}
              {players.map((p, i) => {
                const isWk = p.role === 'wk';
                const isBowler = p.role === 'bowler';
                const fill = isWk ? '#3b82f6' : isBowler ? '#ef4444' : '#10b981';
                const stroke = isWk ? '#93c5fd' : isBowler ? '#fca5a5' : '#6ee7b7';
                const r = draggedIdx === i ? 2.8 : 2.2;
                return (
                  <g key={i}
                    onPointerDown={() => !screenshotMode && handlePointerDown(i)}
                    className={screenshotMode ? '' : 'cursor-grab active:cursor-grabbing'}
                    style={{ transition: draggedIdx === i ? 'none' : 'all 0.15s' }}
                  >
                    <circle cx={p.x} cy={p.y} r="5" fill="transparent" />
                    <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke={stroke} strokeWidth="0.5" />
                    {showNames && (
                      <>
                        <rect x={p.x - 7} y={isWk ? p.y - 5.5 : p.y - 5} width="14" height="3" rx="1" fill="rgba(0,0,0,0.85)" />
                        <text x={p.x} y={isWk ? p.y - 3.2 : p.y - 2.7} textAnchor="middle" fill={isWk ? '#93c5fd' : isBowler ? '#fca5a5' : 'white'} fontSize="2" fontWeight="bold">
                          {shortN(p.name)}{isWk ? ' (wk)' : ''}
                        </text>
                      </>
                    )}
                    {showPositions && !isWk && !isBowler && (
                      <>
                        <rect x={p.x - 7} y={p.y + (showNames ? 2.5 : 2)} width="14" height="2.5" rx="1" fill="rgba(0,0,0,0.6)" />
                        <text x={p.x} y={p.y + (showNames ? 4.3 : 3.8)} textAnchor="middle" fill="#d1d5db" fontSize="1.6">
                          {p.position}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Player List */}
          {!screenshotMode && (
            <div className="glass rounded-xl p-3 mt-3">
              <h3 className="text-white font-bold text-xs mb-2">Players & Positions</h3>
              <div className="grid grid-cols-2 gap-1">
                {players.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-1 rounded text-[10px]">
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${p.role === 'wk' ? 'bg-blue-500' : p.role === 'bowler' ? 'bg-red-500' : 'bg-primary-500'}`}></span>
                      <span className="text-white">{shortN(p.name)}</span>
                    </div>
                    {!screenshotMode && p.role === 'fielder' && (
                      <select value={p.position} onChange={e => {
                        const pos = e.target.value;
                        const coords = POSITION_COORDS[pos];
                        if (!coords) return;
                        const updated = [...players];
                        updated[i] = { ...updated[i], position: pos, x: coords.x, y: coords.y };
                        setPlayers(updated);
                        saveField(updated);
                      }} className="bg-transparent text-gray-500 text-[9px] border-none outline-none w-24">
                        {POSITION_NAMES.map(pos => <option key={pos} value={pos} className="bg-gray-900 text-white">{pos}</option>)}
                      </select>
                    )}
                    {(p.role === 'wk' || p.role === 'bowler') && (
                      <span className="text-gray-600 text-[9px]">{p.role === 'wk' ? 'Keeper' : 'Bowler'}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}

export default function FieldEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-primary-400">Loading...</div></div>}>
      <FieldEditorContent />
    </Suspense>
  );
}
