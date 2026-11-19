"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon";
import { DEFAULT_FLOOR, FLOORS, KIND_GROUPS, ROOM_KINDS, ROUTES, type KindGroup, type Room, type RoomKind, type Route } from "@/data/venue";
import { FloorPlan, KindGlyph, KindTag, Legend } from "./FloorPlan";
import { clock, dayLabel, dayOf, isRunning, useProgram } from "@/lib/program";
import { pinnedNow, useNow } from "@/lib/use-now";
import { INDICO_ROOM_MAP, MAPPED_ROOM_IDS } from "@/data/indico-rooms";

const GROUP_ORDER: KindGroup[] = ["hall", "participant", "office", "service", "other"];
const FIND_KINDS = (Object.keys(ROOM_KINDS) as RoomKind[]).filter((k) => !ROOM_KINDS[k].hidden);
/** Find buttons under their group headings. */
const FIND_GROUPS = GROUP_ORDER.map((g) => ({ group: g, kinds: FIND_KINDS.filter((k) => ROOM_KINDS[k].group === g) })).filter((x) => x.kinds.length);
const groupRank = (r: Room) => GROUP_ORDER.indexOf(ROOM_KINDS[r.kind].group);

/*
 * Brand look (?look=brand): the floor tabs sit on the blue field that opens the page (page.tsx);
 * below it the side panels open up into sections under a rule, and the room, route and Find
 * buttons become ruled rows. The accent fills only what is selected. Default and plain unchanged.
 */
/** A boxed side panel opens up into a section under a rule. */
const BRAND_SECTION =
  "brand:rounded-none brand:border-0 brand:border-t brand:border-foreground brand:bg-transparent brand:px-0 brand:pt-4 brand:pb-0";
/** A boxed button becomes a ruled row. */
const BRAND_ROW_BASE =
  "brand:rounded-none brand:border-0 brand:border-t brand:border-border brand:py-2 brand:hover:underline brand:hover:underline-offset-4 brand:aria-pressed:border-tangerine";
