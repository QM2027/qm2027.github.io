import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import baengnokdamLarge from "@/assets/photos/baengnokdam-1280.webp";
import baengnokdamSmall from "@/assets/photos/baengnokdam-640.webp";
import islandLarge from "@/assets/photos/jeju-landsat-1920.webp";
import islandSmall from "@/assets/photos/jeju-landsat-960.webp";
import { GUIDES } from "@/data/guides";
import { INDICO_GROUPS, INDICO_KEY_LINKS } from "@/data/indico-links";
import { SITE } from "@/lib/site";

/*
 * The visitor guide's home in the brand look (?look=brand), a redesign under discussion; the current
 * home stays the default (src/app/page.tsx). Built from the job rather than a landing template: the
 * place first (the island from space and the crater at the top of Hallasan), then the guide ordered by when a
 * participant needs each part, and Indico in one short block.
 */

const guide = (href: string) => {
  const g = GUIDES.find((x) => x.href === href);
  if (!g) throw new Error(`BrandHome: no guide at ${href}`);
  return { href: g.href, title: g.title, text: g.text };
};

/** Every page of the guide, grouped by when it is needed. */
const WHEN: { title: string; links: { href: string; title: string; text: string }[] }[] = [
  {
    title: "Before you go",
    links: [
      { href: "/travel/", title: "Travel toolkit", text: "Weather, money, phone, emergency numbers" },
      guide("/explore/korea/"),
      guide("/explore/companions/"),
    ],
  },
  {
    title: "On arrival",
    links: [
      { href: "/getting-there/", title: "Airport to venue", text: "Bus, taxi or car, and a card in Korean for the driver" },
      { href: "/explore/", title: "Map of Jeju", text: "Sights, food, transport and hospitals, with distances from the venue" },
    ],
  },
  {
    title: "At ICC Jeju",
    links: [
      { href: "/venue/", title: "Venue plan", text: "Rooms, registration, coffee and facilities at ICC Jeju" },
      { href: "/program/", title: "Program Book", text: "Talks and posters from Indico, offline, with your own schedule" },
    ],
  },
  {
    title: "Free time",
    links: ["/explore/plan/", "/explore/season/", "/explore/food/", "/explore/run/", "/explore/science/", "/explore/hallasan/", "/explore/passport/"].map(guide),
  },
];

/** The blue field with white and pale-blue ink (field-ink in globals.css). */
const ON_FIELD = "bg-brand-field field-ink";

