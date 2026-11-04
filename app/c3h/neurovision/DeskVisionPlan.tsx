'use client';

// The Monday-to-Friday vision plan shown in the NeuroVision Lab "Desk Plan" tab.
// All content and its source credits live in app/c3h/lib/deskVision.ts.

import { useState } from 'react';
import Link from 'next/link';
import {
  COMBINED_DRILL_NAME,
  COMBINED_DRILL_WHY,
  COMBINED_MATCH_RULE,
  COMBINED_VERSIONS,
  DESK_SAFETY,
  DESK_WEEK,
  EVIDENCE_LIMITS,
  INDOOR_CUES,
  INDOOR_SWAP,
  JULIAN_WOOD_LESSONS,
  MATCH_DAY_CUES,
  SCREEN_BREAK_NOTE,
  VISION_SOURCES,
  combinedMinutes,
  dayMinutes,
  deskDrillById,
  sourceById,
  sourceUrl,
  weekdayFromIndex,
  type DeskDrill,
  type Weekday,
  type WarmupCue,
} from '../lib/deskVision';

function DrillCard({ drill }: { drill: DeskDrill }) {
  return (
    <div className="rounded-lg p-4 border border-white/10 bg-black/20">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <p className="text-white font-medium text-sm">{drill.name}</p>
        <p className="text-xs text-gray-400">{drill.minutes} min · {drill.equipment}</p>
      </div>
      <ol className="text-sm text-gray-300 list-decimal list-outside ml-4 mt-2 space-y-1">
        {drill.steps.map((s) => <li key={s}>{s}</li>)}
      </ol>
      <p className="text-xs text-cyan-300 mt-2">🏏 {drill.cricket}</p>
      {drill.id === 'pause-predict' && (
        <Link href="/c3h/replays" className="text-xs text-cyan-400 underline hover:text-cyan-300 mt-1 inline-block">Open our match replays</Link>
      )}
      {drill.adaptation && <p className="text-xs text-amber-200/90 mt-2"><strong>Adapted:</strong> {drill.adaptation}</p>}
      <p className="text-[11px] text-gray-500 mt-2">
        Source:{' '}
        {drill.sources.map((ref, i) => {
          const source = sourceById(ref.id);
          const url = sourceUrl(source, ref.atSeconds);
          return (
            <span key={ref.id}>
              {i > 0 && ' · '}
              {url
                ? <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-300">{source.title} ↗</a>
                : source.title}
            </span>
          );
        })}
      </p>
    </div>
  );
}

function CueList({ title, time, cues }: { title: string; time: string; cues: WarmupCue[] }) {
  return (
    <div className="rounded-lg p-4 border border-white/10 bg-white/3">
      <p className="text-white font-medium text-sm">{title}</p>
      <p className="text-xs text-gray-400 mb-2">{time}</p>
      <ul className="text-sm text-gray-300 space-y-1.5 list-disc list-outside ml-4">
        {cues.map((c) => <li key={c.text}>{c.text}</li>)}
      </ul>
    </div>
  );
}

