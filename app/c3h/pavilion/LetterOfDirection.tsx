// Inline content of the Letter of Direction adding a single new signing
// authority to the Corporation's CIBC operating account. The same
// component renders both the Gokul Prakash and Qaiser Qureshi LoDs;
// they differ only in the recipient block and a small amount of role
// language. Signed by all five directors via the Pavilion (with
// signatures from the prior combined Gokul + Qaiser LoD carried forward
// for directors who already signed it).
//
// Personal-detail fields (DOB / home address / mobile) are intentionally
// left blank — the recipient writes those in at the CIBC branch when
// they present themselves with photo ID. The Letter is what the
// Corporation directs; the personal verification is between each
// individual and the bank.

type Recipient = 'gokul' | 'qaiser';

type RecipientProfile = {
  name: string;
  email: string;
  roleWithCorporation: string;
  effectiveDate: string;
};

const RECIPIENTS: Record<Recipient, RecipientProfile> = {
  gokul: {
    name: 'Gokul Prakash',
    email: 'gokulprakash663@gmail.com',
    roleWithCorporation: 'Director',
    effectiveDate: 'June 1, 2026',
  },
  qaiser: {
    name: 'Qaiser Qureshi',
    email: 'qureshiqaiser007@gmail.com',
    roleWithCorporation: 'Treasurer (non-director officer)',
    effectiveDate: 'June 1, 2026',
  },
};

function FillLine({ label }: { label?: string }) {
  return (
    <span className="inline-block min-w-[180px] border-b border-dotted border-gray-500 pb-0.5">
      {label ? <span className="text-gray-500 italic text-xs">{label}</span> : ' '}
    </span>
  );
}

