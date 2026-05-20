"use client";

// Print-ready version of the Letter of Direction (CIBC — add Gokul +
// Qaiser). Renders on white paper in a light theme, pulls director
// signatures from the Firestore governance_signatures collection, and
// embeds each signature image above the typed director name. Designed
// for Cmd+P → "Save as PDF" → email to recipients.
//
// Access: directors + governance readers (Treasurer, Secretary). Qaiser
// (Treasurer) is the recipient and needs to be able to see his own
// pending Letter, hence governance readers are included.

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  C3H_DIRECTOR_ROSTER,
  isC3HDirector,
  isC3HGovernanceReader,
} from '@/lib/c3h-access';
import LetterPaper from '../../LetterPaper';

const DOC_ID = 'lod-cibc-gokul-qaiser-2026';

type SignatureRecord = {
  docId: string;
  docVersion: string;
  signerWorkspaceEmail: string;
  signerName: string;
  signerRole: string;
  signedAt: Timestamp | null;
  signatureType: 'typed' | 'drawn';
  signatureData: string;
};

function FillLine({ width = '220px' }: { width?: string }) {
  return (
    <span
      className="inline-block align-baseline border-b border-gray-500"
      style={{ minWidth: width, height: '14px' }}
    >
      &nbsp;
    </span>
  );
}

