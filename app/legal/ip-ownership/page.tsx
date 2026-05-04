import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Software & IP Ownership Acknowledgement — Challengers Cricket Club',
  description: 'Public acknowledgement that the C3H portal, challengerscc.ca website, and all related software is owned by Saad Cloud & AI Solutions Inc. Challengers Cricket Club operates the platform under a perpetual royalty-free license.',
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
            <p className="text-sm text-gray-500">Challengers Cricket Club · Effective 4 May 2026</p>
          </div>

          {/* Headline summary */}
          <div className="rounded-2xl p-5 mb-8 border-2 border-accent-500/40 bg-accent-500/5">
            <p className="text-sm text-gray-200 leading-relaxed">
              <strong className="text-accent-400">Plain-language summary.</strong> The C3H members&apos; portal, the
              <code className="text-primary-400 mx-1">challengerscc.ca</code> website, and every line of source code,
              design, and infrastructure that powers them was built by <strong className="text-white">Mohammed Saad</strong>,
              a director of Challengers Cricket Club, on his own time, on his own equipment, using his own cloud
              accounts, and at no cost to the Club. All of that intellectual property is owned by Saad&apos;s
              incorporated business, <strong className="text-white">Saad Cloud &amp; AI Solutions Inc.</strong> The Club
              uses the platform under a perpetual royalty-free licence. The Club has never paid Saad for this work
              and never employed him to do it. This document records that fact on the public record.
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
                    <li>Corporation #1001595840</li>
                    <li>Incorporated 4 May 2026</li>
                    <li>790 Capulet Lane, Unit 103, London, ON, N6H 0J8</li>
                    <li>Sole shareholder &amp; director: Mohammed Saad</li>
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
              <h2 className="text-lg font-bold text-white mb-2">No employment, no compensation, no work-for-hire</h2>
              <p className="text-sm">
                Mohammed Saad has performed all software development for the Club <strong className="text-white">on a strictly volunteer basis</strong>:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2 mt-2">
                <li>The Club has <strong className="text-white">never employed</strong> Mohammed Saad. No employment contract has ever existed. No T4 has ever been issued.</li>
                <li>The Club has <strong className="text-white">never paid</strong> Mohammed Saad or Saad Cloud &amp; AI Solutions Inc. for software development, hosting, or any related service — neither in cash nor in equivalent value.</li>
                <li>No <strong className="text-white">work-made-for-hire</strong> contract or written assignment of intellectual property has been executed between Mohammed Saad and the Club.</li>
                <li>All work was performed on Mohammed Saad&apos;s <strong className="text-white">personal time, personal equipment, and personal cloud accounts</strong>, outside any working hours owed to the Club.</li>
                <li>The Club did not <strong className="text-white">commission, direct, or supervise</strong> the technical work in the manner that would create employer-style ownership rights.</li>
                <li>The Club has explicitly accepted Mohammed Saad&apos;s development effort as an <strong className="text-white">in-kind contribution under licence</strong>, not as a transfer of ownership or a donation of intellectual property.</li>
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
                Saad Cloud &amp; AI Solutions Inc. grants Challengers Cricket Club a <strong className="text-white">perpetual,
                royalty-free, irrevocable, non-exclusive licence</strong> to use the C3H portal and the challengerscc.ca
                website for the Club&apos;s internal operations, member services, communications, and public outreach.
              </p>
              <p className="text-sm mt-2">The licence explicitly <strong className="text-white">does not</strong> permit the Club to:</p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2 mt-2">
                <li>Sublicense, resell, white-label, or commercialize the source code or platform</li>
                <li>Distribute the source code outside the Club&apos;s own use</li>
                <li>Create competing or derivative software products from the source code</li>
                <li>Claim ownership of the source code or intellectual property in any public, regulatory, or grant context</li>
                <li>Demand the assignment, transfer, or escrow of source code as a condition of using the platform</li>
              </ul>
              <p className="text-sm mt-3">
                The licence <strong className="text-white">survives</strong> any change of officers, directors, or members of the
                Club, and any change of corporate status (including dissolution, merger, or transfer to a successor
                organization).
              </p>
              <p className="text-sm mt-2">
                A separate, more detailed <strong className="text-white">Software License Agreement</strong> between Saad Cloud
                &amp; AI Solutions Inc. and the Club will codify the technical operating terms (uptime expectations,
                support levels, sub-processors, termination notice periods, and similar). That agreement will be
                signed by the Club&apos;s board with Mohammed Saad declaring conflict of interest and abstaining from the
                vote, in accordance with the
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
                Mohammed Saad&apos;s in-kind contribution of his time, skill, and infrastructure — under licence, with the
                Club retaining its data and brand — is the most generous form of support a director can offer a
                Not-for-Profit. It is also the form least vulnerable to misunderstanding when boards change, when
                grant funders ask about IP registers, when CRA charity registration is reviewed, or when the
                organization eventually faces a transition. The Club&apos;s board has accepted this contribution on those
                terms with thanks, and recorded the acceptance here so that no future board, member, or third party
                is left to guess at the arrangement.
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
                {' '}or to Saad Cloud &amp; AI Solutions Inc. via Mohammed Saad.
              </p>
            </section>

          </div>

          <div className="mt-8 text-xs text-gray-500 text-center">
            <p>Effective: 4 May 2026 · Version 1.0 · Pending lawyer review</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
