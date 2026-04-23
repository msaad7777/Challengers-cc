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
  x: number;
  y: number;
  position: string;
  role: 'wk' | 'bowler' | 'fielder';
}

// Zone-based position detection
function getPositionLabel(x: number, y: number, leftHanded: boolean): string {
  const fx = leftHanded ? -x : x;
  const dist = Math.sqrt(fx * fx + y * y);
  const angle = Math.atan2(fx, y) * (180 / Math.PI); // 0=straight (towards bowler/bottom), +ve=offside, -ve=legside

  // Close positions (within 30-yard circle)
  if (dist < 60) {
    if (angle > 60 && angle < 120) return 'Silly Point';
    if (angle < -60 && angle > -120) return 'Short Leg';
    if (angle > 20 && angle < 60) return 'Silly Mid-off';
    if (angle < -20 && angle > -60) return 'Silly Mid-on';
  }

  // Inner ring
  if (dist < 130) {
    if (angle > 100) return 'Gully';
    if (angle > 70) return 'Point';
    if (angle > 40) return 'Cover';
    if (angle > 15) return 'Mid-off';
    if (angle > -15) return 'Mid-on';
    if (angle > -40) return 'Mid-wicket';
    if (angle > -70) return 'Square Leg';
    if (angle > -100) return 'Leg Gully';
    if (y < 0) return angle > 0 ? 'Slip' : 'Leg Slip';
    return 'Fine Leg';
  }

  // Outer ring (boundary)
  if (angle > 140) return 'Third Man';
  if (angle > 100) return 'Backward Point';
  if (angle > 70) return 'Deep Point';
  if (angle > 40) return 'Deep Cover';
  if (angle > 15) return 'Long-off';
  if (angle > -15) return 'Long-on';
  if (angle > -40) return 'Deep Mid-wicket';
  if (angle > -70) return 'Deep Square Leg';
  if (angle > -100) return 'Deep Backward Square';
  if (angle > -140) return 'Long Leg';
  return 'Fine Leg';
}

