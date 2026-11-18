"use client";

import { useState } from "react";
import { downloadIcs } from "@/lib/ics";
import { byBoard } from "@/lib/program-search";
import { clock, dayLabel, dayOf, overlaps, type Contribution, type Program, type Session } from "@/lib/program";
import { ContributionRow, posterSessionIcs, sessionIcs, shareLink, StarButton, talkIcs, type ListProps } from "./shared";
import { TeX } from "./TeX";

type Props = ListProps & { program: Program; changedIds: Set<string>; onSession: (s: Session) => void };

type Entry = { kind: "talk"; c: Contribution; start: string; end: string } | { kind: "session"; s: Session; start: string; end: string };

/**
 * Saved talks and sessions as a timeline per day, with clash warnings between them (a talk
 * inside a saved session doesn't clash with it). Saved posters are grouped per poster session:
 * posters are up all week, so they never clash with anything.
 */
export function MySchedule({ program, changedIds, onSession, ...p }: Props) {
  const [shared, setShared] = useState<string>();
  const items = program.contributions.filter((c) => p.starred.has(c.id));
  const talks = items.filter((c) => !c.poster);
  const posters = items.filter((c) => c.poster);
  const sessions = program.sessions.filter((s) => p.starred.has(s.id));
  const known = new Set([...program.contributions, ...program.unscheduled, ...program.sessions].map((c) => c.id));
  const gone = [...p.starred].filter((id) => !known.has(id)).length;

  if (!items.length && !sessions.length) {
    return (
      <div className="space-y-2 text-muted">
        <p>Tap ☆ next to a session, talk or poster to add it here. Your schedule is saved on this device.</p>
        {gone > 0 && <p className="text-sm">{gone} saved item(s) are no longer in the program.</p>}
      </div>
    );
  }

  const posterGroups = new Map<string, Contribution[]>();
  for (const c of posters) if (c.sessionId) posterGroups.set(c.sessionId, [...(posterGroups.get(c.sessionId) ?? []), c]);
  // A saved poster session shows as its group, even with no single poster saved.
  for (const s of sessions) if (s.poster && !posterGroups.has(s.id)) posterGroups.set(s.id, []);
  const timeline: Entry[] = [
    ...talks.map((c) => ({ kind: "talk" as const, c, start: c.start, end: c.end })),
    ...sessions.filter((s) => !s.poster).map((s) => ({ kind: "session" as const, s, start: s.start, end: s.end })),
  ].sort((a, b) => a.start.localeCompare(b.start) || (a.kind === "session" ? -1 : 1));
  const days = [...new Set([...timeline.map((e) => dayOf(e.start)), ...[...posterGroups.keys()].map((id) => dayOf(p.sessionsById.get(id)!.start))])].sort();

  const idOf = (e: Entry) => (e.kind === "talk" ? e.c.id : e.s.id);
  const sessionOf = (e: Entry) => (e.kind === "talk" ? e.c.sessionId : e.s.id);
  const titleOf = (e: Entry) => (e.kind === "talk" ? e.c.title : e.s.title);
  /** Same session (a talk and its session, or two talks of one session) is not a clash. */
  const clashWith = (e: Entry, list: Entry[]) =>
    list.find((o) => idOf(o) !== idOf(e) && !(sessionOf(o) && sessionOf(o) === sessionOf(e) && (o.kind === "session" || e.kind === "session")) && overlaps(o, e));
  const sessionChanged = (s: Session) => program.changes.some((c) => c.sessionId === s.id || c.id === s.id);

  function exportIcs() {
    const events = [
      ...talks.map((c) => talkIcs(c, p.sessionsById.get(c.sessionId ?? ""))),
      ...sessions.filter((s) => !s.poster).map((s) => sessionIcs(s)),
      ...[...posterGroups].flatMap(([id, list]) => {
        const s = p.sessionsById.get(id);
        return s ? [posterSessionIcs(s, list.sort(byBoard))] : [];
      }),
    ];
    downloadIcs("qm2027-my-schedule.ics", events);
  }

  async function shareSchedule() {
    // The link is the only backup: Safari clears site storage after a week unused unless the guide is installed.
    const url = `${location.origin}${location.pathname}?view=mine&ids=${[...p.starred].filter((id) => known.has(id)).join(",")}`;
    const result = await shareLink("My QM2027 schedule", url);
    setShared(result === "copied" ? "Link copied" : result === "shared" ? "Shared" : "Couldn't share");
  }

  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button onClick={exportIcs} className="min-h-11 rounded-md bg-sea px-5 font-semibold text-on-sea">
          Add to my calendar (.ics)
        </button>
        <button onClick={shareSchedule} className="min-h-11 rounded-md border border-border px-4 text-sm">
          {shared ?? "Copy schedule link"}
        </button>
      </div>
      <p className="text-sm text-muted">
        {plural(sessions.length, "session")}, {plural(talks.length, "talk")}, {plural(posters.length, "poster")}. Saved on this device
        only. The link opens your schedule on another phone or after clearing the browser.
        {gone > 0 && ` ${gone} saved item(s) are no longer in the program.`}
      </p>

      {days.map((d) => {
        const dayEntries = timeline.filter((e) => dayOf(e.start) === d);
        const dayGroups = [...posterGroups].filter(([id]) => dayOf(p.sessionsById.get(id)!.start) === d);
        return (
          <section key={d}>
            <h2 className="font-semibold">{dayLabel(d)}</h2>
            {dayEntries.length > 0 && (
              <ul className="mt-2 divide-y divide-border rounded-md border border-border bg-surface px-3">
                {dayEntries.map((e) => {
                  const clash = clashWith(e, dayEntries);
                  const clashText = clash ? `Overlaps “${titleOf(clash)}”` : undefined;
                  return e.kind === "talk" ? (
                    <ContributionRow
                      key={e.c.id}
                      c={e.c}
                      session={p.sessionsById.get(e.c.sessionId ?? "")}
                      starred
                      onStar={() => p.onStar(e.c.id)}
                      onOpen={() => p.onOpen(e.c.id)}
                      warn={changedIds.has(e.c.id) ? "Time or room changed: check details" : clashText}
                    />
                  ) : (
                    <SessionRow
                      key={e.s.id}
                      session={e.s}
                      talks={program.contributions.filter((c) => c.sessionId === e.s.id).length}
                      onStar={() => p.onStar(e.s.id)}
                      onOpen={() => onSession(e.s)}
                      warn={sessionChanged(e.s) ? "Something in this session changed: see Updates" : clashText}
                    />
                  );
                })}
              </ul>
            )}
            {dayGroups.map(([id, list]) => (
              <PosterGroup key={id} session={p.sessionsById.get(id)!} posters={list} changedIds={changedIds} onSession={onSession} {...p} />
            ))}
          </section>
        );
      })}
    </div>
  );
}

