"use client";

import DocumentSignBlock from '../_shared/DocumentSignBlock';

const DOC_ID = 'code-of-conduct';
const DOC_VERSION = '1.0';
const COLLECTION = 'code_of_conduct_signatures';

export default function SignBlock() {
  return (
    <DocumentSignBlock
      docId={DOC_ID}
      docVersion={DOC_VERSION}
      collection={COLLECTION}
    />
  );
}
