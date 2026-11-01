// Shared building blocks for the committee dashboards (/c3h/overview,
// /c3h/ads, /c3h/outreach): a titled panel, a KPI tile and a progress meter.
// Values stay in white/grey ink; colour is only used for status, and status
// always comes with an icon and a word so it never relies on colour alone.
import type { ReactNode } from 'react';

export type Status = 'good' | 'warn' | 'bad';

const STATUS: Record<Status, { icon: string; word: string; cls: string; bar: string }> = {
  good: { icon: '✓', word: 'On track', cls: 'text-green-300 bg-green-500/10 border-green-500/30', bar: 'bg-green-400' },
  warn: { icon: '!', word: 'Watch', cls: 'text-amber-200 bg-amber-500/10 border-amber-500/30', bar: 'bg-amber-400' },
  bad: { icon: '✕', word: 'Act now', cls: 'text-red-200 bg-red-500/10 border-red-500/40', bar: 'bg-red-400' },
};

export function StatusPill({ status, label }: { status: Status; label?: string }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>
      <span aria-hidden>{s.icon}</span>{label || s.word}
    </span>
  );
}

export function Panel({ title, subtitle, icon, action, children }: {
  title: string; subtitle?: string; icon?: string; action?: ReactNode; children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          {icon && <div className="text-2xl" aria-hidden>{icon}</div>}
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function Kpi({ label, value, sub, status, statusLabel, hero }: {
  label: string; value: ReactNode; sub?: ReactNode; status?: Status; statusLabel?: string; hero?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4 flex flex-col gap-1 min-w-0">
      <span className="text-[11px] uppercase tracking-wider text-gray-400">{label}</span>
      <div className={`${hero ? 'text-3xl sm:text-4xl' : 'text-2xl'} font-bold text-white tabular-nums truncate`}>{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
      {status && <div className="mt-1"><StatusPill status={status} label={statusLabel} /></div>}
    </div>
  );
}

// value/max as a bar, e.g. grant spent vs allocated.
export function Meter({ label, value, max, format, status = 'good', note }: {
  label: string; value: number; max: number; format: (n: number) => string; status?: Status; note?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm mb-1.5">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-semibold tabular-nums">
          {format(value)} <span className="text-gray-500 font-normal">of {format(max)}</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
        <div className={`h-full rounded-full ${STATUS[status].bar}`} style={{ width: `${pct}%` }} />
      </div>
      {note && <div className="text-xs text-gray-500 mt-1">{note}</div>}
    </div>
  );
}

export const fmt = {
  int: (n: number) => Math.round(n).toLocaleString('en-CA'),
  usd: (n: number) => `$${n.toLocaleString('en-CA', { minimumFractionDigits: n < 100 ? 2 : 0, maximumFractionDigits: n < 100 ? 2 : 0 })}`,
  pct: (n: number) => `${(n * 100).toFixed(1)}%`,
  date: (d: string | null | undefined) =>
    d ? new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' }) : '—',
};
