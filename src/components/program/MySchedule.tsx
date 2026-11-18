"use client";

import { useState } from "react";
import { downloadIcs } from "@/lib/ics";
import { byBoard } from "@/lib/program-search";
import { clock, dayLabel, dayOf, overlaps, type Contribution, type Program, type Session } from "@/lib/program";
import { ContributionRow, posterSessionIcs, shareLink, talkIcs, type ListProps } from "./shared";

type Props = ListProps & { program: Program; changedIds: Set<string> };

/**
 * Saved talks as a timeline per day, with clash warnings among talks. Saved posters are grouped
 * per poster session: posters are up all week, so they never clash with anything.
 */
export function MySchedule({ program, changedIds, ...p }: Props) {
  const [shared, setShared] = useState<string>();
  const items = program.contributions.filter((c) => p.starred.has(c.id));
  const talks = items.filter((c) => !c.poster);
  const posters = items.filter((c) => c.poster);
  const known = new Set([...program.contributions, ...program.unscheduled].map((c) => c.id));
  const gone = [...p.starred].filter((id) => !known.has(id)).length;

  if (!items.length) {
    return (
      <div className="space-y-2 text-muted">
        <p>Tap ☆ next to a talk or poster to add it here. Your schedule is saved on this device.</p>
        {gone > 0 && <p className="text-sm">{gone} saved item(s) are no longer in the program.</p>}
      </div>
    );
  }

  const posterGroups = new Map<string, Contribution[]>();
  for (const c of posters) if (c.sessionId) posterGroups.set(c.sessionId, [...(posterGroups.get(c.sessionId) ?? []), c]);
  const days = [...new Set(items.map((c) => dayOf(c.start)))].sort();

  function exportIcs() {
    const events = [
      ...talks.map((c) => talkIcs(c, p.sessionsById.get(c.sessionId ?? ""))),
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
        {talks.length} talk{talks.length === 1 ? "" : "s"}, {posters.length} poster{posters.length === 1 ? "" : "s"}. Saved on this
        device only. The link opens your schedule on another phone or after clearing the browser.
        {gone > 0 && ` ${gone} saved item(s) are no longer in the program.`}
      </p>

      {days.map((d) => {
        const dayTalks = talks.filter((c) => dayOf(c.start) === d);
        const dayGroups = [...posterGroups].filter(([id]) => {
          const s = p.sessionsById.get(id);
          return s && dayOf(s.start) === d;
        });
        return (
          <section key={d}>
            <h2 className="font-semibold">{dayLabel(d)}</h2>
            {dayTalks.length > 0 && (
              <ul className="mt-2 divide-y divide-border rounded-md border border-border bg-surface px-3">
                {dayTalks.map((c) => {
                  const clash = dayTalks.find((o) => o.id !== c.id && overlaps(o, c));
                  return (
                    <ContributionRow
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
            )}
            {dayGroups.map(([id, list]) => (
              <PosterGroup key={id} session={p.sessionsById.get(id)!} posters={list} changedIds={changedIds} {...p} />
            ))}
          </section>
        );
      })}
    </div>
  );
}

function PosterGroup({ session, posters, changedIds, ...p }: ListProps & { session: Session; posters: Contribution[]; changedIds: Set<string> }) {
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
          {posters.length} saved <span className="inline-block transition group-open:rotate-90">›</span>
        </span>
      </summary>
      <ul className="divide-y divide-border border-t border-border px-3">
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
    </details>
  );
}
