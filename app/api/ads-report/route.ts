import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isC3HAdmin, isC3HDashboardViewer } from '@/lib/c3h-access';
import { parseAdsReport } from '@/lib/ads-report';

// Directors can read the figures; only the admin (Saad, Treasurer) gets the
// controls link, which opens the editable sheet: it is withheld here on the
// server, not just hidden in the page. ADS_REPORT_CSV_URL is the
// "Publish to web → CSV" link of the Dashboard tab; ADS_CONTROLS_URL is the
// sheet's normal edit link. Both stay server-side so they never ship in the
// public bundle.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!isC3HDashboardViewer(token?.email)) {
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
