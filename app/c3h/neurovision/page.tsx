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

// ── Progress entries (Firestore) ─────────────────────────────────────────
type MetricType = 'ball-predict' | 'ball-track' | 'bolt' | 'breath-hold' | 'contrast';

interface ProgressEntry {
  type: MetricType;
  value: number; // predict/track = 0-100; bolt/breath-hold = seconds; contrast = threshold %
  at: string; // ISO timestamp
}

const METRIC_META: Record<MetricType, { label: string; unit: string; color: string; higherBetter: boolean }> = {
  'ball-predict': { label: 'Ball prediction', unit: 'pts', color: '#22d3ee', higherBetter: true },
  'ball-track': { label: 'Smooth-pursuit tracking', unit: '%', color: '#a78bfa', higherBetter: true },
  'bolt': { label: 'BOLT (CO₂ tolerance)', unit: 's', color: '#34d399', higherBetter: true },
  'breath-hold': { label: 'Max breath-hold', unit: 's', color: '#fbbf24', higherBetter: true },
  // Detection threshold — LOWER is better (sees fainter targets).
  'contrast': { label: 'Contrast threshold', unit: '%', color: '#f472b6', higherBetter: false },
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
    const m: Record<MetricType, ProgressEntry[]> = { 'ball-predict': [], 'ball-track': [], 'bolt': [], 'breath-hold': [], 'contrast': [] };
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
//  PAGE
// ════════════════════════════════════════════════════════════════════════

type LabTab = 'ball' | 'field' | 'perceptual' | 'breathing' | 'progress';

export default function NeuroVisionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const email = session?.user?.email ?? null;
  const isDirector = isC3HDirector(email);

  const [tab, setTab] = useState<LabTab>('ball');
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
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
          const data = snap.data() as { entries?: ProgressEntry[] };
          setEntries(Array.isArray(data.entries) ? data.entries : []);
        }
      } catch {
        /* first-load read failure is non-fatal — start empty */
      }
    })();
    return () => { cancelled = true; };
  }, [email, isDirector]);

  const logEntry = useCallback(async (type: MetricType, value: number) => {
    if (!email) return;
    const entry: ProgressEntry = { type, value, at: new Date().toISOString() };
    const next = [...entries, entry].slice(-200); // cap history
    setEntries(next);
    try {
      await firebaseAuthReady();
      await setDoc(doc(db, 'neurovision_progress', safeKey(email)), {
        email,
        updatedAt: new Date().toISOString(),
        entries: next,
      });
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [email, entries]);

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
          {tab === 'breathing' && <BreathingPacer onLog={logEntry} />}
          {tab === 'progress' && <ProgressPanel entries={entries} />}
        </div>
      </section>
    </div>
  );
}
