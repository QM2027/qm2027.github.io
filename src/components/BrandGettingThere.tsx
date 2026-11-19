import Link from "next/link";
import { AIRPORT_KM, AIRPORT_OPTIONS } from "@/data/airport";
import { INDICO_ACCOMMODATION, INDICO_VENUE } from "@/data/indico-links";

/*
 * The Getting there page in the brand look (?look=brand), beside the current page in
 * src/app/getting-there/page.tsx, which hides its own versions of these parts with brand:hidden.
 * Built around one job, Jeju Airport to ICC Jeju: the two ways read side by side like a timetable,
 * time and fare as figures, then the steps. The driver card between the two parts stays shared
 * (TaxiCard restyles itself with brand: classes), so the page keeps a single #taxi anchor.
 */

const link = "underline decoration-border underline-offset-4 hover:decoration-foreground";

/** Title, where the venue is, and the bus and the taxi compared. */
export function BrandArrival() {
  return (
    <>
      {/* The page's one band: the logo's blue, the full width of the window. */}
      <header className="bg-brand-field text-on-brand-field">
        <div className="mx-auto grid max-w-7xl gap-x-12 gap-y-6 px-4 py-14 sm:py-20 lg:grid-cols-12 lg:items-end lg:px-8 lg:py-24">
          <div className="lg:col-span-7">
            <h1 className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">Getting to the venue</h1>
            <p className="mt-4 text-xl text-brand-field-muted">From Jeju International Airport (CJU)</p>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-brand-field-muted lg:col-span-5">
            ICC Jeju is in the Jungmun resort area on the south coast, about {AIRPORT_KM} km from Jeju International Airport. Hotels are
            listed on the{" "}
            <a
              href={INDICO_ACCOMMODATION}
              target="_blank"
              rel="noreferrer"
              className="text-on-brand-field underline decoration-brand-field-muted underline-offset-4 hover:decoration-on-brand-field focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-brand-field"
            >
              Indico accommodation page
            </a>
            .
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <section
          aria-labelledby="brand-ways"
          className="mt-14 border-t border-foreground pt-6 lg:mt-20 lg:grid lg:grid-cols-12 lg:gap-x-12"
        >
          <div className="lg:col-span-3">
            <h2 id="brand-ways" className="text-2xl">
              Bus or taxi
            </h2>
            <p className="mt-3 text-muted">
              <span className="font-medium text-foreground tabular-nums">{AIRPORT_KM} km</span> by road, Jeju Airport (CJU) to ICC Jeju
            </p>
          </div>

          <div className="mt-10 lg:col-span-9 lg:mt-0">
            <ul className="grid gap-x-12 gap-y-14 md:grid-cols-2">
              {AIRPORT_OPTIONS.map((o) => (
                <li key={o.title}>
                  <h3 className="text-xl font-semibold sm:text-2xl">{o.title}</h3>
                  <p className="mt-1 text-muted">{o.best}</p>
                  <dl className="mt-5">
                    <div className="border-t border-border py-3">
                      <dt className="text-sm text-muted">Time</dt>
                      <dd className="mt-1 text-2xl font-semibold tabular-nums xl:text-3xl">{o.time}</dd>
                    </div>
                    <div className="border-t border-border py-3">
                      <dt className="text-sm text-muted">Fare</dt>
                      <dd className="mt-1 text-2xl font-semibold tabular-nums xl:text-3xl">{o.cost}</dd>
                    </div>
                  </dl>
                  <ol className="border-b border-border">
                    {o.steps.map((s, i) => (
                      <li key={s} className="grid grid-cols-[1.75rem_1fr] border-t border-border py-3">
                        <span className="font-mono text-sm leading-6 text-muted tabular-nums">{i + 1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">
              Fares and times from the{" "}
              <a href={INDICO_VENUE} target="_blank" rel="noreferrer" className={link}>
                Indico venue page
              </a>
              , which has the latest details and takes precedence.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

const APPS = [
  { name: "Kakao Map / Naver Map", text: "Bus routes and walking directions" },
  { name: "Kakao T", text: "Taxis (works with foreign cards)" },
  { name: "Papago", text: "Translation, including from photos" },
];

/** Apps to install and the island beyond the venue: two quiet ruled rows. */
export function BrandMore() {
  return (
    <div className="mx-auto mt-20 max-w-7xl px-4 lg:mt-28 lg:px-8">
      <section aria-labelledby="brand-apps" className="grid gap-x-12 gap-y-4 border-t border-foreground py-6 lg:grid-cols-12">
        <h2 id="brand-apps" className="text-xl lg:col-span-3">
          Apps worth installing
        </h2>
        <ul className="grid gap-x-12 gap-y-5 sm:grid-cols-3 lg:col-span-9">
          {APPS.map((a) => (
            <li key={a.name}>
              <span className="font-medium">{a.name}</span>
              <span className="mt-0.5 block text-sm text-muted">{a.text}</span>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="brand-island" className="grid gap-x-12 gap-y-4 border-t border-foreground py-6 lg:grid-cols-12">
        <h2 id="brand-island" className="text-xl lg:col-span-3">
          Around the island
        </h2>
        <p className="text-muted lg:col-span-9">
          See suggested courses with distances from the venue on the{" "}
          <Link href="/explore/?tab=courses" className={`text-foreground ${link}`}>
            Explore map
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
