import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SignBlock from './SignBlock';

export const metadata = {
  title: 'Volunteer Agreement — Challengers Cricket Club',
  description: 'Volunteer Agreement signed by every player, board member, and contributor of Challengers Cricket Club, an Ontario Not-for-Profit Corporation.',
};

export default function VolunteerAgreementPage() {
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
            <span className="text-3xl">🤝</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3">Volunteer Agreement</h1>
            <p className="text-sm text-gray-500">Challengers Cricket Club · Ontario NFP Corporation #1746974-8</p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-gray-200 leading-relaxed">

            <p className="text-sm text-gray-400 italic">
              This Agreement is made between Challengers Cricket Club (&ldquo;the Club&rdquo;) and the individual signing below (&ldquo;the Volunteer&rdquo;). Please read it carefully before signing. By signing, the Volunteer confirms they understand and accept the terms below.
            </p>

            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
              <p className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
                <span>⏰</span>
                <span>Signing deadline — 30 May 2026</span>
              </p>
              <p className="text-sm text-amber-100 leading-relaxed mb-2">
                All players, officers, directors, and volunteers are required to sign this Volunteer
                Agreement (and the related Liability Waiver, Code of Conduct, and Photography Consent) by
                <strong className="text-white"> 30 May 2026</strong>.
              </p>
              <p className="text-sm text-amber-100 leading-relaxed">
                Members who have not signed by the deadline are <strong className="text-white">not
                entitled to</strong>: expense reimbursement from the Club; inclusion in match squads;
                Club-issued gear or jerseys; recognition, awards, or benefits paid for by the Club; or any
                other Club-issued entitlement that depends on volunteer status. Members who continue to
                participate without signing do so at their own risk and outside the protections of this
                Agreement, the Liability Waiver, and the Conflict of Interest Policy.
              </p>
            </div>

            <hr className="border-white/10" />

            <section>
              <h2 className="text-lg font-bold text-white mb-2">1. Volunteer Status</h2>
              <p className="text-sm">The Volunteer is participating in Challengers Cricket Club as a <strong className="text-white">volunteer only</strong>. The Volunteer is not, and will not become through this engagement, an employee, contractor, agent, or representative of the Club for purposes of payment or compensation.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">2. No Compensation</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>The Volunteer will receive <strong className="text-white">no wages, salary, fees, vacation pay, sick pay, severance, or benefits</strong> in connection with their volunteer service to the Club.</li>
                <li>The Volunteer acknowledges the Club is an Ontario Not-for-Profit Corporation and operates entirely on volunteer effort and member contributions. The Club has no capacity to pay any individual for services rendered.</li>
                <li>The Volunteer waives, both now and forever, any and all claims for past, present, or future compensation arising from any work, contribution, or service offered to the Club — including (without limitation) playing, coaching, scoring, photography, videography, broadcasting, web/app development, social-media management, sponsor outreach, governance, administration, or any other contribution.</li>
                <li><strong className="text-white">No retroactive claim based on role or hours.</strong> The Volunteer agrees that holding any title or role within the Club — including but not limited to <em>Director, Officer, Treasurer, Secretary, Captain, Vice-Captain, Coach, Scorer, or any committee position</em> — does not, and shall never, give rise to a claim for retrospective compensation, fees, honoraria, or remuneration. The Volunteer&apos;s signature below is a <strong className="text-white">full and final settlement</strong> of any claim arising from service to the Club from the date of joining through the date of signing, and a continuing waiver for all service rendered thereafter. Hours invested, work performed, results delivered, fundraising secured, and outcomes achieved are all contributed on a volunteer basis and create no entitlement to payment now or in the future.</li>
                <li><strong className="text-white">Permanent effect on departure.</strong> The waivers and acknowledgements in this Section 2 survive the Volunteer&apos;s departure from the Club for any reason — resignation, removal, end of term, dispute, or otherwise. A former Volunteer who has signed this Agreement may not, after departure, raise a new claim for compensation, retroactive payment, or remuneration based on past volunteer service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">3. Donated Work Product</h2>
              <p className="text-sm">Any work product the Volunteer creates in connection with the Club — including but not limited to designs, content, photographs, videos, training materials, and documents — is contributed as a <strong className="text-white">donation to the Club</strong>. The Volunteer assigns to the Club a perpetual, irrevocable, royalty-free, worldwide licence to use, modify, reproduce, and distribute that work product for the Club&apos;s purposes.</p>
              <p className="text-sm mt-3">
                <strong className="text-accent-400">Exception — pre-existing intellectual property contributed under a separate licence.</strong>
                {' '}This Section 3 does <strong className="text-white">not</strong> apply to source code, software, infrastructure, or
                derivative works that the Volunteer (or a corporation owned by the Volunteer) has authored outside
                of any employment or work-for-hire relationship with the Club, and which the Volunteer or their
                corporation makes available to the Club under a separate written licence. Such works are
                <strong className="text-white"> commercial corporate work, not donated volunteer output</strong>, and remain the
                sole property of the contributing corporation. The Club&apos;s right to use them is governed exclusively
                by that separate licence — which may be revocable, conditional, or time-limited — and by the
                licence terms recorded in the Club&apos;s
                <Link href="/legal/ip-ownership" className="text-primary-400 hover:text-primary-300 underline mx-1">Software &amp; IP Ownership Acknowledgement</Link>
                and the associated Software License &amp; Service Agreement. For the avoidance of doubt: the C3H
                members&apos; portal and the <code className="text-primary-400">challengerscc.ca</code> website were authored by
                Mohammed Saad personally. The Club uses them under a <strong className="text-white">revocable
                licence at no charge</strong> while he serves as a director, with him retaining the unilateral right
                to withdraw the platform. His personal volunteer service as a director does <strong className="text-white">not</strong>
                transfer his personal intellectual property to the Club.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">4. Voluntary Participation</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>The Volunteer&apos;s participation is entirely voluntary. There is no minimum hours requirement, and no penalty for declining any task or activity.</li>
                <li>The Volunteer may end their volunteer service at any time, for any reason or no reason, without notice and without consequence.</li>
                <li>The Club may end the volunteer relationship at any time, in its sole discretion, with reasonable notice where practical.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">5. Expense Reimbursement</h2>
              <p className="text-sm">The Volunteer may, with prior board approval and supporting receipts, be reimbursed for direct out-of-pocket expenses incurred on behalf of the Club (e.g. mileage, equipment, materials). Reimbursement is not compensation. Without an original receipt and prior approval, no reimbursement will be paid.</p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li><strong className="text-white">Claim window — 60 days.</strong> Reimbursement requests must be submitted in writing (with receipts) within sixty (60) days of the date the expense was incurred. Requests submitted after that window are forfeit and may be paid only at the board&apos;s sole discretion.</li>
                <li><strong className="text-white">Routing.</strong> Reimbursements are paid only to the personal bank account or e-Transfer email of the Volunteer who personally incurred the expense — never to a corporation, partnership, or other entity controlled by the Volunteer. See the Club&apos;s
                  <Link href="/legal/financial-policy" className="text-primary-400 hover:text-primary-300 underline mx-1">Financial Policy</Link>.
                </li>
                <li><strong className="text-white">Final settlement on departure.</strong> When a Volunteer ceases to participate in the Club for any reason, any outstanding reimbursement claim must be submitted within thirty (30) days of departure. After that date, the Volunteer waives any further reimbursement claim against the Club, and the financial relationship is considered fully and finally settled.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">6. Acknowledgement of Risk</h2>
              <p className="text-sm">The Volunteer acknowledges that participation in cricket activities (including practice, matches, training, fielding, batting, and travel to/from venues) carries an <strong className="text-white">inherent risk of injury, including serious injury</strong>. By signing, the Volunteer voluntarily assumes those risks. (Players are also asked to sign the separate <Link href="/legal/liability-waiver" className="text-primary-400 underline hover:text-primary-300">Liability Waiver</Link>.)</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">7. Code of Conduct</h2>
              <p className="text-sm">The Volunteer has read or had the opportunity to read the Club&apos;s <Link href="/legal/code-of-conduct" className="text-primary-400 underline hover:text-primary-300">Code of Conduct</Link> and agrees to follow it. The Code includes commitments to respect, inclusion, fair play, and freedom from discrimination, harassment, and abuse. Violations may result in suspension or termination of the volunteer relationship.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">8. Privacy and Personal Data</h2>
              <p className="text-sm">The Volunteer consents to the collection and use of their name, email, contact information, and (where applicable) match statistics, photographs, and videos by the Club for the purposes set out in the <Link href="/legal/privacy" className="text-primary-400 underline hover:text-primary-300">Privacy Policy</Link>. The Volunteer may withdraw consent at any time by writing to <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline hover:text-primary-300 break-all">contact@challengerscc.ca</a>.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">9. Photo, Video, and Promotional Use</h2>
              <p className="text-sm">The Volunteer grants the Club permission to take and use photographs and video of the Volunteer during Club activities for non-commercial promotional and educational purposes (website, social media, livestream, blog, sponsor reports, grant applications). The Volunteer may opt out of this permission by checking the box at the bottom of this Agreement.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">10. Confidentiality</h2>
              <p className="text-sm">The Volunteer will not disclose to any third party (outside of the Club&apos;s board and members where appropriate) any confidential or non-public information learned through their volunteer service — including member personal information, sponsor contract terms, financial details, strategic planning, or in-progress governance matters.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">11. No Authority to Bind the Club</h2>
              <p className="text-sm">The Volunteer has no authority to enter into contracts, make financial commitments, or bind the Club in any way unless explicitly authorized in writing by the board.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">12. Indemnification &amp; Limitation of Liability</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>The Club <strong className="text-white">indemnifies the Volunteer</strong> against all costs, charges, expenses, damages, and liabilities reasonably incurred by the Volunteer in connection with the <strong className="text-white">lawful, good-faith performance</strong> of their volunteer service to the Club, except where such loss arises from the Volunteer&apos;s wilful misconduct, gross negligence, fraud, or breach of fiduciary duty. This indemnification mirrors and incorporates by reference <Link href="/legal/bylaws" className="text-primary-400 hover:text-primary-300 underline">Article 9 of the Club&apos;s Bylaws</Link>.</li>
                <li>The Volunteer is <strong className="text-white">not personally liable</strong> to the Club for decisions made or actions taken in good faith on behalf of the Club, provided those decisions and actions are within the scope of their volunteer role and consistent with this Agreement, the <Link href="/legal/code-of-conduct" className="text-primary-400 hover:text-primary-300 underline">Code of Conduct</Link>, and the Club&apos;s Bylaws.</li>
                <li>If the Club purchases Directors&apos; &amp; Officers&apos; (D&amp;O) liability insurance, the Volunteer is included in the policy&apos;s coverage to the extent permitted by the policy terms.</li>
                <li>This indemnification <strong className="text-white">survives</strong> the termination of the volunteer relationship for matters arising during the period of volunteer service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">13. Severability</h2>
              <p className="text-sm">If any provision of this Agreement is held by a court of competent jurisdiction to be invalid, illegal, or unenforceable, the remaining provisions remain in full force and effect, and the invalid provision shall be replaced — to the extent permitted by law — with a valid provision that most closely matches the original intent of the parties.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">14. Governing Law</h2>
              <p className="text-sm">This Agreement is governed by the laws of the Province of Ontario and the federal laws of Canada applicable in Ontario.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">15. Entire Agreement</h2>
              <p className="text-sm">This Agreement, together with the Code of Conduct, Privacy Policy, Liability Waiver, the Software &amp; IP Ownership Acknowledgement, and any associated Software License &amp; Service Agreement, sets out the entire understanding between the Volunteer and the Club regarding the volunteer relationship. It supersedes all prior or contemporaneous oral or written discussions on the same subject.</p>
            </section>

            <hr className="border-white/10" />

            {/* Acknowledgement + e-signature flow */}
            <section>
              <h2 className="text-lg font-bold text-white mb-3">Acknowledgement &amp; Signature</h2>
              <p className="text-sm mb-4">By signing below, I confirm that:</p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2 mb-5">
                <li>I have read this Agreement and understand it.</li>
                <li>I am volunteering my time freely. I expect no payment of any kind, now or in the future.</li>
                <li>I waive all past, present, and future claims for compensation against the Club.</li>
                <li>I will follow the Code of Conduct.</li>
                <li>I am at least 18 years old, or my parent/guardian is co-signing below.</li>
              </ul>

              <SignBlock />
            </section>

            <hr className="border-white/10" />

            <p className="text-xs text-gray-500 italic">Document version: v1.1 · 6 May 2026 · Pending legal review. Adds explicit indemnification (Section 12), severability (Section 13), and broader entire-agreement scope (Section 15).</p>
          </div>

          <div className="text-center mt-6 print:hidden text-sm text-gray-500">
            To print or save as PDF: use your browser&apos;s <strong className="text-gray-300">File → Print</strong> menu (or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">Ctrl/Cmd + P</kbd>).
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
