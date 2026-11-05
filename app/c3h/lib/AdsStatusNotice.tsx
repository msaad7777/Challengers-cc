import type { AdsUpdateStatus } from '@/lib/ads-report';

export default function AdsStatusNotice({ status, littleActivity, impressions }: {
  status: AdsUpdateStatus | null;
  littleActivity: boolean;
  impressions: number;
}) {
  if (status?.stale) {
    return (
      <div className="rounded-2xl p-5 mb-6 border border-amber-500/40 bg-amber-500/10 text-sm text-amber-100">
        <h2 className="font-semibold text-amber-200 mb-1">This report may be out of date</h2>
        It last updated {status.updated} London time, and it normally updates every hour. Check the script
        history in Google Ads.
      </div>
    );
  }
  if (!status || !littleActivity) return null;
  return (
    <div className="glass rounded-2xl p-5 mb-6 border border-white/10 text-sm text-gray-300">
      <h2 className="font-semibold text-white mb-1">Very little ad activity so far</h2>
      The report is up to date, but Google has shown the ads only {impressions.toLocaleString()}{' '}
      {impressions === 1 ? 'time' : 'times'} in the last 30 days, so these numbers will barely change for now.
    </div>
  );
}
