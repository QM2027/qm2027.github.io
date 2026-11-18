"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { roomOf, venueRoomId } from "@/components/program/shared";
import { TeX } from "@/components/program/TeX";
import {
  clock,
  dayLabel,
  isRunning,
  QM2027_EVENT_ID,
  savedSlots,
  useProgram,
  type Contribution,
  type Program,
  type Session,
} from "@/lib/program";
import { SITE } from "@/lib/site";
import { useLocalSet } from "@/lib/use-local-set";
import { pinnedNow, useNow } from "@/lib/use-now";

// The home page's view of the conference while it is on: what runs now, what starts next, and the
// visitor's own next item. Outside the conference week it renders nothing and loads nothing.
// `?now=<ISO time>` pins the clock, e.g. `?now=2025-04-08T11:20:00+02:00` with the QM2025 preview.

/** From the day before the first session (arrivals, registration) to the end of the last one. */
const WINDOW = { from: Date.parse(SITE.start) - 24 * 3600_000, to: Date.parse(SITE.end) };

export function HappeningNow() {
  const pinned = useSearchParams().get("now");
  const now = pinnedNow(pinned, useNow());
  if (now === undefined) return null;
  if (!pinned && (now < WINDOW.from || now > WINDOW.to)) return null;
  return <Live now={now} />;
}

type Running = { session: Session; talk?: Contribution; nextTalk?: Contribution };

type Happening = {
  running: Running[];
  posters: Session[];
  pause?: Program["breaks"][number];
  next: Session[];
  mine?: { id: string; title: string; start: string; end: string; room?: string; talk: boolean };
};

const ms = Date.parse;
const byRoom = (a: Session, b: Session) => (a.room ?? "").localeCompare(b.room ?? "", "en", { numeric: true });

/** Undefined once the last session is over. */
export function happening(program: Program, now: number, saved: ReadonlySet<string>): Happening | undefined {
  const { sessions, contributions, breaks } = program;
  if (!sessions.length || sessions.every((s) => ms(s.end) <= now)) return undefined;

  const talksIn = new Map<string, Contribution[]>();
  for (const c of contributions) {
    if (c.poster || !c.sessionId) continue;
    talksIn.set(c.sessionId, [...(talksIn.get(c.sessionId) ?? []), c]);
  }
  for (const list of talksIn.values()) list.sort((a, b) => ms(a.start) - ms(b.start));

  const running = sessions
    .filter((s) => !s.poster && isRunning(s, now))
    .sort(byRoom)
    .map((session) => {
      const talks = talksIn.get(session.id) ?? [];
      return { session, talk: talks.find((c) => isRunning(c, now)), nextTalk: talks.find((c) => ms(c.start) > now) };
    });
  const posters = sessions.filter((s) => s.poster && isRunning(s, now));

  const upcoming = sessions.filter((s) => ms(s.start) > now);
  const nextStart = Math.min(...upcoming.map((s) => ms(s.start)));
  const next = upcoming.filter((s) => ms(s.start) === nextStart).sort(byRoom);

  const sessionsById = new Map(sessions.map((s) => [s.id, s]));
  const contribById = new Map(contributions.map((c) => [c.id, c]));
  const mineSlot = savedSlots(program, saved)
    .filter((s) => ms(s.end) > now)
    .sort((a, b) => ms(a.start) - ms(b.start))[0];
  const mine = mineSlot && {
    id: mineSlot.id,
    title: mineSlot.title,
    start: mineSlot.start,
    end: mineSlot.end,
    talk: mineSlot.kind === "talk",
    room:
      mineSlot.kind === "talk"
        ? roomOf(contribById.get(mineSlot.id)!, sessionsById.get(mineSlot.sessionId ?? ""))
        : sessionsById.get(mineSlot.id)?.room,
  };

  return { running, posters, pause: breaks.find((b) => isRunning(b, now)), next, mine };
}

