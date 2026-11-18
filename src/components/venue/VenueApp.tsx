"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon";
import { DEFAULT_FLOOR, FLOORS, ROOM_KINDS, ROUTES, type Room, type RoomKind, type Route } from "@/data/venue";
import { FloorPlan, Legend } from "./FloorPlan";
import { clock, dayLabel, dayOf, isRunning, useProgram } from "@/lib/program";
import { pinnedNow, useNow } from "@/lib/use-now";
import { INDICO_ROOM_MAP, MAPPED_ROOM_IDS } from "@/data/indico-rooms";

const FIND_KINDS = (Object.keys(ROOM_KINDS) as RoomKind[]).filter((k) => !ROOM_KINDS[k].hidden);

export function VenueApp() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const roomId = params.get("room");
  const highlight = params.get("find") as RoomKind | null;
  const route = ROUTES.find((r) => r.id === params.get("route"));
  const located = FLOORS.find((f) => f.rooms.some((r) => r.id === roomId));
  const floor =
    located ??
    FLOORS.find((f) => f.id === params.get("floor")) ??
    FLOORS.find((f) => f.id === DEFAULT_FLOOR) ??
    FLOORS[0];
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

  // Floors that hold the highlighted facility or part of the active route: dots on the floor tabs.
  const hits = new Set<string>([
    ...(highlight ? FLOORS.filter((f) => f.rooms.some((r) => r.kind === highlight)).map((f) => f.id) : []),
    ...(route ? Object.keys(route.paths) : []),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <div role="tablist" aria-label="Floor" className="flex gap-6 border-b border-border">
            {FLOORS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={f.id === floor.id}
                onClick={() => update({ floor: f.id, room: undefined })}
                className="relative -mb-px min-h-10 border-b-2 border-transparent px-1 font-mono font-medium text-muted aria-selected:border-foreground aria-selected:text-foreground"
              >
                {f.label}
                {f.id === DEFAULT_FLOOR && <span className="ml-1 text-xs font-normal">entrance</span>}
                {hits.has(f.id) && <span className="absolute top-1 -right-2 size-1.5 rounded-full bg-tangerine" />}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">Tap a room or marker for details.</p>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-border bg-surface p-2 sm:p-4">
          <FloorPlan
            floor={floor}
            selected={room?.id}
            highlight={highlight}
            route={route}
            onSelect={(id) => update({ room: id, floor: floor.id })}
          />
        </div>
        <Legend />
        {/* Markers are small on phones; the list is the reliable target. */}
        <ul className="mt-3 flex flex-wrap gap-2" aria-label={`Rooms on ${floor.label}`}>
          {floor.rooms.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => update({ room: r.id, floor: floor.id })}
                aria-pressed={r.id === room?.id}
                className="flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm aria-pressed:border-foreground"
              >
                <span className="size-2.5 rounded-full" style={{ background: ROOM_KINDS[r.kind].color }} />
                {r.name}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">
          Traced from the ICC Jeju floor plans and simplified. Rooms marked “planned” may still change.
        </p>
      </div>

      <aside className="space-y-4">
        {room ? (
          <RoomCard room={room} floorLabel={floor.label} onClose={() => update({ room: undefined })} />
        ) : (
          <div className="rounded-md border border-dashed border-border p-5 text-sm text-muted">
            Select a room on the plan, or find a facility below.
          </div>
        )}

        <RouteCard
          route={route}
          onPick={(r) =>
            update(
              r && r.id !== route?.id
                ? { route: r.id, floor: Object.keys(r.paths)[0], room: undefined }
                : { route: undefined },
            )
          }
          onFloor={(id) => update({ floor: id, room: undefined })}
          floorId={floor.id}
        />

        <div className="rounded-md border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold">Find…</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {FIND_KINDS.map((k) => (
              <li key={k}>
                <button
                  onClick={() => update({ find: highlight === k ? undefined : k, room: undefined })}
                  aria-pressed={highlight === k}
                  className="flex min-h-11 w-full items-center gap-2 rounded-md border border-border px-3 text-left text-sm aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
                >
                  <span className="size-3 shrink-0 rounded" style={{ background: ROOM_KINDS[k].color }} />
                  {ROOM_KINDS[k].label}
                </button>
              </li>
            ))}
          </ul>
          {highlight && (
            <p className="mt-3 text-sm text-muted">
              On {FLOORS.filter((f) => f.rooms.some((r) => r.kind === highlight)).map((f) => f.label).join(", ")}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function RouteCard({
  route,
  floorId,
  onPick,
  onFloor,
}: {
  route?: Route;
  floorId: string;
  onPick: (r?: Route) => void;
  onFloor: (id: string) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold">Getting around</h2>
      <p className="mt-1 text-xs text-muted">The main entrance is on 3F, at street level.</p>
      <ul className="mt-3 space-y-2">
        {ROUTES.map((r) => (
          <li key={r.id}>
            <button
              onClick={() => onPick(r)}
              aria-pressed={r.id === route?.id}
              className="flex min-h-11 w-full items-center rounded-md border border-border px-3 text-left text-sm aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
            >
              {r.label}
            </button>
          </li>
        ))}
      </ul>
      {route && (
        <div className="mt-4">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
            {route.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          {Object.keys(route.paths).length > 1 && (
            <div className="mt-3 flex gap-2">
              {Object.keys(route.paths).map((id) => (
                <button
                  key={id}
                  onClick={() => onFloor(id)}
                  aria-pressed={id === floorId}
                  className="min-h-10 rounded-md border border-border px-3 font-mono text-sm aria-pressed:border-foreground"
                >
                  {FLOORS.find((f) => f.id === id)?.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RoomCard({ room, floorLabel, onClose }: { room: Room; floorLabel: string; onClose: () => void }) {
  const meta = ROOM_KINDS[room.kind];
  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: meta.color }}>
            {meta.label} · {floorLabel}
            {room.estimated && <span className="ml-2 normal-case text-muted">planned</span>}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{room.name}</h2>
        </div>
        <button onClick={onClose} aria-label="Close" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border">
          <Icon name="close" />
        </button>
      </div>
      {room.capacity && <p className="mt-2 text-sm text-muted">Seats about {room.capacity}</p>}
      {room.note && <p className="mt-3 leading-relaxed">{room.note}</p>}
      {room.estimated && (
        <p className="mt-3 text-xs text-muted">This use is the committee’s current plan and may change.</p>
      )}
      {(room.kind === "plenary" || room.kind === "parallel" || MAPPED_ROOM_IDS.has(room.id)) && <RoomSessions room={room} />}
      {room.kind === "poster" && <PosterSessions />}
    </div>
  );
}

/** The current talk in this room and the next one, from the program (`?now=` pins the clock). */
function RoomSessions({ room }: { room: Room }) {
  const program = useProgram();
  const now = pinnedNow(useSearchParams().get("now"), useNow());

  if (program.status !== "ok" || !(room.indicoRooms?.length || MAPPED_ROOM_IDS.has(room.id)) || now === undefined) {
    return (
      <p className="mt-4 rounded-md bg-sea/10 p-3 text-sm text-sea">
        Sessions in this room will appear here once the program is published and rooms are confirmed.
      </p>
    );
  }
  // Indico names listed on the room, or mapped to it in src/data/indico-rooms.ts.
  const inRoom = (name?: string) => Boolean(name && (room.indicoRooms?.includes(name) || INDICO_ROOM_MAP[name] === room.id));
  const { sessions, contributions } = program.data;
  const sessionsById = new Map(sessions.map((s) => [s.id, s]));
  // A talk's own room wins over its session's.
  const talks = contributions.filter((c) => !c.poster && inRoom(c.room ?? sessionsById.get(c.sessionId ?? "")?.room));
  const here = sessions.filter((s) => !s.poster && inRoom(s.room));

  const currentTalk = talks.find((c) => isRunning(c, now));
  const currentSession = here.find((s) => isRunning(s, now));
  const nextTalk = talks.find((c) => Date.parse(c.start) > now);

  return (
    <div className="mt-4 space-y-2 text-sm">
      {(currentTalk || currentSession) && (
        <Line
          label="Now"
          when={currentTalk ?? currentSession!}
          title={currentTalk?.title ?? currentSession!.title}
          sub={currentTalk ? sessionsById.get(currentTalk.sessionId ?? "")?.title : undefined}
          href={currentTalk ? `/program/?talk=${currentTalk.id}` : undefined}
        />
      )}
      {nextTalk && (
        <Line
          label="Next"
          when={nextTalk}
          title={nextTalk.title}
          sub={sessionsById.get(nextTalk.sessionId ?? "")?.title}
          href={`/program/?talk=${nextTalk.id}`}
        />
      )}
      {!currentTalk && !currentSession && !nextTalk && <p className="text-muted">No more talks scheduled here.</p>}
      <Link href="/program/" className="inline-block text-sea underline">Full program</Link>
    </div>
  );
}

/** The poster area: the poster session on now or next. */
function PosterSessions() {
  const program = useProgram();
  const now = pinnedNow(useSearchParams().get("now"), useNow());
  if (program.status !== "ok" || now === undefined) return null;

  const blocks = program.data.sessions.filter((s) => s.poster);
  if (!blocks.length) return null;
  const count = (id: string) => program.data.contributions.filter((c) => c.sessionId === id || c.slots?.includes(id)).length;
  const current = blocks.find((s) => isRunning(s, now));
  const next = blocks.find((s) => Date.parse(s.start) > now);

  return (
    <div className="mt-4 space-y-2 text-sm">
      {current && <Line label="Now" when={current} title={current.title} sub={`${count(current.id)} posters`} href={`/program/?view=posters&ps=${current.id}`} />}
      {next && <Line label="Next" when={next} title={next.title} sub={`${count(next.id)} posters`} href={`/program/?view=posters&ps=${next.id}`} />}
      <Link href="/program/?view=posters" className="inline-block text-sea underline">All posters</Link>
    </div>
  );
}

function Line({ label, when, title, sub, href }: { label: string; when: { start: string; end: string }; title: string; sub?: string; href?: string }) {
  const body = (
    <>
      <b className="text-sea">{label}</b> · {dayLabel(dayOf(when.start))} {clock(when.start)}–{clock(when.end)}
      <br />
      <span className="font-medium">{title}</span>
      {sub && <span className="block text-muted">{sub}</span>}
    </>
  );
  return href ? (
    <Link href={href} className="block rounded-md bg-sea/10 p-3 hover:bg-sea/15">
      {body}
    </Link>
  ) : (
    <p className="rounded-md bg-sea/10 p-3">{body}</p>
  );
}
