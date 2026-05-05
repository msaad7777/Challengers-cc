"use client";

import { useEffect, useRef, useState } from 'react';

export type SignatureResult = {
  type: 'typed' | 'drawn';
  data: string;
};

type Props = {
  signerName: string;
  onSubmit: (result: SignatureResult) => void;
  onCancel: () => void;
  busy?: boolean;
};

export default function SignaturePad({ signerName, onSubmit, onCancel, busy }: Props) {
  const [tab, setTab] = useState<'type' | 'draw'>('type');
  const [typed, setTyped] = useState(signerName || '');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  // ── Canvas setup: high-DPI, white-on-dark stroke ────────────────
  useEffect(() => {
    if (tab !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ffffff';
  }, [tab]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    const last = lastPointRef.current;
    if (!ctx || !last) return;
    const p = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPointRef.current = p;
    if (!hasDrawn) setHasDrawn(true);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmit = () => {
    if (tab === 'type') {
      const trimmed = typed.trim();
      if (trimmed.length < 2) return;
      onSubmit({ type: 'typed', data: trimmed });
    } else {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      const dataUrl = canvas.toDataURL('image/png');
      onSubmit({ type: 'drawn', data: dataUrl });
    }
  };

  const canSubmit = tab === 'type' ? typed.trim().length >= 2 : hasDrawn;

  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-4">
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setTab('type')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'type'
              ? 'bg-primary-500 text-black'
              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          Type signature
        </button>
        <button
          type="button"
          onClick={() => setTab('draw')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'draw'
              ? 'bg-primary-500 text-black'
              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          Draw signature
        </button>
      </div>

      {tab === 'type' ? (
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Type your full legal name. By submitting, you adopt this typed text as your electronic signature.
          </label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Mohammed Saad"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            autoFocus
          />
          {typed.trim().length >= 2 && (
            <div
              className="mt-3 px-4 py-6 rounded-lg bg-white/5 border border-white/10 text-center"
              style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '2rem', color: '#fff' }}
            >
              {typed.trim()}
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Draw your signature with mouse, trackpad, or finger. Sign as you would on paper.
          </label>
          <div className="relative rounded-lg bg-black border border-white/10 overflow-hidden" style={{ height: 180 }}>
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-full h-full touch-none cursor-crosshair"
            />
            {!hasDrawn && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                Sign here
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={clearCanvas}
            className="mt-2 text-xs text-gray-400 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || busy}
          className="px-5 py-2 rounded-lg bg-primary-500 text-black font-semibold hover:bg-primary-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? 'Signing…' : 'Sign & submit'}
        </button>
      </div>
    </div>
  );
}