export default function LoDPrintPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [signatures, setSignatures] = useState<Record<string, SignatureRecord>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  const email = session?.user?.email || '';
  const canView = isC3HDirector(email) || isC3HGovernanceReader(email);

  useEffect(() => {
    if (!email || !canView) return;
    const q = query(collection(db, 'governance_signatures'), where('docId', '==', DOC_ID));
    getDocs(q)
      .then((snap) => {
        const map: Record<string, SignatureRecord> = {};
        snap.forEach((d) => {
          const r = d.data() as SignatureRecord;
          map[r.signerWorkspaceEmail] = r;
        });
        setSignatures(map);
      })
      .finally(() => setLoading(false));
  }, [email, canView]);

  const allSigned = useMemo(
    () => C3H_DIRECTOR_ROSTER.every((d) => signatures[d.workspaceEmail]),
    [signatures],
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-700">
        Loading…
      </div>
    );
  }
  if (!session) return null;
  if (!canView) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold mb-2 text-gray-900">Not authorised</h1>
          <p className="text-sm text-gray-600 mb-4">
            This Letter of Direction is visible only to the Club&apos;s directors and to the Treasurer and Secretary.
          </p>
          <button
            onClick={() => router.push('/c3h/dashboard')}
            className="px-4 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page-level rules; the @page / letterhead structure lives in
          LetterPaper. Only LoD-specific helpers stay here. */}
      <style>{`
        .sig-img-wrap img {
          max-height: 56px;
          max-width: 240px;
          object-fit: contain;
          display: block;
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 py-6">
        {/* Top toolbar — screen only */}
        <div className="no-print max-w-4xl mx-auto mb-4 px-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/c3h/pavilion')}
              className="px-3 py-1.5 rounded-md bg-white border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            >
              ← Back to Pavilion
            </button>
            <div className="text-sm text-gray-600">
              {allSigned ? (
                <span className="font-semibold text-emerald-700">✓ All 5 directors have signed — ready to print and submit.</span>
              ) : (
                <span className="text-amber-700">
                  {Object.keys(signatures).length} of {C3H_DIRECTOR_ROSTER.length} directors have signed. You can still preview / print a partial copy.
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
          >
            Print / Save as PDF
          </button>
        </div>

        {/* The letter itself — wrapped in LetterPaper so the green
            letterhead header + footer bands repeat on every printed
            page when content overflows past a single sheet. */}
        <LetterPaper>

          {/* Date */}
          <div className="text-right text-[13px] text-gray-700 mb-5">May 20, 2026</div>

          {/* Addressee */}
          <div className="text-[13px] mb-5 leading-snug">
            <div className="font-semibold text-gray-900">Canadian Imperial Bank of Commerce</div>
            <div>Branch: <FillLine width="300px" /></div>
            <div>Address: <FillLine width="380px" /></div>
          </div>

          {/* Subject */}
          <div className="text-[13px] font-bold text-emerald-700 bg-emerald-50 border-l-[3px] border-emerald-600 px-3 py-2 mb-5">
            Re: Letter of Direction — Addition of Signing Authorities<br />
            <span className="font-normal text-gray-800">
              Account ending in <strong>****1517</strong> (transit <strong>04582</strong>) — Challengers Cricket Club
            </span>
          </div>

          <p className="text-[13.5px] mb-3">To Whom It May Concern,</p>

          <p className="text-[13.5px] mb-3">
            This letter is provided by the Board of Directors of <strong>Challengers Cricket Club</strong> (the
            &ldquo;Corporation&rdquo;), a federal Canada Not-for-Profit Corporation incorporated under the{' '}
            <em>Canada Not-for-Profit Corporations Act</em> (Corporation #1746974-8), having its registered office at
            790 Capulet Lane, London, Ontario&nbsp;&nbsp;N6H 0J8.
          </p>

          <p className="text-[13.5px] mb-4">
            <strong>Challengers Cricket Club is a volunteer-run not-for-profit corporation.</strong> The individuals
            named in this Letter serve solely in volunteer capacities and receive no salary, wages, fees, commissions,
            or other compensation from the Corporation.
          </p>

          <p className="text-[13.5px] mb-3">
            The undersigned, being all of the directors of the Corporation, hereby <strong>direct and authorize</strong>{' '}
            the Canadian Imperial Bank of Commerce to update the signing authorities on the operating account
            identified above as follows:
          </p>

          <ul className="list-none pl-2 mb-4 text-[13.5px] space-y-2">
            <li>
              <strong>Mohammed Saad</strong> — shall remain as an existing signing authority on the account.
            </li>
            <li>
              <strong>Gokul Prakash</strong> — to be added as a signing authority.
            </li>
            <li>
              <strong>Qaiser Qureshi</strong> — to be added as a signing authority.
            </li>
          </ul>

          <p className="text-[13.5px] mb-4">
            The individuals listed above are the authorized signing authorities of the Corporation. The Board further
            authorizes the Canadian Imperial Bank of Commerce to provide each approved signing authority with banking
            access, debit card access, and online banking services in accordance with CIBC&apos;s standard policies
            and procedures.
          </p>

          <p className="text-[13.5px] mb-5">
            Each individual being added (Gokul Prakash and Qaiser Qureshi) will attend a CIBC branch in person and
            provide government-issued photo identification and any documentation required by the Bank before their
            access is activated.
          </p>

          {/* ── Signature grid ───────────────────────────────────────────
              Forced onto a fresh page so all 5 director blocks stay together.
              Without this, the grid was splitting across page 3 / 4 and the
              first two blocks (Saad + Ankush) were getting clipped — banks
              would interpret a missing signature row as "this director
              didn't sign". */}
          <div
            className="signatures-section"
            style={{ pageBreakBefore: 'always', breakBefore: 'page' }}
          >
            <div className="border-t border-dashed border-gray-400 pt-4 text-[12.5px] text-gray-700 mb-4">
              By signing below, each of the undersigned confirms that they are a current director of the Corporation
              and that they have authorised this direction on behalf of the Corporation.
            </div>

            <div
              className="grid grid-cols-2 gap-x-10 gap-y-6"
              style={{ pageBreakInside: 'avoid', breakInside: 'avoid-page' }}
            >
              {C3H_DIRECTOR_ROSTER.map((d) => {
                const sig = signatures[d.workspaceEmail];
                const signedDate = sig?.signedAt
                  ? sig.signedAt.toDate().toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
                  : null;
                return (
                  <div
                    key={d.workspaceEmail}
                    style={{ pageBreakInside: 'avoid', breakInside: 'avoid-page' }}
                  >
                    <div
                      className="sig-img-wrap border-b-[1.5px] border-gray-900 flex items-end pb-0.5"
                      style={{ minHeight: '62px' }}
                    >
                      {sig?.signatureType === 'drawn' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sig.signatureData} alt={`${d.name} signature`} />
                      ) : sig?.signatureType === 'typed' ? (
                        <span
                          className="text-gray-900 italic"
                          style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '28px', lineHeight: '1' }}
                        >
                          {sig.signatureData}
                        </span>
                      ) : null}
                    </div>
                    <div className="font-bold text-[13px] text-gray-900 mt-1">{d.name}</div>
                    <div className="text-[11px] text-gray-600">{d.role}</div>
                    <div className="text-[11px] text-gray-600 mt-1">
                      Date: <span className={signedDate ? 'text-gray-900' : 'text-gray-400'}>
                        {signedDate ?? '— pending —'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </LetterPaper>

        {/* Footer toolbar — screen only */}
        <div className="no-print max-w-4xl mx-auto mt-4 px-4 text-xs text-gray-500">
          Tip: when printing, choose <strong>&ldquo;Save as PDF&rdquo;</strong> as the destination, set margins to
          <strong> Default</strong>, and ensure <strong>Background graphics</strong> is enabled so the green accent and
          coloured callouts render. Then email the resulting PDF to gokulprakash663@gmail.com and qureshiqaiser007@gmail.com.
        </div>
      </div>
    </>
  );
}
