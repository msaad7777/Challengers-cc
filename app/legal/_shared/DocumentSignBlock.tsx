"use client";

// Generic e-sign block reused across legal documents (Liability Waiver,
// Code of Conduct, Photography Consent, etc.). Handles auth gating,
// existing-signature read, signed view with print, and SignaturePad
// (typed + drawn). Each consumer page passes:
//  - docId / docVersion / collection (Firestore)
//  - optional `renderExtraFields` for doc-specific inputs (DOB,
//    emergency contact, opt-out checkbox, etc.)
//  - optional `validateExtra` to gate submit on those inputs

import { useEffect, useState, type ReactNode } from 'react';
import { useSession, signIn } from 'next-auth/react';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db, firebaseAuthReady } from '@/lib/firebase';
import { resolveDirectorWorkspaceEmail, resolveOfficerWorkspaceEmail } from '@/lib/c3h-access';
import SignaturePad, { type SignatureResult } from '@/app/c3h/pavilion/SignaturePad';

export type SignatureRecord = {
  docId: string;
  docVersion: string;
  signerEmail: string;
  signerName: string;
  signedAt: Timestamp | null;
  signatureType: 'typed' | 'drawn';
  signatureData: string;
  userAgent: string;
  // Doc-specific fields are merged in via extraData
} & Record<string, unknown>;

type Props = {
  docId: string;
  docVersion: string;
  collection: string;
  // Optional doc-specific fields rendered above the SignaturePad.
  // Receives extraData state + setter so the page can read/write its
  // own fields (DOB, emergency contact, opt-out, etc.).
  renderExtraFields?: (props: {
    extraData: Record<string, unknown>;
    setExtra: (key: string, value: unknown) => void;
    existingRecord: SignatureRecord | null;
  }) => ReactNode;
  // Validate extra fields before signing is enabled. Returns error
  // string or null if valid.
  validateExtra?: (extraData: Record<string, unknown>) => string | null;
  // Render the signed-copy view's extra-field row (when re-displaying
  // a signed record). Defaults to none.
  renderSignedExtra?: (record: SignatureRecord) => ReactNode;
};

function safeUserKey(email: string) {
  return email.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// Canonical email for signing keys. Directors/officers map to their
// workspace email so signing with either workspace OR personal Gmail
// produces the same Firestore record. Everyone else uses their login
// email as-is.
function canonicalEmailFor(loginEmail: string): string {
  return (
    resolveDirectorWorkspaceEmail(loginEmail) ??
    resolveOfficerWorkspaceEmail(loginEmail) ??
    loginEmail.toLowerCase()
  );
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function DocumentSignBlock({
  docId,
  docVersion,
  collection,
  renderExtraFields,
  validateExtra,
  renderSignedExtra,
}: Props) {
  const { data: session, status } = useSession();
  const [existing, setExisting] = useState<SignatureRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [extraData, setExtraData] = useState<Record<string, unknown>>({});
  const [showPad, setShowPad] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setExtra = (key: string, value: unknown) =>
    setExtraData((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (session?.user?.name && !name) setName(session.user.name);
  }, [session?.user?.name, name]);

  useEffect(() => {
    let cancelled = false;
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }
    const loginEmail = session.user.email;
    const canonicalKey = safeUserKey(canonicalEmailFor(loginEmail));
    const loginKey = safeUserKey(loginEmail);
    setLoading(true);
    firebaseAuthReady()
      .then(async () => {
        // Try canonical key first (workspace email for directors/officers).
        const canonicalSnap = await getDoc(doc(db, collection, canonicalKey));
        if (canonicalSnap.exists()) return canonicalSnap.data() as SignatureRecord;
        // Fall back to login-email key — preserves visibility of records
        // that were saved before the canonical-key normalization landed.
        if (canonicalKey !== loginKey) {
          const fallback = await getDoc(doc(db, collection, loginKey));
          if (fallback.exists()) return fallback.data() as SignatureRecord;
        }
        return null;
      })
      .then((data) => {
        if (cancelled) return;
        if (data) setExisting(data);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [session?.user?.email, collection]);

  const handleSubmit = async (sig: SignatureResult) => {
    if (!session?.user?.email) return;
    if (name.trim().length < 2) {
      setError('Please enter your full legal name.');
      return;
    }
    const extraValidation = validateExtra?.(extraData);
    if (extraValidation) {
      setError(extraValidation);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const loginEmail = session.user.email;
      const canonical = canonicalEmailFor(loginEmail);
      const userKey = safeUserKey(canonical);
      const record = {
        ...extraData,
        docId,
        docVersion,
        signerEmail: canonical,           // canonical (workspace for directors/officers)
        signerLoginEmail: loginEmail.toLowerCase(), // actual login email used
        signerName: name.trim(),
        signedAt: serverTimestamp(),
        signatureType: sig.type,
        signatureData: sig.data,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      };
      await setDoc(doc(db, collection, userKey), record);
      const snap = await getDoc(doc(db, collection, userKey));
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

  if (!session) {
    return (
      <div className="rounded-xl bg-primary-500/5 border-2 border-primary-500/30 p-5">
        <p className="text-sm text-gray-200 mb-3">
          Sign in with your Google account to e-sign this document. Your signature will be timestamped and
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
            <p className="text-xs text-gray-400 print:text-gray-700 uppercase tracking-wider mb-1">Signer</p>
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
              // Drawn signatures are captured as white ink on transparent PNG
              // (matches the SignaturePad's dark canvas). bg-black container
              // makes them visible on screen. print:invert + print:bg-white
              // flip the ink to black for the printed PDF (otherwise white ink
              // on white paper is invisible).
              <img
                src={existing.signatureData}
                alt="Your signature"
                className="bg-black rounded border border-white/20 max-h-20 print:invert print:bg-white print:border-black"
              />
            ) : (
              <p className="text-2xl text-white print:text-black" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                {existing.signatureData}
              </p>
            )}
          </div>
        </div>
        {renderSignedExtra && (
          <div className="rounded-lg bg-white/5 border border-white/10 print:border-black p-3 text-sm">
            {renderSignedExtra(existing)}
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-primary-500 text-black font-semibold hover:bg-primary-400 transition-all text-sm"
          >
            Print or save as PDF
          </button>
          <span className="text-xs text-gray-500 self-center">
            Forward the saved PDF to <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline">contact@challengerscc.ca</a> for our records.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white/5 border-2 border-white/10 p-5">
      <h3 className="text-lg font-bold text-white mb-3">Sign electronically</h3>
      <p className="text-sm text-gray-400 mb-4">
        Your signature will be timestamped (date auto-filled). Under Ontario&apos;s
        {' '}<em>Electronic Commerce Act, 2000</em> and Canada&apos;s <em>UECA</em>, an electronic signature
        collected this way is enforceable for documents of this kind.
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
      </div>

      {renderExtraFields && (
        <div className="mb-4">
          {renderExtraFields({ extraData, setExtra, existingRecord: existing })}
        </div>
      )}

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
            const extraValidation = validateExtra?.(extraData);
            if (extraValidation) {
              setError(extraValidation);
              return;
            }
            setError(null);
            setShowPad(true);
          }}
          className="px-5 py-2 rounded-lg bg-primary-500 text-black font-semibold hover:bg-primary-400 transition-all"
        >
          Sign this document
        </button>
      )}
    </div>
  );
}
