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
  inline?: 'service-agreement'; // If the body is rendered inline by an inline component
  summary: string;
  whoMustSign: 'all-directors' | 'all-directors-except-conflicted';
  conflictedSigners?: readonly string[]; // workspace emails recused from signing
};

export const GOVERNANCE_DOCS: readonly GovernanceDoc[] = [
  {
    id: 'ip-ownership-acknowledgement',
    version: '1.0',
    title: 'Software & IP Ownership Acknowledgement',
    shortTitle: 'IP Ownership Acknowledgement',
    effective: '2026-05-04',
    publicUrl: '/legal/ip-ownership',
    summary:
      'Records the public acknowledgement that the C3H portal and challengerscc.ca website are owned by Saad Cloud & AI Solutions Inc. The Club operates the platform under a revocable licence at no charge while Mohammed Saad serves as a director. Mohammed Saad declares conflict of interest and abstains from signing.',
    whoMustSign: 'all-directors-except-conflicted',
    conflictedSigners: ['saad@challengerscc.ca'],
  },
  {
    id: 'service-agreement-v1',
    version: '1.0',
    title: 'Software License & Service Agreement (CCC ↔ Saad Cloud & AI Solutions Inc.)',
    shortTitle: 'Service Agreement',
    effective: '2026-05-05',
    inline: 'service-agreement',
    summary:
      'Formalizes the operating terms between Challengers Cricket Club and Saad Cloud & AI Solutions Inc.: revocable licence at no charge, conditional on Mohammed Saad serving as a director; right of withdrawal; data export on termination; what the Club may not do. Signed by all directors. Mohammed Saad signs as the authorized representative of Saad Cloud & AI Solutions Inc.; he separately declares conflict of interest and abstains from signing as a CCC director.',
    whoMustSign: 'all-directors-except-conflicted',
    conflictedSigners: ['saad@challengerscc.ca'],
  },
];

export function findDoc(id: string): GovernanceDoc | undefined {
  return GOVERNANCE_DOCS.find((d) => d.id === id);
}
