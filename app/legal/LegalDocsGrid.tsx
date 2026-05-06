"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db, firebaseAuthReady } from '@/lib/firebase';

// ── Configuration ──────────────────────────────────────────────────────
// `signingCollection` — when set, the card reads the current user's
// signature from this Firestore collection (keyed by safeUserKey)
// and renders a "✓ Signed on [date]" badge. Adding e-sign to a future
// document is a one-line change here once the SignBlock pattern is
// reused on that document's page.

type DocConfig = {
  slug: string;
  title: string;
  summary: string;
  audience: string;
  icon: string;
  priority: string;
  signingCollection?: string;
};

const DOCS: DocConfig[] = [
  {
    slug: 'volunteer-agreement',
    title: 'Volunteer Agreement',
    summary: 'Every player, board member, and contributor signs this. Confirms volunteer status, no compensation, work is donated.',
    audience: 'All members',
    icon: '🤝',
    priority: 'Required',
    signingCollection: 'volunteer_agreement_signatures',
  },
  {
    slug: 'liability-waiver',
    title: 'Liability Waiver',
    summary: 'Acknowledgement of inherent risks of cricket, concussion awareness, and release of claims.',
    audience: 'All players',
    icon: '🏏',
    priority: 'Required at registration',
    signingCollection: 'liability_waiver_signatures',
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    summary: 'How we collect, store, use, and protect personal information from members and the public.',
    audience: 'Public',
    icon: '🔒',
    priority: 'Public',
  },
  {
    slug: 'code-of-conduct',
    title: 'Code of Conduct',
    summary: 'Standards of behaviour for players, coaches, board members, and volunteers. Inclusion-first.',
    audience: 'All members',
    icon: '⚖️',
    priority: 'All members',
    signingCollection: 'code_of_conduct_signatures',
  },
  {
    slug: 'financial-policy',
    title: 'Financial Policy',
    summary: 'How money flows through the club: signing authority, deposits, reimbursements, annual reporting.',
    audience: 'Board + members',
    icon: '💰',
    priority: 'Governance',
  },
  {
    slug: 'conflict-of-interest',
    title: 'Conflict of Interest Policy',
    summary: 'Director declarations, recusal procedures, annual disclosures.',
    audience: 'Directors, officers, captains',
    icon: '🧭',
    priority: 'Annual — directors / officers',
    signingCollection: 'coi_declarations',
  },
  {
    slug: 'bylaws',
    title: 'Bylaws',
    summary: 'Federal NFP-compliant operating rules of the club. Draft pending legal review.',
    audience: 'All members',
    icon: '📜',
    priority: 'Governance',
  },
  {
    slug: 'ip-ownership',
    title: 'Software & IP Ownership',
    summary: 'The C3H portal and challengerscc.ca website were authored by Mohammed Saad personally and are his personal property under Copyright Act §13(1). The Club operates under a revocable licence at no charge while he serves as a director. Not a donation.',
    audience: 'Public + governance',
    icon: '⚖️',
    priority: 'IP / governance',
  },
  {
    slug: 'photography-consent',
    title: 'Photography & Media Consent',
    summary: 'How we capture and use photos, videos, livestreams, and recordings of members. Special protection for minors. Opt-out at any time.',
    audience: 'All members',
    icon: '📸',
    priority: 'All members',
    signingCollection: 'photography_consent_signatures',
  },
];

type SignatureRecord = {
  signedAt?: Timestamp | null;
  signerName?: string;
  signatureType?: 'typed' | 'drawn';
};

