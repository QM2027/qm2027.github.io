"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { FLOORS, ROOM_KINDS, type Room, type RoomKind } from "@/data/venue";
import { clock, dayLabel, dayOf, isRunning, useProgram, type Session } from "@/lib/program";

const KINDS = Object.keys(ROOM_KINDS) as RoomKind[];

export function VenueApp() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const roomId = params.get("room");
  const highlight = params.get("find") as RoomKind | null;
  const located = FLOORS.find((f) => f.rooms.some((r) => r.id === roomId));
  const floor = located ?? FLOORS.find((f) => f.id === params.get("floor")) ?? FLOORS[0];
  const room = floor.rooms.find((r) => r.id === roomId);

  function update(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Which floors have the highlighted facility — shown as dots on the floor tabs.
  const floorsWith = (kind: RoomKind | null) =>
    new Set(kind ? FLOORS.filter((f) => f.rooms.some((r) => r.kind === kind)).map((f) => f.id) : []);
  const hits = floorsWith(highlight);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <div role="tablist" aria-label="Floor" className="flex gap-1 rounded-full bg-border/50 p-1">
            {FLOORS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={f.id === floor.id}
                onClick={() => update({ floor: f.id, room: undefined })}
                className="relative min-h-10 min-w-14 rounded-full px-4 font-semibold text-muted aria-selected:bg-surface aria-selected:text-foreground aria-selected:shadow-sm"
              >
                {f.label}
                {hits.has(f.id) && <span className="absolute top-1 right-2 size-2 rounded-full bg-tangerine" />}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">Tap a room for details.</p>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface p-2 sm:p-4">
          <svg viewBox="0 0 400 260" className="h-auto w-full" role="img" aria-label={`Floor plan ${floor.label}`}>
            <rect x="5" y="5" width="390" height="250" rx="10" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
            {floor.rooms.map((r) => {
              const meta = ROOM_KINDS[r.kind];
              const active = r.id === room?.id;
              const dim = highlight ? r.kind !== highlight : false;
              return (
                <g
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  aria-label={r.name}
                  onClick={() => update({ room: r.id, floor: floor.id })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") update({ room: r.id, floor: floor.id });
                  }}
                  className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[3]"
                  opacity={dim ? 0.25 : 1}
                >
                  <rect
                    x={r.x}
                    y={r.y}
                    width={r.w}
                    height={r.h}
                    rx="6"
                    fill={meta.color}
                    fillOpacity={active ? 0.9 : 0.18}
                    stroke={meta.color}
                    strokeWidth={active ? 3 : 1.5}
                  />
                  <text
                    x={r.x + r.w / 2}
                    y={r.y + r.h / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={r.w < 80 ? 8 : 11}
                    fontWeight={600}
                    fill={active ? "#fff" : "currentColor"}
                    className="pointer-events-none select-none"
                  >
                    {r.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        {/* Small rooms are hard to tap on phones; the list is the reliable target. */}
        <ul className="mt-3 flex flex-wrap gap-2" aria-label={`Rooms on ${floor.label}`}>
          {floor.rooms.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => update({ room: r.id, floor: floor.id })}
                aria-pressed={r.id === room?.id}
                className="flex min-h-10 items-center gap-2 rounded-full border border-border px-3 text-sm aria-pressed:border-foreground"
              >
                <span className="size-2.5 rounded-full" style={{ background: ROOM_KINDS[r.kind].color }} />
                {r.name}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">
          Schematic only. It will be replaced by the official ICC Jeju floor plan when rooms are confirmed.
        </p>
      </div>

      <aside className="space-y-4">
        {room ? (
          <RoomCard room={room} floorLabel={floor.label} onClose={() => update({ room: undefined })} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted">
            Select a room on the plan, or find a facility below.
          </div>
        )}

        <div className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold">Find…</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {KINDS.map((k) => (
              <li key={k}>
                <button
                  onClick={() => update({ find: highlight === k ? undefined : k, room: undefined })}
                  aria-pressed={highlight === k}
                  className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-border px-3 text-left text-sm aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
                >
                  <span className="size-3 shrink-0 rounded" style={{ background: ROOM_KINDS[k].color }} />
                  {ROOM_KINDS[k].label}
                </button>
              </li>
            ))}
          </ul>
          {highlight && (
            <p className="mt-3 text-sm text-muted">
              On {FLOORS.filter((f) => hits.has(f.id)).map((f) => f.label).join(", ")}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function RoomCard({ room, floorLabel, onClose }: { room: Room; floorLabel: string; onClose: () => void }) {
  const meta = ROOM_KINDS[room.kind];
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: meta.color }}>
            {meta.label} · {floorLabel}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{room.name}</h2>
        </div>
        <button onClick={onClose} aria-label="Close" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border">
          <Icon name="close" />
        </button>
      </div>
      {room.capacity && <p className="mt-2 text-sm text-muted">Seats about {room.capacity}</p>}
      {room.note && <p className="mt-3 leading-relaxed">{room.note}</p>}
      {(room.kind === "plenary" || room.kind === "parallel") && <RoomSessions room={room} />}
    </div>
  );
}

/** What's on in this room now and next, from the synced Indico program. */
function RoomSessions({ room }: { room: Room }) {
  const program = useProgram();
  const [now] = useState(() => Date.now());

  if (program.status !== "ok" || !room.indicoRooms?.length) {
    return (
      <p className="mt-4 rounded-xl bg-sea/10 p-3 text-sm text-sea">
        Sessions in this room will appear here once the program is published and rooms are confirmed.
      </p>
    );
  }
  const here = program.data.sessions.filter((s) => s.room && room.indicoRooms!.includes(s.room));
  const current = here.find((s) => isRunning(s, now));
  const next = here.find((s) => Date.parse(s.start) > now);

  return (
    <div className="mt-4 space-y-2 text-sm">
      {current && <SessionLine label="Now" session={current} />}
      {next && <SessionLine label="Next" session={next} />}
      {!current && !next && <p className="text-muted">No more sessions scheduled here.</p>}
      <Link href="/program/" className="inline-block text-sea underline">Full program</Link>
    </div>
  );
}

function SessionLine({ label, session }: { label: string; session: Session }) {
  return (
    <p className="rounded-xl bg-sea/10 p-3">
      <b className="text-sea">{label}</b> · {dayLabel(dayOf(session.start))} {clock(session.start)}–{clock(session.end)}
      <br />
      {session.title}
    </p>
  );
}
