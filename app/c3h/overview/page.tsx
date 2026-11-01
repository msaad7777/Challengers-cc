"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { isC3HAdmin, isC3HDashboardViewer } from '@/lib/c3h-access';
import { GRANT_DAILY_CAP_USD, GRANT_MONTHLY_USD, type AdsReport } from '@/lib/ads-report';
import { staleHours, type OutreachSummary } from '@/lib/outreach-summary';
import { Kpi, Meter, Panel, StatusPill, fmt, type Status } from '@/app/c3h/lib/Kpi';
import Navbar from '@/components/Navbar';

// Each source answers { configured: false } until its Vercel env vars are set.
type Source<T> = { configured: false } | ({ configured: true; error?: undefined } & T) | { configured: true; error: string };
type Ads = Source<AdsReport & { controlsUrl: string | null }>;
type Outreach = Source<OutreachSummary>;

const load = <T,>(url: string, set: (v: T) => void) =>
  fetch(url).then((r) => r.json()).then(set)
    .catch(() => set({ configured: true, error: 'Could not reach the server' } as T));

function NotReady({ data, what }: { data: Source<object> | null; what: string }) {
  if (!data) return <p className="text-sm text-gray-400">Loading…</p>;
  if (!data.configured) return <p className="text-sm text-gray-400">{what} is not connected yet.</p>;
  if ('error' in data && data.error) return <p className="text-sm text-red-300">Could not load {what.toLowerCase()}: {data.error}</p>;
  return null;
}

