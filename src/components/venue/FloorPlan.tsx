"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { ROOM_KINDS, type Floor, type Part, type Point, type Room, type RoomKind, type Route } from "@/data/venue";

type Props = {
  floor: Floor;
  selected?: string;
  highlight: RoomKind | null;
  route?: Route;
  onSelect: (id: string) => void;
};

/** One floor of ICC Jeju as an interactive SVG, in the pixel space of the traced plan. */
export function FloorPlan({ floor, selected, highlight, route, onSelect }: Props) {
  const areas = floor.rooms.filter((r) => r.d || r.w !== undefined);
  // Background spaces first so halls draw on top of them.
  areas.sort((a, b) => Number(b.kind === "other") - Number(a.kind === "other"));
  const details = floor.rooms.filter((r) => !r.d && r.w === undefined && r.parts);
  const points = floor.rooms.filter((r) => r.spots);
  const lines = route?.paths[floor.id] ?? [];

  const interactive = (r: Room) => ({
    role: "button",
    tabIndex: 0,
    "aria-label": r.name,
    onClick: () => onSelect(r.id),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(r.id);
      }
    },
  });
  const dimmed = (r: Room) => (highlight && r.kind !== highlight ? 0.25 : 1);

  return (
    <svg viewBox={`0 0 ${floor.width} ${floor.height}`} className="h-auto w-full" role="img" aria-label={`Floor plan ${floor.label}`}>
      <defs>
        <marker id="route-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill="var(--tangerine)" />
        </marker>
        <marker id="entry-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill="var(--foreground)" />
        </marker>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2" />
        </pattern>
        <pattern id="tables" width="15" height="15" patternUnits="userSpaceOnUse">
          <circle cx="7.5" cy="7.5" r="3" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Footprint: strokes first, then fills on top, so overlapping parts merge into one outline. */}
      {floor.base.map((d, i) => (
        <path key={`s${i}`} d={d} fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="3" />
      ))}
      {floor.base.map((d, i) => (
        <path key={`f${i}`} d={d} fill="var(--background)" />
      ))}
      {floor.service?.map((d, i) => (
        <path key={`v${i}`} d={d} fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.2" />
      ))}
      {floor.decor?.map((d, i) => (
        <path key={`d${i}`} d={d} fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.2" />
      ))}

      {areas.map((r) => {
        const meta = ROOM_KINDS[r.kind];
        const active = r.id === selected;
        const subtle = r.kind === "other";
        const shape = (extra: Record<string, unknown>) =>
          r.d ? (
            <path d={r.d} fillRule={r.evenodd ? "evenodd" : undefined} {...extra} />
          ) : (
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="3" {...extra} />
          );
        const [lx, ly] = labelAt(r);
        return (
          <g key={r.id} {...interactive(r)} className="cursor-pointer outline-none [&:focus-visible>.shape]:stroke-[4]" opacity={dimmed(r)}>
            {shape({
              className: "shape",
              fill: meta.color,
              fillOpacity: active ? 0.85 : subtle ? 0.06 : 0.16,
              stroke: meta.color,
              strokeOpacity: subtle && !active ? 0.45 : 1,
              strokeWidth: active ? 3 : 1.4,
            })}
            {r.tables && !active && shape({ fill: "url(#tables)" })}
            {r.hatch && !active && shape({ fill: "url(#hatch)" })}
            {r.seats && !active && <Seats room={r} />}
            {r.boards && (
              <path d={r.boards} fill="none" stroke={active ? "var(--background)" : "var(--foreground)"} strokeOpacity="0.55" strokeWidth="3" strokeDasharray="7 5" />
            )}
            {r.doors?.map(([x, y], i) => (
              <line key={i} x1={x - 6} y1={y} x2={x + 6} y2={y} stroke="var(--background)" strokeWidth="3.5" />
            ))}
            {r.parts?.map((p, i) => <PartShape key={i} part={p} color={meta.color} />)}
            <RoomLabel room={r} x={lx} y={ly} active={active} />
          </g>
        );
      })}

      {floor.labels?.map((p, i) => (
        <g key={i} className="pointer-events-none" opacity="0.55">
          <PartShape part={p} color="currentColor" spaced />
        </g>
      ))}

      {details.map((r) => {
        const active = r.id === selected;
        return (
          <g
            key={r.id}
            {...interactive(r)}
            className="cursor-pointer outline-none"
            opacity={dimmed(r)}
            style={active ? { filter: "drop-shadow(0 0 2px var(--tangerine))" } : undefined}
          >
            {r.parts!.map((p, i) => (
              <PartShape key={i} part={p} color={active ? "var(--tangerine)" : ROOM_KINDS[r.kind].color} />
            ))}
          </g>
        );
      })}

      {lines.map((pts, i) => (
        <polyline
          key={i}
          points={pts.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke="var(--tangerine)"
          strokeWidth="4"
          strokeDasharray="8 6"
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd="url(#route-arrow)"
          className="pointer-events-none"
        />
      ))}

      {points.map((r) => (
        <g key={r.id} {...interactive(r)} className="cursor-pointer outline-none" opacity={dimmed(r)}>
          {r.spots!.map(([x, y], i) => (
            <Marker key={i} kind={r.kind} x={x} y={y} active={r.id === selected} />
          ))}
        </g>
      ))}
    </svg>
  );
}