// Default starting positions — batter at TOP, bowler at BOTTOM
const INITIAL_POSITIONS: { x: number; y: number; role: 'wk' | 'bowler' | 'fielder' }[] = [
  { x: 0, y: -55, role: 'wk' },        // WK (behind batter, top)
  { x: 0, y: 30, role: 'bowler' },      // Bowler (bottom, running in)
  { x: 30, y: -50, role: 'fielder' },   // 1st slip
  { x: 45, y: -45, role: 'fielder' },   // 2nd slip
  { x: 100, y: -10, role: 'fielder' },  // Point
  { x: 80, y: 50, role: 'fielder' },    // Cover
  { x: 30, y: 110, role: 'fielder' },   // Mid-off
  { x: -30, y: 110, role: 'fielder' },  // Mid-on
  { x: -80, y: 40, role: 'fielder' },   // Mid-wicket
  { x: -60, y: -20, role: 'fielder' },  // Square leg
  { x: -30, y: -80, role: 'fielder' },  // Fine leg
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
  const [batterName, setBatterName] = useState('');
  const [bowlerName, setBowlerName] = useState('');
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [matchInfo, setMatchInfo] = useState('');

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
        const data = fieldDoc.data();
        setPlayers(data.players as FieldPlayer[]);
        setBatterName(data.batterName || '');
        setBowlerName(data.bowlerName || '');
        setLeftHanded(data.leftHanded || false);
        setMatchInfo(data.matchInfo || '');
      } else if (squadPlayers.length >= 11) {
        const initial: FieldPlayer[] = squadPlayers.slice(0, 11).map((name, i) => {
          const pos = INITIAL_POSITIONS[i] || INITIAL_POSITIONS[2];
          const label = getPositionLabel(pos.x, pos.y, false);
          return { name, x: pos.x, y: pos.y, position: label, role: pos.role };
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
      players: updatedPlayers, batterName, bowlerName, leftHanded, matchInfo,
      updatedBy: session?.user?.email, updatedAt: new Date().toISOString(),
    });
    setTimeout(() => setSaving(false), 500);
  }, [matchId, batterName, bowlerName, leftHanded, matchInfo, session]);

  const getSVGPoint = (e: React.PointerEvent | React.TouchEvent): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.PointerEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.PointerEvent).clientY;
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const svgP = pt.matrixTransform(ctm.inverse());
    return { x: svgP.x, y: svgP.y };
  };

  const handlePointerDown = (idx: number) => setDraggedIdx(idx);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggedIdx === null) return;
    e.preventDefault();
    const pt = getSVGPoint(e);
    if (!pt) return;
    // Clamp to field boundary
    const dist = Math.sqrt(pt.x * pt.x + pt.y * pt.y);
    const maxR = 215;
    let nx = pt.x, ny = pt.y;
    if (dist > maxR) { nx = (pt.x / dist) * maxR; ny = (pt.y / dist) * maxR; }
    const position = getPositionLabel(nx, ny, false);
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
      const pos = INITIAL_POSITIONS[i] || INITIAL_POSITIONS[2];
      const label = getPositionLabel(pos.x, pos.y, false);
      return { name, x: pos.x, y: pos.y, position: label, role: pos.role };
    });
    setPlayers(initial);
    saveField(initial);
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

  const shortN = (n: string) => n.split(' ')[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />
      <section className="pt-24 pb-8 px-3 sm:px-4">
        <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          {!screenshotMode && (
            <div className="flex items-center justify-between mb-3">
              <div>
                <Link href="/c3h/availability" className="text-gray-500 text-xs hover:text-primary-400">&larr; Dugout</Link>
                <h1 className="text-xl font-bold text-white">Field <span className="gradient-text">Editor</span></h1>
              </div>
              {saving && <span className="text-accent-400 text-xs">Saving...</span>}
            </div>
          )}

          {/* Screenshot mode header */}
          {screenshotMode && (
            <div className="text-center mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-primary-400">CHALLENGERS CC</h2>
              <p className="text-white text-xs font-bold">Field Positions</p>
              <button onClick={() => setScreenshotMode(false)} className="text-gray-500 text-[10px] mt-1 underline">Back to Editor</button>
            </div>
          )}

          {/* Controls — hidden in screenshot mode */}
          {!screenshotMode && (
            <>
              <div className="flex flex-wrap gap-2 mb-3 text-[10px]">
                <label className="flex items-center gap-1 text-gray-400 glass px-2 py-1 rounded-lg">
                  <input type="checkbox" checked={showNames} onChange={e => setShowNames(e.target.checked)} className="w-3 h-3" />
                  Names
                </label>
                <label className="flex items-center gap-1 text-gray-400 glass px-2 py-1 rounded-lg">
                  <input type="checkbox" checked={showPositions} onChange={e => setShowPositions(e.target.checked)} className="w-3 h-3" />
                  Positions
                </label>
                <label className="flex items-center gap-1 text-gray-400 glass px-2 py-1 rounded-lg">
                  <input type="checkbox" checked={leftHanded} onChange={async e => {
                    const newLH = e.target.checked;
                    setLeftHanded(newLH);
                    const mirrored = players.map(p => {
                      const newX = -p.x;
                      return { ...p, x: newX, position: getPositionLabel(newX, p.y, false) };
                    });
                    setPlayers(mirrored);
                    await setDoc(doc(db, 'field-positions', matchId), {
                      players: mirrored, batterName, bowlerName, leftHanded: newLH, matchInfo,
                      updatedBy: session?.user?.email, updatedAt: new Date().toISOString(),
                    });
                  }} className="w-3 h-3" />
                  LHB
                </label>
                <button onClick={async () => { await saveField(players); alert('Field positions saved!'); }} className="text-primary-400 glass px-3 py-1 rounded-lg hover:bg-primary-500/10 font-bold">{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={resetPositions} className="text-red-400 glass px-2 py-1 rounded-lg hover:bg-red-500/10">Reset</button>
                <button onClick={() => { setShowNames(true); setShowPositions(true); setScreenshotMode(true); }} className="text-accent-400 glass px-2 py-1 rounded-lg hover:bg-accent-500/10">Share</button>
              </div>

              <div className="flex gap-2 mb-3">
                <input value={batterName} onChange={e => setBatterName(e.target.value)} onBlur={() => saveField(players)} placeholder="Batter name" className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs" />
                <input value={bowlerName} onChange={e => setBowlerName(e.target.value)} onBlur={() => saveField(players)} placeholder="Bowler name" className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs" />
              </div>
            </>
          )}

          {/* SVG Cricket Field */}
          <div className="relative">
            <svg
              ref={svgRef}
              viewBox="-250 -250 500 500"
              className="w-full rounded-full touch-none select-none"
              style={{ background: 'radial-gradient(circle, #1a5c30, #0d3318, #071a0d)', border: '3px solid #2d6b3f' }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* Boundary circle */}
              <circle cx="0" cy="0" r="240" fill="none" stroke="#3d8b4f" strokeWidth="2" />
              {/* 30-yard circle */}
              <circle cx="0" cy="0" r="130" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="6,4" opacity="0.3" />
              {/* Pitch */}
              <rect x="-12" y="-45" width="24" height="90" rx="2" fill="#c4a265" opacity="0.7" />
              {/* Crease lines */}
              <line x1="-20" y1="35" x2="20" y2="35" stroke="white" strokeWidth="0.8" opacity="0.5" />
              <line x1="-20" y1="-35" x2="20" y2="-35" stroke="white" strokeWidth="0.8" opacity="0.5" />
              {/* Stumps */}
              <rect x="-4" y="33" width="8" height="3" rx="1" fill="white" opacity="0.7" />
              <rect x="-4" y="-36" width="8" height="3" rx="1" fill="white" opacity="0.7" />

              {/* Batter — at TOP */}
              <circle cx={leftHanded ? 8 : -8} cy="-42" r="8" fill="#eab308" stroke="white" strokeWidth="2" />
              {showNames && <text x={leftHanded ? 8 : -8} y="-52" textAnchor="middle" fill="#eab308" fontSize="9" fontWeight="bold">{batterName || 'Batter'}</text>}

              {/* Fielders */}
              {players.map((p, i) => {
                const px = p.x;
                const isWk = p.role === 'wk';
                const isBowler = p.role === 'bowler';
                const fill = isWk ? '#3b82f6' : isBowler ? '#ef4444' : '#10b981';
                const strokeColor = isWk ? '#93c5fd' : isBowler ? '#fca5a5' : '#6ee7b7';
                return (
                  <g key={i}
                    onPointerDown={() => handlePointerDown(i)}
                    className="cursor-grab active:cursor-grabbing"
                    style={{ transition: draggedIdx === i ? 'none' : 'all 0.1s' }}
                  >
                    {/* Invisible larger hit area for touch */}
                    <circle cx={px} cy={p.y} r="22" fill="transparent" />
                    {/* Visible marker */}
                    <circle cx={px} cy={p.y} r={draggedIdx === i ? 12 : 10} fill={fill} stroke={strokeColor} strokeWidth="2" opacity={draggedIdx === i ? 1 : 0.9} />
                    {showNames && (
                      <>
                        <rect x={px - 28} y={p.y - 22} width="56" height="13" rx="4" fill="rgba(0,0,0,0.8)" />
                        <text x={px} y={p.y - 12} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
                          {shortN(p.name)}
                        </text>
                      </>
                    )}
                    {showPositions && (
                      <>
                        <rect x={px - 28} y={p.y + (showNames ? 12 : 10)} width="56" height="11" rx="4" fill="rgba(0,0,0,0.6)" />
                        <text x={px} y={p.y + (showNames ? 21 : 19)} textAnchor="middle" fill="#e5e7eb" fontSize="7" fontWeight="600">
                          {p.position}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Player List — hidden in screenshot mode */}
          <div className={`glass rounded-xl p-3 mt-3 ${screenshotMode ? 'hidden' : ''}`}>
            <h3 className="text-white font-bold text-xs mb-2">Players & Positions</h3>
            <div className="grid grid-cols-2 gap-1">
              {players.map((p, i) => (
                <div key={i} className={`flex items-center justify-between px-2 py-1 rounded text-[10px] ${p.role === 'wk' ? 'bg-blue-500/10' : p.role === 'bowler' ? 'bg-red-500/10' : i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <span className="text-white">{shortN(p.name)}</span>
                  <span className="text-gray-500">{p.position}</span>
                </div>
              ))}
            </div>
          </div>

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
