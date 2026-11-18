"use client";

import { useEffect, useState } from "react";

// Shape written by scripts/sync.mjs in QM2027/program-data. Times are ISO strings in the
// event's own time zone, so slicing gives event-local wall-clock values.

export type Person = { name: string; affiliation?: string };

export type Session = {
  id: string;
  title: string;
  start: string;
  end: string;
  room?: string;
  conveners: string[];
  poster?: boolean;
  color?: string;
  url?: string;
};

export type Contribution = {
  id: string;
  title: string;
  start: string;
  end: string;
  room?: string;
  sessionId?: string;
  speakers: Person[];
  abstract?: string;
  board?: string;
  track?: string;
  /** Posters take the time of their poster session block. */
  poster?: boolean;
  url?: string;
};

export type Change = {
  id: string;
  title: string;
  kind: "added" | "moved" | "removed";
  detectedAt: string;
  start: string;
  room?: string;
  from?: { start: string; room?: string };
};

export type Program = {
  eventId: string;
  syncedAt: string;
  sessions: Session[];
  contributions: Contribution[];
  breaks: { title: string; start: string; end: string }[];
  changes: Change[];
};

// Published by QM2027/program-data as its own Pages site, on the same origin as this one in
// production. Set NEXT_PUBLIC_PROGRAM_URL to test with another file. In development the live
// file is used (GitHub Pages sends CORS headers).
export const PROGRAM_URL =
  process.env.NEXT_PUBLIC_PROGRAM_URL ??
  (process.env.NODE_ENV === "development" ? "https://qm2027.github.io/program-data/program.json" : "/program-data/program.json");

/** program-data may publish a past conference for testing; the UI labels that as a preview. */
export const QM2027_EVENT_ID = "1622375";

const REFRESH_MS = 5 * 60_000;

type ProgramState = { status: "loading" } | { status: "ok"; data: Program } | { status: "error" };

/**
 * Loads the program and keeps it current: revalidates on every load (`no-cache` asks the
 * server for a new version via ETag), when the tab comes back into view and every five
 * minutes while it is visible. A failed refresh keeps the program already shown.
 */
export function useProgram(): ProgramState {
  const [state, setState] = useState<ProgramState>({ status: "loading" });

  useEffect(() => {
    let ctrl: AbortController | undefined;
    const load = () => {
      ctrl?.abort();
      const c = (ctrl = new AbortController());
      fetch(PROGRAM_URL, { cache: "no-cache", signal: c.signal })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((data: Program) =>
          setState((cur) => (cur.status === "ok" && cur.data.syncedAt === data.syncedAt ? cur : { status: "ok", data })),
        )
        .catch(() => {
          if (!c.signal.aborted) setState((cur) => (cur.status === "ok" ? cur : { status: "error" }));
        });
    };
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") load();
    };

    load();
    document.addEventListener("visibilitychange", refreshIfVisible);
    const timer = setInterval(refreshIfVisible, REFRESH_MS);
    return () => {
      ctrl?.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, []);

  return state;
}

export const dayOf = (iso: string) => iso.slice(0, 10);
export const clock = (iso: string) => iso.slice(11, 16);

export function dayLabel(day: string) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

export const overlaps = (a: { start: string; end: string }, b: { start: string; end: string }) =>
  Date.parse(a.start) < Date.parse(b.end) && Date.parse(b.start) < Date.parse(a.end);

export const isRunning = (x: { start: string; end: string }, now: number) => Date.parse(x.start) <= now && now < Date.parse(x.end);