/** Route and Find rows: selected, filled with the accent. */
const BRAND_ROW = `${BRAND_ROW_BASE} brand:text-base brand:aria-pressed:bg-tangerine brand:aria-pressed:text-background`;
/** Room rows carry the group glyphs, which a blue fill would swallow: selected, a tint of the accent. */
const BRAND_ROOM_ROW = `${BRAND_ROW_BASE} brand:text-sm sm:brand:text-base brand:aria-pressed:bg-tangerine/10 brand:aria-pressed:font-semibold brand:aria-pressed:text-tangerine`;

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

  // Picking a room of another kind ends the Find highlight; browsing within the kind keeps it.
  function select(id: string) {
    const kind = floor.rooms.find((r) => r.id === id)?.kind;
    update({ room: id, floor: floor.id, find: kind === highlight ? (highlight ?? undefined) : undefined });
  }

  // Floors that hold the highlighted facility or part of the active route: dots on the floor tabs.
  const hits = new Set<string>([
    ...(highlight ? FLOORS.filter((f) => f.rooms.some((r) => r.kind === highlight)).map((f) => f.id) : []),
    ...(route ? Object.keys(route.paths) : []),
  ]);

  return (
    <>
      {/* Brand: the floor tabs along the bottom edge of the field, white ink, the selected floor underlined. */}
      <div className="hidden bg-brand-field text-on-brand-field brand:block">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div role="tablist" aria-label="Floor" className="flex h-14 gap-8 sm:gap-10">
            {FLOORS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={f.id === floor.id}
                onClick={() => update({ floor: f.id, room: undefined })}
                className="relative flex items-end gap-1.5 border-b-4 border-transparent pb-2 text-2xl leading-none font-semibold text-brand-field-muted hover:text-on-brand-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-brand-field aria-selected:border-on-brand-field aria-selected:text-on-brand-field"
              >
                {f.label}
                {f.id === DEFAULT_FLOOR && <span className="text-sm font-normal">entrance</span>}
                {hits.has(f.id) && <span className="absolute top-2 -right-2.5 size-2 rounded-full bg-on-brand-field" />}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] brand:mx-auto brand:mt-8 brand:max-w-7xl brand:gap-x-12 brand:gap-y-14 brand:px-4 lg:brand:px-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 brand:hidden">
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

          <div className="mt-4 overflow-hidden rounded-md border border-border bg-surface p-2 sm:p-4 brand:mt-0 brand:rounded-none brand:border-0">
            <FloorPlan
              floor={floor}
              selected={room?.id}
              highlight={highlight}
              route={route}
              onSelect={select}
            />
          </div>
          <Legend />
          {/* Markers are small on phones; the list is the reliable target. Brand: a ruled directory. */}
          <h2 className="mt-12 hidden text-xl brand:block">Rooms on {floor.label}</h2>
          <ul
            className="mt-3 flex flex-wrap gap-2 brand:mt-4 brand:grid brand:gap-x-6 brand:gap-y-0 brand:border-b brand:border-border brand:grid-cols-2 xl:brand:grid-cols-3"
            aria-label={`Rooms on ${floor.label}`}
          >
            {[...floor.rooms].sort((a, b) => groupRank(a) - groupRank(b)).map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => select(r.id)}
                  aria-pressed={r.id === room?.id}
                  className={`flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background brand:min-h-11 brand:w-full brand:text-left ${BRAND_ROOM_ROW}`}
                >
                  <KindGlyph group={ROOM_KINDS[r.kind].group} />
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted brand:mt-3">
            Traced from the ICC Jeju floor plans and simplified. Rooms marked “planned” may still change.
          </p>
        </div>

        <aside className="space-y-4 brand:space-y-12">
          {room ? (
            <RoomCard room={room} floorLabel={floor.label} onClose={() => update({ room: undefined })} />
          ) : (
            <div className="rounded-md border border-dashed border-border p-5 text-sm text-muted brand:rounded-none brand:border-0 brand:border-t brand:border-solid brand:border-foreground brand:px-0 brand:pt-4 brand:pb-0 brand:text-base">
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

          <div className={`rounded-md border border-border bg-surface p-4 ${BRAND_SECTION}`}>
            <h2 className="text-sm font-semibold brand:text-xl">Find…</h2>
            {FIND_GROUPS.map(({ group, kinds }) => (
              <section key={group} className="mt-3 brand:mt-6" aria-label={KIND_GROUPS[group].label}>
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted brand:text-sm brand:text-foreground">
                  <KindGlyph group={group} className="size-3" />
                  {KIND_GROUPS[group].label}
                </h3>
                <ul className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 brand:mt-2 brand:gap-x-6 brand:gap-y-0 brand:border-b brand:border-border">
                  {kinds.map((k) => (
                    <li key={k}>
                      <button
                        onClick={() => update({ find: highlight === k ? undefined : k, room: undefined })}
                        aria-pressed={highlight === k}
                        className={`flex min-h-11 w-full items-center gap-2 rounded-md border border-border border-l-4 px-3 text-left text-sm aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background ${BRAND_ROW}`}
                        style={{ borderLeftColor: KIND_GROUPS[group].color }}
                      >
                        {ROOM_KINDS[k].label}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {highlight && (
              <p className="mt-3 text-sm text-muted brand:text-base">
                On {FLOORS.filter((f) => f.rooms.some((r) => r.kind === highlight)).map((f) => f.label).join(", ")}
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
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
    <div className={`rounded-md border border-border bg-surface p-4 ${BRAND_SECTION}`}>
      <h2 className="text-sm font-semibold brand:text-xl">Getting around</h2>
      <p className="mt-1 text-xs text-muted brand:text-sm">The main entrance is on 3F, at street level.</p>
      <ul className="mt-3 space-y-2 brand:mt-4 brand:space-y-0 brand:border-b brand:border-border">
        {ROUTES.map((r) => (
          <li key={r.id}>
            <button
              onClick={() => onPick(r)}
              aria-pressed={r.id === route?.id}
              className={`flex min-h-11 w-full items-center rounded-md border border-border px-3 text-left text-sm aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background ${BRAND_ROW}`}
            >
              {r.label}
            </button>
          </li>
        ))}
      </ul>
      {route && (
        <div className="mt-4">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed brand:text-base brand:marker:text-muted">
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
                  className="min-h-10 rounded-md border border-border px-3 font-mono text-sm aria-pressed:border-foreground brand:rounded-none brand:aria-pressed:border-tangerine brand:aria-pressed:bg-tangerine brand:aria-pressed:text-background"
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
  return (
    <div className="rounded-md border border-border bg-surface p-5 brand:rounded-none brand:border-0 brand:border-t-4 brand:border-tangerine brand:bg-transparent brand:px-0 brand:pt-4 brand:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <KindTag kind={room.kind}>
            <span className="text-muted">· {floorLabel}</span>
            {room.estimated && <span className="ml-1 font-medium normal-case text-muted">planned</span>}
          </KindTag>
          <h2 className="mt-1 text-xl font-semibold brand:mt-2 brand:text-2xl">{room.name}</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border brand:-mt-1 brand:-mr-2.5 brand:rounded-none brand:border-0 brand:hover:bg-surface"
        >
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
      <p className="mt-4 rounded-md bg-sea/10 p-3 text-sm text-sea brand:rounded-none brand:border-t brand:border-border brand:bg-transparent brand:px-0 brand:text-muted">
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
    <div className="mt-4 space-y-2 text-sm brand:space-y-0">
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
      <Link href="/program/" className="inline-block text-sea underline brand:mt-3 brand:underline-offset-4">Full program</Link>
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
    <div className="mt-4 space-y-2 text-sm brand:space-y-0">
      {current && <Line label="Now" when={current} title={current.title} sub={`${count(current.id)} posters`} href={`/program/?view=posters&ps=${current.id}`} />}
      {next && <Line label="Next" when={next} title={next.title} sub={`${count(next.id)} posters`} href={`/program/?view=posters&ps=${next.id}`} />}
      <Link href="/program/?view=posters" className="inline-block text-sea underline brand:mt-3 brand:underline-offset-4">All posters</Link>
    </div>
  );
}

/** Brand: a now/next line is a ruled row, not a tinted box. */
const BRAND_LINE = "brand:rounded-none brand:border-t brand:border-border brand:bg-transparent brand:px-0 brand:py-3 brand:hover:bg-transparent";

function Line({ label, when, title, sub, href }: { label: string; when: { start: string; end: string }; title: string; sub?: string; href?: string }) {
  const body = (
    <>
      <b className="text-sea">{label}</b> · {dayLabel(dayOf(when.start))} {clock(when.start)}–{clock(when.end)}
      <br />
      <span className="font-medium brand:group-hover:underline brand:group-hover:underline-offset-4">{title}</span>
      {sub && <span className="block text-muted">{sub}</span>}
    </>
  );
  return href ? (
    <Link href={href} className={`group block rounded-md bg-sea/10 p-3 hover:bg-sea/15 ${BRAND_LINE}`}>
      {body}
    </Link>
  ) : (
    <p className={`rounded-md bg-sea/10 p-3 ${BRAND_LINE}`}>{body}</p>
  );
}
