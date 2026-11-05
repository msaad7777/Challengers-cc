import { describe, expect, it } from 'vitest';
import { buildAdsInsights } from '@/lib/ads-insights';
import type { AdsCampaign, AdsReport } from '@/lib/ads-report';

const campaign = (over: Partial<AdsCampaign> = {}): AdsCampaign => ({
  name: 'Players',
  status: 'ENABLED',
  dailyBudget: 60,
  impressions: 1000,
  clicks: 80,
  ctr: 0.08,
  conversions: 4,
  cost: 95.5,
  clicksYesterday: 3,
  ...over,
});

const report = (campaigns: AdsCampaign[], updated: string | null = '2026-11-02 09:00'): AdsReport => {
  const sum = (k: 'impressions' | 'clicks' | 'conversions' | 'cost') => campaigns.reduce((t, c) => t + c[k], 0);
  const impressions = sum('impressions');
  return {
    campaigns,
    alerts: [],
    changes: [],
    updated,
    metrics: {},
    totals: {
      impressions,
      clicks: sum('clicks'),
      ctr: impressions ? sum('clicks') / impressions : 0,
      conversions: sum('conversions'),
      cost: sum('cost'),
    },
  };
};

const lead = (r: AdsReport, key: string) => buildAdsInsights(r).leads.find((l) => l.key === key)!;

describe('the result', () => {
  it('reports conversions as good when there are some', () => {
    const { lag } = buildAdsInsights(report([campaign()]));
    expect(lag.value).toBe('4');
    expect(lag.state).toBe('good');
    expect(lag.meaning).toContain('4 conversions from 80 clicks');
  });

  it('will not judge results on too few impressions', () => {
    const { lag } = buildAdsInsights(report([campaign({ impressions: 40, clicks: 2, conversions: 0 })]));
    expect(lag.state).toBe('unknown');
    expect(lag.meaning).toContain('only 40 times');
  });

  it('flags plenty of clicks with no conversions', () => {
    const { lag } = buildAdsInsights(report([campaign({ clicks: 60, conversions: 0 })]));
    expect(lag.state).toBe('bad');
    expect(lag.action).toContain('Submit each form');
  });

  it('holds off on a few clicks with no conversions', () => {
    expect(buildAdsInsights(report([campaign({ clicks: 10, conversions: 0 })])).lag.state).toBe('warn');
  });
});

describe('what drives it', () => {
  it('flags when no campaign is running', () => {
    expect(lead(report([campaign({ status: 'PAUSED' })]), 'impressions').state).toBe('bad');
  });

  it('holds off on click rate under 100 impressions', () => {
    const c = lead(report([campaign({ impressions: 99, clicks: 1, ctr: 0.01 })]), 'ctr');
    expect(c.state).toBe('unknown');
  });

  it('treats exactly 5% as meeting the requirement', () => {
    expect(lead(report([campaign({ impressions: 100, clicks: 5, ctr: 0.05 })]), 'ctr').state).toBe('good');
  });

  it('names the running campaign with the lowest click rate', () => {
    const c = lead(report([
      campaign({ name: 'Good', impressions: 1000, clicks: 20, ctr: 0.02 }),
      campaign({ name: 'Worst', impressions: 1000, clicks: 10, ctr: 0.01 }),
      campaign({ name: 'Paused', status: 'PAUSED', impressions: 1000, clicks: 1, ctr: 0.001 }),
    ]), 'ctr');
    expect(c.state).toBe('bad');
    expect(c.action).toContain('"Worst"');
  });

  it('compares yesterday with the 30-day average', () => {
    const c = lead(report([campaign({ clicks: 300, clicksYesterday: 2 })]), 'clicks');
    expect(c.meaning).toBe('2 clicks yesterday, against a 30-day average of 10.0 a day.');
    expect(c.state).toBe('warn');
  });
});

describe('which campaign next', () => {
  it('picks the best conversion rate among running campaigns', () => {
    const { decision } = buildAdsInsights(report([
      campaign({ name: 'Low', clicks: 100, conversions: 1 }),
      campaign({ name: 'High', clicks: 100, conversions: 5 }),
      campaign({ name: 'Paused', status: 'PAUSED', clicks: 100, conversions: 50 }),
    ]));
    expect(decision.text).toContain('"High"');
    expect(decision.confidence).toBe('medium');
  });

  it('ignores a lucky conversion on very few clicks', () => {
    const { decision } = buildAdsInsights(report([campaign({ clicks: 5, conversions: 1 })]));
    expect(decision.confidence).toBeNull();
    expect(decision.text).toContain('No call yet');
  });

  it('makes no call on an empty report', () => {
    const insights = buildAdsInsights(report([]));
    expect(insights.decision.confidence).toBeNull();
    expect(insights.lag.state).toBe('unknown');
  });
});

describe('honesty', () => {
  it('says what the report cannot show', () => {
    const { notReported } = buildAdsInsights(report([campaign()]));
    expect(notReported.join(' ')).toContain('last week');
    expect(notReported.join(' ')).toContain('Sponsor logo views');
  });

  it('shows the working for the click rate', () => {
    const { checks } = buildAdsInsights(report([campaign()]));
    expect(checks.find((c) => c.label === 'Click rate')!.working).toBe('80 clicks ÷ 1,000 times shown = 8.0%');
  });
});

describe('sponsor update', () => {
  it('holds totals and a limit, and leaves out spending and campaign names', () => {
    const brief = buildAdsInsights(report([campaign({ name: 'Private name', cost: 4321.09 })])).sponsorBrief!;
    expect(brief).toContain('the 30 days to 2026-11-02:');
    expect(brief).not.toContain('09:00');
    expect(brief).toContain('shown 1,000 times, 80 clicks, 4 conversions');
    expect(brief).toContain('do not measure any sponsor');
    expect(brief).not.toContain('$');
    expect(brief).not.toContain('4321');
    expect(brief).not.toContain('Private name');
  });

  it('is withheld under 100 impressions', () => {
    expect(buildAdsInsights(report([campaign({ impressions: 99 })])).sponsorBrief).toBeNull();
  });

  it('does not invent a date', () => {
    expect(buildAdsInsights(report([campaign()], null)).sponsorBrief).toContain('the last 30 days');
    expect(buildAdsInsights(report([campaign()], 'yesterday')).sponsorBrief).toContain('the last 30 days');
  });
});
