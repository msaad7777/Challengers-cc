import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PrintButton from '../_shared/PrintButton';
import GovernanceStatusCallout from '../_shared/GovernanceStatusCallout';

export const metadata = {
  title: 'Privacy Policy — Challengers Cricket Club',
  description: 'How Challengers Cricket Club collects, uses, stores, and protects personal information from members and the public.',
};

export default function PrivacyPolicyPage() {
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
            <span className="text-3xl">🔒</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3">Privacy Policy</h1>
            <p className="text-sm text-gray-500">Challengers Cricket Club · Effective 30 April 2026</p>
          </div>

          {/* Print / Save as PDF — hidden on printed copy */}
          <div className="flex justify-center mb-6 print:hidden">
            <PrintButton label="🖨️ Print or Save as PDF" />
          </div>

          {/* Governance status callout — shared with Bylaws + Financial Policy */}
          <GovernanceStatusCallout />

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-gray-200 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Who we are</h2>
              <p className="text-sm">Challengers Cricket Club (&ldquo;the Club,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) is a <strong className="text-white">Canada Not-for-Profit Corporation</strong> (Corporation #1746974-8, incorporated under the <em>Canada Not-for-profit Corporations Act</em> on 12 November 2025), based in London, Ontario, Canada. We operate a cricket club for newcomer Canadians and the wider London community on a strictly volunteer basis. This Privacy Policy explains how we handle personal information.</p>
              <p className="text-sm mt-2">We are committed to compliance with the federal <strong className="text-white">Personal Information Protection and Electronic Documents Act (PIPEDA)</strong>.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">What we collect</h2>
              <p className="text-sm">We collect only the personal information needed to operate the Club. Specifically:</p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li><strong className="text-white">Member information:</strong> name, email address, phone number, emergency contact, date of birth (for age-eligibility), photograph (if voluntarily provided), playing role and stats.</li>
                <li><strong className="text-white">Match data:</strong> ball-by-ball scoring, batting/bowling statistics, availability for matches, squad selections (collected through the C3H portal).</li>
                <li><strong className="text-white">Sponsor and donor contact details:</strong> name, organization, email, phone (for sponsor relationship management).</li>
                <li><strong className="text-white">Payments:</strong> processed through Stripe, Zeffy, or Interac e-Transfer. We do <em>not</em> store credit card numbers or banking details. Payment processors handle that.</li>
                <li><strong className="text-white">Photos and videos:</strong> taken during Club activities for blogs, social media, and livestreams (with consent — see the Volunteer Agreement).</li>
                <li><strong className="text-white">Website analytics:</strong> standard server logs (IP, page views, referrer). We do not currently use behavioural advertising trackers.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Why we collect it</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>To organize matches, training, and squad selection</li>
                <li>To communicate with members about the Club</li>
                <li>To process payments for registration, fees, and sponsorships</li>
                <li>To produce season recaps, blog posts, livestreams, and social media content</li>
                <li>To report aggregate impact metrics to sponsors and grant funders</li>
                <li>To comply with regulatory requirements (e.g. CRA, federal Corporations Canada filings, Ontario extra-provincial filings)</li>
                <li>To respond to inquiries from the public, sponsors, and partners</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Where it&apos;s stored</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li><strong className="text-white">Firebase / Google Cloud:</strong> match data, player availability, squad rosters, training reflections, and the C3H portal data. Servers in Canada or US (Google Cloud regions). Access controlled by Google authentication and Firestore security rules.</li>
                <li><strong className="text-white">Google Workspace:</strong> emails, documents, spreadsheets containing member or sponsor information.</li>
                <li><strong className="text-white">Stripe / Zeffy:</strong> payment processing data. Payment processors are independent controllers of cardholder data — see their respective privacy policies.</li>
                <li><strong className="text-white">Vercel:</strong> hosts the public website (including this page). Receives standard server-side request logs.</li>
                <li><strong className="text-white">Local files:</strong> some board members may store backup copies of records on their personal devices, encrypted where reasonable.</li>
              </ul>
              <p className="text-sm mt-2">Some of these vendors store data outside Canada (most notably the United States). We accept this trade-off to use industry-standard nonprofit-grade tools at zero cost. By providing your information, you consent to it being processed in those jurisdictions.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Who operates this platform</h2>
              <p className="text-sm">
                The Club&apos;s public website at <code className="text-primary-400">challengerscc.ca</code>
                and the C3H members&apos; portal are <strong className="text-white">operated on behalf of the
                Club</strong> by <strong className="text-white">Mohammed Saad</strong>, who authored the
                software personally. The source-code and web-hosting accounts (GitHub for source control,
                Vercel for production hosting) are registered to him personally and paid for by him.
                {' '}<strong className="text-white">The Firebase / Google Cloud project that stores all member
                data and personal information</strong> — project ID
                {' '}<code className="text-primary-400">challengers-c3h</code> — is owned and administered by
                the Club, through the <strong className="text-white">contact@challengerscc.ca</strong>
                {' '}Google Workspace account (Owner role in the Google Cloud Console). Full details of this
                arrangement are set out in the
                {' '}<Link href="/legal/ip-ownership" className="text-primary-400 underline hover:text-primary-300">Software &amp; IP Ownership Acknowledgement</Link>.
              </p>
              <p className="text-sm mt-2">For PIPEDA purposes:</p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li><strong className="text-white">Challengers Cricket Club is the data controller</strong> — we decide what personal information is collected, why, and how long it is retained. The Firebase / Firestore project that stores it is registered to and administered by the Club.</li>
                <li><strong className="text-white">Mohammed Saad is the data processor</strong> — he operates the platform on the Club&apos;s instructions and may not use member data for any other purpose. He does not own the data, the Firebase project, or any administrative claim on personal information stored there. His access is operational only and may be revoked at any time by board resolution.</li>
                <li>Mohammed Saad is contractually prohibited from using Club member data to train artificial intelligence models, demonstrate to other clubs, or build commercial products. Member data may not be re-used in any future commercial offering — by him or by any corporation he owns — without each member&apos;s explicit consent and a separate Data Processing Agreement.</li>
                <li>Sub-processors used to deliver the platform (each subject to their own privacy practices): <strong className="text-white">Vercel</strong> (web hosting, source code only — no member data), <strong className="text-white">Google Cloud / Firebase</strong> (Club-owned project; database, authentication, file storage), <strong className="text-white">Stripe</strong> (payments), <strong className="text-white">Zeffy</strong> (donations, when active), <strong className="text-white">YouTube</strong> (video hosting).</li>
              </ul>
              <p className="text-sm mt-2">A formal Software Licence Agreement (which includes data processing terms) between the Club and Mohammed Saad is being executed and will be e-signed by the directors via the C3H Pavilion governance module. Until then, this Privacy Policy and the IP Ownership Acknowledgement constitute the public record of the arrangement.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Conflict of interest disclosure</h2>
              <p className="text-sm">
                Mohammed Saad is both a co-founding <strong className="text-white">director</strong> of
                Challengers Cricket Club and the <strong className="text-white">personal author and copyright
                owner</strong> of the platform that operates the Club&apos;s website and members&apos; portal,
                and acts as the <strong className="text-white">data processor</strong> on the Club&apos;s
                instructions. This is a related-party arrangement and a conflict of interest under the
                Club&apos;s
                {' '}<Link href="/legal/conflict-of-interest" className="text-primary-400 underline hover:text-primary-300">Conflict of Interest Policy</Link>.
              </p>
              <p className="text-sm mt-2">
                The conflict has been declared in writing to the Board. Mohammed Saad has abstained, and will
                continue to abstain, from any board vote concerning: (a) the Club&apos;s licence to use the
                platform; (b) the Software Licence Agreement; (c) variations or amendments to the data
                processing relationship; (d) any board resolution affecting the
                {' '}<Link href="/legal/ip-ownership" className="text-primary-400 underline hover:text-primary-300">IP Ownership Acknowledgement</Link>;
                or (e) the IP and data clauses of the
                {' '}<Link href="/legal/bylaws" className="text-primary-400 underline hover:text-primary-300">By-Laws</Link>{' '}
                (Articles XIV and XV).
              </p>
              <p className="text-sm mt-2">
                The Corporation&apos;s ownership of all member data is constitutionally entrenched in
                {' '}<Link href="/legal/bylaws" className="text-primary-400 underline hover:text-primary-300">By-Laws Article XV</Link>{' '}
                (&ldquo;Member Data and Club-Owned Cloud Infrastructure&rdquo;). That Article makes explicit
                that the Firebase / Google Cloud project storing all personal information is registered to
                and administered by the Club through the
                {' '}<strong className="text-white">contact@challengerscc.ca</strong> Google Workspace
                account, and that no Director, Officer, member, or developer holds any administrative claim
                on personal information stored there.
              </p>
              <p className="text-sm mt-2">
                <strong className="text-white">Interim Privacy Officer.</strong> Mohammed Saad is the
                Privacy Officer named below as an interim arrangement until the Secretary role is formally
                accepted via signed Officer Appointment Letter. Once a Secretary is in place, Privacy
                Officer responsibilities will transfer accordingly. This arrangement, including any conflict
                of interest implications, is disclosed for transparency.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Who we share it with</h2>
              <p className="text-sm">We do <strong className="text-white">not sell or rent</strong> personal information. We share it only as follows:</p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li><strong className="text-white">With the Club&apos;s board, captains, and authorized volunteers</strong> — for operational purposes only.</li>
                <li><strong className="text-white">With payment processors</strong> (Stripe, Zeffy, Interac) — when you pay for something.</li>
                <li><strong className="text-white">With league administrators</strong> (e.g. CricClubs, Cricket Ontario) — when required to register a player or team.</li>
                <li><strong className="text-white">With sponsors and grant funders</strong> — only in <em>aggregate</em> form (e.g. &ldquo;the Club has 70 active members&rdquo;), not individual data, except where you have explicitly consented.</li>
                <li><strong className="text-white">With law enforcement or regulators</strong> — when legally required (e.g. court order, CRA audit).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">How long we keep it</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li><strong className="text-white">Active member data:</strong> for the duration of membership plus 3 years (for historical record and dispute resolution).</li>
                <li><strong className="text-white">Match data and statistics:</strong> retained indefinitely as part of the Club&apos;s historical record.</li>
                <li><strong className="text-white">Financial records:</strong> 7 years (per Canadian tax record-keeping rules).</li>
                <li><strong className="text-white">Photos and videos:</strong> retained indefinitely for the Club&apos;s archive, unless removal is requested.</li>
                <li><strong className="text-white">Server logs:</strong> 90 days.</li>
              </ul>
              <p className="text-sm mt-2">After retention periods elapse, we delete or anonymize personal information.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Your rights</h2>
              <p className="text-sm">Under PIPEDA you have the right to:</p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li><strong className="text-white">Access</strong> the personal information we hold about you.</li>
                <li><strong className="text-white">Correct</strong> inaccurate or incomplete information.</li>
                <li><strong className="text-white">Withdraw consent</strong> for the use of your information (subject to legal or contractual restrictions).</li>
                <li><strong className="text-white">Request deletion</strong> of your personal information (where retention is not legally required).</li>
                <li><strong className="text-white">Be removed from photos/videos</strong> we have published, where reasonably possible.</li>
                <li><strong className="text-white">File a complaint</strong> with the Office of the Privacy Commissioner of Canada if you believe we&apos;ve mishandled your information.</li>
              </ul>
              <p className="text-sm mt-2">To exercise any of these rights, email <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline hover:text-primary-300 break-all">contact@challengerscc.ca</a>. We will respond within 30 days.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Security</h2>
              <p className="text-sm">We use industry-standard practices to protect personal information: Google authentication for Club portals, Firestore access rules, HTTPS everywhere, password-protected admin accounts, and 2-factor authentication where supported. No system is perfectly secure — we cannot guarantee absolute protection, but we will notify affected individuals if we become aware of a material data breach.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Cookies and analytics</h2>
              <p className="text-sm">The website uses minimal cookies (mainly for sign-in session management on the C3H portal). We do not use third-party advertising trackers. Server-side logs collect aggregate visit data (page views, referrer, country) for security and operational purposes.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Children&apos;s privacy</h2>
              <p className="text-sm">The Club is currently for adult players (18+). If we ever offer programs for minors, additional consent procedures will apply, and parental consent will be required for any data collection from those under 13.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Changes to this Policy</h2>
              <p className="text-sm">We may update this Privacy Policy from time to time. The current version is always posted at <Link href="/legal/privacy" className="text-primary-400 underline hover:text-primary-300">challengerscc.ca/legal/privacy</Link>. Material changes will be communicated to members by email.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Contact</h2>
              <p className="text-sm">Privacy questions, requests, or complaints:</p>
              <p className="text-sm mt-2">
                Mohammed Saad — Privacy Officer<br />
                Challengers Cricket Club<br />
                <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline hover:text-primary-300 break-all">contact@challengerscc.ca</a>
              </p>
            </section>

            <hr className="border-white/10" />

            <p className="text-xs text-gray-500 italic">
              Document version: v1.1 · Effective 8 May 2026 · Pending pro-bono lawyer review.
              <br />
              v1.1 (2026-05-08) — adds explicit Conflict of Interest disclosure section (Mohammed Saad as
              Director + author + data processor); cross-references By-Laws Articles XIV (Software/IP) and XV
              (Member Data and Club-Owned Cloud Infrastructure); discloses interim Privacy Officer arrangement
              pending formal Secretary onboarding; aligns with the federally-incorporated CNCA framework.
              <br />
              v1.0 (2026-04-30) — initial Privacy Policy adopted by the Board.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
