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
  inline?:
    | 'technology-governance-record-2026'
    | 'lod-cibc-gokul-2026'
    | 'president-appointment-gokul-2026'; // If the body is rendered inline by an inline component
  // If set, the Pavilion shows a "Print / export signed PDF" button that
  // links to this route. The route is responsible for pulling sigs from
  // governance_signatures and rendering a print-ready white-paper version
  // of the document. Currently used by the LoDs only.
  printUrl?: string;
  summary: string;
  whoMustSign: 'all-directors' | 'all-directors-except-conflicted';
  conflictedSigners?: readonly string[]; // workspace emails recused from CCC-side signing
  // If set, signatures collected against any of these legacy doc IDs are
  // treated as signatures on this doc for completeness purposes. Used
  // when a previously combined doc is split into per-recipient docs and
  // we want the prior signatures to carry forward without asking
  // directors to re-sign. Append-only Firestore rules are preserved —
  // legacy signatures stay in their original Firestore records; the
  // carry-forward happens entirely in the Pavilion's in-memory lookup.
  carryForwardFrom?: readonly string[];
  // If true, this document is submitted to an external party once signed
  // (e.g. an LoD sent to CIBC), and requires a final "ready to send"
  // sign-off from the President AFTER all directors have signed. The
  // President toggles this in the Pavilion; it is recorded in the
  // governance_approvals collection. Directors' signatures authorise the
  // document; the President's sign-off authorises its dispatch.
  requiresPresidentApproval?: boolean;
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
    // Split from the prior combined `lod-cibc-gokul-qaiser-2026` so
    // each new signing authority is approved by the Board independently.
    // Existing signatures on the combined doc carry forward to BOTH split
    // LoDs via `carryForwardFrom` — directors who already signed the
    // combined LoD do not need to re-sign. Directors who declined the
    // combined LoD (or have not yet signed) sign each split LoD
    // individually.
    id: 'lod-cibc-gokul-2026',
    version: '1.0',
    title: 'Letter of Direction — CIBC Signing Authority (Gokul Prakash)',
    shortTitle: 'Letter of Direction — CIBC (Gokul)',
    effective: '2026-06-01',
    inline: 'lod-cibc-gokul-2026',
    printUrl: '/c3h/pavilion/print/lod-cibc/gokul',
    summary:
      'Directs CIBC to add Gokul Prakash (Director) as a signing authority on the Club’s operating account (transit 04582, account ending ****1517), in addition to Mohammed Saad who is already on file. Gokul serves in a strictly volunteer capacity. The account continues to operate under the Club’s dual-signatory governance policy. Must be signed by all five directors before being submitted to CIBC. Signatures already collected on the prior combined Letter of Direction (Gokul + Qaiser) carry forward to this Letter; only directors who did not sign the combined Letter need to sign here.',
    whoMustSign: 'all-directors',
    carryForwardFrom: ['lod-cibc-gokul-qaiser-2026'],
    requiresPresidentApproval: true,
  },
  // NOTE: The Qaiser Qureshi LoD (`lod-cibc-qaiser-2026`) was retired on
  // 2026-06-22 — Qaiser left the Club, so he is no longer being added as a
  // CIBC signing authority / Treasurer. The doc is removed from the active
  // Pavilion list and from the print recipient set. Any signatures already
  // recorded against it remain in the append-only `governance_signatures`
  // ledger as a historical record; they are simply no longer surfaced.
  {
    id: 'president-appointment-gokul-2026',
    version: '1.0',
    title: 'Director Resolution & Appointment of President — Gokul Prakash',
    shortTitle: 'President Appointment — Gokul Prakash',
    effective: '2026-05-25',
    inline: 'president-appointment-gokul-2026',
    printUrl: '/c3h/pavilion/print/president-gokul',
    summary:
      'Combined Director Resolution and Officer Appointment Letter formally appointing Gokul Prakash as President of the Corporation pursuant to Bylaws Article 4.6(a). Records the unanimous decision of the Board, defines the scope of the President’s authority within the bylaws framework, sets out the decision-making workflow for routine matters versus matters reserved to the Board, and affirms that the role is held on a strictly volunteer, unpaid basis. Gokul remains a Director; the President title is an additional officer appointment. Must be signed by all five directors, including Gokul whose signature evidences his acceptance of the office.',
    whoMustSign: 'all-directors',
  },
];

export function findDoc(id: string): GovernanceDoc | undefined {
  return GOVERNANCE_DOCS.find((d) => d.id === id);
}
