"use client";

import { useEffect, useState } from "react";
import { clock, dayOf, isRunning, type Contribution, type Program, type Session } from "@/lib/program";
import { ContributionRow, MarksLegend, StarButton, type ListProps } from "./shared";
import { TeX } from "./TeX";

// Literal class names so Tailwind generates them: on wide screens a time slot puts all its
// parallel sessions in one row (QM runs up to six at once).
const COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
  5: "md:grid-cols-3 lg:grid-cols-5",
  6: "md:grid-cols-3 lg:grid-cols-6",
};
const colsFor = (n: number) => COLS[Math.min(n, 6)] ?? "";
/** Brand look: sessions lose their boxes and sit as columns of a printed timetable, with a
 *  hairline between neighbours (stacked on phones, side by side from md). */
const BRAND_COLUMN =
  "brand:rounded-none brand:border-0 brand:bg-transparent brand:p-0 brand:ring-0 brand:[&:not(:first-child)]:border-t brand:[&:not(:first-child)]:border-border brand:[&:not(:first-child)]:pt-3 md:brand:[&:not(:first-child)]:border-t-0 md:brand:[&:not(:first-child)]:border-l md:brand:[&:not(:first-child)]:pt-0 md:brand:[&:not(:first-child)]:pl-4";

/** md and up: parallel sessions sit side by side, so they open and close as one row. */
function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return wide;
}

type Props = ListProps & {
  program: Program;
  day: string;
  isToday: boolean;
  now?: number;
  onPosters: (sessionId: string) => void;
};

export function DaySchedule({ program, day, isToday, now, onPosters, ...p }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const wide = useWide();
  const toggle = (ids: string[], on: boolean) =>
    setOpen((cur) => {
      const next = new Set(cur);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });

  const sessions = program.sessions.filter((s) => dayOf(s.start) === day);
  const loose = program.contributions.filter((c) => dayOf(c.start) === day && !c.sessionId);
  const breaks = program.breaks.filter((b) => dayOf(b.start) === day);
  const bySession = new Map<string, Contribution[]>();
  for (const c of program.contributions) if (c.sessionId) bySession.set(c.sessionId, [...(bySession.get(c.sessionId) ?? []), c]);

  // Parallel sessions that start together share a row.
  const slots = new Map<string, Session[]>();
  for (const s of sessions) slots.set(s.start, [...(slots.get(s.start) ?? []), s]);
  const rows = [
    ...[...slots.entries()].map(([start, list]) => ({ start, kind: "slot" as const, list })),
    ...breaks.map((b) => ({ start: b.start, kind: "break" as const, b })),
  ].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="space-y-4">
      <MarksLegend />
      {isToday && now !== undefined && <NowStrip program={program} now={now} {...p} />}
      {rows.map((row) => {
        if (row.kind === "break") {
          return (
            <p key={`b${row.start}${row.b.title}`} className="flex items-center gap-3 text-sm text-muted">
              <span className="w-12 tabular-nums brand:font-mono">{clock(row.b.start)}</span>
              <span className="h-px flex-1 bg-border" />
              {row.b.title}
              <span className="h-px flex-1 bg-border" />
            </p>
          );
        }
        const talkSessions = row.list.filter((s) => !s.poster && (bySession.get(s.id)?.length ?? 0) > 0);
        const allOpen = talkSessions.length > 1 && talkSessions.every((s) => open.has(s.id));
        const compact = row.list.length >= 4;
        const single = row.list.length === 1;
        // Side by side, one tall card next to short ones reads as broken and hides where to
        // close it, so a tap opens or closes every session in the row together.
        const rowWide = wide && talkSessions.length > 1;
        return (
          <div key={row.start} data-slot className="scroll-mt-24 brand:border-t brand:border-foreground brand:pt-3">
            {talkSessions.length > 1 && (
              <div className="mb-2 flex items-center gap-3 text-sm">
                <span className="tabular-nums text-muted brand:[&>span]:font-mono brand:[&>span]:font-semibold brand:[&>span]:text-foreground">
                  <span>{clock(row.start)}</span> · {row.list.length} parallel
                </span>
                <button onClick={() => toggle(talkSessions.map((s) => s.id), !allOpen)} className="text-sea underline-offset-2 hover:underline">
                  {allOpen ? "Collapse all" : "Show all talks"}
                </button>
              </div>
            )}
            <div className={`grid gap-3 brand:gap-x-4 ${colsFor(row.list.length)}`}>
              {row.list.map((s) =>
                s.poster ? (
                  <PosterSessionCard key={s.id} session={s} count={bySession.get(s.id)?.length ?? 0} now={now} onBrowse={() => onPosters(s.id)} {...p} />
                ) : (
                  <SessionCard
                    key={s.id}
                    session={s}
                    talks={bySession.get(s.id) ?? []}
                    expanded={single || open.has(s.id)}
                    canToggle={!single}
                    onToggle={(e) => {
                      const on = !open.has(s.id);
                      toggle(rowWide ? talkSessions.map((t) => t.id) : [s.id], on);
                      if (!on) keepInView(e.currentTarget, rowWide);
                    }}
                    compact={compact}
                    now={now}
                    {...p}
                  />
                ),
              )}
            </div>
          </div>
        );
      })}
      {loose.length > 0 && (
        <ul className="divide-y divide-border rounded-md border border-border bg-surface px-3 brand:rounded-none brand:border-x-0 brand:border-t-foreground brand:bg-transparent brand:px-0">
          {loose.map((c) => (
            <ContributionRow key={c.id} c={c} starred={p.starred.has(c.id)} onStar={() => p.onStar(c.id)} onOpen={() => p.onOpen(c.id)} live={now !== undefined && isRunning(c, now)} />
          ))}
        </ul>
      )}
      {rows.length === 0 && loose.length === 0 && <p className="text-muted">Nothing scheduled on this day.</p>}
    </div>
  );
}

