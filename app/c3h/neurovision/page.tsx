'use client';

// NeuroVision Lab — director-only internal training tool.
//
// Four modules, all client-side:
//   1. Ball Pickup Trainer — animated release→bounce→head tracking, with a
//      "predict where it arrives" mode (early-pickup / prediction) and a
//      pure smooth-pursuit tracking mode.
//   2. Quick Field Scanner — drag the fielders, auto-detect the gaps, and read
//      back the shot to exploit each gap + how to bowl to protect it. Plus a
//      flash-scan mode that trains the between-balls peripheral scan.
//   3. Breathing Pacer — animated 4-6-2 (coherence) and 5-15 (prime) pacers,
//      plus a BOLT / breath-hold timer. From the "Breathing for Athletes" work.
//   4. Progress — per-player history of every logged score, saved to Firestore.
//
// Access is intentionally narrow for launch: isC3HDirector only. Opening it up
// to all players later is a one-line change to the guard below.

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { isC3HDirector } from '@/lib/c3h-access';
import { db, firebaseAuthReady } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  scanField,
  PRESET_FIELDS,
  type Fielder,
  type Handedness,
  type BowlerType,
} from '@/app/c3h/lib/fieldScanner';
import {
  createStaircase,
  nextStaircase,
  thresholdEstimate,
  staircaseComplete,
  type StaircaseState,
} from '@/app/c3h/lib/perceptualStaircase';
import {
  GROUNDS,
  SITUATIONS,
  LINES,
  LENGTHS,
  buildRehearsalScript,
  scoreRead,
  IMAGERY_SESSIONS,
  type Ground,
  type Situation,
  type Line,
  type Length,
  type Delivery,
  type RehearsalStep,
  type ImagerySession,
} from '@/app/c3h/lib/visualization';
import {
  MOT_DIFFICULTY,
  scoreMot,
  type MotDifficulty,
  type MotConfig,
} from '@/app/c3h/lib/mot';
import {
  JUGGLING_LEVELS,
  JUGGLING_TOTAL,
  canClearLevel,
  nextJugglingTarget,
} from '@/app/c3h/lib/juggling';
import {
  FOLLOW_ALONG_SESSIONS,
  type FollowAlongSession,
} from '@/app/c3h/lib/followAlong';
import {
  PRINCIPLES,
  BREATH_PATTERNS,
  buildCenteringRoutine,
  RESET_ROUTINE,
  regulateFor,
  type RoutineStep,
  type ArousalLevel,
} from '@/app/c3h/lib/mindset';
import {
  POWER_PRINCIPLES,
  POWER_PROTOCOLS,
  totalReps,
  type PowerProtocol,
} from '@/app/c3h/lib/powerHitting';

// ── Progress entries (Firestore) ─────────────────────────────────────────
type MetricType = 'ball-predict' | 'ball-track' | 'bolt' | 'breath-hold' | 'contrast' | 'read' | 'mot' | 'vividness' | 'control' | 'juggle' | 'power';

interface ProgressEntry {
  type: MetricType;
  value: number; // predict/track/read = 0-100; bolt/breath-hold = seconds; contrast = threshold %
  at: string; // ISO timestamp
}

const METRIC_META: Record<MetricType, { label: string; unit: string; color: string; higherBetter: boolean }> = {
  'ball-predict': { label: 'Ball prediction', unit: 'pts', color: '#22d3ee', higherBetter: true },
  'ball-track': { label: 'Smooth-pursuit tracking', unit: '%', color: '#a78bfa', higherBetter: true },
  'bolt': { label: 'BOLT (CO₂ tolerance)', unit: 's', color: '#34d399', higherBetter: true },
  'breath-hold': { label: 'Max breath-hold', unit: 's', color: '#fbbf24', higherBetter: true },
  // Detection threshold — LOWER is better (sees fainter targets).
  'contrast': { label: 'Contrast threshold', unit: '%', color: '#f472b6', higherBetter: false },
  'read': { label: 'Bowler read (line/length/timing)', unit: 'pts', color: '#f59e0b', higherBetter: true },
  'mot': { label: 'Object tracking (MOT)', unit: '%', color: '#38bdf8', higherBetter: true },
  'vividness': { label: 'Imagery vividness', unit: '/5', color: '#c084fc', higherBetter: true },
  'control': { label: 'Imagery control', unit: '/5', color: '#e879f9', higherBetter: true },
  'juggle': { label: 'Neuro-juggling reps', unit: 'reps', color: '#4ade80', higherBetter: true },
  'power': { label: 'Power-hitting reps', unit: 'reps', color: '#fb923c', higherBetter: true },
};

const safeKey = (email: string) => email.replace(/[^a-z0-9]/gi, '_').toLowerCase();

// ════════════════════════════════════════════════════════════════════════
//  MODULE 1 — Ball Pickup Trainer
// ════════════════════════════════════════════════════════════════════════

const CANVAS_W = 340;
const CANVAS_H = 460;

interface BallTrainerProps {
  onLog: (type: MetricType, value: number) => void;
}

