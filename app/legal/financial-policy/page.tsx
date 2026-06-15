import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PrintButton from '../_shared/PrintButton';
import GovernanceStatusCallout from '../_shared/GovernanceStatusCallout';

export const metadata = {
  title: 'Financial Policy — Challengers Cricket Club',
  description: 'How money flows through Challengers Cricket Club: signing authority, deposits, reimbursements, and annual reporting.',
};

export default function FinancialPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-32 md:pt-40">
        <div className="max-w-3xl mx-auto">
          <Link href="/legal" className="text-gray-500 text-sm hover:text-primary-400 inline-flex items-center gap-1 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            All governance documents
          </Link>

          <div className="text-center mb-6">
            <span className="text-3xl">💰</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3">Financial Policy</h1>
            <p className="text-sm text-gray-500">Challengers Cricket Club · Effective 30 April 2026</p>
          </div>

          {/* Print / Save as PDF — hidden on printed copy */}
          <div className="flex justify-center mb-6 print:hidden">
            <PrintButton label="🖨️ Print or Save as PDF" />
          </div>

          {/* Governance status callout — shared with Bylaws + Privacy */}
          <GovernanceStatusCallout />

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-gray-200 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Principles</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>The Club is a <strong className="text-white">Canada Not-for-Profit Corporation</strong> (Corporation #1746974-8, incorporated under the <em>Canada Not-for-profit Corporations Act</em> on 12 November 2025). <strong className="text-white">No surplus is distributed to directors, members, or volunteers.</strong> Any surplus is reinvested in club operations.</li>
                <li>The Club has <strong className="text-white">no paid staff or contractors</strong>. All operational work is donated by volunteers.</li>
                <li>All financial transactions are recorded, traceable, and reviewable.</li>
                <li>Two unrelated signatures (different households, no family relationship) are required for any payment over $500.</li>
                <li>Cash transactions are avoided wherever possible. Bank transfers, e-Transfers, and card payments are preferred.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Bank account</h2>
              <p className="text-sm">The Club operates a single primary bank account at <strong className="text-white">CIBC</strong> (Canadian Imperial Bank of Commerce) under the Club&apos;s legal name. The account is dedicated solely to Club operations. Personal funds are never commingled with Club funds.</p>
              <p className="text-sm mt-2"><strong className="text-white">Signing authority:</strong> Mohammed Saad is currently the Club&apos;s signing authority. The Club&apos;s banking follows a dual-signatory policy; a second signing authority will be added and reflected here once in place.</p>
              <p className="text-sm mt-2">Bank statements are reconciled monthly by a board member who is <em>not</em> a primary signatory (the Treasurer or designate), to provide a separation-of-duties check.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Income</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>All Club income — registration fees, season fees, league fees, indoor/outdoor practice fees, sponsorship payments, donations, grants — is deposited into the Club&apos;s bank account within <strong className="text-white">7 days</strong> of receipt.</li>
                <li>Payment processors used: <strong className="text-white">Stripe, Zeffy, Interac e-Transfer</strong>. Processor balances are settled to the bank account on each platform&apos;s standard cycle.</li>
                <li>Each income item is logged in the Club&apos;s accounting system (Wave Accounting) with: date, amount, source, and category (registration / sponsorship / donation / grant / other).</li>
                <li>Receipts (PDF or printable) are issued for any income over $20 on request.</li>
                <li>Once CRA charity status is registered, official tax receipts will be issued for eligible donations per CRA rules.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Receipts and tax status</h2>
              <p className="text-sm">
                Challengers Cricket Club is a registered Canadian not-for-profit corporation, <strong className="text-white">not a registered charity</strong>. Under the Income Tax Act (Canada), only a registered charity holding a CRA charity registration number may issue official donation receipts that qualify for a tax credit. Accordingly, at this time:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2 mt-2">
                <li>The Club <strong className="text-white">does not and cannot issue charitable / tax-credit (&ldquo;donation&rdquo;) receipts.</strong></li>
                <li>Registration, membership, practice and league fees <strong className="text-white">are not tax-deductible</strong>, as they are paid in exchange for participation in Club activities.</li>
                <li>Members who pay via Stripe, Zeffy or Interac e-Transfer receive a <strong className="text-white">payment confirmation</strong> from that platform. These confirmations, and any proof-of-payment the Club provides, are <strong className="text-white">records of payment for your own files only — they are not tax receipts</strong>, and do not entitle the payer to any tax credit or deduction.</li>
                <li>After the end of a season, the Club may, <strong className="text-white">on request</strong>, provide a simple <strong className="text-white">proof-of-payment statement (PDF) showing the amount a member paid</strong>. This is a payment record only — again, <strong className="text-white">not a tax receipt</strong>.</li>
                <li><strong className="text-white">If and when the Club obtains CRA charity registration</strong>, it will notify members and issue official tax receipts for eligible donations in accordance with CRA rules.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Member fees — variable, set by Board, fund operations</h2>
              <p className="text-sm">
                Member fees — including registration fees, membership fees, indoor practice fees, outdoor practice
                fees, and league fees — are <strong className="text-white">not a fixed annual rate</strong>.
                They are reviewed and set by the Board for each season based on:
              </p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li>The number of members enrolled in that season (more members → lower per-member share);</li>
                <li>The actual operational costs of the season — league registration fees, venue rental for practices and matches, insurance, equipment (balls, nets, training gear), jersey production, scoring/league-software subscriptions, communications, and other costs of running a community cricket club;</li>
                <li>Any sponsorship and grant revenue offsetting these costs;</li>
                <li>The Board&apos;s judgement on what is reasonable and accessible to the Club&apos;s members.</li>
              </ul>
              <p className="text-sm mt-2">
                <strong className="text-white">Final fee amounts are confirmed before payment is collected</strong> and
                communicated to members via the Club&apos;s WhatsApp group and email. Payments collected before final
                confirmation may be refunded, applied to the next season&apos;s fees, or adjusted as appropriate.
              </p>
              <p className="text-sm mt-2">
                <strong className="text-white">100% of member fees fund Club operations.</strong> No part of any
                member fee is paid to any director, officer, or volunteer as compensation. See <em>No payment for
                services</em> and <em>No retroactive compensation</em> below.
              </p>
              <p className="text-sm mt-2">
                Per <Link href="/legal/bylaws" className="text-primary-400 underline hover:text-primary-300">By-Laws Article 3.3</Link>, members are
                given at least <strong className="text-white">thirty (30) days&apos; notice</strong> of any change
                to membership dues before the change takes effect.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Expenses</h2>
              <p className="text-sm">All Club expenses must:</p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li>Match an approved budget category (insurance, equipment, league fees, field rent, administration, etc.)</li>
                <li>Be supported by an original receipt or invoice</li>
                <li>Be approved <strong className="text-white">in advance</strong> for amounts over $200, by either the President or the Treasurer</li>
                <li>Require <strong className="text-white">two co-signatures</strong> for any single expense over $500, OR for any expense to a director-affiliated entity (see Conflict of Interest Policy)</li>
                <li>Be paid from the Club&apos;s bank account or processor — never in cash from a personal wallet</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Volunteer expense reimbursement</h2>
              <p className="text-sm">Volunteers may be reimbursed for direct out-of-pocket expenses incurred on behalf of the Club. To be reimbursed:</p>
              <ol className="space-y-2 mt-2 text-sm list-decimal list-inside ml-2">
                <li><strong className="text-white">Get prior approval</strong> from a board member, in writing (email or WhatsApp), <em>before</em> spending the money. This is critical — un-approved expenses are not guaranteed reimbursement.</li>
                <li><strong className="text-white">Keep the original receipt</strong> with date, item, and amount visible.</li>
                <li><strong className="text-white">Submit the receipt within 60 days</strong> of the date the expense was incurred, either by email to <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline hover:text-primary-300 break-all">contact@challengerscc.ca</a> or in person to the Treasurer. Submissions after the 60-day window are <strong className="text-white">forfeit</strong> and may be paid only at the board&apos;s sole discretion.</li>
                <li>Reimbursement is paid by e-Transfer or cheque within 14 days of approval.</li>
                <li><strong className="text-white">Final claim window on departure.</strong> Any outstanding reimbursement claim must be submitted within thirty (30) days of the volunteer ceasing to participate in the Club. After that window, any further reimbursement claim against the Club is waived.</li>
              </ol>
              <p className="text-sm mt-2"><strong className="text-white">Reimbursement is not compensation.</strong> It does not create an employment relationship. It is reimbursement of money the volunteer has already spent on the Club&apos;s behalf.</p>

              <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/5 p-3">
                <p className="text-xs uppercase tracking-wider text-red-300 font-bold mb-1.5">Eligibility — signed Volunteer Agreement required</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Reimbursement is available only to individuals who have signed the Club&apos;s
                  {' '}<Link href="/legal/volunteer-agreement" className="text-primary-400 underline hover:text-primary-300">Volunteer Agreement</Link>{' '}
                  by the deadline of <strong className="text-white">30 May 2026</strong>. Members who have not
                  signed by that date are not entitled to expense reimbursement, squad selection, Club gear,
                  or any other Club-issued benefit. Expenses incurred before signing — even by a willing
                  volunteer — are not automatically reimbursable; pre-deadline expenses may be reimbursed
                  only at the board&apos;s discretion and once all required agreements are signed.
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
                <p className="text-xs uppercase tracking-wider text-amber-300 font-bold mb-1.5">Reimbursement payment routing</p>
                <p className="text-sm text-gray-300 leading-relaxed mb-2">
                  Reimbursements are paid only to the personal bank account or e-Transfer email of the
                  individual who personally incurred the expense. The Club does not route reimbursements through
                  corporations, partnerships, or other entities controlled by the recipient — regardless of
                  preference, convenience, or internal accounting reasons on the recipient&apos;s side. This
                  applies equally to all directors, officers, captains, players, and volunteers.
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  If an expense was paid from a corporate or third-party account, that entity must invoice the
                  Club as a vendor under arms-length terms (see <em>No payment for services</em> below) — it is
                  not handled as a personal reimbursement. Any exception to this rule requires advance board
                  approval recorded in the minutes, with the conflicted recipient recused from the vote, and is
                  treated as a related-party vendor transaction under the
                  {' '}<Link href="/legal/conflict-of-interest" className="text-primary-400 underline hover:text-primary-300">Conflict of Interest Policy</Link>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">No payment for services</h2>
              <p className="text-sm">Consistent with the <Link href="/legal/volunteer-agreement" className="text-primary-400 underline hover:text-primary-300">Volunteer Agreement</Link>:</p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li>The Club does not pay any individual a wage, salary, fee, honorarium, or stipend for services rendered.</li>
                <li>The Club does not engage independent contractors who invoice for hours worked. (Exception: arms-length suppliers like printers, venue operators, or insurance brokers, paid for goods or third-party services delivered, are not contractors of the Club&apos;s personal labour.)</li>
                <li>If the Club ever needs to pay an individual for skilled work it cannot get donated (e.g. a one-time legal review), this requires <strong className="text-white">advance board approval, a written quote, and a written engagement letter</strong> documenting the arms-length nature of the engagement.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">No retroactive compensation</h2>
              <p className="text-sm">
                The Club <strong className="text-white">does not, and shall not</strong>, pay retroactive
                compensation, fees, honoraria, salary, or remuneration to any individual for past volunteer
                service rendered to the Club, regardless of the title held (Director, Officer, Treasurer,
                Secretary, Captain, Vice-Captain, Coach, Scorer, committee member, or any other role), the
                hours invested, the work delivered, the fundraising secured, or the outcomes achieved.
              </p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li>Past service is treated as fully volunteer and finally settled by the Volunteer&apos;s signature on the
                  {' '}<Link href="/legal/volunteer-agreement" className="text-primary-400 underline hover:text-primary-300">Volunteer Agreement</Link>{' '}
                  (Section 2 — No Compensation). Holding any title within the Club does not create an entitlement to retrospective payment.</li>
                <li>A future board may not, by resolution or member vote, retroactively pay a former volunteer
                  for past service. Any future engagement of an individual for paid work must be a
                  <strong className="text-white"> fresh, forward-going, arms-length engagement</strong> with
                  prior advance board approval, written engagement letter, conflict-of-interest disclosure,
                  and arms-length pricing — never a retrospective payment for past unpaid time.</li>
                <li>Documented out-of-pocket expenses already approved and recorded on the Schedule of Founder
                  Advances remain repayable to the volunteer&apos;s personal account when funds permit. This
                  is reimbursement (return of money already spent on the Club&apos;s behalf), not
                  compensation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Annual reporting</h2>
              <p className="text-sm">At the end of each fiscal year (calendar year for now), the Treasurer prepares:</p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li>An <strong className="text-white">Annual Financial Statement</strong> showing total income, total expenses by category, and net surplus/deficit</li>
                <li>A list of significant income sources (sponsors, grants over $1,000)</li>
                <li>A confirmation that no funds were paid to any director, officer, or member as compensation</li>
                <li>A balance-sheet snapshot of cash on hand</li>
              </ul>
              <p className="text-sm mt-2">This statement is presented to members at the Annual General Meeting (AGM) and posted to the website in summary form within 60 days of fiscal year-end.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">External review</h2>
              <p className="text-sm">If the Club&apos;s annual revenue exceeds the threshold required by the <em>Canada Not-for-profit Corporations Act</em> (CNCA) for review-engagement or audit, the Club will engage an external accountant to review or audit the annual financial statement. Below the threshold, an internal review by a board member who is not a signing authority is sufficient.</p>
              <p className="text-sm mt-2">Once CRA charity status is registered, the annual T3010 charity return will also be filed publicly.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Record retention</h2>
              <p className="text-sm">Financial records (bank statements, receipts, invoices, payment processor reports, accounting books) are retained for at least <strong className="text-white">7 years</strong>, in accordance with Canadian tax record-keeping rules.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Reporting concerns</h2>
              <p className="text-sm">If any member or volunteer suspects financial mismanagement, fraud, or a violation of this Policy, they should report it confidentially to a board member who is not implicated, or by email to <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline hover:text-primary-300 break-all">contact@challengerscc.ca</a>. Reports will be investigated promptly. No retaliation will be taken against good-faith whistleblowers.</p>
            </section>

            <hr className="border-white/10" />

            <p className="text-xs text-gray-500 italic">
              Document version: v1.2 · Effective 15 June 2026 · Pending pro-bono lawyer review.
              <br />
              v1.2 (2026-06-15) — adds &ldquo;Receipts and tax status&rdquo; section clarifying the Club is a
              non-profit (not a registered charity), cannot issue tax-credit/donation receipts, that fees are
              not tax-deductible, and that any proof-of-payment provided is a payment record only, not a tax receipt;
              corrects the bank signing-authority line to reflect a single current signing authority (Mohammed Saad)
              under a dual-signatory policy, with a second authority to be added.
              <br />
              v1.1 (2026-05-08) — adds &ldquo;Member fees — variable, set by Board, fund operations&rdquo;
              section; tightens reimbursement to require 60-day claim window + personal-account routing only +
              eligibility tied to signed Volunteer Agreement; adds &ldquo;No retroactive compensation&rdquo;
              section closing the historical-claim loophole.
              <br />
              v1.0 (2026-04-30) — initial Financial Policy adopted by the Board.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
