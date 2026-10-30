"use client";

import { useMemo, useState } from "react";
import { LazyMap } from "@/components/map/LazyMap";
import { CITIES, SATELLITES, TRIPS } from "@/data/korea";

export function KoreaTrips() {
  const [tripId, setTripId] = useState(TRIPS[0].id);
  const trip = TRIPS.find((t) => t.id === tripId)!;
  const stops = useMemo(() => trip.stops.map((id) => CITIES[id]), [trip]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_440px]">
      <div className="space-y-4">
        <div role="tablist" aria-label="Trip" className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {TRIPS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === tripId}
              onClick={() => setTripId(t.id)}
              className="rounded-2xl border border-border bg-surface p-3 text-left aria-selected:border-sea aria-selected:ring-2 aria-selected:ring-sea/30"
            >
              <span className="block text-sm font-semibold">{t.title}</span>
              <span className="block text-xs text-muted">{t.when}</span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold">{trip.title}</h2>
          <p className="mt-2 leading-relaxed">{trip.text}</p>
          <ol className="mt-4 space-y-2">
            {trip.legs.map((leg) => (
              <li key={leg} className="flex gap-2 text-sm">
                <span className="text-sea">→</span>
                {leg}
              </li>
            ))}
          </ol>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold">Satellite meetings</h2>
          <p className="mt-1 text-sm text-muted">Dates, venues and registration are on each meeting&apos;s own page.</p>
          <ul className="mt-3 divide-y divide-border">
            {SATELLITES.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-between gap-3 py-2 hover:text-sea">
                  <span className="text-sm font-medium">{s.name}</span>
                  <span className="shrink-0 text-xs text-muted">{s.where} ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="h-96 overflow-hidden rounded-2xl border border-border lg:sticky lg:top-20 lg:h-[36rem]">
        <LazyMap region="korea" places={stops} onSelect={() => {}} route={stops} />
      </div>
    </div>
  );
}
