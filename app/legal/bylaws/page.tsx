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
              <h2 className="text-lg font-bold text-white mb-2">Article 10 — Amendment of Bylaws</h2>
              <p>10.1 These Bylaws may be amended by a two-thirds majority of members present and voting at any AGM or special meeting of members, where notice of the proposed amendment was given at least 21 days in advance.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 11 — Dissolution</h2>
              <p>11.1 If the Club is dissolved, after payment of all liabilities, the remaining assets shall be distributed to one or more charitable or not-for-profit organizations whose purposes align with those of the Club, as determined by the members at the meeting authorizing dissolution.</p>
              <p>11.2 <strong className="text-white">No remaining assets shall be distributed to members, directors, or officers</strong>. This article complies with ONCA and Canada Revenue Agency requirements for non-profit and charitable organizations.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Article 12 — Effective Date</h2>
              <p>12.1 These Bylaws take effect on the date they are ratified by a member vote at a duly-called meeting of members. Until ratified, they serve as the operating practice of the volunteer board.</p>
              <p>12.2 Earlier provisional rules of the Club, if any, are superseded by these Bylaws upon ratification.</p>
            </section>

            <hr className="border-white/10" />

            <p className="text-xs text-gray-500 italic">Document version: v1.0 (Draft) · 30 April 2026 · Pending legal review and member ratification.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
