import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Board members & captains get full access (all 4 modules)
// Includes both @challengerscc.ca and personal Gmail
const BOARD_EMAILS = [
  'contact@challengerscc.ca',
  // Directors (5 — per federal corporate profile)
  'saad@challengerscc.ca',
  'ankush@challengerscc.ca',
  'tarek@challengerscc.ca',
  'sazzad@challengerscc.ca',
  'gokul@challengerscc.ca',
  // Officers (non-director)
  'madhu@challengerscc.ca',
  'qaiser@challengerscc.ca',
  'shariar@challengerscc.ca',
  // Personal Gmails of directors & officers
  'mbadru3434@gmail.com',          // Saad
  'monirulislambd64@gmail.com',    // Tarek (Md Monirul Islam)
  'gokulprakash663@gmail.com',     // Gokul
  'qureshiqaiser007@gmail.com',    // Qaiser
  'vantarimadhu@gmail.com',        // Madhu
  '92ankusharora@gmail.com',       // Ankush
  'syedshahriar77@gmail.com',      // Shahriar
  // Sazzad's personal Gmail TBC — workspace email above will work via the
  // @challengerscc.ca catch-all in getUserRole().
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
  'gmc715625@gmail.com',
  'atik1991rah@gmail.com',
  'majharulalam456@gmail.com',
  'siva4593@gmail.com',
  'rajath.s.shetty@gmail.com',
  'maaleemq@gmail.com',
];

function getUserRole(email: string): 'board' | 'player' | null {
  const lower = email.toLowerCase();
  if (lower.endsWith('@challengerscc.ca')) return 'board';
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
