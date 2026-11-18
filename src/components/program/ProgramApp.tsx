"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { INDICO_GROUPS, INDICO_TIMETABLE } from "@/data/indico-links";
import {
  changedContributionIds,
  dayLabel,
  dayOf,
  QM2027_EVENT_ID,
  STALE_MS,
  useProgram,
  type Abstracts,
  type Contribution,
  type Materials,
  type Program,
} from "@/lib/program";
import { buildSearchIndex, searchProgram, type SearchType } from "@/lib/program-search";
import { useLocalSet, useLocalString } from "@/lib/use-local-set";
import { pinnedNow, useNow } from "@/lib/use-now";
import { ContributionDetail, MissingDetail } from "./ContributionDetail";
import { DaySchedule } from "./DaySchedule";
import { MySchedule } from "./MySchedule";
import { PosterBrowser } from "./PosterBrowser";
import { ContributionList, type ListProps } from "./shared";
import { touches, Updates } from "./Updates";

// URL state, so every view can be linked and the back button works:
//   ?day=2027-03-23                 schedule for a day (default view)
//   ?view=posters&ps=<id>&track=…    posters, by poster session and track
//   ?view=mine[&ids=a,b,c]          my schedule; `ids` imports a shared schedule
//   ?view=updates[&mine=1]          changes, optionally only my items
//   ?q=…&type=talk|poster           search
//   ?talk=<id>                      details of a talk or poster, on top of any view
//   ?now=<ISO time>                 pin the clock, for testing "now" with a past program

type View = "day" | "posters" | "mine" | "updates";
const VIEWS: View[] = ["day", "posters", "mine", "updates"];
const SEARCH_PAGE = 50;

export function ProgramApp() {
  const program = useProgram();

  if (program.status === "loading") return <div className="h-64 animate-pulse rounded-md bg-border/40" />;
  if (program.status === "error" || program.data.contributions.length === 0) {
    return <NotPublished checkedAt={program.status === "ok" ? program.checkedAt : undefined} />;
  }
  return <ProgramBrowser program={program.data} abstracts={program.abstracts} materials={program.materials} checkedAt={program.checkedAt} />;
}

