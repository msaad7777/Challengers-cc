"use client";

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
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
// Based on Wikipedia cricket fielding positions diagram
// Batter at top (batting end), bowler at bottom (bowling end)
// Off side = LEFT (for right-hand batter), Leg side = RIGHT
const POSITION_COORDS: Record<string, { x: number; y: number }> = {
  // Behind wicket (close) — slips fan outward from WK on off side
  'Wicketkeeper': { x: 50, y: 30 },
  '1st Slip': { x: 45, y: 28 },
  '2nd Slip': { x: 41, y: 27 },
  '3rd Slip': { x: 37, y: 27 },
  'Leg Slip': { x: 60, y: 27 },
  'Gully': { x: 27, y: 32 },
  'Leg Gully': { x: 73, y: 32 },
  // Close catching (off side)
  'Silly Point': { x: 40, y: 42 },
  'Silly Mid-off': { x: 44, y: 52 },
  // Close catching (leg side)
  'Short Leg': { x: 60, y: 42 },
  'Silly Mid-on': { x: 56, y: 52 },
  // Inner ring (off side)
  'Point': { x: 22, y: 42 },
  'Cover Point': { x: 20, y: 50 },
  'Cover': { x: 22, y: 55 },
  'Extra Cover': { x: 28, y: 60 },
  'Mid-off': { x: 38, y: 72 },
  // Inner ring (leg side)
  'Square Leg': { x: 78, y: 42 },
  'Mid-wicket': { x: 78, y: 55 },
  'Mid-on': { x: 62, y: 72 },
  // Inner ring (behind)
  'Fine Leg': { x: 80, y: 18 },
  'Third Man': { x: 20, y: 18 },
  'Backward Point': { x: 15, y: 30 },
  'Backward Square Leg': { x: 85, y: 30 },
  // Boundary (off side)
  'Deep Backward Point': { x: 5, y: 25 },
  'Deep Point': { x: 7, y: 42 },
  'Deep Cover': { x: 10, y: 62 },
  'Deep Extra Cover': { x: 18, y: 72 },
  'Long-off': { x: 38, y: 92 },
  // Boundary (leg side)
  'Deep Backward Square Leg': { x: 95, y: 25 },
  'Deep Square Leg': { x: 93, y: 42 },
  'Deep Mid-wicket': { x: 90, y: 62 },
  'Long-on': { x: 62, y: 92 },
  'Deep Fine Leg': { x: 88, y: 12 },
  'Long Leg': { x: 85, y: 18 },
  // Boundary (behind)
  'Deep Third Man': { x: 12, y: 12 },
  // Special
  'Cow Corner': { x: 82, y: 80 },
  'Sweeper': { x: 8, y: 50 },
  // Fixed
  'Bowler': { x: 50, y: 67 },
};

const POSITION_NAMES = Object.keys(POSITION_COORDS).filter(p => p !== 'Bowler' && p !== 'Wicketkeeper').sort();

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

// Default fielding positions for 10 outfield players (index 0 = player 3 in squad, etc.)
const FIELDER_POSITIONS = [
  'Gully', 'Point', 'Cover', 'Extra Cover', 'Mid-off',
  'Mid-on', 'Mid-wicket', 'Square Leg', 'Fine Leg', 'Third Man',
];

// 30-yard inner ring corresponds to circle radius 28 in our 100x100 SVG
// (boundary is r=47, inner ring r=28). Used for powerplay fielder counter.
const INNER_RING_RADIUS = 28;

const isOutsideInnerRing = (x: number, y: number) => {
  const dx = x - 50;
  const dy = y - 50;
  return Math.sqrt(dx * dx + dy * dy) > INNER_RING_RADIUS;
};

// Match phase determines fielder-outside-ring limits.
// Powerplay: max 2 outside. After Powerplay: max 5 outside. Format-agnostic
// — applies to T20, T30, and other limited-overs formats we play.
type MatchPhase = 'powerplay' | 'after-pp';

const PHASE_LIMITS: Record<MatchPhase, { max: number; label: string }> = {
  'powerplay': { max: 2, label: 'Powerplay (max 2 outside)' },
  'after-pp': { max: 5, label: 'After Powerplay (max 5 outside)' },
};

// Captains plan up to four distinct field configurations per match —
// each saved separately. The Powerplay scenario assumes PP rules (max 2
// outside ring); the other three assume After-PP rules (max 5).
type ScenarioId = 'powerplay' | 'after-pp' | 'pacer' | 'spin';

