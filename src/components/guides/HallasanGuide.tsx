"use client";

import { useState } from "react";
import { SUMMIT_M, TRAILS, type Trail } from "@/data/hallasan";

const W = 600;
const H = 260;
const PAD = { l: 52, r: 16, t: 24, b: 32 };
const MAX_KM = 10;
const MIN_M = 500;
const MAX_M = 2000;

const x = (km: number) => PAD.l + (km / MAX_KM) * (W - PAD.l - PAD.r);
const y = (m: number) => PAD.t + (1 - (m - MIN_M) / (MAX_M - MIN_M)) * (H - PAD.t - PAD.b);
const line = (t: Trail) => t.profile.map(([k, m]) => `${x(k)},${y(m)}`).join(" ");

export function HallasanGuide() {
  const [selectedId, setSelectedId] = useState(TRAILS[0].id);
  const trail = TRAILS.find((t) => t.id === selectedId)!;
  const waypoints = trail.profile.filter((p) => p[2]);
  const gain = trail.profile.reduce((g, [, m], i, arr) => g + Math.max(0, i ? m - arr[i - 1][1] : 0), 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <div role="tablist" aria-label="Trail" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TRAILS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === selectedId}
              onClick={() => setSelectedId(t.id)}
              className="rounded-2xl border border-border bg-surface p-3 text-left aria-selected:border-sea aria-selected:ring-2 aria-selected:ring-sea/30"
            >
              <span className="block font-semibold">{t.name}</span>
              <span className="block text-xs text-muted">
                {t.km} km · {t.summit ? "⛰ summit" : "no summit"}
              </span>
            </button>
          ))}
        </div>

        <figure className="rounded-2xl border border-border bg-surface p-3 sm:p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Elevation profile of the ${trail.name} trail`}>
            {[500, 1000, 1500, 2000].map((m) => (
              <g key={m}>
                <line x1={PAD.l} x2={W - PAD.r} y1={y(m)} y2={y(m)} stroke="currentColor" strokeOpacity="0.1" />
                <text x={PAD.l - 8} y={y(m)} textAnchor="end" dominantBaseline="middle" fontSize="15" fill="currentColor" opacity="0.6">{m}</text>
              </g>
            ))}
            {[0, 2, 4, 6, 8, 10].map((k) => (
              <text key={k} x={x(k)} y={H - 8} textAnchor="middle" fontSize="15" fill="currentColor" opacity="0.6">{k} km</text>
            ))}
            <line x1={PAD.l} x2={W - PAD.r} y1={y(SUMMIT_M)} y2={y(SUMMIT_M)} stroke="var(--tangerine)" strokeDasharray="4 4" />
            <text x={W - PAD.r} y={y(SUMMIT_M) - 8} textAnchor="end" fontSize="15" fill="var(--tangerine)">Summit 1,947 m</text>

            {TRAILS.filter((t) => t.id !== trail.id).map((t) => (
              <polyline key={t.id} points={line(t)} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
            ))}
            <polygon
              points={`${x(0)},${y(MIN_M)} ${line(trail)} ${x(trail.profile.at(-1)![0])},${y(MIN_M)}`}
              fill="var(--sea)"
              fillOpacity="0.15"
            />
            <polyline points={line(trail)} fill="none" stroke="var(--sea)" strokeWidth="3" strokeLinejoin="round" />
            {waypoints.map(([k, m], i) => (
              <g key={k}>
                <circle cx={x(k)} cy={y(m)} r="11" fill="var(--sea)" />
                <text x={x(k)} y={y(m)} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#fff">{i + 1}</text>
              </g>
            ))}
          </svg>
          {/* Waypoint names live outside the SVG so they stay readable on phones. */}
          <ol className="mt-3 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            {waypoints.map(([k, m, label], i) => (
              <li key={k} className="flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sea text-[11px] font-semibold text-white">{i + 1}</span>
                <span className="flex-1">{label}</span>
                <span className="tabular-nums text-muted">{k} km · {m.toLocaleString("en")} m</span>
              </li>
            ))}
          </ol>
          <figcaption className="mt-2 text-xs text-muted">Approximate profile. Other trails are shown faintly for comparison.</figcaption>
        </figure>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold">{trail.name} trail</h2>
          <p className="text-muted" lang="ko">{trail.nameKo}</p>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-xl bg-background p-2"><dt className="text-xs text-muted">One way</dt><dd className="font-semibold">{trail.km} km</dd></div>
            <div className="rounded-xl bg-background p-2"><dt className="text-xs text-muted">Climb</dt><dd className="font-semibold">+{gain} m</dd></div>
            <div className="rounded-xl bg-background p-2"><dt className="text-xs text-muted">Up</dt><dd className="font-semibold">≈ {trail.hoursUp} h</dd></div>
          </dl>
          <p className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className={`rounded-full px-2 py-0.5 ${trail.difficulty === "Hard" ? "bg-tangerine/15 text-tangerine" : "bg-sea/10 text-sea"}`}>{trail.difficulty}</span>
            {trail.reservation ? (
              <span className="rounded-full bg-tangerine/15 px-2 py-0.5 text-tangerine">Reservation required</span>
            ) : (
              <span className="rounded-full bg-border/60 px-2 py-0.5">No reservation</span>
            )}
          </p>
          <p className="mt-3 leading-relaxed">{trail.text}</p>
          <p className="mt-3 text-sm text-muted">🚕 {trail.access}</p>
        </div>
        <div className="rounded-2xl bg-canola/15 p-4 text-sm leading-relaxed">
          <b>March on Hallasan:</b> the summit area can still have snow and ice, with temperatures below zero and
          strong wind. Bring crampons (rentable or sold near trailheads), gloves, a shell and water. Start early: trails
          close to new hikers in the early afternoon.
        </div>
      </div>
    </div>
  );
}