export function BrandHome() {
  return (
    <>
      <section aria-labelledby="brand-title">
        {/* The opening, photographs included, sits on a field of the logo's blue. Re-pointing the
            text tokens here lets the countdown, links and caption inside take white and pale blue
            without classes of their own. */}
        <div className={ON_FIELD}>
          <div className="mx-auto grid max-w-7xl gap-x-12 gap-y-6 px-4 pt-12 pb-10 sm:pt-16 sm:pb-12 lg:grid-cols-12 lg:items-end lg:px-8 lg:pt-24 lg:pb-16">
            <div className="lg:col-span-8">
              <h1 id="brand-title" className="text-5xl leading-[1.02] sm:text-7xl lg:text-[4.5rem] xl:text-[5rem]">
                Jeju,
                <br />
                21–27 March 2027
              </h1>
              <div className="mt-8 max-lg:hidden">
                <Countdown />
              </div>
            </div>
            <div className="lg:col-span-4">
              <p className="max-w-xl text-lg leading-relaxed text-muted">
                Practical notes for {SITE.name} participants: getting to {SITE.venue}, finding your way inside it, and
                what to do on the island before, between and after the sessions.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href="/explore/" className="inline-flex min-h-12 items-center rounded-md bg-on-brand-field px-6 font-semibold text-brand-field hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-brand-field">
                  Open the map
                </Link>
                <a href={SITE.indico} target="_blank" rel="noreferrer" className="text-sm underline decoration-brand-field-muted/60 underline-offset-4 hover:decoration-on-brand-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-brand-field">
                  Official conference site on Indico
                </a>
              </div>
              {/* On phones the countdown follows the actions. */}
              <div className="mt-8 lg:hidden">
                <Countdown />
              </div>
            </div>
          </div>

          {/* Hidden (display: none) outside the brand look, where lazy images are never fetched.
              The whole island, then its summit; on phones only the island. */}
          <figure className="mx-auto max-w-7xl px-4 pb-12 lg:px-8 lg:pb-16">
            <div className="grid gap-2 lg:grid-cols-12">
              {/* eslint-disable-next-line @next/next/no-img-element -- a static export with two widths; next/image would serve one */}
              <img
                src={islandLarge.src}
                srcSet={`${islandSmall.src} ${islandSmall.width}w, ${islandLarge.src} ${islandLarge.width}w`}
                sizes="(min-width: 80rem) 740px, (min-width: 64rem) 58vw, 100vw"
                width={islandLarge.width}
                height={islandLarge.height}
                loading="lazy"
                alt="Satellite view of Jeju Island: an oval of green and brown fields around the dark slopes of Hallasan, in a deep blue sea"
                className="h-[clamp(16rem,36vw,32rem)] w-full bg-surface object-cover object-center lg:col-span-7"
              />
              {/* eslint-disable-next-line @next/next/no-img-element -- as above */}
              <img
                src={baengnokdamLarge.src}
                srcSet={`${baengnokdamSmall.src} ${baengnokdamSmall.width}w, ${baengnokdamLarge.src} ${baengnokdamLarge.width}w`}
                sizes="(min-width: 80rem) 520px, 42vw"
                width={baengnokdamLarge.width}
                height={baengnokdamLarge.height}
                loading="lazy"
                alt="The snow-covered crater of Baengnokdam on the summit of Hallasan under a clear blue sky"
                className="h-[clamp(16rem,36vw,32rem)] w-full bg-surface object-cover object-[50%_60%] max-lg:hidden lg:col-span-5"
              />
            </div>
            <figcaption className="pt-2 text-xs text-muted">
              Jeju from space, a{" "}
              <a href="https://commons.wikimedia.org/wiki/File:Jeju_Island.jpg" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                Landsat image
              </a>{" "}
              by Robert Simmon, NASA Earth Observatory, public domain
              <span className="max-lg:hidden">
                . Baengnokdam, the summit crater of Hallasan, photo{" "}
                <a href="https://commons.wikimedia.org/wiki/File:Baengnokdam_(2025-01)_3.jpg" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  Sadopaul
                </a>
                , CC BY 4.0
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <section aria-labelledby="brand-when" className="mt-16 lg:mt-24">
          <h2 id="brand-when" className="text-2xl sm:text-3xl">
            In this guide
          </h2>
          <div className="mt-6">
            {WHEN.map((w) => (
              <div key={w.title} className="grid gap-x-12 gap-y-2 border-t border-foreground py-6 lg:grid-cols-12">
                <h3 className="text-xl font-semibold lg:col-span-3">{w.title}</h3>
                <ul className="grid gap-x-12 gap-y-5 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-3">
                  {w.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="group block">
                        <span className="font-medium group-hover:underline group-hover:underline-offset-4">{l.title}</span>
                        <span className="mt-0.5 block text-sm text-muted">{l.text}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="brand-indico" className="mt-16 mb-16 border-t border-foreground pt-6 lg:mt-24 lg:mb-24 lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-3">
            <h2 id="brand-indico" className="text-xl">
              On Indico
            </h2>
            <p className="mt-2 text-sm text-muted">Registration, abstracts, the program and deadlines. Indico takes precedence.</p>
          </div>
          <div className="mt-4 lg:col-span-9 lg:mt-0">
            <ul className="flex flex-wrap gap-x-8 gap-y-2">
              {INDICO_KEY_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noreferrer" className="inline-block py-1 underline decoration-border underline-offset-4 hover:decoration-foreground">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <details className="group mt-4">
              <summary className="cursor-pointer py-1 text-sm text-muted hover:text-foreground">All Indico pages</summary>
              <div className="mt-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {INDICO_GROUPS.map((g) => (
                  <div key={g.title}>
                    <h3 className="text-sm font-semibold">{g.title}</h3>
                    <ul className="mt-1">
                      {g.links.map((l) => (
                        <li key={l.href}>
                          <a href={l.href} target="_blank" rel="noreferrer" className="block py-1 text-sm hover:underline hover:underline-offset-4">
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
            <p className="mt-6 text-sm text-muted">
              Questions about registration or accommodation:{" "}
              <a href={`mailto:${SITE.email}`} className="underline underline-offset-4">
                {SITE.email}
              </a>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
