"use client";

import { useSyncExternalStore } from "react";
import { SITE } from "@/lib/site";

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 1_000);
  return () => clearInterval(id);
};
// Second resolution keeps the snapshot stable between ticks.
const now = () => Math.floor(Date.now() / 1_000);

const DAY = 86_400_000;
const START = Date.parse(SITE.start);
const END = Date.parse(SITE.end);
const TOTAL_DAYS = Math.round((END - START) / DAY) + 1;

const pad = (n: number) => String(n).padStart(2, "0");

function Units({ values }: { values: [string, string, string, string] }) {
  const labels = ["Days", "Hours", "Minutes", "Seconds"];
  return (
    <div className="grid w-full max-w-md grid-cols-4 border-y border-border" aria-hidden="true">
      {values.map((v, i) => (
        <div key={labels[i]} className={`py-3 ${i > 0 ? "border-l border-border pl-3 sm:pl-4" : ""}`}>
          <div className="font-mono text-3xl leading-none tabular-nums sm:text-4xl">{v}</div>
          <div className="mt-2 font-mono text-[0.7rem] tracking-wider text-muted uppercase">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

export function Countdown() {
  const second = useSyncExternalStore(subscribe, now, () => null);

  // Same footprint before hydration, so the hero does not shift.
  if (second === null) {
    return (
      <div className="invisible">
        <Units values={["000", "00", "00", "00"]} />
        <p className="mt-3 font-mono text-xs">—</p>
      </div>
    );
  }

  const t = second * 1_000;

  if (t >= END) return <p className="font-mono text-sm text-muted">The conference has ended.</p>;

  if (t >= START) {
    const day = Math.min(TOTAL_DAYS, Math.floor((t - START) / DAY) + 1);
    return (
      <p className="font-mono text-sm text-muted">
        <span className="text-foreground">The conference is on now</span> · day {day} of {TOTAL_DAYS}
      </p>
    );
  }

  const left = Math.floor((START - t) / 1_000);
  const d = Math.floor(left / 86_400);
  const h = Math.floor((left % 86_400) / 3_600);
  const m = Math.floor((left % 3_600) / 60);
  const s = left % 60;

  return (
    <div role="timer" aria-label={`${d} ${d === 1 ? "day" : "days"} until the conference opens`}>
      <Units values={[String(d), pad(h), pad(m), pad(s)]} />
      <p className="mt-3 font-mono text-xs text-muted">Until the opening, 21 March 08:30 Korea time (KST)</p>
    </div>
  );
}
