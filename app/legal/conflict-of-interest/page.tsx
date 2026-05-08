import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SignBlock from './SignBlock';

export const metadata = {
  title: 'Conflict of Interest Policy — Challengers Cricket Club',
  description: 'Director and officer Conflict of Interest Policy for Challengers Cricket Club, a Canada Not-for-Profit Corporation.',
};

export default function ConflictOfInterestPage() {
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
            <span className="text-3xl">🧭</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3">Conflict of Interest Policy</h1>
            <p className="text-sm text-gray-500">Challengers Cricket Club · Effective 30 April 2026</p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-gray-200 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Purpose</h2>
              <p className="text-sm">This Policy ensures that Challengers Cricket Club&apos;s directors, officers, and committee members make decisions in the best interests of the Club — not their personal, family, or business interests. It protects the Club&apos;s reputation, complies with the <em>Canada Not-for-profit Corporations Act</em> (CNCA), and prepares the Club for CRA charity registration.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Who this applies to</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>All directors of the Club</li>
                <li>All officers (President, Vice-President, Secretary, Treasurer, etc.)</li>
                <li>Members of any committee or working group authorized by the board</li>
                <li>Captains, when making decisions about Club matters beyond on-field selection</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">What is a conflict of interest?</h2>
              <p className="text-sm">A conflict of interest exists when a director, officer, or committee member has a personal, family, or business interest that <strong className="text-white">could reasonably be seen to influence</strong> their judgment on a Club matter. Common examples include:</p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li>The director (or their spouse, child, parent, sibling, or business partner) is a sponsor, donor, contractor, or supplier to the Club.</li>
                <li>The director&apos;s business stands to benefit from a Club decision (e.g. a partnership, a sponsorship arrangement, a venue contract).</li>
                <li>The director has a personal relationship with another individual being considered for a paid or unpaid Club role with significant authority.</li>
                <li>The director receives a personal gift, favour, or hospitality from a Club partner that could influence their decisions.</li>
                <li>The director has access to confidential Club information that could give their personal business an unfair advantage.</li>
              </ul>
              <p className="text-sm mt-2">A conflict of interest is <strong className="text-white">not automatically wrong</strong>. It just means the director must disclose it and not participate in the decision.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Annual disclosure</h2>
              <p className="text-sm">Each director and officer signs an annual Conflict of Interest Declaration listing:</p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li>Any business they own, partly own, or are employed by that has, or could have, a relationship with the Club</li>
                <li>Any family member they have a financial relationship with who has a Club connection</li>
                <li>Any sponsorship, donation, or in-kind support they personally have provided or are likely to provide</li>
                <li>Any other interest a reasonable person might consider relevant</li>
              </ul>
              <p className="text-sm mt-2">Declarations are reviewed by the board and kept on file. They are updated whenever a new conflict arises during the year.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Real-time disclosure</h2>
              <p className="text-sm">When any matter comes before the board where a director has, or might appear to have, a conflict of interest, that director must:</p>
              <ol className="space-y-2 mt-2 text-sm list-decimal list-inside ml-2">
                <li><strong className="text-white">Disclose</strong> the conflict to the rest of the board, in plain language, before the discussion begins.</li>
                <li><strong className="text-white">Recuse themselves</strong> from the discussion and the vote. They leave the room (or virtual meeting) while the matter is debated and decided.</li>
                <li><strong className="text-white">Have the recusal recorded</strong> in the meeting minutes, naming the conflict.</li>
                <li>Not lobby other directors privately about the matter outside the meeting.</li>
              </ol>
              <p className="text-sm mt-2">If the conflict is minor (e.g. the director&apos;s family member happens to be a member of the Club, but the matter is unrelated to that person), the board may decide the conflicted director can remain in the discussion but not vote.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Specific scenarios</h2>

              <div className="rounded-xl p-4 bg-white/5 border border-white/10 mb-3">
                <p className="text-sm font-bold text-white mb-1">Sponsorship from a director&apos;s business</p>
                <p className="text-sm text-gray-300">Allowed, but the director recuses themselves from any board vote that determines the sponsorship&apos;s terms, tier, or recognition. The board must conclude — and minute — that the sponsorship terms are no more favourable than the Club&apos;s standard terms for that tier.</p>
              </div>

              <div className="rounded-xl p-4 bg-white/5 border border-white/10 mb-3">
                <p className="text-sm font-bold text-white mb-1">Hiring a director&apos;s family member as a coach</p>
                <p className="text-sm text-gray-300">Discouraged. If unavoidable, the director recuses themselves entirely from the decision. The role must be: (a) genuinely volunteer (per the Club&apos;s no-paid-staff policy), or (b) competitively offered if paid. Compensation, if any, must be at fair market value.</p>
              </div>

              <div className="rounded-xl p-4 bg-white/5 border border-white/10 mb-3">
                <p className="text-sm font-bold text-white mb-1">Director&apos;s business supplies the Club</p>
                <p className="text-sm text-gray-300">Allowed only if: (a) the goods or services are at or below market price, (b) at least one comparable quote was obtained from an unrelated supplier, and (c) the director recused themselves from the supplier-selection decision.</p>
              </div>

              <div className="rounded-xl p-4 bg-white/5 border border-white/10 mb-3">
                <p className="text-sm font-bold text-white mb-1">Director receives gifts from a sponsor</p>
                <p className="text-sm text-gray-300">Token gifts (e.g. a free meal, branded merchandise) under $100 in value are acceptable. Gifts above that threshold must be disclosed to the board and either declined, returned, or — if appropriate — passed to the Club as a donation.</p>
              </div>

              <div className="rounded-xl p-4 bg-accent-500/5 border border-accent-500/30">
                <p className="text-sm font-bold text-white mb-1">Director-owned company providing software, infrastructure, or technical services to the Club</p>
                <p className="text-sm text-gray-300">Allowed only if: (a) the contribution is recorded in writing as either an in-kind donation under licence or a paid contract at fair market value; (b) the Club&apos;s ownership of, or licence to, the resulting work is set out clearly in a written agreement; (c) the conflicted director recuses themselves from any board vote concerning that agreement; and (d) the arrangement is publicly disclosed in a governance document accessible to members and regulators.</p>
                <p className="text-sm text-gray-300 mt-2">A current standing example: see the <strong className="text-white">platform-licence standing disclosure</strong> below.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Standing disclosures</h2>
              <p className="text-sm mb-3">The Club maintains a public register of standing related-party arrangements. As of the date of this Policy, the following arrangement is on the register:</p>

              <div className="rounded-xl p-4 bg-white/5 border-2 border-accent-500/40">
                <p className="text-xs uppercase tracking-wider text-accent-400 font-bold mb-2">Standing Disclosure — Mohammed Saad / CCC platform licence</p>
                <ul className="text-sm text-gray-200 space-y-1.5">
                  <li><strong className="text-white">Conflicted director:</strong> Mohammed Saad (co-founding director and Privacy Officer of the Club).</li>
                  <li><strong className="text-white">Related-party role:</strong> Mohammed Saad personally, as the author and copyright owner of the C3H portal and challengerscc.ca website under <em>Copyright Act</em> §13(1).</li>
                  <li><strong className="text-white">Nature of the arrangement:</strong> Mohammed Saad personally authored and continues to operate the Club&apos;s public website (<code className="text-primary-400">challengerscc.ca</code>) and the C3H members&apos; portal. The Club uses the platform under a <strong className="text-white">limited, non-exclusive, non-transferable, revocable licence</strong> at no charge for so long as he continues to serve as a director of the Club and elects to continue providing the platform. He retains the unilateral right to terminate the licence and withdraw the platform on reasonable written notice. The Club has never paid him for software development. How he organizes his own intellectual property internally — including any future arrangement with a corporation he owns — is his private business and is not the subject of this disclosure.</li>
                  <li><strong className="text-white">Documents on file:</strong> the public <Link href="/legal/ip-ownership" className="text-primary-400 underline hover:text-primary-300">Software &amp; IP Ownership Acknowledgement</Link>; the carve-out in Section 3 of the <Link href="/legal/volunteer-agreement" className="text-primary-400 underline hover:text-primary-300">Volunteer Agreement</Link>; <Link href="/legal/bylaws" className="text-primary-400 underline hover:text-primary-300">Bylaws Article 10</Link>; the disclosure in the <Link href="/legal/privacy" className="text-primary-400 underline hover:text-primary-300">Privacy Policy</Link>. A formal Software Licence Agreement is to be e-signed by the directors via the C3H Pavilion governance module.</li>
                  <li><strong className="text-white">How the conflict is managed:</strong> Mohammed Saad declares the conflict at every board meeting at which the Club&apos;s technology arrangements are discussed, and abstains from any vote concerning the platform-licence relationship. The remaining directors review and approve any change to that relationship. The arrangement, in its current form, is on terms strictly favourable to the Club (zero cost to the Club while he serves as a director; member data protected from commercial re-use).</li>
                  <li><strong className="text-white">Reviewed:</strong> annually at the AGM. Updated whenever the underlying agreements change.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Confidentiality</h2>
              <p className="text-sm">Directors must not use confidential Club information (member lists, sponsor contacts, financial details, strategic plans) for personal gain or to advantage their personal businesses, family, or friends.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Consequences of breach</h2>
              <p className="text-sm">A breach of this Policy may result in:</p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li>The board reversing or voiding the affected decision</li>
                <li>The director being asked to resign, or being removed by member vote at the next AGM</li>
                <li>The director being required to repay any improper personal benefit received</li>
                <li>Referral to authorities if criminal conduct is suspected</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Reporting concerns</h2>
              <p className="text-sm">Members or volunteers who suspect a director has an undisclosed conflict, or has acted in their personal interest at the Club&apos;s expense, may report confidentially to <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline hover:text-primary-300 break-all">contact@challengerscc.ca</a>. Good-faith reports will be investigated and the reporter will be protected from retaliation.</p>
            </section>

            <hr className="border-white/10" />

            <section>
              <h2 className="text-lg font-bold text-white mb-3">Annual Director / Officer Declaration</h2>
              <p className="text-sm mb-4">
                Each director, officer, captain, and committee member completes this annually. By signing below, I,
                the named signer, confirm that I have read this Conflict of Interest Policy, I agree to follow it,
                I have declared any potential conflicts in the field below, and I will disclose any new conflicts
                that arise during the year.
              </p>
              <SignBlock />
            </section>

            <hr className="border-white/10" />

            <p className="text-xs text-gray-500 italic">Document version: v1.0 · 30 April 2026 · Pending legal review.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
