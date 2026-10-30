import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { Icon, type IconName } from "@/components/Icon";
import { INDICO_GROUPS } from "@/data/indico-links";
import { SITE } from "@/lib/site";

const FEATURES: { href: string; icon: IconName; title: string; text: string }[] = [
  { href: "/explore/", icon: "map", title: "Explore Jeju", text: "Interactive map with sights, food and rainy-day options, all measured from the venue." },
  { href: "/explore/?tab=courses", icon: "list", title: "Suggested courses", text: "Itineraries from 2 hours to a full day, drawn on the map." },
  { href: "/getting-there/", icon: "route", title: "Getting there", text: "Airport to ICC Jeju compared, plus a Korean card to show your taxi driver." },
  { href: "/program/", icon: "calendar", title: "Program", text: "Timetable, with an offline personal schedule coming soon." },
];

export default function Home() {
  return (
    <main className="w-full">
      <section className="bg-gradient-to-br from-sea-strong via-sea to-[#155e75] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:px-8 lg:py-24">
          <p className="text-sm font-medium tracking-wide text-white/80">{SITE.dates} · {SITE.city}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{SITE.name}</h1>
          <p className="mt-3 max-w-2xl text-white/85 sm:text-lg">{SITE.tagline}</p>
          <p className="mt-1 text-white/85">{SITE.venue}</p>
          <p className="mt-6 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
            <Countdown />
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href={`${SITE.indico}registrations/`} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center rounded-xl bg-canola px-6 font-semibold text-black">
              Register on Indico
            </a>
            <Link href="/explore/" className="flex min-h-12 items-center justify-center rounded-xl bg-white/15 px-6 font-semibold backdrop-blur hover:bg-white/25">
              Explore Jeju →
            </Link>
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

      <section className="mx-auto max-w-7xl px-4 pb-12 lg:px-8">
        <h2 className="text-xl font-semibold">Conference information on Indico</h2>
        <p className="mt-1 text-sm text-muted">Official details, deadlines and forms are kept on Indico.</p>
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
