"use client";

import { useSyncExternalStore } from "react";
import { SITE } from "@/lib/site";

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 60_000);
  return () => clearInterval(id);
};
// Minute resolution keeps the snapshot stable between ticks.
const now = () => Math.floor(Date.now() / 60_000);

export function Countdown() {
  const minute = useSyncExternalStore(subscribe, now, () => null);
  if (minute === null) return <span className="invisible">—</span>;

  const t = minute * 60_000;
  const start = Date.parse(SITE.start);
  const end = Date.parse(SITE.end);

  if (t >= end) return <span>See you at the next Quark Matter!</span>;
  if (t >= start) return <span>🔴 Happening now in Jeju</span>;

  const days = Math.ceil((start - t) / 86_400_000);
  return (
    <span>
      <b className="tabular-nums">{days}</b> {days === 1 ? "day" : "days"} to go
    </span>
  );
}
