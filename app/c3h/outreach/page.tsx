"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { isC3HAdmin, isC3HCommittee } from '@/lib/c3h-access';
import { staleHours, type OutreachSummary } from '@/lib/outreach-summary';
import { Kpi, fmt } from '@/app/c3h/lib/Kpi';
import Navbar from '@/components/Navbar';

type Response =
  | { configured: false }
  | ({ configured: true; error?: undefined } & OutreachSummary)
  | { configured: true; error: string };

// Pipeline statuses as the outreach scripts write them, in plain words.
const STATUS: Record<string, string> = {
  sent: 'Email sent, waiting for an answer',
  not_started: 'Not contacted yet',
  stalled_6mo: 'Gone quiet (6+ months)',
  ghosted: 'No answer',
  ghosted_3mo_reopen_ready: 'Quiet for 3+ months, ready to re-open',
  diary: 'Waiting for their dates',
  replied_needs_response: 'Replied: needs a personal answer',
  won: 'Signed',
  closed: 'Closed',
};
const plainStatus = (s: string) => STATUS[s] || (s && s !== '0' ? s.replace(/_/g, ' ') : '—');

const RUN: Record<OutreachSummary['lastRun']['status'], [string, string]> = {
  ok: ['Ran normally', 'text-green-400'],
  skipped: ['Nothing to do (weekend or already sent)', 'text-gray-300'],
  error: ['Had a problem', 'text-red-400'],
  none: ['No automatic run recorded yet', 'text-gray-300'],
};

const fmtDate = (d: string | null) =>
  d ? new Date(`${d}T12:00:00`).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' }) : '—';

