"use client";

import { useMemo } from "react";
import { byBoard } from "@/lib/program-search";
import type { Program } from "@/lib/program";
import { ContributionList, type ListProps } from "./shared";

const OTHER = "Other";

type Props = ListProps & {
  program: Program;
  /** Track to open, from `?topic=`. */
  open?: string;
};

/** Talks and posters by Indico track: each topic lists its talks in time order, then its posters by board. */
export function TopicList({ program, open, ...p }: Props) {
  const topics = useMemo(() => {
    const names = [...program.tracks, ...(program.contributions.some((c) => !c.track) ? [OTHER] : [])];
    return names.map((name) => {
      const items = program.contributions.filter((c) => (c.track ?? OTHER) === name);
      return { name, talks: items.filter((c) => !c.poster), posters: items.filter((c) => c.poster).sort(byBoard) };
    });
  }, [program]);
  const hasBoards = useMemo(() => program.contributions.some((c) => c.poster && c.board), [program]);

  if (!program.tracks.length) return <p className="text-muted">Indico doesn&apos;t group this program by topic.</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">Topics are the tracks on Indico. &ldquo;Other&rdquo; holds plenaries and contributions without a track.</p>
      {topics.map((t) => (
        <details key={t.name} open={open === t.name || undefined} className="group rounded-md border border-border bg-surface">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2">
            <b className="min-w-0">{t.name}</b>
            <span className="shrink-0 text-sm text-muted">
              {t.talks.length} talks · {t.posters.length} posters <span className="inline-block transition group-open:rotate-90">›</span>
            </span>
          </summary>
          <div className="space-y-3 border-t border-border p-3">
            {t.talks.length > 0 ? <ContributionList items={t.talks} showDay {...p} /> : <p className="text-sm text-muted">No talks in this topic.</p>}
            {t.posters.length > 0 && (
              <details className="group/posters">
                <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-sm font-semibold">
                  Posters · {t.posters.length} <span className="inline-block font-normal text-muted transition group-open/posters:rotate-90">›</span>
                </summary>
                <div className="mt-2">
                  <ContributionList items={t.posters} lead={hasBoards ? "board" : "none"} {...p} />
                </div>
              </details>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
