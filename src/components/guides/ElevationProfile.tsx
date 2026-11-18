"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { distanceKm, type LatLng } from "@/lib/geo";

const H = 140;
const PAD = { top: 12, right: 8, bottom: 22, left: 36 };

type Pt = { km: number; ele: number | null };

/**
 * Distance–elevation profile. Points without elevation (hand-drawn stretches of the
 * source GPX) are bridged with a dashed line rather than guessed.
 */
export function ElevationProfile({ route, ele, oneWay = false }: { route: LatLng[]; ele: (number | null)[]; oneWay?: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  // Draw in real pixels so labels stay 11px at any width.
  const [W, setW] = useState(600);
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setW(Math.max(240, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { pts, total, top, climb, drop, low, high, gapKm } = useMemo(() => {
    const pts: Pt[] = [];
    let km = 0;
    for (let i = 0; i < route.length; i++) {
      if (i) km += distanceKm(route[i - 1], route[i]);
      pts.push({ km, ele: ele[i] ?? null });
    }
    const known = pts.flatMap((p) => (p.ele === null ? [] : [p.ele]));
    let climb = 0;
    let drop = 0;
    for (let i = 1; i < known.length; i++) {
      const d = known[i] - known[i - 1];
      if (d > 0) climb += d;
      else drop -= d;
    }
    let gapKm = 0;
    for (let i = 1; i < pts.length; i++) if (pts[i].ele === null || pts[i - 1].ele === null) gapKm += pts[i].km - pts[i - 1].km;
    const high = Math.max(...known);
    return { pts, total: km, top: Math.max(10, Math.ceil(high / 10) * 10), climb, drop, low: Math.min(...known), high, gapKm };
  }, [route, ele]);

  const x = (km: number) => PAD.left + (km / total) * (W - PAD.left - PAD.right);
  const y = (m: number) => PAD.top + (1 - m / top) * (H - PAD.top - PAD.bottom);

  // Solid runs of known elevation, and dashed bridges across the gaps between them.
  const solid: Pt[][] = [];
  const bridges: [Pt, Pt][] = [];
  let run: Pt[] = [];
  let lastKnown: Pt | null = null;
  for (const p of pts) {
    if (p.ele === null) {
      if (run.length) solid.push(run);
      run = [];
      continue;
    }
    if (!run.length && lastKnown) bridges.push([lastKnown, p]);
    run.push(p);
    lastKnown = p;
  }
  if (run.length) solid.push(run);

  const line = (seg: Pt[]) => seg.map((p) => `${x(p.km).toFixed(1)},${y(p.ele!).toFixed(1)}`).join(" ");
  const area = (seg: Pt[]) =>
    `M${x(seg[0].km).toFixed(1)},${y(0)} L${line(seg).replaceAll(" ", " L")} L${x(seg[seg.length - 1].km).toFixed(1)},${y(0)} Z`;

  // One label per km, or every other km on narrow screens.
  const kmStep = W < 400 && total > 6 ? 2 : 1;
  const kmTicks = Array.from({ length: Math.floor(total / kmStep) + 1 }, (_, i) => i * kmStep);

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const box = svgRef.current!.getBoundingClientRect();
    const km = (((e.clientX - box.left) / box.width) * W - PAD.left) / (W - PAD.left - PAD.right) * total;
    let best = 0;
    for (let i = 1; i < pts.length; i++) if (Math.abs(pts[i].km - km) < Math.abs(pts[best].km - km)) best = i;
    setHover(best);
  }

  const h = hover === null ? null : pts[hover];
  const updown = `up ${Math.round(climb)} m · down ${Math.round(drop)} m`;
  const summary = `About ${Math.round(climb)} m up and ${Math.round(drop)} m down. Lowest ${low} m, highest ${high} m.`;

  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">Elevation</h2>
        <p className="text-sm tabular-nums" aria-live="polite">
          {h ? (
            <>
              {h.km.toFixed(1)} km · {h.ele === null ? <span className="text-muted">no data</span> : `${h.ele} m`}
            </>
          ) : (
            <span className="text-muted">{updown}</span>
          )}
        </p>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        height={H}
        className="mt-2 block w-full touch-pan-y select-none"
        role="img"
        aria-label={`Elevation profile over ${total.toFixed(1)} km. ${summary}`}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {[0, top / 2, top].map((m) => (
          <g key={m}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(m)} y2={y(m)} style={{ stroke: "var(--border)" }} strokeWidth={1} />
            <text x={PAD.left - 6} y={y(m)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">
              {m} m
            </text>
          </g>
        ))}
        {kmTicks.map((k) => (
          <text key={k} x={x(k)} y={H - 6} textAnchor="middle" className="fill-muted text-[11px] tabular-nums">
            {k} km
          </text>
        ))}
        {solid.map((seg, i) => (
          <path key={`a${i}`} d={area(seg)} style={{ fill: "var(--foreground)", fillOpacity: 0.1 }} />
        ))}
        {bridges.map(([a, b], i) => (
          <line
            key={`b${i}`}
            x1={x(a.km)} y1={y(a.ele!)} x2={x(b.km)} y2={y(b.ele!)}
            style={{ stroke: "var(--muted)" }} strokeWidth={1.5} strokeDasharray="3 4"
          />
        ))}
        {solid.map((seg, i) =>
          seg.length > 1 ? (
            <polyline key={`l${i}`} points={line(seg)} fill="none" style={{ stroke: "var(--foreground)" }} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          ) : null,
        )}
        {h && (
          <g pointerEvents="none">
            <line x1={x(h.km)} x2={x(h.km)} y1={PAD.top} y2={y(0)} style={{ stroke: "var(--foreground)", strokeOpacity: 0.4 }} strokeWidth={1} />
            {h.ele !== null && <circle cx={x(h.km)} cy={y(h.ele)} r={4} style={{ fill: "var(--foreground)", stroke: "var(--surface)" }} strokeWidth={2} />}
          </g>
        )}
      </svg>
      <p className="mt-2 text-xs text-muted">
        {oneWay && "Outbound leg; the way back retraces it. "}
        {summary}
        {gapKm > 0.05 && ` Dashed: about ${gapKm.toFixed(1)} km with no elevation data, where the source track was drawn by hand.`}
      </p>
    </div>
  );
}
