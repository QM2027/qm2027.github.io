"use client";

import { createContext, useContext } from "react";
import { Icon } from "@/components/Icon";
import { INDICO_ROOM_MAP } from "@/data/indico-rooms";
import { FLOORS } from "@/data/venue";
import type { IcsEvent } from "@/lib/ics";
import { clock, dayLabel, dayOf, type Contribution, type Session } from "@/lib/program";
import { TeX } from "./TeX";

export type ListProps = {
  sessionsById: Map<string, Session>;
  starred: ReadonlySet<string>;
  onStar: (id: string) => void;
  onOpen: (id: string) => void;
};

const ROOMS = FLOORS.flatMap((f) => f.rooms);

/** Which contributions have an abstract or files, for the marks next to titles. */
export const MarksContext = createContext<{ abstract: (id: string) => boolean; files: (id: string) => boolean } | null>(null);

export function Marks({ id }: { id: string }) {
  const marks = useContext(MarksContext);
  const abstract = marks?.abstract(id);
  const files = marks?.files(id);
  if (!abstract && !files) return null;
  return (
    <span className="ml-1.5 inline-flex gap-1 align-[-2px] text-muted">
      {abstract && (
        <span title="Abstract">
          <Icon name="doc" className="size-3.5" />
          <span className="sr-only">Abstract</span>
        </span>
      )}
      {files && (
        <span title="Files">
          <Icon name="clip" className="size-3.5" />
          <span className="sr-only">Files</span>
        </span>
      )}
    </span>
  );
}

/** The legend for the marks, shown once above a list. */
export function MarksLegend() {
  return (
    <p className="flex gap-4 text-xs text-muted">
      <span className="inline-flex items-center gap-1">
        <Icon name="doc" className="size-3.5" /> Abstract
      </span>
      <span className="inline-flex items-center gap-1">
        <Icon name="clip" className="size-3.5" /> Slides or poster file
      </span>
    </p>
  );
}

/** The floor-plan room for an Indico room name; posters fall back to the poster area. */
export function venueRoomId(room: string | undefined, poster?: boolean): string | undefined {
  const mapped = room ? INDICO_ROOM_MAP[room] : undefined;
  const hit = mapped ?? (room ? ROOMS.find((r) => r.indicoRooms?.includes(room))?.id : undefined);
  return hit ?? (poster ? ROOMS.find((r) => r.kind === "poster")?.id : undefined);
}

/** The floor-plan name of a room id, for labels. */
export const venueRoomName = (id: string | undefined) => (id ? ROOMS.find((r) => r.id === id)?.name : undefined);

export const roomOf = (c: Contribution, session?: Session) => c.room ?? session?.room;

/** Talks get a reminder ten minutes before. */
export const talkIcs = (c: Contribution, session?: Session): IcsEvent => ({
  uid: `qm-${c.id}`,
  title: c.title,
  start: c.start,
  end: c.end,
  location: roomOf(c, session),
  description: [c.speakers.map((s) => s.name).join(", "), session?.title].filter(Boolean).join("\n"),
  url: c.url,
  alarmMinutes: 10,
});

/** A saved session, with a reminder ten minutes before. */
export const sessionIcs = (s: Session): IcsEvent => ({
  uid: `qm-session-${s.id}`,
  title: s.title,
  start: s.start,
  end: s.end,
  location: s.room,
  description: s.conveners.length ? `Chair: ${s.conveners.join(", ")}` : undefined,
  url: s.url,
  alarmMinutes: 10,
});

/** One calendar entry per poster session, listing the saved posters by board. */
export const posterSessionIcs = (session: Session, posters: Contribution[]): IcsEvent => ({
  uid: `qm-posters-${session.id}`,
  title: posters.length ? `${session.title} (${posters.length} saved poster${posters.length === 1 ? "" : "s"})` : session.title,
  start: session.start,
  end: session.end,
  location: session.room,
  description: posters.map((p) => [p.board, p.title].filter(Boolean).join("  ")).join("\n"),
  url: session.url,
  alarmMinutes: 10,
});

export function StarButton({ on, title, onClick, small }: { on: boolean; title: string; onClick: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      aria-label={on ? `Remove “${title}” from my schedule` : `Add “${title}” to my schedule`}
      className={`flex shrink-0 items-center justify-center rounded-full ${small ? "size-8 text-lg" : "size-10 text-xl"} ${on ? "text-tangerine" : "text-muted hover:text-foreground"}`}
    >
      {on ? "★" : "☆"}
    </button>
  );
}

type RowProps = {
  c: Contribution;
  session?: Session;
  starred: boolean;
  onStar: () => void;
  onOpen: () => void;
  /** What sits in the left column: the start time (talks), the board number (posters), or nothing. */
  lead?: "time" | "board" | "none";
  showDay?: boolean;
  warn?: string;
  live?: boolean;
  /** Narrow columns: time above the title instead of beside it. */
  compact?: boolean;
};

export function ContributionRow({ c, session, starred, onStar, onOpen, lead = "time", showDay, warn, live, compact }: RowProps) {
  const leadText = lead === "board" ? (c.board ?? "–") : lead === "time" ? clock(c.start) : "";
  const meta = [
    showDay && dayLabel(dayOf(c.start)),
    c.poster && lead === "time" && (c.board ? `Poster ${c.board}` : "Poster"),
    c.speakers.map((s) => s.name).join(", "),
    lead === "time" && roomOf(c, session),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className={`flex items-start gap-2 py-2 [contain-intrinsic-size:auto_64px] [content-visibility:auto] ${live ? "-mx-2 rounded-md bg-tangerine/10 px-2" : ""}`}>
      {!compact && lead !== "none" && <span className={`shrink-0 pt-2 text-sm tabular-nums text-muted ${lead === "board" ? "w-16 font-mono" : "w-12"}`}>{leadText}</span>}
      <button onClick={onOpen} className="min-w-0 flex-1 py-1.5 text-left">
        {compact && leadText && (
          <span className="block text-xs tabular-nums text-muted">
            {leadText}
            {live && <b className="ml-2 text-tangerine">NOW</b>}
          </span>
        )}
        <span className={`block font-medium leading-snug hover:text-sea ${compact ? "text-sm" : ""}`}>
          <TeX text={c.title} />
          <Marks id={c.id} />
          {live && !compact && <b className="ml-2 align-middle text-xs text-tangerine">NOW</b>}
        </span>
        {meta && <span className={`block text-muted ${compact ? "line-clamp-2 text-xs" : "truncate text-sm"}`}>{meta}</span>}
        {warn && <span className="mt-1 inline-block rounded bg-tangerine/15 px-1.5 text-xs text-tangerine">{warn}</span>}
      </button>
      <StarButton on={starred} title={c.title} onClick={onStar} small={compact} />
    </li>
  );
}

export function ContributionList({ items, lead, showDay, ...p }: ListProps & { items: Contribution[]; lead?: RowProps["lead"]; showDay?: boolean }) {
  return (
    <ul className="divide-y divide-border rounded-md border border-border bg-surface px-3">
      {items.map((c) => (
        <ContributionRow
          key={c.id}
          c={c}
          session={p.sessionsById.get(c.sessionId ?? "")}
          starred={p.starred.has(c.id)}
          onStar={() => p.onStar(c.id)}
          onOpen={() => p.onOpen(c.id)}
          lead={lead}
          showDay={showDay}
        />
      ))}
    </ul>
  );
}

/** Share or copy a link; resolves to what happened so the button can say so. */
export async function shareLink(title: string, url: string): Promise<"shared" | "copied" | undefined> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, url });
      return "shared";
    } catch {
      return undefined;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return undefined;
  }
}
