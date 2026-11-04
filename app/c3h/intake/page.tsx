"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { isC3HAdmin, resolveDirectorWorkspaceEmail } from '@/lib/c3h-access';
import { INTAKE_STATUSES, IntakeKind, IntakeRecord, REGISTRATION_SEASON } from '@/lib/c3h-intake';

const DETAIL_LABELS: Record<string, string> = {
  contactName: 'Contact person',
  sponsorshipLevel: 'Interested in',
  message: 'Message',
  skillLevel: 'Skill level',
  willingToPlay: 'Willing to play',
  playingRole: 'Role',
  workPattern: '2027 work pattern',
  weekendAvailability: 'Weekend availability',
  gamesCommitted: 'Matches they can commit to',
  jerseySize: 'Jersey size',
  jerseyType: 'Jersey type',
  trouserWaistSize: 'Trouser waist',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });

async function postAction(body: object): Promise<IntakeRecord> {
  const res = await fetch('/api/c3h/intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Could not save. Please try again.');
  return data.record;
}

export default function IntakePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const email = session?.user?.email;
  const allowed = isC3HAdmin(email) || resolveDirectorWorkspaceEmail(email) !== null;

  const [records, setRecords] = useState<IntakeRecord[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'unconfigured' | 'error'>('loading');
  const [kind, setKind] = useState<IntakeKind>('player');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  useEffect(() => {
    if (!allowed) return;
    fetch('/api/c3h/intake', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (!data.configured) return setState('unconfigured');
        if (data.error) return setState('error');
        setRecords(data.records);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [allowed]);

  const replace = (record: IntakeRecord) =>
    setRecords(all => {
      const others = all.filter(r => r.id !== record.id);
      return [record, ...others].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });

  if (status === 'loading') return <Shell><p className="text-gray-400">Loading...</p></Shell>;
  if (!allowed) return <Shell><p className="text-gray-400">This page is for directors.</p></Shell>;

  const shown = records.filter(r => r.kind === kind);
  const waiting = (k: IntakeKind) => records.filter(r => r.kind === k && r.status === 'new').length;

  return (
    <Shell>
      <h1 className="text-3xl font-bold text-white mb-2">Registrations &amp; Enquiries</h1>
      <p className="text-gray-400 text-sm mb-6">
        Private to directors. Every change records who made it and when.
      </p>

      {state === 'loading' && <p className="text-gray-400">Loading...</p>}
      {state === 'error' && <p className="text-red-400">Could not load the records. Please refresh to try again.</p>}
      {state === 'unconfigured' && (
        <p className="text-amber-300">
          Storage is not set up yet. Website forms still go to Google Forms, but nothing appears here until
          FIREBASE_SERVICE_ACCOUNT_KEY is added in Vercel.
        </p>
      )}

      {state === 'ready' && (
        <>
          <div className="flex gap-2 mb-6" role="tablist">
            {(['player', 'sponsor'] as const).map(k => (
              <button
                key={k}
                role="tab"
                aria-selected={kind === k}
                onClick={() => setKind(k)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${kind === k ? 'bg-primary-600 text-white' : 'glass text-gray-300'}`}
              >
                {k === 'player' ? 'Players' : 'Sponsors'} {waiting(k) > 0 && `(${waiting(k)} new)`}
              </button>
            ))}
          </div>

          <AddForm kind={kind} onAdded={replace} />

          {shown.length === 0 && <p className="text-gray-400 mt-6">Nothing here yet.</p>}
          <div className="space-y-4 mt-6">
            {shown.map(record => <RecordCard key={record.id} record={record} onChange={replace} />)}
          </div>
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-28 pb-16">{children}</main>
    </div>
  );
}

const INPUT = 'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500';

function AddForm({ kind, onAdded }: { kind: IntakeKind; onAdded: (r: IntakeRecord) => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      onAdded(await postAction({ action: 'add', kind, ...form }));
      setForm({ name: '', email: '', phone: '', note: '' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <details className="glass rounded-xl p-4">
      <summary className="cursor-pointer text-sm font-semibold">
        Add a {kind === 'player' ? 'player' : 'sponsor'} by hand
      </summary>
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3 mt-4">
        <label className="text-xs text-gray-400">{kind === 'player' ? 'Name' : 'Business'}
          <input required value={form.name} onChange={set('name')} className={`${INPUT} mt-1`} />
        </label>
        <label className="text-xs text-gray-400">Email
          <input required type="email" value={form.email} onChange={set('email')} className={`${INPUT} mt-1`} />
        </label>
        <label className="text-xs text-gray-400">Phone
          <input value={form.phone} onChange={set('phone')} className={`${INPUT} mt-1`} />
        </label>
        <label className="text-xs text-gray-400">Note
          <input value={form.note} onChange={set('note')} className={`${INPUT} mt-1`} />
        </label>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button disabled={saving} className="px-4 py-2 rounded-lg bg-primary-600 text-sm font-semibold disabled:opacity-50">
            {saving ? 'Adding...' : 'Add'}
          </button>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        </div>
      </form>
    </details>
  );
}

function RecordCard({ record, onChange }: { record: IntakeRecord; onChange: (r: IntakeRecord) => void }) {
  const [note, setNote] = useState(record.note);
  const [portalEmail, setPortalEmail] = useState(record.portalEmail || record.email);
  const [squadName, setSquadName] = useState(record.name);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isPlayer = record.kind === 'player';
  const paid = isPlayer && record.status === 'paid';

  const run = async (body: object) => {
    setSaving(true);
    setError('');
    try {
      onChange(await postAction({ id: record.id, ...body }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const grant = () => {
    const ok = window.confirm(
      `Confirm payment from ${record.name} and open portal access for ${portalEmail}?`,
    );
    if (ok) run({ action: 'grant', email: portalEmail, name: squadName });
  };
  const revoke = () => {
    const ok = window.confirm(`Remove portal access for ${record.portalEmail}?`);
    if (ok) run({ action: 'revoke' });
  };

  const statusOptions = Object.entries(INTAKE_STATUSES[record.kind]).filter(
    ([key]) => !isPlayer || (key !== 'paid' && key !== 'removed') || key === record.status,
  );

  return (
    <article className="glass rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{record.name}</h2>
          <p className="text-sm text-gray-300">
            <a href={`mailto:${record.email}`} className="text-primary-400 hover:underline">{record.email}</a>
            {record.phone && <> · <a href={`tel:${record.phone}`} className="text-primary-400 hover:underline">{record.phone}</a></>}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {fmtDate(record.createdAt)} · {record.source === 'website' ? 'Website form' : 'Added by hand'}
          </p>
        </div>
        {paid || record.status === 'removed' ? (
          <span className="text-sm font-semibold text-accent-400">{INTAKE_STATUSES[record.kind][record.status]}</span>
        ) : (
          <label className="text-xs text-gray-400">Status
            <select
              value={record.status}
              disabled={saving}
              onChange={e => run({ action: 'update', status: e.target.value })}
              className="block mt-1 px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-sm text-white"
            >
              {statusOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
        )}
      </div>

      {Object.keys(record.details).length > 0 && (
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1 mt-4 text-sm">
          {Object.entries(record.details).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <dt className="text-gray-500 shrink-0">{DETAIL_LABELS[key] || key}:</dt>
              <dd className="text-gray-200 break-words min-w-0">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <label className="block text-xs text-gray-400 mt-4">Note
        <textarea
          rows={2}
          value={note}
          onChange={e => setNote(e.target.value)}
          onBlur={() => note !== record.note && run({ action: 'update', note })}
          className={`${INPUT} mt-1`}
        />
      </label>

      {isPlayer && !paid && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <label className="block text-xs text-gray-400">Google email they will sign in with
            <input type="email" value={portalEmail} onChange={e => setPortalEmail(e.target.value)} className={`${INPUT} mt-1`} />
          </label>
          <label className="block text-xs text-gray-400 mt-3">Name in the Dugout and squad lists
            <input value={squadName} onChange={e => setSquadName(e.target.value)} className={`${INPUT} mt-1`} />
          </label>
          <button
            disabled={saving || !portalEmail || !squadName.trim()}
            onClick={grant}
            className="mt-3 px-4 py-2 rounded-lg bg-primary-600 text-sm font-semibold disabled:opacity-50"
          >
            Confirm payment and open portal access
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Access lasts through the {REGISTRATION_SEASON} season. They can sign in within a minute and appear in the Dugout and squad lists.
          </p>
        </div>
      )}

      {paid && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-sm text-gray-300">Portal access open for {record.portalEmail}</p>
          <button disabled={saving} onClick={revoke} className="mt-2 text-sm text-red-400 hover:underline disabled:opacity-50">
            Remove portal access
          </button>
        </div>
      )}

      {error && <p role="alert" className="text-sm text-red-400 mt-3">{error}</p>}

      <details className="mt-3 text-xs text-gray-500">
        <summary className="cursor-pointer">History</summary>
        <ul className="mt-2 space-y-1">
          {record.history.map((event, i) => (
            <li key={i}>{fmtDate(event.at)} · {event.by} · {event.action}</li>
          ))}
        </ul>
      </details>
    </article>
  );
}
