"use client";

// Print-ready version of the Director Resolution & Appointment of
// President (Gokul Prakash). Renders on white paper in a light theme,
// pulls director signatures from the Firestore governance_signatures
// collection, and embeds each signature image above the typed director
// name. Designed for Cmd+P → "Save as PDF" → email to the appointee.
//
// Access: directors only. This is an internal Board resolution; there
// is no non-director recipient who needs to see it before it is
// finalised (the appointee Gokul is himself a Director).

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
} from '@/lib/c3h-access';
import { findDoc } from '../../governanceDocs';
import LetterPaper from '../../LetterPaper';

const DOC_ID = 'president-appointment-gokul-2026';

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

export default function PresidentAppointmentPrintPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [signatures, setSignatures] = useState<Record<string, SignatureRecord>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  const email = session?.user?.email || '';
  const canView = isC3HDirector(email);

  useEffect(() => {
    if (!email || !canView) return;
    const sigQ = query(collection(db, 'governance_signatures'), where('docId', '==', DOC_ID));
    // Directors who have withdrawn their signature must not appear as
    // signatories on the printed resolution.
    const revQ = query(collection(db, 'governance_revocations'), where('docId', '==', DOC_ID));
    Promise.all([getDocs(sigQ), getDocs(revQ)])
      .then(([sigSnap, revSnap]) => {
        const revoked = new Set<string>();
        revSnap.forEach((d) => {
          const rec = d.data() as { signerWorkspaceEmail?: string };
          if (rec.signerWorkspaceEmail) revoked.add(rec.signerWorkspaceEmail);
        });
        const map: Record<string, SignatureRecord> = {};
        sigSnap.forEach((d) => {
          const r = d.data() as SignatureRecord;
          if (!revoked.has(r.signerWorkspaceEmail)) map[r.signerWorkspaceEmail] = r;
        });
        setSignatures(map);
      })
      .finally(() => setLoading(false));
  }, [email, canView]);

  const doc = useMemo(() => findDoc(DOC_ID), []);
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
            This Director Resolution is visible only to the Club&apos;s directors.
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
                <span className="font-semibold text-emerald-700">✓ All 5 directors have signed — ready to print and email.</span>
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

        <LetterPaper>

          {/* Date */}
          <div className="text-right text-[13px] text-gray-700 mb-5">May 25, 2026</div>

          {/* Title */}
          <div className="text-center mb-5">
            <div className="text-[18px] font-bold text-gray-900 leading-snug">
              DIRECTOR RESOLUTION AND<br />APPOINTMENT OF PRESIDENT
            </div>
            <div className="text-[12px] text-gray-600 mt-1">Challengers Cricket Club · Canada Not-for-Profit Corporation #1746974-8</div>
          </div>

          {/* Subject callout */}
          <div className="text-[13px] font-bold text-emerald-700 bg-emerald-50 border-l-[3px] border-emerald-600 px-3 py-2 mb-5">
            Re: Appointment of <strong>Gokul Prakash</strong> as President of the Corporation<br />
            <span className="font-normal text-gray-800">
              Pursuant to Bylaws Article 4.6(a); volunteer, unpaid; effective on the date the fifth director signature is recorded.
            </span>
          </div>

          {/* 1. Recitals */}
          <h3 className="text-[13.5px] font-bold text-emerald-700 mb-1">1. Recitals</h3>
          <ol className="list-[lower-alpha] pl-6 text-[12.5px] space-y-1 mb-4">
            <li>The Corporation is a federally incorporated not-for-profit corporation under the <em>Canada Not-for-profit Corporations Act</em> (CNCA), Corporation #1746974-8, dated 12 November 2025.</li>
            <li>Article 4.6(a) of the Club&apos;s bylaws contemplates the office of President, who &ldquo;oversees all club operations and represents the club externally.&rdquo;</li>
            <li>The Board has deliberated and unanimously concluded that <strong>Gokul Prakash</strong> is the appropriate candidate to hold this office at this time.</li>
          </ol>

          {/* 2. Resolution */}
          <h3 className="text-[13.5px] font-bold text-emerald-700 mb-1">2. Resolution</h3>
          <p className="text-[12.5px] mb-1"><strong>BE IT RESOLVED THAT:</strong></p>
          <ol className="list-[lower-alpha] pl-6 text-[12.5px] space-y-1 mb-4">
            <li>Gokul Prakash is hereby appointed <strong>President</strong> of Challengers Cricket Club, effective on the date all five directors have signed this instrument.</li>
            <li>The appointment is for an indefinite term, continuing until Gokul resigns, ceases to be a Director, or is replaced by ordinary resolution of the Board.</li>
            <li>Gokul retains his existing Director seat on the federal corporate profile. The President title is an officer designation in addition to, and not in substitution for, his directorship.</li>
            <li>The Board confirms that this appointment is unanimous and that Gokul, by signing below, accepts the office.</li>
          </ol>

          {/* 3. The Appointee */}
          <h3 className="text-[13.5px] font-bold text-emerald-700 mb-1">3. The Appointee</h3>
          <div className="border border-emerald-300 rounded-md bg-emerald-50/40 px-4 py-3 mb-4 text-[12.5px]">
            <div className="flex items-baseline justify-between pb-2 mb-2 border-b border-emerald-200">
              <div className="font-bold text-gray-900 text-[14px]">Gokul Prakash</div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Appointed President</div>
            </div>
            <div className="grid grid-cols-[170px_1fr] gap-y-1">
              <div className="text-gray-600 font-semibold">Office</div><div>President</div>
              <div className="text-gray-600 font-semibold">Director status</div><div>Continuing Director (filed on federal corporate profile)</div>
              <div className="text-gray-600 font-semibold">Workspace email</div><div>gokul@challengerscc.ca</div>
              <div className="text-gray-600 font-semibold">Effective date</div><div>Date all five directors have signed</div>
              <div className="text-gray-600 font-semibold">Term</div><div>Indefinite, terminable per §2(b) above</div>
              <div className="text-gray-600 font-semibold">Compensation</div><div>None — volunteer, unpaid (see §6)</div>
            </div>
          </div>

          {/* 4. Responsibilities */}
          <h3 className="text-[13.5px] font-bold text-emerald-700 mb-1">4. Responsibilities of the President</h3>
          <p className="text-[12.5px] mb-1">Drawn from the Club&apos;s bylaws (Article 4.6(a), 6.1, 8.1) and refined for operational clarity:</p>
          <ul className="list-disc pl-6 text-[12.5px] space-y-1 mb-4">
            <li><strong>External representation</strong> — speaks for the Club to sponsors, partners, the city, leagues, regulators, and media; signs correspondence on behalf of the Board.</li>
            <li><strong>Operational oversight</strong> — ensures Club operations (matches, training, finance, members, communications) are progressing and that owners are assigned for each area.</li>
            <li><strong>Board leadership</strong> — calls Board meetings (Article 6.1), sets agendas, chairs deliberations, and drives matters to a decision.</li>
            <li><strong>Signing authority</strong> — one of four officers (with Vice-President, Secretary, Treasurer) authorised to bind the Corporation under Article 8.1. Documents require any two of these signatures.</li>
            <li><strong>Officer coordination</strong> — works with the Secretary, Treasurer, Captains, and any committee chairs to ensure Club business is executed.</li>
            <li><strong>Continuity</strong> — ensures that records, accounts, and relationships are maintained so the Club can continue to operate beyond the current Board.</li>
          </ul>

          {/* 5. Decision-making framework */}
          <h3 className="text-[13.5px] font-bold text-emerald-700 mb-1">5. Decision-making framework</h3>
          <p className="text-[12.5px] mb-2">
            This section sets out, at a high level, how decisions move through the Corporation so that all Directors,
            Officers, and members understand which matters the President decides directly and which matters are reserved
            to the Board. <strong>Nothing in this section overrides the bylaws.</strong> Where the bylaws speak, the
            bylaws govern.
          </p>

          <div className="border border-gray-300 rounded-md overflow-hidden text-[11.5px] mb-3">
            <table className="w-full">
              <thead className="bg-emerald-50">
                <tr>
                  <th className="text-left px-3 py-1.5 font-semibold text-gray-800 border-b border-gray-300 w-[55%]">Category</th>
                  <th className="text-left px-3 py-1.5 font-semibold text-gray-800 border-b border-gray-300">Who decides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr><td className="px-3 py-1.5">Day-to-day operations (scheduling, communications, vendor coordination, routine spending within an approved budget)</td><td className="px-3 py-1.5">President, in consultation with the relevant officer</td></tr>
                <tr><td className="px-3 py-1.5">External representation (sponsor talks, media, partner conversations, league liaison)</td><td className="px-3 py-1.5">President</td></tr>
                <tr><td className="px-3 py-1.5">Signing of contracts and instruments binding the Corporation</td><td className="px-3 py-1.5">Any two of President, Vice-President, Secretary, Treasurer (Article 8.1)</td></tr>
                <tr><td className="px-3 py-1.5">Spending or commitments outside an approved budget, or above a threshold the Board sets in its Financial Policy</td><td className="px-3 py-1.5">Board, on motion. President may chair the meeting and recommend.</td></tr>
                <tr><td className="px-3 py-1.5">Disputes between members; complaints raised against Directors, Officers, or volunteers; conflicts of interest</td><td className="px-3 py-1.5">Board, collectively (Article 3.6 and the Conflict of Interest Policy). President chairs the meeting and drafts the proposed resolution.</td></tr>
                <tr><td className="px-3 py-1.5">Suspension or expulsion of a member</td><td className="px-3 py-1.5">Board, under the formal procedure in Article 3.6 (20-day notice, 30-day final decision)</td></tr>
                <tr><td className="px-3 py-1.5">Appointment or removal of officers, captains, committee chairs</td><td className="px-3 py-1.5">Board, by ordinary resolution</td></tr>
                <tr><td className="px-3 py-1.5">Adoption or amendment of Club policies (Financial, Squad Selection, Communication, Code of Conduct, etc.)</td><td className="px-3 py-1.5">Board, by ordinary resolution</td></tr>
                <tr><td className="px-3 py-1.5">Amendment of the bylaws or articles of incorporation</td><td className="px-3 py-1.5">Members, by special resolution; filed with Corporations Canada</td></tr>
              </tbody>
            </table>
          </div>

          <p className="text-[12.5px] font-semibold text-gray-800 mb-1">How a dispute flows</p>
          <ol className="list-decimal pl-6 text-[12.5px] space-y-1 mb-3">
            <li>The matter is raised to the President or to any Director.</li>
            <li>The President assesses urgency and decides whether the matter is operational (President resolves and informs the Board) or material (escalated to a Board meeting).</li>
            <li>For material matters, the President calls a Board meeting (Article 6.1), distributes the relevant facts and any documentation, and chairs the deliberation.</li>
            <li>The Board deliberates and votes. The President does not have a casting vote unless the bylaws are subsequently amended to grant one.</li>
            <li>A written Board Resolution captures the decision and is recorded in the Pavilion. The decision is communicated to the affected parties in writing, with reasons.</li>
            <li>Where Article 3.6 (suspension/expulsion) applies, the 20-day notice and 30-day final-decision procedure is followed without abbreviation.</li>
          </ol>

          <p className="text-[11.5px] italic text-gray-600 mb-4">
            This framework is descriptive of the bylaws as they stand on the effective date of this instrument. If the
            bylaws are subsequently amended to grant the President additional powers (for example, a casting vote on
            tied Board votes), this framework will be updated in a future version of this instrument; until then, the
            bylaws as currently in force are authoritative.
          </p>

          {/* 6. Volunteer, unpaid */}
          <h3 className="text-[13.5px] font-bold text-emerald-700 mb-1">6. Volunteer, unpaid status</h3>
          <div className="bg-amber-50 border-l-[3px] border-amber-500 px-4 py-3 text-[12.5px] mb-4 leading-snug">
            <p className="mb-1">
              The office of President is held on a strictly <strong>volunteer, unpaid</strong> basis. By accepting this
              appointment, Gokul acknowledges and affirms that, in line with Article 16.4 of the bylaws:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>holding this office does not, and shall never, give rise to a claim for compensation, fees, honoraria, or remuneration;</li>
              <li>hours invested, work performed, results delivered, and outcomes achieved are all contributed on a volunteer basis and create no entitlement to payment now or in the future;</li>
              <li>this affirmation cannot be circumvented by a future Board resolution or member vote — any retroactive payment for past unpaid service is expressly prohibited;</li>
              <li>reasonable out-of-pocket expenses incurred on Club business may be reimbursed against documented receipts pursuant to the Financial Policy, and any such reimbursement is paid to a personal account of the recipient (never to a corporation or entity controlled by the recipient).</li>
            </ul>
          </div>

          {/* 7. Acceptance */}
          <h3 className="text-[13.5px] font-bold text-emerald-700 mb-1">7. Acceptance by the Appointee</h3>
          <p className="text-[12.5px] mb-4">
            By signing this instrument below as a Director, Gokul Prakash also accepts the office of President on the
            terms set out herein and affirms the volunteer, unpaid status of the role. No separate acceptance letter is
            required.
          </p>

          {/* 8. Bylaws govern */}
          <h3 className="text-[13.5px] font-bold text-emerald-700 mb-1">8. Bylaws govern</h3>
          <p className="text-[12.5px] mb-4">
            Nothing in this instrument modifies the bylaws of the Corporation, the <em>Canada Not-for-profit
            Corporations Act</em>, or any policy adopted by the Board. In the event of any inconsistency between this
            instrument and the bylaws, the bylaws prevail. If the Board wishes to grant the President powers beyond
            those set out in the bylaws, the proper mechanism is a bylaws amendment by special resolution of the
            members, filed with Corporations Canada under CNCA s. 197.
          </p>

          {/* 9. Adoption */}
          <h3 className="text-[13.5px] font-bold text-emerald-700 mb-1">9. Adoption</h3>
          <p className="text-[12.5px] mb-4">
            This Resolution and Appointment is adopted by the unanimous signatures of all five Directors of the
            Corporation. The effective date is the date on which the fifth signature is recorded in the Pavilion
            signature ledger.
          </p>

          {/* Signature grid — forced onto a fresh page */}
          <div
            className="signatures-section"
            style={{ pageBreakBefore: 'always', breakBefore: 'page' }}
          >
            <div className="border-t border-dashed border-gray-400 pt-4 text-[12.5px] text-gray-700 mb-4">
              By signing below, each of the undersigned confirms that they are a current director of the Corporation
              and that they have adopted this Resolution on behalf of the Corporation. Gokul Prakash&apos;s signature
              additionally evidences his acceptance of the office of President. Signatures captured electronically
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
                const roleLabel = d.workspaceEmail === 'gokul@challengerscc.ca' ? 'Director & President-Designate' : 'Director';
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
                    <div className="text-[11px] text-gray-600">{roleLabel}</div>
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
            ledger under document id <code>{DOC_ID}</code> · version {doc?.version}. Issued under seal of the
            Corporation, in accordance with the Bylaws. For verification of director status please consult the federal
            corporate profile filed with Corporations Canada under Corporation #1746974-8, or contact the Corporation
            at contact@challengerscc.ca.
          </div>

        </LetterPaper>

        {/* Footer toolbar — screen only */}
        <div className="no-print max-w-4xl mx-auto mt-4 px-4 text-xs text-gray-500">
          Tip: when printing, choose <strong>&ldquo;Save as PDF&rdquo;</strong> as the destination, set margins to
          <strong> Default</strong>, and ensure <strong>Background graphics</strong> is enabled so the green accent
          and coloured callouts render. Then email the resulting PDF from <strong>contact@challengerscc.ca</strong> to
          <strong> gokulprakash663@gmail.com</strong> (and CC the other directors for their records).
        </div>
      </div>
    </>
  );
}
