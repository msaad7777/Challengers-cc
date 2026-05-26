// Single source of truth for C3H board-level access.
//
// IMPORTANT: This is NOT the same as login-eligibility (which lives in
// app/api/auth/[...nextauth]/route.ts). Other club board members (Gokul,
// Madhu, Ankush, Roman, Qaiser) can still log into C3H as regular players
// to mark their availability — they just don't see board-only features
// (captain view, squad management, Pavilion, "Board Member" badge).
//
// Per Saad: only the admin + match-day captains/VCs should have squad
// management access. NO board members get this access by virtue of being
// on the board — only by being a designated captain or VC for a league.
//
// `contact@challengerscc.ca` is intentionally NOT in the admin list — it
// is the org's general-purpose inbox and may be accessed by people other
// than Saad. Saad uses `saad@challengerscc.ca` (or `mbadru3434@gmail.com`
// as a backup personal login) for any C3H admin actions.

export const C3H_ADMIN_EMAILS: readonly string[] = [
  'saad@challengerscc.ca',
  'mbadru3434@gmail.com',
];

// Captains/VCs today:
//   Shahriar — LCL T30 captain
//   Tarek    — LPL T30 captain
//   Ankush   — Vice-captain
//   Shoeb    — captain-level access
// Saad is admin and is included automatically.
export const C3H_CAPTAIN_EMAILS: readonly string[] = [
  ...C3H_ADMIN_EMAILS,
  'shariar@challengerscc.ca', 'syedshahriar77@gmail.com',
  'tarek@challengerscc.ca', 'monirulislambd64@gmail.com',
  'ankush@challengerscc.ca', '92ankusharora@gmail.com',
  'shoeb@challengerscc.ca', 'shabyansari0023@gmail.com',
];

// Board-level C3H access = admin + captains.
// Future board roles can be added here without touching every page.
export const C3H_BOARD_EMAILS: readonly string[] = C3H_CAPTAIN_EMAILS;

// Squad viewers — can SEE the captain view (squad selections + availability
// matrix) but cannot edit anything. Used to give the Treasurer / specific
// board members + the org's shared inbox read-only visibility into selection
// without granting captain mutation rights.
//
// Today:
//   - All captains (implicitly, via spread)
//   - Qaiser (Treasurer)
//   - contact@challengerscc.ca (shared org inbox — multiple board members
//     may have access; gets visibility but no edit rights, matching Qaiser)
export const C3H_SQUAD_VIEWER_EMAILS: readonly string[] = [
  ...C3H_CAPTAIN_EMAILS,
  'qaiser@challengerscc.ca', 'qureshiqaiser007@gmail.com',
  'contact@challengerscc.ca',
];

const lc = (email?: string | null) => (email || '').toLowerCase();

export const isC3HAdmin = (email?: string | null) =>
  C3H_ADMIN_EMAILS.includes(lc(email));

export const isC3HCaptain = (email?: string | null) =>
  C3H_CAPTAIN_EMAILS.includes(lc(email));

export const isC3HBoard = (email?: string | null) =>
  C3H_BOARD_EMAILS.includes(lc(email));

export const isC3HSquadViewer = (email?: string | null) =>
  C3H_SQUAD_VIEWER_EMAILS.includes(lc(email));

// ── Directors of Challengers Cricket Club ──
// The five elected directors per the corporate profile (incorporated
// 2025-11-12). These five are the only people with corporate-binding
// authority and the only ones who sign governance documents in the
// Pavilion (corporate agreements, board resolutions, etc.).
//
// `contact@challengerscc.ca` is intentionally excluded — it's a shared
// org inbox, not a director account. Personal Gmail addresses are
// included so directors can sign in either way; the canonical identity
// for the governance ledger is always the workspace email.
//
// Sazzad Mahmud goes by "Roman"; his workspace email is roman@challengerscc.ca
// and his personal Gmail is romans987@gmail.com. The display name on the
// roster stays "Sazzad Mahmud" so the Pavilion and bank-bound LoDs match
// his legal name as recorded in the federal corporate filing.
export const C3H_DIRECTOR_EMAILS: readonly string[] = [
  'saad@challengerscc.ca',     'mbadru3434@gmail.com',
  'ankush@challengerscc.ca',   '92ankusharora@gmail.com',
  'tarek@challengerscc.ca',    'monirulislambd64@gmail.com',
  'roman@challengerscc.ca',    'romans987@gmail.com',         // Sazzad Mahmud (goes by "Roman")
  'gokul@challengerscc.ca',    'gokulprakash663@gmail.com',
];

export type DirectorEntry = {
  workspaceEmail: string;
  personalEmail?: string;
  name: string;
  role: string;
};

