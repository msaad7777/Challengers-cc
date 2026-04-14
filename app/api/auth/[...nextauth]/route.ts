import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Board members get full access (all 4 modules)
const BOARD_EMAILS = [
  'contact@challengerscc.ca',
  'tarek@challengerscc.ca',
  'gokul@challengerscc.ca',
  'qaiser@challengerscc.ca',
  'madhu@challengerscc.ca',
  'ankush@challengerscc.ca',
  'roman@challengerscc.ca',
];

// Whitelisted player Gmail accounts (add players here)
const PLAYER_EMAILS: string[] = [
  // Add player Gmail addresses here as they register
  // 'player@gmail.com',
];

function getUserRole(email: string): 'board' | 'player' | null {
  if (email.endsWith('@challengerscc.ca')) return 'board';
  if (BOARD_EMAILS.includes(email)) return 'board';
  if (PLAYER_EMAILS.includes(email)) return 'player';
  return null;
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email || '';
      const role = getUserRole(email);
      // Allow board and whitelisted players only
      return role !== null;
    },
    async session({ session }) {
      if (session.user?.email) {
        const role = getUserRole(session.user.email);
        Object.assign(session, { role });
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
