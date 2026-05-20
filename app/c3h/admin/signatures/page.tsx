"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db, firebaseAuthReady } from '@/lib/firebase';
import { isC3HAdmin } from '@/lib/c3h-access';
import Navbar from '@/components/Navbar';

type CollectionConfig = {
  id: string;
  label: string;
  icon: string;
  publicUrl?: string;
  description: string;
};

const COLLECTIONS: CollectionConfig[] = [
  {
    id: 'governance_signatures',
    label: 'Pavilion: IP Ownership + Software Licence',
    icon: '🏛️',
    publicUrl: '/c3h/pavilion',
    description: 'Director e-signatures on the IP Ownership Acknowledgement and Software Licence Agreement.',
  },
  {
    id: 'officer_appointment_signatures',
    label: 'Officer Appointment Confirmation',
    icon: '🎩',
    publicUrl: '/c3h/officer-hub',
    description: 'Officer (Treasurer / Secretary / Captain) appointment confirmations with volunteer status.',
  },
  {
    id: 'volunteer_agreement_signatures',
    label: 'Volunteer Agreement',
    icon: '🤝',
    publicUrl: '/legal/volunteer-agreement',
    description: 'Required for every member. Confirms volunteer status, no compensation, and Section 3 IP carve-out.',
  },
  {
    id: 'liability_waiver_signatures',
    label: 'Liability Waiver',
    icon: '🏏',
    publicUrl: '/legal/liability-waiver',
    description: 'Required for every player before match selection. Includes DOB and emergency contact.',
  },
  {
    id: 'code_of_conduct_signatures',
    label: 'Code of Conduct',
    icon: '⚖️',
    publicUrl: '/legal/code-of-conduct',
    description: 'Acknowledgement of standards of behaviour. Required for every member.',
  },
  {
    id: 'photography_consent_signatures',
    label: 'Photography & Media Consent',
    icon: '📸',
    publicUrl: '/legal/photography-consent',
    description: 'Photo / video consent with optional opt-out.',
  },
  {
    id: 'coi_declarations',
    label: 'Conflict of Interest Declaration',
    icon: '🧭',
    publicUrl: '/legal/conflict-of-interest',
    description: 'Annual COI declaration for directors, officers, and committee members.',
  },
];

type SigRecord = {
  docId?: string;
  docVersion?: string;
  signerName?: string;
  signerEmail?: string;
  signerLoginEmail?: string;
  signerWorkspaceEmail?: string;
  signerRole?: string;
  signedAt?: Timestamp;
  signatureType?: 'typed' | 'drawn';
  signatureData?: string;
  userAgent?: string;
  // doc-specific extras
  photoOptOut?: boolean;
  optOut?: boolean;
  dateOfBirth?: string;
  emergencyContact?: string;
  guardianName?: string;
  guardianRelationship?: string;
  effectiveFrom?: string;
  year?: string;
  conflictDeclarations?: string;
};

type SigEntry = { id: string; data: SigRecord };

