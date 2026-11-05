// Turns the Ads report into a lead-and-lag scorecard: the result the club wants
// (lag), the activity that drives it (leads), and a plain sentence on what each
// number means and what to do next. It only reads numbers in the report. Anything
// the report doesn't hold is listed in `notReported`, never estimated.
import type { AdsCampaign, AdsReport } from './ads-report';

export const CTR_TARGET = 0.05;
// Below these counts a rate says more about chance than about the ads.
export const MIN_IMPRESSIONS = 100;
export const MIN_CLICKS_TO_JUDGE = 50;
export const MIN_CLICKS_TO_RECOMMEND = 20;

export type InsightState = 'good' | 'warn' | 'bad' | 'unknown';

export type Insight = {
  key: string;
  label: string;
  value: string;
  state: InsightState;
  meaning: string;
  action: string;
};

export type AdsInsights = {
  summary: string[];
  lag: Insight;
  leads: Insight[];
  decision: { text: string; confidence: 'low' | 'medium' | 'high' | null };
  checks: { label: string; working: string }[];
  notReported: string[];
  sponsorBrief: string | null;
};

const int = (n: number) => Math.round(n).toLocaleString('en-CA');
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const times = (n: number, word: string) => `${int(n)} ${word}${n === 1 ? '' : 's'}`;

function conversionsInsight(r: AdsReport): Insight {
  const { impressions, clicks, conversions } = r.totals;
  const base = { key: 'conversions', label: 'Conversions', value: int(conversions) };
  if (impressions < MIN_IMPRESSIONS) {
    return {
      ...base,
      state: 'unknown',
      meaning: `The ads were shown only ${times(impressions, 'time')}, too few to judge results.`,
      action: 'Find out why the ads are rarely shown before changing anything else.',
    };
  }
  if (conversions > 0) {
    return {
      ...base,
      state: 'good',
      meaning: `${times(conversions, 'conversion')} from ${times(clicks, 'click')} in 30 days.`,
      action: 'Reply to every new enquiry, then see which campaign produced them.',
    };
  }
  if (clicks >= MIN_CLICKS_TO_JUDGE) {
    return {
      ...base,
      state: 'bad',
      meaning: `${times(clicks, 'click')} and no conversions, so visitors are arriving but not acting.`,
      action: 'Submit each form yourself and check that the conversion is recorded.',
    };
  }
  return {
    ...base,
    state: 'warn',
    meaning: `No conversions yet, but ${times(clicks, 'click')} is too few to judge.`,
    action: 'Work on clicks first.',
  };
}

function reachInsight(r: AdsReport): Insight {
  const running = r.campaigns.filter((c) => c.status === 'ENABLED').length;
  const base = { key: 'impressions', label: 'Times shown', value: int(r.totals.impressions) };
  if (running === 0) {
    return {
      ...base,
      state: 'bad',
      meaning: 'No campaign is running.',
      action: 'Decide whether that is intended. If not, turn a campaign on in Google Ads.',
    };
  }
  if (r.totals.impressions < MIN_IMPRESSIONS) {
    return {
      ...base,
      state: 'warn',
      meaning: `${times(running, 'campaign')} running, but Google has rarely shown the ads.`,
      action: 'Check the campaign status and keywords in Google Ads.',
    };
  }
  return {
    ...base,
    state: 'good',
    meaning: `${times(running, 'campaign')} running.`,
    action: 'Nothing needed here.',
  };
}

function weakestCampaign(campaigns: AdsCampaign[]): AdsCampaign | null {
  const judged = campaigns.filter((c) => c.status === 'ENABLED' && c.impressions >= MIN_IMPRESSIONS);
  return judged.reduce<AdsCampaign | null>((low, c) => (!low || c.ctr < low.ctr ? c : low), null);
}

function ctrInsight(r: AdsReport): Insight {
  const { impressions, ctr } = r.totals;
  const base = { key: 'ctr', label: 'Click rate', value: pct(ctr) };
  if (impressions < MIN_IMPRESSIONS) {
    return {
      ...base,
      state: 'unknown',
      meaning: `Google requires ${pct(CTR_TARGET)}, but ${times(impressions, 'view')} is too few to judge.`,
      action: 'Check again once the ads have been shown at least 100 times.',
    };
  }
  if (ctr < CTR_TARGET) {
    const weakest = weakestCampaign(r.campaigns);
    return {
      ...base,
      state: 'bad',
      meaning: `Below the ${pct(CTR_TARGET)} Google requires for Ad Grants.`,
      action: weakest
        ? `Start with "${weakest.name}", the lowest at ${pct(weakest.ctr)}.`
        : 'Review the ads and keywords in Google Ads.',
    };
  }
  return {
    ...base,
    state: 'good',
    meaning: `Above the ${pct(CTR_TARGET)} Google requires for Ad Grants.`,
    action: 'Keep the current ads running.',
  };
}

