"use client";

import { useMemo, useState } from "react";
import { LazyMap } from "@/components/map/LazyMap";
import { RUNS, toLatLng, type Run } from "@/data/runs";
import { ICC, distanceKm } from "@/lib/geo";
import { CONFERENCE_DAYS, formatClock, sunTimes } from "@/lib/sky";

function pathKm(run: Run) {
  const pts = toLatLng(run.path);
  return pts.slice(1).reduce((sum, p, i) => sum + distanceKm(pts[i], p), 0);
}

function downloadGpx(run: Run) {
  const pts = run.path.map(([lat, lng]) => `<trkpt lat="${lat}" lon="${lng}"/>`).join("");
  const gpx = `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="QM2027" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>QM2027 – ${run.title}</name><trkseg>${pts}</trkseg></trk></gpx>`;
  const url = URL.createObjectURL(new Blob([gpx], { type: "application/gpx+xml" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `qm2027-${run.id}.gpx` });
  a.click();
  URL.revokeObjectURL(url);
}

export function RunGuide() {
  const [selectedId, setSelectedId] = useState(RUNS[0].id);
  const run = RUNS.find((r) => r.id === selectedId)!;
  const route = useMemo(() => toLatLng(run.path), [run]);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="space-y-3">
        <ul className="space-y-3">
          {RUNS.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => setSelectedId(r.id)}
                aria-pressed={r.id === selectedId}
                className="w-full rounded-2xl border border-border bg-surface p-4 text-left aria-pressed:border-sea aria-pressed:ring-2 aria-pressed:ring-sea/30"
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold">{r.title}</span>
                  <span className="shrink-0 text-sm font-semibold text-sea">{pathKm(r).toFixed(1)} km</span>
                </span>
                <span className="mt-0.5 block text-xs text-muted">{r.level} · {r.surface}</span>
                <span className="mt-2 block text-sm">{r.text}</span>
              </button>
            </li>
          ))}
        </ul>
        <button onClick={() => downloadGpx(run)} className="min-h-11 w-full rounded-xl bg-sea font-semibold text-on-sea">
          Download GPX: {run.title}
        </button>
        <p className="text-xs text-muted">Routes are approximate. Follow signs and Olle ribbons on the ground.</p>
      </div>

      <div className="space-y-4">
        <div className="h-80 overflow-hidden rounded-2xl border border-border sm:h-[28rem]">
          <LazyMap places={[]} onSelect={() => {}} route={route} />
        </div>
        <SunriseTable />
      </div>
    </div>
  );
}

function SunriseTable() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <h2 className="font-semibold">Sunrise & sunset at the venue</h2>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-sm sm:grid-cols-7">
        {CONFERENCE_DAYS.map(({ y, m, d }) => {
          const { sunrise, sunset } = sunTimes(y, m, d, ICC.lat, ICC.lng);
          const weekday = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });
          return (
            <div key={d} className="rounded-xl bg-background p-2">
              <p className="text-xs text-muted">{weekday} {d}</p>
              <p className="font-semibold tabular-nums">☀ {formatClock(sunrise)}</p>
              <p className="text-xs tabular-nums text-muted">☾ {formatClock(sunset)}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted">March mornings are about 8–12 °C and often windy. Bring a layer.</p>
    </div>
  );
}
