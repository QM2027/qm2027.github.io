#!/usr/bin/env node
// Pull the public Indico timetable and write a compact snapshot for the program page.
//
//   node scripts/sync-indico.mjs                     # QM2027 → public/data/program.json
//   EVENT_ID=1334113 node scripts/sync-indico.mjs --out /tmp/qm2025.json   # any public event
//
// Never fails the build: on any network or format problem it keeps the previous snapshot.
// The file is only rewritten when the program itself changed, so scheduled runs don't
// create empty commits.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const EVENT_ID = process.env.EVENT_ID ?? "1622375";
const outIdx = process.argv.indexOf("--out");
const OUT = outIdx > 0 ? process.argv[outIdx + 1] : "public/data/program.json";
const BASE = "https://indico.cern.ch";
const MAX_CHANGES = 100;

function warn(msg) {
  console.warn(`::warning::sync-indico: ${msg}. Keeping the previous snapshot.`);
}

/** "2027-03-22" + "09:00:00" in an IANA zone → ISO string with that zone's offset. */
function toIso({ date, time, tz }) {
  const naive = new Date(`${date}T${time}Z`);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(naive)
      .map((p) => [p.type, p.value]),
  );
  const asLocal = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const offsetMin = Math.round((asLocal - naive.getTime()) / 60000);
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  return `${date}T${time}${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

const text = (html) =>
  (html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const person = (p) => ({ name: [p.firstName, p.familyName].filter(Boolean).join(" ") || p.name, affiliation: p.affiliation || undefined });
const isDateTime = (d) => d && typeof d.date === "string" && typeof d.time === "string" && typeof d.tz === "string";

function normalize(days) {
  const sessions = [];
  const contributions = [];
  const breaks = [];

  const addContribution = (c, sessionId) => {
    if (!isDateTime(c.startDate) || !isDateTime(c.endDate)) throw new Error(`contribution ${c.id} has no dates`);
    contributions.push({
      id: String(c.contributionId ?? c.id),
      title: c.title,
      start: toIso(c.startDate),
      end: toIso(c.endDate),
      room: c.room || undefined,
      sessionId,
      speakers: (c.presenters ?? []).map(person),
      abstract: text(c.description) || undefined,
      board: c.board_number || undefined,
      url: c.url ? `${BASE}${c.url}` : undefined,
    });
  };

  for (const day of Object.values(days)) {
    for (const e of Object.values(day)) {
      if (!isDateTime(e.startDate) || !isDateTime(e.endDate)) throw new Error(`entry ${e.id} has no dates`);
      if (e.entryType === "Session") {
        const id = String(e.id);
        sessions.push({
          id,
          title: e.slotTitle && e.slotTitle !== e.title ? `${e.title}: ${e.slotTitle}` : e.title,
          start: toIso(e.startDate),
          end: toIso(e.endDate),
          room: e.room || undefined,
          conveners: (e.conveners ?? []).map(person).map((p) => p.name),
          poster: Boolean(e.isPoster) || undefined,
          color: e.color || undefined,
          url: e.url ? `${BASE}${e.url}` : undefined,
        });
        for (const c of Object.values(e.entries ?? {})) {
          if (c.entryType === "Contribution") addContribution(c, id);
          else if (c.entryType === "Break") breaks.push({ title: c.title, start: toIso(c.startDate), end: toIso(c.endDate) });
        }
      } else if (e.entryType === "Contribution") {
        addContribution(e, undefined);
      } else if (e.entryType === "Break") {
        breaks.push({ title: e.title, start: toIso(e.startDate), end: toIso(e.endDate) });
      }
    }
  }

  const byStart = (a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title);
  return { sessions: sessions.sort(byStart), contributions: contributions.sort(byStart), breaks: breaks.sort(byStart) };
}

function diff(prev, next, detectedAt) {
  const before = new Map(prev.map((c) => [c.id, c]));
  const after = new Map(next.map((c) => [c.id, c]));
  const changes = [];
  for (const c of next) {
    const old = before.get(c.id);
    if (!old) changes.push({ id: c.id, title: c.title, kind: "added", detectedAt, start: c.start });
    else if (old.start !== c.start || old.room !== c.room)
      changes.push({ id: c.id, title: c.title, kind: "moved", detectedAt, from: { start: old.start, room: old.room }, start: c.start, room: c.room });
  }
  for (const c of prev) if (!after.has(c.id)) changes.push({ id: c.id, title: c.title, kind: "removed", detectedAt, start: c.start });
  return changes;
}

async function main() {
  let previous;
  try {
    previous = JSON.parse(await readFile(OUT, "utf8"));
  } catch {}

  let raw;
  try {
    const res = await fetch(`${BASE}/export/timetable/${EVENT_ID}.json`, { signal: AbortSignal.timeout(60_000) });
    if (!res.ok) return warn(`HTTP ${res.status}`);
    raw = await res.json();
  } catch (e) {
    return warn(`fetch failed (${e.message})`);
  }

  const days = raw?.results?.[EVENT_ID];
  if (!days || typeof days !== "object") return warn("unexpected response shape");

  let program;
  try {
    program = normalize(days);
  } catch (e) {
    return warn(`could not parse timetable (${e.message})`);
  }

  const content = (p) => JSON.stringify([p.sessions, p.contributions, p.breaks]);
  if (previous && previous.eventId === EVENT_ID && content(previous) === content(program)) {
    console.log(`sync-indico: no changes (${program.contributions.length} contributions)`);
    return;
  }

  const now = new Date().toISOString();
  // Only report changes against a previously published program, not the first import.
  const newChanges = previous?.contributions?.length ? diff(previous.contributions, program.contributions, now) : [];
  const changes = [...newChanges, ...(previous?.changes ?? [])].slice(0, MAX_CHANGES);

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify({ eventId: EVENT_ID, syncedAt: now, ...program, changes }) + "\n");
  console.log(
    `sync-indico: wrote ${OUT}: ${program.sessions.length} sessions, ${program.contributions.length} contributions, ${newChanges.length} new changes`,
  );
}

await main();
