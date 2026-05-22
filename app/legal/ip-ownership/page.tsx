import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Software & Technology Notice — Challengers Cricket Club',
  description:
    'Public notice describing how the C3H portal and challengerscc.ca website are organised between Club-owned services and the original developer\'s personal account. Neutral on questions of intellectual-property ownership; the full Technology Governance Record is maintained internally by the Board.',
};

export default function SoftwareTechnologyNoticePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-32 md:pt-40">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/legal"
            className="text-gray-500 text-sm hover:text-primary-400 inline-flex items-center gap-1 mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All governance documents
          </Link>

          <div className="text-center mb-10">
            <span className="text-3xl">⚙️</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3">Software &amp; Technology Notice</h1>
            <p className="text-sm text-gray-500">
              Challengers Cricket Club · Effective 21 May 2026
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-gray-200 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Purpose of this notice</h2>
              <p className="text-sm">
                This page provides a brief public description of how the technical infrastructure behind
                <code className="text-primary-400 mx-1">challengerscc.ca</code> and the Club&apos;s members&apos;
                portal is organised. It is intentionally neutral on questions of intellectual-property ownership;
                a more detailed <em>Technology Governance Record</em> is maintained internally by the Board.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">How the platform is organised today</h2>
              <ul className="text-sm space-y-2 list-disc list-inside ml-2">
                <li>
                  The Club owns and controls its <strong className="text-white">domain</strong>{' '}
                  (<code className="text-primary-400">challengerscc.ca</code>), <strong className="text-white">Google
                  Workspace</strong> emails and Shared Drives, the <strong className="text-white">Stripe</strong>{' '}
                  payments account, all <strong className="text-white">member data</strong> (registrations,
                  availability, scoring, governance signatures), and all <strong className="text-white">Club
                  branding</strong>.
                </li>
                <li>
                  The <strong className="text-white">Vercel</strong> hosting account is logged in via a
                  Club-controlled Gmail.
                </li>
                <li>
                  The <strong className="text-white">Firebase / Google Cloud</strong> project that backs the
                  database and authentication runs under the Club&apos;s
                  <code className="text-primary-400 mx-1">contact@challengerscc.ca</code> Workspace account.
                </li>
                <li>
                  The <strong className="text-white">source-code repository</strong> currently lives on the
                  original developer&apos;s personal GitHub account. This is the only piece of the platform that
                  is not on a Club-owned service today.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Development history</h2>
              <p className="text-sm">
                The Club&apos;s website and members&apos; portal were originally designed and developed by{' '}
                <strong className="text-white">Mohammed Saad</strong>, a co-founding volunteer director, in an
                unpaid capacity beginning in approximately November 2025. At the time, the Club had not yet been
                verified with Google for Nonprofits, TechSoup, or Goodstack, and a Club-owned GitHub organisation
                had not been created — so personal development resources were used. As Club-owned services have
                become available (Workspace, Vercel via Club Gmail, Firebase under Club Workspace, Stripe), each
                element has been provisioned on the Club&apos;s accounts where practicable. The platform is used
                exclusively to support Club operations.
            </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Continuity</h2>
              <p className="text-sm">
                The Board maintains continuity arrangements to ensure the Club&apos;s operations can continue
                if the original developer steps away. Details are recorded in the internal Technology Governance
                Record and may be reviewed by directors via the Pavilion module of the members&apos; portal.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Ownership</h2>
              <p className="text-sm">
                This notice does not make a determination of intellectual-property ownership of the source code,
                and is not intended to grant, transfer, assign, waive, or license any right held by any party.
                Each party reserves all rights they hold under applicable Canadian law, including the federal{' '}
                <em>Copyright Act</em> and the <em>Canada Not-for-Profit Corporations Act</em>. Questions on
                ownership, if and when they need to be resolved, will be addressed by the Board in a separate
                written agreement at that time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Where to direct questions</h2>
              <p className="text-sm">
                For questions about this notice or the Club&apos;s digital infrastructure, please contact{' '}
                <a href="mailto:contact@challengerscc.ca" className="text-primary-400 hover:text-primary-300 underline">
                  contact@challengerscc.ca
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-8 text-xs text-gray-500 text-center">
            <p>Effective: 21 May 2026</p>
            <p className="mt-1">
              This notice replaces the earlier &ldquo;Software &amp; IP Ownership Acknowledgement&rdquo; (versions
              up to v2.2) that took a stronger personal-ownership position. The Board has since adopted a more
              neutral posture pending a future agreement, and the detailed governance record is maintained
              internally for directors only.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
