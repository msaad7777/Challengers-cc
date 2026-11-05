import { describe, expect, it } from 'vitest';
import { adsBriefing, adsUpdateStatus, hasLittleAdActivity, parseAdsReport, parseAdsTimestamp, parseCsv, type AdsReport } from '@/lib/ads-report';

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

describe('adsUpdateStatus', () => {
  // 21:44 Newfoundland time on Nov 4 is 01:14 UTC on Nov 5 and 8:14 p.m. in London.
  const stamp = '2026-11-04 21:44';
  const at = Date.UTC(2026, 10, 5, 1, 14);
  const MIN = 60 * 1000;

  it('reads the stamp as Newfoundland time, in and out of daylight time', () => {
    expect(parseAdsTimestamp(stamp)).toBe(at);
    expect(parseAdsTimestamp('2026-07-01 12:00')).toBe(Date.UTC(2026, 6, 1, 14, 30));
  });

  it('rejects anything else', () => {
    expect(parseAdsTimestamp(null)).toBeNull();
    expect(parseAdsTimestamp('yesterday')).toBeNull();
    expect(parseAdsTimestamp('2026-11-05 24:14')).toBeNull();
    expect(parseAdsTimestamp('2026-02-30 09:00')).toBeNull();
    expect(adsUpdateStatus(null, at)).toBeNull();
  });

  it('shows London time and the next hourly run', () => {
    const status = adsUpdateStatus(stamp, at + 30 * MIN)!;
    expect(status.stale).toBe(false);
    expect(status.updated).toMatch(/^8:14/);
    expect(status.next).toMatch(/^9:14/);
  });

  it('stops promising a next time once the run is due', () => {
    expect(adsUpdateStatus(stamp, at + 90 * MIN)!.next).toBeNull();
  });

  it('turns stale after three hours and names the day', () => {
    expect(adsUpdateStatus(stamp, at + 180 * MIN)!.stale).toBe(false);
    const status = adsUpdateStatus(stamp, at + 24 * 60 * MIN)!;
    expect(status.stale).toBe(true);
    expect(status.updated).toMatch(/Nov.*4.*8:14/);
  });
});

describe('hasLittleAdActivity', () => {
  const totals = { impressions: 11, clicks: 0, ctr: 0, conversions: 0, cost: 0 };

  it('is true only with no clicks and under 100 impressions', () => {
    expect(hasLittleAdActivity(totals)).toBe(true);
    expect(hasLittleAdActivity({ ...totals, clicks: 1 })).toBe(false);
    expect(hasLittleAdActivity({ ...totals, impressions: 100 })).toBe(false);
  });
});

describe('adsBriefing', () => {
  const report = (totals: Partial<AdsReport['totals']>, metrics: Record<string, number> = {}): AdsReport => ({
    campaigns: [], alerts: [], changes: [], updated: null, metrics,
    totals: { impressions: 1000, clicks: 100, ctr: 0.1, conversions: 5, cost: 0, ...totals },
  });

  it('never invents the registered count', () => {
    expect(adsBriefing(report({})).playersRegistered).toBeNull();
    expect(adsBriefing(report({}, { players_registered_total: 0 })).playersRegistered).toEqual({ total: 0, last30Days: null });
    expect(adsBriefing(report({}, { players_registered_total: 9, players_registered_30d: 2 })).playersRegistered)
      .toEqual({ total: 9, last30Days: 2 });
  });

  it('flags low CTR only with enough impressions', () => {
    expect(adsBriefing(report({ ctr: 0.03 })).notes[0]).toContain('below');
    expect(adsBriefing(report({ ctr: 0.03, impressions: 50 })).notes[0]).toContain('too few');
    expect(adsBriefing(report({})).notes[0]).toContain('No change');
  });

  it('flags clicks that never convert', () => {
    expect(adsBriefing(report({ conversions: 0 })).notes[1]).toContain('Check conversion tracking');
    expect(adsBriefing(report({})).notes[1]).toBe('5 conversions from 100 clicks (5.0%).');
    expect(adsBriefing(report({ clicks: 0, conversions: 0 })).notes).toHaveLength(1);
  });

  it('only talks about the grant when its spend is reported', () => {
    expect(adsBriefing(report({})).notes.join()).not.toContain('grant');
    expect(adsBriefing(report({}, { cost_mtd: 9500 })).notes.at(-1)).toContain('Close to the limit');
    expect(adsBriefing(report({}, { cost_mtd: 100 })).notes.at(-1)).toContain('$100 of the $10,000');
  });
});
