// Inline content of the Officer Appointment & Volunteer Status
// Confirmation. Personalised at render time per officer (Treasurer,
// Secretary, Captain). Bump the document version in officer-hub
// page if this content materially changes.

import Link from 'next/link';

type Props = {
  officerName: string;
  role: string;
  effectiveFrom: string;
  reaffirmedDate: string;
};

export default function OfficerAppointment({ officerName, role, effectiveFrom, reaffirmedDate }: Props) {
  return (
    <div className="space-y-5 text-sm text-gray-200 leading-relaxed">

      <div className="rounded-xl p-4 bg-accent-500/5 border-2 border-accent-500/30">
        <p className="text-xs uppercase tracking-wider text-accent-400 font-bold mb-2">Plain-language summary</p>
        <p>
          This document confirms that <strong className="text-white">{officerName}</strong> serves as
          {' '}<strong className="text-white">{role}</strong> of Challengers Cricket Club on a
          {' '}<strong className="text-white">strictly volunteer basis</strong>. The work is unpaid; no
          compensation is owed now or in future. Past out-of-pocket expenses already advanced for the Club&apos;s
          benefit (jerseys, equipment, etc.) are documented separately on the Club&apos;s Schedule of Founder
          Advances and remain repayable — this Confirmation does not extinguish them.
        </p>
      </div>

      <h3 className="text-base font-bold text-white mt-4">1. Officer details</h3>
      <ul className="list-disc list-inside ml-2 space-y-1">
        <li><strong className="text-white">Name:</strong> {officerName}</li>
        <li><strong className="text-white">Role:</strong> {role}</li>
        <li><strong className="text-white">Effective from:</strong> {effectiveFrom}</li>
        <li><strong className="text-white">Reaffirmed:</strong> {reaffirmedDate}</li>
        <li><strong className="text-white">Term:</strong> Until replaced or removed by board resolution per Bylaws Article 5.3</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">2. Volunteer status — no compensation</h3>
      <p>The Officer&apos;s service is provided on a <strong className="text-white">strictly volunteer basis</strong>:</p>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>No wages, salary, fees, vacation pay, sick pay, severance, or benefits, now or in future.</li>
        <li>No employment relationship between the Officer and the Club. No T4 will be issued.</li>
        <li>The Officer waives, both now and forever, any and all claims for compensation arising from this role, in accordance with <Link href="/legal/volunteer-agreement" className="text-primary-400 hover:text-primary-300 underline">Volunteer Agreement</Link> Section 2.</li>
        <li>Service is given freely. The Officer may end the appointment at any time, and the Club may end it via board resolution per Bylaws Article 5.3.</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">3. Expenses — documentation rather than waiver</h3>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li><strong className="text-white">Future expenses</strong> require <strong className="text-white">prior board approval</strong> and supporting receipts per Volunteer Agreement Section 5 and the <Link href="/legal/financial-policy" className="text-primary-400 hover:text-primary-300 underline">Financial Policy</Link>. Without prior approval and receipts, no reimbursement is owed.</li>
        <li><strong className="text-white">Past expenses</strong> advanced for the Club&apos;s benefit (jerseys, equipment, hosting, communications, etc.) are documented separately on the Club&apos;s <em>Schedule of Founder Advances Resolution</em> and remain repayable when funds permit. <strong className="text-white">This Confirmation does NOT extinguish any pre-existing reimbursement claim properly documented on that Schedule.</strong></li>
        <li>The Treasurer (or, where the Officer is the Treasurer, another director) maintains the Schedule and reviews it annually.</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">4. Relationship to other governance documents</h3>
      <p>This Confirmation operates alongside:</p>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>The Officer&apos;s e-signed <Link href="/legal/volunteer-agreement" className="text-primary-400 hover:text-primary-300 underline">Volunteer Agreement v1.1</Link></li>
        <li>The <Link href="/legal/bylaws" className="text-primary-400 hover:text-primary-300 underline">Bylaws</Link> (in particular Article 5)</li>
        <li>The <Link href="/legal/code-of-conduct" className="text-primary-400 hover:text-primary-300 underline">Code of Conduct</Link></li>
        <li>The <Link href="/legal/conflict-of-interest" className="text-primary-400 hover:text-primary-300 underline">Conflict of Interest Policy</Link></li>
      </ul>
      <p className="mt-2">
        In the event of conflict between this Confirmation and any earlier informal arrangement, this
        Confirmation prevails on a <strong className="text-white">forward-going basis only</strong>. Past
        performance is not retroactively re-characterized; documented past expenses (Section 3) remain
        repayable.
      </p>

      <h3 className="text-base font-bold text-white mt-4">5. Termination</h3>
      <p>
        Either party may end the appointment at any time, in accordance with Bylaws Article 5.3 and Section 4
        of the Volunteer Agreement.
      </p>

      <h3 className="text-base font-bold text-white mt-4">6. Indemnification</h3>
      <p>
        The Club indemnifies the Officer against costs and liabilities arising from the lawful, good-faith
        performance of their role, except where the loss arises from the Officer&apos;s wilful misconduct, gross
        negligence, fraud, or breach of fiduciary duty. This indemnification mirrors and incorporates by
        reference Article 9 of the Bylaws and Section 12 of the Volunteer Agreement.
      </p>

      <hr className="border-white/10 my-6" />

      <p className="text-xs text-gray-500 italic">
        Document version 1.0 · Effective {reaffirmedDate}. Pending lawyer review.
      </p>
    </div>
  );
}