function labelAt(r: Room): Point {
  if (r.lx !== undefined && r.ly !== undefined) return [r.lx, r.ly];
  return [(r.x ?? 0) + (r.w ?? 0) / 2, (r.y ?? 0) + (r.h ?? 0) / 2];
}

/** Name (split at " · ") plus an optional smaller purpose line, shrunk to fit the room. */
function RoomLabel({ room, x, y, active }: { room: Room; x: number; y: number; active: boolean }) {
  const lines = (room.short ?? room.name).split(" · ");
  let aw = room.lw ?? room.w ?? 130;
  let ah = room.h ?? 120;
  if (room.vertical) [aw, ah] = [ah, aw];
  const longest = Math.max(...lines.map((l) => l.length), (room.sub?.length ?? 0) * 0.72);
  const rows = lines.length + (room.sub ? 0.8 : 0);
  const size = Math.max(6.5, Math.min(15, (aw - 6) / (longest * 0.6), (ah - 4) / (rows * 1.25)));
  const sub = size * 0.72;
  const height = lines.length * size * 1.15 + (room.sub ? sub * 1.2 : 0);
  const top = y - height / 2 + size * 0.55;
  const muted = room.kind === "other" && !active;
  return (
    <text
      x={x}
      textAnchor="middle"
      fill={active ? "var(--background)" : "currentColor"}
      transform={room.vertical ? `rotate(-90 ${x} ${y})` : undefined}
      className="pointer-events-none select-none"
    >
      {lines.map((l, i) => (
        <tspan key={i} x={x} y={top + i * size * 1.15} fontSize={size} fontWeight={600} fillOpacity={muted ? 0.6 : 1} dominantBaseline="central">
          {l}
        </tspan>
      ))}
      {room.sub && (
        <tspan
          x={x}
          y={top + lines.length * size * 1.15 + sub * 0.1}
          fontSize={sub}
          fontWeight={500}
          fillOpacity={active ? 0.85 : 0.6}
          dominantBaseline="central"
          className="uppercase"
          letterSpacing="0.04em"
        >
          {room.sub}
        </tspan>
      )}
    </text>
  );
}

