import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// SECURITY BLOCKLIST — checked FIRST, before any allowlist or the
// @challengerscc.ca domain auto-approve below. Any address here is denied
// sign-in outright.
//
// 2026-07-27: contact@challengerscc.ca (the shared Workspace inbox) is
// blocked. The account was compromised by a former member (Qaiser, now
// subject of legal action) who changed its recovery phone/email and may
// have sent/deleted mail. Blocking it here severs the app-side access while
// the Google Workspace account is secured. This is a temporary lockout —
// remove from this list only once the account is fully recovered + secured.
// NOTE: existing JWT sessions persist up to `maxAge`; rotate NEXTAUTH_SECRET
// to force-invalidate any active session immediately.
const BLOCKED_EMAILS = [
  'contact@challengerscc.ca',
  // Former members — explicitly blocked so their @challengerscc.ca workspace
  // addresses can't slip through the domain auto-approve below even if the
  // Google accounts still exist. Their personal Gmails are listed too for
  // clarity. (The real fix is to delete/suspend these Workspace accounts.)
  'qaiser@challengerscc.ca',    // Qaiser — left the Club 2026-06-22
  'qureshiqaiser007@gmail.com',
  'madhu@challengerscc.ca',     // Madhu — former member
  'vantarimadhu@gmail.com',
  'shoeb@challengerscc.ca',     // Shoeb — left the Club 2026-07-28
  'shabyansari0023@gmail.com',
];

// Board members & captains get full access (all 4 modules)
// Includes both @challengerscc.ca and personal Gmail
const BOARD_EMAILS = [
  // Directors (5 — per federal corporate profile)
  'saad@challengerscc.ca',
  'ankush@challengerscc.ca',
  'tarek@challengerscc.ca',
  'roman@challengerscc.ca',        // Sazzad Mahmud (goes by "Roman")
  // (his personal Gmail romans987@gmail.com is added below alongside the others)
  'gokul@challengerscc.ca',
  // Officers (non-director)
  'shariar@challengerscc.ca',
  // Personal Gmails of directors & officers
  'mbadru3434@gmail.com',          // Saad
  'monirulislambd64@gmail.com',    // Tarek (Md Monirul Islam)
  'gokulprakash663@gmail.com',     // Gokul
  '92ankusharora@gmail.com',       // Ankush
  'syedshahriar77@gmail.com',      // Shahriar
  'romans987@gmail.com',           // Roman (Sazzad Mahmud)
];

// Whitelisted player Gmail accounts (non-board players only)
const PLAYER_EMAILS: string[] = [
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
];

function getUserRole(email: string): 'board' | 'player' | null {
  const lower = email.toLowerCase();
  // Blocklist wins over everything.
  if (BLOCKED_EMAILS.includes(lower)) return null;
  // NOTE: we deliberately do NOT auto-approve every @challengerscc.ca address
  // anymore (removed 2026-07-28). A blanket domain approve meant any former
  // member whose Workspace mailbox still existed (contact@, qaiser@, madhu@,
  // shoeb@ …) could sign in as board. Workspace addresses must now be listed
  // explicitly in BOARD_EMAILS below — so a new director/officer is a one-line
  // add, and an ex-member is denied by default the moment they're removed.
  if (BOARD_EMAILS.includes(lower)) return 'board';
  if (PLAYER_EMAILS.includes(lower)) return 'player';
  return null;
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    // 24 hours — short enough that allowlist changes (captain access,
    // player removals) propagate within a day. Users re-login daily.
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // refresh JWT every hour while user is active
  },
  callbacks: {
    async signIn({ user }) {
      const email = user.email || '';
      const role = getUserRole(email);
      return role !== null;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.role = getUserRole(user.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        Object.assign(session, { role: token.role });
      }
      return session;
    },
  },
  pages: {
    signIn: '/c3h/login',
    error: '/c3h/login',
  },
});

export { handler as GET, handler as POST };
