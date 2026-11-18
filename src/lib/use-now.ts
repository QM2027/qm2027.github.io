"use client";

import { useEffect, useState } from "react";

/**
 * The current time, updated every minute so "now" badges stay current. Undefined until mounted:
 * the static export has no clock, so time-dependent UI renders on the client only.
 */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState<number>();
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/**
 * `?now=<ISO time>` pins the clock, to check "now / next" against a past program
 * (e.g. `?now=2025-04-08T14:30:00+02:00` with the QM2025 preview).
 */
export function pinnedNow(param: string | null, live: number | undefined) {
  const pinned = param ? Date.parse(param) : NaN;
  return Number.isNaN(pinned) ? live : pinned;
}