export default function DeskVisionPlan() {
  const [day, setDay] = useState<Weekday>(() => weekdayFromIndex(new Date().getDay()) ?? 'mon');
  const [showSources, setShowSources] = useState(false);
  const plan = DESK_WEEK.find((d) => d.day === day) ?? DESK_WEEK[0];
  const today = weekdayFromIndex(new Date().getDay());
  const home = COMBINED_VERSIONS[0];

  return (
    <div className="space-y-6">
      {/* Plan */}
      <div className="rounded-2xl p-6 border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-transparent">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <span className="text-2xl">💻</span>
          Desk Plan: Monday to Friday
        </h3>
        <p className="text-sm text-gray-300 mb-2">
          For players working from home who only get matches and one indoor session. Two short blocks a day, little or no kit, about 5–10 minutes in all, or up to 15 on swing days.
        </p>
        <p className="text-xs text-gray-400 mb-4">{SCREEN_BREAK_NOTE}</p>

        <div className="flex gap-2 flex-wrap mb-4" role="group" aria-label="Choose a day">
          {DESK_WEEK.map((d) => (
            <button
              key={d.day}
              onClick={() => setDay(d.day)}
              aria-pressed={day === d.day}
              className={`px-3 py-1.5 rounded-md text-sm border ${day === d.day ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
            >
              {d.label.slice(0, 3)}{today === d.day ? ' · today' : ''}
            </button>
          ))}
        </div>

        <p className="text-white font-semibold text-sm">
          {plan.label}: {plan.focus} <span className="text-gray-400 font-normal">· {dayMinutes(plan) + (plan.combined ? combinedMinutes(home) : 0)} min</span>
        </p>
        {plan.note && <p className="text-xs text-amber-200/90 mt-1">{plan.note}</p>}

        <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mt-4 mb-2">Before you log on</p>
        <div className="space-y-2">{plan.morning.map((id) => <DrillCard key={id} drill={deskDrillById(id)} />)}</div>

        <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mt-4 mb-2">On a work break</p>
        <div className="space-y-2">{plan.breakTime.map((id) => <DrillCard key={id} drill={deskDrillById(id)} />)}</div>

        {plan.combined && (
          <p className="text-sm text-gray-200 mt-4 rounded-md bg-cyan-500/10 border-l-2 border-cyan-500/60 px-3 py-2">
            <strong className="text-cyan-300">Lunch:</strong> run the home version of &ldquo;{COMBINED_DRILL_NAME}&rdquo; below ({combinedMinutes(home)} min). Skip its &ldquo;Eyes on&rdquo; step if you did it this morning. Save the swings for another day if you play within 48 hours.
          </p>
        )}

        <p className="text-sm text-gray-200 mt-4">{INDOOR_SWAP}</p>
      </div>

      {/* Safety */}
      <div className="rounded-md bg-red-500/10 border-l-2 border-red-500/60 px-4 py-3 text-sm text-red-100">
        <strong>Stop if it hurts.</strong> {DESK_SAFETY}
      </div>

      {/* Warm-up cues */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><span className="text-2xl">🔥</span>Warm-up cues</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <CueList title="Indoor session" time="About 3 minutes, before you pad up" cues={INDOOR_CUES} />
          <CueList title="Match day" time="About 3 minutes, before you walk out" cues={MATCH_DAY_CUES} />
        </div>
      </div>

      {/* Combined drill */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h4 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><span className="text-2xl">💥</span>Combined drill: {COMBINED_DRILL_NAME}</h4>
        <p className="text-sm text-gray-300 mb-4">{COMBINED_DRILL_WHY}</p>
        <div className="grid md:grid-cols-2 gap-3">
          {COMBINED_VERSIONS.map((v) => (
            <div key={v.id} className="rounded-lg p-4 border border-white/10 bg-white/3">
              <p className="text-white font-medium text-sm">{v.name} · {combinedMinutes(v)} min</p>
              <p className="text-xs text-gray-400">{v.where}</p>
              <p className="text-xs text-gray-400 mt-1 mb-3"><strong>Kit:</strong> {v.equipment}</p>
              <ol className="space-y-3">
                {v.steps.map((s, i) => (
                  <li key={s.name} className="text-sm text-gray-300">
                    <p><strong className="text-cyan-300">{i + 1}. {s.name}</strong> <span className="text-xs text-gray-400">({s.minutes} min)</span></p>
                    <p className="mt-0.5">{s.what}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{s.origin}</p>
                  </li>
                ))}
              </ol>
              <p className="text-xs text-amber-200/90 mt-3">{v.limit}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-200 mt-3 rounded-md bg-red-500/10 border-l-2 border-red-500/60 px-3 py-2">
          <strong className="text-red-300">Match week:</strong> {COMBINED_MATCH_RULE} Stop for the day if your elbow, wrist, shoulder or back complains.
        </p>

        <div className="mt-4 rounded-lg p-4 border border-dashed border-white/20">
          <p className="text-white font-medium text-sm">Julian Wood power-hitting lessons</p>
          {JULIAN_WOOD_LESSONS.length === 0 ? (
            <p className="text-sm text-gray-400 mt-1">Still to come. Apart from the colour ball drill credited above, nothing here is from these lessons yet.</p>
          ) : (
            <ul className="text-sm text-gray-300 mt-2 space-y-2">
              {JULIAN_WOOD_LESSONS.map((l) => (
                <li key={l.id}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">{l.title} ↗</a>
                  <p>{l.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Evidence limits: open by default so nobody has to go looking for them */}
      <div className="rounded-2xl p-6 border border-amber-500/40 bg-amber-500/5">
        <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><span className="text-2xl">⚖️</span>What we do and don&apos;t know</h4>
        <ul className="text-sm text-gray-300 space-y-2 list-disc list-outside ml-4">
          {EVIDENCE_LIMITS.map((e) => <li key={e}>{e}</li>)}
        </ul>
      </div>

      {/* Sources */}
      <div className="rounded-2xl border border-white/10 bg-white/3">
        <button onClick={() => setShowSources((s) => !s)} aria-expanded={showSources} className="w-full flex items-center justify-between px-4 py-3 text-left">
          <span className="text-sm font-semibold text-white">Sources and credits</span>
          <span className="text-gray-400 text-xs">{showSources ? 'hide' : 'show'}</span>
        </button>
        {showSources && (
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-400 mb-3">
              All videos are from the Shah Neurovision channel. We worked from their automatic captions, without watching the footage, so check a video if a step seems unclear. Summaries are in our own words.
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              {VISION_SOURCES.map((s) => {
                const url = sourceUrl(s);
                return (
                  <li key={s.id}>
                    {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">{s.title} ↗</a> : <span className="text-white">{s.title}</span>}
                    <p className="text-xs text-gray-400">{s.sport}. {s.used}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
