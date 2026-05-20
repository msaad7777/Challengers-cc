// Governance documents that directors can sign in the Pavilion.
// Each document has a stable `id` (do NOT change after the first signature
// is collected) and a `version`. If a document is materially amended,
// bump the version — that triggers a re-signing cycle.

export type GovernanceDoc = {
  id: string;
  version: string;
  title: string;
  shortTitle: string;
  effective: string; // ISO date
  publicUrl?: string; // If the document text is published on /legal/*
  inline?: 'service-agreement' | 'lod-cibc-gokul-qaiser-2026'; // If the body is rendered inline by an inline component
  // If set, the Pavilion shows a "Print / export signed PDF" button that
  // links to this route. The route is responsible for pulling sigs from
  // governance_signatures and rendering a print-ready white-paper version
  // of the document. Currently used by the LoD only.
  printUrl?: string;
  summary: string;
  whoMustSign: 'all-directors' | 'all-directors-except-conflicted';
  conflictedSigners?: readonly string[]; // workspace emails recused from CCC-side signing
  // True for two-party agreements where Mohammed Saad personally is
  // the licensor / counterparty. Triggers a separate "Licensor signature"
  // track on the Pavilion, signed by Saad in his personal capacity as
  // the IP owner and licensor. The CCC director-recusal still applies
  // on the Club's approval side; this licensor track is separate.
  requiresLicensorSignature?: boolean;
};

// Saad signs as the personal licensor / IP owner. He authored every
// line of the platform under Copyright Act §13(1) and grants the Club
// a revocable licence under the Software Licence Agreement.
export const LICENSOR = {
  workspaceEmail: 'saad@challengerscc.ca',
  name: 'Mohammed Saad',
  role: 'Author and copyright owner of the platform',
};

export const GOVERNANCE_DOCS: readonly GovernanceDoc[] = [
  {
    id: 'ip-ownership-acknowledgement',
    version: '2.0',
    title: 'Software & IP Ownership Acknowledgement',
    shortTitle: 'IP Ownership Acknowledgement',
    effective: '2026-05-06',
    publicUrl: '/legal/ip-ownership',
    summary:
      'Records the public acknowledgement that every line of the C3H portal and challengerscc.ca website was authored by Mohammed Saad personally and is owned by him personally under Copyright Act §13(1). The Club operates the platform under a revocable licence at no charge for as long as Mohammed Saad serves as a director, with the right of withdrawal reserved by him. Mohammed Saad declares conflict of interest and abstains from signing on behalf of CCC.',
    whoMustSign: 'all-directors-except-conflicted',
    conflictedSigners: ['saad@challengerscc.ca'],
  },
  {
    id: 'service-agreement-v1',
    version: '2.0',
    title: 'Software Licence Agreement (Mohammed Saad ↔ Challengers Cricket Club)',
    shortTitle: 'Software Licence Agreement',
    effective: '2026-05-06',
    inline: 'service-agreement',
    summary:
      'Two-party agreement between Mohammed Saad (licensor and copyright owner) and Challengers Cricket Club (licensee). CCC side: 4 non-conflicted directors approve on behalf of the Club (Saad recused, conflict of interest declared). Licensor side: Mohammed Saad signs personally. Both signatures required for the agreement to take effect.',
    whoMustSign: 'all-directors-except-conflicted',
    conflictedSigners: ['saad@challengerscc.ca'],
    requiresLicensorSignature: true,
  },
  {
    id: 'lod-cibc-gokul-qaiser-2026',
    version: '2.0',
    title: 'Letter of Direction — CIBC Signing Authorities (Gokul Prakash + Qaiser Qureshi)',
    shortTitle: 'Letter of Direction — CIBC',
    effective: '2026-05-20',
    inline: 'lod-cibc-gokul-qaiser-2026',
    printUrl: '/c3h/pavilion/print/lod-cibc',
    summary:
      'Short, bank-focused Letter directing CIBC to add Gokul Prakash and Qaiser Qureshi as signing authorities on the Club\'s operating account (transit 04582, account ending ****1517); Mohammed Saad remains as an existing signing authority. Confirms the Club is a volunteer-run NFP with no employment relationship to any signing authority. Bank collects personal identification at the branch — no DOB / home address / mobile included in the Letter. Must be signed by all five directors before being submitted. (v2.0 simplifies the v1.0 draft, which included internal governance clauses CIBC doesn\'t need.)',
    whoMustSign: 'all-directors',
  },
];

export function findDoc(id: string): GovernanceDoc | undefined {
  return GOVERNANCE_DOCS.find((d) => d.id === id);
}
