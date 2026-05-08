// Shared callout box used on all three primary public-facing governance
// pages (Bylaws, Privacy Policy, Financial Policy). Single source of truth
// for the Club's volunteer-status + officer-voting + officer-onboarding
// messaging. Updating this file updates the message everywhere.

import Link from 'next/link';

export default function GovernanceStatusCallout() {
  return (
    <div className="rounded-2xl p-5 mb-6 border-2 border-primary-500/40 bg-primary-500/5">
      <p className="text-sm font-bold text-primary-300 mb-2 flex items-center gap-2">
        <span>🏛️</span>
        <span>Governance status — volunteer-based organization</span>
      </p>
      <ul className="space-y-2 text-sm text-gray-200 leading-relaxed list-disc list-inside ml-1">
        <li>
          <strong className="text-white">Volunteer-based.</strong> Challengers Cricket Club is a Canada
          Not-for-Profit Corporation (#1746974-8) under the <em>Canada Not-for-profit Corporations Act</em>.
          All roles — Director, Officer, Captain, member, player, volunteer, contributor — are volunteer
          roles. The Corporation does not employ any individual, has not registered as an employer with the
          Canada Revenue Agency, has never operated a payroll, and has never issued a T4. No wage, salary,
          fee, or honorarium is paid to anyone for service to the Club.
        </li>
        <li>
          <strong className="text-white">Voting governs appointments and removals.</strong> Officers
          (President, Vice-President, Secretary, Treasurer) are appointed by Ordinary Resolution of the
          Board of Directors and may be removed by the same process, with documented good-faith grounds and
          notice to the officer. Directors themselves can be removed only by Ordinary Resolution of the
          members at a duly-called special meeting. The Board cannot remove a Director by board vote alone.
          See {' '}<Link href="/legal/bylaws" className="text-primary-400 underline hover:text-primary-300">
            By-Laws Article IV
          </Link>.
        </li>
        <li>
          <strong className="text-white">Informal appointments become formal only after signing.</strong>{' '}
          Any individual who has been informally referred to as an officer of the Club becomes a formally
          appointed officer only upon their e-signed acceptance of the Officer Appointment Letter and the
          {' '}<Link href="/legal/volunteer-agreement" className="text-primary-400 underline hover:text-primary-300">
            Volunteer Agreement
          </Link>{' '}
          via the Club&apos;s Officer Hub. An informal designation that has not been accepted by signing is
          not a binding officer appointment under CNCA. The published deadline for signing is{' '}
          <strong className="text-white">30 May 2026</strong>; informal designations not accepted by that
          date lapse and the position is deemed vacant.
        </li>
        <li>
          <strong className="text-white">Replacement is &ldquo;in progress&rdquo; — never automatic.</strong>{' '}
          When an officer position becomes vacant (through non-acceptance, removal, or resignation), the
          Board determines whether and when to appoint a replacement. Replacement appointments are not
          automatic and may take time to identify a suitable candidate. The Board may leave a position
          vacant or designate it as &ldquo;in progress&rdquo; for as long as is in the best interests of
          the Corporation. The duties of a vacant officer position may, in the interim, be performed by the
          remaining officers or by the Board collectively.
        </li>
        <li>
          <strong className="text-white">Protection against bad-faith motions.</strong> No motion to remove
          a Director or officer, and no motion to recuse a Director from voting, may be entertained without
          documented good-faith grounds. Mere accusation, threat, or unsupported allegation does not
          trigger recusal or removal. A pattern of bad-faith motions or knowingly false claims may itself
          constitute grounds for the originator&apos;s removal or expulsion under By-Laws Articles 3.6
          and 4.9.
        </li>
      </ul>
    </div>
  );
}
