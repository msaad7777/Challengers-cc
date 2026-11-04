// Email → Player display-name map. Some players have both their
// @challengerscc.ca workspace email and a personal Gmail mapped to the
// same display name so login from either address resolves correctly.
//
// This is the single source of truth for the email↔name lookup. Both
// the Dugout (availability page) and the Field Editor (access guard +
// audit-trail display) read from here.
export const EMAIL_TO_PLAYER: Record<string, string> = {
  // contact@challengerscc.ca removed 2026-07-27 — shared inbox account
  // compromised by a former member; it is blocked from sign-in (see
  // BLOCKED_EMAILS in the NextAuth route). Saad signs in as saad@ / mbadru3434@.
  'saad@challengerscc.ca': 'Mohammed Saad',
  'mbadru3434@gmail.com': 'Mohammed Saad',
  'tarek@challengerscc.ca': 'Tarek Islam',
  'monirulislambd64@gmail.com': 'Tarek Islam',
  'gokul@challengerscc.ca': 'Gokul Prakash',
  'gokulprakash663@gmail.com': 'Gokul Prakash',
  'ankush@challengerscc.ca': 'Ankush Arora',
  '92ankusharora@gmail.com': 'Ankush Arora',
  'roman@challengerscc.ca': 'Roman Mahmud',
  'romans987@gmail.com': 'Roman Mahmud',
  'shariar@challengerscc.ca': 'Syed Shahriar',
  'syedshahriar77@gmail.com': 'Syed Shahriar',
  'denisondavis9@gmail.com': 'Denison Davis',
  'judinthomas96@gmail.com': 'Judin Thomas',
  'abhishekladva09@gmail.com': 'Abhishek Ladva',
  'ashvak.realtor07@gmail.com': 'Ashvak Sheik',
  'bhindadhesi18@gmail.com': 'Bhupinder Singh',
  'sallu.ahmed8@gmail.com': 'Salman Ahmed',
  'saiakhira@gmail.com': 'Saikrishna Goriparthi',
  'farooqchoudhary123@gmail.com': 'Farooq Choudhary',
  'vijayvyadav1998@gmail.com': 'Vijay Yadav',
  'rajputshivam9558@gmail.com': 'Shivam Rajput',
  // Shoeb Ahmad (shabyansari0023@gmail.com) removed 2026-07-28 — left the Club.
  'manoharanukuri9@gmail.com': 'Manohar Anukuri',
  'mohayminul13@gmail.com': 'Mohayminul',
  'fahadakbar@gmail.com': 'Fahad Aktar',
  'andrewjebarson18@gmail.com': 'Andrew Jebarson',
  'tgururaga@gmail.com': 'Guru Raga',
  '108.noman@gmail.com': 'Noman',
  'shafiul078.aust@gmail.com': 'Shafiul',
  'sujelahmed06@gmail.com': 'Sujel Ahmed',
  'atik1991rah@gmail.com': 'Atik Rahman',
  'majharulalam456@gmail.com': 'Majharul Alam',
  'georgefreddy963@gmail.com': 'Fahad Aktar',
  'siva4593@gmail.com': 'Siva Sriram',
  'rajath.s.shetty@gmail.com': 'Rajath Shetty',
  'maaleemq@gmail.com': 'Aleem Quadri',
  'thoufeeqmuhammed99@gmail.com': 'Thoufeeq Muhammed',
  'ameeyasingh1@gmail.com': 'Ameeya Singh',
};

// Resolve a Google-login email to the player's display name. Returns null
// if the email isn't in the roster (e.g., a brand-new player that hasn't
// been added yet, or a board email that isn't also a player).
export function resolvePlayerName(email: string | null | undefined): string | null {
  if (!email) return null;
  const lower = email.toLowerCase();
  return EMAIL_TO_PLAYER[lower] ?? null;
}

// Everyone selectable in the Dugout, including roster-only players with no login.
// Players approved at /c3h/intake are added to this at runtime.
export const PLAYER_ROSTER: readonly string[] = [
  'Mohammed Saad', 'Tarek Islam', 'Gokul Prakash',
  'Ankush Arora', 'Roman Mahmud', 'Judin Thomas', 'Saikrishna Goriparthi',
  'Fahad Aktar', 'Fahad Ahmad', 'Denison Davis', 'Abhishek Ladva',
  'Salman Ahmed', 'Farooq Choudhary', 'Vijay Yadav', 'Shivam Rajput',
  'Manohar Anukuri', 'Mohayminul', 'Andrew Jebarson', 'Guru Raga', 'Noman',
  'Shafiul', 'Sujel Ahmed', 'Syed Shahriar', 'Atik Rahman', 'Majharul Alam', 'Siva Sriram', 'Rajath Shetty', 'Murshad Azad',
  'Aleem Quadri', 'Ameeya Singh', 'Dhamu',
  // Part-time players added 2026-07 (roster-only — no login yet)
  'Thoufeeque', 'Swapnil', 'Raunak', 'Raj', 'Segu', 'Fawaz', 'Abdullah',
  // Joined after Jul 18 (roster-only — no login yet). Tracker only counts the
  // post–Jul-18 matches captains actually select them into.
  'Lovely', 'Sahaj', 'RP',
  // Added Aug 2026 for the LCL T20 (roster-only — no login yet). Available in
  // every league by default, same as the rest of the roster; there is no
  // T20-only bucket. Must be registered in CricClubs by Sep 5 to play a T20.
  'Shashank', 'Muhib', 'Mustajab',
  // Added 2026-08-23 for the LCL T20 (roster-only — no login yet). Distinct
  // from the existing 'RP' above, who is a different player.
  'Rahul Patel',
  // Added 2026-10-02 for the LCL T20 (roster-only — no login yet).
  'Tanishq',
];

export type ApprovedPlayer = { email: string; name: string };

// True if this name would be shared with a different person. The Dugout stores
// availability by name, so two people with one name would overwrite each other.
export function isPlayerNameTaken(name: string, email: string, approved: readonly ApprovedPlayer[]): boolean {
  const lower = name.trim().toLowerCase();
  const inCode = EMAIL_TO_PLAYER[email];
  if (inCode) return inCode.toLowerCase() !== lower;
  return (
    PLAYER_ROSTER.some(n => n.toLowerCase() === lower) ||
    Object.values(EMAIL_TO_PLAYER).some(n => n.toLowerCase() === lower) ||
    approved.some(p => p.email !== email && p.name.toLowerCase() === lower)
  );
}

export function mergeApprovedPlayers(approved: readonly ApprovedPlayer[]) {
  const emailToPlayer: Record<string, string> = { ...EMAIL_TO_PLAYER };
  const allPlayers = [...PLAYER_ROSTER];
  for (const { email, name } of approved) {
    emailToPlayer[email] ??= name;
    if (!allPlayers.includes(emailToPlayer[email])) allPlayers.push(emailToPlayer[email]);
  }
  return { emailToPlayer, allPlayers };
}
