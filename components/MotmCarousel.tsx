'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryItem } from '@/app/blog/data';

/**
 * Sliding banner for a set of photos that do NOT share an aspect ratio.
 *
 * The MOTM presentation shots range from 1600x739 (five players, ultra-wide)
 * to 900x1600 (portrait), so a fixed-ratio frame with object-cover would
 * decapitate somebody in half the set. Instead every photo is fitted WHOLE
 * inside one consistent branded frame (object-contain over a dark ground,
 * with the image itself blurred behind it to fill the letterbox). Nothing is
 * cropped, and the set still reads as one designed system.
 */
export default function MotmCarousel({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = items.length;

  const go = useCallback((n: number) => setIndex((n + count) % count), [count]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Auto-advance, unless paused (hover/focus) or the visitor prefers less motion.
  useEffect(() => {
    if (paused || count < 2) return;
    if (typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(next, 5000);
    return () => clearTimeout(t);
  }, [index, paused, next, count]);

  if (count === 0) return null;
  const active = items[index];

  return (
    <section
      className="glass rounded-2xl overflow-hidden mb-8"
      aria-roledescription="carousel"
      aria-label="Man of the Match winners, T30 2026"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="px-6 pt-6 pb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-white font-bold text-lg">Man of the Match — T30 2026</h3>
        <span className="text-gray-500 text-xs font-semibold tracking-wide uppercase">
          {count} moments
        </span>
      </div>

      <div
        className="relative bg-black/60 select-none"
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 45) (dx < 0 ? next : prev)();
          touchX.current = null;
        }}
      >
        {/* Fixed frame. Blurred copy fills the letterbox so wide and tall
            photos both sit in a full-bleed panel instead of black bars. */}
        <div className="relative w-full aspect-[16/10] overflow-hidden">
          <img
            src={active.src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
          />
          <img
            key={active.src}
            src={active.src}
            alt={`${active.name} receiving the Man of the Match award`}
            className="relative w-full h-full object-contain animate-fade-in"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 pointer-events-none">
            <p className="text-white font-bold text-xl sm:text-2xl drop-shadow">{active.name}</p>
            {active.caption && (
              <p className="text-gray-300 text-sm mt-0.5 drop-shadow">{active.caption}</p>
            )}
          </div>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-primary-500/70 border border-white/15 text-white grid place-content-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-primary-500/70 border border-white/15 text-white grid place-content-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              <span aria-hidden="true">›</span>
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 px-6 py-5">
          {items.map((it, i) => (
            <button
              key={it.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${it.name}`}
              aria-current={i === index}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                i === index
                  ? 'bg-primary-500/20 text-primary-300 border-primary-500/50'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-200'
              }`}
            >
              {it.short ?? it.name.split(' ')[0]}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
