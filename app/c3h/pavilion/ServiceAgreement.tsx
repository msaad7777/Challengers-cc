// Inline content of the Software Licence Agreement between Mohammed Saad
// (personally, as author and copyright owner) and Challengers Cricket
// Club. Signed by directors via the Pavilion. If this content materially
// changes, bump the version in governanceDocs.ts to trigger re-signing.

export default function ServiceAgreement() {
  return (
    <div className="space-y-5 text-sm text-gray-200 leading-relaxed">

      <div className="rounded-xl p-4 bg-accent-500/5 border-2 border-accent-500/30">
        <p className="text-xs uppercase tracking-wider text-accent-400 font-bold mb-2">Plain-language summary</p>
        <p>
          This Agreement records the operating relationship between <strong className="text-white">Mohammed Saad</strong>{' '}
          (the &ldquo;Licensor&rdquo;), as the personal author and copyright owner of the platform, and{' '}
          <strong className="text-white">Challengers Cricket Club</strong> (&ldquo;the Club&rdquo;). Mohammed Saad
          authored the public website at <code className="text-primary-400">challengerscc.ca</code> and the C3H
          members&apos; portal in his personal capacity, owns the copyright in them under section 13(1) of the
          federal <em>Copyright Act</em>, and grants the Club a <strong className="text-white">revocable, no-charge
          licence</strong> to use the platform for so long as he serves as a director of the Club. He retains the
          unilateral right to terminate the licence and withdraw the platform.
        </p>
      </div>

      <h3 className="text-base font-bold text-white mt-4">1. Parties</h3>
      <ul className="list-disc list-inside ml-2 space-y-1">
        <li><strong className="text-white">The Club:</strong> Challengers Cricket Club, having its registered office in London, Ontario.</li>
        <li><strong className="text-white">The Licensor:</strong> Mohammed Saad, an individual residing in London, Ontario, the personal author and copyright owner of the platform.</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">2. Scope of the platform</h3>
      <p>The platform covered by this Agreement comprises:</p>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>The public website at <code className="text-primary-400">challengerscc.ca</code> (Next.js application; sponsorship pages; legal pages; payment integration).</li>
        <li>The C3H members&apos; portal (match scoring, squad management, availability, replay archive, training reflections, field editor, dashboards).</li>
        <li>The supporting cloud infrastructure (Vercel hosting, Firebase database and authentication, Google sign-in, YouTube video integration, Stripe and Zeffy payment integration).</li>
        <li>Ongoing development, maintenance, bug fixes, and feature additions performed by the Licensor at his discretion.</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">3. Ownership</h3>
      <p>The source code, designs, architecture, deployments, and cloud accounts that constitute the platform are the <strong className="text-white">sole and exclusive property of the Licensor</strong>, Mohammed Saad. The Club acknowledges that:</p>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>The platform is the Licensor&apos;s personal work product, not a donation to the Club.</li>
        <li>The Club has no right, title, or interest in the source code or related infrastructure.</li>
        <li>Mohammed Saad&apos;s service as a volunteer director of the Club does not transfer or licence to the Club any of his intellectual property beyond the limited usage rights granted in Section 4.</li>
      </ul>
      <p className="mt-3"><strong className="text-white">Authorship and copyright timeline.</strong> Mohammed Saad personally authored the platform from approximately November 2025 to the present, in his individual capacity, on his own time and equipment, using cloud accounts registered to him personally. During this period the Club had no employment relationship with him, no T4 was issued, no salary or fee was paid, and no written assignment of intellectual property from him to the Club was ever executed. By default under section 13(1) of the federal <em>Copyright Act</em>, Mohammed Saad is the first and sole owner of the copyright in the platform; sections 13(3) (employment) and 13(4) (written assignment) do not apply. This Agreement <strong className="text-white">covers and ratifies</strong> the entire authorship period, retroactively and going forward — there is no period during which the Club was, is, or shall become the owner, co-owner, or assignee of the platform. Any internal arrangement the Licensor may make in the future to assign or licence his rights to a corporation owned by him is his sole, private decision and is not the subject of this Agreement.</p>

      <h3 className="text-base font-bold text-white mt-4">4. Licence to the Club</h3>
      <p>The Licensor grants the Club a <strong className="text-white">limited, non-exclusive, non-transferable, revocable licence</strong> to access and use the platform for the Club&apos;s internal not-for-profit operations, member services, communications, and public outreach.</p>
      <p className="mt-2">The licence is provided <strong className="text-white">at no charge</strong> for so long as both:</p>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>(a) Mohammed Saad serves as a director of the Club; and</li>
        <li>(b) the Licensor elects, in his sole discretion, to continue providing the platform.</li>
      </ul>
      <p className="mt-2">The licence is <strong className="text-white">not perpetual and not irrevocable</strong>.</p>

      <h3 className="text-base font-bold text-white mt-4">5. Restrictions on the Club</h3>
      <p>The Club may not, directly or indirectly:</p>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>Sublicense, resell, white-label, distribute, or commercialize the source code or platform.</li>
        <li>Create competing or derivative software products from the source code.</li>
        <li>Claim or assert ownership, co-ownership, royalty rights, or revenue-share rights in the platform in any public, regulatory, grant, or commercial context.</li>
        <li>Demand the assignment, transfer, or escrow of source code as a condition of using the platform.</li>
        <li>Reverse-engineer, decompile, or attempt to derive the source code where it is not openly published by the Licensor.</li>
        <li>Transfer this Agreement or its rights to any successor organization without the Licensor&apos;s prior written consent.</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">6. Licensor&apos;s right of withdrawal</h3>
      <p>The Licensor may, <strong className="text-white">at his sole discretion</strong>, terminate this Agreement and withdraw the platform — frontend, backend, source code, deployments, cloud accounts, and all related setup — in any of the following circumstances:</p>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li><strong className="text-white">For convenience</strong>, on no less than <strong>thirty (30) days&apos; written notice</strong> to the Club.</li>
        <li><strong className="text-white">For cause</strong>, immediately and without notice, on the occurrence of any of: (i) a material breach by the Club of this Agreement, the IP Ownership Acknowledgement, the Volunteer Agreement, or the Conflict of Interest Policy; (ii) any attempt by the Club, its directors, officers, members, or successors to assert ownership of the platform or related intellectual property; (iii) Mohammed Saad ceasing to be a director of the Club, in which case the Licensor may, at his sole discretion, (a) wind down the no-charge arrangement, (b) propose a fair-market commercial agreement to continue the service, or (c) terminate this Agreement.</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">7. Effect of termination</h3>
      <p>On termination of this Agreement for any reason:</p>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>The Club&apos;s right to access and use the platform ends immediately.</li>
        <li>The Licensor will, on the Club&apos;s reasonable written request and where reasonably practicable, provide the Club with a one-time export of Club-owned member data (registrations, availability, scoring, squads, reflections) in a standard machine-readable format.</li>
        <li>The Club has no claim to the source code, deployments, hosting accounts, domain registrations held in the Licensor&apos;s name (if any), or any other Licensor intellectual property.</li>
        <li>Sections 3 (Ownership), 5 (Restrictions), 9 (Data &amp; member privacy), 10 (Conflict of interest), 12 (Indemnity), and 13 (Governing law) survive termination.</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">8. Volunteer service, no consideration</h3>
      <p>Mohammed Saad has never been an employee, contractor, agent, or representative of the Club for purposes of compensation. The Club has never paid him for software development, hosting, or any related service. No invoice has been raised. No T4 has been issued. His personal volunteer service as a director is separate and distinct from his ownership of the platform — service to the Club does not constitute consideration for the work covered by this Agreement, and the work covered by this Agreement does not constitute compensation to him for his volunteer service.</p>

      <h3 className="text-base font-bold text-white mt-4">9. Data and member privacy</h3>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>The Club is the data <strong className="text-white">controller</strong> of all member personal information collected through the platform under PIPEDA. The Licensor acts as the data <strong className="text-white">processor</strong>.</li>
        <li>The Licensor may not use Club member data for purposes outside operating the platform on the Club&apos;s instructions, including (without limitation) training artificial intelligence models or developing commercial products.</li>
        <li>If the Licensor (or any corporation he owns) ever develops a multi-tenant or commercial version of the platform, Club member data shall not be migrated, copied, or referenced in that product without the explicit consent of each affected member and a separate data processing arrangement.</li>
        <li>Sub-processors used by the Licensor to deliver the platform: Vercel (hosting), Google Cloud / Firebase (database, authentication), Stripe (payments), Zeffy (donations, when active), YouTube (video).</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">10. Conflict of interest</h3>
      <p>Mohammed Saad is a director of the Club and is also the personal copyright owner and licensor of the platform. This is a related-party arrangement. He has declared the conflict in writing and abstains from any board vote concerning this Agreement, the IP Ownership Acknowledgement, or any successor agreement. The Club&apos;s remaining directors approve and sign this Agreement on the Club&apos;s behalf, having satisfied themselves that the terms are fair and that the related-party arrangement is recorded transparently in the Club&apos;s public Standing Disclosures register (see the <em>Conflict of Interest Policy</em>).</p>

      <h3 className="text-base font-bold text-white mt-4">11. Reserved rights — internal arrangements and productization</h3>
      <p>The Licensor reserves the right to develop, market, and sell <strong className="text-white">multi-tenant or commercial versions</strong> of the platform to other organizations, including by assigning or licensing his rights to a corporation he owns or to any third party. Any such internal arrangement is the Licensor&apos;s private business and does not require the Club&apos;s consent. The Club has no claim, royalty, or revenue share. The Club may be referenced as a <em>first reference customer</em>, with the Club&apos;s prior consent, but the reference does not create any commercial interest.</p>

      <h3 className="text-base font-bold text-white mt-4">12. Indemnity &amp; limitation of liability</h3>
      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
        <li>The platform is provided &ldquo;as is&rdquo; with no warranties of fitness, availability, or freedom from defect. The Licensor does not guarantee any service level, uptime, or response time.</li>
        <li>The Licensor&apos;s aggregate liability to the Club under this Agreement, for any cause whatsoever, is limited to the total amount paid by the Club to the Licensor in the twelve months prior to the event giving rise to the claim. As the Club has paid nothing, this amount is <strong className="text-white">CAD $0</strong>.</li>
        <li>The Club indemnifies the Licensor against any third-party claim arising out of the Club&apos;s use of the platform, except claims caused by the Licensor&apos;s wilful misconduct or gross negligence.</li>
        <li>The Club, in turn, indemnifies the Licensor against costs and liabilities arising from the lawful, good-faith provision of the platform in his personal capacity, mirroring Article 9 of the Club&apos;s Bylaws.</li>
      </ul>

      <h3 className="text-base font-bold text-white mt-4">13. Governing law</h3>
      <p>This Agreement is governed by the laws of the Province of Ontario and the federal laws of Canada applicable in Ontario. The parties submit to the exclusive jurisdiction of the courts of Ontario.</p>

      <h3 className="text-base font-bold text-white mt-4">14. Entire agreement</h3>
      <p>This Agreement, together with the public IP Ownership Acknowledgement, the Bylaws (Article 10), the Conflict of Interest Policy (Standing Disclosures), the Volunteer Agreement (Section 3 carve-out), and the Privacy Policy, constitutes the entire agreement between the parties on the subject matter and supersedes all prior or contemporaneous understandings.</p>

      <h3 className="text-base font-bold text-white mt-4">15. Amendment</h3>
      <p>This Agreement may be amended only by a written amendment approved by the Club&apos;s board (with Mohammed Saad recused) and signed by Mohammed Saad personally as the Licensor. Material amendments will be re-circulated to all directors for re-signing through the Pavilion.</p>

      <hr className="border-white/10 my-6" />

      <p className="text-xs text-gray-500 italic">
        Document version 2.0 · Effective 6 May 2026. Pending lawyer review. v2.0 (2026-05-06) restructures the
        Agreement around Mohammed Saad personally as the Licensor (replacing the prior corporate-counterparty
        framing). Director e-signatures recorded in the Club&apos;s Pavilion governance ledger.
      </p>
    </div>
  );
}
