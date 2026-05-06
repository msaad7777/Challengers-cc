import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Software & IP Ownership Acknowledgement — Challengers Cricket Club',
  description: 'Public acknowledgement that the C3H portal, challengerscc.ca website, and all related software is owned by Saad Cloud & AI Solutions Inc. Challengers Cricket Club operates the platform under a revocable licence at no charge while Mohammed Saad serves as a director.',
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
            <p className="text-sm text-gray-500">Challengers Cricket Club · Version 1.1 · Effective 6 May 2026 (covers Nov 2025 onward retroactively)</p>
          </div>

          {/* Headline summary */}
          <div className="rounded-2xl p-5 mb-8 border-2 border-accent-500/40 bg-accent-500/5">
            <p className="text-sm text-gray-200 leading-relaxed">
              <strong className="text-accent-400">Plain-language summary.</strong> The C3H members&apos; portal, the
              <code className="text-primary-400 mx-1">challengerscc.ca</code> website, and every line of source code,
              design, and infrastructure that powers them was built by <strong className="text-white">Saad Cloud &amp; AI Solutions Inc.</strong>,
              an Ontario business corporation owned by Mohammed Saad. The work is <strong className="text-white">commercial corporate work</strong>,
              not a volunteer effort by the company. The intellectual property is owned outright by Saad Cloud &amp;
              AI Solutions Inc. as a corporate asset.
            </p>
            <p className="text-sm text-gray-200 leading-relaxed mt-3">
              <strong className="text-white">For so long as Mohammed Saad remains a director of Challengers Cricket Club</strong>,
              Saad Cloud &amp; AI Solutions Inc. provides the platform — frontend, backend, cloud infrastructure,
              ongoing development, and ongoing maintenance — to the Club at <strong className="text-white">no charge,
              with no payment due</strong>. This is a courtesy made possible by the related-party relationship; it
              is not a donation, not a transfer of ownership, and not an irrevocable grant.
            </p>
            <p className="text-sm text-gray-200 leading-relaxed mt-3">
              Saad Cloud &amp; AI Solutions Inc. retains the <strong className="text-white">unilateral right to
              terminate the licence and withdraw the platform</strong> — frontend, backend, source code, deployments,
              data exports, and related setup — at its sole discretion. If Mohammed Saad ceases to be a director
              of the Club, the no-charge arrangement may be wound down, re-priced at fair market value, or
              terminated entirely. The Club has never paid Saad Cloud &amp; AI Solutions Inc. or Mohammed Saad
              for software development, and has never employed either as staff or contractor.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-gray-200 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Purpose</h2>
              <p className="text-sm">
                This acknowledgement clarifies the ownership of the software and infrastructure that operates the
                Club&apos;s online presence. It protects the Club from any future claim that it lacks the right to use
                the platform, and it protects Mohammed Saad and Saad Cloud &amp; AI Solutions Inc. from any future
                claim that the Club owns code or intellectual property that it does not.
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
                    <li>Ontario Not-for-Profit Corporation</li>
                    <li>Corporation #1746974-8</li>
                    <li>Incorporated 11 November 2025</li>
                    <li>London, Ontario</li>
                  </ul>
                </div>
                <div className="rounded-xl p-4 border border-white/10 bg-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-accent-400 font-bold mb-2">The Developer</p>
                  <p className="text-sm font-bold text-white">Saad Cloud &amp; AI Solutions Inc.</p>
                  <ul className="text-xs text-gray-400 mt-2 space-y-1">
                    <li>Ontario business corporation</li>
                    <li>Sole shareholder &amp; director: Mohammed Saad</li>
                    <li>Website: <a href="https://msaad.tech" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 underline">msaad.tech</a></li>
                    <li className="text-gray-500 italic">Corporate registration details on file with the Club; available to regulators or lawyers on request.</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Mohammed Saad is also a co-founding <strong className="text-white">director of Challengers Cricket Club</strong>.
                That dual role is a conflict of interest that has been declared under the Club&apos;s
                <Link href="/legal/conflict-of-interest" className="text-primary-400 hover:text-primary-300 underline mx-1">Conflict of Interest Policy</Link>
                and is the reason this acknowledgement exists in writing.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">What Saad Cloud &amp; AI Solutions Inc. owns</h2>
              <p className="text-sm mb-2">All of the following is the property of Saad Cloud &amp; AI Solutions Inc., authored solely by Mohammed Saad:</p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>The complete source code of the <strong className="text-white">challengerscc.ca</strong> public website (Next.js application, components, styles, assets except the Club&apos;s registered logo and brand)</li>
                <li>The complete source code of the <strong className="text-white">C3H members&apos; portal</strong> (scoring, availability, squads, replays, reflections, field editor, dashboards, and every related feature)</li>
                <li>All architecture, data models, build configurations, deployment scripts, and operational tooling</li>
                <li>All design, layout, animations, and visual systems other than the Club&apos;s registered name and logo</li>
                <li>Any and all <strong className="text-white">derivative works</strong>, including but not limited to a multi-tenant version of the platform that may be offered as a commercial software-as-a-service product to other cricket clubs and sporting organizations under the Saad Cloud &amp; AI Solutions Inc. brand</li>
                <li>The GitHub repository hosting the source code, the Vercel project hosting the production deployment, and the Firebase project providing data storage — all of which exist within Mohammed Saad&apos;s personal or Saad Cloud &amp; AI Solutions Inc. accounts and are paid for by Saad Cloud &amp; AI Solutions Inc.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">What the Club owns</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>The domain name <strong className="text-white">challengerscc.ca</strong>, registered to and renewed by the Club</li>
                <li>The Club&apos;s <strong className="text-white">name, brand, logo, and colours</strong> — &ldquo;Challengers Cricket Club&rdquo; and &ldquo;CCC&rdquo; trademarks and any associated visual identity</li>
                <li>All <strong className="text-white">member data</strong> generated by Club members through the use of the platform — registrations, availability records, scoring records, match data, training reflections, and any other information provided by members for Club purposes. The Club is the data controller under PIPEDA. Saad Cloud &amp; AI Solutions Inc. acts as data processor only and does not use this data for its own purposes.</li>
                <li>Member contributions of content (photos, videos, written reflections) authored by them, subject to the Club&apos;s
                  <Link href="/legal/privacy" className="text-primary-400 hover:text-primary-300 underline mx-1">Privacy Policy</Link>
                </li>
                <li>The Club&apos;s YouTube channel, social media accounts, and any other Club-branded properties</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Timeline of authorship and ownership transfer</h2>
              <p className="text-sm">
                The platform was built in two distinct legal periods. This Acknowledgement covers <strong className="text-white">both</strong>,
                so that no future party can argue the pre-incorporation work was an implied gift to the Club.
              </p>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 my-3">
                <p className="text-xs uppercase tracking-wider text-accent-400 font-bold mb-2">Period 1 — Personal authorship</p>
                <p className="text-sm text-gray-200">
                  <strong className="text-white">From approximately November 2025 to 4 May 2026</strong>, Mohammed Saad personally
                  authored the source code of the C3H members&apos; portal and the <code className="text-primary-400">challengerscc.ca</code>
                  website, in his individual capacity, on his own time and equipment, using cloud accounts (GitHub, Vercel, Firebase,
                  Google Cloud) registered to him personally and paid for from his own funds. During this period:
                </p>
                <ul className="space-y-1.5 mt-2 text-sm list-disc list-inside ml-2">
                  <li>The Club had no employment relationship with him. No T4 was issued. No salary, fee, or wage was paid.</li>
                  <li>No written assignment of intellectual property from him to the Club was ever executed.</li>
                  <li>By default under section 13(1) of the federal <em>Copyright Act</em>, Mohammed Saad was the first and sole owner of the copyright in the works he authored.</li>
                  <li>His service as a volunteer director of the Club did not constitute employment under section 13(3), nor a written assignment under section 13(4), and therefore did not transfer copyright to the Club.</li>
                  <li>His use of the platform on the Club&apos;s behalf during this period operated under an <strong className="text-white">implicit licence at no charge</strong>, on the same revocable terms now formalized below.</li>
                </ul>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 my-3">
                <p className="text-xs uppercase tracking-wider text-accent-400 font-bold mb-2">Period 2 — Corporate ownership</p>
                <p className="text-sm text-gray-200">
                  On <strong className="text-white">4 May 2026</strong>, Mohammed Saad incorporated Saad Cloud &amp; AI Solutions Inc. as
                  an Ontario business corporation (sole shareholder and director: himself). On or about the same date, by his
                  founding act and contribution, he <strong className="text-white">assigned all pre-existing copyright, source code,
                  designs, and infrastructure</strong> in the platform from himself personally to Saad Cloud &amp; AI Solutions Inc.
                  This assignment is recorded in the corporation&apos;s own records (held with its corporate minute book) and is
                  acknowledged by the Club in this document. From 4 May 2026 forward, all hosting, infrastructure, and
                  ongoing development is performed by and billed to Saad Cloud &amp; AI Solutions Inc. as a corporate entity.
                </p>
              </div>
              <p className="text-sm">
                The Club&apos;s board, through this Acknowledgement, <strong className="text-white">ratifies</strong> the pre-incorporation
                arrangement (Period 1) on the same terms now applied to Period 2: revocable licence at no charge while
                Mohammed Saad serves as a director of the Club, with the right of withdrawal preserved in favour of the
                copyright owner. This ratification covers the entire period from November 2025 to the present and applies
                retroactively — there is no period during which the Club was the owner or co-owner of the platform, nor any
                period during which the work is treated as a gift, donation, or transfer of intellectual property to the Club.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Commercial work, currently provided at no cost</h2>
              <p className="text-sm">
                The platform is the commercial work product of Saad Cloud &amp; AI Solutions Inc. The corporation
                authored, owns, hosts, and maintains it as part of its business. <strong className="text-white">It is
                not volunteer work by the corporation, and it is not a donation of intellectual property to the
                Club.</strong> The Club&apos;s use of the platform is governed by a separate licence and is conditional
                on the terms below.
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2 mt-3">
                <li>The Club has <strong className="text-white">never employed</strong> Mohammed Saad or Saad Cloud &amp; AI Solutions Inc. No employment contract or work-for-hire contract has ever existed. No T4 has ever been issued. No invoice has ever been raised against the Club.</li>
                <li>The Club has <strong className="text-white">never paid</strong> Saad Cloud &amp; AI Solutions Inc. or Mohammed Saad for software development, hosting, or any related service — neither in cash nor in equivalent value. No payment is currently due.</li>
                <li>All work was performed on the corporation&apos;s own time and equipment, using cloud accounts and infrastructure owned and paid for by Saad Cloud &amp; AI Solutions Inc.</li>
                <li>The Club did not <strong className="text-white">commission, direct, or supervise</strong> the technical work in the manner that would create employer-style ownership rights.</li>
                <li>Mohammed Saad personally serves the Club as a <strong className="text-white">volunteer director</strong>. That personal volunteer role does not extend to or transfer the commercial work of his corporation. The two are kept legally distinct.</li>
              </ul>
              <p className="text-sm mt-3">
                For the avoidance of doubt: under section 13(1) of the Copyright Act of Canada, the author of a work
                is the first owner of copyright unless one of the exceptions applies. None of the exceptions —
                employment under section 13(3), or written assignment under section 13(4) — applies to the work
                described here. Mohammed Saad is and has always been the author and first owner; ownership has been
                transferred to Saad Cloud &amp; AI Solutions Inc. by his act of incorporation and contribution.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">The Club&apos;s licence to use the platform</h2>
              <p className="text-sm">
                Saad Cloud &amp; AI Solutions Inc. grants Challengers Cricket Club a <strong className="text-white">limited,
                non-exclusive, non-transferable, revocable licence</strong> to use the C3H portal and the
                <code className="text-primary-400 mx-1">challengerscc.ca</code> website for the Club&apos;s internal operations,
                member services, communications, and public outreach. The licence is <strong className="text-white">not
                perpetual and not irrevocable</strong>. It is provided as a courtesy under the related-party
                arrangement and may be terminated as set out below.
              </p>
              <p className="text-sm mt-3"><strong className="text-white">Term and termination.</strong></p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2 mt-2">
                <li>The licence is provided <strong className="text-white">at no charge</strong> for so long as Mohammed Saad continues to serve as a director of the Club <em>and</em> Saad Cloud &amp; AI Solutions Inc. elects to continue providing the platform.</li>
                <li>Saad Cloud &amp; AI Solutions Inc. may, <strong className="text-white">at its sole discretion</strong>, terminate the licence and withdraw the platform — the website, the C3H portal, the source code deployments, the cloud infrastructure, and all related setup — by giving the Club reasonable written notice. Reasonable notice will be no less than thirty (30) days unless the termination is for cause.</li>
                <li>If Mohammed Saad <strong className="text-white">ceases to be a director</strong> of the Club for any reason — resignation, removal, end of term, or otherwise — Saad Cloud &amp; AI Solutions Inc. may, at its sole discretion, (a) wind down the no-charge arrangement, (b) propose a fair-market commercial agreement to continue the service, or (c) terminate the licence and withdraw the platform.</li>
                <li>Termination for cause includes, without limitation: any attempt by the Club, its directors, officers, members, or successors to assert ownership of the source code, the infrastructure, or the related-party intellectual property; any breach of this acknowledgement; or any material breach of the separate Software License or Data Processing Agreements once executed.</li>
                <li>On termination, the Club&apos;s right to use the platform ends immediately. Saad Cloud &amp; AI Solutions Inc. will, on request and where reasonably practicable, provide the Club with a one-time data export of Club-owned member data in a standard format. The Club has no claim to the source code, deployments, hosting accounts, or any other intellectual property.</li>
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
                A separate, more detailed <strong className="text-white">Software License &amp; Service Agreement</strong> between
                Saad Cloud &amp; AI Solutions Inc. and the Club will codify the operating terms (notice periods, data
                export procedures, support levels, sub-processors). That agreement will be signed by the Club&apos;s
                board with Mohammed Saad declaring conflict of interest and abstaining from the vote, in
                accordance with the
                <Link href="/legal/conflict-of-interest" className="text-primary-400 hover:text-primary-300 underline mx-1">Conflict of Interest Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Reserved rights — productization &amp; derivatives</h2>
              <p className="text-sm">
                Saad Cloud &amp; AI Solutions Inc. reserves the right to develop, market, and sell <strong className="text-white">multi-tenant or commercial versions</strong>
                of the platform to other clubs and sporting organizations, under its own branding, on its own
                infrastructure, without any obligation to Challengers Cricket Club. Specifically:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2 mt-2">
                <li>The Club has no claim, royalty, or revenue share on commercial sales of the platform or any derivative product.</li>
                <li>The Club has no right to be named as a co-owner, partner, or shareholder of any commercial product.</li>
                <li>The Club may be referenced as the <strong className="text-white">first reference customer</strong> of the platform, with the Club&apos;s prior consent for such use, but this reference does not create any commercial interest.</li>
                <li>Member data of Challengers Cricket Club will <strong className="text-white">never</strong> be used to train, test, demo, or operate any commercial version of the platform without explicit member-by-member consent and a separate Data Processing Agreement.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Conflict of interest disclosure</h2>
              <p className="text-sm">
                Mohammed Saad is a co-founding director of Challengers Cricket Club and is also the sole shareholder
                and director of Saad Cloud &amp; AI Solutions Inc. This is a related-party arrangement and a conflict of
                interest within the meaning of the Club&apos;s
                <Link href="/legal/conflict-of-interest" className="text-primary-400 hover:text-primary-300 underline mx-1">Conflict of Interest Policy</Link>
                and the Ontario Not-for-Profit Corporations Act.
              </p>
              <p className="text-sm mt-2">
                This conflict has been declared in writing to the Club&apos;s board. Mohammed Saad has abstained, and will
                continue to abstain, from any board vote concerning the Club&apos;s relationship with Saad Cloud &amp; AI
                Solutions Inc., including the approval of this acknowledgement, the related Software License
                Agreement, the related Hosting &amp; Services Agreement, the related Data Processing Agreement, and any
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
                the sole property of Saad Cloud &amp; AI Solutions Inc.</strong>
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
                Saad Cloud &amp; AI Solutions Inc. has agreed to operate the platform on the Club&apos;s behalf at zero
                cost while the related-party relationship continues. The Club, in return, has accepted that the
                arrangement is a courtesy on revocable terms — not a perpetual entitlement. The Club retains
                ownership of its name, brand, domain, and member data; Saad Cloud &amp; AI Solutions Inc. retains
                ownership of the software and the right to withdraw it. This is the form of arrangement least
                vulnerable to misunderstanding when boards change, when grant funders ask about IP registers, when
                CRA charity registration is reviewed, or when the organization eventually faces a transition. The
                Club&apos;s board has accepted these terms with thanks and recorded the acceptance here so that no
                future board, member, or third party is left to guess at the arrangement.
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
                {' '}or to Saad Cloud &amp; AI Solutions Inc. via <a href="https://msaad.tech" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 underline">msaad.tech</a>.
              </p>
            </section>

          </div>

          <div className="mt-8 text-xs text-gray-500 text-center">
            <p>Effective: 6 May 2026 · Version 1.1 · Pending lawyer review</p>
            <p className="mt-1">v1.1 (2026-05-06) — adds explicit timeline of authorship and the Period-1/Period-2 ratification covering work performed before Saad Cloud &amp; AI Solutions Inc. was incorporated.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
