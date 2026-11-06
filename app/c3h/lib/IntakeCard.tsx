"use client";

import { useEffect, useState } from 'react';

type Badge = { waiting: number; unread: number };

const REFRESH_MS = 60_000;

// The Registrations & Enquiries card on the C3H home grid, for directors. It
// reads counts only from /api/c3h/intake/badge and refreshes every minute
// while the tab is visible, and when the director comes back to it.
export default function IntakeCard() {
  const [badge, setBadge] = useState<Badge | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const res = await fetch('/api/c3h/intake/badge', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled && res.ok && data.configured && !data.error) {
          setBadge({ waiting: data.waiting, unread: data.unread });
        }
      } catch {
        // Keep the last counts. The card still opens the page.
      }
    };
    load();
    const timer = setInterval(load, REFRESH_MS);
    document.addEventListener('visibilitychange', load);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', load);
    };
  }, []);

  const unread = badge?.unread ?? 0;
  const waiting = badge?.waiting ?? 0;
  const label = unread > 0
    ? `Registrations and Enquiries, ${unread} unread, ${waiting} waiting for a follow-up`
    : waiting > 0
      ? `Registrations and Enquiries, ${waiting} waiting for a follow-up`
      : undefined;

  return (
    <a
      href="/c3h/intake"
      aria-label={label}
      className="relative glass rounded-2xl p-6 border-2 border-accent-500/20 hover:border-accent-500/50 transition-all group"
    >
      {unread > 0 && (
        <span className="absolute top-4 right-4 min-w-[1.5rem] h-6 px-2 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
          {unread}
        </span>
      )}
      <div className="text-3xl mb-3">📥</div>
      <h2 className="text-xl font-bold text-white mb-1">Registrations &amp; Enquiries</h2>
      <p className="text-accent-400 text-xs font-medium mb-3">Directors · New players and sponsors</p>
      <p className="text-gray-400 text-sm mb-4">
        Follow up new player registrations and sponsor enquiries, confirm payments and open portal access.
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
          Open
        </span>
        {unread > 0 && (
          <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
            {unread} new since you last looked
          </span>
        )}
        {waiting > 0 && (
          <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10">
            {waiting} waiting for a follow-up
          </span>
        )}
      </div>
    </a>
  );
}