function NotPublished({ checkedAt }: { checkedAt?: string }) {
  const links = INDICO_GROUPS.find((g) => g.title === "Abstracts & Program")!.links;
  return (
    <div className="max-w-3xl">
      <p className="text-muted">
        The detailed timetable hasn&apos;t been published on Indico yet. Once it is, it will appear here automatically,
        with search, a personal schedule and offline access.
      </p>
      {checkedAt && <p className="mt-2 text-xs text-muted">Last checked {new Date(checkedAt).toLocaleString("en-GB")}.</p>}
      <a href={INDICO_TIMETABLE} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-md bg-sea px-6 font-semibold text-on-sea">
        Open timetable on Indico <Icon name="external" className="size-4" />
      </a>
      <ul className="mt-8 divide-y divide-border rounded-md border border-border bg-surface">
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

function ProgramBrowser({
  program,
  abstracts,
  materials,
  checkedAt,
}: {
  program: Program;
  abstracts?: Abstracts;
  materials?: Materials;
  checkedAt: string;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const now = pinnedNow(params.get("now"), useNow());
  const [starred, toggleStar, addStars] = useLocalSet("qm2027:my-schedule");
  const [seenChanges, setSeenChanges] = useLocalString("qm2027:changes-seen");

  function go(patch: Record<string, string | undefined>, mode: "replace" | "push" = "replace") {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router[mode](qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // ---- data derived from the program
  const sessionsById = useMemo(() => new Map(program.sessions.map((s) => [s.id, s])), [program]);
  const days = useMemo(() => [...new Set(program.contributions.filter((c) => !c.poster).map((c) => dayOf(c.start)))].sort(), [program]);
  const posterCount = useMemo(() => program.contributions.filter((c) => c.poster).length, [program]);
  const changedIds = useMemo(() => changedContributionIds(program.changes), [program]);
  const index = useMemo(() => buildSearchIndex(program.contributions, sessionsById, abstracts), [program, sessionsById, abstracts]);

  // ---- URL state
  const rawView = params.get("view") as View | null;
  const view: View = rawView && VIEWS.includes(rawView) ? rawView : "day";
  const todayKey = now !== undefined ? new Date(now).toLocaleDateString("sv-SE", { timeZone: program.tz }) : undefined;
  const day = params.get("day") ?? (todayKey && days.includes(todayKey) ? todayKey : days[0]);
  const talkId = params.get("talk");
  const talk = talkId ? program.contributions.find((c) => c.id === talkId) : undefined;
  const type = (["talk", "poster"].includes(params.get("type") ?? "") ? params.get("type") : "all") as SearchType;

  // ---- search: typed text is local; the URL follows after a pause
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);
  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("q") ?? "") !== query.trim()) go({ q: query.trim() || undefined });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the typed text should trigger this
  }, [query]);
  const searching = deferredQuery.trim().length >= 2;
  const results = useMemo(() => (searching ? searchProgram(index, deferredQuery, type) : []), [index, deferredQuery, type, searching]);

  // ---- details open with push, so the phone's back button closes them
  const openedHere = useRef(false);
  useEffect(() => {
    if (!talkId) openedHere.current = false;
  }, [talkId]);
  const openTalk = (id: string) => {
    openedHere.current = true;
    go({ talk: id }, "push");
  };
  const closeTalk = () => {
    if (openedHere.current) router.back();
    else go({ talk: undefined });
  };

  // ---- my schedule: shared-link import and changes since last seen
  const importIds = view === "mine" ? (params.get("ids") ?? "").split(",").filter((id) => id && !starred.has(id)) : [];
  const mineCount = program.contributions.filter((c) => starred.has(c.id)).length;
  const newestChange = program.changes[0]?.detectedAt;
  const myNewChanges = seenChanges === undefined ? [] : program.changes.filter((c) => touches(c, starred) && c.detectedAt > (seenChanges ?? ""));
  useEffect(() => {
    if (view === "updates" && newestChange && newestChange !== seenChanges) setSeenChanges(newestChange);
  }, [view, newestChange, seenChanges, setSeenChanges]);

  const stale = now !== undefined && now - Date.parse(checkedAt) > STALE_MS;
  const listProps = { sessionsById, starred, onStar: toggleStar, onOpen: openTalk };

  const tabs: [View, string][] = [
    ["day", "Schedule"],
    ...(posterCount ? ([["posters", `Posters (${posterCount})`]] as [View, string][]) : []),
    ["mine", `Mine (${mineCount})`],
    ["updates", `Updates${program.changes.length ? ` (${program.changes.length})` : ""}`],
  ];

  return (
    <div>
      {program.eventId !== QM2027_EVENT_ID && (
        <p className="mb-3 rounded-md border border-border bg-surface p-3 text-sm">
          <b>Preview.</b> The QM2027 timetable isn&apos;t on Indico yet, so this shows the program of a past conference (Indico
          event {program.eventId}) to try the features. Times are that event&apos;s local time.
        </p>
      )}
      {myNewChanges.length > 0 && view !== "updates" && (
        <button
          onClick={() => go({ view: "updates", mine: "1", q: undefined })}
          className="mb-3 flex w-full items-center justify-between gap-3 rounded-md border border-tangerine bg-tangerine/10 p-3 text-left text-sm"
        >
          <span>
            <b className="text-tangerine">
              {myNewChanges.length} change{myNewChanges.length === 1 ? "" : "s"}
            </b>{" "}
            to items in your schedule.
          </span>
          <span className="shrink-0 font-semibold">Review</span>
        </button>
      )}

      <div className="sticky top-14 z-20 -mx-4 space-y-2 bg-background/95 px-4 py-3 backdrop-blur lg:-mx-8 lg:px-8">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={abstracts ? "Search titles, speakers, abstracts, #id…" : "Search titles, speakers, #id…"}
          className="min-h-11 w-full rounded-md border border-border bg-surface px-4"
          aria-label="Search the program"
        />
        {searching ? (
          <div className="flex gap-2" role="group" aria-label="Search in">
            {(
              [
                ["all", "All"],
                ["talk", "Talks"],
                ["poster", "Posters"],
              ] as const
            ).map(([t, label]) => (
              <Tab key={t} on={type === t} onClick={() => go({ type: t === "all" ? undefined : t })}>
                {label}
              </Tab>
            ))}
            <button onClick={() => setQuery("")} className="ml-auto min-h-10 px-2 text-sm text-muted underline">
              Clear
            </button>
          </div>
        ) : (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]" role="group" aria-label="View">
            {tabs.map(([v, label]) => (
              <Tab key={v} on={view === v} onClick={() => go({ view: v === "day" ? undefined : v, ids: undefined, mine: undefined })}>
                {label}
              </Tab>
            ))}
          </div>
        )}
        {!searching && view === "day" && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]" role="group" aria-label="Day">
            {days.map((d) => (
              <button
                key={d}
                onClick={() => go({ day: d })}
                aria-pressed={d === day}
                className="min-h-10 shrink-0 rounded-md border border-border bg-surface px-3 text-sm aria-pressed:border-sea aria-pressed:bg-sea aria-pressed:text-on-sea"
              >
                {dayLabel(d)}
                {d === todayKey && " · today"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        {searching ? (
          <SearchResults key={`${deferredQuery}|${type}`} results={results} {...listProps} />
        ) : view === "posters" ? (
          <PosterBrowser
            program={program}
            sessionId={params.get("ps") ?? undefined}
            track={params.get("track") ?? undefined}
            onFilter={(patch) => go(patch)}
            {...listProps}
          />
        ) : view === "mine" ? (
          <>
            {importIds.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface p-3 text-sm">
                <span>This link has {importIds.length} item(s) that aren&apos;t in your schedule yet.</span>
                <span className="flex gap-2">
                  <button
                    onClick={() => {
                      addStars(importIds);
                      go({ ids: undefined });
                    }}
                    className="min-h-10 rounded-md bg-sea px-4 font-semibold text-on-sea"
                  >
                    Add them
                  </button>
                  <button onClick={() => go({ ids: undefined })} className="min-h-10 rounded-md border border-border px-4">
                    Dismiss
                  </button>
                </span>
              </div>
            )}
            <MySchedule program={program} changedIds={changedIds} {...listProps} />
          </>
        ) : view === "updates" ? (
          <Updates
            program={program}
            sessionsById={sessionsById}
            starred={starred}
            mineOnly={params.get("mine") === "1"}
            onMineOnly={(on) => go({ mine: on ? "1" : undefined })}
            onOpen={openTalk}
            onDay={(d) => go({ view: undefined, mine: undefined, day: d })}
          />
        ) : (
          <DaySchedule
            program={program}
            day={day}
            isToday={day === todayKey}
            now={now}
            onPosters={(ps) => go({ view: "posters", ps, track: undefined })}
            {...listProps}
          />
        )}
      </div>

      {talkId &&
        (talk ? (
          <ContributionDetail
            talk={talk}
            session={sessionsById.get(talk.sessionId ?? "")}
            details={abstracts?.[talk.id]}
            abstractsLoaded={abstracts !== undefined}
            files={materials?.[talk.id]}
            starred={starred.has(talk.id)}
            changed={changedIds.has(talk.id)}
            onStar={() => toggleStar(talk.id)}
            onClose={closeTalk}
          />
        ) : (
          <MissingDetail onClose={closeTalk} />
        ))}

      <p className="mt-8 text-xs text-muted">
        {stale && <b className="text-foreground">Couldn&apos;t check Indico for a while. </b>}
        Checked against Indico {new Date(checkedAt).toLocaleString("en-GB")}
        {program.syncedAt && `, last changed ${new Date(program.syncedAt).toLocaleString("en-GB")}`}. Times are local
        {program.eventId === QM2027_EVENT_ID ? " (KST)" : ""}. If anything here differs, Indico is authoritative.
      </p>
    </div>
  );
}

function Tab({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="min-h-10 shrink-0 rounded-md border border-border px-4 text-sm aria-pressed:border-transparent aria-pressed:bg-foreground aria-pressed:text-background"
    >
      {children}
    </button>
  );
}

function SearchResults({ results, ...p }: ListProps & { results: Contribution[] }) {
  const [limit, setLimit] = useState(SEARCH_PAGE);
  if (!results.length) return <p className="text-muted">No matches.</p>;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        {results.length} match{results.length === 1 ? "" : "es"}
      </p>
      <ContributionList items={results.slice(0, limit)} showDay {...p} />
      {results.length > limit && (
        <button onClick={() => setLimit((n) => n + SEARCH_PAGE)} className="min-h-11 w-full rounded-md border border-border text-sm">
          Show {Math.min(SEARCH_PAGE, results.length - limit)} more
        </button>
      )}
    </div>
  );
}