const SCENARIO_IDS: ScenarioId[] = ['powerplay', 'after-pp', 'pacer', 'spin'];

const SCENARIO_META: Record<ScenarioId, { name: string; emoji: string; phase: MatchPhase; description: string }> = {
  'powerplay':  { name: 'Powerplay',       emoji: '⚡', phase: 'powerplay', description: 'Attacking field, max 2 outside ring' },
  'after-pp':   { name: 'After Powerplay', emoji: '🛡️', phase: 'after-pp',  description: 'Boundary protection, 5 outside' },
  'pacer':      { name: 'Pacer',           emoji: '🔥', phase: 'after-pp',  description: 'Pace bowling — 3 slips + gully' },
  'spin':       { name: 'Spin',            emoji: '🌀', phase: 'after-pp',  description: 'Spin bowling — close catchers' },
};

type ScenarioMap = Record<ScenarioId, FieldPlayer[]>;

const emptyScenarios = (): ScenarioMap => ({
  'powerplay': [],
  'after-pp': [],
  'pacer': [],
  'spin': [],
});

// Field presets — each preset specifies 9 fielding positions (excluding WK +
// Bowler, which are fixed by squad roles). The captain's existing fielders
// are reassigned to these positions in their current order.
type FieldPreset = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  positions: string[]; // length 9
};

const FIELD_PRESETS: FieldPreset[] = [
  {
    id: 'powerplay',
    name: 'Powerplay',
    emoji: '⚡',
    description: '2 slips + ring, attacking, max 2 outside',
    positions: ['1st Slip', '2nd Slip', 'Gully', 'Point', 'Cover', 'Mid-off', 'Mid-on', 'Fine Leg', 'Third Man'],
  },
  {
    id: 'after-pp',
    name: 'After Powerplay',
    emoji: '🛡️',
    description: 'Boundary protection, 5 outside',
    positions: ['Point', 'Cover Point', 'Mid-off', 'Mid-on', 'Long-off', 'Long-on', 'Deep Mid-wicket', 'Deep Square Leg', 'Deep Point'],
  },
  {
    id: 'pacer-new-ball',
    name: 'Pacer (new ball)',
    emoji: '🔥',
    description: '3 slips + gully, attacking pace setup',
    positions: ['1st Slip', '2nd Slip', '3rd Slip', 'Gully', 'Point', 'Mid-off', 'Mid-on', 'Fine Leg', 'Third Man'],
  },
  {
    id: 'spin-attack',
    name: 'Spin attack',
    emoji: '🌀',
    description: 'Close catchers + ring, for spinners',
    positions: ['1st Slip', 'Silly Point', 'Short Leg', 'Point', 'Mid-off', 'Mid-on', 'Square Leg', 'Long-off', 'Long-on'],
  },
];

// Pick the next available default fielder position (Gully, Point, Cover, etc.)
// — used when a player needs to be placed somewhere but their saved position
// is taken or they have no saved position.
function nextAvailableFielderPos(usedPositions: Set<string>): string {
  return FIELDER_POSITIONS.find((p) => !usedPositions.has(p)) || 'Point';
}

