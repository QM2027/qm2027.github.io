import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { JejuOutline } from "@/components/JejuOutline";
import { GUIDES } from "@/data/guides";
import { INDICO_GROUPS } from "@/data/indico-links";
import { SITE } from "@/lib/site";

const CONTENTS = [
  { href: "/explore/", title: "Map of Jeju", text: "Sights, food, transport and hospitals, with distances from the venue" },
  { href: "/getting-there/", title: "Airport to venue", text: "Bus, taxi or car, and a card in Korean for the driver" },
  { href: "/venue/", title: "Venue plan", text: "Rooms, registration, coffee and facilities at ICC Jeju" },
  { href: "/travel/", title: "Travel toolkit", text: "Weather, money, phone, emergency numbers" },
  { href: "/program/", title: "Program", text: "Offline copy of the Indico timetable, with your own schedule" },
  ...GUIDES.map((g) => ({ href: g.href, title: g.title, text: g.text })),
];

export default function Home() {
  return (
    <main className="w-full">
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:py-14 lg:grid-cols-[1fr_1.1fr] lg:px-8 lg:py-20">
          <div>
            <p className="font-mono text-xs tracking-widest text-muted uppercase">{SITE.name} · Visitor guide</p>
            <h1 className="mt-4 text-5xl leading-[1.05] sm:text-6xl">
              Jeju,
              <br />
              21–27 March 2027
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Practical notes for conference participants: getting to {SITE.venue}, finding your way inside it, and
              what to do on the island before, between and after the sessions.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/explore/" className="inline-flex min-h-12 items-center rounded-md bg-foreground px-6 font-medium text-background hover:opacity-90">
                Open the map
              </Link>
              <a href={SITE.indico} target="_blank" rel="noreferrer" className="text-sm underline decoration-border underline-offset-4 hover:decoration-foreground">
                Official conference site on Indico ↗
              </a>
            </div>
            <p className="mt-8 font-mono text-sm text-muted">
              <Countdown />
            </p>
          </div>
          <JejuOutline className="h-auto w-full text-foreground" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <h2 className="text-2xl">In this guide</h2>
        <ol className="mt-6 grid border-t border-border md:grid-cols-2 md:gap-x-12">
          {CONTENTS.map((c, i) => (
            <li key={c.href} className="border-b border-border">
              <Link href={c.href} className="group grid grid-cols-[2.5rem_1fr] gap-x-3 py-4">
                <span className="font-mono text-sm text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="font-medium group-hover:underline group-hover:underline-offset-4">{c.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{c.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 lg:px-8">
        <h2 className="text-2xl">Official information</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Registration, abstracts, the program and all deadlines are managed on Indico. These links open the relevant
          Indico pages.
        </p>
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {INDICO_GROUPS.map((g) => (
            <div key={g.title} className="border-t border-foreground pt-3">
              <h3 className="font-mono text-xs tracking-wider text-muted uppercase">{g.title}</h3>
              <ul className="mt-2">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noreferrer" className="block py-1.5 text-sm hover:underline hover:underline-offset-4">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted">
          Questions about registration or accommodation:{" "}
          <a href={`mailto:${SITE.email}`} className="underline underline-offset-4">{SITE.email}</a>
        </p>
      </section>
    </main>
  );
}
