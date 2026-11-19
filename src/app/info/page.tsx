import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_FIELD } from "@/components/PageTitle";
import { EMERGENCY } from "@/data/emergency";
import { INDICO_CONDUCT, INDICO_GROUPS, INDICO_KEY_LINKS } from "@/data/indico-links";
import { SITE } from "@/lib/site";

// The conference-app edition's Info tab (preview). On-site practicalities live here; official texts
// stay on Indico and are linked, not copied.

export const metadata: Metadata = {
  title: "Information",
  description: "Help and emergency numbers, the Code of Conduct, practical information at the venue and links to Indico.",
  // Preview of the conference-app edition: not linked from the visitor guide.
  robots: { index: false },
};

/** Current look: a small mono caps label. Plain look: a heading at heading size. */
const sectionHead =
  "font-mono text-xs font-normal tracking-wider text-muted uppercase plain:font-serif plain:text-xl plain:font-semibold plain:tracking-normal plain:text-foreground plain:normal-case";

/** Brand look: a ruled row, the heading in three columns of twelve and the content in nine. */
const brandRow = "brand:mt-16 brand:pt-6 lg:brand:mt-20 lg:brand:grid lg:brand:grid-cols-12 lg:brand:gap-x-12";

/** Filled in once the organizing committee confirms the details. */
const ON_SITE = ["Wi-Fi", "Cloakroom and luggage", "Lost and found", "First aid", "Prayer and quiet room", "Badge"];


export default function InfoPage() {
  return (
    // Brand look: the title and the help numbers open the page on the blue field, laid as two
    // blocks (the help section sits in the grid below the title), each running the window's width.
    <main className="mx-auto w-full max-w-7xl px-4 py-10 pb-14 lg:px-8 brand:pt-0 brand:pb-16 lg:brand:pb-24">
      <h1 className={`text-4xl ${BRAND_FIELD} brand:pt-12 brand:pb-12 sm:brand:pt-16 sm:brand:text-5xl lg:brand:pt-20 lg:brand:pb-16`}>
        Information
      </h1>

      <div className="mt-8 grid gap-x-12 lg:grid-cols-2 brand:mt-0 brand:block">
        <section
          id="help"
          aria-labelledby="help-h"
          className={`scroll-mt-24 border-t border-foreground pt-3 ${BRAND_FIELD} brand:border-brand-field-muted/40 brand:pt-6 brand:pb-10 lg:brand:grid lg:brand:grid-cols-12 lg:brand:gap-x-12 lg:brand:pb-14`}
        >
          <h2 id="help-h" className="lg:brand:col-span-3">
            <span className={sectionHead}>Help</span>
          </h2>
          <ul className="mt-2 brand:mt-5 brand:grid brand:grid-cols-2 brand:gap-x-6 brand:gap-y-6 sm:brand:grid-cols-4 lg:brand:col-span-9 lg:brand:mt-0 lg:brand:gap-x-12">
            {EMERGENCY.map((e) => (
              <li key={e.n} className="border-b border-border brand:border-b-0">
                <a
                  href={`tel:${e.n}`}
                  className="grid grid-cols-[4rem_1fr] items-baseline gap-x-3 py-3 hover:underline hover:underline-offset-4 brand:block brand:rounded-sm brand:py-0"
                >
                  <span className="font-mono text-xl tabular-nums brand:block brand:font-sans brand:text-3xl brand:font-semibold">{e.n}</span>
                  <span className="brand:mt-1 brand:block brand:text-sm brand:text-muted">{e.what}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted brand:mt-8 lg:brand:col-span-9 lg:brand:col-start-4">
            Hospitals are on the{" "}
            <Link href="/explore/" className="underline underline-offset-4">
              map
            </Link>
            .
          </p>
        </section>

        <section id="conduct" aria-labelledby="conduct-h" className={`mt-10 scroll-mt-24 border-t border-foreground pt-3 lg:mt-0 ${brandRow}`}>
          <h2 id="conduct-h" className="lg:brand:col-span-3">
            <span className={sectionHead}>Code of Conduct</span>
          </h2>
          {/* A box only in the brand look's grid; elsewhere its margins pass through as before. */}
          <div className="lg:brand:col-span-9 lg:brand:[&>:first-child]:mt-0">
            <p className="mt-3 max-w-prose">
              {SITE.shortName} is committed to a welcoming conference for everyone. If you experience or witness
              behaviour that breaks the Code of Conduct, you can contact the ombudsperson.
            </p>
            <p className="mt-3 text-sm text-muted">Ombudsperson contact details will be listed here.</p>
            <a
              href={INDICO_CONDUCT}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm underline decoration-border underline-offset-4 hover:decoration-foreground"
            >
              Read the Code of Conduct on Indico<span className="plain:hidden"> ↗</span>
            </a>
          </div>
        </section>

        <section aria-labelledby="onsite-h" className={`mt-10 border-t border-foreground pt-3 ${brandRow}`}>
          <h2 id="onsite-h" className="lg:brand:col-span-3">
            <span className={sectionHead}>At the venue</span>
          </h2>
          <ul className="mt-2 brand:mt-4 brand:grid brand:gap-x-12 brand:gap-y-5 sm:brand:grid-cols-2 lg:brand:col-span-9 lg:brand:mt-0 xl:brand:grid-cols-3">
            <li className="border-b border-border py-3 brand:border-b-0 brand:py-0">
              <Link href="/venue/?find=registration" className="font-medium hover:underline hover:underline-offset-4">
                Registration desk
              </Link>
              <span className="block text-sm text-muted brand:mt-0.5">On the venue plan</span>
            </li>
            {ON_SITE.map((item) => (
              <li key={item} className="border-b border-border py-3 brand:border-b-0 brand:py-0">
                <span className="font-medium">{item}</span>
                <span className="block text-sm text-muted brand:mt-0.5">Details to come from the organizing committee</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="contact-h" className={`mt-10 border-t border-foreground pt-3 ${brandRow}`}>
          <h2 id="contact-h" className="lg:brand:col-span-3">
            <span className={sectionHead}>Contact</span>
          </h2>
          <p className="mt-3 brand:mt-4 lg:brand:col-span-9 lg:brand:mt-0">
            Secretariat:{" "}
            <a href={`mailto:${SITE.email}`} className="underline underline-offset-4">
              {SITE.email}
            </a>
          </p>
        </section>
      </div>

      <section aria-labelledby="indico-h" className="mt-12 brand:hidden">
        <h2 id="indico-h" className="text-2xl">
          On Indico
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Registration, abstracts, deadlines and the official documents are on Indico.
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
      </section>

      {/* Brand look: Indico as on the brand home, the key pages first and every page behind a disclosure. */}
      <section
        aria-labelledby="brand-indico-h"
        className="mt-16 hidden border-t border-foreground pt-6 brand:block lg:mt-20 lg:grid-cols-12 lg:gap-x-12 lg:brand:grid"
      >
        <div className="lg:col-span-3">
          <h2 id="brand-indico-h" className="text-xl">
            On Indico
          </h2>
          <p className="mt-2 text-sm text-muted">Registration, abstracts, deadlines and the official documents are on Indico.</p>
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
          <details className="mt-4">
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
        </div>
      </section>
    </main>
  );
}