function SessionRow({ session, talks, onStar, onOpen, warn }: { session: Session; talks: number; onStar: () => void; onOpen: () => void; warn?: string }) {
  return (
    <li className="flex items-start gap-2 py-2">
      <span className="w-12 shrink-0 pt-2 text-sm tabular-nums text-muted">{clock(session.start)}</span>
      <button onClick={onOpen} className="min-w-0 flex-1 py-1.5 text-left">
        <span className="block text-xs font-semibold uppercase tracking-wide text-muted">Session</span>
        <span className="block font-semibold leading-snug hover:text-sea">
          <TeX text={session.title} />
        </span>
        <span className="block truncate text-sm text-muted">
          {[`until ${clock(session.end)}`, session.room, talks ? `${talks} talks` : undefined].filter(Boolean).join(" · ")}
        </span>
        {warn && <span className="mt-1 inline-block rounded bg-tangerine/15 px-1.5 text-xs text-tangerine">{warn}</span>}
      </button>
      <StarButton on title={session.title} onClick={onStar} />
    </li>
  );
}

function PosterGroup({
  session,
  posters,
  changedIds,
  onSession,
  ...p
}: ListProps & { session: Session; posters: Contribution[]; changedIds: Set<string>; onSession: (s: Session) => void }) {
  const sessionSaved = p.starred.has(session.id);
  return (
    <details className="group mt-2 rounded-md border border-border bg-surface">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4">
        <span>
          <span className="text-sm tabular-nums text-muted">
            {clock(session.start)}–{clock(session.end)}
          </span>{" "}
          <b>{session.title}</b>
        </span>
        <span className="shrink-0 text-sm text-muted">
          {posters.length ? `${posters.length} saved` : "session saved"} <span className="inline-block transition group-open:rotate-90">›</span>
        </span>
      </summary>
      <div className="border-t border-border px-3">
        {posters.length > 0 && (
          <ul className="divide-y divide-border">
            {posters.sort(byBoard).map((c) => (
              <ContributionRow
                key={c.id}
                c={c}
                session={session}
                starred
                onStar={() => p.onStar(c.id)}
                onOpen={() => p.onOpen(c.id)}
                lead={posters.some((x) => x.board) ? "board" : "none"}
                warn={changedIds.has(c.id) ? "Changed: check details" : undefined}
              />
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-2 py-2 text-sm">
          <button onClick={() => onSession(session)} className="min-h-10 rounded-md border border-border px-3">
            Browse this session&apos;s posters
          </button>
          {sessionSaved && (
            <button onClick={() => p.onStar(session.id)} className="min-h-10 px-2 text-muted underline">
              Remove session
            </button>
          )}
        </div>
      </div>
    </details>
  );
}
