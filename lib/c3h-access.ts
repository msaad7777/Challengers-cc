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
