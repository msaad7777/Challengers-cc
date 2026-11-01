import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isC3HAdmin, isC3HDashboardViewer } from '@/lib/c3h-access';

// The five directors can view the Club dashboards; only Saad (Treasurer,
// sole bank signing authority) gets controls.
const DIRECTORS = [
  'saad@challengerscc.ca', 'mbadru3434@gmail.com',
  'ankush@challengerscc.ca', 'tarek@challengerscc.ca',
  'roman@challengerscc.ca', 'gokul@challengerscc.ca', 'GOKULPRAKASH663@gmail.com',
];
const NOT_DIRECTORS = [
  'shariar@challengerscc.ca',   // captain, not a director
  'contact@challengerscc.ca',   // shared inbox
  'someone@example.com', '', null, undefined,
];

describe('isC3HDashboardViewer', () => {
  it.each(DIRECTORS)('lets director %s view', (e) => expect(isC3HDashboardViewer(e)).toBe(true));
  it.each(NOT_DIRECTORS)('keeps %s out', (e) => expect(isC3HDashboardViewer(e)).toBe(false));
  it('gives controls to Saad only', () => {
    expect(DIRECTORS.filter((e) => isC3HAdmin(e))).toEqual(['saad@challengerscc.ca', 'mbadru3434@gmail.com']);
  });
});

const getToken = vi.fn();
vi.mock('next-auth/jwt', () => ({ getToken: (...a: unknown[]) => getToken(...a) }));

describe('/api/ads-report access', () => {
  const CSV = 'type,name,status,daily_budget,impressions_30d,clicks_30d,ctr_30d,conversions_30d,cost_30d,clicks_yesterday,note,updated\n';
  beforeEach(() => {
    vi.stubEnv('ADS_REPORT_CSV_URL', 'https://sheet.example/csv');
    vi.stubEnv('ADS_CONTROLS_URL', 'https://sheet.example/edit');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(CSV)));
  });
  const call = async (email: string | null) => {
    getToken.mockResolvedValue(email ? { email } : null);
    const { GET } = await import('@/app/api/ads-report/route');
    return GET({} as never);
  };

  it('returns the controls link to Saad', async () => {
    const res = await call('saad@challengerscc.ca');
    expect(res.status).toBe(200);
    expect((await res.json()).controlsUrl).toBe('https://sheet.example/edit');
  });

  it.each(['ankush@challengerscc.ca', 'tarek@challengerscc.ca', 'roman@challengerscc.ca', 'gokul@challengerscc.ca'])(
    'gives director %s the figures but no controls link', async (e) => {
      const res = await call(e);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.configured).toBe(true);
      expect(body.controlsUrl).toBeNull();
      expect(JSON.stringify(body)).not.toContain('sheet.example/edit');
    });

  it.each(['shariar@challengerscc.ca', 'contact@challengerscc.ca', null])('refuses %s', async (e) => {
    expect((await call(e)).status).toBe(403);
  });
});

describe('/api/outreach-summary access', () => {
  const call = async (email: string | null) => {
    getToken.mockResolvedValue(email ? { email } : null);
    vi.stubEnv('OUTREACH_SUMMARY_URL', '');
    const { GET } = await import('@/app/api/outreach-summary/route');
    return GET({} as never);
  };
  it('lets a director in', async () => expect((await call('roman@challengerscc.ca')).status).toBe(200));
  it.each(['shariar@challengerscc.ca', null])('refuses %s', async (e) => expect((await call(e)).status).toBe(403));
});