// Public-facing director roster — used by the Pavilion to render the
// "who has signed / who is pending" grid. Emails listed here are the
// PRIMARY identity used for signature records (workspace email). The
// personal Gmails are accepted at login but signatures are always
// recorded against the canonical workspace email.
//
// Order: as listed on the federal corporate profile.
export const C3H_DIRECTOR_ROSTER: readonly DirectorEntry[] = [
  { workspaceEmail: 'saad@challengerscc.ca',   personalEmail: 'mbadru3434@gmail.com',       name: 'Mohammed Saad',     role: 'Director' },
  { workspaceEmail: 'ankush@challengerscc.ca', personalEmail: '92ankusharora@gmail.com',    name: 'Ankush Arora',      role: 'Director' },
  { workspaceEmail: 'tarek@challengerscc.ca',  personalEmail: 'monirulislambd64@gmail.com', name: 'Md Monirul Islam',  role: 'Director' },
  { workspaceEmail: 'roman@challengerscc.ca',  personalEmail: 'romans987@gmail.com',          name: 'Sazzad Mahmud',     role: 'Director' },
  { workspaceEmail: 'gokul@challengerscc.ca',  personalEmail: 'gokulprakash663@gmail.com',  name: 'Gokul Prakash',     role: 'Director' },
];

// ── Officers (non-director) and Captains ──
// These individuals hold operational roles but are NOT directors of the
// corporation per the corporate profile. They cannot bind the Club. They
// do not sign corporate governance agreements in the Pavilion. They are
// surfaced in the Pavilion onboarding tracker so we can see who has
// logged into C3H at least once.
export type OfficerEntry = {
  workspaceEmail: string;
  personalEmail?: string;
  name: string;
  role: string;
};

export const C3H_OFFICER_ROSTER: readonly OfficerEntry[] = [
  // Officer Hub roster, intentionally limited to the three formal
  // officer roles in Bylaws Article 4.6 (President, Treasurer,
  // Secretary). These three need a signed Officer Appointment Letter
  // in the Pavilion governance ledger.
  //
  // The President (Gokul) is also a Director and remains in
  // C3H_DIRECTOR_ROSTER unchanged — the dual director+officer pattern
  // is permitted by Bylaws Article 4.7 (which only restricts
  // officer+officer combinations).
  //
  // Captains and other operational role-holders are NOT listed here —
  // they may be tracked through a separate roster later if needed.
  { workspaceEmail: 'gokul@challengerscc.ca',   personalEmail: 'gokulprakash663@gmail.com',  name: 'Gokul Prakash',  role: 'President' },
  { workspaceEmail: 'madhu@challengerscc.ca',   personalEmail: 'vantarimadhu@gmail.com',     name: 'Madhu Reddy',    role: 'Secretary' },
  { workspaceEmail: 'qaiser@challengerscc.ca',  personalEmail: 'qureshiqaiser007@gmail.com', name: 'Qaiser Qureshi', role: 'Treasurer' },
];

export const isC3HDirector = (email?: string | null) =>
  C3H_DIRECTOR_EMAILS.includes(lc(email));

// Resolve a logged-in user's email (workspace OR personal) to the
// canonical workspace email used as the signature key. Returns null
// if the user is not a director.
export const resolveDirectorWorkspaceEmail = (email?: string | null): string | null => {
  const lower = lc(email);
  const match = C3H_DIRECTOR_ROSTER.find(
    d => d.workspaceEmail === lower || d.personalEmail === lower,
  );
  return match?.workspaceEmail ?? null;
};

// ── Officers (non-director) and Captains — predicates ──────────────
// Used by the Officer Hub at /c3h/officer-hub to gate access.
// Officers/captains see THEIR OWN Officer Appointment & Volunteer
// Status Confirmation; they do not see the director-only Pavilion.
export const isC3HOfficer = (email?: string | null) => {
  const lower = lc(email);
  return C3H_OFFICER_ROSTER.some(
    o => o.workspaceEmail === lower || o.personalEmail?.toLowerCase() === lower,
  );
};

export const resolveOfficerWorkspaceEmail = (email?: string | null): string | null => {
  const lower = lc(email);
  const match = C3H_OFFICER_ROSTER.find(
    o => o.workspaceEmail === lower || o.personalEmail?.toLowerCase() === lower,
  );
  return match?.workspaceEmail ?? null;
};

// ── Governance readers ────────────────────────────────────────────────
// Subset of officers who get READ-ONLY access to the Pavilion governance
// documents. Today this is the Secretary and the Treasurer — they need
// to see the corporate agreements to do their roles, but they DO NOT
// see the signing trackers or the board resolutions (those remain
// director-only).
//
// Captains and other operational role-holders are NOT governance readers;
// they would use a separate roster (not in OFFICER_ROSTER) if needed.
//
// The President is not a governance-reader-via-officer-role either:
// Gokul already reads governance documents via his Director status, so
// the officer-side predicate doesn't need to grant him anything extra.
const GOVERNANCE_READER_ROLES = new Set<string>(['Secretary', 'Treasurer']);

export const isC3HGovernanceReader = (email?: string | null) => {
  const lower = lc(email);
  return C3H_OFFICER_ROSTER.some(
    o =>
      GOVERNANCE_READER_ROLES.has(o.role) &&
      (o.workspaceEmail === lower || o.personalEmail?.toLowerCase() === lower),
  );
};
