"use client";

import { useMemo } from "react";
import type { Program } from "@/lib/program";
import { ContributionList, type ListProps } from "./shared";

const OTHER = "Other";

type Props = ListProps & {
  program: Program;
  /** Track to open, from `?topic=`. */
  open?: string;
  onPosters: (track: string) => void;
};

/** Talks and posters by Indico track: each topic lists its talks in time order and links its posters. */
export function TopicList({ program, open, onPosters, ...p }: Props) {
  const topics = useMemo(() => {
    const names = [...program.tracks, ...(program.contributions.some((c) => !c.track) ? [OTHER] : [])];
    return names.map((name) => {
      const items = program.contributions.filter((c) => (c.track ?? OTHER) === name);
      return { name, talks: items.filter((c) => !c.poster), posters: items.filter((c) => c.poster).length };
    });
  }, [program]);

  if (!program.tracks.length) return <p className="text-muted">Indico doesn&apos;t group this program by topic.</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">Topics are the tracks on Indico. &ldquo;Other&rdquo; holds plenaries and contributions without a track.</p>
      {topics.map((t) => (
        <details key={t.name} open={open === t.name || undefined} className="group rounded-md border border-border bg-surface">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2">
            <b className="min-w-0">{t.name}</b>
            <span className="shrink-0 text-sm text-muted">
              {t.talks.length} talks · {t.posters} posters <span className="inline-block transition group-open:rotate-90">›</span>
            </span>
          </summary>
          <div className="space-y-3 border-t border-border p-3">
            {t.posters > 0 && (
              <button onClick={() => onPosters(t.name)} className="min-h-10 rounded-md border border-border px-4 text-sm hover:border-foreground">
                Browse {t.posters} posters
              </button>
            )}
            {t.talks.length > 0 ? <ContributionList items={t.talks} showDay {...p} /> : <p className="text-sm text-muted">No talks in this topic.</p>}
          </div>
        </details>
      ))}
    </div>
  );
}
