"use client";

import { useMemo, useState } from "react";
import { byBoard } from "@/lib/program-search";
import { clock, dayLabel, dayOf, type Contribution, type Program } from "@/lib/program";
import { ContributionRow, type ListProps } from "./shared";

type Props = ListProps & {
  program: Program;
  sessionId?: string;
  track?: string;
  onFilter: (patch: { ps?: string; track?: string }) => void;
};

const NO_TRACK = "Other";

export function PosterBrowser({ program, sessionId, track, onFilter, ...p }: Props) {
  const [board, setBoard] = useState("");
  const [boardMiss, setBoardMiss] = useState<string>();

  const posters = useMemo(() => program.contributions.filter((c) => c.poster), [program]);
  const posterSessions = useMemo(() => program.sessions.filter((s) => s.poster).sort((a, b) => a.start.localeCompare(b.start)), [program]);
  const inSession = (c: Contribution, id: string) => c.sessionId === id || Boolean(c.slots?.includes(id));

  const inScope = sessionId ? posters.filter((c) => inSession(c, sessionId)) : posters;
  const trackCounts = new Map<string, number>();
  for (const c of inScope) trackCounts.set(c.track ?? NO_TRACK, (trackCounts.get(c.track ?? NO_TRACK) ?? 0) + 1);
  const shown = track ? inScope.filter((c) => (c.track ?? NO_TRACK) === track) : inScope;

  const groups = [...new Set(shown.map((c) => c.track ?? NO_TRACK))]
    .sort((a, b) => (a === NO_TRACK ? 1 : b === NO_TRACK ? -1 : a.localeCompare(b)))
    .map((name) => ({ name, items: shown.filter((c) => (c.track ?? NO_TRACK) === name).sort(byBoard) }));
  const hasBoards = posters.some((c) => c.board);

  function jump(e: React.FormEvent) {
    e.preventDefault();
    const want = board.trim().toLowerCase();
    if (!want) return;
    const hit = posters.find((c) => c.board?.toLowerCase() === want);
    if (hit) {
      setBoardMiss(undefined);
      p.onOpen(hit.id);
    } else setBoardMiss(board.trim());
  }

  if (!posters.length) return <p className="text-muted">No posters in the program yet.</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Posters are up all week. Session times are when presenters are at their boards.
        {!hasBoards && " Board numbers aren't assigned yet."}
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Poster session">
        <Chip on={!sessionId} onClick={() => onFilter({ ps: undefined, track: undefined })}>
          All · {posters.length}
        </Chip>
        {posterSessions.map((s) => (
          <Chip key={s.id} on={sessionId === s.id} onClick={() => onFilter({ ps: s.id, track: undefined })}>
            {s.title} · {dayLabel(dayOf(s.start))} {clock(s.start)} · {posters.filter((c) => inSession(c, s.id)).length}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-col gap-1 text-sm">
          <span className="text-muted">Track</span>
          <select
            value={track ?? ""}
            onChange={(e) => onFilter({ track: e.target.value || undefined })}
            className="min-h-11 max-w-full rounded-md border border-border bg-surface px-3"
          >
            <option value="">All tracks · {inScope.length}</option>
            {[...trackCounts.entries()]
              .sort(([a], [b]) => (a === NO_TRACK ? 1 : b === NO_TRACK ? -1 : a.localeCompare(b)))
              .map(([name, n]) => (
                <option key={name} value={name}>
                  {name} · {n}
                </option>
              ))}
          </select>
        </label>
        {hasBoards && (
          <form onSubmit={jump} className="flex flex-col gap-1 text-sm">
            <label htmlFor="board-jump" className="text-muted">
              Board no.
            </label>
            <div className="flex gap-2">
              <input
                id="board-jump"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                placeholder="e.g. P-112"
                className="min-h-11 w-32 rounded-md border border-border bg-surface px-3 font-mono"
              />
              <button className="min-h-11 rounded-md border border-border px-4">Go</button>
            </div>
          </form>
        )}
      </div>
      {boardMiss && <p className="text-sm text-tangerine">No poster with board {boardMiss}.</p>}

      <div className="space-y-3 brand:space-y-0">
        {groups.map((g) => (
          <details key={`${sessionId}-${track}-${g.name}`} open={groups.length === 1} className="group rounded-md border border-border bg-surface brand:rounded-none brand:border-x-0 brand:border-t-0 brand:bg-transparent brand:first-of-type:border-t brand:first-of-type:border-t-foreground">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 font-semibold brand:px-0">
              <span>{g.name}</span>
              <span className="text-sm font-normal text-muted">
                {g.items.length} <span className="inline-block transition group-open:rotate-90">›</span>
              </span>
            </summary>
            <ul className="divide-y divide-border border-t border-border px-3 brand:px-0">
              {g.items.map((c) => (
                <ContributionRow
                  key={c.id}
                  c={c}
                  session={p.sessionsById.get(c.sessionId ?? "")}
                  starred={p.starred.has(c.id)}
                  onStar={() => p.onStar(c.id)}
                  onOpen={() => p.onOpen(c.id)}
                  lead={hasBoards ? "board" : "none"}
                />
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="min-h-10 rounded-md border border-border bg-surface px-3 text-sm aria-pressed:border-sea aria-pressed:bg-sea aria-pressed:text-on-sea brand:bg-transparent"
    >
      {children}
    </button>
  );
}
