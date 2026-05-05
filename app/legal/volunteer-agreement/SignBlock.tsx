"use client";

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db, firebaseAuthReady } from '@/lib/firebase';
import SignaturePad, { type SignatureResult } from '@/app/c3h/pavilion/SignaturePad';

const DOC_ID = 'volunteer-agreement';
const DOC_VERSION = '1.0';
const COLLECTION = 'volunteer_agreement_signatures';

type SignatureRecord = {
  docId: string;
  docVersion: string;
  signerEmail: string;
  signerName: string;
  signedAt: Timestamp | null;
  signatureType: 'typed' | 'drawn';
  signatureData: string;
  photoOptOut: boolean;
  userAgent: string;
};

function safeUserKey(email: string) {
  return email.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function todayIso() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function SignBlock() {
  const { data: session, status } = useSession();
  const [existing, setExisting] = useState<SignatureRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [photoOptOut, setPhotoOptOut] = useState(false);
  const [showPad, setShowPad] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.name && !name) setName(session.user.name);
  }, [session?.user?.name, name]);

  useEffect(() => {
    let cancelled = false;
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    firebaseAuthReady()
      .then(() => getDoc(doc(db, COLLECTION, safeUserKey(session.user!.email!))))
      .then((snap) => {
        if (cancelled) return;
        if (snap.exists()) setExisting(snap.data() as SignatureRecord);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load signature:', err);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [session?.user?.email]);

  const handleSubmit = async (sig: SignatureResult) => {
    if (!session?.user?.email) return;
    if (name.trim().length < 2) {
      setError('Please enter your full legal name.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const record = {
        docId: DOC_ID,
        docVersion: DOC_VERSION,
        signerEmail: session.user.email.toLowerCase(),
        signerName: name.trim(),
        signedAt: serverTimestamp(),
        signatureType: sig.type,
        signatureData: sig.data,
        photoOptOut,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      };
      const userKey = safeUserKey(session.user.email);
      await setDoc(doc(db, COLLECTION, userKey), record);
      const snap = await getDoc(doc(db, COLLECTION, userKey));
      if (snap.exists()) setExisting(snap.data() as SignatureRecord);
      setShowPad(false);
    } catch (err) {
      console.error('Sign failed:', err);
      setError('Could not save your signature. Try again or contact contact@challengerscc.ca.');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="text-sm text-gray-400">Loading…</div>;
  }

  // ── Not signed in ────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="rounded-xl bg-primary-500/5 border-2 border-primary-500/30 p-5">
        <p className="text-sm text-gray-200 mb-3">
          Sign in with your Google account to e-sign this Agreement. Your signature will be timestamped and
          stored in the Club&apos;s governance ledger.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => signIn('google')}
            className="px-5 py-2 rounded-lg bg-primary-500 text-black font-semibold hover:bg-primary-400 transition-all"
          >
            Sign in with Google to e-sign
          </button>
          <span className="text-xs text-gray-500">Or print this page and sign on paper if you prefer.</span>
        </div>
      </div>
    );
  }

  // ── Already signed ───────────────────────────────────────────────
  if (existing) {
    const signedDate = existing.signedAt
      ? existing.signedAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      : 'pending sync';
    return (
      <div className="rounded-xl bg-primary-500/5 border-2 border-primary-500/30 p-5 print:bg-white print:border-black">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">✓</span>
          <h3 className="text-lg font-bold text-white print:text-black">Signed on {signedDate}</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 print:text-gray-700 uppercase tracking-wider mb-1">Volunteer Name</p>
            <p className="text-white print:text-black">{existing.signerName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 print:text-gray-700 uppercase tracking-wider mb-1">Email</p>
            <p className="text-white print:text-black break-all">{existing.signerEmail}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 print:text-gray-700 uppercase tracking-wider mb-1">Date Signed</p>
            <p className="text-white print:text-black">{signedDate}</p>
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
        <div className="rounded-lg bg-white/5 border border-white/10 print:border-black p-3 text-sm">
          <strong className="text-white print:text-black">Photo / video use:</strong>{' '}
          {existing.photoOptOut ? (
            <span className="text-amber-300">Opted out</span>
          ) : (
            <span className="text-primary-300">Permission granted</span>
          )}
        </div>
        <div className="flex gap-2 mt-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-primary-500 text-black font-semibold hover:bg-primary-400 transition-all text-sm"
          >
            Print or save as PDF
          </button>
          <span className="text-xs text-gray-500 self-center">
            Use your browser&apos;s print dialog → &ldquo;Save as PDF&rdquo; for a digital copy.
          </span>
        </div>
        <p className="text-xs text-gray-500 print:text-gray-700 mt-4 italic">
          Recorded in the Club&apos;s governance ledger. To revise, contact{' '}
          <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline">
            contact@challengerscc.ca
          </a>.
        </p>
      </div>
    );
  }

  // ── Not signed yet — collect details and signature ───────────────
  return (
    <div className="rounded-xl bg-white/5 border-2 border-white/10 p-5">
      <h3 className="text-lg font-bold text-white mb-3">Sign electronically</h3>
      <p className="text-sm text-gray-400 mb-4">
        Your signature will be timestamped (date auto-filled). Under Ontario&apos;s
        {' '}<em>Electronic Commerce Act, 2000</em> and Canada&apos;s <em>UECA</em>, an electronic signature collected
        this way is enforceable for documents of this kind.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Full legal name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            placeholder="e.g. Mohammed Saad"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Email (from your Google account)</label>
          <input
            type="email"
            value={session.user?.email || ''}
            readOnly
            className="w-full bg-white/3 border border-white/5 rounded-lg px-3 py-2 text-gray-300 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Date</label>
          <input
            type="text"
            value={todayIso()}
            readOnly
            className="w-full bg-white/3 border border-white/5 rounded-lg px-3 py-2 text-gray-300 cursor-not-allowed"
          />
        </div>
        <div className="flex items-center">
          <label className="flex items-start gap-2 text-sm text-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={photoOptOut}
              onChange={(e) => setPhotoOptOut(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              <strong className="text-white">Opt out of photo/video use:</strong>{' '}
              I do <em>not</em> consent to my photograph or video being used in Club promotional materials.
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 mb-4">
          {error}
        </div>
      )}

      {showPad ? (
        <SignaturePad
          signerName={name}
          busy={busy}
          onCancel={() => setShowPad(false)}
          onSubmit={handleSubmit}
        />
      ) : (
        <button
          onClick={() => {
            if (name.trim().length < 2) {
              setError('Please enter your full legal name first.');
              return;
            }
            setError(null);
            setShowPad(true);
          }}
          className="px-5 py-2 rounded-lg bg-primary-500 text-black font-semibold hover:bg-primary-400 transition-all"
        >
          Sign this Agreement
        </button>
      )}
    </div>
  );
}
