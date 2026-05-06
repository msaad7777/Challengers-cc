// Inline content of the Software License & Service Agreement.
// Signed by directors via the Pavilion. If this content materially changes,
// bump the version in governanceDocs.ts to trigger re-signing.

export default function ServiceAgreement() {
  return (
    <div className="space-y-5 text-sm text-gray-200 leading-relaxed">

      <div className="rounded-xl p-4 bg-accent-500/5 border-2 border-accent-500/30">
        <p className="text-xs uppercase tracking-wider text-accent-400 font-bold mb-2">Plain-language summary</p>
        <p>
          This Agreement records the operating relationship between <strong className="text-white">Challengers
          Cricket Club</strong> (&ldquo;the Club&rdquo;) and <strong className="text-white">Saad Cloud &amp; AI Solutions Inc.</strong>
          {' '}(&ldquo;the Provider&rdquo;), the Ontario business corporation that authored, owns, hosts, and maintains the
          Club&apos;s public website at <code className="text-primary-400">challengerscc.ca</code> and the C3H members&apos; portal.
          The Provider is operated by Mohammed Saad, who is also a director of the Club. The work is the Provider&apos;s
          commercial work product. While Mohammed Saad serves as a director of the Club, the Provider supplies
          the platform <strong className="text-white">at no charge</strong> as a courtesy. The Provider <strong className="text-white">retains
          the unilateral right to terminate</strong> the licence and withdraw the platform at any time.
        </p>
      </div>

      <h3 className="text-base font-bold text-white mt-4">1. Parties</h3>
      <ul className="list-disc list-inside ml-2 space-y-1">
        <li><strong className="text-white">The Club:</strong> Challengers Cricket Club, an Ontario Not-for-Profit Corporation (#1746974-8), having its registered office in London, Ontario.</li>
        <li><strong className="text-white">The Provider:</strong> Saad Cloud &amp; AI Solutions Inc., an Ontario business corporation, sole shareholder and director: Mohammed Saad. Public website: <a href="https://msaad.tech" target="_blank" rel="noopener noreferrer" className="text-primary-400 underline hover:text-primary-300">msaad.tech</a>.</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">2. Scope of services</h3>
      <p>The Provider has built and continues to operate, on the Club&apos;s behalf:</p>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>The public website at <code className="text-primary-400">challengerscc.ca</code> (Next.js application; sponsorship pages; legal pages; payment integration).</li>
        <li>The C3H members&apos; portal (match scoring, squad management, availability, replay archive, training reflections, field editor, dashboards).</li>
        <li>The supporting cloud infrastructure (Vercel hosting, Firebase database and authentication, Google sign-in, YouTube video integration, Stripe and Zeffy payment integration).</li>
        <li>Ongoing development, maintenance, bug fixes, and feature additions at the Provider&apos;s discretion.</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">3. Ownership</h3>
      <p>The source code, designs, architecture, deployments, and cloud accounts that constitute the platform are the <strong className="text-white">sole and exclusive property of the Provider</strong>. The Club acknowledges that:</p>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>The platform is the Provider&apos;s commercial work product, not a donation.</li>
        <li>The Club has no right, title, or interest in the source code or related infrastructure.</li>
        <li>Mohammed Saad&apos;s service as a volunteer director of the Club does not transfer or licence to the Club any of the Provider&apos;s intellectual property beyond the limited usage rights granted in Section 4.</li>
      </ul>
      <p className="mt-3"><strong className="text-white">Pre-incorporation work and assignment to the Provider.</strong> The Club further acknowledges that the platform was authored by Mohammed Saad personally between approximately November 2025 and 4 May 2026, in his individual capacity, before the Provider corporation was incorporated. During that period Mohammed Saad personally owned the copyright in the work under section 13(1) of the federal <em>Copyright Act</em> (no employment relationship, no written assignment to the Club). On or about 4 May 2026 he incorporated the Provider and assigned all pre-existing intellectual property in the platform to the Provider as a founding contribution. This Agreement <strong className="text-white">covers and ratifies both periods</strong>: the period during which Mohammed Saad personally owned the work and the period since 4 May 2026 during which the Provider has owned it. There is no period during which the Club was the owner, co-owner, or assignee of the platform. Full timeline detail is set out in the Club&apos;s <em>Software &amp; IP Ownership Acknowledgement</em>.</p>

      <h3 className="text-base font-bold text-white mt-4">4. Licence to the Club</h3>
      <p>The Provider grants the Club a <strong className="text-white">limited, non-exclusive, non-transferable, revocable licence</strong> to access and use the platform for the Club&apos;s internal not-for-profit operations, member services, communications, and public outreach.</p>
      <p className="mt-2">The licence is provided <strong className="text-white">at no charge</strong> for so long as both:</p>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>(a) Mohammed Saad serves as a director of the Club; and</li>
        <li>(b) the Provider elects, in its sole discretion, to continue providing the platform.</li>
      </ul>
      <p className="mt-2">The licence is <strong className="text-white">not perpetual and not irrevocable</strong>.</p>

      <h3 className="text-base font-bold text-white mt-4">5. Restrictions on the Club</h3>
      <p>The Club may not, directly or indirectly:</p>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>Sublicense, resell, white-label, distribute, or commercialize the source code or platform.</li>
        <li>Create competing or derivative software products from the source code.</li>
        <li>Claim or assert ownership, co-ownership, royalty rights, or revenue-share rights in the platform in any public, regulatory, grant, or commercial context.</li>
        <li>Demand the assignment, transfer, or escrow of source code as a condition of using the platform.</li>
        <li>Reverse-engineer, decompile, or attempt to derive the source code where it is not openly published by the Provider.</li>
        <li>Transfer this Agreement or its rights to any successor organization without the Provider&apos;s prior written consent.</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">6. Provider&apos;s right of withdrawal</h3>
      <p>The Provider may, <strong className="text-white">at its sole discretion</strong>, terminate this Agreement and withdraw the platform — frontend, backend, source code, deployments, cloud accounts, and all related setup — in any of the following circumstances:</p>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li><strong className="text-white">For convenience</strong>, on no less than <strong>thirty (30) days&apos; written notice</strong> to the Club.</li>
        <li><strong className="text-white">For cause</strong>, immediately and without notice, on the occurrence of any of: (i) a material breach by the Club of this Agreement, the IP Ownership Acknowledgement, the Volunteer Agreement (in respect of Mohammed Saad&apos;s contribution), or the Conflict of Interest Policy; (ii) any attempt by the Club, its directors, officers, members, or successors to assert ownership of the platform or related intellectual property; (iii) Mohammed Saad ceasing to be a director of the Club, in which case the Provider may, at its sole discretion, (a) wind down the no-charge arrangement, (b) propose a fair-market commercial agreement to continue the service, or (c) terminate this Agreement.</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">7. Effect of termination</h3>
      <p>On termination of this Agreement for any reason:</p>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>The Club&apos;s right to access and use the platform ends immediately.</li>
        <li>The Provider will, on the Club&apos;s reasonable written request and where reasonably practicable, provide the Club with a one-time export of Club-owned member data (registrations, availability, scoring, squads, reflections) in a standard machine-readable format.</li>
        <li>The Club has no claim to the source code, deployments, hosting accounts, domain registrations held in the Provider&apos;s name (if any), or any other Provider intellectual property.</li>
        <li>Sections 3 (Ownership), 5 (Restrictions), 9 (Data &amp; member privacy), 10 (Conflict of interest), 12 (Indemnity), and 13 (Governing law) survive termination.</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">8. No employment, no consideration</h3>
      <p>Neither Mohammed Saad nor the Provider is or has ever been an employee, contractor, agent, or representative of the Club for purposes of compensation. The Club has never paid the Provider or Mohammed Saad for software development, hosting, or any related service. No invoice has been raised. No T4 has been issued. Mohammed Saad&apos;s personal volunteer service as a director is separate and distinct from the Provider&apos;s commercial work and does not constitute consideration to the Club for the work covered by this Agreement.</p>

      <h3 className="text-base font-bold text-white mt-4">9. Data and member privacy</h3>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>The Club is the data <strong className="text-white">controller</strong> of all member personal information collected through the platform under PIPEDA. The Provider acts as the data <strong className="text-white">processor</strong>.</li>
        <li>The Provider may not use Club member data for training artificial intelligence models, demonstrations to other clubs, commercial product development, or any purpose outside operating the platform on the Club&apos;s instructions.</li>
        <li>If the Provider develops a multi-tenant or commercial version of the platform, Club member data shall not be migrated, copied, or referenced in that product without the explicit consent of each affected member and a separate Data Processing Agreement.</li>
        <li>Sub-processors used by the Provider to deliver the platform: Vercel (hosting), Google Cloud / Firebase (database, authentication), Stripe (payments), Zeffy (donations, when active), YouTube (video).</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">10. Conflict of interest</h3>
      <p>Mohammed Saad is a director of the Club and the sole shareholder and director of the Provider. This is a related-party arrangement. Mohammed Saad has declared the conflict in writing and abstains from any board vote concerning this Agreement, the IP Ownership Acknowledgement, or any successor agreement. The Club&apos;s remaining directors approve and sign this Agreement on the Club&apos;s behalf, having satisfied themselves that the terms are fair and that the related-party arrangement is recorded transparently in the Club&apos;s public Standing Disclosures register (see the <em>Conflict of Interest Policy</em>).</p>

      <h3 className="text-base font-bold text-white mt-4">11. Reserved rights — productization</h3>
      <p>The Provider reserves the right to develop, market, and sell <strong className="text-white">multi-tenant or commercial versions</strong> of the platform to other organizations under its own branding, on its own infrastructure, with no obligation to the Club. The Club has no claim, royalty, or revenue share. The Club may be referenced as a <em>first reference customer</em>, with the Club&apos;s prior consent, but the reference does not create any commercial interest.</p>

      <h3 className="text-base font-bold text-white mt-4">12. Indemnity &amp; limitation of liability</h3>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>The platform is provided &ldquo;as is&rdquo; with no warranties of fitness, availability, or freedom from defect. The Provider does not guarantee any service level, uptime, or response time.</li>
        <li>The Provider&apos;s aggregate liability to the Club under this Agreement, for any cause whatsoever, is limited to the total amount paid by the Club to the Provider in the twelve months prior to the event giving rise to the claim. As the Club has paid nothing, this amount is <strong className="text-white">CAD $0</strong>.</li>
        <li>The Club indemnifies the Provider against any third-party claim arising out of the Club&apos;s use of the platform, except claims caused by the Provider&apos;s wilful misconduct or gross negligence.</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">13. Governing law</h3>
      <p>This Agreement is governed by the laws of the Province of Ontario and the federal laws of Canada applicable in Ontario. The parties submit to the exclusive jurisdiction of the courts of Ontario.</p>

      <h3 className="text-base font-bold text-white mt-4">14. Entire agreement</h3>
      <p>This Agreement, together with the public IP Ownership Acknowledgement, the Bylaws (Article 10), the Conflict of Interest Policy (Standing Disclosures), the Volunteer Agreement (Section 3 carve-out), and the Privacy Policy (Who operates this platform), constitutes the entire agreement between the parties on the subject matter and supersedes all prior or contemporaneous understandings.</p>

      <h3 className="text-base font-bold text-white mt-4">15. Amendment</h3>
      <p>This Agreement may be amended only by a written amendment approved by the Club&apos;s board (with Mohammed Saad recused) and signed by an authorized officer of the Provider. Material amendments will be re-circulated to all directors for re-signing through the Pavilion.</p>

      <hr className="border-white/10 my-6" />

      <p className="text-xs text-gray-500 italic">
        Document version 1.1 · Effective 6 May 2026. Pending lawyer review. v1.1 adds the pre-incorporation
        timeline acknowledgement in Section 3 to ratify the Nov 2025 — May 4, 2026 personal authorship period.
        Director e-signatures recorded in the Club&apos;s Pavilion governance ledger with timestamp, signing
        method (typed or drawn), and signer email.
      </p>
    </div>
  );
}
