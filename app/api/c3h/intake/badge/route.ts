import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { canReadIntake, intakeBadge, intakeReaderKey, nextSeenAt } from '@/lib/c3h-intake';
import { getIntakeStore } from '@/lib/c3h-intake-store';

// Counts only, for the dashboard card. No names, emails or phone numbers leave
// this route. Directors only, the same as /api/c3h/intake.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  const email = token?.email;
  if (!email || !canReadIntake(email)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  try {
    const store = await getIntakeStore();
    if (!store) return NextResponse.json({ configured: false });
    const [records, lastSeen] = await Promise.all([store.list(), store.getSeen(intakeReaderKey(email))]);
    return NextResponse.json({ configured: true, ...intakeBadge(records, lastSeen) });
  } catch (error) {
    console.error('Could not load the C3H intake badge', error);
    return NextResponse.json({ configured: true, error: 'Could not load' }, { status: 502 });
  }
}

// The intake page calls this after it shows the records, with the time it
// loaded them, which marks them read for this director only. Something that
// arrived after that load stays unread.
export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  const email = token?.email;
  if (!email || !canReadIntake(email)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  try {
    const store = await getIntakeStore();
    if (!store) return NextResponse.json({ error: 'Storage is not set up' }, { status: 503 });
    const body = await req.json().catch(() => null);
    const key = intakeReaderKey(email);
    const previous = await store.getSeen(key);
    const at = nextSeenAt(body?.at, previous);
    if (at !== previous) await store.putSeen(key, at);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Could not mark C3H intake as read', error);
    return NextResponse.json({ error: 'Could not save' }, { status: 502 });
  }
}

