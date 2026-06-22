"use client";

// Print-ready version of a Letter of Direction adding a single new
// signing authority to the Corporation's CIBC operating account. The
// same page renders both the Gokul Prakash and Qaiser Qureshi LoDs;
// they differ only in the recipient block and a small amount of role
// language.
//
// The combined Gokul + Qaiser LoD that previously lived at
// /c3h/pavilion/print/lod-cibc has been split into two per-recipient
// LoDs. Signatures collected on the combined LoD carry forward to the
// matching split LoD — fresh signatures on the split LoD take precedence
// if both exist for the same director.
//
// Access: directors + governance readers (Treasurer, Secretary).

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
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
import { findDoc } from '../../../governanceDocs';
import LetterPaper from '../../../LetterPaper';

// The companion Qaiser Qureshi LoD was retired on 2026-06-22 when Qaiser
// left the Club; only the Gokul recipient remains valid here.
type Recipient = 'gokul';

type RecipientProfile = {
  name: string;
  email: string;
  roleWithCorporation: string;
  docId: string;
};

const RECIPIENTS: Record<Recipient, RecipientProfile> = {
  gokul: {
    name: 'Gokul Prakash',
    email: 'gokulprakash663@gmail.com',
    roleWithCorporation: 'Director',
    docId: 'lod-cibc-gokul-2026',
  },
};

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
  const params = useParams<{ recipient: string }>();
  const recipientKey = params?.recipient as Recipient;
  const isValidRecipient = recipientKey === 'gokul';
  const r = isValidRecipient ? RECIPIENTS[recipientKey] : null;

  const [signatures, setSignatures] = useState<Record<string, SignatureRecord>>({});
  const [readyToSend, setReadyToSend] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  const email = session?.user?.email || '';
  const canView = isC3HDirector(email) || isC3HGovernanceReader(email);

  useEffect(() => {
    if (!email || !canView || !r) return;
    // Pull signatures from both the split LoD (this doc) and the prior
    // combined LoD that this doc replaces. Fresh signatures on the
    // split doc take precedence over carried-forward legacy ones.
    const sigQ = query(
      collection(db, 'governance_signatures'),
      where('docId', 'in', [r.docId, 'lod-cibc-gokul-qaiser-2026']),
    );
    // Revocations are written against the active (split) doc only. A
    // director who has withdrawn their signature must NOT appear on the
    // printed Letter — drop them from the map so they read as pending and
    // the "all signed" gate stays false until they re-sign at a bumped
    // version.
    const revQ = query(
      collection(db, 'governance_revocations'),
      where('docId', '==', r.docId),
    );
    // President "ready to send" status for this LoD.
    const apprQ = query(
      collection(db, 'governance_approvals'),
      where('docId', '==', r.docId),
    );
    Promise.all([getDocs(sigQ), getDocs(revQ), getDocs(apprQ)])
      .then(([sigSnap, revSnap, apprSnap]) => {
        let ready = false;
        apprSnap.forEach((d) => {
          const rec = d.data() as { status?: string };
          if (rec.status === 'ready') ready = true;
        });
        setReadyToSend(ready);

        const revoked = new Set<string>();
        revSnap.forEach((d) => {
          const rec = d.data() as { signerWorkspaceEmail?: string };
          if (rec.signerWorkspaceEmail) revoked.add(rec.signerWorkspaceEmail);
        });

        const map: Record<string, SignatureRecord> = {};
        const legacy: SignatureRecord[] = [];
        sigSnap.forEach((d) => {
          const rec = d.data() as SignatureRecord;
          if (rec.docId === r.docId) {
            map[rec.signerWorkspaceEmail] = rec;
          } else {
            legacy.push(rec);
          }
        });
        // Fill in any director who only signed the legacy combined LoD.
        for (const rec of legacy) {
          if (!map[rec.signerWorkspaceEmail]) {
            map[rec.signerWorkspaceEmail] = rec;
          }
        }
        // Remove any signer who has since revoked on the active doc.
        for (const ws of revoked) delete map[ws];
        setSignatures(map);
      })
      .finally(() => setLoading(false));
  }, [email, canView, r]);

  const doc = useMemo(() => (r ? findDoc(r.docId) : undefined), [r]);
  const allSigned = useMemo(
    () => C3H_DIRECTOR_ROSTER.every((d) => signatures[d.workspaceEmail]),
    [signatures],
  );

  if (!isValidRecipient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold mb-2 text-gray-900">Unknown recipient</h1>
          <p className="text-sm text-gray-600 mb-4">
            Use <code>/c3h/pavilion/print/lod-cibc/gokul</code>. (The Qaiser
            Letter of Direction was retired.)
          </p>
          <button
            onClick={() => router.push('/c3h/pavilion')}
            className="px-4 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            Back to Pavilion
          </button>
        </div>
      </div>
    );
  }
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

  if (!r || !doc) return null;

  return (
    <>
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
              {allSigned && readyToSend ? (
                <span className="font-semibold text-emerald-700">✓ All 5 directors have signed and the President has marked this ready to send — print and submit to CIBC.</span>
              ) : allSigned ? (
                <span className="text-amber-700">
                  All 5 directors have signed. Awaiting the President&apos;s &ldquo;ready to send&rdquo; sign-off in the Pavilion before this Letter is submitted to CIBC. You can still preview / print a draft.
                </span>
              ) : (
                <span className="text-amber-700">
                  {Object.keys(signatures).length} of {C3H_DIRECTOR_ROSTER.length} directors have signed (counting carry-forward from the prior combined LoD). You can still preview / print a partial copy.
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

        <LetterPaper>

          {/* Date */}
          <div className="text-right text-[13px] text-gray-700 mb-5">June 1, 2026</div>

          {/* Addressee */}
          <div className="text-[13px] mb-5 leading-snug">
            <div className="font-semibold text-gray-900">Canadian Imperial Bank of Commerce</div>
            <div>Branch: <FillLine width="300px" /></div>
            <div>Address: <FillLine width="380px" /></div>
          </div>

          {/* Subject */}
          <div className="text-[13px] font-bold text-emerald-700 bg-emerald-50 border-l-[3px] border-emerald-600 px-3 py-2 mb-5">
            Re: Letter of Direction — Addition of Signing Authority ({r.name})<br />
            <span className="font-normal text-gray-800">
              Account ending in <strong>****1517</strong> (transit <strong>04582</strong>) — Challengers Cricket Club
            </span>
          </div>

          <p className="text-[13.5px] mb-3">To Whom It May Concern,</p>

          <p className="text-[13.5px] mb-3">
            This letter is provided by the Board of Directors of <strong>Challengers Cricket Club</strong> (the
            &ldquo;Corporation&rdquo;), a federal Canada Not-for-Profit Corporation incorporated under the{' '}
            <em>Canada Not-for-Profit Corporations Act</em> (Corporation #1746974-8), having its registered office at
            790 Capulet Lane, London, Ontario&nbsp;&nbsp;N6H 0J8. The Corporation is a volunteer-run
            not-for-profit organization; it has no employees, issues no payroll, and pays no salary, fee, or other
            compensation to any signing authority, director, or officer.
          </p>

          <p className="text-[13.5px] mb-4">
            The undersigned, being all of the directors of the Corporation, hereby <strong>direct and authorize</strong>{' '}
            the Canadian Imperial Bank of Commerce to establish, effective upon receipt and verification by the Bank,
            the following signing-authority panel on the operating account identified above:
          </p>

          {/* ── Authority block 1: Saad ───────────────────────────────── */}
          <div className="border border-dashed border-gray-400 rounded-md bg-gray-50 px-4 py-3 mb-3 text-[12.5px]">
            <div className="flex items-baseline justify-between pb-2 mb-2 border-b border-gray-300">
              <div className="font-bold text-gray-900 text-[14px]">Mohammed Saad</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">Existing — already on file</div>
            </div>
            <div className="grid grid-cols-[170px_1fr] gap-y-1">
              <div className="text-gray-600 font-semibold">Role with Corporation</div><div>Director</div>
              <div className="text-gray-600 font-semibold">Capacity</div><div>Volunteer (uncompensated)</div>
              <div className="text-gray-600 font-semibold">Identification</div><div>Already on file with CIBC — no further verification requested.</div>
            </div>
          </div>

          {/* ── Authority block 2: New recipient ──────────────────────── */}
          <div className="border border-emerald-300 rounded-md bg-emerald-50/40 px-4 py-3 mb-4 text-[12.5px]">
            <div className="flex items-baseline justify-between pb-2 mb-2 border-b border-emerald-200">
              <div className="font-bold text-gray-900 text-[14px]">{r.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Being added</div>
            </div>
            <div className="grid grid-cols-[170px_1fr] gap-y-1">
              <div className="text-gray-600 font-semibold">Role with Corporation</div><div>{r.roleWithCorporation}</div>
              <div className="text-gray-600 font-semibold">Capacity</div><div>Volunteer (uncompensated)</div>
              <div className="text-gray-600 font-semibold">Full legal name</div><div><FillLine width="280px" /></div>
              <div className="text-gray-600 font-semibold">Date of birth</div><div><FillLine width="160px" /></div>
              <div className="text-gray-600 font-semibold">Home address</div><div><FillLine width="380px" /></div>
              <div className="text-gray-600 font-semibold">Mobile (OTP)</div><div><FillLine width="200px" /></div>
              <div className="text-gray-600 font-semibold">Email</div><div>{r.email}</div>
            </div>
          </div>

          {/* Volunteer-capacity callout */}
          <div className="bg-amber-50 border-l-[3px] border-amber-500 px-4 py-3 text-[12.5px] mb-4 leading-snug">
            <strong className="text-amber-800">Volunteer capacity.</strong> Challengers Cricket Club is a not-for-profit
            corporation operated entirely by unpaid volunteers in accordance with Article 5 of the Corporation&apos;s
            Bylaws. Each individual named above — Mohammed Saad and {r.name} — serves the Corporation strictly as a
            volunteer, without compensation, salary, fees, or any other form of payment, and is not an employee of the
            Corporation. Each acts in good faith on behalf of the Corporation in furtherance of its community-sport
            purposes and is bound by the Corporation&apos;s Bylaws, Financial Policy, Code of Conduct, and Conflict of
            Interest Policy.
          </div>

          <p className="text-[13.5px] mb-2">The Corporation further confirms the following with respect to this account:</p>

          <ol className="list-decimal pl-6 text-[13px] space-y-2 mb-4">
            <li>
              <strong>Equal and optional signing authorities.</strong> Both named signing authorities —
              Mohammed Saad and {r.name} — are equal and optional signing authorities on this account. Each holds{' '}
              <strong>equivalent legal authority and equivalent operational rights</strong> to act on, maintain,
              and transact on the account on behalf of the Corporation. No signing authority is senior, subordinate,
              or in any way superior to any other; the panel members are interchangeable in standing.
            </li>
            <li>
              <strong>Separate cards, credentials, and OTPs.</strong> Each signing authority shall be issued (a)
              their own separate physical debit card linked to the account, (b) their own separate online-banking
              credentials (username and password), and (c) their own separate one-time passcode (OTP) destination
              set to their personal registered mobile number. No signing authority shall share, use, or have access
              to any other signing authority&apos;s card or credentials. Each authority operates independently in
              their own login session.
            </li>
            <li>
              <strong>Dual-signatory governance policy.</strong> The account operates under a dual-signatory
              governance policy. No single signing authority shall have unilateral transaction rights beyond
              ordinary day-to-day operating disbursements as defined in the Corporation&apos;s Financial Policy.
              All material transactions are subject to the Board&apos;s internal approval policy.
            </li>
            <li>
              <strong>Monthly statements and Treasurer responsibility.</strong> Monthly account statements shall
              be made available to all directors of the Corporation as part of its standard governance practice.
              The Treasurer of the Corporation is the officer responsible for reviewing those statements and
              reporting to the Board.
            </li>
            <li>
              <strong>Additive direction.</strong> This Letter of Direction is additive with respect to {r.name};
              it does not displace Mohammed Saad&apos;s existing signing authority. Any future removal or
              replacement of a signing authority will be effected by a separate written direction signed by all
              then-current directors of the Corporation.
            </li>
            <li>
              <strong>CIBC display behaviour.</strong> CIBC display behaviour with respect to transaction-initiator
              names on account statements is acknowledged by the Corporation as a bank-side display convention;
              the operating account remains, in fact and in law, the property and operating account of the
              Corporation, not of any individual signing authority.
            </li>
          </ol>

          <p className="text-[13.5px] mb-5">
            The individual being added ({r.name}) will present themselves at a CIBC branch with valid
            government-issued photo identification to complete any bank-side verification required prior to their
            access being activated.
          </p>

          {/* ── Signature grid ─────────────────────────────────────────── */}
          <div
            className="signatures-section"
            style={{ pageBreakBefore: 'always', breakBefore: 'page' }}
          >
            <div className="border-t border-dashed border-gray-400 pt-4 text-[12.5px] text-gray-700 mb-4">
              By signing below, each of the undersigned confirms that they are a current director of the Corporation and
              that they have authorised this direction on behalf of the Corporation. Signatures captured electronically
              through the Pavilion governance ledger of Challengers Cricket Club, in accordance with the{' '}
              <em>Ontario Electronic Commerce Act, 2000</em> and the federal <em>UECA</em>.
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

          {/* Footer */}
          <div className="border-t border-gray-200 mt-8 pt-3 text-[10.5px] text-gray-500 leading-snug">
            Signed electronically by the directors of the Corporation through the Pavilion governance ledger of
            Challengers Cricket Club. Signature records — including each signer&apos;s name, role, workspace email,
            server timestamp, and signature image — are retained in the Club&apos;s permanent Firestore governance
            ledger under document id <code>{r.docId}</code> · version {doc.version} (with carry-forward from the
            prior combined LoD <code>lod-cibc-gokul-qaiser-2026</code> for directors who already signed it). Issued
            under seal of the Corporation, in accordance with the Bylaws adopted 25 February 2026 (rev. 8 May 2026).
            For verification of director status please consult the federal corporate profile filed with Corporations
            Canada under Corporation #1746974-8, or contact the Corporation at contact@challengerscc.ca.
          </div>

        </LetterPaper>

        {/* Footer toolbar — screen only */}
        <div className="no-print max-w-4xl mx-auto mt-4 px-4 text-xs text-gray-500">
          Tip: when printing, choose <strong>&ldquo;Save as PDF&rdquo;</strong> as the destination, set margins to
          <strong> Default</strong>, and ensure <strong>Background graphics</strong> is enabled so the green accent and
          coloured callouts render. Then email the resulting PDF to {r.email}.
        </div>
      </div>
    </>
  );
}
