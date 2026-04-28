// Single source of truth for C3H board-level access.
//
// IMPORTANT: This is NOT the same as login-eligibility (which lives in
// app/api/auth/[...nextauth]/route.ts). Other club board members (Gokul,
// Madhu, Ankush, Roman, Qaiser) can still log into C3H as regular players
// to mark their availability — they just don't see board-only features
// (captain view, squad management, Pavilion, "Board Member" badge).
//
// Per Saad (admin): only the admin + match-day captains should have
// board-level access inside C3H.

export const C3H_ADMIN_EMAILS: readonly string[] = [
  'saad@challengerscc.ca',
  'contact@challengerscc.ca',
  'mbadru3434@gmail.com',
];

// Captains today: Shahriar (LCL T30) + Tarek (LPL T30).
// Saad is also captain-level (vc + admin) and is included for both
// admin and captain role checks.
export const C3H_CAPTAIN_EMAILS: readonly string[] = [
  ...C3H_ADMIN_EMAILS,
  'shariar@challengerscc.ca', 'syedshahriar77@gmail.com',
  'tarek@challengerscc.ca', 'monirulislambd64@gmail.com',
];

// Board-level C3H access = admin + captains.
// Future board roles can be added here without touching every page.
export const C3H_BOARD_EMAILS: readonly string[] = C3H_CAPTAIN_EMAILS;

const lc = (email?: string | null) => (email || '').toLowerCase();

export const isC3HAdmin = (email?: string | null) =>
  C3H_ADMIN_EMAILS.includes(lc(email));

export const isC3HCaptain = (email?: string | null) =>
  C3H_CAPTAIN_EMAILS.includes(lc(email));

export const isC3HBoard = (email?: string | null) =>
  C3H_BOARD_EMAILS.includes(lc(email));
