"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { INDICO_GROUPS, INDICO_TIMETABLE } from "@/data/indico-links";
import { downloadIcs } from "@/lib/ics";
import {
  clock,
  dayLabel,
  dayOf,
  isRunning,
  overlaps,
  useProgram,
  type Contribution,
  type Program,
  type Session,
} from "@/lib/program";
import { useLocalSet } from "@/lib/use-local-set";

type View = "day" | "mine" | "updates";

const toIcs = (c: Contribution, session?: Session) => ({
  uid: `qm-${c.id}`,
  title: c.title,
  start: c.start,
  end: c.end,
  location: c.room ?? session?.room,
  description: [c.speakers.map((s) => s.name).join(", "), session?.title].filter(Boolean).join("\n"),
  url: c.url,
});

/** Re-renders every minute so "now" badges stay current. */
function useNow() {
  const [now, setNow] = useState<number>();
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function ProgramApp() {
  const program = useProgram();

  if (program.status === "loading") return <div className="h-64 animate-pulse rounded-2xl bg-border/40" />;
  if (program.status === "error" || program.data.contributions.length === 0) {
    return <NotPublished syncedAt={program.status === "ok" ? program.data.syncedAt : undefined} />;
  }
  return <ProgramBrowser program={program.data} />;
}

function NotPublished({ syncedAt }: { syncedAt?: string }) {
  const links = INDICO_GROUPS.find((g) => g.title === "Abstracts & Program")!.links;
  return (
    <div className="max-w-3xl">
      <p className="text-muted">
        The detailed timetable hasn&apos;t been published on Indico yet. Once it is, it will appear here automatically,
        with search, a personal schedule and offline access.
      </p>
      {syncedAt && <p className="mt-2 text-xs text-muted">Last checked {new Date(syncedAt).toLocaleString("en-GB")}.</p>}
      <a href={INDICO_TIMETABLE} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-sea px-6 font-semibold text-on-sea">
        Open timetable on Indico <Icon name="external" className="size-4" />
      </a>
      <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-between px-4">
              {l.label} <Icon name="external" className="size-4 text-muted" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProgramBrowser({ program }: { program: Program }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const now = useNow();
  const [starred, toggleStar] = useLocalSet("qm2027:my-schedule");
  const [query, setQuery] = useState("");

  const sessionsById = useMemo(() => new Map(program.sessions.map((s) => [s.id, s])), [program]);
  const days = useMemo(
    () => [...new Set([...program.sessions, ...program.contributions].map((x) => dayOf(x.start)))].sort(),
    [program],
  );

  const view = (params.get("view") as View | null) ?? "day";
  const todayKey = now ? new Date(now).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }) : undefined;
  const day = params.get("day") ?? (todayKey && days.includes(todayKey) ? todayKey : days[0]);
  const talk = program.contributions.find((c) => c.id === params.get("talk"));

  function update(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }
  const openTalk = (id: string) => update({ talk: id });

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (q.length < 2) return [];
    return program.contributions
      .filter((c) =>
        [c.title, c.abstract, sessionsById.get(c.sessionId ?? "")?.title, ...c.speakers.flatMap((s) => [s.name, s.affiliation])]
          .some((f) => f?.toLowerCase().includes(q)),
      )
      .slice(0, 100);
  }, [q, program, sessionsById]);

  const mine = program.contributions.filter((c) => starred.has(c.id));
  const changedIds = new Set(program.changes.filter((c) => c.kind !== "added").map((c) => c.id));

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 space-y-3 bg-background/95 px-4 py-3 backdrop-blur lg:-mx-8 lg:px-8">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search talks, speakers, abstracts…"
          className="min-h-11 w-full rounded-xl border border-border bg-surface px-4"
          aria-label="Search the program"
        />
        {!q && (
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["day", "Schedule"],
                ["mine", `★ My schedule (${mine.length})`],
                ["updates", `Updates${program.changes.length ? ` (${program.changes.length})` : ""}`],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => update({ view: v === "day" ? undefined : v })}
                aria-pressed={view === v}
                className="min-h-10 rounded-full border border-border px-4 text-sm aria-pressed:border-transparent aria-pressed:bg-foreground aria-pressed:text-background"
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {!q && view === "day" && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
            {days.map((d) => (
              <button
                key={d}
                onClick={() => update({ day: d })}
                aria-pressed={d === day}
                className="min-h-10 shrink-0 rounded-full border border-border bg-surface px-4 text-sm aria-pressed:border-sea aria-pressed:bg-sea aria-pressed:text-on-sea"
              >
                {dayLabel(d)}
                {d === todayKey && " · today"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        {q ? (
          <TalkList
            items={results}
            empty={q.length < 2 ? "Type at least two letters." : "No matches."}
            sessionsById={sessionsById}
            starred={starred}
            onStar={toggleStar}
            onOpen={openTalk}
            showDay
          />
        ) : view === "mine" ? (
          <MySchedule items={mine} sessionsById={sessionsById} starred={starred} onStar={toggleStar} onOpen={openTalk} changedIds={changedIds} />
        ) : view === "updates" ? (
          <Updates program={program} onOpen={openTalk} />
        ) : (
          <DaySchedule program={program} day={day} now={now} sessionsById={sessionsById} starred={starred} onStar={toggleStar} onOpen={openTalk} />
        )}
      </div>

      {talk && (
        <TalkDetail
          talk={talk}
          session={sessionsById.get(talk.sessionId ?? "")}
          starred={starred.has(talk.id)}
          changed={changedIds.has(talk.id)}
          onStar={() => toggleStar(talk.id)}
          onClose={() => update({ talk: undefined })}
        />
      )}
      <p className="mt-8 text-xs text-muted">
        Synced from Indico {new Date(program.syncedAt).toLocaleString("en-GB")}. Times are local (KST). If anything here
        differs, Indico is authoritative.
      </p>
    </div>
  );
}

type ListProps = {
  sessionsById: Map<string, Session>;
  starred: ReadonlySet<string>;
  onStar: (id: string) => void;
  onOpen: (id: string) => void;
};

function StarButton({ on, title, onClick }: { on: boolean; title: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      aria-label={on ? `Remove “${title}” from my schedule` : `Add “${title}” to my schedule`}
      className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xl ${on ? "text-canola" : "text-muted hover:text-foreground"}`}
    >
      {on ? "★" : "☆"}
    </button>
  );
}

function TalkRow({ c, session, starred, onStar, onOpen, showDay, warn }: { c: Contribution; session?: Session; starred: boolean; onStar: () => void; onOpen: () => void; showDay?: boolean; warn?: string }) {
  return (
    <li className="flex items-start gap-2 py-2">
      <span className="w-12 shrink-0 pt-2 text-sm tabular-nums text-muted">{clock(c.start)}</span>
      <button onClick={onOpen} className="min-w-0 flex-1 py-1.5 text-left">
        <span className="block font-medium leading-snug hover:text-sea">{c.title}</span>
        <span className="block truncate text-sm text-muted">
          {[showDay && dayLabel(dayOf(c.start)), c.speakers.map((s) => s.name).join(", "), c.room ?? session?.room].filter(Boolean).join(" · ")}
        </span>
        {warn && <span className="mt-1 inline-block rounded bg-tangerine/15 px-1.5 text-xs text-tangerine">{warn}</span>}
      </button>
      <StarButton on={starred} title={c.title} onClick={onStar} />
    </li>
  );
}

function TalkList({ items, empty, showDay, ...p }: ListProps & { items: Contribution[]; empty: string; showDay?: boolean }) {
  if (!items.length) return <p className="text-muted">{empty}</p>;
  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-surface px-3">
      {items.map((c) => (
        <TalkRow key={c.id} c={c} session={p.sessionsById.get(c.sessionId ?? "")} starred={p.starred.has(c.id)} onStar={() => p.onStar(c.id)} onOpen={() => p.onOpen(c.id)} showDay={showDay} />
      ))}
    </ul>
  );
}

function DaySchedule({ program, day, now, ...p }: ListProps & { program: Program; day: string; now?: number }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const sessions = program.sessions.filter((s) => dayOf(s.start) === day);
  const loose = program.contributions.filter((c) => dayOf(c.start) === day && !c.sessionId);
  const breaks = program.breaks.filter((b) => dayOf(b.start) === day);

  // Parallel sessions that start together share a row (side by side on wide screens).
  const slots = new Map<string, Session[]>();
  for (const s of sessions) slots.set(s.start, [...(slots.get(s.start) ?? []), s]);
  const rows = [
    ...[...slots.entries()].map(([start, list]) => ({ start, kind: "slot" as const, list })),
    ...breaks.map((b) => ({ start: b.start, kind: "break" as const, b })),
  ].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="space-y-4">
      {rows.map((row) =>
        row.kind === "break" ? (
          <p key={`b${row.start}${row.b.title}`} className="flex items-center gap-3 text-sm text-muted">
            <span className="w-12 tabular-nums">{clock(row.b.start)}</span>
            <span className="h-px flex-1 bg-border" />☕ {row.b.title}
            <span className="h-px flex-1 bg-border" />
          </p>
        ) : (
          <div key={row.start} className="grid gap-3 md:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
            {row.list.map((s) => {
              const talks = program.contributions.filter((c) => c.sessionId === s.id);
              const expanded = open.has(s.id) || row.list.length === 1;
              const live = now !== undefined && isRunning(s, now);
              return (
                <section key={s.id} className={`rounded-2xl border bg-surface p-4 ${live ? "border-tangerine ring-2 ring-tangerine/20" : "border-border"}`}>
                  <button
                    onClick={() => setOpen((cur) => new Set(cur.has(s.id) ? [...cur].filter((x) => x !== s.id) : [...cur, s.id]))}
                    aria-expanded={expanded}
                    className="w-full text-left"
                  >
                    <span className="flex items-center gap-2 text-sm tabular-nums text-muted">
                      {clock(s.start)}–{clock(s.end)}
                      {s.room && <span className="rounded bg-border/60 px-1.5 text-xs text-foreground">{s.room}</span>}
                      {live && <span className="rounded bg-tangerine px-1.5 text-xs font-semibold text-white">NOW</span>}
                    </span>
                    <span className="mt-1 block font-semibold">{s.title}</span>
                    {s.conveners.length > 0 && <span className="block text-sm text-muted">Chair: {s.conveners.join(", ")}</span>}
                    {talks.length > 0 && !expanded && <span className="mt-1 block text-sm text-sea">{talks.length} talks ▾</span>}
                  </button>
                  {expanded && talks.length > 0 && (
                    <ul className="mt-2 divide-y divide-border">
                      {talks.map((c) => (
                        <TalkRow key={c.id} c={c} session={s} starred={p.starred.has(c.id)} onStar={() => p.onStar(c.id)} onOpen={() => p.onOpen(c.id)} />
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        ),
      )}
      {loose.length > 0 && <TalkList items={loose} empty="" {...p} />}
      {rows.length === 0 && loose.length === 0 && <p className="text-muted">Nothing scheduled on this day.</p>}
    </div>
  );
}

function MySchedule({ items, changedIds, ...p }: ListProps & { items: Contribution[]; changedIds: Set<string> }) {
  if (!items.length) {
    return <p className="text-muted">Tap ☆ next to a talk to add it here. Your schedule is saved on this device.</p>;
  }
  const days = [...new Set(items.map((c) => dayOf(c.start)))].sort();
  return (
    <div className="space-y-6">
      <button
        onClick={() => downloadIcs("qm2027-my-schedule.ics", items.map((c) => toIcs(c, p.sessionsById.get(c.sessionId ?? ""))))}
        className="min-h-11 rounded-xl bg-sea px-5 font-semibold text-on-sea"
      >
        Add all {items.length} to my calendar (.ics)
      </button>
      {days.map((d) => (
        <section key={d}>
          <h2 className="font-semibold">{dayLabel(d)}</h2>
          <ul className="mt-2 divide-y divide-border rounded-2xl border border-border bg-surface px-3">
            {items
              .filter((c) => dayOf(c.start) === d)
              .map((c) => {
                const clash = items.find((o) => o.id !== c.id && overlaps(o, c));
                return (
                  <TalkRow
                    key={c.id}
                    c={c}
                    session={p.sessionsById.get(c.sessionId ?? "")}
                    starred
                    onStar={() => p.onStar(c.id)}
                    onOpen={() => p.onOpen(c.id)}
                    warn={changedIds.has(c.id) ? "Time or room changed: check details" : clash ? `Overlaps “${clash.title}”` : undefined}
                  />
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Updates({ program, onOpen }: { program: Program; onOpen: (id: string) => void }) {
  if (!program.changes.length) return <p className="text-muted">No changes since the program was published.</p>;
  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-surface px-4">
      {program.changes.map((c) => (
        <li key={`${c.id}${c.detectedAt}`} className="py-3">
          <p className="text-xs text-muted">
            {new Date(c.detectedAt).toLocaleString("en-GB")} ·{" "}
            <b className={c.kind === "removed" ? "text-tangerine" : "text-sea"}>{c.kind}</b>
          </p>
          {c.kind === "removed" ? (
            <p className="font-medium line-through decoration-muted">{c.title}</p>
          ) : (
            <button onClick={() => onOpen(c.id)} className="text-left font-medium hover:text-sea">{c.title}</button>
          )}
          {c.kind === "moved" && c.from && (
            <p className="text-sm text-muted">
              {dayLabel(dayOf(c.from.start))} {clock(c.from.start)} {c.from.room} → <b className="text-foreground">{dayLabel(dayOf(c.start))} {clock(c.start)} {c.room}</b>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function TalkDetail({ talk, session, starred, changed, onStar, onClose }: { talk: Contribution; session?: Session; starred: boolean; changed: boolean; onStar: () => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1200] flex justify-end bg-black/30" onClick={onClose}>
      <aside
        role="dialog"
        aria-label={talk.title}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full flex-col overflow-y-auto bg-background p-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:max-w-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm tabular-nums text-muted">
            {dayLabel(dayOf(talk.start))} · {clock(talk.start)}–{clock(talk.end)}
            {(talk.room ?? session?.room) && ` · ${talk.room ?? session?.room}`}
          </p>
          <button onClick={onClose} aria-label="Close" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border">
            <Icon name="close" />
          </button>
        </div>
        <h2 className="mt-2 text-xl font-semibold leading-snug">{talk.title}</h2>
        {session && <p className="mt-1 text-sm text-muted">{session.title}</p>}
        {changed && <p className="mt-3 rounded-xl bg-tangerine/10 p-3 text-sm text-tangerine">This talk&apos;s time or room changed recently.</p>}
        {talk.speakers.length > 0 && (
          <ul className="mt-4 space-y-1">
            {talk.speakers.map((s) => (
              <li key={s.name} className="text-sm">
                <b>{s.name}</b>
                {s.affiliation && <span className="text-muted"> · {s.affiliation}</span>}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onStar} aria-pressed={starred} className="min-h-11 rounded-xl border border-border px-4 text-sm aria-pressed:border-canola aria-pressed:bg-canola/15">
            {starred ? "★ In my schedule" : "☆ Add to my schedule"}
          </button>
          <button onClick={() => downloadIcs(`qm2027-${talk.id}.ics`, [toIcs(talk, session)])} className="min-h-11 rounded-xl border border-border px-4 text-sm">
            📅 Calendar
          </button>
          <Link href="/venue/" className="flex min-h-11 items-center rounded-xl border border-border px-4 text-sm">
            🗺 Floor plan
          </Link>
          {talk.url && (
            <a href={talk.url} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-1 rounded-xl border border-border px-4 text-sm">
              Indico <Icon name="external" className="size-4" />
            </a>
          )}
        </div>
        {talk.abstract ? (
          <p className="mt-5 leading-relaxed whitespace-pre-line">{talk.abstract}</p>
        ) : (
          <p className="mt-5 text-sm text-muted">No abstract on Indico.</p>
        )}
      </aside>
    </div>
  );
}
