"use client";

import { useState } from "react";
import { LazyMap } from "@/components/map/LazyMap";
import { PLACES } from "@/data/places";
import { CONFERENCE, SEASON, overlapsConference, seasonPos } from "@/data/season";

const TICKS = ["03-01", "03-15", "04-01", "04-15"];
const fmt = (mmdd: string) =>
  new Date(Date.UTC(2027, Number(mmdd.slice(0, 2)) - 1, Number(mmdd.slice(3)))).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

export function SeasonTimeline() {
  const [selectedId, setSelectedId] = useState(SEASON[0].id);
  const selected = SEASON.find((s) => s.id === selectedId)!;
  const spots = PLACES.filter((p) => selected.places.includes(p.id));
  const confLeft = seasonPos(CONFERENCE.from) * 100;
  const confWidth = (seasonPos(CONFERENCE.to) - seasonPos(CONFERENCE.from)) * 100 + 100 / 51;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        {/* Gantt-style timeline. The name column stacks above the bar on phones. */}
        <div className="relative">
          <div className="relative mt-5 mr-2 ml-2 h-6 text-xs text-muted sm:ml-[12.5rem]">
            {TICKS.map((t) => (
              <span key={t} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${seasonPos(t) * 100}%` }}>
                {fmt(t)}
              </span>
            ))}
            <span
              className="absolute -top-5 -translate-x-1/2 text-xs font-semibold whitespace-nowrap text-tangerine"
              style={{ left: `${confLeft + confWidth / 2}%` }}
            >
              QM2027 ▾
            </span>
          </div>
          <ul className="space-y-1">
            {SEASON.map((s) => {
              const left = seasonPos(s.from) * 100;
              const width = (seasonPos(s.to) - seasonPos(s.from)) * 100 + 100 / 51;
              const status = overlapsConference(s);
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSelectedId(s.id)}
                    aria-pressed={s.id === selectedId}
                    className="grid w-full items-center gap-1 rounded-xl p-2 text-left aria-pressed:bg-sea/10 sm:grid-cols-[11rem_1fr] sm:gap-4"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span aria-hidden>{s.emoji}</span>
                      <span className="truncate">{s.title}</span>
                      {status === "peak" && <span className="shrink-0 rounded bg-canola/30 px-1 text-[10px]">PEAK</span>}
                    </span>
                    <span className="relative block h-5">
                      {/* Conference week, repeated per row so it never covers the labels */}
                      <span
                        className="absolute -inset-y-1 border-x-2 border-dashed border-tangerine bg-tangerine/10"
                        style={{ left: `${confLeft}%`, width: `${confWidth}%` }}
                      />
                      <span
                        className="absolute inset-y-1 rounded-full opacity-40"
                        style={{ left: `${left}%`, width: `${width}%`, background: s.kind === "festival" ? "var(--tangerine)" : s.kind === "food" ? "var(--canola)" : "#16a34a" }}
                      />
                      {s.peak && (
                        <span
                          className="absolute inset-y-0 rounded-full"
                          style={{
                            left: `${seasonPos(s.peak[0]) * 100}%`,
                            width: `${(seasonPos(s.peak[1]) - seasonPos(s.peak[0])) * 100}%`,
                            background: "#16a34a",
                          }}
                        />
                      )}
                      {s.confirm && <span className="absolute -top-0.5 text-[10px] text-muted" style={{ left: `calc(${left + width}% + 4px)` }}>TBC</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="mt-4 text-xs text-muted">
          Bars show typical windows from past years; darker parts are the usual peak. Nature does not read our schedule.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-3xl" aria-hidden>{selected.emoji}</p>
          <h2 className="mt-2 text-xl font-semibold">{selected.title}</h2>
          <p className="text-muted" lang="ko">{selected.titleKo}</p>
          <p className="mt-1 text-sm font-medium">
            {fmt(selected.from)} – {fmt(selected.to)}
            {selected.confirm && <span className="ml-2 text-tangerine">· 2027 dates to be confirmed</span>}
          </p>
          <p className="mt-3 leading-relaxed">{selected.text}</p>
          <p className="mt-3 text-sm">
            {{ peak: "✅ Likely at its best during the conference.", yes: "🟡 Overlaps the conference week.", no: "⚪ Outside the conference week. Plan extra days for this." }[overlapsConference(selected)]}
          </p>
        </div>
        {spots.length > 0 && (
          <div className="h-72 overflow-hidden rounded-2xl border border-border">
            <LazyMap places={spots} onSelect={() => {}} route={spots.length > 1 ? spots : []} />
          </div>
        )}
      </div>
    </div>
  );
}