function safeUserKey(email: string) {
  return email.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function formatSignedDate(t: Timestamp | null | undefined): string {
  if (!t) return 'pending sync';
  return t.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function LegalDocsGrid() {
  const { data: session, status } = useSession();
  const [signatures, setSignatures] = useState<Record<string, SignatureRecord>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (status !== 'authenticated' || !session?.user?.email) {
      setLoading(false);
      return;
    }
    const userKey = safeUserKey(session.user.email);
    const signableDocs = DOCS.filter((d) => d.signingCollection);
    if (signableDocs.length === 0) {
      setLoading(false);
      return;
    }

    firebaseAuthReady()
      .then(async () => {
        const results: Record<string, SignatureRecord> = {};
        await Promise.all(
          signableDocs.map(async (d) => {
            try {
              const snap = await getDoc(doc(db, d.signingCollection!, userKey));
              if (snap.exists()) results[d.slug] = snap.data() as SignatureRecord;
            } catch {
              /* permission errors are non-fatal — leave doc as unsigned */
            }
          }),
        );
        if (!cancelled) {
          setSignatures(results);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [session?.user?.email, status]);

  // Summary stats — count signed vs total signable
  const signableDocs = DOCS.filter((d) => d.signingCollection);
  const signedCount = signableDocs.filter((d) => signatures[d.slug]).length;
  const totalSignable = signableDocs.length;

  return (
    <>
      {/* Per-user summary banner */}
      {status === 'authenticated' && (
        <div className="mb-6 rounded-2xl glass border border-white/10 p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm text-gray-300">
                Signed in as <strong className="text-white">{session?.user?.name}</strong>
                {' '}<span className="text-gray-500">({session?.user?.email})</span>
              </p>
              {loading ? (
                <p className="text-xs text-gray-500 mt-1">Loading your signing status…</p>
              ) : (
                <p className="text-xs mt-1">
                  {signedCount === totalSignable ? (
                    <span className="text-primary-400">
                      ✓ You&apos;ve signed all {totalSignable} required document{totalSignable === 1 ? '' : 's'} that support electronic signatures.
                    </span>
                  ) : (
                    <span className="text-amber-300">
                      You&apos;ve signed {signedCount} of {totalSignable} document{totalSignable === 1 ? '' : 's'} that support electronic signatures. Cards below show what&apos;s outstanding.
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {status === 'unauthenticated' && (
        <div className="mb-6 rounded-2xl glass border border-white/10 p-4">
          <p className="text-sm text-gray-300">
            <strong className="text-white">Sign in</strong> to track which documents you&apos;ve already signed and to e-sign new ones.{' '}
            <Link href="/c3h/login" className="text-primary-400 hover:text-primary-300 underline">Sign in with Google →</Link>
          </p>
        </div>
      )}

      <h2 className="text-2xl font-bold text-white mb-5">Documents</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {DOCS.map((d) => {
          const sig = signatures[d.slug];
          const isSigned = Boolean(sig);

          return (
            <div
              key={d.slug}
              className={`glass rounded-2xl p-5 border transition-all ${
                isSigned
                  ? 'border-primary-500/40'
                  : 'border-white/10 hover:border-primary-500/40'
              }`}
            >
              <Link href={`/legal/${d.slug}`} className="block group">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{d.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-base group-hover:text-primary-400 transition-colors">{d.title}</h3>
                    {d.signingCollection ? (
                      <p className={`text-[10px] uppercase tracking-wider font-semibold mt-0.5 ${
                        isSigned ? 'text-primary-400' : 'text-amber-400'
                      }`}>
                        {isSigned ? `✓ Signed · ${formatSignedDate(sig?.signedAt)}` : 'Required · Not yet signed'}
                      </p>
                    ) : (
                      <p className="text-[10px] uppercase tracking-wider text-accent-400 font-semibold mt-0.5">{d.priority}</p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{d.summary}</p>
                <p className="text-xs text-gray-500 mt-3">For: {d.audience}</p>
              </Link>

              {d.signingCollection && (
                <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-3 items-center text-xs">
                  {isSigned ? (
                    <Link
                      href={`/legal/${d.slug}`}
                      className="text-primary-400 hover:text-primary-300 underline"
                    >
                      View / Print my signed copy →
                    </Link>
                  ) : status === 'authenticated' ? (
                    <Link
                      href={`/legal/${d.slug}`}
                      className="text-amber-300 hover:text-amber-200 underline"
                    >
                      Open and e-sign now →
                    </Link>
                  ) : (
                    <Link
                      href="/c3h/login"
                      className="text-amber-300 hover:text-amber-200 underline"
                    >
                      Sign in to e-sign →
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
