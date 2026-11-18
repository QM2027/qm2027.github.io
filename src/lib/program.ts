"use client";

import { useEffect, useSyncExternalStore } from "react";

// Data published by QM2027/program-data (schema 2, see its README). Times are ISO strings in
// the event's time zone, so slicing gives event-local wall-clock values.

export type Person = { name: string; affiliation?: string };

export type Session = {
  id: string;
  /** Indico session id, shared by the blocks of one session. */
  group?: string;
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
  /** Indico's short contribution number. */
  friendlyId?: number;
  title: string;
  start: string;
  end: string;
  room?: string;
  sessionId?: string;
  /** Every block of a multi-block poster session; `sessionId` is the first. */
  slots?: string[];
  speakers: Person[];
  board?: string;
  track?: string;
  /** Posters take the time of their poster session's block. */
  poster?: boolean;
  url?: string;
};

export type Unscheduled = Omit<Contribution, "start" | "end" | "sessionId" | "slots"> & { session?: string };

export type ChangeKind = "added" | "removed" | "moved" | "speaker" | "scheduled" | "unscheduled";

export type Change = {
  /** A contribution id, or a session id when `count` is set. */
  id: string;
  title: string;
  kind: ChangeKind;
  detectedAt: string;
  start?: string;
  room?: string;
  board?: string;
  speakers?: string;
  from?: { start?: string; room?: string; board?: string; speakers?: string };
  sessionId?: string;
  /** Set when many changes in one session were collapsed into this entry. */
  count?: number;
  ids?: string[];
};

export type Program = {
  schema: 2;
  eventId: string;
  tz: string;
  syncedAt: string;
  sessions: Session[];
  contributions: Contribution[];
  unscheduled: Unscheduled[];
  breaks: { title: string; start: string; end: string }[];
  tracks: string[];
  changes: Change[];
};

export type Abstracts = Record<string, { abstract?: string; authors?: string[] }>;

export type Material = { title: string; url: string; kind: "pdf" | "slides" | "video" | "image" | "link" | "file"; size?: number };
/** Direct links to public slides and posters on Indico, by contribution id. */
export type Materials = Record<string, Material[]>;

type Index = {
  schema: number;
  eventId: string;
  syncedAt: string;
  /** Last successful check against Indico, refreshed at least hourly. */
  checkedAt: string;
  program: string;
  abstracts: string;
  materials?: string;
};

// Published as its own Pages site, on the same origin as this one in production. Set
// NEXT_PUBLIC_PROGRAM_BASE to test with other files. In development the live files are used
// (GitHub Pages sends CORS headers).
export const PROGRAM_BASE =
  process.env.NEXT_PUBLIC_PROGRAM_BASE ??
  (process.env.NODE_ENV === "development" ? "https://qm2027.github.io/program-data" : "/program-data");

/** program-data may publish a past conference for testing; the UI labels that as a preview. */
export const QM2027_EVENT_ID = "1622375";

const REFRESH_MS = 5 * 60_000;
/** The UI warns when the program hasn't been checked against Indico for this long. */
export const STALE_MS = 2 * 60 * 60_000;

export type ProgramState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ok"; data: Program; checkedAt: string; abstracts?: Abstracts; materials?: Materials };

// One store for the whole app, so the program page and the venue map share a single download.
// index.json is tiny and polled; the hashed files it names never change, so they are fetched
// once per version (the service worker keeps them for offline use).

let state: ProgramState = { status: "loading" };
const listeners = new Set<() => void>();
let current: { program?: string; abstracts?: string; materials?: string } = {};
let inflight: Promise<void> | undefined;
let users = 0;
let timer: ReturnType<typeof setInterval> | undefined;

function set(next: ProgramState) {
  state = next;
  for (const l of listeners) l();
}

class Gone extends Error {}

async function getJson<T>(name: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PROGRAM_BASE}/${name}`, init);
  if (res.status === 404) throw new Gone(name);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return res.json();
}

const idle = () => new Promise((r) => (typeof requestIdleCallback === "function" ? requestIdleCallback(r, { timeout: 2000 }) : setTimeout(r, 300)));

async function refreshOnce(): Promise<void> {
  const index = await getJson<Index>("index.json", { cache: "no-cache" });
  if (index.schema !== 2) throw new Error(`unknown schema ${index.schema}`);

  if (index.program !== current.program || state.status !== "ok") {
    const data = await getJson<Program>(index.program);
    current = { ...current, program: index.program };
    const prev = state.status === "ok" ? state : undefined;
    set({ status: "ok", data, checkedAt: index.checkedAt, abstracts: prev?.abstracts, materials: prev?.materials });
  } else if (state.checkedAt !== index.checkedAt) {
    set({ ...state, checkedAt: index.checkedAt });
  }

  // Materials are small and change all week as speakers upload; abstracts are large and rarely
  // change. Both load after the program has rendered, which works without them meanwhile.
  if (index.materials && index.materials !== current.materials) {
    const materials = await getJson<Materials>(index.materials);
    current = { ...current, materials: index.materials };
    if (state.status === "ok") set({ ...state, materials });
  }
  if (index.abstracts !== current.abstracts) {
    await idle();
    const abstracts = await getJson<Abstracts>(index.abstracts);
    current = { ...current, abstracts: index.abstracts };
    if (state.status === "ok") set({ ...state, abstracts });
  }
}

async function refresh(): Promise<void> {
  try {
    await refreshOnce();
  } catch (e) {
    try {
      // A 404 on a hashed file means a deploy replaced it since index.json was read: read it again.
      if (e instanceof Gone) return await refreshOnce();
    } catch {}
    // Keep what is shown; only a first load that fails is an error.
    if (state.status === "loading") set({ status: "error" });
  }
}

function load() {
  inflight ??= refresh().finally(() => (inflight = undefined));
  return inflight;
}

/** Check index.json now, e.g. when a contribution is opened, so its file links are current. */
export const refreshProgram = () => load();

const onVisible = () => {
  if (document.visibilityState === "visible") load();
};

function start() {
  if (users++ > 0) return;
  load();
  document.addEventListener("visibilitychange", onVisible);
  timer = setInterval(onVisible, REFRESH_MS);
}

function stop() {
  if (--users > 0) return;
  document.removeEventListener("visibilitychange", onVisible);
  clearInterval(timer);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

const serverState: ProgramState = { status: "loading" };

/**
 * The program, kept current: index.json is revalidated on mount, when the tab comes back into
 * view and every five minutes while it is visible. A failed refresh keeps what is shown.
 */
export function useProgram(): ProgramState {
  useEffect(() => {
    start();
    return stop;
  }, []);
  return useSyncExternalStore(subscribe, () => state, () => serverState);
}

export const dayOf = (iso: string) => iso.slice(0, 10);
export const clock = (iso: string) => iso.slice(11, 16);

export function dayLabel(day: string) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

export const overlaps = (a: { start: string; end: string }, b: { start: string; end: string }) =>
  Date.parse(a.start) < Date.parse(b.end) && Date.parse(b.start) < Date.parse(a.end);

export const isRunning = (x: { start: string; end: string }, now: number) => Date.parse(x.start) <= now && now < Date.parse(x.end);

/** Contribution ids touched by changes, including the ones inside collapsed entries. */
export function changedContributionIds(changes: Change[]): Set<string> {
  const ids = new Set<string>();
  for (const c of changes) {
    if (c.kind === "added") continue;
    for (const id of c.ids ?? [c.id]) ids.add(id);
  }
  return ids;
}
