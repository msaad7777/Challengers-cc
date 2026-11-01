import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isC3HAdmin, isC3HCommittee } from '@/lib/c3h-access';
import { parseAdsReport } from '@/lib/ads-report';

// Committee can read the figures (for /c3h/overview); only the admin gets the
// controls link, which opens the editable sheet. ADS_REPORT_CSV_URL is the
// "Publish to web → CSV" link of the Dashboard tab; ADS_CONTROLS_URL is the
// sheet's normal edit link. Both stay server-side so they never ship in the
// public bundle.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!isC3HCommittee(token?.email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const url = process.env.ADS_REPORT_CSV_URL;
  if (!url) return NextResponse.json({ configured: false });

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`sheet returned ${res.status}`);
    return NextResponse.json({
      configured: true,
      controlsUrl: isC3HAdmin(token?.email) ? process.env.ADS_CONTROLS_URL || null : null,
      ...parseAdsReport(await res.text()),
    });
  } catch (err) {
    return NextResponse.json(
      { configured: true, error: err instanceof Error ? err.message : 'fetch failed' },
      { status: 502 },
    );
  }
}
