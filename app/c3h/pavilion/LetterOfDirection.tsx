// Inline content of the Letter of Direction adding Gokul Prakash and
// Qaiser Qureshi as signing authorities on the Corporation's CIBC
// operating account. Signed by all five directors via the Pavilion.
//
// v2.0 (2026-05-20) — simplified to the minimum content CIBC needs to
// process the request. Removed from v1.0:
//   • personal-identification fields (DOB, home address, mobile) —
//     the bank collects these at the branch
//   • 6 numbered internal-governance clauses (equal authority, dual
//     signatory, monthly statements, etc.) — those are CCC's policies,
//     not the bank's concern
//   • Pavilion / Firestore / governance-ledger footer — internal
//     audit trail, not bank-relevant
// What stayed: corp identity, short volunteer-status sentence, the
// actual direction (Saad existing + Gokul/Qaiser added), one-sentence
// authorization for banking access per CIBC policy, branch ID-check
// requirement.
//
// If this content materially changes again, bump the version in
// governanceDocs.ts to trigger a re-signing cycle.

function FillLine({ label }: { label?: string }) {
  return (
    <span className="inline-block min-w-[180px] border-b border-dotted border-gray-500 pb-0.5">
      {label ? <span className="text-gray-500 italic text-xs">{label}</span> : ' '}
    </span>
  );
}

export default function LetterOfDirection() {
  return (
    <div className="space-y-5 text-sm text-gray-200 leading-relaxed">

      <div className="rounded-xl p-4 bg-primary-500/5 border-2 border-primary-500/30">
        <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-2">Plain-language summary</p>
        <p>
          This Letter directs CIBC to add <strong className="text-white">Gokul Prakash</strong> and{' '}
          <strong className="text-white">Qaiser Qureshi</strong> as signing authorities on the Club&apos;s operating
          account (transit <strong>04582</strong>, account ending <strong>****1517</strong>).{' '}
          <strong className="text-white">Mohammed Saad</strong> remains as an existing signing authority.
        </p>
        <p className="mt-2">
          All three serve in a volunteer capacity. Personal identification (DOB, address, mobile) is collected by the
          bank at the branch — not in this Letter.
        </p>
        <p className="mt-2 text-xs text-gray-400 italic">
          All five directors of the Corporation must sign this Letter before it is submitted to CIBC.
        </p>
      </div>

      {/* ── Letter body ────────────────────────────────────────────────── */}

      <div className="rounded-xl bg-white/3 border border-white/10 p-5 space-y-4">

        {/* Letterhead-style header */}
        <div className="border-b border-white/10 pb-3">
          <div className="text-base font-bold text-white">Challengers Cricket Club</div>
          <div className="text-xs text-gray-400 mt-1 leading-relaxed">
            Canada Not-for-Profit Corporation #1746974-8 (incorporated 12 November 2025)<br />
            Registered office: 790 Capulet Lane, London, ON&nbsp;&nbsp;N6H 0J8<br />
            contact@challengerscc.ca&nbsp;&nbsp;·&nbsp;&nbsp;challengerscc.ca
          </div>
        </div>

        <div className="text-right text-xs text-gray-300">
          Date: <strong className="text-white">May 20, 2026</strong>
        </div>

        <div className="text-xs">
          <strong className="text-white">Canadian Imperial Bank of Commerce</strong><br />
          Branch: <FillLine label="branch name" /><br />
          Address: <FillLine label="branch street address" />
        </div>

        <div className="rounded-md bg-primary-500/10 border-l-2 border-primary-500 px-3 py-2 text-xs">
          <strong className="text-primary-300">Re:</strong>&nbsp;
          <span className="text-white font-semibold">Letter of Direction — Addition of Signing Authorities</span><br />
          <span className="text-gray-300">Account ending in <strong className="text-white">****1517</strong> (transit <strong className="text-white">04582</strong>) — Challengers Cricket Club</span>
        </div>

        <p>To Whom It May Concern,</p>

        <p>
          This letter is provided by the Board of Directors of <strong className="text-white">Challengers Cricket
          Club</strong> (the &ldquo;Corporation&rdquo;), a federal Canada Not-for-Profit Corporation incorporated under
          the <em>Canada Not-for-Profit Corporations Act</em> (Corporation #1746974-8), having its registered office at
          790 Capulet Lane, London, Ontario&nbsp;&nbsp;N6H 0J8.
        </p>

        <p className="text-sm">
          <strong className="text-white">Challengers Cricket Club is a volunteer-run not-for-profit
          corporation.</strong> The individuals named in this Letter serve solely in volunteer capacities and receive
          no salary, wages, fees, commissions, or other compensation from the Corporation.
        </p>

        <p>
          The undersigned, being all of the directors of the Corporation, hereby <strong className="text-white">direct
          and authorize</strong> the Canadian Imperial Bank of Commerce to update the signing authorities on the
          operating account identified above as follows:
        </p>

        <ul className="list-none space-y-2 ml-2 text-sm">
          <li>
            <strong className="text-white">Mohammed Saad</strong> — shall remain as an existing signing authority on
            the account.
          </li>
          <li>
            <strong className="text-white">Gokul Prakash</strong> — to be added as a signing authority.
          </li>
          <li>
            <strong className="text-white">Qaiser Qureshi</strong> — to be added as a signing authority.
          </li>
        </ul>

        <p>
          The individuals listed above are the authorized signing authorities of the Corporation. The Board further
          authorizes the Canadian Imperial Bank of Commerce to provide each approved signing authority with banking
          access, debit card access, and online banking services in accordance with CIBC&apos;s standard policies and
          procedures.
        </p>

        <p>
          Each individual being added (Gokul Prakash and Qaiser Qureshi) will attend a CIBC branch in person and
          provide government-issued photo identification and any documentation required by the Bank before their
          access is activated.
        </p>

      </div>

      <hr className="border-white/10 my-4" />

      <p className="text-xs text-gray-500 italic">
        Document version 2.0 · Effective 20 May 2026. Requires signatures of all five directors of the Corporation
        before submission to CIBC.
      </p>
    </div>
  );
}
