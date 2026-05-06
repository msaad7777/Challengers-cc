"use client";

import { useEffect } from 'react';
import DocumentSignBlock from '../_shared/DocumentSignBlock';

const DOC_ID = 'coi-declaration';
const DOC_VERSION = '1.0';
const COLLECTION = 'coi_declarations';

const currentYear = String(new Date().getFullYear());

type ExtraFieldsProps = {
  extraData: Record<string, unknown>;
  setExtra: (key: string, value: unknown) => void;
};

function COIExtraFields({ extraData, setExtra }: ExtraFieldsProps) {
  // Initialize year to current year on mount if not yet set.
  useEffect(() => {
    if (extraData.year === undefined) setExtra('year', currentYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const year = (extraData.year as string | undefined) ?? currentYear;
  const decl = (extraData.conflictDeclarations as string | undefined) ?? '';

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-400 block mb-1">Declaration year</label>
        <input
          type="text"
          value={year}
          onChange={(e) => setExtra('year', e.target.value)}
          placeholder={currentYear}
          className="w-full sm:w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Potential conflicts of interest{' '}
          <span className="text-gray-500">
            (list businesses you own, family members with Club ties, sponsorships you provide, or write &ldquo;none&rdquo;)
          </span>
        </label>
        <textarea
          rows={4}
          value={decl}
          onChange={(e) => setExtra('conflictDeclarations', e.target.value)}
          placeholder='e.g. "I am sole shareholder of [Company] which licenses software to the Club" or "none"'
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
      </div>
    </div>
  );
}

export default function SignBlock() {
  return (
    <DocumentSignBlock
      docId={DOC_ID}
      docVersion={DOC_VERSION}
      collection={COLLECTION}
      validateExtra={(extra) => {
        const decl = ((extra.conflictDeclarations as string | undefined) ?? '').trim();
        if (decl.length < 1) {
          return 'Please describe any potential conflicts of interest, or write "none".';
        }
        const year = ((extra.year as string | undefined) ?? '').trim();
        if (!/^\d{4}$/.test(year)) {
          return 'Please enter the declaration year as four digits (e.g. 2026).';
        }
        return null;
      }}
      renderExtraFields={(props) => <COIExtraFields {...props} />}
      renderSignedExtra={(record) => {
        const year = record.year as string | undefined;
        const decl = record.conflictDeclarations as string | undefined;
        return (
          <div className="space-y-2">
            <div>
              <span className="text-gray-400 print:text-gray-700">Declaration year: </span>
              <span className="text-white print:text-black">{year ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-700 block mb-1">Disclosed conflicts:</span>
              <p className="text-white print:text-black whitespace-pre-wrap">{decl ?? '—'}</p>
            </div>
          </div>
        );
      }}
    />
  );
}
