import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isC3HAdmin, resolveDirectorWorkspaceEmail } from '@/lib/c3h-access';
import { parseIntakeAction } from '@/lib/c3h-intake';
import { applyIntakeAction, getIntakeStore } from '@/lib/c3h-intake-store';

// Directors only. These records hold names, emails and phone numbers.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!isDirector(token?.email)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  try {
    const store = await getIntakeStore();
    if (!store) return NextResponse.json({ configured: false });
    return NextResponse.json({ configured: true, records: await store.list() });
  } catch (error) {
    console.error('Could not load C3H intake', error);
    return NextResponse.json({ configured: true, error: 'Could not load records' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  const by = token?.email;
  if (!by || !isDirector(by)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const action = parseIntakeAction(await req.json().catch(() => null));
  if (!action) return NextResponse.json({ error: 'Please check the details and try again' }, { status: 400 });

  try {
    const store = await getIntakeStore();
    if (!store) return NextResponse.json({ error: 'Storage is not set up' }, { status: 503 });
    const result = await applyIntakeAction(store, action, by);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ record: result.record });
  } catch (error) {
    console.error('Could not change C3H intake', error);
    return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 502 });
  }
}

// Accepts a director's workspace or personal address.
const isDirector = (email?: string | null) =>
  isC3HAdmin(email) || resolveDirectorWorkspaceEmail(email) !== null;
