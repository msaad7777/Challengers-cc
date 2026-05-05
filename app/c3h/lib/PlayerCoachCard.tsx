"use client";

// Per-player, per-match coach analysis card.
// Auto-extracts the named player's performance (batting / bowling /
// fielding) from the match document, then runs the rule-based coach
// rules in playerAnalysis.ts to produce strengths, improvements, a
// "how you should have played" paragraph, and recommended drills.
//
// Pure presentation — all logic in playerAnalysis.ts.

import { useState } from 'react';
import type { Match } from '../scorer/types';
import {
  extractPlayerInMatch,
  generateCoachFeedback,
  teamRatesForPlayer,
} from './playerAnalysis';

export default function PlayerCoachCard({
  match,
  playerName,
  defaultOpen = false,
}: {
  match: Match;
  playerName: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const perf = extractPlayerInMatch(playerName, match);
  if (!perf) return null;

  const { battingTeamSr, bowlingTeamEcon } = teamRatesForPlayer(playerName, match);
  const fb = generateCoachFeedback(perf, battingTeamSr, bowlingTeamEcon);
  const { batting: bat, bowling: bowl, fielding: field } = perf;

  return (
    <div className="glass rounded-xl border border-accent-500/30 bg-accent-500/5 mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 p-4 text-left hover:bg-accent-500/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <div>
            <p className="text-accent-400 text-xs uppercase tracking-wider font-bold">
              Your performance · {playerName}
            </p>
            <p className="text-gray-300 text-sm mt-0.5">{fb.summary}</p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 flex-shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-accent-500/20 pt-4">
          {/* Stat lines */}
          <div className="grid sm:grid-cols-3 gap-2">
            {bat.played && (
              <div className="rounded-lg p-3 bg-black/20 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-primary-400 font-bold">🏏 Batting</p>
                <p className="text-white font-bold text-base mt-1 tabular-nums">
                  {bat.runs}{bat.isOut ? '' : '*'} ({bat.balls})
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 tabular-nums">
                  SR {bat.sr.toFixed(1)} · 4×{bat.fours} · 6×{bat.sixes} · pos {bat.position}
                </p>
                {bat.howOut && (
                  <p className="text-[10px] text-red-400 mt-1">{bat.howOut}</p>
                )}
              </div>
            )}
            {bowl.bowled && (
              <div className="rounded-lg p-3 bg-black/20 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-red-400 font-bold">🎯 Bowling</p>
                <p className="text-white font-bold text-base mt-1 tabular-nums">
                  {bowl.wickets}/{bowl.runs}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 tabular-nums">
                  {bowl.oversDisplay} ov · econ {bowl.economy.toFixed(2)} · {bowl.dots} dots{bowl.maidens > 0 ? ` · ${bowl.maidens}M` : ''}
                </p>
              </div>
            )}
            {(field.catches + field.stumpings + field.runOuts) > 0 && (
              <div className="rounded-lg p-3 bg-black/20 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">🧤 Fielding</p>
                <p className="text-white font-bold text-base mt-1 tabular-nums">
                  {field.catches + field.stumpings + field.runOuts}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {field.catches > 0 && `${field.catches}c `}
                  {field.stumpings > 0 && `${field.stumpings}st `}
                  {field.runOuts > 0 && `${field.runOuts}ro`}
                </p>
              </div>
            )}
          </div>

          {/* Coach feedback */}
          {fb.strengths.length > 0 && (
            <div>
              <p className="text-primary-400 text-[10px] uppercase tracking-wider font-bold mb-2">✓ What went right</p>
              <ul className="space-y-1.5">
                {fb.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-primary-400 flex-shrink-0">→</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fb.improvements.length > 0 && (
            <div>
              <p className="text-red-400 text-[10px] uppercase tracking-wider font-bold mb-2">⚠️ What to work on</p>
              <ul className="space-y-1.5">
                {fb.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-red-400 flex-shrink-0">→</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fb.howShouldHavePlayed && (
            <div className="rounded-lg p-4 border border-accent-500/30 bg-gradient-to-r from-accent-500/5 to-transparent">
              <p className="text-accent-400 text-[10px] uppercase tracking-wider font-bold mb-2">🎯 How you should have played</p>
              <p className="text-sm text-gray-200 leading-relaxed">{fb.howShouldHavePlayed}</p>
            </div>
          )}

          {fb.drills.length > 0 && (
            <div>
              <p className="text-blue-400 text-[10px] uppercase tracking-wider font-bold mb-2">🏋️ Drills for next session</p>
              <ul className="space-y-1.5">
                {fb.drills.map((d, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-blue-400 flex-shrink-0">→</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[10px] text-gray-600 italic pt-2">
            Auto-generated from match data. Not a substitute for your captain or coach&apos;s view — use it as a starting point for your own reflection.
          </p>
        </div>
      )}
    </div>
  );
}