function BallPickupTrainer({ onLog }: BallTrainerProps) {
  const [mode, setMode] = useState<'predict' | 'track'>('predict');
  const [difficulty, setDifficulty] = useState(0.5); // hide fraction: lower = harder
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Predict-mode result surfaced for the log button.
  const [predictScore, setPredictScore] = useState<number | null>(null);
  const [trackScore, setTrackScore] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  // Mutable animation state kept in a ref so the rAF loop never causes
  // re-renders mid-flight.
  const anim = useRef<{
    raf: number;
    start: number;
    duration: number;
    releaseX: number;
    bounceX: number;
    arrivalX: number;
    hideFrac: number;
    clickX: number | null;
    done: boolean;
    pointer: { x: number; y: number };
    trackHits: number;
    trackFrames: number;
  }>({
    raf: 0, start: 0, duration: 1200, releaseX: CANVAS_W / 2, bounceX: CANVAS_W / 2,
    arrivalX: CANVAS_W / 2, hideFrac: 0.5, clickX: null, done: false,
    pointer: { x: CANVAS_W / 2, y: CANVAS_H / 2 }, trackHits: 0, trackFrames: 0,
  });

  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  // Lerp helper for the two-segment ball path.
  const ballPos = (t: number) => {
    const a = anim.current;
    const r = { x: a.releaseX, y: 24 };
    const b = { x: a.bounceX, y: CANVAS_H * 0.6 };
    const arr = { x: a.arrivalX, y: CANVAS_H - 46 };
    if (t <= 0.62) {
      const k = t / 0.62;
      return { x: r.x + (b.x - r.x) * k, y: r.y + (b.y - r.y) * k };
    }
    const k = (t - 0.62) / 0.38;
    return { x: b.x + (arr.x - b.x) * k, y: b.y + (arr.y - b.y) * k };
  };

  const drawPitch = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    // Backdrop
    ctx.fillStyle = '#06131a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // Pitch strip
    ctx.fillStyle = 'rgba(180,150,90,0.10)';
    ctx.fillRect(CANVAS_W / 2 - 44, 16, 88, CANVAS_H - 30);
    // Crease / batting line (under the head)
    ctx.strokeStyle = 'rgba(34,211,238,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, CANVAS_H - 46);
    ctx.lineTo(CANVAS_W - 20, CANVAS_H - 46);
    ctx.stroke();
    ctx.fillStyle = 'rgba(34,211,238,0.7)';
    ctx.font = '10px sans-serif';
    ctx.fillText('arrival line (under your head)', 24, CANVAS_H - 52);
    // Release marker
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(anim.current.releaseX, 24, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('release', anim.current.releaseX + 8, 26);
  };

  const drawBall = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#e11d48';
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  // ── Predict mode ───────────────────────────────────────────────────────
  const startPredict = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const a = anim.current;
    a.duration = rand(950, 1500);
    a.releaseX = rand(CANVAS_W * 0.4, CANVAS_W * 0.6);
    a.arrivalX = rand(CANVAS_W * 0.22, CANVAS_W * 0.78);
    a.bounceX = a.releaseX + (a.arrivalX - a.releaseX) * 0.7 + rand(-18, 18);
    a.hideFrac = difficulty;
    a.clickX = null;
    a.done = false;
    a.start = performance.now();
    setPredictScore(null);
    setRunning(true);

    const loop = (now: number) => {
      const t = Math.min(1, (now - a.start) / a.duration);
      drawPitch(ctx);
      if (t < a.hideFrac) {
        const p = ballPos(t);
        drawBall(ctx, p.x, p.y);
      } else if (!a.done) {
        // Ball hidden — cue the batsman to commit.
        ctx.fillStyle = 'rgba(251,191,36,0.9)';
        ctx.font = '13px sans-serif';
        ctx.fillText('tap where it arrives ↓', CANVAS_W / 2 - 66, CANVAS_H / 2);
      }
      if (t >= 1) a.done = true;
      // Once the flight is done AND the user has committed, score + reveal.
      if (a.done && a.clickX !== null && a.duration > 0) {
        finishPredict(ctx);
        return;
      }
      a.raf = requestAnimationFrame(loop);
    };
    a.raf = requestAnimationFrame(loop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const finishPredict = (ctx: CanvasRenderingContext2D) => {
    const a = anim.current;
    cancelAnimationFrame(a.raf);
    const errPx = Math.abs((a.clickX ?? a.arrivalX) - a.arrivalX);
    const score = Math.max(0, Math.min(100, Math.round(100 - (errPx / (CANVAS_W * 0.45)) * 100)));
    drawPitch(ctx);
    // Actual arrival
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(a.arrivalX, CANVAS_H - 46, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22d3ee';
    ctx.font = '10px sans-serif';
    ctx.fillText('actual', a.arrivalX - 12, CANVAS_H - 24);
    // Your call
    if (a.clickX !== null) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(a.clickX, CANVAS_H - 46, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('you', a.clickX - 8, CANVAS_H - 60);
    }
    setPredictScore(score);
    setRunning(false);
  };

  // ── Track mode ─────────────────────────────────────────────────────────
  const startTrack = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const a = anim.current;
    a.duration = 16000;
    a.start = performance.now();
    a.trackHits = 0;
    a.trackFrames = 0;
    setTrackScore(null);
    setRunning(true);

    const loop = (now: number) => {
      const t = (now - a.start) / a.duration;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#06131a';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      // Smooth wandering path (Lissajous-ish).
      const bx = CANVAS_W / 2 + Math.sin(t * Math.PI * 6) * (CANVAS_W * 0.36);
      const by = CANVAS_H / 2 + Math.sin(t * Math.PI * 8.5 + 1) * (CANVAS_H * 0.34);
      const d = Math.hypot(a.pointer.x - bx, a.pointer.y - by);
      const onTarget = d < 28;
      a.trackFrames++;
      if (onTarget) a.trackHits++;
      // Target ring
      ctx.strokeStyle = onTarget ? 'rgba(52,211,153,0.9)' : 'rgba(167,139,250,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx, by, 26, 0, Math.PI * 2);
      ctx.stroke();
      drawBall(ctx, bx, by);
      // Live score
      const pct = a.trackFrames ? Math.round((a.trackHits / a.trackFrames) * 100) : 0;
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = '12px sans-serif';
      ctx.fillText(`on target: ${pct}%`, 12, 20);
      if (t >= 1) {
        cancelAnimationFrame(a.raf);
        setTrackScore(pct);
        setRunning(false);
        return;
      }
      a.raf = requestAnimationFrame(loop);
    };
    a.raf = requestAnimationFrame(loop);
  }, []);

  // Pointer handling on the canvas.
  const canvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== 'predict' || !running) return;
    const p = canvasPoint(e);
    if (anim.current.clickX === null) anim.current.clickX = p.x;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== 'track') return;
    anim.current.pointer = canvasPoint(e);
  };

  // Draw an idle frame on mount / mode change.
  useEffect(() => {
    const a = anim.current; // stable object ref — safe to read in cleanup
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    if (mode === 'predict') drawPitch(ctx);
    else {
      ctx.fillStyle = '#06131a';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px sans-serif';
      ctx.fillText('Hold your cursor / finger on the ball as it moves.', 16, CANVAS_H / 2);
    }
    return () => cancelAnimationFrame(a.raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-transparent">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><span className="text-2xl">🎯</span> Ball Pickup Trainer</h3>
        <p className="text-sm text-gray-300">Trains the one skill that decides everything at the crease: picking the ball up early and tracking it from the bowler&apos;s release all the way under your head. <strong className="text-cyan-300">Predict</strong> hides the ball mid-flight so you commit early; <strong className="text-purple-300">Track</strong> builds smooth pursuit.</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {(['predict', 'track'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { if (!running) setMode(m); }}
            disabled={running}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all disabled:opacity-40 ${
              mode === m ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
            }`}
          >
            {m === 'predict' ? 'Predict mode' : 'Track mode'}
          </button>
        ))}
        {mode === 'predict' && (
          <label className="text-xs text-gray-400 flex items-center gap-2 ml-auto">
            Difficulty
            <input
              type="range" min={0.34} max={0.62} step={0.04}
              value={difficulty}
              disabled={running}
              onChange={(e) => setDifficulty(parseFloat(e.target.value))}
            />
            <span className="text-cyan-300">{difficulty <= 0.4 ? 'hard' : difficulty >= 0.56 ? 'easy' : 'medium'}</span>
          </label>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="w-full max-w-[340px] mx-auto block rounded-xl border border-white/10 touch-none cursor-crosshair"
        style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
      />

      <div className="flex flex-wrap gap-2 justify-center items-center">
        {mode === 'predict' ? (
          <button
            onClick={startPredict}
            disabled={running}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-medium text-sm shadow-lg disabled:opacity-40"
          >
            {running ? 'Watch…' : 'Bowl'}
          </button>
        ) : (
          <button
            onClick={startTrack}
            disabled={running}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium text-sm shadow-lg disabled:opacity-40"
          >
            {running ? 'Tracking…' : 'Start tracking (16s)'}
          </button>
        )}

        {predictScore !== null && mode === 'predict' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-white">Prediction: <strong className="text-cyan-300">{predictScore}</strong>/100</span>
            <button onClick={() => { onLog('ball-predict', predictScore); setPredictScore(null); }} className="px-3 py-1.5 rounded-lg bg-white/10 text-cyan-300 text-xs border border-cyan-500/40 hover:bg-white/15">Log score</button>
          </div>
        )}
        {trackScore !== null && mode === 'track' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-white">On target: <strong className="text-purple-300">{trackScore}%</strong></span>
            <button onClick={() => { onLog('ball-track', trackScore); setTrackScore(null); }} className="px-3 py-1.5 rounded-lg bg-white/10 text-purple-300 text-xs border border-purple-500/40 hover:bg-white/15">Log score</button>
          </div>
        )}
      </div>
      <p className="text-[11px] text-gray-500 text-center italic">Weekday reps build the visual machinery; on match day just trust it and watch the ball. Stop if you get eye strain, blur or dizziness.</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  MODULE 2 — Quick Field Scanner
// ════════════════════════════════════════════════════════════════════════

const FIELD_SIZE = 320;
const FIELD_CX = FIELD_SIZE / 2;
const FIELD_CY = FIELD_SIZE / 2;
const FIELD_R = FIELD_SIZE / 2 - 8;

const ringRadius = (ring: 'in' | 'out') => (ring === 'in' ? FIELD_R * 0.55 : FIELD_R * 0.9);

const angleToXY = (angle: number, radius: number) => ({
  x: FIELD_CX + radius * Math.sin((angle * Math.PI) / 180),
  y: FIELD_CY - radius * Math.cos((angle * Math.PI) / 180),
});

// Build an SVG arc wedge (pie slice from centre) for a gap.
const gapWedgePath = (centerAngle: number, widthDeg: number, radius: number) => {
  const half = Math.min(widthDeg, 359) / 2;
  const a0 = ((centerAngle - half) * Math.PI) / 180;
  const a1 = ((centerAngle + half) * Math.PI) / 180;
  const p0 = { x: FIELD_CX + radius * Math.sin(a0), y: FIELD_CY - radius * Math.cos(a0) };
  const p1 = { x: FIELD_CX + radius * Math.sin(a1), y: FIELD_CY - radius * Math.cos(a1) };
  const large = widthDeg > 180 ? 1 : 0;
  return `M ${FIELD_CX} ${FIELD_CY} L ${p0.x} ${p0.y} A ${radius} ${radius} 0 ${large} 1 ${p1.x} ${p1.y} Z`;
};

function FieldScanner() {
  const [hand, setHand] = useState<Handedness>('RH');
  const [bowler, setBowler] = useState<BowlerType>('pace');
  const [fielders, setFielders] = useState<Fielder[]>(PRESET_FIELDS['Standard T20']);
  const [dragId, setDragId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Flash-scan drill state.
  const [flashPhase, setFlashPhase] = useState<'off' | 'showing' | 'guess' | 'reveal'>('off');
  const [flashGuess, setFlashGuess] = useState<number | null>(null);
  const [flashScore, setFlashScore] = useState<number | null>(null);

  const result = useMemo(() => scanField(fielders, hand, bowler), [fielders, hand, bowler]);
  const topGaps = result.gaps.filter((g) => g.isScoringGap).slice(0, 3);

  const svgPoint = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * FIELD_SIZE;
    const y = ((clientY - rect.top) / rect.height) * FIELD_SIZE;
    return { x, y };
  };

  const pointToAngleRing = (x: number, y: number): { angle: number; ring: 'in' | 'out' } => {
    const dx = x - FIELD_CX;
    const dy = y - FIELD_CY;
    const angle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    const dist = Math.hypot(dx, dy);
    return { angle, ring: dist > FIELD_R * 0.72 ? 'out' : 'in' };
  };

  const onFielderDown = (id: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragId(id);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragId) return;
    const p = svgPoint(e.clientX, e.clientY);
    const { angle, ring } = pointToAngleRing(p.x, p.y);
    setFielders((prev) => prev.map((f) => (f.id === dragId ? { ...f, angle, ring } : f)));
  };

  const onUp = () => setDragId(null);

  // Flash scan: show field ~1.1s, hide, take a guess click, score by angular
  // error against the biggest scoring gap.
  const startFlash = () => {
    setFlashGuess(null);
    setFlashScore(null);
    setFlashPhase('showing');
    setTimeout(() => setFlashPhase('guess'), 1100);
  };

  const onFlashGuess = (e: React.PointerEvent) => {
    if (flashPhase !== 'guess' || !result.topGap) return;
    const p = svgPoint(e.clientX, e.clientY);
    const { angle } = pointToAngleRing(p.x, p.y);
    let err = Math.abs(angle - result.topGap.centerAngle);
    if (err > 180) err = 360 - err;
    const score = Math.max(0, Math.round(100 - (err / 90) * 100));
    setFlashGuess(angle);
    setFlashScore(score);
    setFlashPhase('reveal');
  };

  const fieldHidden = flashPhase === 'guess';

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-transparent">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><span className="text-2xl">🗺️</span> Quick Field Scanner</h3>
        <p className="text-sm text-gray-300">Drag the fielders to match a real set. The tool finds the biggest gaps, tells the batsman <strong className="text-emerald-300">which shot</strong> opens each one, and tells the bowler <strong className="text-emerald-300">how to bowl</strong> to shut it. Use <strong>Flash scan</strong> to train the split-second read a batsman makes between balls.</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center text-xs">
        <div className="flex gap-1">
          {(['RH', 'LH'] as const).map((h) => (
            <button key={h} onClick={() => setHand(h)} className={`px-2.5 py-1 rounded-md border ${hand === h ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{h === 'RH' ? 'Right-hand bat' : 'Left-hand bat'}</button>
          ))}
        </div>
        <select value={bowler} onChange={(e) => setBowler(e.target.value as BowlerType)} className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-gray-200">
          <option value="pace">Pace</option>
          <option value="off-spin">Off-spin</option>
          <option value="leg-spin">Leg-spin</option>
        </select>
        <select
          onChange={(e) => { if (e.target.value) setFielders(PRESET_FIELDS[e.target.value].map((f) => ({ ...f }))); }}
          value=""
          className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-gray-200"
        >
          <option value="">Load preset…</option>
          {Object.keys(PRESET_FIELDS).map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <button onClick={startFlash} className="px-2.5 py-1 rounded-md border bg-amber-500/15 text-amber-300 border-amber-500/40 ml-auto">⚡ Flash scan</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-start">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${FIELD_SIZE} ${FIELD_SIZE}`}
          className="w-full max-w-[320px] mx-auto touch-none select-none"
          onPointerMove={(e) => { onMove(e); }}
          onPointerUp={onUp}
        >
          {/* Boundary + 30-yard ring */}
          <circle cx={FIELD_CX} cy={FIELD_CY} r={FIELD_R} fill="#0a2a1a" stroke="rgba(52,211,153,0.4)" strokeWidth={2} />
          <circle cx={FIELD_CX} cy={FIELD_CY} r={FIELD_R * 0.6} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="4 4" />
          {/* Pitch */}
          <rect x={FIELD_CX - 9} y={FIELD_CY - 46} width={18} height={92} rx={3} fill="rgba(200,170,110,0.25)" />
          {/* Batsman marker */}
          <circle cx={FIELD_CX} cy={FIELD_CY + 34} r={4} fill="#fff" />

          {/* Gap wedges (hidden during the guess phase) */}
          {!fieldHidden && flashPhase !== 'showing' && topGaps.map((g, i) => (
            <path
              key={i}
              d={gapWedgePath(g.centerAngle, g.widthDeg, FIELD_R)}
              fill={i === 0 ? 'rgba(251,191,36,0.18)' : 'rgba(56,189,248,0.10)'}
              stroke={i === 0 ? 'rgba(251,191,36,0.5)' : 'transparent'}
              strokeWidth={1}
            />
          ))}
          {/* During flash 'showing' phase, we still draw fielders but not gaps */}

          {/* Fielders */}
          {!fieldHidden && fielders.map((f) => {
            const { x, y } = angleToXY(f.angle, ringRadius(f.ring));
            return (
              <g key={f.id} onPointerDown={onFielderDown(f.id)} style={{ cursor: 'grab' }}>
                <circle cx={x} cy={y} r={9} fill={f.ring === 'out' ? '#1e40af' : '#2563eb'} stroke="#fff" strokeWidth={1.5} />
                <text x={x} y={y + 3} textAnchor="middle" fontSize={8} fill="#fff" pointerEvents="none">{f.label.slice(0, 2)}</text>
              </g>
            );
          })}

          {/* Flash guess overlay */}
          {fieldHidden && (
            <g onPointerDown={onFlashGuess} style={{ cursor: 'crosshair' }}>
              <rect x={0} y={0} width={FIELD_SIZE} height={FIELD_SIZE} fill="transparent" />
              <text x={FIELD_CX} y={FIELD_CY - 60} textAnchor="middle" fontSize={11} fill="#fbbf24">tap the biggest gap</text>
            </g>
          )}
          {flashPhase === 'reveal' && flashGuess !== null && (
            <>
              {(() => { const p = angleToXY(flashGuess, FIELD_R * 0.8); return <circle cx={p.x} cy={p.y} r={6} fill="#fbbf24" />; })()}
              {result.topGap && (() => { const p = angleToXY(result.topGap.centerAngle, FIELD_R * 0.8); return <circle cx={p.x} cy={p.y} r={7} fill="none" stroke="#34d399" strokeWidth={2} />; })()}
            </>
          )}
        </svg>

        {/* Recommendations */}
        <div className="space-y-3">
          {flashPhase === 'reveal' && flashScore !== null && (
            <div className="rounded-xl p-3 border border-amber-500/40 bg-amber-500/10 text-sm">
              <p className="text-amber-300 font-bold">Flash scan: {flashScore}/100</p>
              <p className="text-gray-300 text-xs mt-1">Green ring = the actual biggest gap ({result.topGap?.region}). Yellow = your read. <button className="underline text-amber-300" onClick={() => setFlashPhase('off')}>Done</button></p>
            </div>
          )}

          {result.topGap ? (
            <div className="rounded-xl p-4 border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent">
              <p className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-1">Biggest gap</p>
              <p className="text-white font-bold">{result.topGap.region} <span className="text-xs text-gray-400 font-normal">({result.topGap.side} side · {Math.round(result.topGap.widthDeg)}° open)</span></p>
              <div className="mt-2 text-sm">
                <p className="text-cyan-300 font-medium">🏏 Batsman → {result.topGap.shot}</p>
                <p className="text-gray-300 text-xs mt-0.5">{result.topGap.shotDetail}</p>
              </div>
              <div className="mt-2 text-sm">
                <p className="text-emerald-300 font-medium">🎳 Bowler → protect it</p>
                <p className="text-gray-300 text-xs mt-0.5">{result.topGap.bowlingPlan}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-4 border border-white/10 text-sm text-gray-400">Field is packed — no exploitable scoring gap right now. Nudge a fielder to open one.</div>
          )}

          {topGaps.slice(1).map((g, i) => (
            <div key={i} className="rounded-lg p-3 border border-white/10 bg-white/3 text-xs">
              <p className="text-white font-medium">{g.region} <span className="text-gray-500">· {Math.round(g.widthDeg)}° · {g.side}</span></p>
              <p className="text-cyan-300 mt-0.5">→ {g.shot}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-gray-500 italic">Angles are read from the batsman: straight up = down the ground. Switch RH/LH to flip off &amp; leg.</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  MODULE 3 — Breathing Pacer + BOLT log
// ════════════════════════════════════════════════════════════════════════

interface BreathPhase { label: string; secs: number; scale: number; }
const PATTERNS: Record<string, { name: string; note: string; phases: BreathPhase[] }> = {
  coherence: {
    name: '4-6-2 · Coherence',
    note: 'In 4, out 6, hold 2. Brings heart + brain into coherence — use to settle nerves before batting.',
    phases: [
      { label: 'Inhale', secs: 4, scale: 1 },
      { label: 'Exhale', secs: 6, scale: 0.4 },
      { label: 'Hold', secs: 2, scale: 0.4 },
    ],
  },
  prime: {
    name: '5-15 · Prime',
    note: 'Hold 5, breathe normally 15. Primes the body to compete — use before a game or a spell.',
    phases: [
      { label: 'Hold', secs: 5, scale: 0.4 },
      { label: 'Breathe normally', secs: 15, scale: 1 },
    ],
  },
};

interface BreathingProps { onLog: (type: MetricType, value: number) => void; }

function BreathingPacer({ onLog }: BreathingProps) {
  const [patternKey, setPatternKey] = useState<keyof typeof PATTERNS>('coherence');
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [cycles, setCycles] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pattern = PATTERNS[patternKey];
  const phase = pattern.phases[phaseIdx];

  useEffect(() => {
    if (!running) return;
    timer.current = setTimeout(() => {
      setPhaseIdx((prev) => {
        const next = (prev + 1) % pattern.phases.length;
        if (next === 0) setCycles((c) => c + 1);
        return next;
      });
    }, phase.secs * 1000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [running, phaseIdx, phase.secs, pattern.phases.length]);

  const start = () => { setPhaseIdx(0); setCycles(0); setRunning(true); };
  const stop = () => { setRunning(false); if (timer.current) clearTimeout(timer.current); };

  // ── BOLT / breath-hold timer ───────────────────────────────────────────
  const [holdKind, setHoldKind] = useState<MetricType>('bolt');
  const [holding, setHolding] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const holdStart = useRef(0);
  const holdRaf = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHold = () => {
    setElapsed(0);
    holdStart.current = performance.now();
    setHolding(true);
    holdRaf.current = setInterval(() => setElapsed((performance.now() - holdStart.current) / 1000), 100);
  };
  const stopHold = () => {
    setHolding(false);
    if (holdRaf.current) clearInterval(holdRaf.current);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-5 border-2 border-teal-500/40 bg-gradient-to-br from-teal-500/10 to-transparent">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><span className="text-2xl">🫁</span> Breathing Pacer</h3>
        <p className="text-sm text-gray-300">Nasal breathing is the default. Two techniques carry across every game: <strong className="text-teal-300">4-6-2</strong> to calm down, <strong className="text-teal-300">5-15</strong> to switch on. Follow the circle.</p>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {(Object.keys(PATTERNS) as (keyof typeof PATTERNS)[]).map((k) => (
          <button key={k} onClick={() => { stop(); setPatternKey(k); }} className={`px-3 py-1.5 rounded-lg text-sm border ${patternKey === k ? 'bg-teal-500/20 text-teal-300 border-teal-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{PATTERNS[k].name}</button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="relative h-56 w-56 flex items-center justify-center">
          <div
            className="rounded-full bg-gradient-to-br from-teal-400/40 to-cyan-500/30 border border-teal-300/40"
            style={{
              width: 180,
              height: 180,
              transform: `scale(${running ? phase.scale : 0.6})`,
              transition: running ? `transform ${phase.secs}s ease-in-out` : 'transform 0.4s',
            }}
          />
          <div className="absolute text-center">
            <p className="text-2xl font-bold text-white">{running ? phase.label : 'Ready'}</p>
            {running && <p className="text-teal-300 text-sm">{phase.secs}s</p>}
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center max-w-sm">{pattern.note}</p>
        <div className="flex gap-2 items-center">
          {!running ? (
            <button onClick={start} className="px-5 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 text-white text-sm font-medium">Start</button>
          ) : (
            <button onClick={stop} className="px-5 py-2 rounded-lg bg-white/10 text-white text-sm font-medium border border-white/20">Stop</button>
          )}
          <span className="text-xs text-gray-400">Cycles: <strong className="text-teal-300">{cycles}</strong></span>
        </div>
      </div>

      {/* BOLT / breath-hold logger */}
      <div className="rounded-2xl p-5 border border-white/10 bg-white/3">
        <h4 className="text-white font-bold mb-1">CO₂ tolerance timer</h4>
        <p className="text-xs text-gray-400 mb-3">After a relaxed exhale, pinch your nose and start. Stop at the <strong>first urge to breathe</strong> for BOLT (not a max effort). A well-trained athlete lands around 40s.</p>
        <div className="flex gap-2 flex-wrap items-center">
          <select value={holdKind} onChange={(e) => setHoldKind(e.target.value as MetricType)} disabled={holding} className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-gray-200 text-sm">
            <option value="bolt">BOLT (first urge)</option>
            <option value="breath-hold">Max breath-hold</option>
          </select>
          {!holding ? (
            <button onClick={startHold} className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm">Start</button>
          ) : (
            <button onClick={stopHold} className="px-4 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-sm">Stop</button>
          )}
          <span className="text-2xl font-bold text-white tabular-nums">{elapsed.toFixed(1)}s</span>
          {!holding && elapsed > 0 && (
            <button onClick={() => { onLog(holdKind, Math.round(elapsed)); setElapsed(0); }} className="px-3 py-1.5 rounded-lg bg-white/10 text-emerald-300 text-xs border border-emerald-500/40">Log {Math.round(elapsed)}s</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  MODULE 4 — Progress
// ════════════════════════════════════════════════════════════════════════

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <span className="text-gray-600 text-xs">—</span>;
  const w = 90, h = 24;
  const max = Math.max(...values), min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / span) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

function ProgressPanel({ entries }: { entries: ProgressEntry[] }) {
  const byType = useMemo(() => {
    const m: Record<MetricType, ProgressEntry[]> = { 'ball-predict': [], 'ball-track': [], 'bolt': [], 'breath-hold': [], 'contrast': [], 'read': [], 'mot': [], 'vividness': [], 'control': [], 'juggle': [], 'power': [] };
    for (const e of entries) m[e.type]?.push(e);
    return m;
  }, [entries]);

  const anyData = entries.length > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 to-transparent">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><span className="text-2xl">📈</span> Progress</h3>
        <p className="text-sm text-gray-300">Every score you log lands here so you can watch the weekday work pay off. Train Mon–Fri, play the weekend, rest your eyes.</p>
      </div>

      {!anyData && <p className="text-sm text-gray-500 text-center py-6">No sessions logged yet. Run a trainer, hit <strong>Log score</strong>, and it&apos;ll show up here.</p>}

      <div className="grid sm:grid-cols-2 gap-3">
        {(Object.keys(METRIC_META) as MetricType[]).map((t) => {
          const list = byType[t];
          const meta = METRIC_META[t];
          const values = list.map((e) => e.value);
          const latest = values[values.length - 1];
          const best = values.length ? (meta.higherBetter ? Math.max(...values) : Math.min(...values)) : null;
          return (
            <div key={t} className="rounded-xl p-4 border border-white/10 bg-white/3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">{meta.label}</p>
                <Sparkline values={values.slice(-12)} color={meta.color} />
              </div>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="text-gray-400">Latest <strong className="text-white">{latest != null ? `${latest}${meta.unit}` : '—'}</strong></span>
                <span className="text-gray-400">Best <strong style={{ color: meta.color }}>{best != null ? `${best}${meta.unit}` : '—'}</strong></span>
                <span className="text-gray-400">Sessions <strong className="text-white">{list.length}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  MODULE 5 — Perceptual Learning (contrast sensitivity)
// ════════════════════════════════════════════════════════════════════════
//
// Faithful to the UC Riverside baseball study (Deveau/Ozer/Seitz, Current
// Biology 2014): repeatedly detect a faint oriented grating (a Gabor patch)
// near your threshold, and the brain learns to squeeze more signal out of the
// eyes — which transferred to real batting vision. Task here is a 2-AFC
// orientation judgement ("tilted left or right?") with contrast driven by the
// adaptive staircase. Lower threshold over weeks = sharper low-contrast vision.

const GABOR_SIZE = 180;

// Render a Gabor patch (sine grating × Gaussian window) into the canvas.
function drawGabor(ctx: CanvasRenderingContext2D, contrast: number, tiltDeg: number) {
  const S = GABOR_SIZE;
  const img = ctx.createImageData(S, S);
  const c = S / 2;
  const sigma = S / 6;
  const cycles = 6; // spatial frequency across the patch
  const k = (2 * Math.PI * cycles) / S;
  const th = (tiltDeg * Math.PI) / 180;
  const cosT = Math.cos(th), sinT = Math.sin(th);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = x - c, dy = y - c;
      const xr = dx * cosT + dy * sinT;
      const gauss = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      const grating = Math.cos(k * xr);
      const lum = 0.5 + 0.5 * contrast * grating * gauss; // 0..1, gray field = 0.5
      const v = Math.round(lum * 255);
      const idx = (y * S + x) * 4;
      img.data[idx] = v; img.data[idx + 1] = v; img.data[idx + 2] = v; img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function fillGray(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgb(128,128,128)';
  ctx.fillRect(0, 0, GABOR_SIZE, GABOR_SIZE);
}

interface PerceptualProps { onLog: (type: MetricType, value: number) => void; }

function PerceptualTrainer({ onLog }: PerceptualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'idle' | 'fixation' | 'stimulus' | 'response' | 'done'>('idle');
  const stair = useRef<StaircaseState>(createStaircase(0.4));
  const tilt = useRef<'left' | 'right'>('left');
  const [trialNo, setTrialNo] = useState(0);
  const [threshold, setThreshold] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const after = (ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)); };

  useEffect(() => () => clearTimers(), []);

  const paintGray = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) fillGray(ctx);
  }, []);

  useEffect(() => { paintGray(); }, [paintGray]);

  const runTrial = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    setPhase('fixation');
    fillGray(ctx);
    // fixation cross
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(GABOR_SIZE / 2 - 6, GABOR_SIZE / 2); ctx.lineTo(GABOR_SIZE / 2 + 6, GABOR_SIZE / 2);
    ctx.moveTo(GABOR_SIZE / 2, GABOR_SIZE / 2 - 6); ctx.lineTo(GABOR_SIZE / 2, GABOR_SIZE / 2 + 6);
    ctx.stroke();

    after(500, () => {
      tilt.current = Math.random() < 0.5 ? 'left' : 'right';
      const tiltDeg = tilt.current === 'left' ? -20 : 20;
      drawGabor(ctx, stair.current.contrast, tiltDeg);
      setPhase('stimulus');
      // Flash the patch, then mask with gray and take the answer.
      after(220, () => { fillGray(ctx); setPhase('response'); });
    });
  }, []);

  const start = () => {
    stair.current = createStaircase(0.4);
    setTrialNo(0);
    setThreshold(null);
    runTrial();
  };

  const answer = (dir: 'left' | 'right') => {
    if (phase !== 'response') return;
    const correct = dir === tilt.current;
    stair.current = nextStaircase(stair.current, correct);
    setTrialNo((n) => n + 1);
    if (staircaseComplete(stair.current)) {
      setThreshold(Math.round(thresholdEstimate(stair.current) * 1000) / 10); // % to 1dp
      setPhase('done');
      paintGray();
    } else {
      runTrial();
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 border-2 border-pink-500/40 bg-gradient-to-br from-pink-500/10 to-transparent">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><span className="text-2xl">🌫️</span> Perceptual Learning</h3>
        <p className="text-sm text-gray-300">The method from the UC Riverside baseball study: repeatedly spot a faint striped patch and judge its tilt. Training the brain to read low-contrast signal transferred to real batting vision — fewer strikeouts, better acuity. Your <strong className="text-pink-300">contrast threshold</strong> should drop over weeks (lower = you see fainter).</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <canvas
          ref={canvasRef}
          width={GABOR_SIZE}
          height={GABOR_SIZE}
          className="rounded-full border border-white/10"
          style={{ width: GABOR_SIZE, height: GABOR_SIZE, background: 'rgb(128,128,128)' }}
        />

        {phase === 'idle' && (
          <button onClick={start} className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-pink-500 text-white text-sm font-medium">Start session</button>
        )}

        {(phase === 'fixation' || phase === 'stimulus') && (
          <p className="text-xs text-gray-400">Watch the patch…</p>
        )}

        {phase === 'response' && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-white">Which way was it tilted?</p>
            <div className="flex gap-3">
              <button onClick={() => answer('left')} className="px-5 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-lg hover:bg-white/15">◹ Left</button>
              <button onClick={() => answer('right')} className="px-5 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-lg hover:bg-white/15">◸ Right</button>
            </div>
            <p className="text-[11px] text-gray-500">Trial {trialNo + 1} · guess if unsure</p>
          </div>
        )}

        {phase === 'done' && threshold !== null && (
          <div className="text-center space-y-2">
            <p className="text-white">Threshold this session: <strong className="text-pink-300">{threshold}%</strong> contrast <span className="text-gray-500 text-xs">(lower is better)</span></p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { onLog('contrast', threshold); setPhase('idle'); }} className="px-3 py-1.5 rounded-lg bg-white/10 text-pink-300 text-xs border border-pink-500/40">Log threshold</button>
              <button onClick={start} className="px-3 py-1.5 rounded-lg bg-pink-500/20 text-pink-200 text-xs border border-pink-500/40">Again</button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg p-3 border border-white/10 bg-white/3 text-[11px] text-gray-400">
        A session is ~1–2 min (runs until the difficulty settles). The study protocol was <strong>25 min/day, 4 days/week</strong> — do a few sessions per sitting on weekdays. Reference: Deveau, Ozer &amp; Seitz, <em>Current Biology</em> 2014. This is a training aid inspired by that research, not a medical or diagnostic device — stop on eye strain, blur or headache.
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  MODULE 6 — Visualization & Bowler Read
// ════════════════════════════════════════════════════════════════════════
//
// Two-part mental-rehearsal + anticipation trainer:
//   Rehearsal — a guided script places you at a real ground for the fixture
//     you're about to play (See → Process → Act), breathing pacer underneath.
//   Bowler read — a bowler runs in and releases; call LINE + LENGTH before the
//     ball arrives. Scored on accuracy AND how early you committed, so you
//     learn to read it off the hand, not off the pitch.

// Follow-along visualization: long-form narrated performance rehearsal for a
// chosen discipline (batting / bowling / keeping). Steps auto-advance with a
// breathing circle; ends in a Vividness/Control self-rating. Fourth mode of
// the Visualization tab.
function FollowAlong({ onLog, onBack }: { onLog: (type: MetricType, value: number) => void; onBack: () => void }) {
  const [session, setSession] = useState<FollowAlongSession>(FOLLOW_ALONG_SESSIONS[0]);
  const [phase, setPhase] = useState<'intro' | 'run' | 'evaluate'>('intro');
  const [stepIdx, setStepIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [vividness, setVividness] = useState<number | null>(null);
  const [control, setControl] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!running) return;
    const step = session.steps[stepIdx];
    timer.current = setTimeout(() => {
      if (stepIdx < session.steps.length - 1) setStepIdx((i) => i + 1);
      else { setRunning(false); setPhase('evaluate'); }
    }, step.seconds * 1000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [running, stepIdx, session]);

  const start = () => { setStepIdx(0); setVividness(null); setControl(null); setRunning(true); setPhase('run'); };
  const step = session.steps[stepIdx];
  const totalSecs = session.steps.reduce((a, s) => a + s.seconds, 0);

  return (
    <div className="rounded-2xl p-5 border border-amber-500/30 bg-black/30 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-bold flex items-center gap-2">🎥 Follow-along visualization</h4>
        <button onClick={onBack} className="text-gray-500 text-xs hover:text-gray-300">← back</button>
      </div>

      {phase === 'intro' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-300">A guided performance rehearsal — settle the breath, build the scene through your own eyes, and rehearse execution <em>and</em> recovering from mistakes. ~{Math.round(totalSecs / 60)} min. Pick your discipline:</p>
          <div className="flex gap-2 flex-wrap">
            {FOLLOW_ALONG_SESSIONS.map((s) => (
              <button key={s.id} onClick={() => setSession(s)} className={`px-3 py-1.5 rounded-md text-sm border ${session.id === s.id ? 'bg-amber-500/20 text-amber-200 border-amber-500/50' : 'bg-white/5 text-gray-300 border-white/10'}`}>{s.emoji} {s.name}</button>
            ))}
          </div>
          <button onClick={start} className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm font-medium">Begin {session.name}</button>
        </div>
      )}

      {phase === 'run' && (
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-36 w-36 flex items-center justify-center">
            <div
              className="rounded-full bg-gradient-to-br from-amber-400/30 to-orange-500/20 border border-amber-300/40"
              style={{
                width: 120, height: 120,
                transform: `scale(${step.breathe && running ? 1 : 0.62})`,
                transition: `transform ${step.breathe ? step.seconds : 0.6}s ease-in-out`,
              }}
            />
            <span className="absolute text-3xl">{session.emoji}</span>
          </div>
          <p className="text-center text-gray-100 text-sm leading-relaxed max-w-md min-h-[96px]">{step.text}</p>
          <div className="w-full max-w-sm h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400/70" style={{ width: `${((stepIdx + 1) / session.steps.length) * 100}%` }} />
          </div>
          {running
            ? <button onClick={() => setRunning(false)} className="px-4 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm">Pause</button>
            : <button onClick={() => setRunning(true)} className="px-4 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm">Resume</button>}
        </div>
      )}

      {phase === 'evaluate' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-300">Rate this session — track it over time:</p>
          {([['Vividness', vividness, setVividness, 'How realistic was it?'], ['Control', control, setControl, 'How well did you hold it?']] as const).map(
            ([label, val, setter, hint]) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-1">{label} <span className="text-gray-600">— {hint}</span></p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setter(n)} className={`h-9 w-9 rounded-md text-sm border ${val === n ? 'bg-amber-500/30 text-amber-100 border-amber-500/60' : 'bg-white/5 text-gray-400 border-white/10'}`}>{n}</button>
                  ))}
                </div>
              </div>
            ),
          )}
          <div className="flex gap-2">
            <button
              onClick={() => { if (vividness) onLog('vividness', vividness); if (control) onLog('control', control); setPhase('intro'); }}
              disabled={!vividness || !control}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm font-medium disabled:opacity-40"
            >
              Log &amp; finish
            </button>
            <button onClick={start} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">Redo</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Guided imagery: scripted mental-representation practice (The Bat / The Ball)
// ending in Vividness + Control self-ratings. Rendered inside the
// Visualization tab as a third mode.
function GuidedImagery({ onLog, onBack }: { onLog: (type: MetricType, value: number) => void; onBack: () => void }) {
  const [session, setSession] = useState<ImagerySession>(IMAGERY_SESSIONS[0]);
  const [phase, setPhase] = useState<'intro' | 'run' | 'evaluate'>('intro');
  const [stepIdx, setStepIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [vividness, setVividness] = useState<number | null>(null);
  const [control, setControl] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!running) return;
    const step = session.steps[stepIdx];
    timer.current = setTimeout(() => {
      if (stepIdx < session.steps.length - 1) setStepIdx((i) => i + 1);
      else { setRunning(false); setPhase('evaluate'); }
    }, step.seconds * 1000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [running, stepIdx, session]);

  const start = () => { setStepIdx(0); setVividness(null); setControl(null); setRunning(true); setPhase('run'); };

  const step = session.steps[stepIdx];

  return (
    <div className="rounded-2xl p-5 border border-purple-500/30 bg-black/30 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-bold flex items-center gap-2">🧠 Guided imagery</h4>
        <button onClick={onBack} className="text-gray-500 text-xs hover:text-gray-300">← back</button>
      </div>

      {phase === 'intro' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-300">Build a vivid, controllable mental image of the gear you use every innings. ~5 minutes, quality over duration. Pick your object:</p>
          <div className="flex gap-2">
            {IMAGERY_SESSIONS.map((s) => (
              <button key={s.id} onClick={() => setSession(s)} className={`px-3 py-1.5 rounded-md text-sm border ${session.id === s.id ? 'bg-purple-500/20 text-purple-200 border-purple-500/50' : 'bg-white/5 text-gray-300 border-white/10'}`}>{s.name}</button>
            ))}
          </div>
          <button onClick={start} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white text-sm font-medium">Begin {session.name}</button>
        </div>
      )}

      {phase === 'run' && (
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-36 w-36 flex items-center justify-center">
            <div
              className="rounded-full bg-gradient-to-br from-purple-400/30 to-fuchsia-500/20 border border-purple-300/40"
              style={{
                width: 120, height: 120,
                transform: `scale(${step.breathe && running ? 1 : 0.6})`,
                transition: `transform ${step.breathe ? step.seconds : 0.5}s ease-in-out`,
              }}
            />
            <span className="absolute text-3xl">{session.id === 'bat' ? '🏏' : '🔴'}</span>
          </div>
          <p className="text-center text-gray-100 text-sm leading-relaxed max-w-md min-h-[72px]">{step.text}</p>
          <div className="flex gap-1.5">
            {session.steps.map((_, i) => <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === stepIdx ? 'bg-purple-400' : i < stepIdx ? 'bg-purple-400/40' : 'bg-white/15'}`} />)}
          </div>
          {running
            ? <button onClick={() => setRunning(false)} className="px-4 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm">Pause</button>
            : <button onClick={() => setRunning(true)} className="px-4 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-200 text-sm">Resume</button>}
        </div>
      )}

      {phase === 'evaluate' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-300">Rate this session (be honest — this is what you track over time):</p>
          {([['Vividness', vividness, setVividness, 'How realistic was the image?'], ['Control', control, setControl, 'How well could you hold it?']] as const).map(
            ([label, val, setter, hint]) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-1">{label} <span className="text-gray-600">— {hint}</span></p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setter(n)} className={`h-9 w-9 rounded-md text-sm border ${val === n ? 'bg-purple-500/30 text-purple-100 border-purple-500/60' : 'bg-white/5 text-gray-400 border-white/10'}`}>{n}</button>
                  ))}
                </div>
              </div>
            ),
          )}
          <div className="flex gap-2">
            <button
              onClick={() => { if (vividness) onLog('vividness', vividness); if (control) onLog('control', control); setPhase('intro'); }}
              disabled={!vividness || !control}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white text-sm font-medium disabled:opacity-40"
            >
              Log &amp; finish
            </button>
            <button onClick={start} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">Redo</button>
          </div>
        </div>
      )}
    </div>
  );
}

const BR_W = 320;
const BR_H = 440;
const BR_RELEASE_Y = 46;
const BR_BAT_Y = BR_H - 46;

const lineToX = (line: Line): number =>
  line === 'off' ? BR_W * 0.68 : line === 'leg' ? BR_W * 0.32 : BR_W * 0.5;
// Short pitches up higher/earlier toward the batter's eyeline; full stays low.
const lengthToBounceY = (len: Length): number =>
  len === 'short' ? BR_H * 0.5 : len === 'full' ? BR_H * 0.78 : BR_H * 0.64;

function VisualizationTrainer({ onLog }: { onLog: (type: MetricType, value: number) => void }) {
  const [stage, setStage] = useState<'setup' | 'rehearsal' | 'reps' | 'imagery' | 'follow'>('setup');
  const [ground, setGround] = useState<Ground>(GROUNDS[0]);
  const [situation, setSituation] = useState<Situation>(SITUATIONS[0]);
  const [bowler, setBowler] = useState<BowlerType>('pace');

  // ── Rehearsal ───────────────────────────────────────────────────────────
  const script: RehearsalStep[] = useMemo(
    () => buildRehearsalScript(ground, situation, bowler),
    [ground, situation, bowler],
  );
  const [stepIdx, setStepIdx] = useState(0);
  const [rehearsing, setRehearsing] = useState(false);
  const rehearseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!rehearsing) return;
    const step = script[stepIdx];
    rehearseTimer.current = setTimeout(() => {
      if (stepIdx < script.length - 1) setStepIdx((i) => i + 1);
      else setRehearsing(false);
    }, step.seconds * 1000);
    return () => { if (rehearseTimer.current) clearTimeout(rehearseTimer.current); };
  }, [rehearsing, stepIdx, script]);

  const startRehearsal = () => { setStepIdx(0); setRehearsing(true); setStage('rehearsal'); };

  // ── Bowler read ─────────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [repRunning, setRepRunning] = useState(false);
  const [guessLine, setGuessLine] = useState<Line | null>(null);
  const [guessLength, setGuessLength] = useState<Length | null>(null);
  // Refs mirror the guesses so finishRep reads the latest values even when
  // called from the rAF loop's (stale) closure on a late auto-reveal.
  const guessLineRef = useRef<Line | null>(null);
  const guessLengthRef = useRef<Length | null>(null);
  const pickLine = (l: Line) => { guessLineRef.current = l; setGuessLine(l); };
  const pickLength = (l: Length) => { guessLengthRef.current = l; setGuessLength(l); };
  const [repResult, setRepResult] = useState<ReturnType<typeof scoreRead> | null>(null);
  const rep = useRef<{
    raf: number; start: number; runupMs: number; flightMs: number;
    delivery: Delivery; committedAt: number | null; revealed: boolean;
  }>({ raf: 0, start: 0, runupMs: 900, flightMs: 850, delivery: { line: 'straight', length: 'good' }, committedAt: null, revealed: false });

  const drawScene = (ctx: CanvasRenderingContext2D, bowlerY: number, ball: { x: number; y: number } | null, revealDelivery?: Delivery) => {
    ctx.fillStyle = '#06131a';
    ctx.fillRect(0, 0, BR_W, BR_H);
    // pitch
    ctx.fillStyle = 'rgba(200,170,110,0.12)';
    ctx.fillRect(BR_W / 2 - 26, 20, 52, BR_H - 34);
    // bat line
    ctx.strokeStyle = 'rgba(245,158,11,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(24, BR_BAT_Y); ctx.lineTo(BR_W - 24, BR_BAT_Y); ctx.stroke();
    // bowler
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath(); ctx.arc(BR_W / 2, bowlerY, 6, 0, Math.PI * 2); ctx.fill();
    // ball
    if (ball) {
      ctx.fillStyle = '#e11d48';
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    if (revealDelivery) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px sans-serif';
      ctx.fillText(`actual: ${revealDelivery.length} / ${revealDelivery.line}`, 24, BR_BAT_Y - 10);
    }
  };

  const startRep = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const line = LINES[Math.floor(Math.random() * 3)];
    const length = LENGTHS[Math.floor(Math.random() * 3)];
    const r = rep.current;
    r.delivery = { line, length };
    r.runupMs = 700 + Math.random() * 500;
    r.flightMs = 750 + Math.random() * 350;
    r.committedAt = null;
    r.revealed = false;
    r.start = performance.now();
    guessLineRef.current = null; guessLengthRef.current = null;
    setGuessLine(null); setGuessLength(null); setRepResult(null);
    setRepRunning(true);

    const arrivalX = lineToX(line);
    const bounceY = lengthToBounceY(length);

    const loop = (now: number) => {
      const t = now - r.start;
      let bowlerY = 12;
      let ball: { x: number; y: number } | null = null;
      let flightFrac = -1;
      if (t < r.runupMs) {
        // run-up
        bowlerY = 12 + (BR_RELEASE_Y - 12) * (t / r.runupMs);
      } else {
        bowlerY = BR_RELEASE_Y;
        flightFrac = Math.min(1, (t - r.runupMs) / r.flightMs);
        // release → bounce → bat, two segments
        if (flightFrac <= 0.55) {
          const k = flightFrac / 0.55;
          ball = { x: BR_W / 2 + (arrivalX - BR_W / 2) * k * 0.7, y: BR_RELEASE_Y + (bounceY - BR_RELEASE_Y) * k };
        } else {
          const k = (flightFrac - 0.55) / 0.45;
          const bx = BR_W / 2 + (arrivalX - BR_W / 2) * 0.7;
          ball = { x: bx + (arrivalX - bx) * k, y: bounceY + (BR_BAT_Y - bounceY) * k };
        }
      }
      drawScene(ctx, bowlerY, ball);

      // finished flight without a full read → auto reveal (late)
      if (flightFrac >= 1 && !r.revealed) {
        finishRep(1);
        return;
      }
      r.raf = requestAnimationFrame(loop);
    };
    r.raf = requestAnimationFrame(loop);
  };

  // commitFraction: where in the FLIGHT the read locked (0=release, 1=bat; <0 during run-up)
  const currentFlightFraction = (): number => {
    const r = rep.current;
    const t = performance.now() - r.start;
    if (t < r.runupMs) return 0; // committed during run-up = earliest
    return Math.min(1, (t - r.runupMs) / r.flightMs);
  };

  const finishRep = (forcedFrac?: number) => {
    const r = rep.current;
    if (r.revealed) return;
    r.revealed = true;
    cancelAnimationFrame(r.raf);
    setRepRunning(false);
    const commit = forcedFrac ?? (r.committedAt ?? 1);
    const gl = guessLineRef.current;
    const gLen = guessLengthRef.current;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawScene(ctx, BR_RELEASE_Y, { x: lineToX(r.delivery.line), y: BR_BAT_Y }, r.delivery);
    // A dimension they never chose scores as wrong (sentinel never matches).
    setRepResult(scoreRead(
      r.delivery,
      { line: gl ?? ('__none__' as Line), length: gLen ?? ('__none__' as Length) },
      commit,
    ));
  };

  // When both guesses are in, lock the commit fraction and reveal.
  useEffect(() => {
    if (!repRunning) return;
    if (guessLine && guessLength && rep.current.committedAt === null) {
      rep.current.committedAt = currentFlightFraction();
      finishRep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guessLine, guessLength, repRunning]);

  useEffect(() => {
    const r = rep.current; // stable object ref — safe in cleanup
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && stage === 'reps') drawScene(ctx, 12, null);
    return () => cancelAnimationFrame(r.raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-5 border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><span className="text-2xl">🎬</span> Visualization &amp; Bowler Read</h3>
        <p className="text-sm text-gray-300">First <strong className="text-amber-300">picture yourself at the ground</strong> you&apos;re about to play; then train the <strong className="text-amber-300">read</strong> — call line and length <em>before</em> the ball arrives. See → Process → Act.</p>
      </div>

      {/* Setup */}
      <div className="grid sm:grid-cols-3 gap-2 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">Ground</span>
          <select value={ground.id} onChange={(e) => setGround(GROUNDS.find(g => g.id === e.target.value)!)} className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-gray-200">
            {GROUNDS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">Situation</span>
          <select value={situation.id} onChange={(e) => setSituation(SITUATIONS.find(s => s.id === e.target.value)!)} className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-gray-200">
            {SITUATIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">Bowler</span>
          <select value={bowler} onChange={(e) => setBowler(e.target.value as BowlerType)} className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-gray-200">
            <option value="pace">Pace</option>
            <option value="off-spin">Off-spin</option>
            <option value="leg-spin">Leg-spin</option>
          </select>
        </label>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={startRehearsal} className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm font-medium">▶ Guided rehearsal</button>
        <button onClick={() => { setStage('reps'); }} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">Bowler read →</button>
        <button onClick={() => { setStage('imagery'); }} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">🧠 Guided imagery →</button>
        <button onClick={() => { setStage('follow'); }} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">🎥 Follow-along →</button>
      </div>

      {stage === 'imagery' && <GuidedImagery onLog={onLog} onBack={() => setStage('setup')} />}
      {stage === 'follow' && <FollowAlong onLog={onLog} onBack={() => setStage('setup')} />}

      {/* Rehearsal stage */}
      {stage === 'rehearsal' && (
        <div className="rounded-2xl p-6 border border-amber-500/30 bg-black/30 flex flex-col items-center gap-4">
          <div className="relative h-40 w-40 flex items-center justify-center">
            <div
              className="rounded-full bg-gradient-to-br from-amber-400/30 to-orange-500/20 border border-amber-300/40"
              style={{
                width: 130, height: 130,
                transform: `scale(${script[stepIdx].breathe && rehearsing ? 1 : 0.6})`,
                transition: `transform ${script[stepIdx].breathe ? script[stepIdx].seconds : 0.5}s ease-in-out`,
              }}
            />
            <span className="absolute text-4xl">🏏</span>
          </div>
          <p className="text-center text-gray-100 text-sm leading-relaxed max-w-md min-h-[72px]">{script[stepIdx].text}</p>
          <div className="flex gap-1.5">
            {script.map((_, i) => <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === stepIdx ? 'bg-amber-400' : i < stepIdx ? 'bg-amber-400/40' : 'bg-white/15'}`} />)}
          </div>
          <div className="flex gap-2">
            {rehearsing ? (
              <button onClick={() => setRehearsing(false)} className="px-4 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm">Pause</button>
            ) : stepIdx < script.length - 1 ? (
              <button onClick={() => setRehearsing(true)} className="px-4 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm">Resume</button>
            ) : (
              <button onClick={() => setStage('reps')} className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm">Now read the bowler →</button>
            )}
            <button onClick={() => setStage('setup')} className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm">Back</button>
          </div>
        </div>
      )}

      {/* Bowler-read stage */}
      {stage === 'reps' && (
        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            width={BR_W}
            height={BR_H}
            className="rounded-xl border border-white/10 w-full max-w-[320px]"
            style={{ aspectRatio: `${BR_W}/${BR_H}` }}
          />

          {!repRunning && !repResult && (
            <button onClick={startRep} className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm font-medium">Bowl</button>
          )}

          {repRunning && (
            <div className="w-full max-w-[320px] space-y-2">
              <p className="text-center text-xs text-amber-300">Call it as EARLY as you dare — length &amp; line</p>
              <div className="grid grid-cols-3 gap-1.5">
                {LENGTHS.map(l => (
                  <button key={l} onClick={() => pickLength(l)} className={`px-2 py-2 rounded-md text-sm border capitalize ${guessLength === l ? 'bg-amber-500/30 text-amber-200 border-amber-500/60' : 'bg-white/5 text-gray-300 border-white/10'}`}>{l}</button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {LINES.map(l => (
                  <button key={l} onClick={() => pickLine(l)} className={`px-2 py-2 rounded-md text-sm border capitalize ${guessLine === l ? 'bg-cyan-500/30 text-cyan-200 border-cyan-500/60' : 'bg-white/5 text-gray-300 border-white/10'}`}>{l}</button>
                ))}
              </div>
            </div>
          )}

          {repResult && (
            <div className="text-center space-y-2">
              <p className="text-white text-sm">{repResult.label} — <strong className="text-amber-300">{repResult.total}</strong>/100</p>
              <p className="text-xs text-gray-400">line {repResult.lineCorrect ? '✓' : '✗'} · length {repResult.lengthCorrect ? '✓' : '✗'} · earliness {repResult.earliness}%</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => { onLog('read', repResult.total); setRepResult(null); }} className="px-3 py-1.5 rounded-lg bg-white/10 text-amber-300 text-xs border border-amber-500/40">Log score</button>
                <button onClick={startRep} className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-200 text-xs border border-amber-500/40">Next ball</button>
              </div>
            </div>
          )}
          <button onClick={() => setStage('setup')} className="text-gray-500 text-xs hover:text-gray-300">← change ground / situation</button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  MODULE 7 — Multiple Object Tracking (MOT)
// ════════════════════════════════════════════════════════════════════════
//
// Soft-focus the centre dot, hold the highlighted balls in your peripheral
// vision as everything scatters, then tap them once they freeze. Trains the
// dynamic, divided attention a fielder/batter uses to read play under load.

const MOT_SIZE = 340;
const MOT_R = 13;

interface MotBall { id: number; x: number; y: number; vx: number; vy: number; target: boolean; picked: boolean; }

function MotTrainer({ onLog }: { onLog: (type: MetricType, value: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [difficulty, setDifficulty] = useState<MotDifficulty>('easy');
  const [phase, setPhase] = useState<'idle' | 'reveal' | 'track' | 'select' | 'result'>('idle');
  const [result, setResult] = useState<ReturnType<typeof scoreMot> | null>(null);
  const [pickedCount, setPickedCount] = useState(0);
  const state = useRef<{ balls: MotBall[]; cfg: MotConfig; raf: number; timer: ReturnType<typeof setTimeout> | null }>(
    { balls: [], cfg: MOT_DIFFICULTY.easy, raf: 0, timer: null },
  );

  const draw = useCallback((showTargets: boolean, selectable: boolean) => {
    const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#06131a';
    ctx.fillRect(0, 0, MOT_SIZE, MOT_SIZE);
    // central fixation dot (soft focus here)
    ctx.fillStyle = '#facc15';
    ctx.beginPath(); ctx.arc(MOT_SIZE / 2, MOT_SIZE / 2, 4, 0, Math.PI * 2); ctx.fill();
    for (const b of state.current.balls) {
      // ball (cricket red with a seam)
      ctx.fillStyle = '#e11d48';
      ctx.beginPath(); ctx.arc(b.x, b.y, MOT_R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(b.x - MOT_R + 3, b.y); ctx.lineTo(b.x + MOT_R - 3, b.y); ctx.stroke();
      // glow the targets during the reveal, or reveal them in results
      if (showTargets && b.target) {
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(b.x, b.y, MOT_R + 4, 0, Math.PI * 2); ctx.stroke();
      }
      // show the player's picks
      if ((selectable || showTargets) && b.picked) {
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(b.x, b.y, MOT_R + 7, 0, Math.PI * 2); ctx.stroke();
      }
    }
  }, []);

  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  const start = () => {
    const cfg = MOT_DIFFICULTY[difficulty];
    state.current.cfg = cfg;
    // place balls without heavy overlap (simple scatter)
    const balls: MotBall[] = [];
    for (let i = 0; i < cfg.total; i++) {
      const ang = rand(0, Math.PI * 2);
      balls.push({
        id: i,
        x: rand(MOT_R + 4, MOT_SIZE - MOT_R - 4),
        y: rand(MOT_R + 4, MOT_SIZE - MOT_R - 4),
        vx: Math.cos(ang), vy: Math.sin(ang),
        target: false, picked: false,
      });
    }
    // pick targets
    const idxs = balls.map((_, i) => i);
    for (let i = idxs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idxs[i], idxs[j]] = [idxs[j], idxs[i]]; }
    idxs.slice(0, cfg.targets).forEach((i) => { balls[i].target = true; });
    state.current.balls = balls;
    setResult(null); setPickedCount(0);

    // reveal targets, then track
    setPhase('reveal');
    draw(true, false);
    state.current.timer = setTimeout(() => runTracking(cfg), 2000);
  };

  const runTracking = (cfg: MotConfig) => {
    setPhase('track');
    const startTime = performance.now();
    const loop = (now: number) => {
      const balls = state.current.balls;
      for (const b of balls) {
        b.x += b.vx * cfg.speed;
        b.y += b.vy * cfg.speed;
        if (b.x < MOT_R || b.x > MOT_SIZE - MOT_R) { b.vx *= -1; b.x = Math.max(MOT_R, Math.min(MOT_SIZE - MOT_R, b.x)); }
        if (b.y < MOT_R || b.y > MOT_SIZE - MOT_R) { b.vy *= -1; b.y = Math.max(MOT_R, Math.min(MOT_SIZE - MOT_R, b.y)); }
      }
      // gentle ball-ball repulsion so they don't stack
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const dx = balls[j].x - balls[i].x, dy = balls[j].y - balls[i].y;
          const d = Math.hypot(dx, dy);
          if (d > 0 && d < MOT_R * 2) {
            const push = (MOT_R * 2 - d) / 2;
            const ux = dx / d, uy = dy / d;
            balls[i].x -= ux * push; balls[i].y -= uy * push;
            balls[j].x += ux * push; balls[j].y += uy * push;
          }
        }
      }
      draw(false, false);
      if (now - startTime >= cfg.trackMs) {
        setPhase('select');
        draw(false, true);
        return;
      }
      state.current.raf = requestAnimationFrame(loop);
    };
    state.current.raf = requestAnimationFrame(loop);
  };

  const onCanvasClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (phase !== 'select') return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * MOT_SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * MOT_SIZE;
    const balls = state.current.balls;
    const cfg = state.current.cfg;
    let hit: MotBall | null = null;
    for (const b of balls) { if (Math.hypot(b.x - x, b.y - y) <= MOT_R + 4) { hit = b; break; } }
    if (!hit) return;
    const currentlyPicked = balls.filter((b) => b.picked).length;
    if (!hit.picked && currentlyPicked >= cfg.targets) return; // cap at target count
    hit.picked = !hit.picked;
    setPickedCount(balls.filter((b) => b.picked).length);
    draw(false, true);
  };

  const check = () => {
    const balls = state.current.balls;
    const targetIds = balls.filter((b) => b.target).map((b) => b.id);
    const pickedIds = balls.filter((b) => b.picked).map((b) => b.id);
    const s = scoreMot(targetIds, pickedIds);
    setResult(s);
    setPhase('result');
    draw(true, true); // reveal targets + picks
  };

  useEffect(() => {
    const st = state.current;
    draw(false, false);
    return () => { cancelAnimationFrame(st.raf); if (st.timer) clearTimeout(st.timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cfg = MOT_DIFFICULTY[difficulty];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 border-2 border-sky-500/40 bg-gradient-to-br from-sky-500/10 to-transparent">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><span className="text-2xl">👁️‍🗨️</span> Object Tracking (MOT)</h3>
        <p className="text-sm text-gray-300"><strong className="text-sky-300">Soft-focus the yellow centre dot</strong> and hold the glowing balls in your <strong className="text-sky-300">peripheral vision</strong> as they scatter. When they freeze, tap the ones you tracked. This is the read-the-play, eye-on-the-ball-under-pressure skill.</p>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-xs text-gray-400">Difficulty:</span>
        {(['easy', 'medium', 'hard'] as MotDifficulty[]).map((d) => (
          <button key={d} onClick={() => { if (phase === 'idle' || phase === 'result') setDifficulty(d); }} disabled={phase !== 'idle' && phase !== 'result'}
            className={`px-3 py-1 rounded-md text-sm border capitalize disabled:opacity-40 ${difficulty === d ? 'bg-sky-500/20 text-sky-300 border-sky-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{d}</button>
        ))}
        <span className="text-[11px] text-gray-500 ml-auto">{cfg.total} balls · track {cfg.targets}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={MOT_SIZE}
        height={MOT_SIZE}
        onPointerDown={onCanvasClick}
        className="w-full max-w-[340px] mx-auto block rounded-xl border border-white/10 touch-none"
        style={{ aspectRatio: '1 / 1', cursor: phase === 'select' ? 'pointer' : 'default' }}
      />

      <div className="flex flex-col items-center gap-2">
        {phase === 'idle' && <button onClick={start} className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 text-white text-sm font-medium">Start</button>}
        {phase === 'reveal' && <p className="text-sm text-yellow-300">Memorise the glowing balls…</p>}
        {phase === 'track' && <p className="text-sm text-sky-300">Track them — soft eyes on the centre dot</p>}
        {phase === 'select' && (
          <>
            <p className="text-sm text-white">Tap the {cfg.targets} you tracked <span className="text-gray-500">({pickedCount}/{cfg.targets})</span></p>
            <button onClick={check} disabled={pickedCount !== cfg.targets} className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 text-white text-sm font-medium disabled:opacity-40">Check</button>
          </>
        )}
        {phase === 'result' && result && (
          <div className="text-center space-y-2">
            <p className="text-white text-sm">{result.perfect ? '🎯 Perfect!' : 'Round done'} — <strong className="text-sky-300">{result.correct}/{result.total}</strong> ({result.accuracy}%)</p>
            <p className="text-[11px] text-gray-500">Yellow ring = target · blue ring = your pick</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { onLog('mot', result.accuracy); setPhase('idle'); draw(false, false); }} className="px-3 py-1.5 rounded-lg bg-white/10 text-sky-300 text-xs border border-sky-500/40">Log score</button>
              <button onClick={start} className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-200 text-xs border border-sky-500/40">Again</button>
            </div>
          </div>
        )}
      </div>
      <p className="text-[11px] text-gray-500 text-center italic">Challenge: do it while balancing on one foot. Stop on eye strain or dizziness.</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  MODULE 8 — Neuro-Juggling progression
// ════════════════════════════════════════════════════════════════════════
//
// Physical off-screen drill (Dr. Jackie), so the app guides + tracks rather
// than simulates. 8 levels; the player logs practice reps and marks a level
// cleared once mastered. Cleared level persists on the progress doc.

function JugglingTracker({
  clearedLevel, onClearLevel, onLog,
}: {
  clearedLevel: number;
  onClearLevel: (n: number) => void;
  onLog: (type: MetricType, value: number) => void;
}) {
  const target = nextJugglingTarget(clearedLevel);
  const [openLevel, setOpenLevel] = useState<number>(target);
  const [reps, setReps] = useState(20);
  const level = JUGGLING_LEVELS.find((l) => l.level === openLevel)!;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 border-2 border-green-500/40 bg-gradient-to-br from-green-500/10 to-transparent">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><span className="text-2xl">🤹</span> Neuro-Juggling</h3>
        <p className="text-sm text-gray-300">Cross-body visual-motor training (Dr. Jackie). A real ball in your hands — the app guides the progression and tracks your reps. Work one level until it&apos;s smooth, then clear it and move on.</p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 whitespace-nowrap">{clearedLevel}/{JUGGLING_TOTAL} cleared</span>
        <div className="flex-1 flex gap-1">
          {JUGGLING_LEVELS.map((l) => (
            <div key={l.level} className={`h-2 flex-1 rounded-full ${l.level <= clearedLevel ? 'bg-green-400' : l.level === target ? 'bg-green-400/40' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      {/* Level list */}
      <div className="space-y-1.5">
        {JUGGLING_LEVELS.map((l) => {
          const done = l.level <= clearedLevel;
          const isTarget = l.level === target;
          return (
            <button
              key={l.level}
              onClick={() => setOpenLevel(l.level)}
              className={`w-full text-left px-3 py-2 rounded-lg border flex items-center gap-2 ${openLevel === l.level ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 bg-white/3'}`}
            >
              <span className="text-sm">{done ? '✅' : l.detailed ? (isTarget ? '🎯' : '•') : '🔒'}</span>
              <span className="text-sm text-white flex-1">L{l.level} — {l.name}</span>
              <span className="text-[11px] text-gray-500">{l.balls}</span>
            </button>
          );
        })}
      </div>

      {/* Open level card */}
      <div className="rounded-xl p-4 border border-green-500/30 bg-black/30 space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="text-white font-bold">Level {level.level}: {level.name}</p>
          <span className="text-[11px] text-gray-500">{level.balls}</span>
        </div>

        {level.detailed ? (
          <>
            <ol className="text-sm text-gray-300 list-decimal list-inside space-y-1">
              {level.how!.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            <p className="text-xs rounded-md bg-green-500/10 border-l-2 border-green-500/60 px-3 py-2 text-green-200"><strong>You&apos;ve got it when:</strong> {level.mastery}</p>

            <div className="flex flex-wrap gap-2 items-center pt-1">
              <label className="text-xs text-gray-400 flex items-center gap-1">
                reps
                <input type="number" min={1} max={500} value={reps} onChange={(e) => setReps(Math.max(1, parseInt(e.target.value || '1', 10)))} className="w-16 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-gray-200" />
              </label>
              <button onClick={() => onLog('juggle', reps)} className="px-3 py-1.5 rounded-lg bg-white/10 text-green-300 text-xs border border-green-500/40">Log session</button>
              {canClearLevel(level, clearedLevel) ? (
                <button onClick={() => { onClearLevel(level.level); setOpenLevel(nextJugglingTarget(level.level)); }} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-200 text-xs border border-green-500/50">✓ Mark Level {level.level} cleared</button>
              ) : level.level <= clearedLevel ? (
                <span className="text-xs text-green-400">✓ Cleared</span>
              ) : (
                <span className="text-[11px] text-gray-500">Clear Level {clearedLevel + 1} first</span>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">Full instructions for this level haven&apos;t been added yet. Send me the &ldquo;Level {level.level}&rdquo; session and I&apos;ll unlock it here with steps + a mastery target.</p>
        )}
      </div>

      <p className="text-[11px] text-gray-500 text-center italic">1:1 coaching: handeyebody.com. Stop if you strain — smooth rhythm beats speed.</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  MODULE 9 — Mindset (sport psychology + in-game state)
// ════════════════════════════════════════════════════════════════════════

// Small reusable step-player with a breathing circle — used for the pre-ball
// centering routine and the reset "flush".
function RoutinePlayer({ steps, emoji, onExit }: { steps: RoutineStep[]; emoji: string; onExit: () => void }) {
  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!running || done) return;
    const step = steps[idx];
    timer.current = setTimeout(() => {
      if (idx < steps.length - 1) setIdx((i) => i + 1);
      else { setRunning(false); setDone(true); }
    }, step.seconds * 1000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [running, idx, steps, done]);

  const step = steps[idx];

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl p-5 border border-rose-500/30 bg-black/30">
      <div className="relative h-32 w-32 flex items-center justify-center">
        <div
          className="rounded-full bg-gradient-to-br from-rose-400/30 to-pink-500/20 border border-rose-300/40"
          style={{
            width: 110, height: 110,
            transform: `scale(${!done && step.breathe && running ? 1 : 0.62})`,
            transition: `transform ${!done && step.breathe ? step.seconds : 0.5}s ease-in-out`,
          }}
        />
        <span className="absolute text-3xl">{emoji}</span>
      </div>
      {!done ? (
        <>
          <p className="text-center text-gray-100 text-sm leading-relaxed max-w-sm min-h-[72px]">{step.text}</p>
          <div className="flex gap-1.5">{steps.map((_, i) => <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === idx ? 'bg-rose-400' : i < idx ? 'bg-rose-400/40' : 'bg-white/15'}`} />)}</div>
          <div className="flex gap-2">
            {running ? <button onClick={() => setRunning(false)} className="px-4 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm">Pause</button>
              : <button onClick={() => setRunning(true)} className="px-4 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm">Resume</button>}
            <button onClick={onExit} className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm">Stop</button>
          </div>
        </>
      ) : (
        <div className="text-center space-y-2">
          <p className="text-white text-sm">That’s the routine. The more you run it, the faster it fires in the game.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => { setIdx(0); setDone(false); setRunning(true); }} className="px-4 py-1.5 rounded-lg bg-rose-500/20 text-rose-200 text-sm border border-rose-500/40">Again</button>
            <button onClick={onExit} className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MindsetTrainer({ email }: { email: string | null }) {
  const [mode, setMode] = useState<'principles' | 'routine' | 'reset'>('principles');
  const storeKey = `c3h:nv:mindset:${email ?? 'anon'}`;

  // Personal cue word + breath pattern, persisted locally.
  const [cue, setCue] = useState('');
  const [patternId, setPatternId] = useState(BREATH_PATTERNS[0].id);
  const [playing, setPlaying] = useState<null | 'centering' | 'reset'>(null);
  const [arousal, setArousal] = useState<ArousalLevel | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(storeKey) : null;
      if (raw) { const j = JSON.parse(raw); setCue(j.cue ?? ''); setPatternId(j.patternId ?? BREATH_PATTERNS[0].id); }
    } catch { /* ignore */ }
  }, [storeKey]);

  const persist = (nextCue: string, nextPattern: string) => {
    setCue(nextCue); setPatternId(nextPattern);
    try { localStorage.setItem(storeKey, JSON.stringify({ cue: nextCue, patternId: nextPattern })); } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 border-2 border-rose-500/40 bg-gradient-to-br from-rose-500/10 to-transparent">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><span className="text-2xl">🧭</span> Mindset</h3>
        <p className="text-sm text-gray-300">Skill isn’t enough if you can’t reach your best state under pressure. This is how you switch it <strong className="text-rose-300">on, on demand</strong> — a pre-ball trigger, a fast reset, and the sport-psych principles behind them.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {([['principles', 'Principles'], ['routine', 'Pre-ball routine'], ['reset', 'Reset & regulate']] as const).map(([k, label]) => (
          <button key={k} onClick={() => { setMode(k); setPlaying(null); }} className={`px-3 py-1.5 rounded-lg text-sm border ${mode === k ? 'bg-rose-500/20 text-rose-200 border-rose-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{label}</button>
        ))}
      </div>

      {mode === 'principles' && (
        <div className="grid sm:grid-cols-2 gap-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-xl p-4 border border-white/10 bg-white/3">
              <p className="text-white font-semibold text-sm flex items-start gap-2"><span className="text-lg leading-none">{p.icon}</span> {p.title}</p>
              <p className="text-gray-300 text-xs mt-2 leading-relaxed">{p.body}</p>
              <p className="text-rose-300 text-xs mt-2 italic">↳ {p.cue}</p>
            </div>
          ))}
        </div>
      )}

      {mode === 'routine' && (
        <div className="space-y-4">
          {playing === 'centering' ? (
            <RoutinePlayer steps={buildCenteringRoutine(cue, patternId)} emoji="🏏" onExit={() => setPlaying(null)} />
          ) : (
            <>
              <p className="text-sm text-gray-300">Build your personal trigger. Same ritual before every ball = your best state, repeatable. Set it once, then rehearse it until it’s automatic.</p>
              <label className="block">
                <span className="text-xs text-gray-400">Your cue word / phrase (short — what refocuses you)</span>
                <input value={cue} onChange={(e) => persist(e.target.value, patternId)} placeholder="e.g. watch the ball · still head · breathe" maxLength={40}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" />
              </label>
              <label className="block">
                <span className="text-xs text-gray-400">Breath</span>
                <select value={patternId} onChange={(e) => persist(cue, e.target.value)} className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200">
                  {BREATH_PATTERNS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </label>
              <button onClick={() => setPlaying('centering')} className="px-5 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-pink-500 text-white text-sm font-medium">Rehearse my routine</button>
              <p className="text-[11px] text-gray-500 italic">Do this a few times a day off the field. On match day, run it before every ball — step away, breathe, cue word, commit.</p>
            </>
          )}
        </div>
      )}

      {mode === 'reset' && (
        <div className="space-y-5">
          {playing === 'reset' ? (
            <RoutinePlayer steps={RESET_ROUTINE} emoji="🚿" onExit={() => setPlaying(null)} />
          ) : (
            <div className="space-y-2">
              <p className="text-white font-semibold text-sm">The reset (after a mistake)</p>
              <p className="text-sm text-gray-300">Play-and-miss, dropped catch, loose ball — it’s done. The same flush every time so it fires automatically. Rehearse it now.</p>
              <button onClick={() => setPlaying('reset')} className="px-5 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-pink-500 text-white text-sm font-medium">Practice the reset</button>
            </div>
          )}

          <div className="rounded-xl p-4 border border-white/10 bg-white/3 space-y-3">
            <p className="text-white font-semibold text-sm">Arousal check — where are you right now?</p>
            <div className="flex gap-2 flex-wrap">
              {([['flat', 'Too flat / slow'], ['dialled', 'Dialled in'], ['amped', 'Too amped / tight']] as const).map(([k, label]) => (
                <button key={k} onClick={() => setArousal(k)} className={`px-3 py-1.5 rounded-md text-sm border ${arousal === k ? 'bg-rose-500/20 text-rose-200 border-rose-500/50' : 'bg-white/5 text-gray-300 border-white/10'}`}>{label}</button>
              ))}
            </div>
            {arousal && (() => { const t = regulateFor(arousal); return (
              <div className="rounded-md bg-rose-500/10 border-l-2 border-rose-500/60 px-3 py-2">
                <p className="text-rose-200 text-sm font-medium">{t.title}</p>
                <p className="text-gray-300 text-xs mt-1">{t.body}</p>
              </div>
            ); })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  MODULE 10 — Power Hitting
// ════════════════════════════════════════════════════════════════════════
//
// Physical off-screen drill. The guided session walks set-by-set with a rest
// timer so the player does full-intent sets with real rest (quality > grind),
// then logs total reps. Bat used is a local convenience field.

const POWER_BATS = ['Pro Velocity (training)', 'Match bat', 'Other'];

function PowerHittingTrainer({ onLog }: { onLog: (type: MetricType, value: number) => void }) {
  const [protocol, setProtocol] = useState<PowerProtocol>(POWER_PROTOCOLS[0]);
  const [bat, setBat] = useState(POWER_BATS[0]);
  const [phase, setPhase] = useState<'setup' | 'swing' | 'rest' | 'done'>('setup');
  const [setNo, setSetNo] = useState(1);
  const [restLeft, setRestLeft] = useState(0);
  const [loggedReps, setLoggedReps] = useState(0);
  const restTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearRest = () => { if (restTimer.current) { clearInterval(restTimer.current); restTimer.current = null; } };
  useEffect(() => () => clearRest(), []);

  const startSession = () => { clearRest(); setSetNo(1); setPhase('swing'); };

  const completeSet = () => {
    if (setNo >= protocol.sets) {
      // Finished the last set.
      setLoggedReps(totalReps(protocol));
      setPhase('done');
      return;
    }
    // Rest, then advance.
    setRestLeft(protocol.restSec);
    setPhase('rest');
    clearRest();
    restTimer.current = setInterval(() => {
      setRestLeft((r) => {
        if (r <= 1) { clearRest(); setSetNo((n) => n + 1); setPhase('swing'); return 0; }
        return r - 1;
      });
    }, 1000);
  };

  const skipRest = () => { clearRest(); setSetNo((n) => n + 1); setPhase('swing'); };

  const target = totalReps(protocol);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 border-2 border-orange-500/40 bg-gradient-to-br from-orange-500/10 to-transparent">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><span className="text-2xl">💥</span> Power Hitting</h3>
        <p className="text-sm text-gray-300">Build bat speed the right way — short, <strong className="text-orange-300">full-intent</strong> sets with real rest, off a tee or throwdowns. This is the multiplier once your eyes and timing are dialled in. Load early in the week; taper before you play.</p>
      </div>

      {phase === 'setup' && (
        <>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Protocol</span>
              <select value={protocol.id} onChange={(e) => setProtocol(POWER_PROTOCOLS.find((p) => p.id === e.target.value)!)} className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-gray-200">
                {POWER_PROTOCOLS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Bat</span>
              <select value={bat} onChange={(e) => setBat(e.target.value)} className="bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-gray-200">
                {POWER_BATS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </label>
          </div>

          <div className="rounded-xl p-4 border border-orange-500/30 bg-black/30 text-sm">
            <p className="text-white font-bold">{protocol.name}</p>
            <p className="text-gray-300 mt-1">{protocol.sets} sets × {protocol.reps} reps · <span className="text-orange-300">{target} quality reps</span> · {protocol.restSec}s rest · {protocol.contact}</p>
            <p className="text-gray-400 text-xs mt-2 italic">{protocol.cue}</p>
          </div>

          <button onClick={startSession} className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 text-white text-sm font-medium">Start guided session</button>
        </>
      )}

      {phase === 'swing' && (
        <div className="rounded-xl p-6 border border-orange-500/30 bg-black/30 text-center space-y-3">
          <p className="text-xs text-orange-300 uppercase tracking-wider">Set {setNo} of {protocol.sets}</p>
          <p className="text-4xl font-bold text-white">{protocol.reps} <span className="text-lg text-gray-400 font-normal">reps</span></p>
          <p className="text-sm text-gray-300">Max intent. Clean strike. Balanced finish. Stop early if the swing slows.</p>
          <button onClick={completeSet} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 text-white text-sm font-medium">✓ Set done</button>
        </div>
      )}

      {phase === 'rest' && (
        <div className="rounded-xl p-6 border border-orange-500/30 bg-black/30 text-center space-y-3">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Rest</p>
          <p className="text-5xl font-bold text-orange-300 tabular-nums">{restLeft}s</p>
          <p className="text-sm text-gray-400">Breathe. Next up: set {setNo + 1} of {protocol.sets}.</p>
          <button onClick={skipRest} className="px-4 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm">Skip rest →</button>
        </div>
      )}

      {phase === 'done' && (
        <div className="rounded-xl p-6 border border-orange-500/40 bg-black/30 text-center space-y-3">
          <p className="text-white">Session complete 💪</p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-400">Reps</span>
            <input type="number" min={0} max={2000} value={loggedReps} onChange={(e) => setLoggedReps(Math.max(0, parseInt(e.target.value || '0', 10)))} className="w-20 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-white text-center" />
            <span className="text-gray-500 text-xs">({bat})</span>
          </div>
          <p className="text-[11px] text-gray-500">Edit if you cut a set short — log what you actually did.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => { onLog('power', loggedReps); setPhase('setup'); }} className="px-3 py-1.5 rounded-lg bg-white/10 text-orange-300 text-xs border border-orange-500/40">Log {loggedReps} reps</button>
            <button onClick={() => setPhase('setup')} className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-200 text-xs border border-orange-500/40">Done</button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {POWER_PRINCIPLES.map((p) => (
          <div key={p.title} className="rounded-lg p-3 border border-white/10 bg-white/3">
            <p className="text-white font-semibold text-xs flex items-start gap-2"><span className="text-base leading-none">{p.icon}</span> {p.title}</p>
            <p className="text-gray-400 text-[11px] mt-1.5 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-500 text-center italic">This week: load Tue/Wed, light Thu, none Fri, activate only on match day.</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  PAGE
// ════════════════════════════════════════════════════════════════════════

type LabTab = 'ball' | 'field' | 'perceptual' | 'visualize' | 'mot' | 'juggle' | 'power' | 'mindset' | 'breathing' | 'progress';

export default function NeuroVisionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const email = session?.user?.email ?? null;
  const isDirector = isC3HDirector(email);

  const [tab, setTab] = useState<LabTab>('ball');
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [jugglingLevel, setJugglingLevel] = useState(0); // highest neuro-juggling level cleared
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login?callbackUrl=/c3h/neurovision');
  }, [status, router]);

  // Load this player's progress once authorised.
  useEffect(() => {
    if (!email || !isDirector) return;
    let cancelled = false;
    (async () => {
      try {
        await firebaseAuthReady();
        const snap = await getDoc(doc(db, 'neurovision_progress', safeKey(email)));
        if (cancelled) return;
        if (snap.exists()) {
          const data = snap.data() as { entries?: ProgressEntry[]; jugglingLevel?: number };
          setEntries(Array.isArray(data.entries) ? data.entries : []);
          if (typeof data.jugglingLevel === 'number') setJugglingLevel(data.jugglingLevel);
        }
      } catch {
        /* first-load read failure is non-fatal — start empty */
      }
    })();
    return () => { cancelled = true; };
  }, [email, isDirector]);

  // Single writer for the progress doc — used by both score logging and the
  // juggling level tracker so the whole doc stays consistent.
  const saveProgress = useCallback(async (nextEntries: ProgressEntry[], level: number) => {
    if (!email) return;
    setEntries(nextEntries);
    setJugglingLevel(level);
    try {
      await firebaseAuthReady();
      await setDoc(doc(db, 'neurovision_progress', safeKey(email)), {
        email,
        updatedAt: new Date().toISOString(),
        entries: nextEntries,
        jugglingLevel: level,
      });
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [email]);

  const logEntry = useCallback((type: MetricType, value: number) => {
    const entry: ProgressEntry = { type, value, at: new Date().toISOString() };
    return saveProgress([...entries, entry].slice(-200), jugglingLevel);
  }, [entries, jugglingLevel, saveProgress]);

  const clearJugglingLevel = useCallback((n: number) => saveProgress(entries, n), [entries, saveProgress]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center pt-40 text-gray-400">Loading…</div>
      </div>
    );
  }

  if (!isDirector) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
        <Navbar />
        <section className="section-padding pt-32 md:pt-40">
          <div className="max-w-lg mx-auto text-center glass rounded-2xl p-8 border border-white/10">
            <p className="text-4xl mb-3">🔒</p>
            <h1 className="text-2xl font-bold text-white mb-2">NeuroVision Lab</h1>
            <p className="text-gray-400 text-sm mb-4">This training tool is currently in a directors-only pilot. It will open to all players once it&apos;s dialled in.</p>
            <Link href="/c3h/dashboard" className="text-primary-400 text-sm hover:underline">← Back to dashboard</Link>
          </div>
        </section>
      </div>
    );
  }

  const TABS: { key: LabTab; label: string; emoji: string }[] = [
    { key: 'ball', label: 'Ball Pickup', emoji: '🎯' },
    { key: 'field', label: 'Field Scanner', emoji: '🗺️' },
    { key: 'perceptual', label: 'Perceptual', emoji: '🌫️' },
    { key: 'visualize', label: 'Visualization', emoji: '🎬' },
    { key: 'mot', label: 'Tracking', emoji: '👁️‍🗨️' },
    { key: 'juggle', label: 'Juggling', emoji: '🤹' },
    { key: 'power', label: 'Power Hitting', emoji: '💥' },
    { key: 'mindset', label: 'Mindset', emoji: '🧭' },
    { key: 'breathing', label: 'Breathing', emoji: '🫁' },
    { key: 'progress', label: 'Progress', emoji: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />
      <section className="section-padding pt-32 md:pt-40">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/c3h/dashboard" className="text-gray-500 text-sm hover:text-primary-400 transition-colors mb-2 inline-block">← Dashboard</Link>
            <h1 className="text-3xl font-bold text-white">NeuroVision <span className="gradient-text">Lab</span></h1>
            <p className="text-gray-500 text-sm mt-1">Train the eyes to watch the ball, read the gaps, and breathe under pressure. Directors-only pilot. <strong className="text-gray-400">Weekdays train · weekend play · rest the eyes.</strong></p>
          </div>

          {saveError && (
            <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
              Couldn&apos;t save your last score to the cloud (Firestore rules for <code>neurovision_progress</code> may need deploying). Your session totals still show below.
            </div>
          )}

          <div className="flex gap-2 flex-wrap mb-6">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  tab === t.key ? 'bg-primary-500/20 text-primary-300 border-primary-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {tab === 'ball' && <BallPickupTrainer onLog={logEntry} />}
          {tab === 'field' && <FieldScanner />}
          {tab === 'perceptual' && <PerceptualTrainer onLog={logEntry} />}
          {tab === 'visualize' && <VisualizationTrainer onLog={logEntry} />}
          {tab === 'mot' && <MotTrainer onLog={logEntry} />}
          {tab === 'juggle' && <JugglingTracker clearedLevel={jugglingLevel} onClearLevel={clearJugglingLevel} onLog={logEntry} />}
          {tab === 'power' && <PowerHittingTrainer onLog={logEntry} />}
          {tab === 'mindset' && <MindsetTrainer email={email} />}
          {tab === 'breathing' && <BreathingPacer onLog={logEntry} />}
          {tab === 'progress' && <ProgressPanel entries={entries} />}
        </div>
      </section>
    </div>
  );
}
