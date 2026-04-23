"use client";

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface FieldPlayer {
  name: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  position: string;
}

const FIELD_POSITIONS = [
  'Wicketkeeper', 'Slip', '2nd Slip', '3rd Slip', 'Gully',
  'Point', 'Cover', 'Extra Cover', 'Mid-off', 'Mid-on',
  'Mid-wicket', 'Square Leg', 'Fine Leg', 'Third Man',
  'Long-off', 'Long-on', 'Deep Mid-wicket', 'Deep Square Leg',
  'Deep Point', 'Deep Cover', 'Long Leg', 'Silly Point',
  'Short Leg', 'Leg Slip', 'Backward Point',
];

const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  'Wicketkeeper': { x: 50, y: 85 },
  'Slip': { x: 60, y: 82 },
  '2nd Slip': { x: 66, y: 79 },
  'Gully': { x: 72, y: 72 },
  'Point': { x: 78, y: 55 },
  'Cover': { x: 72, y: 40 },
  'Mid-off': { x: 58, y: 22 },
  'Mid-on': { x: 42, y: 22 },
  'Mid-wicket': { x: 28, y: 42 },
  'Square Leg': { x: 22, y: 58 },
  'Fine Leg': { x: 25, y: 82 },
};

function FieldEditorContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get('match') || '';
  const fieldRef = useRef<HTMLDivElement>(null);

  const [players, setPlayers] = useState<FieldPlayer[]>([]);
  const [squad, setSquad] = useState<string[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [showNames, setShowNames] = useState(true);
  const [showPositions, setShowPositions] = useState(true);
  const [leftHanded, setLeftHanded] = useState(false);
  const [batterName, setBatterName] = useState('Batter');
  const [bowlerName, setBowlerName] = useState('Bowler');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  // Load squad and field positions
  useEffect(() => {
    if (!matchId || !session?.user?.email) return;
    const load = async () => {
      // Load squad
      const squadDoc = await getDoc(doc(db, 'squads', matchId));
      const squadPlayers = squadDoc.exists() ? (squadDoc.data().players || []) as string[] : [];
      setSquad(squadPlayers);

      // Load saved field positions
      const fieldDoc = await getDoc(doc(db, 'field-positions', matchId));
      if (fieldDoc.exists()) {
        setPlayers(fieldDoc.data().players as FieldPlayer[]);
        setBatterName(fieldDoc.data().batterName || 'Batter');
        setBowlerName(fieldDoc.data().bowlerName || 'Bowler');
        setLeftHanded(fieldDoc.data().leftHanded || false);
      } else if (squadPlayers.length >= 11) {
        // Initialize with default positions
        const positionKeys = Object.keys(DEFAULT_POSITIONS);
        const initial: FieldPlayer[] = squadPlayers.slice(0, 11).map((name, i) => {
          const pos = positionKeys[i] || 'Point';
          const coords = DEFAULT_POSITIONS[pos] || { x: 50, y: 50 };
          return { name, x: coords.x, y: coords.y, position: pos };
        });
        setPlayers(initial);
      }
      setLoaded(true);
    };
    load();
  }, [matchId, session]);

  const saveField = async (updatedPlayers: FieldPlayer[]) => {
    setSaving(true);
    await setDoc(doc(db, 'field-positions', matchId), {
      players: updatedPlayers,
      batterName,
      bowlerName,
      leftHanded,
      updatedBy: session?.user?.email,
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
  };

  const handlePointerDown = (index: number) => {
    setDragging(index);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragging === null || !fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.max(2, Math.min(98, x));
    y = Math.max(2, Math.min(98, y));
    if (leftHanded) x = 100 - x;

    const updated = [...players];
    updated[dragging] = { ...updated[dragging], x: leftHanded ? 100 - x : x, y };
    setPlayers(updated);
  };

  const handlePointerUp = () => {
    if (dragging !== null) {
      saveField(players);
    }
    setDragging(null);
  };

  const assignPosition = (index: number, position: string) => {
    const updated = [...players];
    const coords = DEFAULT_POSITIONS[position];
    updated[index] = {
      ...updated[index],
      position,
      ...(coords ? { x: coords.x, y: coords.y } : {}),
    };
    setPlayers(updated);
    saveField(updated);
  };

  if (status === 'loading' || !session) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-primary-400">Loading...</div></div>;
  }

  if (!matchId) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="section-padding pt-32 text-center">
          <p className="text-gray-400">No match selected. Go to The Dugout and select a match.</p>
          <Link href="/c3h/availability" className="text-primary-400 underline mt-4 inline-block">Go to The Dugout</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-32 md:pt-36">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/c3h/availability" className="text-gray-500 text-sm hover:text-primary-400">&larr; The Dugout</Link>
            <h1 className="text-2xl font-bold text-white mt-2">Field <span className="gradient-text">Editor</span></h1>
            {saving && <span className="text-accent-400 text-xs ml-2">Saving...</span>}
          </div>

          {/* Controls */}
          <div className="glass rounded-xl p-3 mb-4 flex flex-wrap gap-2 items-center text-xs">
            <label className="flex items-center gap-1 text-gray-400">
              <input type="checkbox" checked={showNames} onChange={e => setShowNames(e.target.checked)} className="rounded" />
              Names
            </label>
            <label className="flex items-center gap-1 text-gray-400">
              <input type="checkbox" checked={showPositions} onChange={e => setShowPositions(e.target.checked)} className="rounded" />
              Positions
            </label>
            <label className="flex items-center gap-1 text-gray-400">
              <input type="checkbox" checked={leftHanded} onChange={e => { setLeftHanded(e.target.checked); saveField(players); }} className="rounded" />
              Left-Handed
            </label>
            <div className="flex gap-2 ml-auto">
              <input value={batterName} onChange={e => setBatterName(e.target.value)} onBlur={() => saveField(players)} placeholder="Batter" className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs w-24" />
              <input value={bowlerName} onChange={e => setBowlerName(e.target.value)} onBlur={() => saveField(players)} placeholder="Bowler" className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs w-24" />
            </div>
          </div>

          {/* Field */}
          <div className="grid md:grid-cols-[1fr_200px] gap-4">
            <div
              ref={fieldRef}
              className="relative aspect-square w-full max-w-lg mx-auto rounded-full overflow-hidden touch-none select-none"
              style={{ background: 'radial-gradient(circle, #1a472a 0%, #0d2e18 70%, #071a0d 100%)', border: '3px solid #2d6b3f' }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* 30-yard circle */}
              <div className="absolute inset-[20%] rounded-full border border-dashed border-white/15"></div>

              {/* Pitch */}
              <div className="absolute left-1/2 top-[38%] -translate-x-1/2 w-[6%] h-[24%] rounded-sm" style={{ background: '#c4a265', opacity: 0.6 }}></div>

              {/* Crease lines */}
              <div className="absolute left-[44%] top-[55%] w-[12%] h-[1px] bg-white/40"></div>
              <div className="absolute left-[44%] top-[42%] w-[12%] h-[1px] bg-white/40"></div>

              {/* Batter */}
              <div className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-4 h-4 rounded-full bg-accent-500 border-2 border-white shadow-lg"></div>
                {showNames && <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-accent-400 whitespace-nowrap font-bold">{batterName}</span>}
              </div>

              {/* Bowler */}
              <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-3 h-3 rounded-full bg-white/60 border border-white"></div>
                {showNames && <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-white/60 whitespace-nowrap">{bowlerName}</span>}
              </div>

              {/* Fielders */}
              {players.map((p, i) => {
                const px = leftHanded ? 100 - p.x : p.x;
                return (
                  <div
                    key={i}
                    className={`absolute z-20 cursor-grab active:cursor-grabbing ${dragging === i ? 'scale-125' : ''}`}
                    style={{ left: `${px}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)', transition: dragging === i ? 'none' : 'all 0.15s' }}
                    onPointerDown={() => handlePointerDown(i)}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 shadow-lg ${i === 0 ? 'bg-blue-500 border-blue-300' : 'bg-primary-500 border-primary-300'}`}></div>
                    {(showNames || showPositions) && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                        {showNames && <span className="text-[7px] text-white font-bold block">{p.name.split(' ')[0]}</span>}
                        {showPositions && <span className="text-[6px] text-gray-400 block">{p.position}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Player List */}
            <div className="glass rounded-xl p-3 max-h-[500px] overflow-y-auto">
              <h3 className="text-white font-bold text-xs mb-2">Assign Positions</h3>
              <div className="space-y-2">
                {players.map((p, i) => (
                  <div key={i} className="text-xs">
                    <p className="text-white font-medium mb-1">{i + 1}. {p.name.split(' ')[0]}</p>
                    <select
                      value={p.position}
                      onChange={e => assignPosition(i, e.target.value)}
                      className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-gray-300 text-xs"
                    >
                      {FIELD_POSITIONS.map(pos => (
                        <option key={pos} value={pos} className="bg-gray-900">{pos}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
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
