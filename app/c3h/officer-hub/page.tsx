"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db, firebaseAuthReady } from '@/lib/firebase';
import {
  C3H_OFFICER_ROSTER,
  isC3HOfficer,
  resolveOfficerWorkspaceEmail,
} from '@/lib/c3h-access';
import Navbar from '@/components/Navbar';
import SignaturePad, { type SignatureResult } from '@/app/c3h/pavilion/SignaturePad';
import OfficerAppointment from './OfficerAppointment';

const COLLECTION = 'officer_appointment_signatures';
const DOC_ID = 'officer-appointment-confirmation';
const DOC_VERSION = '1.0';

type SignatureRecord = {
  docId: string;
  docVersion: string;
  signerEmail: string;
  signerWorkspaceEmail: string;
  signerName: string;
  signerRole: string;
  effectiveFrom: string;
  signedAt: Timestamp | null;
  signatureType: 'typed' | 'drawn';
  signatureData: string;
  userAgent: string;
};

function safeUserKey(email: string) {
  return email.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

export default function OfficerHubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [existing, setExisting] = useState<SignatureRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPad, setShowPad] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  const userEmail = session?.user?.email || '';
  const officerWorkspaceEmail = resolveOfficerWorkspaceEmail(userEmail);
  const officer = C3H_OFFICER_ROSTER.find(
    (o) => o.workspaceEmail === officerWorkspaceEmail,
  );

  useEffect(() => {
    let cancelled = false;
    if (!officer) {
      setLoading(false);
      return;
    }
    const userKey = safeUserKey(officer.workspaceEmail);
    setLoading(true);
    firebaseAuthReady()
      .then(() => getDoc(doc(db, COLLECTION, userKey)))
      .then((snap) => {
        if (cancelled) return;
        if (snap.exists()) setExisting(snap.data() as SignatureRecord);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [officer]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary-400 text-xl">Loading…</div>
      </div>
    );
  }
  if (!session) return null;

  // Hard gate: only officers
  if (!isC3HOfficer(userEmail)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
        <Navbar />
        <div className="pt-32 px-6 max-w-xl mx-auto text-center">
          <div className="glass rounded-2xl p-8 border border-white/10">
            <div className="text-3xl mb-3">🎩</div>
            <h1 className="text-2xl font-bold text-white mb-2">The Officer Hub is for officers</h1>
            <p className="text-sm text-gray-400 mb-4">
              You&apos;re signed in as <code className="text-primary-400">{userEmail}</code>, but this page is only
              accessible to current officers of Challengers Cricket Club. If you should have access, please
              contact <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline">contact@challengerscc.ca</a>.
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

  if (!officer) return null;

  const effectiveFrom = '12 November 2025';
  const reaffirmedDate = '6 May 2026';

  const handleSubmit = async (sig: SignatureResult) => {
    if (!officer) return;
    setBusy(true);
    try {
      const userKey = safeUserKey(officer.workspaceEmail);
      const record = {
        docId: DOC_ID,
        docVersion: DOC_VERSION,
        signerEmail: userEmail.toLowerCase(),
        signerWorkspaceEmail: officer.workspaceEmail,
        signerName: officer.name,
        signerRole: officer.role,
        effectiveFrom,
        signedAt: serverTimestamp(),
        signatureType: sig.type,
        signatureData: sig.data,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      };
      await setDoc(doc(db, COLLECTION, userKey), record);
      const snap = await getDoc(doc(db, COLLECTION, userKey));
      if (snap.exists()) setExisting(snap.data() as SignatureRecord);
      setShowPad(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />
      <section className="section-padding pt-28 md:pt-32">
        <div className="max-w-4xl mx-auto">

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎩</span>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Officer Hub</h1>
            </div>
            <p className="text-gray-400 text-sm">
              Officer-specific governance documents. E-sign your appointment confirmation here.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              You are signed in as <strong className="text-white">{officer.name}</strong> ({officer.role}) — <code className="text-primary-400">{officer.workspaceEmail}</code>.
            </p>
          </div>

          {loading ? (
            <div className="text-gray-400 text-sm">Loading your signing status…</div>
          ) : (
            <article className="glass rounded-2xl p-6 border border-white/10">
              <header className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div className="flex-1 min-w-[260px]">
                  <h2 className="text-xl font-bold text-white">Officer Appointment &amp; Volunteer Status Confirmation</h2>
                  <p className="text-xs text-gray-500 mt-1">Version {DOC_VERSION} · Effective {reaffirmedDate}</p>
                  <p className="text-sm text-gray-300 mt-2">
                    Confirms that <strong className="text-white">{officer.name}</strong> serves as
                    {' '}<strong className="text-white">{officer.role}</strong> on a strictly volunteer basis. The work
                    is unpaid; no compensation is owed now or in future. Past expenses already advanced for the
                    Club&apos;s benefit are documented separately on the Schedule of Founder Advances and remain
                    repayable.
                  </p>
                </div>
                <div className="text-right">
                  {existing ? (
                    <div className="text-xs font-semibold px-3 py-1 rounded-full inline-block bg-primary-500/20 text-primary-400 border border-primary-500/30">
                      ✓ Signed
                    </div>
                  ) : (
                    <div className="text-xs font-semibold px-3 py-1 rounded-full inline-block bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Pending signature
                    </div>
                  )}
                </div>
              </header>

              <div className="rounded-xl bg-black/30 border border-white/10 p-5 mb-4 max-h-[420px] overflow-y-auto">
                <OfficerAppointment
                  officerName={officer.name}
                  role={officer.role}
                  effectiveFrom={effectiveFrom}
                  reaffirmedDate={reaffirmedDate}
                />
              </div>

              {existing ? (
                <div className="rounded-xl bg-primary-500/5 border-2 border-primary-500/30 p-5 print:bg-white print:border-black">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">✓</span>
                    <h3 className="text-lg font-bold text-white print:text-black">
                      Signed on {existing.signedAt
                        ? existing.signedAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'pending sync'}
                    </h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 print:text-gray-700 uppercase tracking-wider mb-1">Officer Name</p>
                      <p className="text-white print:text-black">{existing.signerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 print:text-gray-700 uppercase tracking-wider mb-1">Role</p>
                      <p className="text-white print:text-black">{existing.signerRole}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 print:text-gray-700 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-white print:text-black break-all">{existing.signerEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 print:text-gray-700 uppercase tracking-wider mb-1">Signature</p>
                      {existing.signatureType === 'drawn' ? (
                        <img src={existing.signatureData} alt="Your signature" className="bg-white rounded border border-white/20 max-h-20" />
                      ) : (
                        <p className="text-2xl text-white print:text-black" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                          {existing.signatureData}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 print:hidden">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-lg bg-primary-500 text-black font-semibold hover:bg-primary-400 transition-all text-sm"
                    >
                      Print or save as PDF
                    </button>
                    <span className="text-xs text-gray-500 self-center">
                      Forward the saved PDF to <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline">contact@challengerscc.ca</a> so Madhu can file it in our corporate records.
                    </span>
                  </div>
                </div>
              ) : showPad ? (
                <SignaturePad
                  signerName={officer.name}
                  busy={busy}
                  onCancel={() => setShowPad(false)}
                  onSubmit={handleSubmit}
                />
              ) : (
                <button
                  onClick={() => setShowPad(true)}
                  className="px-5 py-2 rounded-lg bg-primary-500 text-black font-semibold text-sm hover:bg-primary-400 transition-all"
                >
                  Sign this Confirmation
                </button>
              )}
            </article>
          )}

          <div className="mt-10 rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 text-sm text-amber-200">
            <strong className="text-amber-300">Two-step onboarding:</strong> please also e-sign the{' '}
            <a href="/legal/volunteer-agreement" className="text-primary-400 underline">Volunteer Agreement</a>{' '}
            if you haven&apos;t already. Both documents are required for your officer onboarding to be complete.
          </div>

          <div className="mt-6 rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 text-sm text-amber-200">
            <strong className="text-amber-300">A note on e-signatures.</strong> The Officer Hub records electronic
            signatures in the Club&apos;s governance ledger with the signer&apos;s email, name, role, timestamp, and a
            copy of the signature image (drawn) or typed text. Under Ontario&apos;s
            <em> Electronic Commerce Act, 2000</em> and Canada&apos;s <em>UECA</em>, electronic signatures are
            generally enforceable for documents of this kind.
          </div>

        </div>
      </section>
    </div>
  );
}
