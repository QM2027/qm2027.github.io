// Minimal iCalendar (RFC 5545) export for "add to calendar".

type IcsEvent = { uid: string; title: string; start: string; end: string; location?: string; description?: string; url?: string };

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Fold long lines. Counts characters, a close-enough stand-in for the spec's 75 octets with ASCII titles. */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

export function buildIcs(events: IcsEvent[]) {
  const now = stamp(new Date().toISOString());
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//QM2027 Jeju Visitor Guide//EN", "CALSCALE:GREGORIAN"];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@qm2027-guide`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(e.start)}`,
      `DTEND:${stamp(e.end)}`,
      `SUMMARY:${escape(e.title)}`,
      ...(e.location ? [`LOCATION:${escape(e.location)}`] : []),
      ...(e.description ? [`DESCRIPTION:${escape(e.description)}`] : []),
      ...(e.url ? [`URL:${e.url}`] : []),
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadIcs(filename: string, events: IcsEvent[]) {
  const url = URL.createObjectURL(new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" }));
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}
