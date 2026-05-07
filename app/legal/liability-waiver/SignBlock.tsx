"use client";

import DocumentSignBlock from '../_shared/DocumentSignBlock';

const DOC_ID = 'liability-waiver';
// v1.1 (2026-05-07) — PII reduction. Removed Date of Birth field
// (unnecessarily sensitive — Bylaws Article 3.1 currently restricts
// membership to adults). Replaced with a simple "I am 18+" checkbox.
// Emergency contact remains — it's genuinely useful if a player is
// injured during play.
//
// Existing v1.0 records (with DOB) remain valid as their original
// record. They're not asked to re-sign; the historical DOB stays
// in their record but is no longer collected from new signers.
//
// Youth programs (per Bylaws Art. 3.1 "minors with parental consent
// under specific programs") will use a separate signing flow with
// dedicated parent/guardian fields when the Club introduces them.
const DOC_VERSION = '1.1';
const COLLECTION = 'liability_waiver_signatures';

export default function SignBlock() {
  return (
    <DocumentSignBlock
      docId={DOC_ID}
      docVersion={DOC_VERSION}
      collection={COLLECTION}
      validateExtra={(extra) => {
        const isAdult = Boolean(extra.isAdult);
        const emergency = extra.emergencyContact as string | undefined;
        if (!isAdult) {
          return 'Please confirm you are 18 years of age or older. The Club is currently adult-only.';
        }
        if (!emergency || emergency.trim().length < 5) {
          return 'Please enter an emergency contact name and phone number.';
        }
        return null;
      }}
      renderExtraFields={({ extraData, setExtra }) => (
        <div className="space-y-4">
          <div className="rounded-lg p-3 bg-white/5 border border-white/10">
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(extraData.isAdult)}
                onChange={(e) => setExtra('isAdult', e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-gray-200">
                <strong className="text-white">I confirm I am 18 years of age or older.</strong>
                {' '}<span className="text-gray-500">CCC is currently an adult-only club; youth programs will use a separate parent/guardian-co-signed flow when introduced.</span>
              </span>
            </label>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Emergency Contact Name &amp; Phone</label>
            <input
              type="text"
              value={(extraData.emergencyContact as string | undefined) ?? ''}
              onChange={(e) => setExtra('emergencyContact', e.target.value)}
              placeholder="e.g. Jane Doe — +1 519 555 0123"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            />
            <p className="text-[10px] text-gray-500 mt-1 italic">
              Used only by Club captains / board members to contact your emergency contact in case of injury during a Club activity. Not shared with sponsors, not used for marketing.
            </p>
          </div>
        </div>
      )}
      renderSignedExtra={(record) => {
        const emergency = record.emergencyContact as string | undefined;
        const isAdult = record.isAdult as boolean | undefined;
        // Legacy: v1.0 records captured DOB. Display if present so
        // existing signers can still see their own historical record.
        const dob = record.dateOfBirth as string | undefined;
        return (
          <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
            {isAdult !== undefined && (
              <div>
                <span className="text-gray-400 print:text-gray-700">Age confirmation: </span>
                <span className="text-white print:text-black">{isAdult ? '18+ confirmed' : 'Not confirmed'}</span>
              </div>
            )}
            {dob && (
              <div>
                <span className="text-gray-400 print:text-gray-700">Date of Birth (legacy v1.0): </span>
                <span className="text-white print:text-black">{dob}</span>
              </div>
            )}
            <div>
              <span className="text-gray-400 print:text-gray-700">Emergency Contact: </span>
              <span className="text-white print:text-black">{emergency ?? '—'}</span>
            </div>
          </div>
        );
      }}
    />
  );
}
