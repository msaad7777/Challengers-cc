import { describe, expect, it } from 'vitest';
import { parseAdsReport, parseCsv } from '@/lib/ads-report';

const HEADER = 'type,name,status,daily_budget,impressions_30d,clicks_30d,ctr_30d,conversions_30d,cost_30d,clicks_yesterday,note,updated';

describe('parseCsv', () => {
  it('handles quoted commas, escaped quotes and CRLF', () => {
    expect(parseCsv('a,"b, c","say ""hi"""\r\n1,2,3\r\n')).toEqual([
      ['a', 'b, c', 'say "hi"'],
      ['1', '2', '3'],
    ]);
  });

  it('drops blank lines', () => {
    expect(parseCsv('a,b\n\n,\n1,2')).toEqual([['a', 'b'], ['1', '2']]);
  });
});

describe('parseAdsReport', () => {
  const csv = [
    HEADER,
    'campaign,"Players — Play cricket in London",ENABLED,60,1000,80,0.08,4,95.50,3,,2026-11-02 09:00',
    'campaign,"Sponsors — Sponsor a local club",PAUSED,25,200,8,4%,0,10.00,0,,2026-11-02 09:00',
    'alert,,,,,,,,,,"Account CTR is 4.0% over 30 days.",2026-11-02 09:00',
    'change,,,,,,,,,,"Paused keyword ""t30 cricket"" (Quality Score 2)",2026-11-02 09:00',
  ].join('\n');

  it('splits campaigns, alerts and changes', () => {
    const r = parseAdsReport(csv);
    expect(r.campaigns.map((c) => c.name)).toEqual([
      'Players — Play cricket in London',
      'Sponsors — Sponsor a local club',
    ]);
    expect(r.alerts).toEqual(['Account CTR is 4.0% over 30 days.']);
    expect(r.changes).toEqual(['Paused keyword "t30 cricket" (Quality Score 2)']);
    expect(r.updated).toBe('2026-11-02 09:00');
  });

  it('reads CTR as a fraction or a percentage', () => {
    const [players, sponsors] = parseAdsReport(csv).campaigns;
    expect(players.ctr).toBeCloseTo(0.08);
    expect(sponsors.ctr).toBeCloseTo(0.04);
  });

  it('totals across campaigns', () => {
    const { totals } = parseAdsReport(csv);
    expect(totals).toEqual({ impressions: 1200, clicks: 88, ctr: 88 / 1200, conversions: 4, cost: 105.5 });
  });

  it('returns an empty report for an empty sheet', () => {
    expect(parseAdsReport('')).toEqual({
      campaigns: [], alerts: [], changes: [], updated: null, metrics: {},
      totals: { impressions: 0, clicks: 0, ctr: 0, conversions: 0, cost: 0 },
    });
  });

  it('reads metric rows as account-level numbers', () => {
    const csv = [
      'type,name,status,daily_budget,impressions_30d,clicks_30d,ctr_30d,conversions_30d,cost_30d,clicks_yesterday,note,updated',
      'metric,cost_mtd,,,,,,,,,"1,234.50",',
      'metric,players_registered_total,,,,,,,,,31,',
    ].join('\n');
    expect(parseAdsReport(csv).metrics).toEqual({ cost_mtd: 1234.5, players_registered_total: 31 });
  });
});
