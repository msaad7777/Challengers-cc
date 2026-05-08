import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PrintButton from '../_shared/PrintButton';
import GovernanceStatusCallout from '../_shared/GovernanceStatusCallout';

export const metadata = {
  title: 'Terms of Service — Challengers Cricket Club',
  description: 'Terms of service governing use of challengerscc.ca and the C3H members\' portal. Discloses ownership of source code, the Club\'s ownership of member data, the related-party arrangement with Mohammed Saad as data processor, and Conflict of Interest disclosures.',
};

export default function TermsOfServicePage() {
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
            <span className="text-3xl">📋</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3">Terms of Service</h1>
            <p className="text-sm text-gray-500">
              Challengers Cricket Club · Canada Not-for-Profit Corporation #1746974-8
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Governing use of <code className="text-primary-400">challengerscc.ca</code> and the C3H members&apos; portal · Effective 8 May 2026
            </p>
          </div>

          {/* Print / Save as PDF */}
          <div className="flex justify-center mb-6 print:hidden">
            <PrintButton label="🖨️ Print or Save as PDF" />
          </div>

          {/* Governance status callout — shared with Bylaws + Privacy + Financial Policy */}
          <GovernanceStatusCallout />

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-gray-200 leading-relaxed text-sm">

            <section>
              <h2 className="text-lg font-bold text-white mb-2">1. About these Terms</h2>
              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the public website at
                {' '}<code className="text-primary-400">challengerscc.ca</code> (the &ldquo;Website&rdquo;) and
                the Club&apos;s C3H members&apos; portal at <code className="text-primary-400">challengerscc.ca/c3h</code>
                {' '}(the &ldquo;Portal&rdquo;), together the &ldquo;Platform&rdquo;. The Platform is operated
                by Challengers Cricket Club (the &ldquo;Club,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), a
                Canada Not-for-Profit Corporation (#1746974-8) incorporated under the
                {' '}<em>Canada Not-for-profit Corporations Act</em> (CNCA) on 12 November 2025, with CRA
                Business Number 758650832.
              </p>
              <p className="mt-2">
                By accessing the Website or signing into the Portal, you agree to these Terms. If you do not
                agree, please do not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">2. Volunteer-based organization</h2>
              <p>
                The Club is operated entirely on a <strong className="text-white">volunteer basis</strong>.
                The Club does not employ any individual, has not registered as an employer with the Canada
                Revenue Agency, has never operated a payroll, and has never issued a T4. No wage, salary,
                fee, honorarium, or compensation is paid to any director, officer, member, player, or
                volunteer for service to the Club. The Platform is operated under this volunteer framework.
                See the
                {' '}<Link href="/legal/volunteer-agreement" className="text-primary-400 underline hover:text-primary-300">Volunteer Agreement</Link>,
                {' '}<Link href="/legal/financial-policy" className="text-primary-400 underline hover:text-primary-300">Financial Policy</Link>, and
                {' '}<Link href="/legal/bylaws" className="text-primary-400 underline hover:text-primary-300">By-Laws Article XVI</Link>{' '}
                (Volunteer Status — Express).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">3. Ownership of source code, design, and infrastructure</h2>
              <p>
                The source code, designs, build configurations, and operational infrastructure that power
                the Website and the Portal are the personal intellectual property of
                {' '}<strong className="text-white">Mohammed Saad</strong>, who authored them in his
                individual capacity and is the first owner of copyright under section 13(1) of the federal
                {' '}<em>Copyright Act</em>. The source-code accounts (GitHub, Vercel) are registered to him
                personally and paid for by him.
              </p>
              <p className="mt-2">
                The Club uses the Platform under a <strong className="text-white">limited, non-exclusive,
                non-transferable, revocable licence</strong> from Mohammed Saad, granted at no charge for
                so long as he serves as a director of the Club. Full details are set out in the
                {' '}<Link href="/legal/ip-ownership" className="text-primary-400 underline hover:text-primary-300">Software &amp; IP Ownership Acknowledgement</Link>{' '}
                and By-Laws Article XIV.
              </p>
              <p className="mt-2">
                <strong className="text-white">No rights are granted to users.</strong> Your use of the
                Platform does not transfer to you any ownership, licence, or right to copy, reverse-engineer,
                redistribute, or build derivative works from the source code, design, or infrastructure of
                the Platform. The Club&apos;s name, logo, branding, and trademarks are the property of the
                Club and may not be used without written permission from the Board.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">4. Ownership of member data</h2>
              <p>
                <strong className="text-white">All member data and personal information</strong> stored on the
                Platform — including registrations, availability, scoring records, training reflections,
                e-signed legal documents, governance signatures, and any other personal information collected
                through the Platform — is owned by the
                {' '}<strong className="text-white">Club</strong>, not by Mohammed Saad and not by any other
                individual.
              </p>
              <p className="mt-2">
                The Firebase / Google Cloud project where this data resides (project ID
                {' '}<code className="text-primary-400">challengers-c3h</code>) is registered to and
                administered by the Club through the
                {' '}<strong className="text-white">contact@challengerscc.ca</strong> Google Workspace
                account, which holds the Owner role in the Google Cloud Console. The Club is the
                {' '}<strong className="text-white">data controller</strong> under PIPEDA; Mohammed Saad acts
                as <strong className="text-white">data processor</strong> only, on the Club&apos;s
                instructions, and may not use member data for any other purpose. See the
                {' '}<Link href="/legal/privacy" className="text-primary-400 underline hover:text-primary-300">Privacy Policy</Link>
                {' '}and By-Laws Article XV (Member Data and Club-Owned Cloud Infrastructure).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">5. Conflict of interest disclosure</h2>
              <p>
                Mohammed Saad is both a co-founding <strong className="text-white">director</strong> of the
                Club and the <strong className="text-white">personal author and copyright owner</strong> of
                the Platform; he also acts as the <strong className="text-white">data processor</strong> on
                the Club&apos;s instructions. This is a related-party arrangement and a conflict of interest
                under the Club&apos;s
                {' '}<Link href="/legal/conflict-of-interest" className="text-primary-400 underline hover:text-primary-300">Conflict of Interest Policy</Link>.
                The conflict has been declared in writing to the Board. Mohammed Saad abstains from any
                board vote concerning the Club&apos;s licence, the Software Licence Agreement, the IP
                Ownership Acknowledgement, the Privacy Policy data-processing terms, and By-Laws Articles
                XIV and XV. This disclosure is part of the Club&apos;s transparency commitment and is also
                published on the Privacy Policy and IP Ownership pages.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">6. Acceptable use of the Platform</h2>
              <p>You agree to use the Platform only for lawful purposes and in accordance with these Terms. You will not:</p>
              <ul className="list-disc list-inside ml-2 space-y-1 mt-2">
                <li>Attempt to access accounts or data belonging to others without authorization;</li>
                <li>Reverse-engineer, decompile, copy, or redistribute the Platform&apos;s source code;</li>
                <li>Upload material that is unlawful, defamatory, harassing, infringing, or harmful;</li>
                <li>Impersonate any person or misrepresent your affiliation with the Club;</li>
                <li>Send spam, phishing, malware, or automated bulk requests to the Platform;</li>
                <li>Probe, scan, or attempt to compromise the security of the Platform;</li>
                <li>Use the Platform for commercial purposes outside the Club&apos;s mission, without prior written authorization from the Board.</li>
              </ul>
              <p className="mt-2">
                Violations of acceptable use may result in immediate suspension or termination of access, in
                addition to remedies under the
                {' '}<Link href="/legal/code-of-conduct" className="text-primary-400 underline hover:text-primary-300">Code of Conduct</Link>{' '}
                and applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">7. Member accounts (Portal)</h2>
              <p>
                Access to the C3H members&apos; portal at
                {' '}<code className="text-primary-400">challengerscc.ca/c3h</code> requires sign-in via
                Google authentication and is limited to:
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1 mt-2">
                <li>Registered players whose Google email address is on the Club&apos;s allowlist;</li>
                <li>Directors and Officers of the Corporation;</li>
                <li>Authorized board members and captains.</li>
              </ul>
              <p className="mt-2">
                You are responsible for maintaining the confidentiality of your Google account and for any
                activity that occurs under your sign-in. Notify
                {' '}<a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline hover:text-primary-300">contact@challengerscc.ca</a>{' '}
                immediately of any unauthorized access. The Club may revoke access at any time, in its sole
                discretion, including for breach of these Terms or the Code of Conduct.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">8. User content</h2>
              <p>
                You retain ownership of content you submit to the Platform (e.g. photos, videos, written
                reflections, comments). By submitting content, you grant the Club a non-exclusive,
                royalty-free, worldwide licence to use, store, reproduce, and display the content in
                connection with the Club&apos;s mission and Platform operations, subject to the
                {' '}<Link href="/legal/privacy" className="text-primary-400 underline hover:text-primary-300">Privacy Policy</Link>
                {' '}and the
                {' '}<Link href="/legal/photography-consent" className="text-primary-400 underline hover:text-primary-300">Photography &amp; Media Consent</Link>.
              </p>
              <p className="mt-2">
                You represent and warrant that you have the rights to any content you submit and that it
                does not infringe the rights of others. Content that violates these Terms or the Code of
                Conduct may be removed without notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">9. Third-party services and links</h2>
              <p>The Platform integrates with third-party services for specific functions:</p>
              <ul className="list-disc list-inside ml-2 space-y-1 mt-2">
                <li><strong className="text-white">Stripe</strong> and <strong className="text-white">Zeffy</strong> for payments;</li>
                <li><strong className="text-white">Google</strong> for authentication, Workspace, Cloud, and Maps;</li>
                <li><strong className="text-white">Vercel</strong> for web hosting;</li>
                <li><strong className="text-white">YouTube</strong> for video hosting;</li>
                <li><strong className="text-white">CricClubs</strong> and league administrators for player registration where required.</li>
              </ul>
              <p className="mt-2">
                These third-party services are governed by their own terms and privacy policies. The Club is
                not responsible for the practices of third-party services. Sponsor and partner links are
                provided for information; appearance of a sponsor or partner does not constitute an
                endorsement by the Club beyond the specific sponsorship arrangement disclosed in writing.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">10. No warranty &mdash; Platform provided &ldquo;as-is&rdquo;</h2>
              <p>
                The Platform is provided &ldquo;<strong className="text-white">as-is</strong>&rdquo; and
                &ldquo;<strong className="text-white">as available</strong>&rdquo;, without warranties of
                any kind, express or implied. The Club and the Platform&apos;s author do not warrant that
                the Platform will be error-free, uninterrupted, secure against all attacks, or free of
                downtime. The Platform may be modified, suspended, or discontinued at any time, including
                under the licence-termination provisions described in the
                {' '}<Link href="/legal/ip-ownership" className="text-primary-400 underline hover:text-primary-300">IP Ownership Acknowledgement</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">11. Limitation of liability</h2>
              <p>
                To the fullest extent permitted by Canadian law, the Club, its directors, officers,
                volunteers, and the Platform&apos;s author shall not be liable for any indirect, incidental,
                consequential, special, or punitive damages arising from or related to your use of the
                Platform, including loss of data, loss of access, or loss of opportunity. The Club&apos;s
                aggregate liability arising from or related to use of the Platform shall not exceed the
                fees paid by you to the Club in the twelve (12) months preceding the claim, or CAD $100,
                whichever is greater.
              </p>
              <p className="mt-2">
                Nothing in these Terms limits liability that cannot lawfully be limited under Canadian law,
                including liability for fraud or intentional wrongdoing.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">12. Termination of access</h2>
              <p>
                The Club may suspend or terminate your access to the Platform at any time, with or without
                notice, for any reason consistent with these Terms, the Code of Conduct, the Bylaws, or
                applicable law. You may stop using the Platform at any time. Upon termination, the
                provisions of these Terms that by their nature should survive (e.g., ownership, liability
                limitation, governing law) will survive.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">13. Changes to these Terms</h2>
              <p>
                The Club may revise these Terms from time to time. The current version is always posted at
                {' '}<a href="https://challengerscc.ca/legal/terms-of-service" className="text-primary-400 underline hover:text-primary-300">challengerscc.ca/legal/terms-of-service</a>.
                Material changes will be communicated to members by email and announced on the Website.
                Continued use of the Platform after a change indicates your acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">14. Governing law</h2>
              <p>
                These Terms are governed by the laws of the Province of Ontario and the federal laws of
                Canada applicable therein. Disputes shall be heard exclusively in the courts of Ontario,
                Canada. The
                {' '}<em>Canada Not-for-profit Corporations Act</em>, the federal
                {' '}<em>Copyright Act</em>, the federal
                {' '}<em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA), and the
                Ontario
                {' '}<em>Electronic Commerce Act, 2000</em> apply where relevant.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">15. Contact</h2>
              <p>
                Questions about these Terms may be directed to:
              </p>
              <p className="mt-2">
                Challengers Cricket Club<br />
                <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline hover:text-primary-300">contact@challengerscc.ca</a>
              </p>
            </section>

            <hr className="border-white/10" />

            <p className="text-xs text-gray-500 italic">
              Document version: v1.0 · Effective 8 May 2026 · Pending pro-bono lawyer review and Board ratification.
              <br />
              v1.0 (2026-05-08) — initial Terms of Service. References federal CNCA incorporation, By-Laws
              Articles XIV (Software/IP), XV (Member Data + Cloud Infrastructure), and XVI (Volunteer
              Status); discloses Mohammed Saad&apos;s related-party role as Director + author + data processor;
              published openly at <a href="https://challengerscc.ca/legal/terms-of-service" className="text-primary-400 underline hover:text-primary-300">challengerscc.ca/legal/terms-of-service</a>.
            </p>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