export default function LetterOfDirection({ recipient }: { recipient: Recipient }) {
  const r = RECIPIENTS[recipient];

  return (
    <div className="space-y-5 text-sm text-gray-200 leading-relaxed">

      <div className="rounded-xl p-4 bg-primary-500/5 border-2 border-primary-500/30">
        <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-2">Plain-language summary</p>
        <p>
          This Letter directs the Canadian Imperial Bank of Commerce (CIBC) to <strong className="text-white">add a new
          signing authority</strong> to the Corporation&apos;s operating account (transit <strong>04582</strong>,
          account ending <strong>****1517</strong>):
        </p>
        <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
          <li><strong className="text-white">{r.name}</strong> — {r.roleWithCorporation}, volunteer capacity.</li>
        </ul>
        <p className="mt-2">
          Mohammed Saad is already on file with the bank as a signing authority and remains on the panel. The account
          continues to operate under the Corporation&apos;s <strong className="text-white">dual-signatory governance
          policy</strong>. The new authority receives their own debit card, their own online-banking credentials, and
          their own OTP phone number. No signing authority acts in a paid or employee capacity.
        </p>
        <p className="mt-2 text-xs text-gray-400 italic">
          All five directors of the Corporation must sign this Letter before it is submitted to CIBC. Signatures on the
          prior combined Letter of Direction (Gokul + Qaiser) carry forward to this Letter; directors who already signed
          the combined Letter do not need to re-sign.
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
          Date: <strong className="text-white">{r.effectiveDate}</strong>
        </div>

        <div className="text-xs">
          <strong className="text-white">Canadian Imperial Bank of Commerce</strong><br />
          Branch: <FillLine label="branch name" /><br />
          Address: <FillLine label="branch street address" />
        </div>

        <div className="rounded-md bg-primary-500/10 border-l-2 border-primary-500 px-3 py-2 text-xs">
          <strong className="text-primary-300">Re:</strong>&nbsp;
          <span className="text-white font-semibold">Letter of Direction — Addition of Signing Authority ({r.name})</span><br />
          <span className="text-gray-300">Account ending in <strong className="text-white">****1517</strong> (transit <strong className="text-white">04582</strong>) — Challengers Cricket Club</span>
        </div>

        <p>To Whom It May Concern,</p>

        <p>
          This letter is provided by the Board of Directors of <strong className="text-white">Challengers Cricket
          Club</strong> (the &ldquo;Corporation&rdquo;), a federal Canada Not-for-Profit Corporation incorporated under
          the <em>Canada Not-for-Profit Corporations Act</em> (Corporation #1746974-8), having its registered office at
          790 Capulet Lane, London, Ontario&nbsp;&nbsp;N6H 0J8. The Corporation is a volunteer-run
          not-for-profit organization; it has no employees, issues no payroll, and pays no salary, fee, or other
          compensation to any signing authority, director, or officer.
        </p>

        <p>
          The undersigned, being all of the directors of the Corporation, hereby <strong className="text-white">direct
          and authorize</strong> the Canadian Imperial Bank of Commerce to establish, effective upon receipt and
          verification by the Bank, the following signing-authority panel on the operating account identified above:
        </p>

        {/* ── Authority block 1: Saad ─────────────────────────────────── */}
        <div className="rounded-lg border border-white/10 bg-white/3 p-3 text-xs">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2 pb-2 border-b border-white/10">
            <div className="font-bold text-white text-sm">Mohammed Saad</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Existing — already on file</div>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-y-1">
            <div className="text-gray-400">Role with Corporation</div><div className="text-gray-200">Director</div>
            <div className="text-gray-400">Capacity</div><div className="text-gray-200">Volunteer (uncompensated)</div>
            <div className="text-gray-400">Identification</div><div className="text-gray-200">Already on file with CIBC — no further verification requested.</div>
          </div>
        </div>

        {/* ── Authority block 2: New recipient ─────────────────────────── */}
        <div className="rounded-lg border border-primary-500/30 bg-primary-500/5 p-3 text-xs">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2 pb-2 border-b border-primary-500/20">
            <div className="font-bold text-white text-sm">{r.name}</div>
            <div className="text-[10px] uppercase tracking-wider text-primary-300 font-semibold">Being added</div>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-y-1">
            <div className="text-gray-400">Role with Corporation</div><div className="text-gray-200">{r.roleWithCorporation}</div>
            <div className="text-gray-400">Capacity</div><div className="text-gray-200">Volunteer (uncompensated)</div>
            <div className="text-gray-400">Full legal name</div><div><FillLine label="as shown on government photo ID" /></div>
            <div className="text-gray-400">Date of birth</div><div><FillLine label="YYYY-MM-DD" /></div>
            <div className="text-gray-400">Home address</div><div><FillLine label="full mailing address" /></div>
            <div className="text-gray-400">Mobile (OTP)</div><div><FillLine label="mobile number" /></div>
            <div className="text-gray-400">Email</div><div className="text-gray-200">{r.email}</div>
          </div>
        </div>

        {/* ── Volunteer-capacity callout ──────────────────────────────── */}
        <div className="rounded-md bg-accent-500/5 border-l-2 border-accent-500/60 px-3 py-2 text-xs leading-relaxed">
          <strong className="text-accent-300">Volunteer capacity.</strong> Challengers Cricket Club is a not-for-profit
          corporation operated entirely by unpaid volunteers in accordance with Article 5 of the Corporation&apos;s
          Bylaws. Each individual named above — Mohammed Saad and {r.name} — serves the Corporation strictly as a
          volunteer, without compensation, salary, fees, or any other form of payment, and is not an employee of the
          Corporation. Each acts in good faith on behalf of the Corporation in furtherance of its community-sport
          purposes and is bound by the Corporation&apos;s Bylaws, Financial Policy, Code of Conduct, and Conflict of
          Interest Policy.
        </div>

        <p>The Corporation further confirms the following with respect to this account:</p>

        <ol className="list-decimal list-inside ml-2 space-y-2 text-sm">
          <li>
            <strong className="text-white">Equal and optional signing authorities.</strong> Both named signing
            authorities — Mohammed Saad and {r.name} — are equal and optional signing authorities on this account.
            Each holds <strong className="text-white">equivalent legal authority and equivalent operational
            rights</strong> to act on, maintain, and transact on the account on behalf of the Corporation. No signing
            authority is senior, subordinate, or in any way superior to any other; the panel members are
            interchangeable in standing.
          </li>
          <li>
            <strong className="text-white">Separate cards, credentials, and OTPs.</strong> Each signing authority
            shall be issued (a) their own separate physical debit card linked to the account, (b) their own separate
            online-banking credentials (username and password), and (c) their own separate one-time passcode (OTP)
            destination set to their personal registered mobile number. No signing authority shall share, use, or
            have access to any other signing authority&apos;s card or credentials. Each authority operates
            independently in their own login session.
          </li>
          <li>
            <strong className="text-white">Dual-signatory governance policy.</strong> The account operates under a
            dual-signatory governance policy. No single signing authority shall have unilateral transaction rights
            beyond ordinary day-to-day operating disbursements as defined in the Corporation&apos;s Financial Policy.
            All material transactions are subject to the Board&apos;s internal approval policy.
          </li>
          <li>
            <strong className="text-white">Monthly statements and Treasurer responsibility.</strong> Monthly account
            statements shall be made available to all directors of the Corporation as part of its standard governance
            practice. The Treasurer of the Corporation is the officer responsible for reviewing those statements and
            reporting to the Board.
          </li>
          <li>
            <strong className="text-white">Additive direction.</strong> This Letter of Direction is additive with
            respect to {r.name}; it does not displace Mohammed Saad&apos;s existing signing authority. Any future
            removal or replacement of a signing authority will be effected by a separate written direction signed by
            all then-current directors of the Corporation.
          </li>
          <li>
            <strong className="text-white">CIBC display behaviour.</strong> CIBC display behaviour with respect to
            transaction-initiator names on account statements (where the name of the authority who initiated a
            transaction may be shown) is acknowledged by the Corporation as a bank-side display convention; the
            operating account remains, in fact and in law, the property and operating account of the Corporation,
            not of any individual signing authority.
          </li>
        </ol>

        <p>
          The individual being added ({r.name}) will present themselves at a CIBC branch with valid government-issued
          photo identification to complete any bank-side verification required prior to their access being activated.
        </p>

        <p className="text-xs text-gray-400 italic pt-2 border-t border-white/10">
          Signed electronically by the directors of the Corporation through the Pavilion governance ledger of
          Challengers Cricket Club. Signature records — including each signer&apos;s name, role, workspace email,
          server timestamp, and signature image — are appended to the Club&apos;s Firestore <code>governance_signatures</code>{' '}
          collection. Issued under seal of the Corporation, in accordance with the Bylaws adopted 25 February 2026
          (rev. 8 May 2026). For verification of director status please consult the federal corporate profile filed
          with Corporations Canada under Corporation #1746974-8, or contact the Corporation at
          contact@challengerscc.ca.
        </p>

      </div>

      <hr className="border-white/10 my-4" />

      <p className="text-xs text-gray-500 italic">
        Document version 1.0 · Effective {r.effectiveDate}. Requires signatures of all five directors of the
        Corporation before submission to CIBC. {r.name} will present this Letter, together with government photo ID,
        at a CIBC branch to complete bank-side verification.
      </p>
    </div>
  );
}
