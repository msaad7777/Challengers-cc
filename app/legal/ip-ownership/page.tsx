import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Software & IP Ownership Acknowledgement — Challengers Cricket Club',
  description: 'Public acknowledgement that every line of the C3H portal and challengerscc.ca website was authored by Mohammed Saad personally and is owned by him personally under Copyright Act §13(1). Challengers Cricket Club operates the platform under a revocable licence at no charge while Mohammed Saad serves as a director.',
};

export default function IpOwnershipPage() {
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
            <span className="text-3xl">⚖️</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3">Software &amp; IP Ownership Acknowledgement</h1>
            <p className="text-sm text-gray-500">Challengers Cricket Club · Version 2.2 · Effective 8 May 2026 (covers Nov 2025 onward retroactively)</p>
          </div>

          {/* Headline summary */}
          <div className="rounded-2xl p-5 mb-8 border-2 border-accent-500/40 bg-accent-500/5">
            <p className="text-sm text-gray-200 leading-relaxed">
              <strong className="text-accent-400">Plain-language summary.</strong> Every line of source code, design,
              and infrastructure that powers the C3H members&apos; portal and the <code className="text-primary-400">challengerscc.ca</code>{' '}
              website was authored by <strong className="text-white">Mohammed Saad</strong> personally. He is the
              first and sole owner of the copyright in this work under section 13(1) of the federal{' '}
              <em>Copyright Act</em> of Canada. The work was performed in his personal capacity — not as an employee
              of the Club, not under any work-for-hire contract, and not under any signed assignment of intellectual
              property to the Club.
            </p>
            <p className="text-sm text-gray-200 leading-relaxed mt-3">
              <strong className="text-white">For so long as Mohammed Saad remains a director of Challengers Cricket Club</strong>,
              he licenses the platform — frontend, backend, cloud infrastructure, ongoing development, and ongoing
              maintenance — to the Club at <strong className="text-white">no charge, with no payment due</strong>.
              This is a courtesy made possible by his role on the board; it is not a donation, not a transfer of
              ownership, and not an irrevocable grant.
            </p>
            <p className="text-sm text-gray-200 leading-relaxed mt-3">
              Mohammed Saad retains the <strong className="text-white">unilateral right to terminate the licence and
              withdraw the platform</strong> — frontend, backend, source code, deployments, data exports, and related
              setup — at his sole discretion. If he ceases to be a director of the Club, the no-charge arrangement
              may be wound down, re-priced at fair market value, or terminated entirely. The Club has never paid him
              for software development, and has never employed him as staff or contractor. How he chooses to organize
              his own intellectual property internally — including any future assignment to a corporation he owns —
              is his sole, private business and is not the subject of this Acknowledgement.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-gray-200 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Purpose</h2>
              <p className="text-sm">
                This acknowledgement clarifies the ownership of the software and infrastructure that operates the
                Club&apos;s online presence. It protects the Club from any future claim that it lacks the right to use
                the platform, and it protects Mohammed Saad personally from any future claim that the Club owns
                code or intellectual property that it does not.
              </p>
              <p className="text-sm mt-2">
                The Club&apos;s board has formally adopted this acknowledgement as part of its governance record. It
                does not create new rights or obligations — it documents the factual relationship that has existed
                from day one.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">The two parties</h2>
              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                <div className="rounded-xl p-4 border border-white/10 bg-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-primary-400 font-bold mb-2">The Club</p>
                  <p className="text-sm font-bold text-white">Challengers Cricket Club</p>
                  <ul className="text-xs text-gray-400 mt-2 space-y-1">
                    <li>Not-for-Profit Corporation</li>
                    <li>Corporation #1746974-8</li>
                    <li>Incorporated November 2025</li>
                    <li>London, Ontario</li>
                  </ul>
                </div>
                <div className="rounded-xl p-4 border border-white/10 bg-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-accent-400 font-bold mb-2">The Author / Licensor</p>
                  <p className="text-sm font-bold text-white">Mohammed Saad</p>
                  <ul className="text-xs text-gray-400 mt-2 space-y-1">
                    <li>Individual residing in London, Ontario</li>
                    <li>Personal author and copyright owner of the platform under <em>Copyright Act</em> §13(1)</li>
                    <li>Co-founding director of Challengers Cricket Club</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Mohammed Saad is also a co-founding <strong className="text-white">director of Challengers Cricket Club</strong>.
                That dual role is a related-party arrangement and a conflict of interest that has been declared under
                the Club&apos;s
                <Link href="/legal/conflict-of-interest" className="text-primary-400 hover:text-primary-300 underline mx-1">Conflict of Interest Policy</Link>
                and is the reason this acknowledgement exists in writing.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">What Mohammed Saad personally owns</h2>
              <p className="text-sm mb-2">All of the following is the personal property of Mohammed Saad, authored solely by him:</p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>The complete source code of the <strong className="text-white">challengerscc.ca</strong> public website (Next.js application, components, styles, assets except the Club&apos;s registered logo and brand)</li>
                <li>The complete source code of the <strong className="text-white">C3H members&apos; portal</strong> (scoring, availability, squads, replays, reflections, field editor, dashboards, and every related feature)</li>
                <li>All architecture, data models, build configurations, deployment scripts, and operational tooling</li>
                <li>All design, layout, animations, and visual systems other than the Club&apos;s registered name and logo</li>
                <li>Any and all <strong className="text-white">derivative works</strong>, including any future multi-tenant or commercial version of the platform offered to other cricket clubs and sporting organizations</li>
                <li>The <strong className="text-white">GitHub repository</strong> hosting the source code, registered to and paid for by Mohammed Saad personally. This repository holds source code only, not member data.</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3 italic">
                What Mohammed Saad does <strong className="text-gray-400">not</strong> own: the production-hosting
                Vercel account (Club-controlled, registered to{' '}
                <strong className="text-gray-400">challengerscricketclub2026@gmail.com</strong>); the Firebase /
                Google Cloud project that stores all member data; any member data, personal information, signed
                legal documents, match records, registrations, or any other information stored there. See the next
                section for the Club&apos;s data-and-hosting ownership.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">What the Club owns</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>The domain name <strong className="text-white">challengerscc.ca</strong>, registered to and renewed by the Club</li>
                <li>The Club&apos;s <strong className="text-white">name, brand, logo, and colours</strong> — &ldquo;Challengers Cricket Club&rdquo; and &ldquo;CCC&rdquo; trademarks and any associated visual identity</li>
                <li>
                  The <strong className="text-white">Vercel production-hosting account</strong>, registered to the
                  Club at <strong className="text-white">challengerscricketclub2026@gmail.com</strong>. The Club
                  controls deployment access, environment variables, domain configuration, and billing for this
                  account. The Vercel project pulls source from Mohammed Saad&apos;s GitHub repository to build
                  and deploy; if access to that repository is revoked, Vercel can no longer redeploy, but the
                  Club retains the Vercel account itself and its historical deployments running there.
                </li>
                <li>
                  The <strong className="text-white">Firebase / Google Cloud project</strong> (project ID
                  {' '}<code className="text-primary-400">challengers-c3h</code>) where every piece of platform data
                  is stored — including the Firestore database, Firebase Authentication records, and all related
                  cloud resources. The project is administered by the Club&apos;s Google Workspace account
                  {' '}<strong className="text-white">contact@challengerscc.ca</strong>, which holds the
                  {' '}<strong className="text-white">Owner</strong> role in the Google Cloud Console. The Club
                  controls billing, access permissions, security rules, and may revoke any developer&apos;s access
                  at any time by board resolution. Mohammed Saad does not personally own the project, the data, or
                  any administrative claim on it; his access is operational only and is held at the Club&apos;s
                  discretion.
                </li>
                <li>
                  All <strong className="text-white">member data and personal information</strong> generated through
                  the use of the platform — registrations, availability records, scoring records, match data,
                  training reflections, e-signed legal documents (Volunteer Agreement, Liability Waiver, Code of
                  Conduct, Photography Consent, Conflict-of-Interest declarations, governance signatures), board
                  resolutions, contact details, and every other piece of personal information saved to Firestore
                  or any other Club cloud resource. The Club is the
                  {' '}<strong className="text-white">data controller</strong> under PIPEDA. Mohammed Saad acts as a
                  {' '}<strong className="text-white">data processor</strong> only, on the Club&apos;s instructions,
                  and does not own, use, copy, or extract any of this data for any purpose other than operating the
                  platform on behalf of the Club.
                </li>
                <li>Member contributions of content (photos, videos, written reflections) authored by them, subject to the Club&apos;s
                  <Link href="/legal/privacy" className="text-primary-400 hover:text-primary-300 underline mx-1">Privacy Policy</Link>
                </li>
                <li>The Club&apos;s YouTube channel, social media accounts, and any other Club-branded properties</li>
              </ul>
              <div className="mt-4 rounded-lg border border-primary-500/30 bg-primary-500/5 p-3">
                <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1.5">Plain-language summary</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-white">Club code</strong> is Mohammed Saad&apos;s. <strong className="text-white">Club data</strong> is the Club&apos;s. The cloud project that holds the data
                  (Firebase / Firestore) is registered to and controlled by{' '}
                  <strong className="text-white">contact@challengerscc.ca</strong>, the Club&apos;s Google Workspace
                  admin account. No personal information stored on the platform is the personal property of
                  Mohammed Saad or any director, officer, or developer.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Timeline of authorship and ownership</h2>
              <p className="text-sm">
                Mohammed Saad has personally authored the source code of the C3H members&apos; portal and the
                <code className="text-primary-400 mx-1">challengerscc.ca</code> website from approximately
                <strong className="text-white"> November 2025 to the present</strong>, in his individual capacity, on his
                own time and equipment. The source-code account (GitHub) is registered to him personally. The
                production-hosting account (Vercel) is registered to the Club at
                {' '}<strong className="text-white">challengerscricketclub2026@gmail.com</strong>. The Firebase /
                Google Cloud project (<code className="text-primary-400">challengers-c3h</code>) that stores all
                member data and personal information is owned and administered by the Club through the
                {' '}<strong className="text-white">contact@challengerscc.ca</strong> Workspace account — see{' '}
                <em>What the Club owns</em> above. Throughout this period:
              </p>
              <ul className="space-y-1.5 mt-2 text-sm list-disc list-inside ml-2">
                <li>The Club has had <strong className="text-white">no employment relationship</strong> with him. No T4 has been issued. No salary, fee, or wage has been paid.</li>
                <li>No written assignment of intellectual property from him to the Club has ever been executed.</li>
                <li>By default under section 13(1) of the federal <em>Copyright Act</em>, Mohammed Saad is the first and sole owner of the copyright in the works he authored.</li>
                <li>His service as a volunteer director of the Club does not constitute employment under section 13(3), nor a written assignment under section 13(4), and therefore has not at any point transferred copyright to the Club.</li>
                <li>His use of the platform on the Club&apos;s behalf has operated, and continues to operate, under a <strong className="text-white">revocable licence at no charge</strong> as set out below.</li>
              </ul>
              <p className="text-sm mt-3">
                The Club&apos;s board, through this Acknowledgement, confirms that the entire authorship period from
                November 2025 to the present is governed by these terms — there is no period during which the Club
                was the owner or co-owner of the platform, nor any period during which the work is treated as a gift,
                donation, or transfer of intellectual property to the Club.
              </p>
              <p className="text-sm mt-3 text-gray-400">
                <strong className="text-white">Internal arrangements.</strong> How Mohammed Saad chooses to organize his
                own intellectual property internally — including any current or future licence to a corporation he
                owns — is his sole, private business decision and is not the subject of this Acknowledgement. The
                Club&apos;s licence is from Mohammed Saad personally and is not affected by any such internal arrangement.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Personal work, currently provided at no cost</h2>
              <p className="text-sm">
                The platform is Mohammed Saad&apos;s personal work product. He authored, owns, hosts, and maintains it
                in his individual capacity. <strong className="text-white">It is not a donation of intellectual property
                to the Club.</strong> The Club&apos;s use of the platform is governed by a separate licence and is
                conditional on the terms below.
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2 mt-3">
                <li>The Club has <strong className="text-white">never employed</strong> Mohammed Saad. No employment contract or work-for-hire contract has ever existed. No T4 has ever been issued. No invoice has ever been raised against the Club.</li>
                <li>The Club has <strong className="text-white">never paid</strong> Mohammed Saad for software development, hosting, or any related service — neither in cash nor in equivalent value. No payment is currently due.</li>
                <li>All software-development work was performed on his own time and equipment, using a source-code account (GitHub) registered to him personally. The production-hosting account (Vercel, registered to <strong className="text-white">challengerscricketclub2026@gmail.com</strong>) and the data infrastructure (Firebase / Firestore / Google Cloud project <code className="text-primary-400">challengers-c3h</code>, administered through <strong className="text-white">contact@challengerscc.ca</strong>) are the Club&apos;s.</li>
                <li>The Club did not <strong className="text-white">commission, direct, or supervise</strong> the technical work in the manner that would create employer-style ownership rights.</li>
                <li>Mohammed Saad serves the Club as a <strong className="text-white">volunteer director</strong>. That personal volunteer role is separate from his ownership of the platform — service to the Club does not transfer the platform to the Club.</li>
              </ul>
              <p className="text-sm mt-3">
                For the avoidance of doubt: under section 13(1) of the Copyright Act of Canada, the author of a work
                is the first owner of copyright unless one of the exceptions applies. None of the exceptions —
                employment under section 13(3), or written assignment under section 13(4) — applies to the work
                described here. Mohammed Saad is and remains the author and first owner.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">The Club&apos;s licence to use the platform</h2>
              <p className="text-sm">
                Mohammed Saad grants Challengers Cricket Club a <strong className="text-white">limited,
                non-exclusive, non-transferable, revocable licence</strong> to use the C3H portal and the
                <code className="text-primary-400 mx-1">challengerscc.ca</code> website for the Club&apos;s internal operations,
                member services, communications, and public outreach. The licence is <strong className="text-white">not
                perpetual and not irrevocable</strong>. It is provided as a courtesy under the related-party
                arrangement and may be terminated as set out below.
              </p>
              <p className="text-sm mt-3"><strong className="text-white">Term and termination.</strong></p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2 mt-2">
                <li>The licence is provided <strong className="text-white">at no charge</strong> for so long as Mohammed Saad continues to serve as a director of the Club <em>and</em> elects to continue providing the platform.</li>
                <li>Mohammed Saad may, <strong className="text-white">at his sole discretion</strong>, terminate the licence and withdraw the platform — the website, the C3H portal, the source code deployments, the cloud infrastructure, and all related setup — by giving the Club reasonable written notice. Reasonable notice will be no less than thirty (30) days unless the termination is for cause.</li>
                <li>If Mohammed Saad <strong className="text-white">ceases to be a director</strong> of the Club for any reason — resignation, removal, end of term, or otherwise — he may, at his sole discretion, (a) wind down the no-charge arrangement, (b) propose a fair-market commercial agreement to continue the service, or (c) terminate the licence and withdraw the platform.</li>
                <li>Termination for cause includes, without limitation: any attempt by the Club, its directors, officers, members, or successors to assert ownership of the source code, the infrastructure, or the related-party intellectual property; any breach of this acknowledgement; or any material breach of the separate Software Licence Agreement once executed.</li>
                <li>On termination, the Club&apos;s right to use the platform ends immediately. Mohammed Saad will, on request and where reasonably practicable, provide the Club with a one-time data export of Club-owned member data in a standard format. The Club has no claim to the source code, deployments, hosting accounts, or any other intellectual property.</li>
              </ul>
              <p className="text-sm mt-3"><strong className="text-white">What the licence does not permit.</strong> Even while the licence is in force, the Club may not:</p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2 mt-2">
                <li>Sublicense, resell, white-label, or commercialize the source code or platform</li>
                <li>Distribute the source code outside the Club&apos;s own use</li>
                <li>Create competing or derivative software products from the source code</li>
                <li>Claim ownership of the source code or intellectual property in any public, regulatory, or grant context</li>
                <li>Demand the assignment, transfer, or escrow of source code as a condition of using the platform</li>
              </ul>
              <p className="text-sm mt-3">
                A separate, more detailed <strong className="text-white">Software Licence Agreement</strong> between
                Mohammed Saad and the Club will codify the operating terms (notice periods, data export procedures,
                support levels, sub-processors). That agreement will be signed by the Club&apos;s board with Mohammed
                Saad declaring conflict of interest and abstaining from the vote, in accordance with the
                <Link href="/legal/conflict-of-interest" className="text-primary-400 hover:text-primary-300 underline mx-1">Conflict of Interest Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Reserved rights — productization &amp; derivatives</h2>
              <p className="text-sm">
                Mohammed Saad reserves the right to develop, market, and sell <strong className="text-white">multi-tenant or commercial versions</strong>
                of the platform to other clubs and sporting organizations, including by assigning or licensing his
                rights to a corporation he owns or to any third party. Specifically:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2 mt-2">
                <li>The Club has no claim, royalty, or revenue share on commercial sales of the platform or any derivative product.</li>
                <li>The Club has no right to be named as a co-owner, partner, or shareholder of any commercial product.</li>
                <li>The Club may be referenced as the <strong className="text-white">first reference customer</strong> of the platform, with the Club&apos;s prior consent for such use, but this reference does not create any commercial interest.</li>
                <li>Member data of Challengers Cricket Club will <strong className="text-white">never</strong> be used to train, test, demo, or operate any commercial version of the platform without explicit member-by-member consent and a separate Data Processing Agreement.</li>
                <li>Any internal arrangement Mohammed Saad makes — for example, assigning his rights to a corporation he owns — is his sole, private business decision and does not require the Club&apos;s consent.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Conflict of interest disclosure</h2>
              <p className="text-sm">
                Mohammed Saad is a co-founding director of Challengers Cricket Club and is also the personal
                copyright owner and licensor of the platform. This is a related-party arrangement and a conflict of
                interest within the meaning of the Club&apos;s
                <Link href="/legal/conflict-of-interest" className="text-primary-400 hover:text-primary-300 underline mx-1">Conflict of Interest Policy</Link>.
              </p>
              <p className="text-sm mt-2">
                This conflict has been declared in writing to the Club&apos;s board. Mohammed Saad has abstained, and will
                continue to abstain, from any board vote concerning the Club&apos;s licence to use the platform,
                including the approval of this acknowledgement, the related Software Licence Agreement, and any
                future variation of those agreements.
              </p>
              <p className="text-sm mt-2">
                The Club&apos;s remaining directors have reviewed this acknowledgement, confirmed that the terms are fair
                and consistent with the Club&apos;s mission, and approved its publication.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Volunteer Agreement carve-out</h2>
              <p className="text-sm">
                Notwithstanding any general language in the Club&apos;s
                <Link href="/legal/volunteer-agreement" className="text-primary-400 hover:text-primary-300 underline mx-1">Volunteer Agreement</Link>
                regarding work product, intellectual property, or contributions made during volunteer service, the
                source code, software, designs, and infrastructure described in this acknowledgement <strong className="text-white">remain
                the sole personal property of Mohammed Saad.</strong>
                The Volunteer Agreement&apos;s general terms do not transfer ownership of these works to the Club, and
                the Club has no claim to them on the basis of any volunteer relationship between Mohammed Saad and
                the Club.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Why the Club agreed to this</h2>
              <p className="text-sm">
                Building a members&apos; portal of this scope from scratch — match scoring, squad management, availability
                tracking, replay archive, training reflections, sponsor pages, payment integration — would cost the
                Club tens of thousands of dollars at commercial rates. The Club has neither the budget nor the
                technical staff to do so.
              </p>
              <p className="text-sm mt-2">
                Mohammed Saad has agreed to operate the platform on the Club&apos;s behalf at zero cost while he serves
                on the board. The Club, in return, has accepted that the arrangement is a courtesy on revocable
                terms — not a perpetual entitlement. The Club retains ownership of its name, brand, domain, and
                member data; Mohammed Saad retains ownership of the software and the right to withdraw it. This is
                the form of arrangement least vulnerable to misunderstanding when boards change, when grant funders
                ask about IP registers, when CRA charity registration is reviewed, or when the organization
                eventually faces a transition. The Club&apos;s board has accepted these terms with thanks and recorded
                the acceptance here so that no future board, member, or third party is left to guess at the
                arrangement.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Adoption &amp; signing</h2>
              <p className="text-sm">
                This acknowledgement was approved by resolution of the board of Challengers Cricket Club at its
                meeting on 4 May 2026, with Mohammed Saad declaring conflict of interest and abstaining from the
                vote. The signed paper copy is held in the Club&apos;s corporate records. This published version is
                provided for transparency to members, sponsors, partners, and regulators.
              </p>
              <p className="text-sm mt-2 text-gray-400 italic">
                Questions about this document can be directed to the Club at <a href="mailto:contact@challengerscc.ca" className="text-primary-400 hover:text-primary-300 underline">contact@challengerscc.ca</a>
                {' '}or directly to Mohammed Saad.
              </p>
            </section>

          </div>

          <div className="mt-8 text-xs text-gray-500 text-center">
            <p>Effective: 8 May 2026 · Version 2.2 · Pending lawyer review</p>
            <p className="mt-1">v2.2 (2026-05-08) — corrects the infrastructure-ownership split. Vercel production-hosting is the Club&apos;s, registered to <strong className="text-white">challengerscricketclub2026@gmail.com</strong>; only GitHub (source code) is Mohammed Saad&apos;s personal account. So the Club controls TWO infrastructure layers (Vercel + Firebase) and Mohammed Saad controls ONE (GitHub source code).</p>
            <p className="mt-1">v2.1 (2026-05-08) — clarified the data-infrastructure split between GitHub/Vercel (then said personal) and Firebase (Club&apos;s). Superseded by v2.2 above which corrects Vercel ownership.</p>
            <p className="mt-1">v2.0 (2026-05-06) — restructured around Mohammed Saad personally as author and licensor. Replaced the prior corporate-licensor framing. Internal corporate arrangements are treated as the licensor&apos;s private matter.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
