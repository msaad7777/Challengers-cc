import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Constitution & By-Laws — Challengers Cricket Club',
  description: 'Constitution and By-Laws of Challengers Cricket Club, a Canada Not-for-Profit Corporation (#1746974-8) incorporated under the Canada Not-for-profit Corporations Act on 12 November 2025. Published openly for transparency.',
};

export default function BylawsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-32 md:pt-40">
        <div className="max-w-3xl mx-auto">
          <Link href="/legal" className="text-gray-500 text-sm hover:text-primary-400 inline-flex items-center gap-1 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            All governance documents
          </Link>

          <div className="text-center mb-10">
            <span className="text-3xl">📜</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3">Constitution &amp; By-Laws</h1>
            <p className="text-sm text-gray-500">
              Challengers Cricket Club · Canada Not-for-Profit Corporation #1746974-8
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Incorporated under the <em>Canada Not-for-profit Corporations Act</em> on 12 November 2025 · CRA Business Number 758650832
            </p>
          </div>

          {/* Transparency notice — current officer onboarding status */}
          <div className="rounded-2xl p-5 mb-6 border-2 border-amber-500/40 bg-amber-500/10">
            <p className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
              <span>⏳</span>
              <span>Officer onboarding in progress</span>
            </p>
            <p className="text-sm text-amber-100 leading-relaxed">
              The Corporation has been federally incorporated and the five directors are listed on the public
              Corporations Canada profile. <strong className="text-white">No officer has yet formally e-signed
              and accepted their Officer Appointment Letter under CNCA</strong>. The Board is actively working
              toward formal onboarding of all officers and members. The published deadline for signing the
              Volunteer Agreement, Liability Waiver, Code of Conduct, and Photography Consent is{' '}
              <strong className="text-white">30 May 2026</strong>. Members and officers who have not signed by
              that date are not entitled to expense reimbursement, squad selection, Club-issued gear, or other
              Club benefits per the
              {' '}<Link href="/legal/financial-policy" className="text-amber-100 underline hover:text-white">Financial Policy</Link>.
              The Board will adopt these By-Laws by formal resolution and confirm them at the first
              members&apos; meeting (Annual General Meeting), to be held no later than 11 February 2027.
            </p>
          </div>

          {/* Draft / pending legal review notice */}
          <div className="rounded-2xl p-5 mb-8 border-2 border-accent-500/40 bg-accent-500/10">
            <p className="text-sm text-gray-200 leading-relaxed">
              <strong className="text-accent-400">⚠️ Pending lawyer review and member confirmation.</strong> These
              By-Laws reflect the Corporation&apos;s current operating framework. They are pending pro-bono lawyer
              review through the Ontario Nonprofit Network and confirmation by the members at the first AGM, as
              required under CNCA s. 152.
            </p>
          </div>

          {/* The Constitution & By-Laws */}
          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-gray-200 leading-relaxed text-sm">

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article I — Name and Address</h2>
              <p>1.1 The name of the organization shall be &ldquo;Challengers Cricket Club&rdquo; (the &ldquo;Corporation&rdquo;).</p>
              <p>1.2 The principal mailing address of the Club shall be: 3228 Meadowgate Blvd, London, ON N6M 0B7.</p>
              <p>1.3 The Corporation is incorporated under the <em>Canada Not-for-profit Corporations Act</em> (CNCA) as Corporation Number 1746974-8, dated 12 November 2025. The Corporation is registered (or, where required, will register) as an extra-provincial corporation in Ontario so that it may carry on its activities in the Province of Ontario.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article II — Mission and Objectives</h2>
              <p>2.1 To promote the sport of cricket in London, Ontario and surrounding communities.</p>
              <p>2.2 To foster teamwork, sportsmanship, and inclusiveness among all players.</p>
              <p>2.3 To provide organized leagues, training, and development opportunities for all skill levels.</p>
              <p>2.4 To foster physically active lifestyles and build community connections through the sport of cricket.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article III — Membership</h2>
              <p>3.1 The Corporation shall have one (1) class of members. Each member shall be entitled to receive notice of, attend, and vote at all meetings of the members of the Corporation.</p>
              <p>3.2 Membership is open to individuals regardless of age, race, gender, or ability.</p>
              <p>3.3 Members must pay annual membership dues as determined by the Board from time to time. The Board shall notify members of any changes to dues at least thirty (30) days before such changes take effect.</p>
              <p>3.4 Members are entitled to attend AGMs, participate in matches, and vote in club decisions.</p>
              <p>3.5 <strong className="text-white">Termination of Membership.</strong> A membership in the Corporation is terminated when:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>(a) the member dies;</li>
                <li>(b) the member resigns by delivering a written resignation to the Corporation;</li>
                <li>(c) the member is expelled in accordance with Section 3.6;</li>
                <li>(d) the member&apos;s term of membership expires; or</li>
                <li>(e) the Corporation is dissolved.</li>
              </ul>
              <p>3.6 <strong className="text-white">Discipline and Expulsion.</strong> The Board shall have the authority to suspend or expel any member for violating any provision of the articles, by-laws, or written policies of the Corporation, or for carrying out any conduct which may be detrimental to the Corporation as determined by the Board. The Board shall provide twenty (20) days&apos; written notice of suspension or expulsion to the member. The member may make written submissions to the Board in response within those twenty (20) days. The Board shall render a final decision within thirty (30) days from the date of notice.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article IV — Board of Directors</h2>
              <p>4.1 The Club shall be governed by a Board of Directors consisting of a minimum of one (1) and a maximum of five (5) Directors, as set out in the articles of the Corporation.</p>
              <p>4.2 The officers of the Corporation shall include:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>(a) <strong className="text-white">President</strong> – Oversees all club operations and represents the club externally.</li>
                <li>(b) <strong className="text-white">Vice-President</strong> – Assists the President and performs delegated duties.</li>
                <li>(c) <strong className="text-white">Secretary</strong> – Keeps minutes, maintains club records, and submits required filings.</li>
                <li>(d) <strong className="text-white">Treasurer</strong> – Manages all finances, budgets, and sponsorship records.</li>
              </ul>
              <p>4.3 Directors must be at least 18 years of age and serve renewable 2-year terms.</p>
              <p>4.4 Directors shall be elected at the Annual General Meeting (AGM) by a majority vote of members. Directors are eligible for re-election.</p>
              <p>4.5 A vacancy on the Board may be filled for the remainder of the term by the remaining Directors, provided a quorum of Directors remains in office.</p>
              <p>4.6 The members may, by Ordinary Resolution at a special meeting, remove any Director before the expiration of the Director&apos;s term of office, and may elect any person in their stead for the remainder of the term.</p>
              <p>4.7 Any two (2) officer positions may be held by the same person, except the offices of President and Vice-President.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article V — Meetings</h2>
              <p>5.1 The AGM shall be held annually, not later than fifteen (15) months after the last annual meeting and no later than six (6) months after the Corporation&apos;s preceding financial year-end, to elect officers, approve budgets, and vote on changes.</p>
              <p>5.2 The Board may call additional general meetings with at least seven (7) days&apos; notice by email.</p>
              <p>5.3 The Board may at any time call a special meeting of members. The Board shall call a special meeting on written requisition of not less than five percent (5%) of the members entitled to vote.</p>
              <p>5.4 Quorum for meetings of members shall be a majority of the members entitled to vote at the meeting, or ten (10) members entitled to vote, whichever is less.</p>
              <p>5.5 At any meeting of members, every question shall be determined by a majority of votes unless otherwise required by the Act or these by-laws. Every member entitled to vote shall have one (1) vote.</p>
              <p>5.6 A member may participate in a meeting by means of a telephonic, electronic, or other communication facility that permits all participants to communicate adequately with each other during the meeting. A member participating in such a meeting is deemed to be present at the meeting.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article VI — Meetings of Directors</h2>
              <p>6.1 Meetings of the Board may be called by the President or any two (2) Directors at any time. Notice of meetings shall be given at least five (5) days before the meeting by email.</p>
              <p>6.2 A majority of the number of Directors in office constitutes a quorum at any meeting of the Board.</p>
              <p>6.3 At all meetings of the Board, every question shall be decided by a majority of the votes cast. Each Director shall have one (1) vote.</p>
              <p>6.4 A Director may participate in a meeting of the Board by means of a telephonic, electronic, or other communication facility that permits all participants to communicate adequately with each other during the meeting.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article VII — Finances</h2>
              <p>7.1 All funds must be deposited into a recognized Canadian financial institution as designated by the Board.</p>
              <p>7.2 The fiscal year shall run from January 1 to December 31.</p>
              <p>7.3 <strong className="text-white">No part of club revenue shall benefit private individuals. All funds shall be used for club purposes.</strong></p>
              <p>7.4 The Treasurer shall keep full and accurate accounts of all receipts and disbursements and shall render to the Board at each regular meeting an account of the financial position of the Corporation.</p>
              <p>7.5 The Corporation shall not borrow money without approval by Special Resolution (two-thirds majority) of the members.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article VIII — Signing Authority</h2>
              <p>8.1 Contracts, documents, or instruments in writing requiring the signature of the Corporation shall be signed by any two (2) of the following officers: President, Vice-President, Secretary, or Treasurer.</p>
              <p>8.2 The Board may from time to time, by resolution, direct the manner in which and the person(s) by whom any particular contract, document, or instrument shall be signed.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article IX — Conflict of Interest</h2>
              <p>9.1 A Director or Officer who is a party to, or who has a material interest in, any material contract or transaction (whether existing or proposed) of the Corporation shall disclose the nature and extent of that interest to the Board at the earliest opportunity.</p>
              <p>9.2 A Director referred to in Section 9.1 shall not vote on any resolution to approve the contract or transaction and shall not be counted in determining whether a quorum is present for the purpose of voting on such resolution.</p>
              <p>9.3 Directors and Officers shall act honestly and in good faith with a view to the best interests of the Corporation and exercise the care, diligence, and skill that a reasonably prudent person would exercise in comparable circumstances.</p>
              <p>9.4 The full <Link href="/legal/conflict-of-interest" className="text-primary-400 underline hover:text-primary-300">Conflict of Interest Policy</Link> applies in addition to this Article.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article X — Financial Management</h2>
              <p>10.1 The Board shall ensure that proper financial records are maintained and that financial statements are prepared annually.</p>
              <p>10.2 All expenditures over $500 shall require Board approval.</p>
              <p>10.3 The Treasurer shall present a financial report at each Board meeting and at the AGM.</p>
              <p>10.4 An annual financial review shall be conducted and presented to the members at the AGM.</p>
              <p>10.5 The Corporation&apos;s full <Link href="/legal/financial-policy" className="text-primary-400 underline hover:text-primary-300">Financial Policy</Link> applies, including reimbursement-routing rules, no-retroactive-compensation rules, and signing-authority requirements, in addition to this Article.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article XI — Indemnification</h2>
              <p>11.1 The Corporation shall indemnify a Director or Officer, a former Director or Officer, or another individual who acts or acted at the Corporation&apos;s request as a Director or Officer of another entity, against all costs, charges, and expenses, including an amount paid to settle an action or satisfy a judgment, reasonably incurred by the individual in respect of any civil, criminal, administrative, investigative, or other proceeding in which the individual is involved because of their association with the Corporation, to the fullest extent permitted by the Act.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article XII — Amendments</h2>
              <p>12.1 The Board may, by resolution, make, amend, or repeal any by-law that regulates the activities or affairs of the Corporation. Any such by-law, amendment, or repeal shall be effective from the date of the resolution of the Board until confirmed, rejected, or amended by the members at the next meeting of members.</p>
              <p>12.2 Amendments to this Constitution may also be proposed by any voting member. Proposed amendments must be submitted in writing and approved by two-thirds of voting members present at the AGM.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article XIII — Dissolution</h2>
              <p>13.1 Upon dissolution of the Corporation, any property remaining after discharge of liabilities shall be distributed to one or more <strong className="text-white">qualified donees</strong> within the meaning of subsection 248(1) of the <em>Income Tax Act</em>, as set out in the articles of the Corporation.</p>
              <p>13.2 <strong className="text-white">No remaining assets shall be distributed to members, directors, or officers.</strong> This Article complies with CNCA and Canada Revenue Agency requirements for not-for-profit and charitable organizations.</p>
              <p>13.3 For the avoidance of doubt: the software, source code, and infrastructure described in Article XIV are <strong className="text-white">not assets of the Corporation</strong>. They cannot be transferred to a successor organization on dissolution because they were never owned by the Corporation. The licence granted under Article XIV.2 may be transferred to a successor not-for-profit organization only with the written consent of the licensor (Mohammed Saad).</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article XIV — Software, Infrastructure &amp; Intellectual Property</h2>
              <p>14.1 The Corporation <strong className="text-white">does not own</strong> the software, source code, designs, or cloud infrastructure that operate the Corporation&apos;s website (<code className="text-primary-400">challengerscc.ca</code>) or the C3H members&apos; portal. Those works are the personal intellectual property of <strong className="text-white">Mohammed Saad</strong>, who authored them in his individual capacity and is the first owner of copyright under section 13(1) of the federal <em>Copyright Act</em>.</p>
              <p>14.2 The Corporation uses the platform under a <strong className="text-white">limited, non-exclusive, non-transferable, revocable licence</strong> from Mohammed Saad. The licence is provided <strong className="text-white">at no charge</strong> for so long as he continues to serve as a director of the Corporation and elects to continue providing the platform. The licence is <strong className="text-white">not perpetual and not irrevocable</strong>. The licence is recorded in the Corporation&apos;s <Link href="/legal/ip-ownership" className="text-primary-400 underline hover:text-primary-300">Software &amp; IP Ownership Acknowledgement</Link> and is to be formalized in a separate Software Licence Agreement signed by the Board.</p>
              <p>14.3 Mohammed Saad <strong className="text-white">retains the unilateral right</strong> to terminate the licence and withdraw the platform — frontend, backend, source code, deployments, cloud infrastructure, and all related setup — at his sole discretion on reasonable written notice (no less than thirty days unless terminated for cause). If he ceases to be a director of the Corporation for any reason, the no-charge arrangement may be wound down, re-priced at fair market value, or terminated. On termination, the Corporation&apos;s right to use the platform ends and the Corporation has no claim to the source code, deployments, or infrastructure.</p>
              <p>14.4 The Corporation <strong className="text-white">shall not assert</strong> ownership, co-ownership, royalty rights, or revenue-share rights over any software, source code, design, or derivative work licensed to the Corporation by Mohammed Saad. The Corporation&apos;s use is limited to its own internal operations as a volunteer-run not-for-profit. The Corporation may not sublicense, resell, white-label, or commercialize the platform, nor demand assignment or escrow of source code.</p>
              <p>14.5 Mohammed Saad&apos;s service as a director of the Corporation, his volunteer hours, and any unpaid technical contribution he makes do <strong className="text-white">not</strong> constitute an employment relationship, a work-for-hire arrangement, or an assignment of intellectual property under section 13 of the federal <em>Copyright Act</em>. The Corporation has never employed him and has never paid him for software development.</p>
              <p>14.6 The Corporation acknowledges that Mohammed Saad <strong className="text-white">reserves the right</strong> to develop, market, and sell multi-tenant or commercial versions of the platform to other organizations, including by assigning or licensing his rights to a corporation he owns or to any third party, with no obligation to the Corporation. Member data of the Corporation shall not be used for any such commercial product without explicit member consent and a separate Data Processing Agreement.</p>
              <p>14.7 The same principle applies <strong className="text-white">to any other director or member</strong> who contributes pre-existing software, designs, photographs, video, written content, or trademarks to the Corporation: ownership of such pre-existing works is retained by the contributor unless and until a written assignment is signed. The Corporation obtains only the licence rights it needs to operate, as set out in the <Link href="/legal/volunteer-agreement" className="text-primary-400 underline hover:text-primary-300">Volunteer Agreement</Link>.</p>
              <p>14.8 This Article may be amended only by the same two-thirds member vote required for any other By-Law amendment under Article XII. No amendment of this Article shall retroactively transfer to the Corporation any intellectual property already protected by it.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article XV — Member Data and Club-Owned Cloud Infrastructure</h2>
              <p>15.1 Notwithstanding Article XIV (which concerns software, source code, and design IP), the Corporation is the sole owner and data controller of all <strong className="text-white">member data and personal information</strong> stored on the platform, including registrations, availability, scoring records, training reflections, e-signed legal documents, governance signatures, and any other information generated through use of the platform.</p>
              <p>15.2 The <strong className="text-white">Firebase / Google Cloud project</strong> (project ID <code className="text-primary-400">challengers-c3h</code>) where this data resides is registered to and administered by the Corporation through the <strong className="text-white">contact@challengerscc.ca</strong> Google Workspace account, which holds the <strong className="text-white">Owner</strong> role in the Google Cloud Console. The Corporation controls billing, access permissions, security rules, and may revoke any developer&apos;s access at any time by Board resolution.</p>
              <p>15.3 Mohammed Saad does not own the project, the data, or any administrative claim on personal information stored there. His access is operational only and is held at the Corporation&apos;s discretion. He acts as <strong className="text-white">data processor</strong> within the meaning of PIPEDA, on the Corporation&apos;s instructions, and may not use member data for any other purpose. See the <Link href="/legal/privacy" className="text-primary-400 underline hover:text-primary-300">Privacy Policy</Link> and <Link href="/legal/ip-ownership" className="text-primary-400 underline hover:text-primary-300">IP Ownership Acknowledgement</Link> for the full data-handling terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article XVI — Volunteer Status (Express)</h2>
              <p>16.1 All Directors, Officers, members, players, captains, coaches, and contributors serve the Corporation on a <strong className="text-white">strictly volunteer basis</strong>. No Director, Officer, member, player, or contributor receives, has received, or shall receive wages, salary, fees, honoraria, vacation pay, sick pay, severance, benefits, or any other form of compensation in connection with their service to the Corporation.</p>
              <p>16.2 The Corporation has not registered as an employer with the Canada Revenue Agency, has never operated a payroll, has never issued a T4 slip, and has never made any payment to any individual for services rendered.</p>
              <p>16.3 Reimbursement of out-of-pocket expenses paid on behalf of the Corporation is <strong className="text-white">not compensation</strong>, and remains permitted in accordance with the <Link href="/legal/financial-policy" className="text-primary-400 underline hover:text-primary-300">Financial Policy</Link> (which requires prior Board approval, original receipts, a 60-day claim window, and personal-account routing).</p>
              <p>16.4 Holding any title or role within the Corporation — including Director, President, Vice-President, Secretary, Treasurer, Captain, Vice-Captain, Coach, Scorer, or any committee position — does not, and shall never, give rise to a claim for retrospective compensation, fees, honoraria, or remuneration. Hours invested, work performed, results delivered, and outcomes achieved are all contributed on a volunteer basis and create no entitlement to payment now or in the future. This Article cannot be circumvented by a future Board resolution or member vote — any retroactive payment for past unpaid service is expressly prohibited.</p>
              <p>16.5 The waivers and acknowledgements in this Article survive any individual&apos;s departure from the Corporation, for any reason — resignation, removal, end of term, dispute, or otherwise. A former Director, Officer, or volunteer may not, after departure, raise a new claim for compensation, retroactive payment, or remuneration based on past service to the Corporation.</p>
            </section>

            <hr className="border-white/10" />

            {/* Footer */}
            <p className="text-xs text-gray-500 italic">
              Document version: v2.0 (2026-05-08) · Pending pro-bono lawyer review and member confirmation at first AGM. <br />
              v2.0 (2026-05-08) — restructures the Constitution &amp; By-Laws to match the federally-incorporated framework under CNCA, adds Articles XIV (Software/IP), XV (Data + Cloud Infrastructure), and XVI (Volunteer Status — Express); harmonises with the Corporations Canada profile that lists the five directors of the Corporation as Mohammed Saad, Ankush Arora, Md Monirul Islam, Sazzad Mahmud, and Gokul Prakash. Officer onboarding is in progress; no officer has yet formally e-signed and accepted their Officer Appointment Letter under CNCA. <br />
              The Board will adopt these By-Laws by formal resolution and confirm them at the first members&apos; meeting (Annual General Meeting), to be held no later than 11 February 2027 (15 months after incorporation per CNCA). The signed By-Laws will then be filed with Corporations Canada under CNCA s. 152.
            </p>

            {/* Public-availability note */}
            <p className="text-xs text-gray-600 italic mt-3">
              Published openly at <a href="https://challengerscc.ca/legal/bylaws" className="text-primary-400 underline hover:text-primary-300">challengerscc.ca/legal/bylaws</a>{' '}
              for full transparency to members, sponsors, partners, and regulators. Questions about this document
              may be directed to <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline hover:text-primary-300">contact@challengerscc.ca</a>.
            </p>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