function Live({ now }: { now: number }) {
  const program = useProgram();
  const [saved] = useLocalSet("qm2027:my-schedule");
  if (program.status !== "ok") return null;
  const data = program.data;
  const h = happening(data, now, saved);
  if (!h) return null;

  const today = new Date(now).toLocaleDateString("sv-SE", { timeZone: data.tz });
  const time = new Date(now).toLocaleTimeString("en-GB", { timeZone: data.tz, hour: "2-digit", minute: "2-digit" });
  const nextDay = h.next[0] && h.next[0].start.slice(0, 10) !== today ? dayLabel(h.next[0].start.slice(0, 10)) : undefined;
  const quiet = !h.running.length && !h.posters.length;
  // After the day's last session, point to the next day's program.
  const programDay = quiet && nextDay ? h.next[0].start.slice(0, 10) : today;

  return (
    <section aria-labelledby="happening-now" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 id="happening-now" className="text-2xl">
            Happening now
          </h2>
          <p className="font-mono text-sm text-muted tabular-nums">
            {dayLabel(today)} · {time} local time
          </p>
        </div>
        {data.eventId !== QM2027_EVENT_ID && (
          <p className="mt-1 text-xs text-muted">Preview with a past conference’s program.</p>
        )}

        {h.mine && (
          <Link href={h.mine.talk ? `/program/?talk=${h.mine.id}` : "/program/?view=mine"} className="group mt-5 block border-l-2 border-tangerine pl-3">
            <span className="font-mono text-xs tracking-wider text-muted uppercase">
              {isRunning(h.mine, now) ? "Yours, now" : "Your next"}
            </span>
            <span className="block font-medium group-hover:underline group-hover:underline-offset-4">
              <TeX text={h.mine.title} />
            </span>
            <span className="block text-sm text-muted">
              {h.mine.start.slice(0, 10) !== today && `${dayLabel(h.mine.start.slice(0, 10))} `}
              {clock(h.mine.start)}–{clock(h.mine.end)}
              {h.mine.room && ` · ${h.mine.room}`}
            </span>
          </Link>
        )}

        {h.pause && (
          <p className="mt-5">
            <b className="font-medium">{h.pause.title}</b> <span className="text-muted">until {clock(h.pause.end)}</span>
          </p>
        )}

        {h.running.length > 0 && (
          <ul className="mt-5 grid border-t border-border md:grid-cols-2 md:gap-x-10 lg:grid-cols-3">
            {h.running.map((r) => (
              <RunningSession key={r.session.id} r={r} today={today} />
            ))}
          </ul>
        )}

        {h.posters.map((s) => (
          <p key={s.id} className="mt-4">
            <Link href={`/program/?view=posters&ps=${s.id}`} className="font-medium hover:underline hover:underline-offset-4">
              {s.title}
            </Link>{" "}
            <span className="text-muted">until {clock(s.end)}</span>
          </p>
        ))}

        {quiet && !h.pause && h.next.length > 0 && (
          <p className="mt-5 text-muted">{nextDay ? "No more sessions today." : "No session is running right now."}</p>
        )}

        {h.next.length > 0 && (
          <div className="mt-6">
            <h3 className="font-mono text-xs tracking-wider text-muted uppercase">
              Next{nextDay ? `, ${nextDay}` : ""} at {clock(h.next[0].start)}
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {h.next.map((s) => (
                <li key={s.id}>
                  <Link href={s.poster ? `/program/?view=posters&ps=${s.id}` : `/program/?day=${s.start.slice(0, 10)}`} className="hover:underline hover:underline-offset-4">
                    {s.title}
                  </Link>
                  {s.room && <span className="text-muted"> · {s.room}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link href={`/program/?day=${programDay}`} className="mt-6 inline-block text-sm underline decoration-border underline-offset-4 hover:decoration-foreground">
          {programDay === today ? "Today’s full program" : `Program for ${dayLabel(programDay)}`}
        </Link>
      </div>
    </section>
  );
}

function RunningSession({ r, today }: { r: Running; today: string }) {
  const { session, talk, nextTalk } = r;
  const roomId = venueRoomId(session.room);
  return (
    <li className="border-b border-border py-3">
      <p className="font-mono text-xs text-muted tabular-nums">
        {session.room && roomId ? (
          <Link href={`/venue/?room=${roomId}`} className="underline decoration-border underline-offset-2 hover:decoration-foreground">
            {session.room}
          </Link>
        ) : (
          session.room
        )}
        {session.room && " · "}until {clock(session.end)}
      </p>
      <Link href={`/program/?day=${today}`} className="mt-0.5 block font-medium leading-snug hover:underline hover:underline-offset-4">
        {session.title}
      </Link>
      {(talk ?? nextTalk) && (
        <Link href={`/program/?talk=${(talk ?? nextTalk)!.id}`} className="mt-1 block text-sm hover:underline hover:underline-offset-4">
          <span className="text-muted tabular-nums">
            {talk ? <b className="font-semibold text-tangerine">NOW</b> : clock(nextTalk!.start)}{" "}
          </span>
          <TeX text={(talk ?? nextTalk)!.title} />
          {(talk ?? nextTalk)!.speakers.length > 0 && (
            <span className="text-muted"> · {(talk ?? nextTalk)!.speakers.map((s) => s.name).join(", ")}</span>
          )}
        </Link>
      )}
    </li>
  );
}