// Reconcile a saved field with the current squad + role assignments:
// - Players still in the squad keep their exact saved position UNLESS the
//   role designation has changed (e.g., a different player is now the WK)
// - WK position always belongs to the player marked role='wk' in the squad.
//   If saved field had someone else at WK, they get bumped to a default
//   fielder position.
// - Bowler position always belongs to the player marked role='bowl-sub'.
//   Same swap logic as WK.
// - Players new to the squad fill freed slots or default fielder positions.
function reconcileFieldWithSquad(
  savedField: FieldPlayer[],
  squadPlayers: string[],
  roles: Record<string, string> = {},
): FieldPlayer[] {
  if (squadPlayers.length === 0) return [];

  const squadSet = new Set(squadPlayers);
  const wkPlayer = squadPlayers.find((p) => roles[p] === 'wk');
  const bowlSubPlayer = squadPlayers.find((p) => roles[p] === 'bowl-sub');

  // Step 1: keep saved positions for players still in the squad,
  // BUT clear out anyone occupying WK or Bowler if the role has shifted.
  const filtered = savedField.filter((fp) => squadSet.has(fp.name));
  const reassigned: FieldPlayer[] = filtered.map((fp) => {
    if (fp.position === 'Wicketkeeper' && wkPlayer && fp.name !== wkPlayer) {
      return { ...fp, position: '__pending__', role: 'fielder' as const };
    }
    if (fp.position === 'Bowler' && bowlSubPlayer && fp.name !== bowlSubPlayer) {
      return { ...fp, position: '__pending__', role: 'fielder' as const };
    }
    return fp;
  });

  // Step 2: place WK and Bowler from role assignments
  const reconciled: FieldPlayer[] = [];
  if (wkPlayer && squadSet.has(wkPlayer)) {
    const c = POSITION_COORDS['Wicketkeeper'];
    reconciled.push({ name: wkPlayer, x: c.x, y: c.y, position: 'Wicketkeeper', role: 'wk' });
  }
  if (bowlSubPlayer && squadSet.has(bowlSubPlayer) && bowlSubPlayer !== wkPlayer) {
    const c = POSITION_COORDS['Bowler'];
    reconciled.push({ name: bowlSubPlayer, x: c.x, y: c.y, position: 'Bowler', role: 'bowler' });
  }

  // Step 3: place all other reassigned players (already in squad), preserving
  // their saved fielder positions. Skip anyone whose position got cleared
  // (those are handled in Step 4) and skip anyone we already placed (WK/Bowler).
  const placed = new Set(reconciled.map((fp) => fp.name));
  for (const fp of reassigned) {
    if (placed.has(fp.name)) continue;
    if (fp.position === '__pending__') continue;
    reconciled.push(fp);
    placed.add(fp.name);
  }

  // Step 4: place players whose position was cleared (got bumped from WK/Bowler)
  // at the next available default fielder position.
  for (const fp of reassigned) {
    if (placed.has(fp.name)) continue;
    if (fp.position !== '__pending__') continue;
    const usedPositions = new Set(reconciled.map((p) => p.position));
    const pos = nextAvailableFielderPos(usedPositions);
    const c = POSITION_COORDS[pos] || { x: 50, y: 50 };
    reconciled.push({ name: fp.name, x: c.x, y: c.y, position: pos, role: 'fielder' });
    placed.add(fp.name);
  }

  // Step 5: place new squad members (not yet on field) at default fielder spots
  for (const name of squadPlayers) {
    if (placed.has(name)) continue;
    const usedPositions = new Set(reconciled.map((p) => p.position));
    const pos = nextAvailableFielderPos(usedPositions);
    const c = POSITION_COORDS[pos] || { x: 50, y: 50 };
    reconciled.push({ name, x: c.x, y: c.y, position: pos, role: 'fielder' });
    placed.add(name);
  }

  return reconciled;
}

// Apply a preset's positions to a player list — keeps WK + Bowler in
// place, reassigns the 9 fielders to preset positions in their current
// order. Mirrors x for left-handed batter.
function applyPresetToPlayers(
  basePlayers: FieldPlayer[],
  preset: FieldPreset,
  leftHanded: boolean,
): FieldPlayer[] {
  const wk = basePlayers.find((p) => p.role === 'wk');
  const bowler = basePlayers.find((p) => p.role === 'bowler');
  const fielders = basePlayers.filter((p) => p.role === 'fielder');
  if (fielders.length === 0) return basePlayers;

  const newPlayers: FieldPlayer[] = [];
  if (wk) newPlayers.push(wk);
  if (bowler) newPlayers.push(bowler);

  fielders.forEach((p, i) => {
    const posName = preset.positions[i] || nextAvailableFielderPos(
      new Set(newPlayers.map((np) => np.position)),
    );
    const c = POSITION_COORDS[posName] || { x: 50, y: 50 };
    const x = leftHanded ? 100 - c.x : c.x;
    const finalPos = leftHanded ? getNearestPosition(x, c.y) : posName;
    newPlayers.push({ ...p, x, y: c.y, position: finalPos });
  });

  return newPlayers;
}

