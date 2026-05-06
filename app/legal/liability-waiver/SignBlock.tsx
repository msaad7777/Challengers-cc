"use client";

import DocumentSignBlock, { type SignatureRecord } from '../_shared/DocumentSignBlock';

const DOC_ID = 'liability-waiver';
const DOC_VERSION = '1.0';
const COLLECTION = 'liability_waiver_signatures';

// 18-or-over check from a YYYY-MM-DD DOB string. Returns true if
// the person is at least 18 years old as of today, false otherwise.
// Returns null if the input isn't a valid date.
function isAdult(dob: string | undefined): boolean | null {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 18;
}

export default function SignBlock() {
  return (
    <DocumentSignBlock
      docId={DOC_ID}
      docVersion={DOC_VERSION}
      collection={COLLECTION}
      validateExtra={(extra) => {
        const dob = extra.dateOfBirth as string | undefined;
        const emergency = extra.emergencyContact as string | undefined;
        if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
          return 'Please enter your date of birth as YYYY-MM-DD.';
        }
        if (!emergency || emergency.trim().length < 5) {
          return 'Please enter an emergency contact name and phone number.';
        }
        const adult = isAdult(dob);
        if (adult === false) {
          const guardianName = (extra.guardianName as string | undefined) ?? '';
          const guardianRelationship = (extra.guardianRelationship as string | undefined) ?? '';
          if (guardianName.trim().length < 2) {
            return 'Player is under 18. Please enter parent/guardian full name.';
          }
          if (guardianRelationship.trim().length < 2) {
            return 'Please describe the parent/guardian relationship to the player.';
          }
        }
        return null;
      }}
      renderExtraFields={({ extraData, setExtra }) => {
        const dob = extraData.dateOfBirth as string | undefined;
        const adult = isAdult(dob);
        return (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Date of Birth (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={dob ?? ''}
                  onChange={(e) => setExtra('dateOfBirth', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                />
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
              </div>
            </div>

            {adult === false && (
              <div className="rounded-lg bg-amber-500/5 border border-amber-500/30 p-3">
                <p className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-2">Player is under 18 — parent/guardian required</p>
                <p className="text-xs text-amber-200 mb-3">
                  By providing these details, the parent/guardian confirms they have read and understood the
                  Waiver and consent to the minor&apos;s participation. The signature below should be the parent/guardian&apos;s
                  signature.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Parent/Guardian Full Name</label>
                    <input
                      type="text"
                      value={(extraData.guardianName as string | undefined) ?? ''}
                      onChange={(e) => setExtra('guardianName', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Relationship to Player</label>
                    <input
                      type="text"
                      value={(extraData.guardianRelationship as string | undefined) ?? ''}
                      onChange={(e) => setExtra('guardianRelationship', e.target.value)}
                      placeholder="Mother, Father, Legal Guardian"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }}
      renderSignedExtra={(record) => {
        const dob = record.dateOfBirth as string | undefined;
        const emergency = record.emergencyContact as string | undefined;
        const guardianName = record.guardianName as string | undefined;
        const guardianRelationship = record.guardianRelationship as string | undefined;
        return (
          <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <span className="text-gray-400 print:text-gray-700">Date of Birth: </span>
              <span className="text-white print:text-black">{dob ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-700">Emergency Contact: </span>
              <span className="text-white print:text-black">{emergency ?? '—'}</span>
            </div>
            {guardianName && (
              <>
                <div>
                  <span className="text-gray-400 print:text-gray-700">Parent/Guardian: </span>
                  <span className="text-white print:text-black">{guardianName}</span>
                </div>
                <div>
                  <span className="text-gray-400 print:text-gray-700">Relationship: </span>
                  <span className="text-white print:text-black">{guardianRelationship ?? '—'}</span>
                </div>
              </>
            )}
          </div>
        );
      }}
    />
  );
}
