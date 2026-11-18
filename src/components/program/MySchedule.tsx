"use client";

import { useState } from "react";
import { downloadIcs } from "@/lib/ics";
import { byBoard } from "@/lib/program-search";
import { clashes, clock, dayLabel, dayOf, type Contribution, type Program, type Session, type Slot } from "@/lib/program";
import { ContributionRow, posterSessionIcs, sessionIcs, StarButton, talkIcs, type ListProps } from "./shared";
import { TeX } from "./TeX";
import { ScanDialog, SendDialog } from "./TransferSchedule";

type Props = ListProps & {
  program: Program;
  changedIds: Set<string>;
  filesChanged: Set<string>;
  onSession: (s: Session) => void;
  /** A schedule read from another device's QR code. */
  onReceive: (ids: string[]) => void;
};

type Entry = { kind: "talk"; c: Contribution; start: string; end: string } | { kind: "session"; s: Session; start: string; end: string };

/**
 * Saved talks and sessions as a timeline per day, with clash warnings between them (a talk
 * inside a saved session doesn't clash with it). Saved posters are grouped per poster session:
 * posters are up all week, so they never clash with anything.
 */
export function MySchedule({ program, changedIds, filesChanged, onSession, onReceive, ...p }: Props) {
  const [transfer, setTransfer] = useState<"send" | "scan">();
  /** Talks (with sessions) and posters are shown apart; until chosen, talks unless there are none. */
  const [part, setPart] = useState<"talks" | "posters">();
  const items = program.contributions.filter((c) => p.starred.has(c.id));
  const talks = items.filter((c) => !c.poster);
  const posters = items.filter((c) => c.poster);
  const sessions = program.sessions.filter((s) => p.starred.has(s.id));
  const known = new Set([...program.contributions, ...program.unscheduled, ...program.sessions].map((c) => c.id));
  const gone = [...p.starred].filter((id) => !known.has(id)).length;
  const savedIds = [...p.starred].filter((id) => known.has(id));

  const scanDialog = transfer === "scan" && (
    <ScanDialog
      onScan={(ids) => {
        setTransfer(undefined);
        onReceive(ids);
      }}
      onClose={() => setTransfer(undefined)}
    />
  );

  if (!items.length && !sessions.length) {
    return (
      <div className="space-y-2 text-muted">
        <p>Tap ☆ next to a session, talk or poster to add it here. Your schedule is saved on this device.</p>
        {gone > 0 && <p className="text-sm">{gone} saved item(s) are no longer in the program.</p>}
        <p className="pt-2 text-sm">
          Saved a schedule on another device? On that one, open Mine and tap Send to phone, then{" "}
          <button onClick={() => setTransfer("scan")} className="min-h-10 font-semibold text-sea underline">
            scan its code here
          </button>
          .
        </p>
        {scanDialog}
      </div>
    );
  }

  const sessionChanged = (s: Session) => program.changes.some((c) => c.sessionId === s.id || c.id === s.id);
  const posterGroups = new Map<string, Contribution[]>();
  for (const c of posters) if (c.sessionId) posterGroups.set(c.sessionId, [...(posterGroups.get(c.sessionId) ?? []), c]);
  // A saved poster session shows as its group, even with no single poster saved.
  for (const s of sessions) if (s.poster && !posterGroups.has(s.id)) posterGroups.set(s.id, []);
  const timeline: Entry[] = [
    ...talks.map((c) => ({ kind: "talk" as const, c, start: c.start, end: c.end })),
    ...sessions.filter((s) => !s.poster).map((s) => ({ kind: "session" as const, s, start: s.start, end: s.end })),
  ].sort((a, b) => a.start.localeCompare(b.start) || (a.kind === "session" ? -1 : 1));
  const groupDay = (id: string) => dayOf(p.sessionsById.get(id)!.start);
  const showPosters = part === "posters" || (part === undefined && !timeline.length);
  const days = [...new Set(showPosters ? [...posterGroups.keys()].map(groupDay) : timeline.map((e) => dayOf(e.start)))].sort();
  const postersNews = posters.some((c) => changedIds.has(c.id) || filesChanged.has(c.id));
  const talksNews = talks.some((c) => changedIds.has(c.id) || filesChanged.has(c.id)) || sessions.some((s) => !s.poster && sessionChanged(s));

  const slotOf = (e: Entry): Slot =>
    e.kind === "talk"
      ? { id: e.c.id, kind: "talk", sessionId: e.c.sessionId, title: e.c.title, start: e.start, end: e.end }
      : { id: e.s.id, kind: "session", sessionId: e.s.id, title: e.s.title, start: e.start, end: e.end };
  const clashWith = (e: Entry, list: Entry[]) => list.map(slotOf).find((o) => clashes(slotOf(e), o));

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

  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button onClick={exportIcs} className="min-h-11 rounded-md bg-sea px-5 font-semibold text-on-sea">
          Add to my calendar (.ics)
        </button>
        <button onClick={() => setTransfer("send")} className="min-h-11 rounded-md border border-border px-4 text-sm">
          Send to phone
        </button>
        <button onClick={() => setTransfer("scan")} className="min-h-11 rounded-md border border-border px-4 text-sm">
          Scan a code
        </button>
      </div>
      <p className="text-sm text-muted">
        {plural(sessions.length, "session")}, {plural(talks.length, "talk")}, {plural(posters.length, "poster")}. Saved on this device
        only. Send to phone shows a QR code and a link that open it on another device or after clearing the browser.
        {gone > 0 && ` ${gone} saved item(s) are no longer in the program.`}
      </p>
      {transfer === "send" && (
        // The link is also the only backup: Safari clears site storage after a week unused unless the guide is installed.
        <SendDialog
          url={`${location.origin}${location.pathname}?view=mine&ids=${savedIds.join(",")}`}
          count={savedIds.length}
          onClose={() => setTransfer(undefined)}
        />
      )}
      {scanDialog}

      <div className="flex gap-2" role="group" aria-label="Show">
        {(
          [
            ["talks", "Talks & sessions", timeline.length, talksNews],
            ["posters", "Posters", posters.length, postersNews],
          ] as const
        ).map(([key, label, count, news]) => (
          <button
            key={key}
            onClick={() => setPart(key)}
            aria-pressed={(key === "posters") === showPosters}
            className="flex min-h-10 shrink-0 items-center gap-2 rounded-md border border-border px-4 text-sm aria-pressed:border-transparent aria-pressed:bg-foreground aria-pressed:text-background"
          >
            {label}
            <span className="tabular-nums opacity-70">{count}</span>
            {news && <span className="size-2 rounded-full bg-tangerine" aria-label="Updated" />}
          </button>
        ))}
      </div>

      {days.length === 0 && (
        <p className="text-muted">{showPosters ? "No posters saved yet. Tap ☆ next to a poster to add it." : "No talks or sessions saved yet."}</p>
      )}

      {days.map((d) => {
        const dayEntries = showPosters ? [] : timeline.filter((e) => dayOf(e.start) === d);
        const dayGroups = showPosters
          ? [...posterGroups].filter(([id]) => groupDay(id) === d).sort(([a], [b]) => p.sessionsById.get(a)!.start.localeCompare(p.sessionsById.get(b)!.start))
          : [];
        return (
          <section key={d}>
            <h2 className="font-semibold">{dayLabel(d)}</h2>
            {dayEntries.length > 0 && (
              <ul className="mt-2 divide-y divide-border rounded-md border border-border bg-surface px-3">
                {dayEntries.map((e) => {
                  const clash = clashWith(e, dayEntries);
                  const clashText = clash ? `Overlaps “${clash.title}”` : undefined;
                  return e.kind === "talk" ? (
                    <ContributionRow
                      key={e.c.id}
                      c={e.c}
                      session={p.sessionsById.get(e.c.sessionId ?? "")}
                      starred
                      onStar={() => p.onStar(e.c.id)}
                      onOpen={() => p.onOpen(e.c.id)}
                      warn={
                        changedIds.has(e.c.id)
                          ? "Time or room changed: check details"
                          : filesChanged.has(e.c.id)
                            ? "New or updated files"
                            : clashText
                      }
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
              <PosterGroup
                key={id}
                session={p.sessionsById.get(id)!}
                posters={list}
                changedIds={changedIds}
                filesChanged={filesChanged}
                onSession={onSession}
                {...p}
              />
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
  filesChanged,
  onSession,
  ...p
}: ListProps & { session: Session; posters: Contribution[]; changedIds: Set<string>; filesChanged: Set<string>; onSession: (s: Session) => void }) {
  const sessionSaved = p.starred.has(session.id);
  // Open the group when something in it changed, so the warning isn't hidden.
  const news = posters.filter((c) => changedIds.has(c.id) || filesChanged.has(c.id)).length;
  return (
    <details open={news > 0 || undefined} className="group mt-2 rounded-md border border-border bg-surface">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4">
        <span>
          <span className="text-sm tabular-nums text-muted">
            {clock(session.start)}–{clock(session.end)}
          </span>{" "}
          <b>{session.title}</b>
          {news > 0 && <span className="block text-xs font-semibold text-tangerine">{news} updated</span>}
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
                warn={changedIds.has(c.id) ? "Changed: check details" : filesChanged.has(c.id) ? "New or updated poster file" : undefined}
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
