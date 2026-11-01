"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { isC3HAdmin } from '@/lib/c3h-access';
import { GRANT_MONTHLY_USD, type AdsReport } from '@/lib/ads-report';
import { Kpi, Meter, fmt } from '@/app/c3h/lib/Kpi';
import Navbar from '@/components/Navbar';

type Response =
  | { configured: false }
  | ({ configured: true; controlsUrl: string | null; error?: undefined } & AdsReport)
  | { configured: true; error: string };

const ADS_URL = 'https://ads.google.com/aw/campaigns?ocid=822-016-7403';
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const usd = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AdsDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<Response | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  useEffect(() => {
    if (!isC3HAdmin(session?.user?.email)) return;
    fetch('/api/ads-report')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ configured: true, error: 'Could not reach the server' }));
  }, [session?.user?.email]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary-400 text-xl">Loading…</div>
      </div>
    );
  }
  if (!session) return null;
  if (!isC3HAdmin(session.user?.email)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
        <Navbar />
        <div className="pt-32 px-6 max-w-xl mx-auto text-center">
          <div className="glass rounded-2xl p-8 border border-white/10">
            <div className="text-3xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin only</h1>
            <p className="text-sm text-gray-400">The Google Ads dashboard is restricted to Club admins.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />
      <div className="pt-28 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Google Ads</h1>
            <p className="text-sm text-gray-400">
              Ad Grants account 822-016-7403 · last 30 days
              {data && 'updated' in data && data.updated ? ` · updated ${data.updated}` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            {data && 'controlsUrl' in data && data.controlsUrl && (
              <a href={data.controlsUrl} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-primary-500 text-black font-semibold hover:bg-primary-400 transition-all">
                Pause / budget controls
              </a>
            )}
            <a href={ADS_URL} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all">
              Open Google Ads
            </a>
          </div>
        </div>

        {!data && <p className="text-gray-400">Loading report…</p>}

        {data && !data.configured && (
          <div className="glass rounded-2xl p-6 border border-white/10 text-gray-300 text-sm">
            Not connected yet. Set <code>ADS_REPORT_CSV_URL</code> in Vercel to the published CSV link of the
            sheet&apos;s Dashboard tab, then redeploy.
          </div>
        )}

        {data && data.configured && data.error && (
          <div className="rounded-2xl p-6 border border-red-500/40 bg-red-500/10 text-red-200 text-sm">
            Could not load the report: {data.error}
          </div>
        )}

        {data && 'totals' in data && (
          <>
            <div className="glass rounded-2xl p-5 border border-white/10 mb-4">
              <Meter label={'cost_mtd' in data.metrics ? 'Grant used this month' : 'Grant used (last 30 days)'}
                value={data.metrics.cost_mtd ?? data.totals.cost} max={GRANT_MONTHLY_USD} format={fmt.usd}
                note="Google Ad Grants allow up to $10,000 a month." />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Kpi hero label="Clicks" value={fmt.int(data.totals.clicks)} sub={`${fmt.int(data.totals.impressions)} impressions`} />
              <Kpi hero label="CTR" value={pct(data.totals.ctr)} sub="Google requires 5%+"
                status={data.totals.impressions >= 100 ? (data.totals.ctr < 0.05 ? 'bad' : 'good') : undefined}
                statusLabel={data.totals.impressions >= 100 && data.totals.ctr < 0.05 ? 'Below 5%' : undefined} />
              <Kpi hero label="Conversions" value={fmt.int(data.totals.conversions)}
                sub={`${data.totals.clicks ? pct(data.totals.conversions / data.totals.clicks) : '0.0%'} of clicks`} />
              <Kpi hero label="Grant spend" value={usd(data.totals.cost)} sub="last 30 days" />
            </div>

            {data.alerts.length > 0 && (
              <div className="rounded-2xl p-5 mb-6 border border-amber-500/40 bg-amber-500/10">
                <h2 className="font-semibold text-amber-200 mb-2">Needs attention</h2>
                <ul className="list-disc pl-5 space-y-1 text-sm text-amber-100">
                  {data.alerts.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </div>
            )}

            <div className="glass rounded-2xl border border-white/10 overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-400">
                  <tr>
                    {['Campaign', 'Status', 'Budget/day', 'Impr.', 'Clicks', 'CTR', 'Conv.', 'Spend', 'Yesterday'].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-white">
                  {data.campaigns.map((c) => (
                    <tr key={c.name} className="border-t border-white/10">
                      <td className="px-4 py-3">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className={c.status === 'ENABLED' ? 'text-green-400' : 'text-gray-400'}>
                          {c.status === 'ENABLED' ? 'Running' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{usd(c.dailyBudget)}</td>
                      <td className="px-4 py-3">{c.impressions.toLocaleString()}</td>
                      <td className="px-4 py-3">{c.clicks.toLocaleString()}</td>
                      <td className={`px-4 py-3 ${c.impressions >= 100 && c.ctr < 0.05 ? 'text-red-400' : ''}`}>{pct(c.ctr)}</td>
                      <td className="px-4 py-3">{c.conversions}</td>
                      <td className="px-4 py-3">{usd(c.cost)}</td>
                      <td className="px-4 py-3">{c.clicksYesterday} clicks</td>
                    </tr>
                  ))}
                  {data.campaigns.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-400">No campaigns yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {data.changes.length > 0 && (
              <div className="glass rounded-2xl p-5 border border-white/10">
                <h2 className="font-semibold text-white mb-2">Changes made in the last run</h2>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                  {data.changes.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