// Build a fresh field from a squad — uses role assignments (wk, bowl-sub) when
// present; falls back to squad order (index 0 = WK, index 1 = Bowler) otherwise.
function buildFieldFromSquad(
  squadPlayers: string[],
  roles: Record<string, string> = {},
): FieldPlayer[] {
  const result: FieldPlayer[] = [];
  if (squadPlayers.length === 0) return result;

  const wkPlayer = squadPlayers.find((p) => roles[p] === 'wk') || squadPlayers[0];
  const bowlSubPlayer =
    squadPlayers.find((p) => roles[p] === 'bowl-sub') ||
    squadPlayers.find((p) => p !== wkPlayer);

  if (wkPlayer) {
    const c = POSITION_COORDS['Wicketkeeper'];
    result.push({ name: wkPlayer, x: c.x, y: c.y, position: 'Wicketkeeper', role: 'wk' });
  }
  if (bowlSubPlayer && bowlSubPlayer !== wkPlayer) {
    const c = POSITION_COORDS['Bowler'];
    result.push({ name: bowlSubPlayer, x: c.x, y: c.y, position: 'Bowler', role: 'bowler' });
  }

  const placed = new Set([wkPlayer, bowlSubPlayer].filter(Boolean) as string[]);
  const remaining = squadPlayers.filter((p) => !placed.has(p));
  remaining.forEach((name) => {
    const usedPositions = new Set(result.map((fp) => fp.position));
    const pos = nextAvailableFielderPos(usedPositions);
    const c = POSITION_COORDS[pos] || { x: 50, y: 50 };
    result.push({ name, x: c.x, y: c.y, position: pos, role: 'fielder' });
  });

  return result;
}

function FieldEditorContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get('match') || '';
  const svgRef = useRef<SVGSVGElement>(null);

  const [scenarios, setScenarios] = useState<ScenarioMap>(emptyScenarios);
  const [activeScenario, setActiveScenario] = useState<ScenarioId>('powerplay');
  const [viewMode, setViewMode] = useState<'edit' | 'compare'>('edit');
  const [squad, setSquad] = useState<string[]>([]);
  const [squadRoles, setSquadRoles] = useState<Record<string, string>>({});
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [showNames, setShowNames] = useState(true);
  const [showPositions, setShowPositions] = useState(true);
  const [leftHanded, setLeftHanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Active scenario's players — derived view, not its own state. Mutations
  // route through `setActivePlayers` which writes back into the scenarios map.
  const players = scenarios[activeScenario];
  const setActivePlayers = useCallback(
    (next: FieldPlayer[] | ((prev: FieldPlayer[]) => FieldPlayer[])) => {
      setScenarios((prev) => {
        const current = prev[activeScenario];
        const newPlayers = typeof next === 'function' ? (next as (p: FieldPlayer[]) => FieldPlayer[])(current) : next;
        return { ...prev, [activeScenario]: newPlayers };
      });
    },
    [activeScenario],
  );

  // Ref for saveField to access latest scenarios without invalidating the callback
  const scenariosRef = useRef(scenarios);
  useEffect(() => { scenariosRef.current = scenarios; }, [scenarios]);
  const leftHandedRef = useRef(leftHanded);
  useEffect(() => { leftHandedRef.current = leftHanded; }, [leftHanded]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  // Live subscription to squad doc — keeps every scenario's field in sync
  // with role changes (WK / bat-sub / bowl-sub) and Playing 12 swaps made on
  // the Dugout page. Whenever the squad doc updates, we reconcile each of
  // the four scenarios against the new squad and persist the merged result.
  // Migrates legacy single-field docs ({players, leftHanded}) into the new
  // scenarios map on first read.
  useEffect(() => {
    if (!matchId || !session?.user?.email) return;

    const unsub = onSnapshot(doc(db, 'squads', matchId), async (squadSnap) => {
      const fullSquad = squadSnap.exists()
        ? ((squadSnap.data().players || []) as string[])
        : [];
      const newSquadRoles = squadSnap.exists()
        ? ((squadSnap.data().roles || {}) as Record<string, string>)
        : {};

      const fieldingPlayers = fullSquad.filter(
        (name) => newSquadRoles[name] !== 'bat-sub',
      );

      setSquad(fieldingPlayers);
      setSquadRoles(newSquadRoles);

      const fieldDoc = await getDoc(doc(db, 'field-positions', matchId));
      const data = fieldDoc.exists() ? fieldDoc.data() : null;

      // Detect doc shape — new (scenarios map) vs legacy (single players[]).
      const savedScenarios: Partial<ScenarioMap> = data?.scenarios
        ? (data.scenarios as ScenarioMap)
        : data?.players
          // Legacy: existing field becomes the powerplay scenario
          ? { 'powerplay': data.players as FieldPlayer[] }
          : {};

      const savedLeftHanded = (data?.leftHanded as boolean) || false;

      // Reconcile each scenario; seed empty scenarios from their preset.
      const reconciled = emptyScenarios();
      let didSeedOrMigrate = !data?.scenarios; // any legacy doc needs persist

      for (const id of SCENARIO_IDS) {
        const saved = savedScenarios[id] || [];
        if (saved.length > 0) {
          reconciled[id] = reconcileFieldWithSquad(saved, fieldingPlayers, newSquadRoles);
        } else if (fieldingPlayers.length >= 11) {
          const base = buildFieldFromSquad(fieldingPlayers, newSquadRoles);
          const preset = FIELD_PRESETS.find((p) => p.id === id);
          reconciled[id] = preset
            ? applyPresetToPlayers(base, preset, savedLeftHanded)
            : base;
          didSeedOrMigrate = true;
        }
      }

      setScenarios(reconciled);
      setLeftHanded(savedLeftHanded);

      // Persist if we migrated or seeded any scenario.
      const allPopulated = SCENARIO_IDS.every((id) => reconciled[id].length > 0);
      if (didSeedOrMigrate && allPopulated) {
        setDoc(doc(db, 'field-positions', matchId), {
          scenarios: reconciled,
          leftHanded: savedLeftHanded,
          updatedBy: session?.user?.email,
          updatedAt: new Date().toISOString(),
        }).catch((err) =>
          console.error('Failed to persist scenarios doc:', err),
        );
      }

      setLoaded(true);
    });

    return () => unsub();
  }, [matchId, session]);

  // Save the full scenarios map. The active scenario is overwritten with
  // `updatedActivePlayers`; the other three scenarios are read from the
  // ref so we don't lose unsaved-but-in-state edits in other tabs.
  const saveField = useCallback(async (updatedActivePlayers: FieldPlayer[]) => {
    if (!matchId) return;
    setSaving(true);
    const merged: ScenarioMap = {
      ...scenariosRef.current,
      [activeScenario]: updatedActivePlayers,
    };
    await setDoc(doc(db, 'field-positions', matchId), {
      scenarios: merged,
      leftHanded: leftHandedRef.current,
      updatedBy: session?.user?.email,
      updatedAt: new Date().toISOString(),
    });
    setTimeout(() => setSaving(false), 500);
  }, [matchId, session, activeScenario]);

  const getSVGPoint = (e: React.PointerEvent): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(3, Math.min(97, x)), y: Math.max(3, Math.min(97, y)) };
  };

  const handlePointerDown = (idx: number) => {
    // WK and Bowler are fixed — not draggable
    if (players[idx]?.role === 'wk' || players[idx]?.role === 'bowler') return;
    setDraggedIdx(idx);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggedIdx === null) return;
    e.preventDefault();
    const pt = getSVGPoint(e);
    if (!pt) return;
    const dx = pt.x - 50, dy = pt.y - 50;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxR = 46;
    let nx = pt.x, ny = pt.y;
    if (dist > maxR) { nx = 50 + (dx / dist) * maxR; ny = 50 + (dy / dist) * maxR; }
    const position = getNearestPosition(nx, ny);
    const updated = [...players];
    updated[draggedIdx] = { ...updated[draggedIdx], x: nx, y: ny, position };
    setActivePlayers(updated);
  };

  const handlePointerUp = () => {
    if (draggedIdx !== null) saveField(players);
    setDraggedIdx(null);
  };

  // Reset only the active scenario. Other scenarios are untouched.
  const resetPositions = () => {
    if (squad.length < 11) return;
    const base = buildFieldFromSquad(squad, squadRoles);
    const preset = FIELD_PRESETS.find((p) => p.id === activeScenario);
    const initial = preset ? applyPresetToPlayers(base, preset, leftHanded) : base;
    setActivePlayers(initial);
    saveField(initial);
  };

  // Swap a player into the WK or Bowler role (active scenario only).
  const swapRole = (playerIdx: number, targetRole: 'wk' | 'bowler') => {
    const currentHolder = players.findIndex(p => p.role === targetRole);
    if (currentHolder === -1 || currentHolder === playerIdx) return;

    const updated = [...players];
    updated[currentHolder] = {
      ...updated[currentHolder],
      name: updated[playerIdx].name,
      role: 'fielder',
      x: updated[playerIdx].x,
      y: updated[playerIdx].y,
      position: updated[playerIdx].position,
    };
    const fixedPos = targetRole === 'wk' ? 'Wicketkeeper' : 'Bowler';
    const c = POSITION_COORDS[fixedPos];
    updated[playerIdx] = {
      ...updated[playerIdx],
      name: players[currentHolder].name,
      role: targetRole,
      x: c.x, y: c.y,
      position: fixedPos,
    };
    setActivePlayers(updated);
    saveField(updated);
  };

  // Load a field preset into the ACTIVE scenario only. Other scenarios
  // are untouched, so the captain can keep their PP / Pacer / Spin
  // configurations independently.
  const applyPreset = (preset: FieldPreset) => {
    if (players.length === 0) return;
    const newPlayers = applyPresetToPlayers(players, preset, leftHanded);
    setActivePlayers(newPlayers);
    saveField(newPlayers);
  };

  // Mirror flips ALL four scenarios at once — leftHanded is a per-match
  // attribute (which batter we're facing), not per-scenario.
  const mirrorField = () => {
    const newLeftHanded = !leftHanded;
    const mirrorOne = (arr: FieldPlayer[]) =>
      arr.map((p) => ({
        ...p,
        x: 100 - p.x,
        position: p.role === 'wk' || p.role === 'bowler'
          ? p.position
          : getNearestPosition(100 - p.x, p.y),
      }));
    const mirrored: ScenarioMap = {
      'powerplay':  mirrorOne(scenarios['powerplay']),
      'after-pp':   mirrorOne(scenarios['after-pp']),
      'pacer':      mirrorOne(scenarios['pacer']),
      'spin':       mirrorOne(scenarios['spin']),
    };
    setScenarios(mirrored);
    setLeftHanded(newLeftHanded);
    if (matchId) {
      setSaving(true);
      setDoc(doc(db, 'field-positions', matchId), {
        scenarios: mirrored,
        leftHanded: newLeftHanded,
        updatedBy: session?.user?.email,
        updatedAt: new Date().toISOString(),
      }).then(() => setTimeout(() => setSaving(false), 500))
        .catch((err) => { console.error('Mirror save failed:', err); setSaving(false); });
    }
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

  // Gate the field display until the captain has designated the two roles
  // that drive field placement: Wicketkeeper and Bowling Substitute.
  // Batting Substitute is an off-field roster designation and doesn't
  // affect field placement, so it's optional. Once squad is loaded,
  // check for missing field-relevant roles.
  if (loaded && squad.length > 0) {
    const hasWk = squad.some((p) => squadRoles[p] === 'wk');
    const hasBowlSub = squad.some((p) => squadRoles[p] === 'bowl-sub');
    const missing: { label: string; description: string }[] = [];
    if (!hasWk) missing.push({ label: 'Wicketkeeper', description: 'click WK on a player to mark them as keeper' });
    if (!hasBowlSub) missing.push({ label: 'Bowling Substitute', description: 'click W on a player to mark them as bowl sub' });

    if (missing.length > 0) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
          <Navbar />
          <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <Link
                href={`/c3h/availability${matchId ? `?match=${matchId}` : ''}`}
                className="text-gray-500 text-sm hover:text-primary-400 mb-6 inline-flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to The Dugout
              </Link>

              <div className="glass rounded-2xl p-6 md:p-8 border-2 border-accent-500/40 bg-gradient-to-r from-accent-500/5 to-transparent">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl flex-shrink-0">⚠️</span>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Squad roles not yet complete</h2>
                    <p className="text-sm text-gray-300">
                      Before viewing field positions for this match, please designate all three role
                      assignments in the squad. The field auto-placement depends on these.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {missing.map((m) => (
                    <div key={m.label} className="glass rounded-xl p-4 border border-red-500/20 bg-red-500/5">
                      <p className="text-sm font-bold text-red-400 mb-1">❌ Missing: {m.label}</p>
                      <p className="text-xs text-gray-400">In the Playing 12 panel, {m.description}.</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl p-4 bg-primary-500/10 border border-primary-500/20 mb-6">
                  <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">Why this matters</p>
                  <ul className="text-sm text-gray-300 space-y-1.5">
                    <li>• <strong className="text-white">Wicketkeeper</strong> defines who stands behind the stumps on the field map</li>
                    <li>• <strong className="text-white">Bowling Substitute</strong> appears on the field as the dedicated Bowler position</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Batting Substitute is optional — it doesn&apos;t affect field placement.
                  </p>
                </div>

                <Link
                  href={`/c3h/availability${matchId ? `?match=${matchId}` : ''}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-105"
                >
                  Open The Dugout to Set Roles
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        </div>
      );
    }
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

              {/* Scenario tabs — 4 separate field configs saved per match */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Field Scenario</p>
                  <button
                    onClick={() => setViewMode(viewMode === 'edit' ? 'compare' : 'edit')}
                    className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                      viewMode === 'compare'
                        ? 'bg-accent-500/20 text-accent-400 border-accent-500/40'
                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {viewMode === 'compare' ? '✕ Close Compare' : '⊞ Compare All'}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {SCENARIO_IDS.map((id) => {
                    const meta = SCENARIO_META[id];
                    const isActive = id === activeScenario && viewMode === 'edit';
                    return (
                      <button
                        key={id}
                        onClick={() => { setActiveScenario(id); setViewMode('edit'); }}
                        title={meta.description}
                        className={`px-1 py-1.5 rounded-lg border text-center transition-all ${
                          isActive
                            ? 'bg-primary-500/20 border-primary-500/50 shadow-lg shadow-primary-500/10'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-base leading-none">{meta.emoji}</div>
                        <div className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-primary-400' : 'text-gray-300'}`}>
                          {meta.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {viewMode === 'edit' && (<>
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

              {/* Field Presets — one-click load common setups */}
              <div className="glass rounded-xl p-2.5 mb-2 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">Quick Setups</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {FIELD_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      title={preset.description}
                      className="text-left px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-primary-500/40 hover:bg-primary-500/10 transition-all"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{preset.emoji}</span>
                        <span className="text-[11px] font-bold text-white">{preset.name}</span>
                      </div>
                      <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Outside-ring counter — phase derived from active scenario */}
              {(() => {
                const fielders = players.filter((p) => p.role === 'fielder');
                const outsideCount = fielders.filter((p) => isOutsideInnerRing(p.x, p.y)).length;
                const phase = SCENARIO_META[activeScenario].phase;
                const limit = PHASE_LIMITS[phase].max;
                const overLimit = outsideCount > limit;
                return (
                  <div className={`glass rounded-xl px-3 py-2 mb-2 border flex items-center justify-between gap-2 ${overLimit ? 'border-red-500/40 bg-red-500/5' : 'border-white/5'}`}>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-gray-400">Outside ring:</span>
                      <span className={`font-bold text-base ${overLimit ? 'text-red-400' : 'text-primary-400'}`}>
                        {outsideCount}
                      </span>
                      <span className="text-gray-500">/ max {limit}</span>
                      {overLimit && (
                        <span className="text-red-400 text-[10px] font-bold">⚠ Over limit</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {phase === 'powerplay' ? 'Powerplay rule' : 'After-PP rule'}
                    </span>
                  </div>
                );
              })()}
              </>)}
            </>
          )}

          {/* COMPARE MODE — 4 mini fields in a 2x2 grid */}
          {viewMode === 'compare' && !screenshotMode && (
            <div className="grid grid-cols-2 gap-2">
              {SCENARIO_IDS.map((id) => {
                const meta = SCENARIO_META[id];
                const sPlayers = scenarios[id] || [];
                const sFielders = sPlayers.filter((p) => p.role === 'fielder');
                const sOutside = sFielders.filter((p) => isOutsideInnerRing(p.x, p.y)).length;
                const sLimit = PHASE_LIMITS[meta.phase].max;
                const sOver = sOutside > sLimit;
                return (
                  <button
                    key={id}
                    onClick={() => { setActiveScenario(id); setViewMode('edit'); }}
                    className="group relative text-left glass rounded-xl p-2 border border-white/10 hover:border-primary-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{meta.emoji}</span>
                        <span className="text-[11px] font-bold text-white">{meta.name}</span>
                      </div>
                      <span className={`text-[9px] font-bold ${sOver ? 'text-red-400' : 'text-primary-400'}`}>
                        {sOutside}/{sLimit}
                      </span>
                    </div>
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full"
                      style={{ background: 'radial-gradient(circle at 50% 50%, #1a5c30 0%, #0d3318 60%, #071a0d 100%)', borderRadius: '50%', border: '2px solid #2d6b3f' }}
                    >
                      <circle cx="50" cy="50" r="47" fill="none" stroke="#3d8b4f" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="28" fill="none" stroke="white" strokeWidth="0.3" strokeDasharray="2,1.5" opacity="0.25" />
                      <rect x="48" y="38" width="4" height="24" rx="0.5" fill="#c4a265" opacity="0.6" />
                      <text x={leftHanded ? 96 : 4} y="50.7" textAnchor={leftHanded ? 'end' : 'start'} fill="white" opacity="0.35" fontSize="3" fontWeight="bold">OFF</text>
                      <text x={leftHanded ? 4 : 96} y="50.7" textAnchor={leftHanded ? 'start' : 'end'} fill="white" opacity="0.35" fontSize="3" fontWeight="bold">LEG</text>
                      {sPlayers.map((p, i) => {
                        const isWk = p.role === 'wk';
                        const isBowler = p.role === 'bowler';
                        const fill = isWk ? '#3b82f6' : isBowler ? '#ef4444' : '#10b981';
                        return (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r="1.6" fill={fill} stroke="white" strokeWidth="0.3" opacity="0.95" />
                          </g>
                        );
                      })}
                    </svg>
                    <p className="text-[9px] text-gray-500 mt-1.5 text-center group-hover:text-primary-400 transition-colors">
                      Tap to edit →
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* EDIT MODE — single field SVG */}
          {(viewMode === 'edit' || screenshotMode) && (
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

              {/* Off / Leg side labels — flip with LHB mirror */}
              <text
                x={leftHanded ? 96 : 4}
                y="50.7"
                textAnchor={leftHanded ? 'end' : 'start'}
                fill="white"
                opacity="0.35"
                fontSize="2.4"
                fontWeight="bold"
                letterSpacing="0.3"
              >
                OFF
              </text>
              <text
                x={leftHanded ? 4 : 96}
                y="50.7"
                textAnchor={leftHanded ? 'start' : 'end'}
                fill="white"
                opacity="0.35"
                fontSize="2.4"
                fontWeight="bold"
                letterSpacing="0.3"
              >
                LEG
              </text>

              {/* Fielders */}
              {players.map((p, i) => {
                const isWk = p.role === 'wk';
                const isBowler = p.role === 'bowler';
                const fill = isWk ? '#3b82f6' : isBowler ? '#ef4444' : '#10b981';
                const stroke = isWk ? '#93c5fd' : isBowler ? '#fca5a5' : '#6ee7b7';
                const r = draggedIdx === i ? 1.8 : 1.1;
                return (
                  <g key={i}
                    onPointerDown={() => !screenshotMode && handlePointerDown(i)}
                    className={screenshotMode ? '' : (isWk || isBowler) ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
                    style={{ transition: draggedIdx === i ? 'none' : 'all 0.15s' }}
                  >
                    <circle cx={p.x} cy={p.y} r="5" fill="transparent" />
                    <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke={stroke} strokeWidth="0.5" />
                    {showNames && (
                      <>
                        <rect x={p.x - 7} y={p.y - 5} width="14" height="3" rx="1" fill="rgba(0,0,0,0.85)" />
                        <text x={p.x} y={p.y - 2.7} textAnchor="middle" fill={isWk ? '#93c5fd' : isBowler ? '#fca5a5' : 'white'} fontSize="2" fontWeight="bold">
                          {shortN(p.name)}{isWk ? ' (wk)' : isBowler ? ' (bowl)' : ''}
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
          )}

          {/* Player List — edit mode only */}
          {!screenshotMode && viewMode === 'edit' && (
            <div className="glass rounded-xl p-3 mt-3">
              <h3 className="text-white font-bold text-xs mb-2">Players & Positions</h3>
              <div className="grid grid-cols-1 gap-1">
                {players.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded glass-hover text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${p.role === 'wk' ? 'bg-blue-500' : p.role === 'bowler' ? 'bg-red-500' : 'bg-primary-500'}`}></span>
                      <span className="text-white font-medium">{shortN(p.name)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.role === 'fielder' && (
                        <>
                          <select value={p.position} onChange={e => {
                            const pos = e.target.value;
                            const coords = POSITION_COORDS[pos];
                            if (!coords) return;
                            const updated = [...players];
                            updated[i] = { ...updated[i], position: pos, x: coords.x, y: coords.y };
                            setActivePlayers(updated);
                            saveField(updated);
                          }} className="bg-white/5 text-gray-400 text-[10px] border border-white/10 rounded px-1 py-0.5 outline-none w-28">
                            {POSITION_NAMES.map(pos => <option key={pos} value={pos} className="bg-gray-900 text-white">{pos}</option>)}
                          </select>
                          <button onClick={() => swapRole(i, 'wk')} className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded text-[9px] hover:bg-blue-500/20">WK</button>
                          <button onClick={() => swapRole(i, 'bowler')} className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded text-[9px] hover:bg-red-500/20">Bowl</button>
                        </>
                      )}
                      {p.role === 'wk' && (
                        <span className="text-blue-400 text-[10px] font-bold">Wicketkeeper</span>
                      )}
                      {p.role === 'bowler' && (
                        <span className="text-red-400 text-[10px] font-bold">Bowler</span>
                      )}
                    </div>
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
