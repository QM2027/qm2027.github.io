"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Countdown } from "@/components/Countdown";
import { HappeningNow } from "@/components/HappeningNow";
import { Icon, type IconName } from "@/components/Icon";
import { JejuOutline } from "@/components/JejuOutline";
import { install, useInstall } from "@/components/pwa/install";
import { KEY_DATES, KEY_DATES_SOURCE, REGISTRATION_CLOSES } from "@/data/dates";
import { GUIDES } from "@/data/guides";
import { INDICO_ACCOMMODATION, INDICO_GLANCE, INDICO_PROCEEDINGS, INDICO_REGISTER, INDICO_TIMETABLE } from "@/data/indico-links";
import { clock, dayLabel, isRunning, QM2027_EVENT_ID, useProgram, type Program } from "@/lib/program";
import { SITE } from "@/lib/site";
import { pinnedNow, useNow } from "@/lib/use-now";
import { MARCH_CLIMATE } from "@/lib/weather";
import { AIR_GRADE, airGrade, useWeatherData, venueWarnings, warningName } from "@/lib/weather-data";

// Home of the conference-app edition (preview, `?edition=app`). It changes with the date:
//   prep       until registration closes: the next dates on Indico, Register
//   departure  until the day before the opening: the program, the trip
//   week       the day before the opening to the end: arrival, happening now, today
//   after      the record
// `?now=<ISO time>` pins the clock; `?phase=` forces a phase, e.g. `?phase=week&now=2025-04-08T11:20:00+02:00`
// shows the conference week with the QM2025 preview program.

type Phase = "prep" | "departure" | "week" | "after";
const PHASES: readonly string[] = ["prep", "departure", "week", "after"];

const DAY = 86_400_000;
const START = Date.parse(SITE.start);
const END = Date.parse(SITE.end);
const KST = "Asia/Seoul";

function phaseAt(now: number): Phase {
  if (now > END) return "after";
  if (now >= START - DAY) return "week";
  if (now > Date.parse(REGISTRATION_CLOSES)) return "departure";
  return "prep";
}

export function AppHome() {
  const params = useSearchParams();
  const now = pinnedNow(params.get("now"), useNow());
  if (now === undefined) return null;
  const forced = params.get("phase");
  const phase = forced && PHASES.includes(forced) ? (forced as Phase) : phaseAt(now);
  if (phase === "week") return <Week now={now} />;
  if (phase === "after") return <After />;
  const pinned = params.get("now") ? now : undefined;
  return <Before now={now} phase={phase} pinned={pinned} />;
}

/* ---------- Before the conference ---------- */

function Before({ now, phase, pinned }: { now: number; phase: "prep" | "departure"; pinned?: number }) {
  const blocks =
    phase === "prep"
      ? [<NextDates key="dates" now={now} />, <ProgramBlock key="program" />, <Trip key="trip" />, <Install key="install" />]
      : [<ProgramBlock key="program" />, <Trip key="trip" climate />, <Install key="install" />, <NextDates key="dates" now={now} />];

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 sm:py-12 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div>
            {/* The official name over the name everyone uses, in every look. */}
            <p className="max-w-2xl text-sm text-balance text-muted sm:text-base">{SITE.officialName}</p>
            <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">{SITE.name}</h1>
            <p className="mt-3 text-lg text-muted">
              {SITE.dates}
              <span className="plain:hidden"> · </span>
              <span className="hidden plain:inline">, </span>
              ICC Jeju, Korea
            </p>
            <div className="mt-6">
              <Countdown from={pinned} />
            </div>
          </div>
          <JejuOutline className="hidden h-auto w-full text-foreground lg:block" />
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-x-12 px-4 pb-14 lg:grid-cols-2 lg:px-8">
        {blocks}
        <JejuGuides />
      </div>
    </>
  );
}

function Block({ title, plainTitle, children, id }: { title: string; plainTitle?: string; children: ReactNode; id?: string }) {
  return (
    <section aria-labelledby={id} className="mt-10 border-t border-foreground pt-3">
      {/* The span carries the mono face: the global h2 rule (serif) outranks utility classes.
          Plain look: a heading at heading size, not a small grey label. */}
      <h2 id={id}>
        <span className="font-mono text-xs font-normal tracking-wider text-muted uppercase plain:font-serif plain:text-xl plain:font-semibold plain:tracking-normal plain:text-foreground plain:normal-case">
          {plainTitle ? (
            <>
              <span className="plain:hidden">{title}</span>
              <span className="hidden plain:inline">{plainTitle}</span>
            </>
          ) : (
            title
          )}
        </span>
      </h2>
      {children}
    </section>
  );
}

