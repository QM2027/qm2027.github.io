// Client-side program search. About 1,000 contributions: a prebuilt lowercase haystack per
// contribution keeps each query around a millisecond, so no search library is needed.

import type { Abstracts, Contribution, Session } from "./program";

export type SearchType = "all" | "talk" | "poster";

type Entry = { c: Contribution; primary: string; secondary: string };

/** Lowercase, and drop TeX markup so "J/psi" finds `$J/\psi$` and "pT" finds `$p_T$`. */
const norm = (s: string) => s.toLowerCase().replace(/[$\\{}^_]/g, "").replace(/\s+/g, " ");

export function buildSearchIndex(contributions: Contribution[], sessionsById: Map<string, Session>, abstracts?: Abstracts): Entry[] {
  return contributions.map((c) => {
    const more = abstracts?.[c.id];
    return {
      c,
      primary: norm([c.title, ...c.speakers.map((s) => s.name), c.board ?? "", c.friendlyId ? `#${c.friendlyId}` : ""].join(" | ")),
      secondary: norm(
        [
          c.track ?? "",
          sessionsById.get(c.sessionId ?? "")?.title ?? "",
          ...c.speakers.map((s) => s.affiliation ?? ""),
          ...(more?.authors ?? []),
          more?.abstract ?? "",
        ].join(" | "),
      ),
    };
  });
}

/**
 * Every term must match (AND). Board numbers and "#<number>" match exactly first; then hits in
 * the title, speakers or board rank above hits only in the abstract, authors or track.
 */
export function searchProgram(index: Entry[], raw: string, type: SearchType): Contribution[] {
  const query = raw.trim();
  if (query.length < 2) return [];
  const wanted = (c: Contribution) => type === "all" || (type === "poster") === Boolean(c.poster);

  const id = /^#(\d+)$/.exec(query);
  if (id) return index.filter((e) => wanted(e.c) && String(e.c.friendlyId) === id[1]).map((e) => e.c);

  const terms = norm(query).split(" ").filter(Boolean);
  const exactBoard = query.toLowerCase();
  const scored: { c: Contribution; score: number }[] = [];
  for (const e of index) {
    if (!wanted(e.c)) continue;
    let score: number;
    if (e.c.board && e.c.board.toLowerCase() === exactBoard) score = 3;
    else if (terms.every((t) => e.primary.includes(t))) score = 2;
    else if (terms.every((t) => e.primary.includes(t) || e.secondary.includes(t))) score = 1;
    else continue;
    scored.push({ c: e.c, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.c.start.localeCompare(b.c.start)).map((s) => s.c);
}

const boardOrder = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

/** Natural board order ("P-2" before "P-10"), posters without a board last, then by title. */
export const byBoard = (a: Contribution, b: Contribution) =>
  (a.board ? (b.board ? boardOrder.compare(a.board, b.board) : -1) : b.board ? 1 : 0) || a.title.localeCompare(b.title);
