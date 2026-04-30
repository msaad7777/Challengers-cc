import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

          <div className="text-center mb-10">
            <span className="text-3xl">💰</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3">Financial Policy</h1>
            <p className="text-sm text-gray-500">Challengers Cricket Club · Effective 30 April 2026</p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-gray-200 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Principles</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>The Club is an Ontario Not-for-Profit Corporation. <strong className="text-white">No surplus is distributed to directors, members, or volunteers</strong>. Any surplus is reinvested in club operations.</li>
                <li>The Club has <strong className="text-white">no paid staff or contractors</strong>. All operational work is donated by volunteers.</li>
                <li>All financial transactions are recorded, traceable, and reviewable.</li>
                <li>Two unrelated signatures (different households, no family relationship) are required for any payment over $500.</li>
                <li>Cash transactions are avoided wherever possible. Bank transfers, e-Transfers, and card payments are preferred.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Bank account</h2>
              <p className="text-sm">The Club operates a single primary bank account at <strong className="text-white">CIBC</strong> (Canadian Imperial Bank of Commerce) under the Club&apos;s legal name. The account is dedicated solely to Club operations. Personal funds are never commingled with Club funds.</p>
              <p className="text-sm mt-2"><strong className="text-white">Co-signatories:</strong> Mohammed Saad and Md Monirul Islam (Tarek). Both signatures are required for cheques, withdrawals, and significant disbursements.</p>
              <p className="text-sm mt-2">Bank statements are reconciled monthly by a board member who is <em>not</em> a primary signatory (the Treasurer or designate), to provide a separation-of-duties check.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Income</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>All Club income — registration fees, season fees, sponsorship payments, donations, grants — is deposited into the Club&apos;s bank account within <strong className="text-white">7 days</strong> of receipt.</li>
                <li>Payment processors used: <strong className="text-white">Stripe, Zeffy, Interac e-Transfer</strong>. Processor balances are settled to the bank account on each platform&apos;s standard cycle.</li>
                <li>Each income item is logged in the Club&apos;s accounting system (Wave Accounting) with: date, amount, source, and category (registration / sponsorship / donation / grant / other).</li>
                <li>Receipts (PDF or printable) are issued for any income over $20 on request.</li>
                <li>Once CRA charity status is registered (target 2027), official tax receipts will be issued for eligible donations per CRA rules.</li>
              </ul>
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
                <li><strong className="text-white">Submit the receipt</strong> within 30 days, either by email to <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline hover:text-primary-300 break-all">contact@challengerscc.ca</a> or in person to the Treasurer.</li>
                <li>Reimbursement is paid by e-Transfer or cheque within 14 days of approval.</li>
              </ol>
              <p className="text-sm mt-2"><strong className="text-white">Reimbursement is not compensation.</strong> It does not create an employment relationship. It is reimbursement of money the volunteer has already spent on the Club&apos;s behalf.</p>
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
              <p className="text-sm">If the Club&apos;s annual revenue exceeds the threshold required by the Ontario Not-for-Profit Corporations Act (ONCA), the Club will engage an external accountant to review or audit the annual financial statement. Below the threshold, an internal review by a board member who is not a signing authority is sufficient.</p>
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

            <p className="text-xs text-gray-500 italic">Document version: v1.0 · 30 April 2026 · Pending legal review.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
