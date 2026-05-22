// Inline content of the Technology Governance Record — the director-only
// neutral record of how the Club's digital infrastructure is currently
// organised. Replaces the earlier IP Ownership Acknowledgement + Software
// Licence Agreement framework, which overstated the personal-ownership
// side of a fundamentally hybrid arrangement.
//
// This Record is intentionally NEUTRAL on questions of intellectual-
// property ownership. It records facts (who built what, where each asset
// sits today, continuity arrangements) but does NOT make ownership
// determinations. Future ownership decisions are deferred to a separate
// written agreement, if and when the Club needs one (e.g.
// commercialisation, grant-reviewer requirements).

export default function TechnologyGovernanceRecord() {
  return (
    <div className="space-y-5 text-sm text-gray-200 leading-relaxed">

      <div className="rounded-xl p-4 bg-primary-500/5 border-2 border-primary-500/30">
        <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-2">Plain-language summary</p>
        <p>
          This Record documents what runs the Club&apos;s digital platform today and who currently has
          custodianship of each piece. It is{' '}
          <strong className="text-white">intentionally neutral on questions of intellectual-property ownership</strong>{' '}
          — it preserves every party&apos;s legal rights without forcing any party to give anything up.
        </p>
        <p className="mt-2">
          Of everything that runs the website, only the source-code repository sits on a personal account
          (Mohammed Saad&apos;s GitHub). Domain, Workspace, Vercel, Firebase, Stripe, member data, and
          branding are all on Club-owned accounts.
        </p>
        <p className="mt-2 text-xs text-gray-400 italic">
          Acknowledged by all five directors. Director-only document; not published publicly.
        </p>
      </div>

      <div className="rounded-xl bg-white/3 border border-white/10 p-5 space-y-4">

        {/* Section title */}
        <div className="border-b border-white/10 pb-3">
          <div className="text-base font-bold text-white">Technology Governance Record</div>
          <div className="text-xs text-gray-400 mt-1">
            Challengers Cricket Club&nbsp;&nbsp;·&nbsp;&nbsp;Canada Not-for-Profit Corporation #1746974-8
          </div>
          <div className="text-xs text-gray-400">
            Adopted by the Board of Directors on the date all five directors acknowledge this Record below.
          </div>
        </div>

        {/* 1. Purpose */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">1. Purpose</p>
          <p>
            This Record documents the current state of the digital infrastructure operated for Challengers
            Cricket Club (the &ldquo;Club&rdquo;), including which assets currently reside under which
            custodianship and how the Club intends to ensure operational continuity. This Record is
            intentionally <strong className="text-white">neutral on questions of intellectual-property
            ownership</strong>.
          </p>
        </div>

        {/* 2. Current custodianship table */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-2">2. Current custodianship</p>
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-gray-300">Asset</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-300">Custodian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr><td className="px-3 py-2">Domain (challengerscc.ca)</td><td className="px-3 py-2 text-gray-300">Challengers Cricket Club</td></tr>
                <tr><td className="px-3 py-2">Google Workspace (challengerscc.ca emails)</td><td className="px-3 py-2 text-gray-300">Challengers Cricket Club (under Google for Nonprofits)</td></tr>
                <tr><td className="px-3 py-2">Shared Drives</td><td className="px-3 py-2 text-gray-300">Challengers Cricket Club (Workspace)</td></tr>
                <tr><td className="px-3 py-2">Member data (Firestore collections)</td><td className="px-3 py-2 text-gray-300">Challengers Cricket Club</td></tr>
                <tr><td className="px-3 py-2">Club branding and logos</td><td className="px-3 py-2 text-gray-300">Challengers Cricket Club</td></tr>
                <tr><td className="px-3 py-2">Vercel hosting account</td><td className="px-3 py-2 text-gray-300">Club Gmail (Club-controlled)</td></tr>
                <tr><td className="px-3 py-2">Stripe payments account</td><td className="px-3 py-2 text-gray-300">Challengers Cricket Club</td></tr>
                <tr><td className="px-3 py-2">Firebase / Google Cloud project (<code className="text-primary-400">challengers-c3h</code>)</td><td className="px-3 py-2 text-gray-300">Challengers Cricket Club (under <code className="text-primary-400">contact@challengerscc.ca</code> Workspace)</td></tr>
                <tr className="bg-amber-500/5"><td className="px-3 py-2 font-semibold text-white">Source-code repository</td><td className="px-3 py-2 text-amber-200">Mohammed Saad (personal GitHub)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Development history */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">3. Development history</p>
          <p>
            The Club&apos;s website (<code className="text-primary-400">challengerscc.ca</code>) and members&apos;
            portal (C3H) were originally designed and developed by <strong className="text-white">Mohammed
            Saad</strong> as an unpaid volunteer director, beginning approximately November 2025. The Firebase /
            Google Cloud project that backs the database and authentication has from the outset been set up
            under the Club&apos;s <code className="text-primary-400">contact@challengerscc.ca</code> Workspace
            account and is therefore Club-controlled. The Vercel hosting account is logged in via the Club&apos;s
            Gmail. The source-code repository, however, was created on and continues to live on Mohammed
            Saad&apos;s personal GitHub account — because at the time development began, the Club was not yet
            verified with Google for Nonprofits, TechSoup, or Goodstack, and a Club-owned GitHub organisation
            had not been created. The platform was created exclusively to support Club operations and has no
            commercial users at this time.
          </p>
        </div>

        {/* 4. Maintenance */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">4. Maintenance and operations</p>
          <p>
            Mohammed Saad is the current technical maintainer and has primary responsibility for ongoing
            development, security, deployments, and bug fixes. The other directors have or may be granted access
            to the Club-controlled services (domain, Workspace, Shared Drives, Stripe, Vercel via Club Gmail).
            The Board may add or remove technical volunteers from Club-controlled services by ordinary
            resolution.
          </p>
        </div>

        {/* 5. Continuity */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">5. Continuity and knowledge transfer</p>
          <p>
            Should Mohammed Saad cease to be available to maintain the platform for any reason, with reasonable
            cooperation from him the Club shall be provided with:
          </p>
          <ol className="list-[lower-alpha] list-inside ml-2 mt-2 space-y-1 text-sm">
            <li>a one-time export of all Club-owned member data in a standard machine-readable format;</li>
            <li>documentation sufficient to allow another developer to operate the deployment using the Club-controlled services listed above;</li>
            <li>such other reasonable transition support as is practicable.</li>
          </ol>
          <p className="mt-2 text-xs italic text-gray-400">
            This continuity provision is not a transfer of source code; it is a commitment to enable continuity
            of Club operations.
          </p>
        </div>

        {/* 6. Future direction */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">6. Future direction</p>
          <p>
            As the organisation matures, the Board may determine — in consultation with Mohammed Saad — whether
            source-code ownership, maintenance responsibilities, or repository management should remain with
            the original developer or transition to Club-controlled infrastructure under a separate written
            agreement. <strong className="text-white">No determination on those questions is made by this
            Record.</strong>
          </p>
        </div>

        {/* 7. Reservation of rights */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">7. Reservation of rights</p>
          <p>This Record records facts. It is not, and shall not be construed as:</p>
          <ul className="list-disc list-inside ml-2 mt-2 space-y-1 text-sm">
            <li>an assignment of intellectual property by any party to any other;</li>
            <li>a waiver of any right (statutory, common-law, or contractual) held by any party;</li>
            <li>a licence granted in either direction;</li>
            <li>consent to any future use or transfer beyond what is specifically described herein.</li>
          </ul>
          <p className="mt-2">
            Each party reserves all rights they hold under applicable Canadian law, including the federal{' '}
            <em>Copyright Act</em> and the <em>Canada Not-for-Profit Corporations Act</em>.
          </p>
        </div>

        {/* 8. Adoption */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">8. Adoption</p>
          <p>
            By acknowledging this Record below, each director confirms that it accurately reflects the current
            state of the Club&apos;s digital infrastructure as of the date of adoption.
          </p>
        </div>

      </div>

      <hr className="border-white/10 my-4" />

      <p className="text-xs text-gray-500 italic">
        Document version 1.0 · Effective 21 May 2026. Director-only document; not published publicly. Requires
        acknowledgement by all five directors of the Corporation.
      </p>
    </div>
  );
}
