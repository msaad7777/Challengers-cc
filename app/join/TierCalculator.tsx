'use client';

import { useState } from 'react';

/** Combined T30 fixtures across both leagues — the denominator for the tier rule. */
const T30_FIXTURES = 26;
/** At or above this share of T30 fixtures, a member is full season. */
const FULL_SEASON_THRESHOLD = 0.5;

export default function TierCalculator() {
  const [games, setGames] = useState(13);

  const pct = Math.round((games / T30_FIXTURES) * 100);
  const isFull = games / T30_FIXTURES >= FULL_SEASON_THRESHOLD;
  const fee = isFull ? 300 : 150;

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <h3 className="text-xl font-bold text-white">Which tier are you?</h3>
      <p className="text-gray-400 text-sm mt-1">
        The 2027 T30 season is <span className="text-white font-semibold">{T30_FIXTURES} matches</span> across
        both leagues. Your tier depends only on how many of them you can commit to.
      </p>

      <label htmlFor="games" className="block mt-6 text-sm font-semibold text-gray-300">
        Matches you can realistically make
      </label>
      <input
        id="games"
        type="range"
        min={0}
        max={T30_FIXTURES}
        value={games}
        onChange={(e) => setGames(Number(e.target.value))}
        className="w-full mt-3 accent-primary-500 cursor-pointer"
        aria-describedby="tier-result"
      />
      <div className="flex justify-between text-[11px] text-gray-500 font-mono mt-1">
        <span>0</span><span>13 · 50%</span><span>{T30_FIXTURES}</span>
      </div>

      <div
        id="tier-result"
        aria-live="polite"
        className={`mt-6 rounded-xl border p-5 transition-colors ${
          isFull
            ? 'bg-primary-500/10 border-primary-500/40'
            : 'bg-white/5 border-white/15'
        }`}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-bold text-white tabular-nums">{games}</span>
          <span className="text-gray-400 text-sm">of {T30_FIXTURES} matches · {pct}%</span>
        </div>
        <p className={`mt-2 text-lg font-bold ${isFull ? 'text-primary-400' : 'text-gray-200'}`}>
          {isFull ? 'Full Season' : 'Part Season'} — ${fee}
        </p>
        <p className="text-gray-400 text-sm mt-1">
          {isFull
            ? '$150 on registration, $150 in March 2027. Priority consideration, and selection managed so you reach playoff eligibility.'
            : '$150 on registration, nothing further. Full access to nets, the coaching hub and the members portal.'}
        </p>
        {games > 0 && games < 13 && (
          <p className="text-accent-400/90 text-xs mt-3">
            Note: below 50% you are unlikely to reach the league playoff thresholds
            (8 of 14 in LCL, 5 of 12 in LPL), so part-season members are not usually
            available for knockout matches.
          </p>
        )}
        {games === 0 && (
          <p className="text-accent-400/90 text-xs mt-3">
            If you cannot commit to any matches, talk to us before registering — we would
            rather find the right arrangement than take a fee you get nothing from.
          </p>
        )}
      </div>

      <p className="text-gray-500 text-xs mt-4">
        Playing one league in full is 14 of 26 — that is 54%, so it counts as Full Season.
      </p>
    </div>
  );
}
