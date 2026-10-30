import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { Icon, type IconName } from "@/components/Icon";
import { GUIDES } from "@/data/guides";
import { INDICO_GROUPS } from "@/data/indico-links";
import { SITE } from "@/lib/site";

const FEATURES: { href: string; icon: IconName; title: string; text: string }[] = [
  { href: "/explore/", icon: "map", title: "Explore Jeju", text: "Interactive map with sights, food and rainy-day options, all measured from the venue." },
  { href: "/explore/?tab=courses", icon: "list", title: "Suggested courses", text: "Itineraries from 2 hours to a full day, drawn on the map." },
  { href: "/getting-there/", icon: "route", title: "Getting there", text: "Airport to ICC Jeju compared, plus a Korean card to show your taxi driver." },
  { href: "/venue/", icon: "building", title: "Venue plan", text: "Find rooms, coffee, restrooms and the nursing room at ICC Jeju." },
];

export default function Home() {
  return (
    <main className="w-full">
      <section className="bg-gradient-to-br from-sea-strong via-sea to-[#155e75] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:px-8 lg:py-24">
          <p className="text-sm font-medium tracking-wide text-white/80">
            Visitor guide for {SITE.name} participants · {SITE.dates}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Welcome to Jeju</h1>
          <p className="mt-3 max-w-2xl text-white/85 sm:text-lg">
            Getting to {SITE.venue}, finding your way around it, and making the most of the island between
            sessions.
          </p>
          <p className="mt-6 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
            <Countdown />
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/explore/" className="flex min-h-12 items-center justify-center rounded-xl bg-canola px-6 font-semibold text-black">
              Explore Jeju →
            </Link>
            <a href={SITE.indico} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/15 px-6 font-semibold backdrop-blur hover:bg-white/25">
              Official conference site (Indico) <Icon name="external" className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <li key={f.href}>
              <Link href={f.href} className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-sea hover:shadow-sm">
                <span className="flex size-10 items-center justify-center rounded-xl bg-sea/10 text-sea"><Icon name={f.icon} /></span>
                <span className="mt-3 font-semibold">{f.title}</span>
                <span className="mt-1 text-sm text-muted">{f.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 lg:px-8">
        <h2 className="text-xl font-semibold">Between sessions</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GUIDES.map((g) => (
            <li key={g.href}>
              <Link href={g.href} className="flex h-full items-start gap-3 rounded-2xl bg-canola/10 p-4 transition hover:bg-canola/20">
                <span className="text-2xl" aria-hidden>{g.emoji}</span>
                <span>
                  <span className="block font-semibold">{g.title}</span>
                  <span className="block text-sm text-muted">{g.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 lg:px-8">
        <h2 className="text-xl font-semibold">Official conference information</h2>
        <p className="mt-1 text-sm text-muted">
          Registration, abstracts, the program and all deadlines are managed on the official Indico site.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {INDICO_GROUPS.map((g) => (
            <div key={g.title} className="rounded-2xl border border-border bg-surface p-4">
              <h3 className="text-sm font-semibold text-muted">{g.title}</h3>
              <ul className="mt-2">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noreferrer" className="flex min-h-10 items-center justify-between gap-2 text-sm hover:text-sea">
                      {l.label} <Icon name="external" className="size-3.5 shrink-0 text-muted" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">
          Questions? <a href={`mailto:${SITE.email}`} className="text-sea underline">{SITE.email}</a>
        </p>
      </section>
    </main>
  );
}