/** Closing a long list from its bottom would leave the reader far below it: bring the card (or
 *  the whole row) back to the top of the screen if it scrolled out above. */
function keepInView(el: HTMLElement, row: boolean) {
  const target = el.closest(row ? "[data-slot]" : "section");
  if (!target) return;
  requestAnimationFrame(() => {
    if (target.getBoundingClientRect().top < 0) target.scrollIntoView({ block: "start" });
  });
}

function SessionHeader({ session, live, compact }: { session: Session; live: boolean; compact?: boolean }) {
  return (
    <>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm tabular-nums text-muted brand:font-mono">
        {clock(session.start)}–{clock(session.end)}
        {session.room && <span className="rounded bg-border/60 px-1.5 text-xs text-foreground brand:rounded-none brand:bg-transparent brand:px-0 brand:font-sans brand:text-sm brand:font-semibold">{session.room}</span>}
        {live && <span className="rounded bg-tangerine px-1.5 text-xs font-semibold text-background brand:font-sans">NOW</span>}
      </span>
      <span className={`mt-1 block font-semibold ${compact ? "text-sm leading-snug" : ""}`}>
        <TeX text={session.title} />
      </span>
      {session.conveners.length > 0 && <span className="block text-sm text-muted">Chair: {session.conveners.join(", ")}</span>}
    </>
  );
}

function SessionCard({
  session,
  talks,
  expanded,
  canToggle,
  onToggle,
  compact,
  now,
  ...p
}: ListProps & {
  session: Session;
  talks: Contribution[];
  expanded: boolean;
  canToggle: boolean;
  onToggle: (e: React.MouseEvent<HTMLElement>) => void;
  compact: boolean;
  now?: number;
}) {
  const live = now !== undefined && isRunning(session, now);
  const toggles = canToggle && talks.length > 0;
  return (
    <section className={`scroll-mt-24 min-w-0 rounded-md border bg-surface ${compact ? "p-3" : "p-4"} ${live ? "border-tangerine ring-2 ring-tangerine/20" : "border-border"} ${BRAND_COLUMN}`}>
      <div className="flex items-start gap-1">
        <button onClick={toggles ? onToggle : undefined} aria-expanded={toggles ? expanded : undefined} className="min-w-0 flex-1 text-left">
          <SessionHeader session={session} live={live} compact={compact} />
          {toggles && <span className="mt-1 block text-sm text-sea">{expanded ? "Hide talks ▴" : `${talks.length} talks ▾`}</span>}
        </button>
        <StarButton on={p.starred.has(session.id)} title={session.title} onClick={() => p.onStar(session.id)} small={compact} />
      </div>
      {expanded && talks.length > 0 && (
        <ul className="mt-2 divide-y divide-border">
          {talks.map((c) => (
            <ContributionRow
              key={c.id}
              c={c}
              session={session}
              starred={p.starred.has(c.id)}
              onStar={() => p.onStar(c.id)}
              onOpen={() => p.onOpen(c.id)}
              live={now !== undefined && isRunning(c, now)}
              compact={compact}
            />
          ))}
        </ul>
      )}
      {toggles && expanded && (
        <button onClick={onToggle} className="mt-2 flex min-h-10 w-full items-center justify-center rounded-md border border-border text-sm text-sea hover:border-foreground">
          Hide talks ▴
        </button>
      )}
    </section>
  );
}

/** Hundreds of posters: never listed inline, the card links to the Posters view. */
function PosterSessionCard({
  session,
  count,
  now,
  onBrowse,
  ...p
}: ListProps & { session: Session; count: number; now?: number; onBrowse: () => void }) {
  const live = now !== undefined && isRunning(session, now);
  return (
    <section className={`min-w-0 rounded-md border bg-surface p-4 ${live ? "border-tangerine ring-2 ring-tangerine/20" : "border-border"} ${BRAND_COLUMN}`}>
      <div className="flex items-start gap-1">
        <div className="min-w-0 flex-1">
          <SessionHeader session={session} live={live} />
        </div>
        <StarButton on={p.starred.has(session.id)} title={session.title} onClick={() => p.onStar(session.id)} />
      </div>
      <button onClick={onBrowse} className="mt-2 inline-flex min-h-10 items-center rounded-md border border-border px-4 text-sm hover:border-foreground">
        Browse {count} posters
      </button>
    </section>
  );
}

/** On a conference day: the talks running now, or the next ones within the hour. */
function NowStrip({ program, now, ...p }: ListProps & { program: Program; now: number }) {
  const talks = program.contributions.filter((c) => !c.poster);
  const running = talks.filter((c) => isRunning(c, now));
  const soon = running.length ? [] : talks.filter((c) => Date.parse(c.start) > now && Date.parse(c.start) - now < 60 * 60_000);
  const items = (running.length ? running : soon).slice(0, 8);
  if (!items.length) return null;
  return (
    <section className="rounded-md border border-tangerine/40 p-3 brand:rounded-none brand:border-0 brand:border-t-2 brand:border-tangerine brand:p-0 brand:pt-3">
      <h2 className="text-sm font-semibold">{running.length ? "Happening now" : "Starting within the hour"}</h2>
      <ul className="mt-1 divide-y divide-border">
        {items.map((c) => (
          <ContributionRow
            key={c.id}
            c={c}
            session={p.sessionsById.get(c.sessionId ?? "")}
            starred={p.starred.has(c.id)}
            onStar={() => p.onStar(c.id)}
            onOpen={() => p.onOpen(c.id)}
          />
        ))}
      </ul>
    </section>
  );
}
