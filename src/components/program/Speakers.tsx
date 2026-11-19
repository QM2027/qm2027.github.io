"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { clock, dayLabel, dayOf, type Contribution, type Program, type Session } from "@/lib/program";
import { ContributionList, type ListProps } from "./shared";
import { TeX } from "./TeX";

type Person = {
  key: string;
  name: string;
  affiliation?: string;
  contributions: Contribution[];
  chairs: Session[];
};

// Letters NFD doesn't split into a base letter and a mark.
const FOLD: Record<string, string> = { ł: "l", ø: "o", đ: "d", ß: "ss", æ: "ae", œ: "oe", ı: "i" };
const keyOf = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[łøđßæœı]/g, (c) => FOLD[c])
    .replace(/\s+/g, " ")
    .trim();
/** Sort and group by family name: the last word of "First Last", ignoring notes like "(Speaker)". */
const familyOf = (key: string) => key.replace(/\(.*?\)/g, "").trim().split(" ").at(-1) ?? key;
const letterOf = (key: string) => {
  const c = familyOf(key).charAt(0).toUpperCase();
  return c >= "A" && c <= "Z" ? c : "#";
};

function buildPeople(program: Program): Person[] {
  const people = new Map<string, Person>();
  const get = (name: string, affiliation?: string) => {
    const key = keyOf(name);
    let p = people.get(key);
    if (!p) people.set(key, (p = { key, name, affiliation, contributions: [], chairs: [] }));
    p.affiliation ??= affiliation;
    return p;
  };
  // Indico sometimes lists the same person twice on one contribution: add each item once.
  const add = <T extends { id: string }>(list: T[], item: T) => {
    if (!list.some((x) => x.id === item.id)) list.push(item);
  };
  for (const c of program.contributions) for (const s of c.speakers) if (s.name) add(get(s.name, s.affiliation).contributions, c);
  for (const s of program.sessions) for (const name of s.conveners) if (name) add(get(name).chairs, s);
  return [...people.values()].sort((a, b) => familyOf(a.key).localeCompare(familyOf(b.key)) || a.key.localeCompare(b.key));
}

/** Everyone presenting or chairing, A–Z by family name, with their talks, posters and sessions. */
export function SpeakerList({ program, onSession, ...p }: ListProps & { program: Program; onSession: (s: Session) => void }) {
  const [filter, setFilter] = useState("");
  const q = keyOf(useDeferredValue(filter));
  const people = useMemo(() => buildPeople(program), [program]);
  const shown = q ? people.filter((x) => x.key.includes(q) || x.affiliation?.toLowerCase().includes(q)) : people;

  const groups = new Map<string, Person[]>();
  for (const x of shown) groups.set(letterOf(x.key), [...(groups.get(letterOf(x.key)) ?? []), x]);
  const letters = [...groups.keys()];

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder={`Filter ${people.length} speakers and chairs by name or institute`}
        aria-label="Filter speakers"
        className="min-h-11 w-full rounded-md border border-border bg-surface px-4"
      />
      {!q && (
        <nav aria-label="Jump to letter" className="flex flex-wrap gap-1">
          {letters.map((l) => (
            <a key={l} href={`#speakers-${l}`} className="flex size-9 items-center justify-center rounded-md border border-border text-sm brand:border-transparent brand:font-semibold brand:hover:border-foreground">
              {l}
            </a>
          ))}
        </nav>
      )}
      {!shown.length && <p className="text-muted">Nobody matches.</p>}
      {[...groups].map(([letter, list]) => (
        <section key={letter} id={`speakers-${letter}`} className="scroll-mt-40 brand:border-t brand:border-foreground brand:pt-2 lg:brand:grid lg:brand:grid-cols-12 lg:brand:gap-x-8">
          <h2 className="text-sm font-semibold text-muted brand:text-2xl brand:text-foreground lg:brand:col-span-1">{letter}</h2>
          <ul className="mt-1 divide-y divide-border rounded-md border border-border bg-surface brand:rounded-none brand:border-0 brand:bg-transparent lg:brand:col-span-11 lg:brand:mt-0">
            {list.map((x) => (
              <li key={x.key} className="[contain-intrinsic-size:auto_56px] [content-visibility:auto]">
                <details className="group">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 brand:px-0">
                    <span className="min-w-0">
                      <b className="block">{x.name}</b>
                      {x.affiliation && <span className="block truncate text-sm text-muted">{x.affiliation}</span>}
                    </span>
                    <span className="shrink-0 text-sm text-muted">
                      {x.contributions.length + x.chairs.length} <span className="inline-block transition group-open:rotate-90">›</span>
                    </span>
                  </summary>
                  <div className="space-y-2 border-t border-border p-3 brand:border-t-0 brand:px-0 brand:pt-0 brand:pb-4">
                    {x.chairs.map((s) => (
                      <button key={s.id} onClick={() => onSession(s)} className="block w-full rounded-md border border-border px-3 py-2 text-left text-sm brand:rounded-none brand:border-x-0 brand:border-t-0 brand:px-0">
                        <span className="text-muted">
                          Chair · {dayLabel(dayOf(s.start))} {clock(s.start)}
                          {s.room && ` · ${s.room}`}
                        </span>
                        <span className="block font-medium">
                          <TeX text={s.title} />
                        </span>
                      </button>
                    ))}
                    {x.contributions.length > 0 && <ContributionList items={x.contributions} showDay {...p} />}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
