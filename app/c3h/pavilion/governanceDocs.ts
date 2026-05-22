// Governance documents that directors can acknowledge or sign in the
// Pavilion. Each document has a stable `id` (do NOT change after the
// first signature is collected) and a `version`. If a document is
// materially amended, bump the version — that triggers a re-signing
// cycle.

export type GovernanceDoc = {
  id: string;
  version: string;
  title: string;
  shortTitle: string;
  effective: string; // ISO date
  publicUrl?: string; // If the document text is published on /legal/*
  inline?: 'technology-governance-record-2026' | 'lod-cibc-gokul-qaiser-2026'; // If the body is rendered inline by an inline component
  // If set, the Pavilion shows a "Print / export signed PDF" button that
  // links to this route. The route is responsible for pulling sigs from
  // governance_signatures and rendering a print-ready white-paper version
  // of the document. Currently used by the LoD only.
  printUrl?: string;
  summary: string;
  whoMustSign: 'all-directors' | 'all-directors-except-conflicted';
  conflictedSigners?: readonly string[]; // workspace emails recused from CCC-side signing
};

export const GOVERNANCE_DOCS: readonly GovernanceDoc[] = [
  {
    id: 'technology-governance-record-2026',
    version: '1.0',
    title: 'Technology Governance Record',
    shortTitle: 'Technology Governance Record',
    effective: '2026-05-21',
    inline: 'technology-governance-record-2026',
    summary:
      'Director-only neutral record of how the Club\'s digital infrastructure is currently organised: which assets sit on Club-owned accounts (domain, Workspace, Vercel, Firebase, Stripe, member data) and which sit on Mohammed Saad\'s personal account (the source-code repository). Records the continuity arrangements should the original developer ever step away. Intentionally does NOT make ownership claims either way; defers ownership determination to a separate future agreement if and when needed.',
    whoMustSign: 'all-directors',
  },
  {
    id: 'lod-cibc-gokul-qaiser-2026',
    version: '1.0',
    title: 'Letter of Direction — CIBC Signing Authority Panel (Gokul Prakash + Qaiser Qureshi)',
    shortTitle: 'Letter of Direction — CIBC',
    effective: '2026-05-20',
    inline: 'lod-cibc-gokul-qaiser-2026',
    printUrl: '/c3h/pavilion/print/lod-cibc',
    summary:
      'Directs CIBC to add Gokul Prakash (Director) and Qaiser Qureshi (Treasurer, non-director officer) to the three-person signing authority panel on the Club’s operating account (transit 04582, account ending ****1517), in addition to Mohammed Saad who is already on file. Both new authorities serve in a strictly volunteer capacity. The account continues to operate under the Club’s dual-signatory governance policy. Must be signed by all five directors before being submitted to CIBC.',
    whoMustSign: 'all-directors',
  },
];

export function findDoc(id: string): GovernanceDoc | undefined {
  return GOVERNANCE_DOCS.find((d) => d.id === id);
}
