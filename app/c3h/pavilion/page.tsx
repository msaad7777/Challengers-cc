"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  C3H_DIRECTOR_ROSTER,
  C3H_OFFICER_ROSTER,
  isC3HDirector,
  isC3HGovernanceReader,
  isC3HPresident,
  resolveDirectorWorkspaceEmail,
  resolveOfficerWorkspaceEmail,
} from '@/lib/c3h-access';
import Navbar from '@/components/Navbar';
import { GOVERNANCE_DOCS, type GovernanceDoc } from './governanceDocs';
import SignaturePad, { type SignatureResult } from './SignaturePad';
import TechnologyGovernanceRecord from './TechnologyGovernanceRecord';
import LetterOfDirection from './LetterOfDirection';
import PresidentAppointment from './PresidentAppointment';
import Resolutions from './Resolutions';

type SignatureRecord = {
  docId: string;
  docVersion: string;
  signerWorkspaceEmail: string;
  signerLoginEmail: string;
  signerName: string;
  signerRole: string;
  signedAt: Timestamp | null;
  signatureType: 'typed' | 'drawn';
  signatureData: string;
  userAgent: string;
};

type RevocationRecord = {
  docId: string;
  docVersion: string;
  signerWorkspaceEmail: string;
  signerLoginEmail: string;
  signerName: string;
  signerRole: string;
  revokedAt: Timestamp | null;
  reason?: string;
  userAgent: string;
};

type ApprovalRecord = {
  docId: string;
  docVersion: string;
  status: 'ready' | 'held';
  approverWorkspaceEmail: string;
  approverName: string;
  approverRole: string;
  updatedAt: Timestamp | null;
  note?: string;
};

const SIG_COLLECTION = 'governance_signatures';
const REVOKE_COLLECTION = 'governance_revocations';
const APPROVAL_COLLECTION = 'governance_approvals';

function sigKey(docId: string, docVersion: string, workspaceEmail: string) {
  return `${docId}__v${docVersion}__${workspaceEmail.replace(/[^a-z0-9@.]/gi, '_')}`;
}

function approvalKey(docId: string, docVersion: string) {
  return `${docId}__v${docVersion}`;
}

