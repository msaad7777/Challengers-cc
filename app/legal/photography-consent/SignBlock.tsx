"use client";

import DocumentSignBlock from '../_shared/DocumentSignBlock';

const DOC_ID = 'photography-consent';
const DOC_VERSION = '1.0';
const COLLECTION = 'photography_consent_signatures';

export default function SignBlock() {
  return (
    <DocumentSignBlock
      docId={DOC_ID}
      docVersion={DOC_VERSION}
      collection={COLLECTION}
      renderExtraFields={({ extraData, setExtra }) => (
        <div className="rounded-lg p-3 bg-white/5 border border-white/10">
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(extraData.optOut)}
              onChange={(e) => setExtra('optOut', e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-gray-200">
              <strong className="text-white">Opt out:</strong> I do <em>not</em> consent to my photograph or video being used in
              Club promotional materials. (Leave unchecked to grant permission.)
            </span>
          </label>
        </div>
      )}
      renderSignedExtra={(record) => {
        const optOut = Boolean(record.optOut);
        return (
          <p>
            <strong className="text-white print:text-black">Photo / video use: </strong>
            {optOut ? (
              <span className="text-amber-300 print:text-amber-700">Opted out</span>
            ) : (
              <span className="text-primary-300 print:text-primary-700">Permission granted</span>
            )}
          </p>
        );
      }}
    />
  );
}