function clicksInsight(r: AdsReport): Insight {
  const yesterday = r.campaigns.reduce((t, c) => t + c.clicksYesterday, 0);
  const average = r.totals.clicks / 30;
  const base = { key: 'clicks', label: 'Clicks', value: int(r.totals.clicks) };
  const meaning = `${times(yesterday, 'click')} yesterday, against a 30-day average of ${average.toFixed(1)} a day.`;
  if (r.totals.clicks < MIN_CLICKS_TO_JUDGE) {
    return { ...base, state: 'unknown', meaning, action: 'Too few clicks to read a trend yet.' };
  }
  if (yesterday < average / 2) {
    return { ...base, state: 'warn', meaning, action: 'One slow day can be chance. Look again tomorrow.' };
  }
  return { ...base, state: 'good', meaning, action: 'Nothing needed here.' };
}

function decide(r: AdsReport): AdsInsights['decision'] {
  const running = r.campaigns.filter((c) => c.status === 'ENABLED');
  const best = running
    .filter((c) => c.conversions > 0 && c.clicks >= MIN_CLICKS_TO_RECOMMEND)
    .sort((a, b) => b.conversions / b.clicks - a.conversions / a.clicks)[0];
  if (best) {
    return {
      text: `Give "${best.name}" the most attention: ${times(best.conversions, 'conversion')} from ${times(best.clicks, 'click')}, the best rate of any running campaign.`,
      confidence: best.clicks >= 500 ? 'high' : best.clicks >= 100 ? 'medium' : 'low',
    };
  }
  const weakest = weakestCampaign(r.campaigns);
  if (weakest && weakest.ctr < CTR_TARGET) {
    return {
      text: `Fix "${weakest.name}" first: its click rate of ${pct(weakest.ctr)} is under the ${pct(CTR_TARGET)} Google requires.`,
      confidence: 'medium',
    };
  }
  return { text: 'No call yet. The report does not hold enough results to compare campaigns.', confidence: null };
}

function sponsorBrief(r: AdsReport): string | null {
  const { impressions, clicks, conversions } = r.totals;
  if (impressions < MIN_IMPRESSIONS) return null;
  const asOf = r.updated ? `the 30 days to ${r.updated}` : 'the last 30 days';
  return (
    `Challengers Cricket Club's Google Ads, ${asOf}: shown ${times(impressions, 'time')}, ` +
    `${times(clicks, 'click')}, ${times(conversions, 'conversion')}. ` +
    'These totals are for the club\'s own ads. They do not measure any sponsor\'s logo or brand.'
  );
}

export function buildAdsInsights(r: AdsReport): AdsInsights {
  const { impressions, clicks, ctr, conversions } = r.totals;
  const lag = conversionsInsight(r);
  const leads = [reachInsight(r), ctrInsight(r), clicksInsight(r)];
  const decision = decide(r);
  const rows = `${times(r.campaigns.length, 'campaign')} in the report`;
  return {
    summary: [
      `Result: ${lag.meaning}`,
      `Activity: shown ${times(impressions, 'time')}, ${times(clicks, 'click')}, ${pct(ctr)} click rate.`,
      `Next: ${decision.text}`,
    ],
    lag,
    leads,
    decision,
    checks: [
      { label: 'Conversions', working: `Added up from ${rows} = ${int(conversions)}` },
      {
        label: 'Click rate',
        working: `${int(clicks)} clicks ÷ ${int(impressions)} times shown = ${pct(ctr)}`,
      },
      {
        label: 'Daily click average',
        working: `${int(clicks)} clicks ÷ 30 days = ${(clicks / 30).toFixed(1)}`,
      },
    ],
    notReported: [
      'This week against last week. The report holds 30-day totals and yesterday only.',
      'Sponsor logo views or sponsor sales. Google Ads does not measure these.',
    ],
    sponsorBrief: sponsorBrief(r),
  };
}
