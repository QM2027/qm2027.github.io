"use client";

import { useState, useSyncExternalStore } from "react";
import { SITE } from "@/lib/site";

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 1_000);
  return () => clearInterval(id);
};
// Second resolution keeps the snapshot stable between ticks.
const nowAt = (offset: number) => () => Math.floor((Date.now() + offset) / 1_000);

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

/**
 * Current look: days, hours, minutes and seconds ticking in four cells. Plain look: the days in
 * type, with what they count down to; a clock running in seconds says nothing a visitor plans by.
 */
function Until({ values }: { values: [string, string, string, string] }) {
  const days = Number(values[0]);
  return (
    <>
      <div className="plain:hidden">
        <Units values={values} />
        <p className="mt-3 font-mono text-xs text-muted">Until the opening, 21 March 08:30 Korea time (KST)</p>
      </div>
      <p className="hidden plain:block" aria-hidden="true">
        <span className="block font-serif text-4xl font-semibold tabular-nums">
          {days >= 1 ? `${days} ${days === 1 ? "day" : "days"}` : "Today"}
        </span>
        <span className="mt-1 block text-muted">until the opening on 21 March at 08:30 Korea time (KST)</span>
      </p>
    </>
  );
}

/** `from`: a pinned clock (the preview's `?now=`), from which the countdown then runs on. */
export function Countdown({ from }: { from?: number } = {}) {
  const [offset] = useState(() => (from === undefined ? 0 : from - Date.now()));
  const second = useSyncExternalStore(subscribe, nowAt(offset), () => null);

  // Same footprint before hydration, so the hero does not shift.
  if (second === null) {
    return (
      <div className="invisible">
        <Until values={["000", "00", "00", "00"]} />
      </div>
    );
  }

  const t = second * 1_000;

  if (t >= END) return <p className="font-mono text-sm text-muted plain:font-sans plain:text-base">The conference has ended.</p>;

  if (t >= START) {
    const day = Math.min(TOTAL_DAYS, Math.floor((t - START) / DAY) + 1);
    return (
      <p className="font-mono text-sm text-muted plain:font-sans plain:text-base">
        <span className="text-foreground">The conference is on now</span>
        <span className="plain:hidden"> · day</span>
        <span className="hidden plain:inline">, day</span> {day} of {TOTAL_DAYS}
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
      <Until values={[String(d), pad(h), pad(m), pad(s)]} />
    </div>
  );
}
