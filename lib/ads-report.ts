// Parses the "Dashboard" tab that the Google Ads Script
// (challengers-outreach/2027/google-ads/ads-agent.js) writes, published from
// Google Sheets as CSV. Rows are typed: campaign, alert or change.

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
  let updated: string | null = null;

  for (const r of rows) {
    const type = get(r, 'type');
    updated = get(r, 'updated') || updated;
    if (type === 'alert') alerts.push(get(r, 'note'));
    else if (type === 'change') changes.push(get(r, 'note'));
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
    totals: {
      impressions,
      clicks,
      ctr: impressions ? clicks / impressions : 0,
      conversions: sum('conversions'),
      cost: Math.round(sum('cost') * 100) / 100,
    },
  };
}
