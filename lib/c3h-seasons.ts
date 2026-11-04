// c3h-seasons.ts — who may sign in to C3H as a player, season by season.
//
// To start a new season:
//   1. Add the season below with its full player list. Nobody carries over
//      automatically: a returning player has to be listed again.
//   2. Change ACTIVE_SEASON to it. Players not listed lose access on that deploy.
// Directors and other board access stay in BOARD_EMAILS in the NextAuth route.
// A new player also needs the two display-name steps in CLAUDE.md.
//
// Pure/data-only so it can be unit-tested without NextAuth.

export const ACTIVE_SEASON = 2026;

// Player Gmail accounts by season, in lowercase (non-board players only).
export const SEASON_PLAYERS: Record<number, string[]> = {
  2026: [
    'denisondavis9@gmail.com',
    'judinthomas96@gmail.com',
    'abhishekladva09@gmail.com',
    'ashvak.realtor07@gmail.com',
    'bhindadhesi18@gmail.com',
    'sallu.ahmed8@gmail.com',
    'saiakhira@gmail.com',
    'farooqchoudhary123@gmail.com',
    'vijayvyadav1998@gmail.com',
    'rajputshivam9558@gmail.com',
    'shabyansari0023@gmail.com',
    'manoharanukuri9@gmail.com',
    'mohayminul13@gmail.com',
    'fahadakbar@gmail.com',
    'georgefreddy963@gmail.com',
    'andrewjebarson18@gmail.com',
    'tgururaga@gmail.com',
    '108.noman@gmail.com',
    'shafiul078.aust@gmail.com',
    'sujelahmed06@gmail.com',
    'syedshahriar77@gmail.com',
    // shabyansari0023@gmail.com (Shoeb) removed 2026-07-28 — left the Club; blocked above.
    'gmc715625@gmail.com',
    'atik1991rah@gmail.com',
    'majharulalam456@gmail.com',
    'siva4593@gmail.com',
    'rajath.s.shetty@gmail.com',
    'maaleemq@gmail.com',
    'thoufeeqmuhammed99@gmail.com',
    'ameeyasingh1@gmail.com',
  ],
};

export function isSeasonPlayer(
  email: string,
  season: number,
  seasons: Record<number, string[]> = SEASON_PLAYERS,
): boolean {
  return (seasons[season] ?? []).includes(email.trim().toLowerCase());
}

export const isActiveSeasonPlayer = (email: string): boolean => isSeasonPlayer(email, ACTIVE_SEASON);
