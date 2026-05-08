import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Bylaws (Draft) — Challengers Cricket Club',
  description: 'Bylaws of Challengers Cricket Club, an Ontario Not-for-Profit Corporation. Starter draft pending legal review.',
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3">Bylaws</h1>
            <p className="text-sm text-gray-500">Challengers Cricket Club · Ontario NFP Corporation #1746974-8</p>
          </div>

          <div className="rounded-2xl p-5 mb-8 border-2 border-accent-500/40 bg-accent-500/10">
            <p className="text-sm text-gray-200 leading-relaxed">
              <strong className="text-accent-400">⚠️ Draft pending legal review.</strong> These Bylaws are a good-faith starter
              draft prepared by the volunteer board. They have not yet been ratified by a member vote and have not been reviewed
              by a lawyer. We are pursuing pro-bono review through the Ontario Nonprofit Network and partner law firms.
              They reflect our current operating practice and intent — not a final ratified document.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-gray-200 leading-relaxed text-sm">

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 1 — Name and Office</h2>
              <p>1.1 The name of the corporation is <strong className="text-white">Challengers Cricket Club</strong>.</p>
              <p>1.2 The corporation is incorporated under the Ontario Not-for-Profit Corporations Act (ONCA) as Ontario Corporation Number 1746974-8, dated 11 November 2025.</p>
              <p>1.3 The registered office of the Club is located in London, Ontario, Canada, at the address recorded with the Ontario Business Registry.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 2 — Purpose</h2>
              <p>2.1 The Club&apos;s purposes, as set out in its Articles of Incorporation, are to:</p>
              <ul className="space-y-1.5 mt-2 list-disc list-inside ml-2">
                <li>Promote the sport of cricket in London, Ontario, and surrounding communities</li>
                <li>Provide accessible cricket programming for newcomer Canadians and the wider community</li>
                <li>Foster inclusion, multi-faith fellowship, and community integration through sport</li>
                <li>Develop player skill and sportsmanship at all levels</li>
                <li>Cooperate with other community sport organizations to expand access to cricket</li>
              </ul>
              <p className="mt-2">2.2 The Club is operated exclusively as a not-for-profit. <strong className="text-white">No part of the Club&apos;s income or property may be paid or distributed to its members, directors, or officers</strong>, except as reasonable reimbursement for expenses approved under the Financial Policy.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 3 — Members</h2>
              <p>3.1 Membership is open to any individual aged 18 or over (and to minors with parental consent under specific programs) who:</p>
              <ul className="space-y-1.5 mt-2 list-disc list-inside ml-2">
                <li>Submits an application accepted by the board</li>
                <li>Pays applicable membership fees set by the board from year to year</li>
                <li>Signs the Volunteer Agreement and Liability Waiver</li>
                <li>Agrees to abide by these Bylaws and the Code of Conduct</li>
              </ul>
              <p className="mt-2">3.2 Each member in good standing has one vote at members&apos; meetings.</p>
              <p>3.3 Membership may be terminated by: (a) resignation in writing; (b) non-payment of fees; (c) board decision following a Code of Conduct violation; or (d) member vote at an AGM by majority of members present.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 4 — Directors</h2>
              <p>4.1 The Club is governed by a Board of Directors of between three and nine directors.</p>
              <p>4.2 Directors are elected by the members at the Annual General Meeting (AGM) for a term of two years. Directors may serve consecutive terms.</p>
              <p>4.3 Directors must be members of the Club, at least 18 years of age, and not bankrupt or otherwise disqualified under ONCA.</p>
              <p>4.4 <strong className="text-white">Directors serve without compensation</strong>. Reasonable expenses incurred on Club business may be reimbursed under the Financial Policy.</p>
              <p>4.5 A director may resign by written notice. The board may declare a director&apos;s seat vacant if the director: misses three consecutive board meetings without cause; is found to have materially breached this Code of Conduct or the Conflict of Interest Policy; or becomes disqualified under ONCA.</p>
              <p>4.6 The board may fill mid-term vacancies by appointment until the next AGM.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 5 — Officers</h2>
              <p>5.1 The board appoints, from among the directors:</p>
              <ul className="space-y-1.5 mt-2 list-disc list-inside ml-2">
                <li><strong className="text-white">President</strong> — chairs board meetings and represents the Club externally</li>
                <li><strong className="text-white">Vice-President</strong> — supports the President and stands in their absence</li>
                <li><strong className="text-white">Secretary</strong> — keeps records, minutes, and member rolls; handles correspondence</li>
                <li><strong className="text-white">Treasurer</strong> — keeps financial records, prepares the annual statement, leads compliance with the Financial Policy</li>
              </ul>
              <p className="mt-2">5.2 The board may appoint additional officers (Captain, Communications Lead, Sponsorship Lead, etc.) as needed. All officer roles are unpaid volunteer positions.</p>
              <p>5.3 Officers serve at the board&apos;s discretion and may be replaced by board majority vote.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 6 — Meetings of the Board</h2>
              <p>6.1 The board meets at least <strong className="text-white">quarterly</strong>. Additional meetings may be called by the President or by any two directors.</p>
              <p>6.2 Meetings may be held in person, by video conference, or by telephone. Email or messaging exchanges constitute meetings only if all directors participate and minutes are taken.</p>
              <p>6.3 Quorum is a majority of directors then in office.</p>
              <p>6.4 Each director has one vote. Motions pass by simple majority of directors present and voting. The President has no second or casting vote — ties are resolved by re-discussion or postponement.</p>
              <p>6.5 Minutes of every board meeting are taken by the Secretary or designate, reviewed at the following meeting, and retained for at least seven years.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 7 — Members&apos; Meetings</h2>
              <p>7.1 The Club holds an Annual General Meeting (AGM) once per calendar year, no later than 15 months after the previous AGM.</p>
              <p>7.2 At the AGM, the board:</p>
              <ul className="space-y-1.5 mt-2 list-disc list-inside ml-2">
                <li>Presents the previous year&apos;s annual financial statement</li>
                <li>Reports on the year&apos;s activities and significant decisions</li>
                <li>Holds elections for any directors whose terms are ending</li>
                <li>Receives and considers any other business raised by members</li>
              </ul>
              <p className="mt-2">7.3 Notice of the AGM is given to all members at least 21 days in advance, by email or by posting on the Club website.</p>
              <p>7.4 Quorum at members&apos; meetings is 25% of members in good standing, or five members, whichever is greater.</p>
              <p>7.5 Special meetings of members may be called by the board or upon written request of at least 10% of members.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 8 — Financial Year and Records</h2>
              <p>8.1 The Club&apos;s fiscal year is the calendar year (1 January to 31 December).</p>
              <p>8.2 The Club&apos;s books, records, minutes, member rolls, and financial statements are maintained in accordance with the Financial Policy and ONCA.</p>
              <p>8.3 Members may, on reasonable notice, inspect the books and records of the Club, except for confidential personal information of other members.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 9 — Indemnification</h2>
              <p>9.1 The Club indemnifies its directors, officers, and authorized volunteers against all costs, charges, and expenses reasonably incurred in connection with their service to the Club, except where the loss arises from the individual&apos;s wilful misconduct, gross negligence, or breach of fiduciary duty.</p>
              <p>9.2 The Club may purchase Directors&apos; and Officers&apos; (D&amp;O) liability insurance to support this indemnification.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 10 — Software, Infrastructure &amp; Intellectual Property</h2>
              <p>10.1 The Club <strong className="text-white">does not own</strong> the software, source code, designs, or cloud infrastructure that operate the Club&apos;s website (<code className="text-primary-400">challengerscc.ca</code>) or the C3H members&apos; portal. Those works are the personal intellectual property of <strong className="text-white">Mohammed Saad</strong>, who authored them in his individual capacity and is the first owner of copyright under section 13(1) of the federal <em>Copyright Act</em>.</p>
              <p>10.2 The Club uses the platform under a <strong className="text-white">limited, non-exclusive, non-transferable, revocable licence</strong> from Mohammed Saad. The licence is provided <strong className="text-white">at no charge</strong> for so long as he continues to serve as a director of the Club and elects to continue providing the platform. The licence is <strong className="text-white">not perpetual and not irrevocable</strong>. The licence is recorded in the Club&apos;s <Link href="/legal/ip-ownership" className="text-primary-400 underline hover:text-primary-300">Software &amp; IP Ownership Acknowledgement</Link> and is to be formalized in a separate Software Licence Agreement signed by the board.</p>
              <p>10.2.1 Mohammed Saad <strong className="text-white">retains the unilateral right</strong> to terminate the licence and withdraw the platform — frontend, backend, source code, deployments, cloud infrastructure, and all related setup — at his sole discretion on reasonable written notice (no less than thirty days unless terminated for cause). If he ceases to be a director of the Club for any reason, the no-charge arrangement may be wound down, re-priced at fair market value, or terminated. On termination, the Club&apos;s right to use the platform ends and the Club has no claim to the source code, deployments, or infrastructure.</p>
              <p>10.3 The Club <strong className="text-white">shall not assert</strong> ownership, co-ownership, royalty rights, or revenue-share rights over any software, source code, design, or derivative work licensed to the Club by Mohammed Saad. The Club&apos;s use is limited to its own internal operations as a volunteer-run not-for-profit. The Club may not sublicense, resell, white-label, or commercialize the platform, nor demand assignment or escrow of source code.</p>
              <p>10.4 Mohammed Saad&apos;s service as a director of the Club, his volunteer hours, and any unpaid technical contribution he makes do <strong className="text-white">not</strong> constitute an employment relationship, a work-for-hire arrangement, or an assignment of intellectual property under section 13 of the federal <em>Copyright Act</em>. The Club has never employed him and has never paid him for software development.</p>
              <p>10.5 The Club acknowledges that Mohammed Saad <strong className="text-white">reserves the right</strong> to develop, market, and sell multi-tenant or commercial versions of the platform to other organizations, including by assigning or licensing his rights to a corporation he owns or to any third party, with no obligation to the Club. Any such internal arrangement is his private business decision. Member data of the Club shall not be used for any such commercial product without explicit member consent and a separate Data Processing Agreement.</p>
              <p>10.5A <strong className="text-white">Member data and Club-owned cloud infrastructure.</strong> Notwithstanding clauses 10.1 through 10.5 (which concern software, source code, and design IP), the Club is the sole owner and data controller of all <strong className="text-white">member data and personal information</strong> stored on the platform, including registrations, availability, scoring records, training reflections, e-signed legal documents, governance signatures, and any other information generated through use of the platform. The <strong className="text-white">Firebase / Google Cloud project</strong> (project ID <code className="text-primary-400">challengers-c3h</code>) where this data resides is registered to and administered by the Club through the <strong className="text-white">contact@challengerscc.ca</strong> Google Workspace account, which holds the <strong className="text-white">Owner</strong> role in the Google Cloud Console. Mohammed Saad does not own the project, the data, or any administrative claim on personal information stored there; his access is operational only and may be revoked at any time by board resolution. He acts as <strong className="text-white">data processor</strong> within the meaning of PIPEDA, on the Club&apos;s instructions, and may not use member data for any other purpose. See the <Link href="/legal/privacy" className="text-primary-400 underline hover:text-primary-300">Privacy Policy</Link> and <Link href="/legal/ip-ownership" className="text-primary-400 underline hover:text-primary-300">IP Ownership Acknowledgement</Link> for the full data-handling terms.</p>
              <p>10.6 The same principle applies <strong className="text-white">to any other director or member</strong> who contributes pre-existing software, designs, photographs, video, written content, or trademarks to the Club: ownership of such pre-existing works is retained by the contributor unless and until a written assignment is signed. The Club obtains only the licence rights it needs to operate, as set out in the <Link href="/legal/volunteer-agreement" className="text-primary-400 underline hover:text-primary-300">Volunteer Agreement</Link>.</p>
              <p>10.7 This Article may be amended only by the same two-thirds member vote required for any other Bylaw amendment under Article 11. No amendment of this Article shall retroactively transfer to the Club any intellectual property already protected by it.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 11 — Amendment of Bylaws</h2>
              <p>11.1 These Bylaws may be amended by a two-thirds majority of members present and voting at any AGM or special meeting of members, where notice of the proposed amendment was given at least 21 days in advance.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 12 — Dissolution</h2>
              <p>12.1 If the Club is dissolved, after payment of all liabilities, the remaining assets shall be distributed to one or more charitable or not-for-profit organizations whose purposes align with those of the Club, as determined by the members at the meeting authorizing dissolution.</p>
              <p>12.2 <strong className="text-white">No remaining assets shall be distributed to members, directors, or officers</strong>. This article complies with ONCA and Canada Revenue Agency requirements for non-profit and charitable organizations.</p>
              <p>12.3 For the avoidance of doubt: the software, source code, and infrastructure described in Article 10 are <strong className="text-white">not assets of the Club</strong>. They cannot be transferred to a successor organization on dissolution because they were never owned by the Club. The licence granted under Article 10.2 may be transferred to a successor not-for-profit organization only with the written consent of Mohammed Saad.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 13 — Effective Date</h2>
              <p>13.1 These Bylaws take effect on the date they are ratified by a member vote at a duly-called meeting of members. Until ratified, they serve as the operating practice of the volunteer board.</p>
              <p>13.2 Earlier provisional rules of the Club, if any, are superseded by these Bylaws upon ratification.</p>
            </section>

            <hr className="border-white/10" />

            <p className="text-xs text-gray-500 italic">Document version: v1.1 (Draft) · 8 May 2026 · Pending legal review and member ratification. v1.1 inserts Article 10.5A clarifying that member data and the Firebase / Google Cloud project (<code className="text-primary-400">challengers-c3h</code>) are owned by the Club and administered through <strong className="text-gray-400">contact@challengerscc.ca</strong>, separate from Mohammed Saad&apos;s personal IP in the source code.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