export default function OutreachDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<Response | null>(null);
  const email = session?.user?.email;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  useEffect(() => {
    if (!isC3HCommittee(email)) return;
    fetch('/api/outreach-summary')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ configured: true, error: 'Could not reach the server' }));
  }, [email]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary-400 text-xl">Loading…</div>
      </div>
    );
  }
  if (!session) return null;
  if (!isC3HCommittee(email)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
        <Navbar />
        <div className="pt-32 px-6 max-w-xl mx-auto text-center">
          <div className="glass rounded-2xl p-8 border border-white/10">
            <div className="text-3xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-white mb-2">Committee only</h1>
            <p className="text-sm text-gray-400">The sponsor outreach summary is for directors and officers.</p>
          </div>
        </div>
      </div>
    );
  }

  const s = data && 'sent' in data ? data : null;
  const stale = s ? staleHours(s) : 0;
  const today = s?.today || '';
  const leads = s ? [...s.leads].sort((a, b) =>
    Number(/replied/.test(b.status)) - Number(/replied/.test(a.status))
    || (a.nextStepDate || '9').localeCompare(b.nextStepDate || '9')) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />
      <div className="pt-28 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Sponsor outreach</h1>
            <p className="text-sm text-gray-400">
              Emails to local businesses asking them to sponsor the Club
              {s ? ` · updated ${new Date(s.generated).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
            </p>
          </div>
          {isC3HAdmin(email) && (
            <a href="/c3h/ads"
              className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all">
              Google Ads dashboard
            </a>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-6 max-w-3xl">
          Every weekday at 9:30 the club Mac checks the contact@ inbox for replies, then sends up to 100 short
          sponsorship emails to businesses that publish their email address. Anyone who replies, bounces or asks to
          stop is never emailed again. Replies are answered personally by Saad.
        </p>

        {!data && <p className="text-gray-400">Loading summary…</p>}

        {data && !data.configured && (
          <div className="glass rounded-2xl p-6 border border-white/10 text-gray-300 text-sm">
            Not connected yet. Set <code>OUTREACH_SUMMARY_URL</code> and <code>OUTREACH_SUMMARY_KEY</code> in Vercel,
            then redeploy.
          </div>
        )}

        {data && data.configured && data.error && (
          <div className="rounded-2xl p-6 border border-red-500/40 bg-red-500/10 text-red-200 text-sm">
            Could not load the summary: {data.error}
          </div>
        )}

        {s && (
          <>
            {(s.alerts.length > 0 || stale > 30) && (
              <div className="rounded-2xl p-5 mb-6 border border-amber-500/40 bg-amber-500/10">
                <h2 className="font-semibold text-amber-200 mb-2">Needs attention</h2>
                <ul className="list-disc pl-5 space-y-1 text-sm text-amber-100">
                  {stale > 30 && (
                    <li>
                      This summary is {Math.round(stale / 24 * 10) / 10} days old. If that spans a weekday, the club Mac
                      was probably off or asleep at 9:30.
                    </li>
                  )}
                  {s.alerts.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </div>
            )}

            <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-2">Emails sent</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Kpi hero label="Today" value={fmt.int(s.sent.today)} />
              <Kpi hero label="This week" value={fmt.int(s.sent.week)} />
              <Kpi hero label="This season" value={fmt.int(s.sent.season)} sub={`since ${fmtDate(s.seasonStart)}`} />
              <Kpi hero label="All time" value={fmt.int(s.sent.allTime)} />
            </div>

            <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-2">What came back this season</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Kpi label="Replies" value={fmt.int(s.replies.total)} sub={`${s.replies.waiting} waiting for an answer`}
                status={s.replies.waiting ? 'warn' : undefined} statusLabel={s.replies.waiting ? 'Reply today' : undefined} />
              <Kpi label="Bounces" value={fmt.int(s.bounces.season)} sub={`${fmt.pct(s.bounces.rate)} of emails (keep under 5%)`}
                status={s.bounces.rate > 0.05 ? 'bad' : 'good'} />
              <Kpi label="Asked to stop" value={fmt.int(s.optOuts.season)} sub="never emailed again" />
              <Kpi label="Contacts left" value={s.contactsLeft ? fmt.int(s.contactsLeft.contacts) : '—'}
                sub={s.contactsLeft ? `about ${Math.ceil(s.contactsLeft.contacts / 100)} sending days` : 'unknown'}
                status={s.contactsLeft && s.contactsLeft.contacts < 300 ? 'warn' : undefined} />
            </div>

            <div className="glass rounded-2xl p-5 border border-white/10 mb-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <h2 className="font-semibold text-white">Last run</h2>
                <span className="text-sm text-gray-400">
                  Sending service:{' '}
                  <span className={s.n8n === 'up' ? 'text-green-400' : 'text-red-400'}>
                    {s.n8n === 'up' ? 'running' : 'stopped'}
                  </span>
                  {' · '}last emails went out {fmtDate(s.sent.lastSendDay)}
                </span>
              </div>
              <p className={`text-lg font-semibold ${RUN[s.lastRun.status][1]}`}>
                {RUN[s.lastRun.status][0]}
                {s.lastRun.reportDate && <span className="text-sm text-gray-400 font-normal"> · {fmtDate(s.lastRun.reportDate)}</span>}
              </p>
              {s.lastRun.reportDate && (
                <ul className="mt-2 text-sm text-gray-300 grid sm:grid-cols-2 gap-x-6 gap-y-1">
                  <li>{s.lastRun.sent} of {s.lastRun.planned} emails sent{s.lastRun.failed ? `, ${s.lastRun.failed} failed` : ''}</li>
                  <li>{s.lastRun.inboxChecked} new inbox messages checked</li>
                  <li>{s.lastRun.replies} new replies, {s.lastRun.optOuts} asked to stop</li>
                  <li>{s.lastRun.bounces} bounced addresses removed</li>
                </ul>
              )}
              {s.lastRun.errors.length > 0 && (
                <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
                  <div className="text-sm font-semibold text-red-200 mb-1">Errors</div>
                  <ul className="text-xs text-red-100 font-mono space-y-1 break-words">
                    {s.lastRun.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl border border-white/10 overflow-x-auto">
              <div className="px-4 pt-4">
                <h2 className="font-semibold text-white">Leads and next steps</h2>
                <p className="text-xs text-gray-400">Renewing sponsors and businesses that have shown interest. Red dates are overdue.</p>
              </div>
              <table className="w-full text-sm mt-3">
                <thead className="text-left text-gray-400">
                  <tr>
                    {['Business', 'Type', 'Where it stands', 'Next step', 'By'].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-white">
                  {leads.map((l, i) => (
                    <tr key={`${l.name}-${i}`} className="border-t border-white/10">
                      <td className="px-4 py-3">{l.name}</td>
                      <td className="px-4 py-3 text-gray-300">{l.stage}</td>
                      <td className={`px-4 py-3 ${/replied/.test(l.status) ? 'text-amber-300 font-semibold' : 'text-gray-300'}`}>
                        {plainStatus(l.status)}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{l.nextStep.replace(/_/g, ' ') || '—'}</td>
                      <td className={`px-4 py-3 whitespace-nowrap ${l.nextStepDate && l.nextStepDate < today ? 'text-red-400' : 'text-gray-300'}`}>
                        {fmtDate(l.nextStepDate || null)}
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No leads yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