function Seats({ room }: { room: Room }) {
  const s = room.seats!;
  const id = `clip-${room.id}`;
  const arcs: ReactNode[] = [];
  for (let r = s.r0, i = 0; r <= s.r1; r += s.step, i++) {
    const a = (62 * Math.PI) / 180;
    const x1 = s.cx + r * Math.cos(a);
    const y1 = s.cy - r * Math.sin(a);
    const y2 = s.cy + r * Math.sin(a);
    arcs.push(<path key={i} d={`M${x1} ${y1} A${r} ${r} 0 0 1 ${x1} ${y2}`} fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.1" />);
  }
  return (
    <g>
      <clipPath id={id}>
        <path d={room.d} />
      </clipPath>
      <g clipPath={`url(#${id})`} className="pointer-events-none">
        {arcs}
      </g>
    </g>
  );
}

function PartShape({ part: p, color, spaced }: { part: Part; color: string; spaced?: boolean }) {
  switch (p.t) {
    case "esc": {
      const vertical = p.h >= p.w;
      const steps: ReactNode[] = [];
      const n = Math.floor((vertical ? p.h : p.w) / 2.6);
      for (let i = 1; i < n; i++) {
        const o = (i * (vertical ? p.h : p.w)) / n;
        steps.push(
          vertical ? (
            <line key={i} x1={p.x + 1.5} x2={p.x + p.w - 1.5} y1={p.y + o} y2={p.y + o} />
          ) : (
            <line key={i} x1={p.x + o} x2={p.x + o} y1={p.y + 1.5} y2={p.y + p.h - 1.5} />
          ),
        );
      }
      return (
        <g>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="1.5" fill="var(--background)" stroke={color} strokeWidth="1.3" />
          <g stroke={color} strokeWidth="0.7" strokeOpacity="0.8">{steps}</g>
        </g>
      );
    }
    case "stairs": {
      const rows: ReactNode[] = [];
      for (let i = -2; i <= 2; i++) {
        const y = p.cy + (i * p.ry) / 3;
        const half = p.rx * 0.65 * Math.sqrt(Math.max(0, 1 - ((i / 3) * 1) ** 2));
        rows.push(<line key={i} x1={p.cx - half} x2={p.cx + half} y1={y} y2={y} />);
      }
      return (
        <g>
          <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="var(--background)" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" />
          <g stroke={color} strokeWidth="1">{rows}</g>
        </g>
      );
    }
    case "poly":
      return <polygon points={p.points.map((q) => q.join(",")).join(" ")} fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.3" />;
    case "path":
      return <path d={p.d} fill={p.fill ? color : "var(--background)"} fillOpacity={p.fill ? 0.18 : 1} stroke={color} strokeWidth="1.3" />;
    case "arrow":
      return (
        <line
          x1={p.from[0]}
          y1={p.from[1]}
          x2={p.to[0]}
          y2={p.to[1]}
          stroke={color === "var(--muted)" ? "var(--foreground)" : color}
          strokeWidth="3"
          markerEnd="url(#entry-arrow)"
        />
      );
    case "door": {
      const [x1, y1] = p.from;
      const [x2, y2] = p.to;
      const d = p.via ? `M${x1} ${y1} Q${p.via[0]} ${p.via[1]} ${x2} ${y2}` : `M${x1} ${y1} L${x2} ${y2}`;
      return (
        <g fill="none">
          <path d={d} stroke="var(--background)" strokeWidth="7" />
          <path d={d} stroke="var(--foreground)" strokeWidth="4.5" strokeLinecap="round" />
        </g>
      );
    }
    case "badge": {
      const w = p.text.length * 6.4 + 16;
      return (
        <g>
          {p.to && <line x1={p.x} y1={p.y - 9} x2={p.to[0]} y2={p.to[1]} stroke="var(--foreground)" strokeWidth="1.3" />}
          {p.to && <circle cx={p.to[0]} cy={p.to[1]} r="2.5" fill="var(--foreground)" />}
          <rect x={p.x - w / 2} y={p.y - 9} width={w} height="18" rx="9" fill="var(--foreground)" />
          <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight={700} letterSpacing="0.08em" fill="var(--background)" className="pointer-events-none select-none">
            {p.text}
          </text>
        </g>
      );
    }
    case "text":
      return (
        <text
          x={p.x}
          y={p.y}
          fontSize={p.size ?? 9}
          fontWeight={p.bold ? 700 : 500}
          textAnchor={p.anchor ?? "middle"}
          dominantBaseline="central"
          letterSpacing={spaced ? "0.12em" : undefined}
          transform={p.rotate ? `rotate(${p.rotate} ${p.x} ${p.y})` : undefined}
          fill="currentColor"
          className="pointer-events-none select-none"
        >
          {p.text}
        </text>
      );
  }
}

/** Pictogram markers for point facilities. */
export function Marker({ kind, x, y, active }: { kind: RoomKind; x: number; y: number; active?: boolean }) {
  const color = ROOM_KINDS[kind].color;
  const bg = active ? color : "var(--background)";
  const fg = active ? "var(--background)" : "var(--foreground)";
  if (kind === "restroom") {
    // Man and woman, side by side.
    return (
      <g>
        <rect x={x - 9} y={y - 9} width="18" height="18" rx="3" fill={bg} stroke={color} strokeWidth="1.4" />
        <g fill={fg}>
          <circle cx={x - 4} cy={y - 4.6} r="1.7" />
          <rect x={x - 5.6} y={y - 2.4} width="3.2" height="4.4" rx="0.8" />
          <rect x={x - 5.4} y={y + 1.6} width="1.2" height="4.4" />
          <rect x={x - 3.8} y={y + 1.6} width="1.2" height="4.4" />
          <circle cx={x + 4} cy={y - 4.6} r="1.7" />
          <path d={`M${x + 4} ${y - 2.6} L${x + 6.3} ${y + 2.6} H${x + 1.7} Z`} />
          <rect x={x + 2.8} y={y + 2.4} width="1.1" height="3.6" />
          <rect x={x + 4.1} y={y + 2.4} width="1.1" height="3.6" />
        </g>
        <line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke={fg} strokeWidth="0.7" />
      </g>
    );
  }
  if (kind === "elevator") {
    return (
      <g>
        <rect x={x - 8} y={y - 8} width="16" height="16" rx="3" fill={bg} stroke={color} strokeWidth="1.4" />
        <path d={`M${x - 3.5} ${y - 1.5} H${x + 3.5} L${x} ${y - 6} Z M${x - 3.5} ${y + 1.5} H${x + 3.5} L${x} ${y + 6} Z`} fill={fg} />
      </g>
    );
  }
  return (
    <g>
      <circle cx={x} cy={y} r="9" fill={bg} stroke={color} strokeWidth="1.4" />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={kind === "info" ? 11 : 7} fontWeight={700} fill={fg} className="pointer-events-none select-none font-mono">
        {kind === "info" ? "i" : ""}
      </text>
    </g>
  );
}

/** Key to the symbols drawn on the plan. */
export function Legend() {
  const item = (svg: ReactNode, label: string) => (
    <li key={label} className="flex items-center gap-1.5">
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden>
        {svg}
      </svg>
      {label}
    </li>
  );
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted" aria-label="Map symbols">
      {item(<Marker kind="restroom" x={12} y={12} />, "Restrooms")}
      {item(<Marker kind="elevator" x={12} y={12} />, "Elevator")}
      {item(<PartShape part={{ t: "esc", x: 7, y: 2, w: 10, h: 20 }} color="var(--muted)" />, "Escalator")}
      {item(<PartShape part={{ t: "stairs", cx: 12, cy: 12, rx: 7, ry: 10 }} color="var(--muted)" />, "Stairs")}
      {item(
        <g>
          <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.4" />
          <line x1="8" y1="12" x2="16" y2="12" stroke="var(--surface)" strokeWidth="4" />
        </g>,
        "Hall door",
      )}
      {item(<line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="3" strokeDasharray="5 3" strokeOpacity="0.6" />, "Poster boards")}
      {item(<rect x="3" y="3" width="18" height="18" fill="url(#hatch)" stroke="currentColor" strokeOpacity="0.4" />, "Open atrium")}
    </ul>
  );
}
