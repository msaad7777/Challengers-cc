"use client";

import { useState } from 'react';
import { CTR_TARGET, buildAdsInsights, type Insight } from '@/lib/ads-insights';
import type { AdsReport } from '@/lib/ads-report';
import { StatusPill } from '@/app/c3h/lib/Kpi';

function State({ insight }: { insight: Insight }) {
  if (insight.state === 'unknown') {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full border border-white/20 px-2 py-0.5 text-[11px] font-semibold text-gray-300">
        Too early to tell
      </span>
    );
  }
  // Only the click rate has a target to be on track against.
  const label = insight.state === 'good' && insight.key !== 'ctr' ? 'Looks fine' : undefined;
  return <StatusPill status={insight.state} label={label} />;
}

function Card({ insight, hero }: { insight: Insight; hero?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4 flex flex-col gap-1.5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-gray-400">{insight.label}</span>
        <State insight={insight} />
      </div>
      <div className={`${hero ? 'text-5xl' : 'text-3xl'} font-bold text-white tabular-nums`}>{insight.value}</div>
      <p className="text-sm text-gray-300">{insight.meaning}</p>
      <p className="text-sm text-gray-400"><span className="text-gray-500">Next: </span>{insight.action}</p>
    </div>
  );
}

// The 5% line sits a fixed share along the bar, so rates above 10% fill it.
function CtrGauge({ ctr }: { ctr: number }) {
  const scale = CTR_TARGET * 2;
  return (
    <div className="relative h-2 rounded-full bg-white/10 mt-2" role="meter" aria-label="Click rate against the 5% requirement"
      aria-valuemin={0} aria-valuemax={scale * 100} aria-valuenow={Math.min(ctr, scale) * 100}>
      <div className="h-full rounded-full bg-white/60" style={{ width: `${Math.min(100, (ctr / scale) * 100)}%` }} />
      <div className="absolute top-[-3px] bottom-[-3px] left-1/2 w-px bg-white" aria-hidden />
    </div>
  );
}

export default function AdsScorecard({ report }: { report: AdsReport }) {
  const insights = buildAdsInsights(report);
  const [copied, setCopied] = useState<'done' | 'failed' | null>(null);

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(insights.sponsorBrief ?? '');
      setCopied('done');
    } catch {
      setCopied('failed');
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="glass rounded-2xl p-5 border border-white/10">
        <h2 className="font-semibold text-white mb-2">In short</h2>
        <ul className="space-y-1 text-sm text-gray-300">
          {insights.summary.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </div>

      <div className="grid md:grid-cols-[1fr_2fr] gap-3">
        <div>
          <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-2">The result</h2>
          <Card hero insight={insights.lag} />
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-2">What drives it</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {insights.leads.map((lead) => (
              <div key={lead.key} className="flex flex-col gap-2 min-w-0">
                <Card insight={lead} />
                {lead.key === 'ctr' && report.totals.impressions >= 100 && <CtrGauge ctr={report.totals.ctr} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 border border-white/10">
        <h2 className="font-semibold text-white mb-1">Which campaign next?</h2>
        <p className="text-sm text-gray-300">{insights.decision.text}</p>
        {insights.decision.confidence && (
          <p className="text-xs text-gray-400 mt-1">Confidence: {insights.decision.confidence}, based on the click count.</p>
        )}
      </div>

      <details className="glass rounded-2xl p-5 border border-white/10">
        <summary className="font-semibold text-white cursor-pointer">Check these numbers</summary>
        <ul className="mt-3 space-y-1 text-sm text-gray-300">
          {insights.checks.map((c) => <li key={c.label}><span className="text-gray-400">{c.label}: </span>{c.working}</li>)}
        </ul>
        <h3 className="text-sm font-semibold text-white mt-4 mb-1">Not in this report</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-400">
          {insights.notReported.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </details>

      <div className="glass rounded-2xl p-5 border border-white/10">
        <h2 className="font-semibold text-white mb-1">Sponsor update</h2>
        {insights.sponsorBrief ? (
          <>
            <p className="text-xs text-gray-400 mb-2">Leaves out spending. Nothing is sent. Read it through before you share it.</p>
            <p className="text-sm text-gray-200 rounded-xl border border-white/10 bg-black/30 p-3">{insights.sponsorBrief}</p>
            <button type="button" onClick={copyBrief}
              className="mt-3 px-4 py-2 rounded-lg border border-white/20 text-sm text-white hover:bg-white/10 transition-all">
              {copied === 'done' ? 'Copied' : 'Copy text'}
            </button>
            {copied === 'failed' && <p className="text-xs text-red-300 mt-2">Could not copy. Select the text instead.</p>}
          </>
        ) : (
          <p className="text-sm text-gray-400">Not ready. The ads need to be shown at least 100 times before these numbers are worth sharing.</p>
        )}
      </div>
    </div>
  );
}
