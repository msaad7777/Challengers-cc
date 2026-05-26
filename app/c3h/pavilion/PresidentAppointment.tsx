// Combined Director Resolution and Officer Appointment Letter formally
// appointing Gokul Prakash as President of the Corporation pursuant to
// Bylaws Article 4.6(a). Signed by all five directors; Gokul's
// signature evidences his acceptance of the office.
//
// Drafting principles:
//   - Bylaws-aligned. The scope of authority is exactly what Bylaws
//     4.6(a), 6.1, and 8.1 grant. No claim of unilateral final
//     authority on disputes — Bylaws 3.6 reserves that to the Board
//     collectively, and this document does not (and cannot) override
//     the bylaws.
//   - Volunteer/unpaid affirmation — re-states Bylaws Article 16.4 so
//     the document is self-contained for future readers.
//   - Decision-making framework — explicit "bird's-eye view" of which
//     matters the President decides alone, which the President chairs
//     for Board decision, and how disputes flow through the
//     organisation.

export default function PresidentAppointment() {
  return (
    <div className="space-y-5 text-sm text-gray-200 leading-relaxed">

      <div className="rounded-xl p-4 bg-primary-500/5 border-2 border-primary-500/30">
        <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-2">Plain-language summary</p>
        <p>
          The Board of Directors, by unanimous decision, appoints{' '}
          <strong className="text-white">Gokul Prakash</strong> as{' '}
          <strong className="text-white">President</strong> of the Corporation. Gokul remains a Director;
          this is an additional officer appointment, not a replacement of his director seat.
        </p>
        <p className="mt-2">
          The role is held on a <strong className="text-white">strictly volunteer, unpaid basis</strong>{' '}
          and confers no entitlement to compensation now or in the future. The scope of authority is exactly
          what the Club&apos;s bylaws grant — leadership, external representation, signing authority, and
          chairing of Board deliberations — without overriding the Board&apos;s collective decision-making
          powers reserved under Article 3.6.
        </p>
        <p className="mt-2 text-xs text-gray-400 italic">
          Must be signed by all five directors, including the appointee. The appointee&apos;s signature
          evidences acceptance of the office.
        </p>
      </div>

      <div className="rounded-xl bg-white/3 border border-white/10 p-5 space-y-4">

        {/* Section title */}
        <div className="border-b border-white/10 pb-3">
          <div className="text-base font-bold text-white">Director Resolution &amp; Appointment of President</div>
          <div className="text-xs text-gray-400 mt-1">
            Challengers Cricket Club&nbsp;&nbsp;·&nbsp;&nbsp;Canada Not-for-Profit Corporation #1746974-8
          </div>
          <div className="text-xs text-gray-400">
            Adopted by the Board of Directors on the date all five directors sign below.
          </div>
        </div>

        {/* 1. Recitals */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">1. Recitals</p>
          <ol className="list-[lower-alpha] list-inside ml-2 mt-1 space-y-1 text-sm">
            <li>
              The Corporation is a federally incorporated not-for-profit corporation under the{' '}
              <em>Canada Not-for-profit Corporations Act</em> (CNCA), Corporation #1746974-8, dated 12
              November 2025.
            </li>
            <li>
              Article 4.6(a) of the Club&apos;s bylaws contemplates the office of President, who{' '}
              &ldquo;oversees all club operations and represents the club externally.&rdquo;
            </li>
            <li>
              The Board has deliberated and unanimously concluded that{' '}
              <strong className="text-white">Gokul Prakash</strong> is the appropriate candidate to hold
              this office at this time.
            </li>
          </ol>
        </div>

        {/* 2. Resolution */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">2. Resolution</p>
          <p>
            <strong className="text-white">BE IT RESOLVED THAT:</strong>
          </p>
          <ol className="list-[lower-alpha] list-inside ml-2 mt-2 space-y-2 text-sm">
            <li>
              Gokul Prakash is hereby appointed <strong className="text-white">President</strong> of
              Challengers Cricket Club, effective on the date all five directors have signed this
              instrument.
            </li>
            <li>
              The appointment is for an indefinite term, continuing until Gokul resigns, ceases to be a
              Director, or is replaced by ordinary resolution of the Board.
            </li>
            <li>
              Gokul retains his existing Director seat on the federal corporate profile. The President
              title is an officer designation in addition to, and not in substitution for, his
              directorship.
            </li>
            <li>
              The Board confirms that this appointment is unanimous and that Gokul, by signing below,
              accepts the office.
            </li>
          </ol>
        </div>

        {/* 3. Appointee */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">3. The Appointee</p>
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-white/5">
                <tr><td className="px-3 py-2 text-gray-400">Name</td><td className="px-3 py-2 text-white">Gokul Prakash</td></tr>
                <tr><td className="px-3 py-2 text-gray-400">Office</td><td className="px-3 py-2 text-white">President</td></tr>
                <tr><td className="px-3 py-2 text-gray-400">Director status</td><td className="px-3 py-2 text-gray-200">Continuing Director (filed on federal corporate profile)</td></tr>
                <tr><td className="px-3 py-2 text-gray-400">Workspace email</td><td className="px-3 py-2 text-gray-200">gokul@challengerscc.ca</td></tr>
                <tr><td className="px-3 py-2 text-gray-400">Effective date</td><td className="px-3 py-2 text-gray-200">Date all five directors have signed</td></tr>
                <tr><td className="px-3 py-2 text-gray-400">Term</td><td className="px-3 py-2 text-gray-200">Indefinite, terminable per §2(b) above</td></tr>
                <tr><td className="px-3 py-2 text-gray-400">Compensation</td><td className="px-3 py-2 text-gray-200">None — volunteer, unpaid (see §6)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Responsibilities */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">4. Responsibilities of the President</p>
          <p className="mb-2">
            Drawn from the Club&apos;s bylaws (Article 4.6(a), 6.1, 8.1) and refined for operational clarity:
          </p>
          <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
            <li>
              <strong className="text-white">External representation</strong> — speaks for the Club to
              sponsors, partners, the city, leagues, regulators, and media; signs correspondence on behalf
              of the Board.
            </li>
            <li>
              <strong className="text-white">Operational oversight</strong> — ensures Club operations
              (matches, training, finance, members, communications) are progressing and that owners are
              assigned for each area.
            </li>
            <li>
              <strong className="text-white">Board leadership</strong> — calls Board meetings (Article
              6.1), sets agendas, chairs deliberations, and drives matters to a decision.
            </li>
            <li>
              <strong className="text-white">Signing authority</strong> — one of four officers (with
              Vice-President, Secretary, Treasurer) authorised to bind the Corporation under Article 8.1.
              Documents require any two of these signatures.
            </li>
            <li>
              <strong className="text-white">Officer coordination</strong> — works with the Secretary,
              Treasurer, Captains, and any committee chairs to ensure Club business is executed.
            </li>
            <li>
              <strong className="text-white">Continuity</strong> — ensures that records, accounts, and
              relationships are maintained so the Club can continue to operate beyond the current Board.
            </li>
          </ul>
        </div>

        {/* 5. Decision-making framework — the bird's-eye view */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">5. Decision-making framework</p>
          <p className="mb-3 text-sm">
            This section sets out, at a high level, how decisions move through the Corporation so that all
            Directors, Officers, and members understand which matters the President decides directly and
            which matters are reserved to the Board. <strong className="text-white">Nothing in this
            section overrides the bylaws.</strong> Where the bylaws speak, the bylaws govern.
          </p>

          <div className="rounded-lg border border-white/10 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-gray-300">Category</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-300">Who decides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="px-3 py-2">Day-to-day operations (scheduling, communications, vendor coordination, routine spending within an approved budget)</td>
                  <td className="px-3 py-2 text-gray-200">President, in consultation with the relevant officer</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">External representation (sponsor talks, media, partner conversations, league liaison)</td>
                  <td className="px-3 py-2 text-gray-200">President</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Signing of contracts and instruments binding the Corporation</td>
                  <td className="px-3 py-2 text-gray-200">Any two of President, Vice-President, Secretary, Treasurer (Article 8.1)</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Spending or commitments outside an approved budget, or above a threshold the Board sets in its Financial Policy</td>
                  <td className="px-3 py-2 text-gray-200">Board, on motion. President may chair the meeting and recommend.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Disputes between members; complaints raised against Directors, Officers, or volunteers; conflicts of interest</td>
                  <td className="px-3 py-2 text-gray-200">Board, collectively (Article 3.6 and the Conflict of Interest Policy). President chairs the meeting and drafts the proposed resolution.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Suspension or expulsion of a member</td>
                  <td className="px-3 py-2 text-gray-200">Board, under the formal procedure in Article 3.6 (20-day notice, 30-day final decision)</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Appointment or removal of officers, captains, committee chairs</td>
                  <td className="px-3 py-2 text-gray-200">Board, by ordinary resolution</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Adoption or amendment of Club policies (Financial, Squad Selection, Communication, Code of Conduct, etc.)</td>
                  <td className="px-3 py-2 text-gray-200">Board, by ordinary resolution</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Amendment of the bylaws or articles of incorporation</td>
                  <td className="px-3 py-2 text-gray-200">Members, by special resolution; filed with Corporations Canada</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs uppercase tracking-wider text-primary-400 font-bold">How a dispute flows</p>
          <ol className="list-decimal list-inside ml-2 mt-1 space-y-1 text-sm">
            <li>The matter is raised to the President or to any Director.</li>
            <li>The President assesses urgency and decides whether the matter is operational (President resolves and informs the Board) or material (escalated to a Board meeting).</li>
            <li>For material matters, the President calls a Board meeting (Article 6.1), distributes the relevant facts and any documentation, and chairs the deliberation.</li>
            <li>The Board deliberates and votes. The President does not have a casting vote unless the bylaws are subsequently amended to grant one.</li>
            <li>A written Board Resolution captures the decision and is recorded in the Pavilion. The decision is communicated to the affected parties in writing, with reasons.</li>
            <li>Where Article 3.6 (suspension/expulsion) applies, the 20-day notice and 30-day final-decision procedure is followed without abbreviation.</li>
          </ol>

          <p className="mt-3 text-xs italic text-gray-400">
            This framework is descriptive of the bylaws as they stand on the effective date of this
            instrument. If the bylaws are subsequently amended to grant the President additional powers
            (for example, a casting vote on tied Board votes), this framework will be updated in a future
            version of this instrument; until then, the bylaws as currently in force are authoritative.
          </p>
        </div>

        {/* 6. Volunteer, unpaid */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">6. Volunteer, unpaid status</p>
          <p>
            The office of President is held on a strictly{' '}
            <strong className="text-white">volunteer, unpaid</strong> basis. By accepting this appointment,
            Gokul acknowledges and affirms that, in line with Article 16.4 of the bylaws:
          </p>
          <ul className="list-disc list-inside ml-2 mt-2 space-y-1 text-sm">
            <li>holding this office does not, and shall never, give rise to a claim for compensation, fees, honoraria, or remuneration;</li>
            <li>hours invested, work performed, results delivered, and outcomes achieved are all contributed on a volunteer basis and create no entitlement to payment now or in the future;</li>
            <li>this affirmation cannot be circumvented by a future Board resolution or member vote — any retroactive payment for past unpaid service is expressly prohibited;</li>
            <li>reasonable out-of-pocket expenses incurred on Club business may be reimbursed against documented receipts pursuant to the Financial Policy, and any such reimbursement is paid to a personal account of the recipient (never to a corporation or entity controlled by the recipient).</li>
          </ul>
        </div>

        {/* 7. Acceptance */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">7. Acceptance by the Appointee</p>
          <p>
            By signing this instrument below as a Director, Gokul Prakash also accepts the office of
            President on the terms set out herein and affirms the volunteer, unpaid status of the role.
            No separate acceptance letter is required.
          </p>
        </div>

        {/* 8. Reservation of bylaws */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">8. Bylaws govern</p>
          <p>
            Nothing in this instrument modifies the bylaws of the Corporation, the{' '}
            <em>Canada Not-for-profit Corporations Act</em>, or any policy adopted by the Board. In the
            event of any inconsistency between this instrument and the bylaws, the bylaws prevail. If the
            Board wishes to grant the President powers beyond those set out in the bylaws, the proper
            mechanism is a bylaws amendment by special resolution of the members, filed with Corporations
            Canada under CNCA s. 197.
          </p>
        </div>

        {/* 9. Adoption */}
        <div>
          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">9. Adoption</p>
          <p>
            This Resolution and Appointment is adopted by the unanimous signatures of all five Directors
            of the Corporation. The effective date is the date on which the fifth signature is recorded
            in the Pavilion signature ledger.
          </p>
        </div>

      </div>

      <hr className="border-white/10 my-4" />

      <p className="text-xs text-gray-500 italic">
        Document version 1.0 · Effective on the date the fifth director signature is recorded.
        Director-only document; not published publicly. Requires signature by all five directors of the
        Corporation, including the appointee, whose signature also evidences acceptance of the office.
      </p>
    </div>
  );
}