export default function PavilionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [signatures, setSignatures] = useState<Record<string, SignatureRecord>>({});
  // Revocation events keyed by the same sigKey as the signature they retract.
  const [revocations, setRevocations] = useState<Record<string, RevocationRecord>>({});
  // President "ready to send" approvals, keyed by approvalKey(docId, version).
  const [approvals, setApprovals] = useState<Record<string, ApprovalRecord>>({});
  const [loadingSigs, setLoadingSigs] = useState(true);
  // Volunteer-agreement signers, keyed by lower-cased email.
  const [vaSigners, setVaSigners] = useState<Set<string>>(new Set());
  // Officer-appointment signers, keyed by lower-cased workspace email.
  const [oaSigners, setOaSigners] = useState<Set<string>>(new Set());
  const [openSignerFor, setOpenSignerFor] = useState<string | null>(null);
  const [openContentFor, setOpenContentFor] = useState<string | null>(null);
  const [busyDocId, setBusyDocId] = useState<string | null>(null);
  // Revocation flow: which doc's confirm panel is open, the typed reason,
  // and which doc is mid-write.
  const [openRevokeFor, setOpenRevokeFor] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [busyRevokeDocId, setBusyRevokeDocId] = useState<string | null>(null);
  // President "ready to send" toggle.
  const [busyApprovalDocId, setBusyApprovalDocId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.email) return;
    if (!isC3HDirector(session.user.email) && !isC3HGovernanceReader(session.user.email)) return;

    // Pull signatures for every active governance doc plus every legacy
    // doc id referenced by a `carryForwardFrom` on an active doc. Legacy
    // signatures (e.g. from the prior combined Gokul + Qaiser LoD) are
    // promoted in-memory below to count toward the split successor
    // docs, so directors who already signed the combined doc do not
    // need to re-sign each split one.
    const activeDocIds = GOVERNANCE_DOCS.map(d => d.id);
    const legacyDocIds = Array.from(
      new Set(GOVERNANCE_DOCS.flatMap(d => d.carryForwardFrom ?? [])),
    );
    const allDocIds = Array.from(new Set([...activeDocIds, ...legacyDocIds]));
    const q = query(collection(db, SIG_COLLECTION), where('docId', 'in', allDocIds));
    const unsub = onSnapshot(q, (snap) => {
      // First pass: index every signature under its real (legacy or new) key.
      const map: Record<string, SignatureRecord> = {};
      snap.forEach((d) => {
        const r = d.data() as SignatureRecord;
        map[sigKey(r.docId, r.docVersion, r.signerWorkspaceEmail)] = r;
      });

      // Second pass: for each active doc that carries forward from a
      // legacy doc, copy any legacy signature into the active doc's key
      // — but only if the director has NOT already signed the active
      // doc directly. Fresh signatures always win over carried-forward
      // legacy ones.
      for (const gd of GOVERNANCE_DOCS) {
        if (!gd.carryForwardFrom) continue;
        for (const legacyId of gd.carryForwardFrom) {
          snap.forEach((d) => {
            const r = d.data() as SignatureRecord;
            if (r.docId !== legacyId) return;
            const activeKey = sigKey(gd.id, gd.version, r.signerWorkspaceEmail);
            if (!map[activeKey]) map[activeKey] = r;
          });
        }
      }

      setSignatures(map);
      setLoadingSigs(false);
    });
    return () => unsub();
  }, [session?.user?.email]);

  // Revocations — appended when a director withdraws a signature. Keyed by
  // the active doc's sigKey, so a revocation masks both a directly-recorded
  // signature and a carried-forward legacy one. Revocations are written
  // only against active doc ids, so we filter on those.
  useEffect(() => {
    if (!session?.user?.email) return;
    if (!isC3HDirector(session.user.email) && !isC3HGovernanceReader(session.user.email)) return;
    const activeDocIds = GOVERNANCE_DOCS.map(d => d.id);
    const q = query(collection(db, REVOKE_COLLECTION), where('docId', 'in', activeDocIds));
    const unsub = onSnapshot(q, (snap) => {
      const map: Record<string, RevocationRecord> = {};
      snap.forEach((d) => {
        const r = d.data() as RevocationRecord;
        map[sigKey(r.docId, r.docVersion, r.signerWorkspaceEmail)] = r;
      });
      setRevocations(map);
    });
    return () => unsub();
  }, [session?.user?.email]);

  // President "ready to send" approvals for externally-submitted docs.
  useEffect(() => {
    if (!session?.user?.email) return;
    if (!isC3HDirector(session.user.email) && !isC3HGovernanceReader(session.user.email)) return;
    const approvalDocIds = GOVERNANCE_DOCS.filter(d => d.requiresPresidentApproval).map(d => d.id);
    if (approvalDocIds.length === 0) return;
    const q = query(collection(db, APPROVAL_COLLECTION), where('docId', 'in', approvalDocIds));
    const unsub = onSnapshot(q, (snap) => {
      const map: Record<string, ApprovalRecord> = {};
      snap.forEach((d) => {
        const r = d.data() as ApprovalRecord;
        map[approvalKey(r.docId, r.docVersion)] = r;
      });
      setApprovals(map);
    });
    return () => unsub();
  }, [session?.user?.email]);

  // Volunteer-agreement + Officer-appointment signers — one-shot reads
  // on mount. The onboarding tracker is read-mostly; no live snapshot
  // needed.
  useEffect(() => {
    if (!session?.user?.email) return;
    if (!isC3HDirector(session.user.email) && !isC3HGovernanceReader(session.user.email)) return;
    getDocs(collection(db, 'volunteer_agreement_signatures'))
      .then((snap) => {
        const emails = new Set<string>();
        snap.forEach((d) => {
          const data = d.data() as { signerEmail?: string };
          if (data.signerEmail) emails.add(data.signerEmail.toLowerCase());
        });
        setVaSigners(emails);
      })
      .catch(() => {
        /* read failure is non-fatal */
      });

    getDocs(collection(db, 'officer_appointment_signatures'))
      .then((snap) => {
        const emails = new Set<string>();
        snap.forEach((d) => {
          const data = d.data() as { signerWorkspaceEmail?: string };
          if (data.signerWorkspaceEmail) emails.add(data.signerWorkspaceEmail.toLowerCase());
        });
        setOaSigners(emails);
      })
      .catch(() => {
        /* read failure is non-fatal */
      });
  }, [session?.user?.email]);

  const userEmail = session?.user?.email || '';
  const isDirector = isC3HDirector(userEmail);
  const isGovernanceReader = isC3HGovernanceReader(userEmail);
  const isPresident = isC3HPresident(userEmail);
  // Pavilion is open to directors (full) + governance readers (Treasurer +
  // Secretary, docs only — no signing trackers, no resolutions). Captains
  // and players have no Pavilion access.
  const canSign = isDirector;
  const canVote = isDirector;
  // Trackers (director status grid, officer onboarding tracker, per-doc
  // sign-status grid) and Board Resolutions are director-only views.
  const canSeeTrackers = isDirector;

  // Resolve canonical workspace email for whichever role the user holds.
  // Used as the key for signature records (directors only sign here, but
  // officers still need a stable identity for read-only context).
  const userWorkspaceEmail = useMemo(
    () =>
      resolveDirectorWorkspaceEmail(userEmail) ??
      resolveOfficerWorkspaceEmail(userEmail) ??
      null,
    [userEmail],
  );
  const userRosterEntry = useMemo(
    () =>
      C3H_DIRECTOR_ROSTER.find((d) => d.workspaceEmail === userWorkspaceEmail) ??
      C3H_OFFICER_ROSTER.find((o) => o.workspaceEmail === userWorkspaceEmail) ??
      null,
    [userWorkspaceEmail],
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary-400 text-xl">Loading…</div>
      </div>
    );
  }
  if (!session) return null;

  // Pavilion is open to directors (full access — sign + vote) and the
  // Treasurer + Secretary (read-only — governance documents only, no
  // signing trackers, no board resolutions). Captains and players have
  // no Pavilion access.
  if (!isDirector && !isGovernanceReader) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
        <Navbar />
        <div className="pt-32 px-6 max-w-xl mx-auto text-center">
          <div className="glass rounded-2xl p-8 border border-white/10">
            <div className="text-3xl mb-3">🏛️</div>
            <h1 className="text-2xl font-bold text-white mb-2">The Pavilion is for directors, Treasurer, and Secretary</h1>
            <p className="text-sm text-gray-400 mb-4">
              You&apos;re signed in as <code className="text-primary-400">{userEmail}</code>, but this page is only
              accessible to the Club&apos;s elected directors plus the Treasurer and Secretary, who have read-only
              access to governance documents. If you should have access, please contact{' '}
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

  const submitSignature = async (doc: GovernanceDoc, result: SignatureResult) => {
    if (!userWorkspaceEmail || !userRosterEntry) return;
    setBusyDocId(doc.id);
    try {
      const key = sigKey(doc.id, doc.version, userWorkspaceEmail);
      const record: Omit<SignatureRecord, 'signedAt'> & { signedAt: ReturnType<typeof serverTimestamp> } = {
        docId: doc.id,
        docVersion: doc.version,
        signerWorkspaceEmail: userWorkspaceEmail,
        signerLoginEmail: userEmail.toLowerCase(),
        signerName: userRosterEntry.name,
        signerRole: userRosterEntry.role,
        signedAt: serverTimestamp(),
        signatureType: result.type,
        signatureData: result.data,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      };
      await setDoc(doc_ref(key), record);
      setOpenSignerFor(null);
    } finally {
      setBusyDocId(null);
    }
  };

  // Withdraw the current director's signature on a document. Append-only:
  // we never delete the original signature record — we write a revocation
  // event that the UI treats as making the signature inactive. Re-signing
  // at the same version is not supported (bump the doc version instead).
  const submitRevocation = async (gd: GovernanceDoc) => {
    if (!userWorkspaceEmail || !userRosterEntry) return;
    setBusyRevokeDocId(gd.id);
    try {
      const key = sigKey(gd.id, gd.version, userWorkspaceEmail);
      const trimmedReason = revokeReason.trim();
      const record = {
        docId: gd.id,
        docVersion: gd.version,
        signerWorkspaceEmail: userWorkspaceEmail,
        signerLoginEmail: userEmail.toLowerCase(),
        signerName: userRosterEntry.name,
        signerRole: userRosterEntry.role,
        revokedAt: serverTimestamp(),
        ...(trimmedReason ? { reason: trimmedReason } : {}),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      };
      await setDoc(doc(db, REVOKE_COLLECTION, key), record);
      setOpenRevokeFor(null);
      setRevokeReason('');
    } finally {
      setBusyRevokeDocId(null);
    }
  };

  // President-only: toggle a document's "ready to send" status. Writes the
  // operational dispatch status to governance_approvals. Mutable by design
  // (the President may put a document back on hold before submission).
  const setApprovalStatus = async (gd: GovernanceDoc, status: 'ready' | 'held') => {
    if (!isPresident || !userWorkspaceEmail || !userRosterEntry) return;
    setBusyApprovalDocId(gd.id);
    try {
      const key = approvalKey(gd.id, gd.version);
      const record = {
        docId: gd.id,
        docVersion: gd.version,
        status,
        approverWorkspaceEmail: userWorkspaceEmail,
        approverName: userRosterEntry.name,
        approverRole: 'President',
        updatedAt: serverTimestamp(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      };
      await setDoc(doc(db, APPROVAL_COLLECTION, key), record);
    } finally {
      setBusyApprovalDocId(null);
    }
  };

  const requiredSignersFor = (gd: GovernanceDoc): typeof C3H_DIRECTOR_ROSTER => {
    if (gd.whoMustSign === 'all-directors') return C3H_DIRECTOR_ROSTER;
    const conflicted = new Set(gd.conflictedSigners ?? []);
    return C3H_DIRECTOR_ROSTER.filter((d) => !conflicted.has(d.workspaceEmail)) as unknown as typeof C3H_DIRECTOR_ROSTER;
  };

  const isRevoked = (gd: GovernanceDoc, workspaceEmail: string) =>
    !!revocations[sigKey(gd.id, gd.version, workspaceEmail)];

  // A signature counts only if it exists AND has not been revoked.
  const signedCount = (gd: GovernanceDoc) =>
    requiredSignersFor(gd).filter(
      (d) =>
        !!signatures[sigKey(gd.id, gd.version, d.workspaceEmail)] &&
        !isRevoked(gd, d.workspaceEmail),
    ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />
      <section className="section-padding pt-28 md:pt-32">
        <div className="max-w-5xl mx-auto">

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🏛️</span>
              <h1 className="text-3xl md:text-4xl font-bold text-white">The Pavilion</h1>
            </div>
            <p className="text-gray-400 text-sm">
              Governance hub for Challengers Cricket Club. Directors sign corporate agreements and vote on
              board resolutions; the Treasurer and Secretary have read-only access to the governance
              documents themselves. All signatures and votes are timestamped and stored in the Club&apos;s
              permanent governance ledger.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              You are signed in as <strong className="text-white">{userRosterEntry?.name}</strong> ({userRosterEntry?.role}) — <code className="text-primary-400">{userWorkspaceEmail}</code>.
            </p>
          </div>

          {/* Read-only banner for Treasurer / Secretary — makes the limited
              access mode unambiguous. They see the governance documents
              themselves but not the signing trackers or the board
              resolutions. */}
          {!isDirector && isGovernanceReader && (
            <div className="mb-6 rounded-xl bg-amber-500/5 border border-amber-500/30 p-4">
              <p className="text-sm font-bold text-amber-300 mb-1 flex items-center gap-2">
                <span>🔒</span>
                <span>Read-only access — Treasurer / Secretary view</span>
              </p>
              <p className="text-xs text-amber-100 leading-relaxed">
                You can read the Club&apos;s governance documents (Technology Governance Record, Letter of
                Direction, etc.) for visibility into the Club&apos;s digital and operational arrangements.
                Signing trackers, the director onboarding tracker, and board resolutions are reserved for the
                elected directors under the Bylaws and are not shown in this view.
              </p>
            </div>
          )}

          {/* My Volunteer Agreement status — every member (including directors)
              should sign this. Show a clear CTA if the current user hasn't yet. */}
          {userWorkspaceEmail && (() => {
            const myVaSigned =
              vaSigners.has(userWorkspaceEmail) ||
              (userRosterEntry?.personalEmail
                ? vaSigners.has(userRosterEntry.personalEmail.toLowerCase())
                : false);
            return myVaSigned ? (
              <div className="mb-6 rounded-xl bg-primary-500/5 border border-primary-500/20 p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm text-primary-300">
                  ✓ You&apos;ve signed the Volunteer Agreement.
                </div>
                <a href="/legal/volunteer-agreement" className="text-xs text-gray-400 hover:text-primary-400 underline">
                  View / print my signed copy
                </a>
              </div>
            ) : (
              <div className="mb-6 rounded-xl bg-amber-500/5 border border-amber-500/30 p-4">
                <p className="text-sm text-amber-200 mb-2">
                  ⚠ You haven&apos;t signed the Volunteer Agreement yet. Every member (directors included) is
                  expected to sign it as part of onboarding.
                </p>
                <a
                  href="/legal/volunteer-agreement"
                  className="inline-block px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-all"
                >
                  Open and e-sign my Volunteer Agreement →
                </a>
              </div>
            );
          })()}

          {loadingSigs ? (
            <div className="text-gray-400 text-sm">Loading governance ledger…</div>
          ) : (
            <div className="space-y-6">
              {GOVERNANCE_DOCS.map((gd) => {
                const required = requiredSignersFor(gd);
                const total = required.length;
                const signed = signedCount(gd);
                const myKey = userWorkspaceEmail ? sigKey(gd.id, gd.version, userWorkspaceEmail) : '';
                const mySig = myKey ? signatures[myKey] : undefined;
                const myRev = myKey ? revocations[myKey] : undefined;
                const isConflicted = (gd.conflictedSigners ?? []).includes(userWorkspaceEmail || '');
                const isOpen = openContentFor === gd.id;
                const isSigning = openSignerFor === gd.id;
                const isRevoking = openRevokeFor === gd.id;
                const fullySigned = signed === total;
                const approval = gd.requiresPresidentApproval
                  ? approvals[approvalKey(gd.id, gd.version)]
                  : undefined;
                const isReadyToSend = approval?.status === 'ready';

                return (
                  <article key={gd.id} className="glass rounded-2xl p-6 border border-white/10">

                    <header className="flex items-start justify-between gap-4 flex-wrap mb-4">
                      <div className="flex-1 min-w-[260px]">
                        <h2 className="text-xl font-bold text-white">{gd.title}</h2>
                        <p className="text-xs text-gray-500 mt-1">Version {gd.version} · Effective {gd.effective}</p>
                        <p className="text-sm text-gray-300 mt-2">{gd.summary}</p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xs font-semibold px-3 py-1 rounded-full inline-block ${
                            fullySigned
                              ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {`${signed} / ${total} signed`}
                        </div>
                      </div>
                    </header>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setOpenContentFor(isOpen ? null : gd.id)}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 hover:bg-white/10 transition-all"
                      >
                        {isOpen ? 'Hide document' : 'Read document'}
                      </button>
                      {gd.publicUrl && (
                        <a
                          href={gd.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 hover:bg-white/10 transition-all"
                        >
                          Public version ↗
                        </a>
                      )}
                      {gd.printUrl && (
                        <a
                          href={gd.printUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-lg bg-accent-500/10 border border-accent-500/40 text-sm text-accent-300 hover:bg-accent-500/20 transition-all"
                        >
                          {fullySigned ? '🖨️ Print signed PDF ↗' : '🖨️ Preview / print ↗'}
                        </a>
                      )}
                      {!canSign ? (
                        <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400">
                          🔒 Read-only · Directors sign this document
                        </span>
                      ) : isConflicted ? (
                        <span className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300">
                          You are recused (conflict of interest declared)
                        </span>
                      ) : myRev ? (
                        <span className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
                          ⊘ You revoked your signature on {myRev.revokedAt ? myRev.revokedAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'pending sync'}
                        </span>
                      ) : mySig ? (
                        <>
                          <span className="px-4 py-2 rounded-lg bg-primary-500/10 border border-primary-500/30 text-sm text-primary-300">
                            ✓ You signed on {mySig.signedAt ? mySig.signedAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'pending sync'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setRevokeReason('');
                              setOpenRevokeFor(isRevoking ? null : gd.id);
                            }}
                            className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-sm text-red-300 hover:bg-red-500/20 transition-all"
                          >
                            {isRevoking ? 'Cancel' : 'Revoke my signature'}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOpenSignerFor(isSigning ? null : gd.id)}
                          className="px-5 py-2 rounded-lg bg-primary-500 text-black font-semibold text-sm hover:bg-primary-400 transition-all"
                        >
                          {isSigning ? 'Cancel' : 'Sign this document'}
                        </button>
                      )}
                    </div>

                    {/* President "ready to send" gate — externally-submitted
                        docs (the LoDs) need the President's final sign-off
                        after all directors have signed. */}
                    {gd.requiresPresidentApproval && (
                      <div
                        className={`rounded-xl border p-4 mb-4 ${
                          isReadyToSend
                            ? 'bg-primary-500/5 border-primary-500/30'
                            : 'bg-white/3 border-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white flex items-center gap-2">
                              <span>🪶</span>
                              <span>President sign-off — ready to send to CIBC</span>
                            </p>
                            {isReadyToSend ? (
                              <p className="text-xs text-primary-300 mt-1">
                                ✓ Marked ready to send by {approval?.approverName || 'the President'}
                                {approval?.updatedAt ? ` on ${approval.updatedAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}` : ''}.
                                This Letter may now be exported and submitted to the bank.
                              </p>
                            ) : fullySigned ? (
                              <p className="text-xs text-amber-300 mt-1">
                                All {total} directors have signed. Awaiting the President&apos;s final sign-off before this Letter is submitted to CIBC.
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400 mt-1">
                                The President can mark this Letter ready to send once all {total} directors have signed ({signed}/{total} so far).
                              </p>
                            )}
                          </div>
                          {isPresident && (
                            isReadyToSend ? (
                              <button
                                type="button"
                                disabled={busyApprovalDocId === gd.id}
                                onClick={() => setApprovalStatus(gd, 'held')}
                                className="px-4 py-2 rounded-lg bg-white/5 border border-amber-500/40 text-sm text-amber-300 hover:bg-amber-500/10 transition-all disabled:opacity-50 whitespace-nowrap"
                              >
                                {busyApprovalDocId === gd.id ? 'Saving…' : 'Put back on hold'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={!fullySigned || busyApprovalDocId === gd.id}
                                onClick={() => setApprovalStatus(gd, 'ready')}
                                title={fullySigned ? undefined : 'All directors must sign first'}
                                className="px-4 py-2 rounded-lg bg-primary-500 text-black font-semibold text-sm hover:bg-primary-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                {busyApprovalDocId === gd.id ? 'Saving…' : 'Mark ready to send'}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {isOpen && (
                      <div className="rounded-xl bg-black/30 border border-white/10 p-5 mb-4 max-h-[420px] overflow-y-auto">
                        {gd.inline === 'technology-governance-record-2026' ? (
                          <TechnologyGovernanceRecord />
                        ) : gd.inline === 'lod-cibc-gokul-2026' ? (
                          <LetterOfDirection recipient="gokul" />
                        ) : gd.inline === 'lod-cibc-qaiser-2026' ? (
                          <LetterOfDirection recipient="qaiser" />
                        ) : gd.inline === 'president-appointment-gokul-2026' ? (
                          <PresidentAppointment />
                        ) : gd.publicUrl ? (
                          <p className="text-sm text-gray-400 italic">
                            The full text of this document is published publicly at{' '}
                            <a href={gd.publicUrl} target="_blank" rel="noopener noreferrer" className="text-primary-400 underline">
                              {gd.publicUrl}
                            </a>
                            . Please open it in a new tab and read it before signing.
                          </p>
                        ) : null}
                      </div>
                    )}

                    {isSigning && !mySig && !myRev && !isConflicted && userRosterEntry && (
                      <div className="mb-4">
                        <SignaturePad
                          signerName={userRosterEntry.name}
                          busy={busyDocId === gd.id}
                          onCancel={() => setOpenSignerFor(null)}
                          onSubmit={(result) => submitSignature(gd, result)}
                        />
                      </div>
                    )}

                    {isRevoking && mySig && !myRev && canSign && (
                      <div className="mb-4 rounded-xl bg-red-500/5 border border-red-500/30 p-4">
                        <p className="text-sm font-semibold text-red-300 mb-1">Withdraw your signature?</p>
                        <p className="text-xs text-red-100/80 leading-relaxed mb-3">
                          This records a <strong>revocation</strong> of your signature on <strong>{gd.title}</strong> (v{gd.version}).
                          Your original signature is not deleted — the Club&apos;s ledger keeps the full
                          signed-then-revoked history — but the document will no longer count you as a current
                          signatory. You will <strong>not</strong> be able to re-sign this same version; to sign
                          again the document must be re-issued at a new version.
                        </p>
                        <label className="block text-xs text-gray-400 mb-1">Reason (optional, recorded with the revocation)</label>
                        <textarea
                          value={revokeReason}
                          onChange={(e) => setRevokeReason(e.target.value)}
                          rows={2}
                          maxLength={2000}
                          placeholder="e.g. Withdrawing pending board discussion"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none mb-3"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={busyRevokeDocId === gd.id}
                            onClick={() => submitRevocation(gd)}
                            className="px-5 py-2 rounded-lg bg-red-500 text-black font-semibold text-sm hover:bg-red-400 transition-all disabled:opacity-50"
                          >
                            {busyRevokeDocId === gd.id ? 'Revoking…' : 'Confirm revocation'}
                          </button>
                          <button
                            type="button"
                            disabled={busyRevokeDocId === gd.id}
                            onClick={() => { setOpenRevokeFor(null); setRevokeReason(''); }}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all"
                          >
                            Keep my signature
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Sign-status grid — director-only view */}
                    {canSeeTrackers && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Director status</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {required.map((d) => {
                          const sig = signatures[sigKey(gd.id, gd.version, d.workspaceEmail)];
                          const rev = revocations[sigKey(gd.id, gd.version, d.workspaceEmail)];
                          const isSelf = d.workspaceEmail === userWorkspaceEmail;
                          const signedVa =
                            vaSigners.has(d.workspaceEmail) ||
                            (d.personalEmail ? vaSigners.has(d.personalEmail.toLowerCase()) : false);
                          return (
                            <div
                              key={d.workspaceEmail}
                              className={`rounded-lg px-3 py-2 border text-sm ${
                                rev
                                  ? 'bg-red-500/5 border-red-500/20'
                                  : sig
                                  ? 'bg-primary-500/5 border-primary-500/20'
                                  : 'bg-white/3 border-white/10'
                              } ${isSelf ? 'ring-1 ring-accent-500/40' : ''}`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-white font-medium truncate">{d.name}</div>
                                  <div className="text-xs text-gray-500 truncate">{d.role}</div>
                                </div>
                                {rev ? (
                                  <div className="text-right">
                                    <div className="text-red-400 text-xs font-semibold">⊘ Revoked</div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">
                                      {rev.revokedAt ? rev.revokedAt.toDate().toLocaleDateString() : '…'}
                                    </div>
                                    <div className="text-[10px] text-gray-500">VA: {signedVa ? '✓' : '—'}</div>
                                  </div>
                                ) : sig ? (
                                  <div className="text-right">
                                    <div className="text-primary-400 text-xs font-semibold">✓ Signed</div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">
                                      {sig.signedAt ? sig.signedAt.toDate().toLocaleDateString() : '…'} · {sig.signatureType}
                                    </div>
                                    <div className="text-[10px] text-gray-500">VA: {signedVa ? '✓' : '—'}</div>
                                  </div>
                                ) : (
                                  <div className="text-right">
                                    <div className="text-amber-400 text-xs font-semibold">Pending</div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">VA: {signedVa ? '✓' : '—'}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {(gd.conflictedSigners ?? []).length > 0 && (
                        <p className="text-xs text-gray-500 mt-3 italic">
                          Recused (conflict of interest):{' '}
                          {(gd.conflictedSigners ?? [])
                            .map((e) => C3H_DIRECTOR_ROSTER.find((d) => d.workspaceEmail === e)?.name || e)
                            .join(', ')}.
                        </p>
                      )}
                    </div>
                    )}

                  </article>
                );
              })}
            </div>
          )}

          {/* Officer & captain onboarding — director-only view */}
          {canSeeTrackers && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-white mb-1">Officer &amp; captain onboarding</h2>
            <p className="text-sm text-gray-400 mb-4">
              Officers and captains are <strong className="text-white">not directors</strong> and do not sign corporate
              agreements above. They are listed here so the board can see who still needs to log into C3H, claim
              their <code className="text-primary-400">@challengerscc.ca</code> Workspace email, and complete their
              own onboarding (Volunteer Agreement, Code of Conduct, Conflict of Interest declaration).
            </p>
            <div className="glass rounded-2xl p-5 border border-white/10">
              <div className="grid sm:grid-cols-2 gap-2">
                {C3H_OFFICER_ROSTER.map((o) => {
                  const signedVa =
                    vaSigners.has(o.workspaceEmail) ||
                    (o.personalEmail ? vaSigners.has(o.personalEmail.toLowerCase()) : false);
                  const signedOa = oaSigners.has(o.workspaceEmail);
                  const onboarded = signedVa && signedOa;
                  return (
                    <div key={o.workspaceEmail} className="rounded-lg px-3 py-2 border bg-white/3 border-white/10 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate">{o.name}</div>
                          <div className="text-xs text-gray-500 truncate">{o.role} · <span className="text-gray-400">{o.workspaceEmail}</span></div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-semibold ${onboarded ? 'text-primary-400' : 'text-amber-400'}`}>
                            {onboarded ? '✓ Onboarded' : 'Awaiting onboarding'}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            VA: {signedVa ? '✓' : '—'} · Officer: {signedOa ? '✓' : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">
                Status will flip to ✓ Onboarded once the person logs in to C3H and signs at least one document
                acknowledged through the portal.
              </p>
            </div>
          </div>
          )}

          {/* Board Resolutions + voting — director-only view */}
          {canSeeTrackers && (
            <div className="mt-10 glass rounded-2xl p-6 border border-white/10">
              {userWorkspaceEmail && userRosterEntry && (
                <Resolutions
                  userEmail={userEmail}
                  userWorkspaceEmail={userWorkspaceEmail}
                  userName={userRosterEntry.name}
                  canVote={canVote}
                />
              )}
            </div>
          )}

          <div className="mt-10 rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 text-sm text-amber-200">
            <strong className="text-amber-300">A note on e-signatures.</strong> This Pavilion records electronic
            signatures in the Club&apos;s Firestore governance ledger with the signer&apos;s email, name, role, IP
            timestamp, and a copy of the signature image (drawn) or typed text. Under Ontario&apos;s
            <em> Electronic Commerce Act, 2000</em> and Canada&apos;s <em>UECA</em>, electronic signatures are
            generally enforceable for governance documents of this kind. The signed records are designed to be
            exported for paper-and-ink confirmation if requested by a regulator or lawyer.
          </div>

        </div>
      </section>
    </div>
  );
}

// Helper — accepts string key, returns Firestore doc reference. Kept
// outside the component to avoid re-creating per render.
function doc_ref(key: string) {
  return doc(db, SIG_COLLECTION, key);
}
