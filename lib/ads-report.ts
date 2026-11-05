// Parses the "Dashboard" tab that the Google Ads Script
// (challengers-outreach/2027/google-ads/ads-agent.js) writes, published from
// Google Sheets as CSV. Rows are typed: campaign, alert, change or metric.
// A metric row carries one account-level number: name = key, note = value
// (e.g. cost_mtd, conv_signup_30d, players_registered_total).

// Google Ad Grants: up to $10,000 USD a month, spent at most ~$329 a day.
export const GRANT_MONTHLY_USD = 10000;
export const GRANT_DAILY_CAP_USD = 329;

export type AdsCampaign = {
  name: string;
  status: string;
  dailyBudget: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cost: number;
  clicksYesterday: number;
};

export type AdsReport = {
  campaigns: AdsCampaign[];
  alerts: string[];
  changes: string[];
  updated: string | null;
  metrics: Record<string, number>;
  totals: { impressions: number; clicks: number; ctr: number; conversions: number; cost: number };
};

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const num = (v: string | undefined) => {
  const n = Number(String(v ?? '').replace(/[$,%]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export function parseAdsReport(csv: string): AdsReport {
  const [header, ...rows] = parseCsv(csv);
  const col = (name: string) => (header ?? []).indexOf(name);
  const get = (r: string[], name: string) => r[col(name)] ?? '';

  const campaigns: AdsCampaign[] = [];
  const alerts: string[] = [];
  const changes: string[] = [];
  const metrics: Record<string, number> = {};
  let updated: string | null = null;

  for (const r of rows) {
    const type = get(r, 'type');
    updated = get(r, 'updated') || updated;
    if (type === 'alert') alerts.push(get(r, 'note'));
    else if (type === 'change') changes.push(get(r, 'note'));
    else if (type === 'metric' && get(r, 'name')) metrics[get(r, 'name')] = num(get(r, 'note'));
    else if (type === 'campaign') {
      // Sheets may publish the CTR as 0.052 or, if the cell was formatted, as 5.2%.
      const rawCtr = get(r, 'ctr_30d');
      const ctr = rawCtr.includes('%') ? num(rawCtr) / 100 : num(rawCtr);
      campaigns.push({
        name: get(r, 'name'),
        status: get(r, 'status'),
        dailyBudget: num(get(r, 'daily_budget')),
        impressions: num(get(r, 'impressions_30d')),
        clicks: num(get(r, 'clicks_30d')),
        ctr,
        conversions: num(get(r, 'conversions_30d')),
        cost: num(get(r, 'cost_30d')),
        clicksYesterday: num(get(r, 'clicks_yesterday')),
      });
    }
  }

  const sum = (k: 'impressions' | 'clicks' | 'conversions' | 'cost') =>
    campaigns.reduce((t, c) => t + c[k], 0);
  const impressions = sum('impressions');
  const clicks = sum('clicks');
  return {
    campaigns,
    alerts,
    changes,
    updated,
    metrics,
    totals: {
      impressions,
      clicks,
      ctr: impressions ? clicks / impressions : 0,
      conversions: sum('conversions'),
      cost: Math.round(sum('cost') * 100) / 100,
    },
  };
}

// The script stamps each row in the Ads account's time zone (Newfoundland) with
// no offset, and runs hourly. The dashboard shows the time in London, Ontario.
const ACCOUNT_TIME_ZONE = 'America/St_Johns';
const CLUB_TIME_ZONE = 'America/Toronto';
const HOUR_MS = 60 * 60 * 1000;
const STALE_AFTER_MS = 3 * HOUR_MS;

function zoneOffsetMs(timeZone: string, at: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
  }).formatToParts(at);
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'), part('second')) - at;
}

export function parseAdsTimestamp(text: string | null): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec((text ?? '').trim());
  if (!m) return null;
  const wall = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  const guess = wall - zoneOffsetMs(ACCOUNT_TIME_ZONE, wall);
  return wall - zoneOffsetMs(ACCOUNT_TIME_ZONE, guess);
}

const clubTime = (at: number) =>
  new Date(at).toLocaleTimeString('en-CA', { timeZone: CLUB_TIME_ZONE, hour: 'numeric', minute: '2-digit' });
const clubDay = (at: number) =>
  new Date(at).toLocaleDateString('en-CA', { timeZone: CLUB_TIME_ZONE, month: 'short', day: 'numeric' });

export type AdsUpdateStatus = {
  stale: boolean;
  // "8:14 p.m." today, "Nov. 3, 8:14 p.m." on any other day. London, Ontario time.
  updated: string;
  // Null once the next run is due, so the page never promises a time already past.
  next: string | null;
};

export function adsUpdateStatus(updated: string | null, now: number): AdsUpdateStatus | null {
  const at = parseAdsTimestamp(updated);
  if (at === null) return null;
  const next = at + HOUR_MS;
  return {
    stale: now - at > STALE_AFTER_MS,
    updated: clubDay(at) === clubDay(now) ? clubTime(at) : `${clubDay(at)}, ${clubTime(at)}`,
    next: next > now ? clubTime(next) : null,
  };
}

// Too few impressions for the numbers to move from one hour to the next.
export const hasLittleAdActivity = (totals: AdsReport['totals']) =>
  totals.clicks === 0 && totals.impressions < 100;

export type AdsBriefing = {
  // The result the ads exist to drive. Null when the sheet doesn't report it.
  playersRegistered: { total: number; last30Days: number | null } | null;
  notes: string[];
};

// One plain sentence per driver: what the number means and what to do about it.
export function adsBriefing(report: AdsReport): AdsBriefing {
  const { clicks, impressions, ctr, conversions } = report.totals;
  const { players_registered_total: total, players_registered_30d: recent, cost_mtd: spent } = report.metrics;
  const percent = (n: number) => `${(n * 100).toFixed(1)}%`;
  const notes: string[] = [];

  if (impressions < 100) {
    notes.push(`Only ${impressions} impressions in 30 days, too few to judge CTR. Check that campaigns are running.`);
  } else if (ctr < 0.05) {
    notes.push(`CTR is ${percent(ctr)}, below Google's 5% minimum. Rewrite or pause the weakest ads.`);
  } else {
    notes.push(`CTR is ${percent(ctr)}, above Google's 5% minimum. No change needed.`);
  }

  if (clicks >= 100 && conversions === 0) {
    notes.push(`${clicks} clicks and no conversions. Check conversion tracking and the page the ads link to.`);
  } else if (clicks > 0) {
    notes.push(`${conversions} conversions from ${clicks} clicks (${percent(conversions / clicks)}).`);
  }

  if (spent !== undefined) {
    const nearLimit = spent >= GRANT_MONTHLY_USD * 0.9;
    notes.push(
      `$${Math.round(spent).toLocaleString('en-CA')} of the $${GRANT_MONTHLY_USD.toLocaleString('en-CA')} grant used this month. ` +
        (nearLimit ? 'Close to the limit, so keep the best campaigns funded.' : 'Budget is not what limits results.'),
    );
  }

  return {
    playersRegistered: total === undefined ? null : { total, last30Days: recent ?? null },
    notes,
  };
}
