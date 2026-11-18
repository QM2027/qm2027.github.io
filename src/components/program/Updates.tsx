"use client";

import { clock, dayLabel, dayOf, type Change, type Program, type Session } from "@/lib/program";
import { TeX } from "./TeX";

const LABEL: Record<Change["kind"], string> = {
  added: "added",
  removed: "removed",
  moved: "moved",
  speaker: "new speaker",
  scheduled: "scheduled",
  unscheduled: "unscheduled",
};

function where(x: { start?: string; room?: string; board?: string }) {
  return [x.start && `${dayLabel(dayOf(x.start))} ${clock(x.start)}`, x.room, x.board && `board ${x.board}`].filter(Boolean).join(" ");
}

/** Whether a change concerns a saved item: a saved contribution, or anything in a saved session. */
export const touches = (c: Change, ids: ReadonlySet<string>) =>
  (c.ids ?? [c.id]).some((id) => ids.has(id)) || Boolean(c.sessionId && ids.has(c.sessionId));

type Props = {
  program: Program;
  sessionsById: Map<string, Session>;
  starred: ReadonlySet<string>;
  mineOnly: boolean;
  onMineOnly: (on: boolean) => void;
  onOpen: (id: string) => void;
  onDay: (day: string) => void;
};

export function Updates({ program, sessionsById, starred, mineOnly, onMineOnly, onOpen, onDay }: Props) {
  if (!program.changes.length) return <p className="text-muted">No changes since the program was published.</p>;
  const known = new Set(program.contributions.map((c) => c.id));
  const changes = mineOnly ? program.changes.filter((c) => touches(c, starred)) : program.changes;

  return (
    <div className="space-y-3">
      <label className="flex min-h-10 items-center gap-2 text-sm">
        <input type="checkbox" checked={mineOnly} onChange={(e) => onMineOnly(e.target.checked)} className="size-4" />
        Only items in my schedule
      </label>
      {!changes.length ? (
        <p className="text-muted">None of the items in your schedule changed.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-surface px-4">
          {changes.map((c) => {
            const session = c.count ? sessionsById.get(c.id) : undefined;
            const label = c.count ? `${c.count} ${session?.poster ? "posters" : "contributions"} ${LABEL[c.kind]}` : LABEL[c.kind];
            const start = c.start;
            return (
              <li key={`${c.id}${c.kind}${c.detectedAt}`} className="py-3">
                <p className="text-xs text-muted">
                  {new Date(c.detectedAt).toLocaleString("en-GB")} ·{" "}
                  <b className={c.kind === "removed" ? "text-tangerine" : "text-sea"}>{label}</b>
                  {touches(c, starred) && <b className="ml-2 text-tangerine">in your schedule</b>}
                </p>
                {c.count && start ? (
                  <button onClick={() => onDay(dayOf(start))} className="text-left font-medium hover:text-sea">
                    <TeX text={c.title} />
                  </button>
                ) : known.has(c.id) ? (
                  <button onClick={() => onOpen(c.id)} className="text-left font-medium hover:text-sea">
                    <TeX text={c.title} />
                  </button>
                ) : (
                  <p className={`font-medium ${c.kind === "removed" ? "line-through decoration-muted" : ""}`}>
                    <TeX text={c.title} />
                  </p>
                )}
                {c.kind === "moved" && c.from && (
                  <p className="text-sm text-muted">
                    {where(c.from)} → <b className="text-foreground">{where(c)}</b>
                  </p>
                )}
                {c.kind === "speaker" && (
                  <p className="text-sm text-muted">
                    {c.from?.speakers || "No speaker"} → <b className="text-foreground">{c.speakers || "no speaker"}</b>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