export default function OverviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const email = session?.user?.email;
  const [ads, setAds] = useState<Ads | null>(null);
  const [out, setOut] = useState<Outreach | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  useEffect(() => {
    if (!isC3HDashboardViewer(email)) return;
    load('/api/ads-report', setAds);
    load('/api/outreach-summary', setOut);
  }, [email]);

  if (status === 'loading') {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-primary-400 text-xl">Loading…</div></div>;
  }
  if (!session) return null;
  if (!isC3HDashboardViewer(email)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
        <Navbar />
        <div className="pt-32 px-6 max-w-xl mx-auto text-center">
          <div className="glass rounded-2xl p-8 border border-white/10">
            <div className="text-3xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-white mb-2">Directors only</h1>
            <p className="text-sm text-gray-400">The Club overview is for the Club&apos;s directors.</p>
          </div>
        </div>
      </div>
    );
  }

  const a = ads && 'totals' in ads ? ads : null;
  const o = out && 'sent' in out ? out : null;
  const m = a?.metrics ?? {};
  const has = (k: string) => k in m;

  // Ads
  const spentMonth = has('cost_mtd') ? m.cost_mtd : null;
  const convRate = a && a.totals.clicks ? a.totals.conversions / a.totals.clicks : 0;
  const ctrStatus: Status | undefined = a && a.totals.impressions >= 100 ? (a.totals.ctr < 0.05 ? 'bad' : 'good') : undefined;
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Players: counts the Ads script reads from the registration form's response sheet
  const playersTotal = has('players_registered_total') ? m.players_registered_total : null;
  const players30 = has('players_registered_30d') ? m.players_registered_30d : null;
  const adsSignups = has('conv_signup_30d') ? m.conv_signup_30d : null;

  // Outreach
  const noAnswerYet = o ? Math.max(0, o.sent.season - o.replies.total - o.bounces.season - o.optOuts.season) : 0;
  const replyRate = o && o.sent.season ? o.replies.total / o.sent.season : 0;
  const bounceStatus: Status | undefined = o ? (o.bounces.rate > 0.05 ? 'bad' : o.bounces.rate > 0.03 ? 'warn' : 'good') : undefined;
  const leadsByUrgency = o ? [...o.leads].sort((x, y) =>
    Number(/replied/.test(y.status)) - Number(/replied/.test(x.status))
    || (x.nextStepDate || '9').localeCompare(y.nextStepDate || '9')).slice(0, 6) : [];

  const awaiting = o?.awaiting ?? [];

  // Today's run (launchd, Mon–Fri 9:30). "Today" is the viewer's date.
  const todayLocal = new Date().toLocaleDateString('en-CA');
  const runDate = o ? o.lastRun.runDate ?? o.lastRun.reportDate : null;
  const ranToday = !!o && runDate === todayLocal;
  const sentToday = !o ? 0 : o.lastRun.reportDate === todayLocal ? o.lastRun.sent : o.today === todayLocal ? o.sent.today : 0;
  const nextRun = o?.schedule
    ? new Date(o.schedule.nextRun).toLocaleString('en-CA', { weekday: 'short', hour: 'numeric', minute: '2-digit' })
    : 'weekdays 9:30';
  const runState: [Status, string] = !o || o.lastRun.status === 'none' ? ['warn', 'No run yet']
    : o.lastRun.status === 'error' ? ['bad', 'Had a problem']
    : o.lastRun.status === 'skipped' ? ['good', 'Nothing to send'] : ['good', 'Completed'];

  const attention = [
    ...(a?.alerts ?? []),
    ...(o?.alerts ?? []).filter((t) => !/waiting for a personal answer/.test(t)),   // shown in the reply list
    ...(o && staleHours(o) > 30 ? [`The outreach summary is ${(staleHours(o) / 24).toFixed(1)} days old: the club Mac may have missed a run.`] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />
      <div className="pt-28 pb-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary-400 mb-1">Directors&apos; briefing</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Club overview</h1>
            <p className="text-sm text-gray-400 mt-1">
              Google Ad Grants, player sign-ups and sponsor outreach in one place.
              {a?.updated ? ` Ads updated ${a.updated}.` : ''}
              {o ? ` Outreach updated ${new Date(o.generated).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' })}`.replace(/\.?$/, '.') : ''}
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <a href="/c3h/ads" className="px-3 py-2 rounded-lg border border-white/15 text-gray-200 hover:bg-white/10">Ads detail</a>
            <a href="/c3h/outreach" className="px-3 py-2 rounded-lg border border-white/15 text-gray-200 hover:bg-white/10">Outreach detail</a>
          </div>
        </header>

        {/* Headline numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi hero label="Grant spent this month"
            value={spentMonth !== null ? fmt.usd(spentMonth) : a ? fmt.usd(a.totals.cost) : '—'}
            sub={spentMonth !== null ? `of ${fmt.usd(GRANT_MONTHLY_USD)} available` : a ? 'last 30 days' : 'Ads not connected'} />
          <Kpi hero label="People reached" value={a ? fmt.int(a.totals.impressions) : '—'} sub="ad views, last 30 days" />
          <Kpi hero label="New players" value={playersTotal !== null ? fmt.int(playersTotal) : '—'}
            sub={playersTotal !== null ? `registered for 2027${players30 !== null ? ` · ${fmt.int(players30)} in 30 days` : ''}` : 'count not connected yet'} />
          <Kpi hero label="Sponsors who replied" value={o ? fmt.int(o.replies.total) : '—'}
            sub={o ? `of ${fmt.int(o.sent.season)} businesses emailed` : 'outreach not connected'}
            status={o && o.replies.waiting ? 'warn' : undefined}
            statusLabel={o && o.replies.waiting ? `${o.replies.waiting} to answer` : undefined} />
        </div>

        {/* Replies waiting for a personal answer: the first thing to act on */}
        {o && (
          <section className={`rounded-2xl p-5 sm:p-6 border ${awaiting.length ? 'border-amber-500/50 bg-amber-500/[0.07]' : 'border-white/10 bg-white/[0.03]'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-lg font-bold text-white">
                {awaiting.length ? `Reply to ${awaiting.length === 1 ? 'this business' : `these ${awaiting.length} businesses`}` : 'No sponsor replies waiting'}
              </h2>
              <StatusPill status={awaiting.length ? 'warn' : 'good'} label={awaiting.length ? 'Answer personally' : 'All answered'} />
            </div>
            {awaiting.length > 0 && (
              <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-black/30">
                {awaiting.map((r) => (
                  <li key={r.name} className="px-4 py-3 grid gap-1 sm:grid-cols-[1fr_auto] sm:items-baseline">
                    <div>
                      <span className="text-white font-semibold">{r.name}</span>
                      <span className="text-gray-400 text-sm"> · {r.mailbox.includes('@') ? `came in to ${r.mailbox}` : r.mailbox}</span>
                      <div className="text-xs text-gray-400">{r.nextStep.replace(/_/g, ' ') || 'Reply personally'}</div>
                    </div>
                    <div className="text-sm sm:text-right whitespace-nowrap">
                      <span className="text-gray-300">{fmt.date(r.received)}</span>
                      {r.waitingDays !== null && (
                        <span className={r.waitingDays >= 2 ? 'text-red-300 font-semibold' : 'text-amber-200'}>
                          {' · '}{r.waitingDays === 0 ? 'today' : `waiting ${r.waitingDays} day${r.waitingDays === 1 ? '' : 's'}`}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-gray-400 mt-3">
              {o.tracking
                ? <>Tracked automatically: replies to {o.tracking.checked.join(', ')}.
                    {o.tracking.notChecked.length > 0 && <> <span className="text-amber-200">Not included: replies to {o.tracking.notChecked.join(', ')}. Check that inbox yourself.</span></>}</>
                : 'Mailbox coverage unknown: the summary on the club Mac is older than this page.'}
              {' '}Open the email in that inbox to reply; addresses and messages are never shown here.
            </p>
          </section>
        )}

        {/* Today's outreach run: refreshed by the Mac right after each 9:30 run */}
        {o && (
          <section>
            <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-2">Today&apos;s outreach run</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Kpi label="Sent today" value={ranToday ? fmt.int(sentToday) : 'No run today'}
                sub={ranToday ? `${fmt.date(todayLocal)} run${o.lastRun.failed ? ` · ${o.lastRun.failed} failed` : ''}` : `next: ${nextRun}`} />
              <Kpi label="Last run"
                value={runDate ? `${fmt.date(runDate)}${o.lastRun.startedAt ? ` ${o.lastRun.startedAt}` : ''}` : '—'}
                sub={runDate ? `automatic, ${o.schedule?.label ?? 'Mon–Fri 9:30'}` : `first run: ${nextRun}`}
                status={runState[0]} statusLabel={runState[1]} />
              <Kpi label="Businesses left to reach" value={o.contactsLeft ? fmt.int(o.contactsLeft.contacts) : '—'}
                sub={o.contactsLeft ? `about ${Math.ceil(o.contactsLeft.contacts / 100)} sending days` : 'unknown'}
                status={o.contactsLeft && o.contactsLeft.contacts < 300 ? 'warn' : undefined} />
            </div>
          </section>
        )}

        {attention.length > 0 && (
          <div className="rounded-2xl p-5 border border-amber-500/40 bg-amber-500/10">
            <div className="flex items-center gap-2 mb-2"><StatusPill status="warn" label="Needs attention" /></div>
            <ul className="list-disc pl-5 space-y-1 text-sm text-amber-100">
              {attention.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Google Ad Grants */}
          <Panel icon="📈" title="Google Ad Grants" subtitle="Free search ads from Google for non-profits · last 30 days"
            action={isC3HAdmin(email) && a?.controlsUrl ? <a href={a.controlsUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg bg-primary-500 text-black font-semibold">Controls</a> : undefined}>
            <NotReady data={ads} what="Google Ads" />
            {a && (
              <div className="space-y-5">
                <Meter label={spentMonth !== null ? 'Grant used this month' : 'Grant used (last 30 days)'}
                  value={spentMonth ?? a.totals.cost} max={GRANT_MONTHLY_USD} format={fmt.usd}
                  note={`Google allows up to ${fmt.usd(GRANT_MONTHLY_USD)} a month (about ${fmt.usd(GRANT_DAILY_CAP_USD)} a day)${spentMonth !== null ? ` · day ${now.getDate()} of ${daysInMonth}` : ''}.`} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Kpi label="Impressions" value={fmt.int(a.totals.impressions)} />
                  <Kpi label="Clicks" value={fmt.int(a.totals.clicks)} />
                  <Kpi label="Click rate" value={fmt.pct(a.totals.ctr)} status={ctrStatus}
                    statusLabel={ctrStatus === 'bad' ? 'Below 5%' : undefined} sub="Google requires 5%+" />
                  <Kpi label="Conversions" value={fmt.int(a.totals.conversions)} sub="sign-ups, contacts, sponsor forms" />
                  <Kpi label="Conversion rate" value={fmt.pct(convRate)} sub="conversions per click" />
                  <Kpi label="Registrations from ads" value={adsSignups !== null ? fmt.int(adsSignups) : '—'}
                    sub={adsSignups !== null ? 'sign-up conversions' : 'not split out yet'} />
                </div>
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="text-left text-gray-400 text-xs uppercase tracking-wide">
                      <tr>{['Campaign', 'Clicks', 'CTR', 'Conv.', 'Spend'].map((h) => <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>)}</tr>
                    </thead>
                    <tbody className="text-white">
                      {a.campaigns.map((c) => (
                        <tr key={c.name} className="border-t border-white/10">
                          <td className="px-3 py-2">
                            <div>{c.name}</div>
                            <StatusPill status={c.status === 'ENABLED' ? 'good' : 'warn'} label={c.status === 'ENABLED' ? 'Running' : 'Paused'} />
                          </td>
                          <td className="px-3 py-2 tabular-nums">{fmt.int(c.clicks)}</td>
                          <td className={`px-3 py-2 tabular-nums ${c.impressions >= 100 && c.ctr < 0.05 ? 'text-red-300' : ''}`}>{fmt.pct(c.ctr)}</td>
                          <td className="px-3 py-2 tabular-nums">{fmt.int(c.conversions)}</td>
                          <td className="px-3 py-2 tabular-nums">{fmt.usd(c.cost)}</td>
                        </tr>
                      ))}
                      {a.campaigns.length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-400">No campaigns yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Panel>

          <div className="space-y-6">
            {/* Players */}
            <Panel icon="🏏" title="Players" subtitle="2027 registrations through the website form">
              {playersTotal === null && players30 === null ? (
                <p className="text-sm text-gray-400">
                  Registration counts are not connected yet. The Ads script will add them from the registration
                  form&apos;s response sheet (counts only, no names).
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <Kpi label="Registered" value={playersTotal !== null ? fmt.int(playersTotal) : '—'} sub="for 2027" />
                  <Kpi label="Last 30 days" value={players30 !== null ? fmt.int(players30) : '—'} />
                  <Kpi label="Via Google Ads" value={adsSignups !== null ? fmt.int(adsSignups) : '—'} sub="last 30 days" />
                </div>
              )}
            </Panel>

            {/* Sponsor outreach */}
            <Panel icon="✉️" title="Sponsor outreach" subtitle={o ? `Automatic emails to local businesses · since ${fmt.date(o.seasonStart)}` : 'Automatic emails to local businesses'}
              action={o ? <StatusPill status={o.n8n === 'up' && o.lastRun.status !== 'error' ? 'good' : 'bad'}
                label={o.n8n !== 'up' ? 'Sender stopped' : o.lastRun.status === 'error' ? 'Last run failed' : 'Sending normally'} /> : undefined}>
              <NotReady data={out} what="Sponsor outreach" />
              {o && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Kpi label="Businesses contacted" value={fmt.int(o.sent.season)} sub={`${fmt.int(o.sent.week)} this week`} />
                    <Kpi label="Replied" value={fmt.int(o.replies.total)} sub={`${fmt.pct(replyRate)} reply rate`} />
                    <Kpi label="Waiting for our answer" value={fmt.int(o.replies.waiting)}
                      status={o.replies.waiting ? 'warn' : 'good'} statusLabel={o.replies.waiting ? 'Reply today' : 'None'} />
                    <Kpi label="No reply yet" value={fmt.int(noAnswerYet)} sub="follow-ups continue" />
                    <Kpi label="Bounced" value={fmt.int(o.bounces.season)} sub={`${fmt.pct(o.bounces.rate)} (limit 5%)`} status={bounceStatus} />
                    <Kpi label="Asked to stop" value={fmt.int(o.optOuts.season)} sub="never emailed again" />
                  </div>
                  {o.contactsLeft && (
                    <Meter label="Contact list used" value={o.sent.season} max={o.sent.season + o.contactsLeft.contacts} format={fmt.int}
                      status={o.contactsLeft.contacts < 300 ? 'warn' : 'good'}
                      note={`${fmt.int(o.contactsLeft.contacts)} businesses left to email, about ${Math.ceil(o.contactsLeft.contacts / 100)} sending days.`} />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">Warm leads and next steps</h3>
                    <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
                      {leadsByUrgency.map((l, i) => (
                        <li key={`${l.name}-${i}`} className="px-3 py-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                          <span className="text-white font-medium">{l.name} <span className="text-gray-500 font-normal">· {l.stage}</span></span>
                          <span className={`whitespace-nowrap text-xs ${l.nextStepDate && l.nextStepDate < o.today ? 'text-red-300' : 'text-gray-400'}`}>
                            {l.nextStepDate && l.nextStepDate < o.today ? 'Overdue · ' : ''}{fmt.date(l.nextStepDate)}
                          </span>
                          <span className="basis-full text-gray-400 text-xs">{l.nextStep.replace(/_/g, ' ') || '—'}</span>
                        </li>
                      ))}
                    </ul>
                    <a href="/c3h/outreach" className="inline-block mt-2 text-xs text-primary-400 hover:underline">All {o.leads.length} leads →</a>
                  </div>
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
