import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isC3HCommittee } from '@/lib/c3h-access';
import { decryptSummary } from '@/lib/outreach-summary';

// Committee-only. OUTREACH_SUMMARY_URL serves the encrypted summary the club
// Mac publishes after each outreach run; OUTREACH_SUMMARY_KEY decrypts it.
// Both stay server-side so they never ship in the public bundle.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!isC3HCommittee(token?.email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const url = process.env.OUTREACH_SUMMARY_URL;
  const key = process.env.OUTREACH_SUMMARY_KEY;
  if (!url || !key) return NextResponse.json({ configured: false });

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`summary source returned ${res.status}`);
    return NextResponse.json({ configured: true, ...decryptSummary(await res.text(), key) });
  } catch (err) {
    return NextResponse.json(
      { configured: true, error: err instanceof Error ? err.message : 'fetch failed' },
      { status: 502 },
    );
  }
}
