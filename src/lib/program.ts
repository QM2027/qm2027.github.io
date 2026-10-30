"use client";

import { withBase } from "./paths";
import { useFetchJson } from "./use-fetch-json";

// Shape written by scripts/sync-indico.mjs. Times are ISO strings in the event's own
// time zone, so slicing gives event-local wall-clock values.

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

export const PROGRAM_URL = withBase("/data/program.json");

export function useProgram() {
  return useFetchJson<Program>(PROGRAM_URL);
}

export const dayOf = (iso: string) => iso.slice(0, 10);
export const clock = (iso: string) => iso.slice(11, 16);

export function dayLabel(day: string) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

export const overlaps = (a: { start: string; end: string }, b: { start: string; end: string }) =>
  Date.parse(a.start) < Date.parse(b.end) && Date.parse(b.start) < Date.parse(a.end);

export const isRunning = (x: { start: string; end: string }, now: number) => Date.parse(x.start) <= now && now < Date.parse(x.end);
