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

// Whitelisted player Gmail accounts
const PLAYER_EMAILS: string[] = [
  'denisondavis9@gmail.com',
  'qureshiqaiser007@gmail.com',
  'vantarimadhu@gmail.com',
  'mbadru3434@gmail.com',
  'judinthomas96@gmail.com',
  'abhishekladva09@gmail.com',
  'monirulislambd64@gmail.com',
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
  'romans987@gmail.com',
  'fahadakbar@gmail.com',
  'gokulprakash663@gmail.com',
  '92ankusharora@gmail.com',
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
  'makhan4u4ever@gmail.com',
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