const button =
  "inline-flex min-h-11 items-center gap-1.5 rounded-md bg-foreground px-5 font-medium text-background hover:opacity-90 brand:bg-tangerine";
const textLink = "text-sm underline decoration-border underline-offset-4 hover:decoration-foreground";

const kstDay = (t: number) => new Date(t).toLocaleDateString("sv-SE", { timeZone: KST });

function inDays(at: number, now: number) {
  const n = Math.round((Date.parse(kstDay(at)) - Date.parse(kstDay(now))) / DAY);
  return n <= 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`;
}

function NextDates({ now }: { now: number }) {
  const next = KEY_DATES.filter((d) => Date.parse(d.at) >= now).slice(0, 2);
  if (!next.length) return null;
  const registrationOpen = now < Date.parse(REGISTRATION_CLOSES);

  return (
    <Block title="Next dates" id="next-dates">
      <ul className="mt-2">
        {next.map((d) => {
          const at = Date.parse(d.at);
          const date = new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: KST });
          return (
            <li key={d.at} className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-border py-3">
              <span>
                {d.labels.map((l) => (
                  <span key={l} className="block leading-snug">
                    {l}
                  </span>
                ))}
              </span>
              <span className="text-right font-mono text-sm tabular-nums">
                {date}
                {d.timed && `, ${clock(new Date(at + 9 * 3600_000).toISOString())} KST`}
                <span className="block text-muted">{inDays(at, now)}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        {registrationOpen && (
          <a href={INDICO_REGISTER} target="_blank" rel="noreferrer" className={button}>
            Register on Indico <Icon name="external" className="size-4" />
          </a>
        )}
        <a href={KEY_DATES_SOURCE} target="_blank" rel="noreferrer" className={textLink}>
          All dates on Indico<span className="plain:hidden"> ↗</span>
        </a>
      </div>
    </Block>
  );
}

function ProgramBlock() {
  const program = useProgram();
  const out = program.status === "ok" && program.data.eventId === QM2027_EVENT_ID && program.data.sessions.length > 0;

  return (
    <Block title="Program" id="program-block">
      {out ? (
        <>
          <p className="mt-3 max-w-prose">
            The timetable is out. Browse talks and posters, build your own schedule, and keep it on your phone for the
            week.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/program/" className={button}>
              Browse the program
            </Link>
            <Link href="/program/?view=mine" className={textLink}>
              Your schedule
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 max-w-prose">
            The timetable isn’t published yet. Once it is on Indico it appears here too, and stays on your phone for
            offline use.
          </p>
          <a href={INDICO_GLANCE} target="_blank" rel="noreferrer" className={`mt-4 inline-block ${textLink}`}>
            Program at a glance on Indico<span className="plain:hidden"> ↗</span>
          </a>
        </>
      )}
    </Block>
  );
}

type Row = { href: string; title: string; text?: string; external?: boolean };

function LinkList({ rows }: { rows: Row[] }) {
  return (
    <ul className="mt-2">
      {rows.map((r) => {
        const body = (
          <>
            <span>
              <span className="font-medium group-hover:underline group-hover:underline-offset-4">{r.title}</span>
              {r.text && <span className="mt-0.5 block text-sm text-muted">{r.text}</span>}
            </span>
            <Icon name={r.external ? "external" : "chevron"} className="size-4 shrink-0 text-muted" />
          </>
        );
        const cls = "group flex items-center justify-between gap-4 border-b border-border py-3";
        return (
          <li key={r.href}>
            {r.external ? (
              <a href={r.href} target="_blank" rel="noreferrer" className={cls}>
                {body}
              </a>
            ) : (
              <Link href={r.href} className={cls}>
                {body}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Trip({ climate = false }: { climate?: boolean }) {
  return (
    <Block title="Plan your trip" id="trip">
      {climate && (
        <p className="mt-3 max-w-prose text-sm text-muted">
          Late March in Jeju: about {MARCH_CLIMATE.low}–{MARCH_CLIMATE.high} °C. {MARCH_CLIMATE.text}
        </p>
      )}
      <LinkList
        rows={[
          { href: "/getting-there/", title: "Getting to ICC Jeju", text: "Bus or taxi from the airport, and a card for the driver" },
          { href: INDICO_ACCOMMODATION, title: "Accommodation", text: "Conference hotels, on Indico", external: true },
          { href: "/travel/", title: "Visa, money and phone", text: "K-ETA, cash and cards, SIMs, emergency numbers" },
          { href: "/explore/korea/", title: "Before or after: Korea", text: "Seoul, Daejeon, Busan and satellite meetings" },
        ]}
      />
    </Block>
  );
}

function Install() {
  const { mode } = useInstall();
  if (!mode) return null;
  return (
    <Block title="Install the app" id="install">
      <p className="mt-3 max-w-prose">
        Keeps the program, the venue plan and the map on your phone, so they open without a connection at the venue.
      </p>
      <button type="button" onClick={() => install()} className={`mt-4 ${button}`}>
        <Icon name="download" className="size-4" />
        Install
      </button>
    </Block>
  );
}

function JejuGuides() {
  const picks = ["/explore/season/", "/explore/food/", "/explore/hallasan/"];
  const rows = GUIDES.filter((g) => picks.includes(g.href)).map((g) => ({ href: g.href, title: g.title, text: g.text }));
  return (
    <Block title="Jeju in March" id="jeju-guides">
      <LinkList rows={rows} />
      <Link href="/jeju/" className={`mt-4 inline-block ${textLink}`}>
        Everything for Jeju<span className="plain:hidden"> →</span>
      </Link>
    </Block>
  );
}

/* ---------- Conference week ---------- */

function Week({ now }: { now: number }) {
  const program = useProgram();
  const data = program.status === "ok" ? program.data : undefined;
  const today = data && new Date(now).toLocaleDateString("sv-SE", { timeZone: data.tz });
  const days = data ? [...new Set(data.sessions.map((s) => s.start.slice(0, 10)))].sort() : [];
  const firstStart = data?.sessions.reduce((min, s) => Math.min(min, Date.parse(s.start)), Infinity) ?? START;
  const arriving = now < firstStart;
  const dayIndex = today ? days.indexOf(today) : -1;

  return (
    <>
      <section className={arriving ? "border-b border-border" : ""}>
        <div className="mx-auto max-w-7xl px-4 pt-8 lg:px-8">
          <p className="font-mono text-xs tracking-widest text-muted uppercase plain:hidden">{SITE.name}</p>
          <h1 className="mt-2 text-3xl sm:text-4xl plain:mt-0">
            {arriving ? "Welcome to Jeju" : dayIndex >= 0 ? `Day ${dayIndex + 1} of ${days.length}` : SITE.name}
          </h1>
          {arriving && Number.isFinite(firstStart) && data && (
            <p className="mt-2 text-muted">
              The conference opens {dayLabel(days[0])} at {clock(data.sessions.find((s) => Date.parse(s.start) === firstStart)!.start)}.
            </p>
          )}
        </div>
        {arriving && <Arrival checkedAt={program.status === "ok" ? program.checkedAt : undefined} />}
      </section>

      {/* Up to three running sessions, so today and the shortcuts stay near the top on a phone. */}
      <HappeningNow limit={3} />

      <div className="mx-auto grid max-w-7xl gap-x-12 px-4 pb-14 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <div>{data && today && <Today program={data} today={today} now={now} />}</div>
        <div>
          <QuickActions />
          <Conditions />
          <Block title="Free time" id="free-time">
            <LinkList
              rows={[{ href: "/explore/plan/", title: "Plan a loop from the venue", text: "Fits the hours you have and today’s weather" }]}
            />
          </Block>
        </div>
      </div>
    </>
  );
}

function Arrival({ checkedAt }: { checkedAt?: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 lg:px-8">
      <LinkList
        rows={[
          { href: "/getting-there/", title: "Airport to ICC Jeju", text: "Bus 600 or a taxi, about an hour" },
          { href: "/getting-there/#taxi", title: "Taxi card", text: "Your destination in Korean, to show the driver" },
          { href: "/venue/?find=registration", title: "Registration desk", text: "Where to collect your badge" },
        ]}
      />
      <p className="mt-4 font-mono text-xs text-muted">
        {checkedAt
          ? `Program saved on this device · checked ${new Date(checkedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`
          : "Program not saved yet: open the app once with a connection."}
      </p>
    </div>
  );
}

type TodayRow = { start: string; end: string; title: string; sub?: string; href: string; quiet?: boolean };

/** The day at a glance: parallel sessions that start together collapse into one row. */
function todayRows(p: Program, today: string): TodayRow[] {
  const onDay = <T extends { start: string }>(x: T) => x.start.slice(0, 10) === today;
  const rows: TodayRow[] = [];
  const byStart = new Map<string, Program["sessions"]>();
  for (const s of p.sessions.filter(onDay)) {
    if (s.poster) {
      rows.push({ start: s.start, end: s.end, title: s.title, sub: "Posters", href: `/program/?view=posters&ps=${s.id}` });
    } else {
      byStart.set(s.start, [...(byStart.get(s.start) ?? []), s]);
    }
  }
  for (const [start, list] of byStart) {
    const end = list.reduce((max, s) => (s.end > max ? s.end : max), list[0].end);
    rows.push({
      start,
      end,
      title: list.length === 1 ? list[0].title : `${list.length} parallel sessions`,
      sub: list.length === 1 ? list[0].room : undefined,
      href: `/program/?day=${today}`,
    });
  }
  // Short breaks would only crowd the list.
  for (const b of p.breaks.filter(onDay)) {
    if (Date.parse(b.end) - Date.parse(b.start) >= 25 * 60_000)
      rows.push({ start: b.start, end: b.end, title: b.title, href: `/program/?day=${today}`, quiet: true });
  }
  return rows.sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
}

function Today({ program, today, now }: { program: Program; today: string; now: number }) {
  const rows = todayRows(program, today);
  if (!rows.length) return null;
  return (
    <Block title={`Today · ${dayLabel(today)}`} plainTitle={`Today, ${dayLabel(today)}`} id="today">
      <ol className="mt-2">
        {rows.map((r) => {
          const running = isRunning(r, now);
          const over = Date.parse(r.end) <= now;
          return (
            <li key={`${r.start}-${r.title}`}>
              <Link
                href={r.href}
                className={`group grid grid-cols-[3.5rem_1fr] gap-x-3 border-b border-border py-2.5 ${running ? "border-l-2 border-l-tangerine pl-2" : ""} ${over ? "text-muted" : ""}`}
              >
                <span className="font-mono text-sm tabular-nums">{running ? <b className="font-semibold text-tangerine">NOW</b> : clock(r.start)}</span>
                <span className={r.quiet ? "text-muted" : ""}>
                  <span className="group-hover:underline group-hover:underline-offset-4">{r.title}</span>
                  <span className="block text-sm text-muted">
                    until {clock(r.end)}
                    {r.sub && ` · ${r.sub}`}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </Block>
  );
}

const QUICK: { href: string; label: string; icon: IconName }[] = [
  { href: "/venue/", label: "Venue plan", icon: "building" },
  { href: "/program/?view=mine", label: "My schedule", icon: "star" },
  { href: "/getting-there/#taxi", label: "Taxi card", icon: "route" },
  { href: "/info/#help", label: "Help", icon: "bell" },
];

function QuickActions() {
  return (
    <Block title="Shortcuts" id="shortcuts">
      <ul className="mt-3 grid grid-cols-2 border-t border-l border-border">
        {QUICK.map((q) => (
          <li key={q.href} className="border-r border-b border-border">
            <Link href={q.href} className="flex min-h-14 items-center gap-2.5 px-3 hover:bg-surface">
              <Icon name={q.icon} className="size-5 text-muted" />
              <span className="font-medium">{q.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Block>
  );
}

function Conditions() {
  const { warnings, air } = useWeatherData();
  const atVenue = warnings ? venueWarnings(warnings.items).filter((w) => !w.preliminary) : [];
  const grade = air ? airGrade(air) : null;
  return (
    <Block title="Weather" id="weather">
      {atVenue.length > 0 && (
        <p className="mt-3 font-medium text-alert">In force at the venue: {atVenue.map(warningName).join(", ")}</p>
      )}
      {grade && <p className="mt-3 text-sm">Air quality: {AIR_GRADE[grade]}</p>}
      <LinkList rows={[{ href: "/travel/", title: "Forecast and alerts", text: "Five days ahead, KMA warnings for the venue" }]} />
    </Block>
  );
}

/* ---------- After ---------- */

function After() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 pb-14 lg:px-8">
      <p className="max-w-2xl text-sm text-balance text-muted sm:text-base">{SITE.officialName}</p>
      <h1 className="mt-2 text-4xl">{SITE.name}</h1>
      <p className="mt-3 text-lg text-muted">Held in Jeju, {SITE.dates}. Thank you for coming.</p>
      <div className="max-w-2xl">
        <LinkList
          rows={[
            { href: "/program/", title: "The program", text: "Talks and posters as they ran" },
            { href: INDICO_TIMETABLE, title: "Slides", text: "On the Indico timetable", external: true },
            { href: INDICO_PROCEEDINGS, title: "Proceedings", text: "On Indico", external: true },
          ]}
        />
      </div>
    </section>
  );
}
