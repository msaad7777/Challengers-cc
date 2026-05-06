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
  conflictedSigners?: readonly string[]; // workspace emails recused from CCC-side signing
  // True for two-party agreements where Saad Cloud & AI Solutions Inc. is
  // the counterparty (the Service Agreement). Triggers a separate
  // "SACS authorized representative" signing track on the Pavilion,
  // signed by Saad as the sole shareholder/director of SACS. The CCC
  // recusal still applies on the director-approval side; this track is
  // separate.
  requiresSacsSignature?: boolean;
};

// Saad signs as SACS authorized representative — sole shareholder &
// director of Saad Cloud & AI Solutions Inc. Workspace email used as
// the canonical signer identity (mirrors the director roster pattern).
export const SACS_OFFICER = {
  workspaceEmail: 'saad@challengerscc.ca',
  name: 'Mohammed Saad',
  role: 'Sole shareholder & director, Saad Cloud & AI Solutions Inc.',
};

export const GOVERNANCE_DOCS: readonly GovernanceDoc[] = [
  {
    id: 'ip-ownership-acknowledgement',
    version: '1.1',
    title: 'Software & IP Ownership Acknowledgement',
    shortTitle: 'IP Ownership Acknowledgement',
    effective: '2026-05-06',
    publicUrl: '/legal/ip-ownership',
    summary:
      'Records the public acknowledgement that the C3H portal and challengerscc.ca website are owned by Saad Cloud & AI Solutions Inc. The Club operates the platform under a revocable licence at no charge while Mohammed Saad serves as a director. v1.1 adds explicit Period-1 (Nov 2025 to May 4, 2026: personal authorship by Mohammed Saad) and Period-2 (May 4, 2026 onward: corporate ownership by SACS) timeline, ratifying the pre-incorporation work and closing any implied-license argument. Mohammed Saad declares conflict of interest and abstains from signing.',
    whoMustSign: 'all-directors-except-conflicted',
    conflictedSigners: ['saad@challengerscc.ca'],
  },
  {
    id: 'service-agreement-v1',
    version: '1.1',
    title: 'Software License & Service Agreement (CCC ↔ Saad Cloud & AI Solutions Inc.)',
    shortTitle: 'Service Agreement',
    effective: '2026-05-06',
    inline: 'service-agreement',
    summary:
      'Two-party contract between Challengers Cricket Club and Saad Cloud & AI Solutions Inc. CCC side: 4 non-conflicted directors approve on behalf of the Club (Saad recused, declared conflict of interest). SACS side: Mohammed Saad signs as the sole shareholder and director of Saad Cloud & AI Solutions Inc. Both signatures required for the agreement to take effect. v1.1 adds the pre-incorporation timeline acknowledgement (Section 3) covering the Nov 2025 — May 4, 2026 personal authorship period.',
    whoMustSign: 'all-directors-except-conflicted',
    conflictedSigners: ['saad@challengerscc.ca'],
    requiresSacsSignature: true,
  },
];

export function findDoc(id: string): GovernanceDoc | undefined {
  return GOVERNANCE_DOCS.find((d) => d.id === id);
}
