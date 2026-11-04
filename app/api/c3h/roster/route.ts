import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { approvedPlayers } from '@/lib/c3h-intake';
import { getIntakeStore } from '@/lib/c3h-intake-store';

// Players directors approved at /c3h/intake, for signed-in portal users. It holds
// only each player's name and sign-in email, never the rest of their registration.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  // The role, not just an email: it's what separates portal users from anyone else with a Google account.
  if (!token?.role) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  try {
    const store = await getIntakeStore();
    return NextResponse.json({ players: store ? approvedPlayers(await store.listMembers()) : [] });
  } catch (error) {
    console.error('Could not load approved players', error);
    return NextResponse.json({ players: [] }, { status: 502 });
  }
}