function fmtDate(t?: Timestamp): string {
  if (!t) return 'pending sync';
  return t.toDate().toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function displayEmail(r: SigRecord): string {
  return r.signerEmail || r.signerWorkspaceEmail || r.signerLoginEmail || 'unknown';
}

export default function AdminSignaturesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [byCollection, setByCollection] = useState<Record<string, SigEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [openCollection, setOpenCollection] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.email) return;
    if (!isC3HAdmin(session.user.email)) return;
    setLoading(true);
    firebaseAuthReady()
      .then(async () => {
        const out: Record<string, SigEntry[]> = {};
        await Promise.all(
          COLLECTIONS.map(async (col) => {
            try {
              const snap = await getDocs(collection(db, col.id));
              const entries: SigEntry[] = [];
              snap.forEach((d) => entries.push({ id: d.id, data: d.data() as SigRecord }));
              // Sort by signedAt descending (newest first)
              entries.sort((a, b) => {
                const ta = a.data.signedAt?.toMillis?.() ?? 0;
                const tb = b.data.signedAt?.toMillis?.() ?? 0;
                return tb - ta;
              });
              out[col.id] = entries;
            } catch {
              out[col.id] = [];
            }
          }),
        );
        setByCollection(out);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session?.user?.email]);

  const downloadAllAsJson = () => {
    const blob = new Blob([JSON.stringify(byCollection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ccc-signatures-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <p className="text-sm text-gray-400 mb-4">
              The signatures dashboard is restricted to Club admins. If you should have access, contact{' '}
              <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline">contact@challengerscc.ca</a>.
            </p>
            <button
              onClick={() => router.push('/c3h/dashboard')}
              className="px-5 py-2 rounded-lg bg-primary-500 text-black font-semibold hover:bg-primary-400 transition-all"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalSignatures = Object.values(byCollection).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />
      <section className="section-padding pt-28 md:pt-32">
        <div className="max-w-6xl mx-auto">

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📋</span>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Signatures Tracker</h1>
            </div>
            <p className="text-gray-400 text-sm">
              Admin view of every signature in the Club&apos;s governance ledger. Click any signer to view their
              signed copy and print/save as PDF for the corporate record.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="text-xs px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                {totalSignatures} total signatures
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                {COLLECTIONS.length} collections
              </span>
              <button
                onClick={downloadAllAsJson}
                className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
              >
                ⬇ Download all as JSON
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-gray-400 text-sm">Loading governance ledger…</div>
          ) : (
            <div className="space-y-3">
              {COLLECTIONS.map((col) => {
                const entries = byCollection[col.id] ?? [];
                const isOpen = openCollection === col.id;
                return (
                  <article key={col.id} className="glass rounded-2xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setOpenCollection(isOpen ? null : col.id)}
                      className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-white/3 rounded-2xl transition"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-2xl">{col.icon}</span>
                        <div className="min-w-0">
                          <h2 className="text-lg font-bold text-white">{col.label}</h2>
                          <p className="text-xs text-gray-500 mt-0.5">{col.description}</p>
                          {col.publicUrl && (
                            <p className="text-[10px] text-gray-600 mt-1">
                              <code className="text-primary-400">{col.publicUrl}</code>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          entries.length > 0
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                            : 'bg-white/5 border border-white/10 text-gray-400'
                        }`}>
                          {entries.length} signed
                        </span>
                        <span className="text-gray-500 text-lg">{isOpen ? '▾' : '▸'}</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5">
                        {entries.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No signatures yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {entries.map((e) => {
                              const isExpanded = expanded === `${col.id}/${e.id}`;
                              const r = e.data;
                              return (
                                <div
                                  key={e.id}
                                  className="rounded-lg bg-white/3 border border-white/10"
                                >
                                  <button
                                    type="button"
                                    onClick={() => setExpanded(isExpanded ? null : `${col.id}/${e.id}`)}
                                    className="w-full p-3 flex items-start justify-between gap-3 text-left hover:bg-white/5 rounded-lg transition"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="text-white font-medium truncate">{r.signerName ?? 'unknown'}</div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {displayEmail(r)}
                                        {r.signerRole ? ` · ${r.signerRole}` : ''}
                                      </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <div className="text-xs text-gray-300">{fmtDate(r.signedAt)}</div>
                                      <div className="text-[10px] text-gray-500">
                                        {r.signatureType ?? '—'}
                                        {r.docVersion ? ` · v${r.docVersion}` : ''}
                                      </div>
                                    </div>
                                  </button>

                                  {isExpanded && (
                                    <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-3">
                                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                                        <Field label="Document ID" value={r.docId} />
                                        <Field label="Version" value={r.docVersion} />
                                        <Field label="Signer (canonical)" value={r.signerEmail} />
                                        {r.signerLoginEmail && r.signerLoginEmail !== r.signerEmail && (
                                          <Field label="Login email used" value={r.signerLoginEmail} />
                                        )}
                                        <Field label="Role" value={r.signerRole} />
                                        <Field label="Effective from" value={r.effectiveFrom} />
                                        <Field label="Year" value={r.year} />
                                        <Field label="DOB" value={r.dateOfBirth} />
                                        <Field label="Emergency contact" value={r.emergencyContact} />
                                        <Field label="Guardian" value={r.guardianName} />
                                        <Field label="Guardian relationship" value={r.guardianRelationship} />
                                        {r.photoOptOut !== undefined && (
                                          <Field label="Photo opt-out" value={r.photoOptOut ? 'YES' : 'no'} />
                                        )}
                                        {r.optOut !== undefined && (
                                          <Field label="Opt-out" value={r.optOut ? 'YES' : 'no'} />
                                        )}
                                      </div>

                                      {r.conflictDeclarations && (
                                        <div className="rounded bg-black/30 border border-white/5 p-2 text-xs text-gray-300">
                                          <div className="text-gray-500 mb-1">Conflict declarations:</div>
                                          <pre className="whitespace-pre-wrap font-sans">{r.conflictDeclarations}</pre>
                                        </div>
                                      )}

                                      <div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Signature</div>
                                        {r.signatureType === 'drawn' && r.signatureData ? (
                                          <img
                                            src={r.signatureData}
                                            alt={`Signature of ${r.signerName ?? 'unknown'}`}
                                            className="bg-white rounded border border-white/20 max-h-20"
                                          />
                                        ) : r.signatureType === 'typed' ? (
                                          <p className="inline-block text-2xl text-black bg-white rounded px-3 py-1" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                                            {r.signatureData}
                                          </p>
                                        ) : (
                                          <span className="text-xs text-gray-500 italic">—</span>
                                        )}
                                      </div>

                                      <div className="flex flex-wrap gap-2 pt-1">
                                        {col.publicUrl && (
                                          <a
                                            href={col.publicUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                                          >
                                            Open document ↗
                                          </a>
                                        )}
                                        <span className="text-[10px] text-gray-500 self-center">
                                          Firestore key: <code className="text-primary-400">{e.id}</code>
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-10 rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 text-sm text-amber-200">
            <strong className="text-amber-300">Admin reminder:</strong> The contents of this dashboard include
            personal data (names, emails, signatures, DOB for waivers). Treat as confidential. To grant a
            second admin (e.g. Madhu via <code className="text-primary-400">contact@challengerscc.ca</code>),
            add their email to <code className="text-primary-400">C3H_ADMIN_EMAILS</code> in
            {' '}<code className="text-primary-400">lib/c3h-access.ts</code>.
          </div>

        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div>
      <span className="text-gray-500">{label}: </span>
      <span className="text-white">{value}</span>
    </div>
  );
}
