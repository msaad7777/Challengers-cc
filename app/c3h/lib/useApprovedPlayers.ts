"use client";

import { useEffect, useMemo, useState } from 'react';
import { ApprovedPlayer, mergeApprovedPlayers } from '@/lib/c3h-roster';

// The code roster plus players directors approved at /c3h/intake. Until the list
// loads, or if it can't be loaded, this is just the code roster.
export function useApprovedPlayers() {
  const [approved, setApproved] = useState<ApprovedPlayer[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/c3h/roster', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : { players: [] }))
      .then(data => active && setApproved(data.players ?? []))
      .catch(() => undefined)
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  return { ...useMemo(() => mergeApprovedPlayers(approved), [approved]), ready };
}
