import type { Metadata } from "next";
import Link from "next/link";
import { EMERGENCY } from "@/data/emergency";
import { INDICO_CONDUCT, INDICO_GROUPS } from "@/data/indico-links";
import { SITE } from "@/lib/site";

// The conference-app edition's Info tab (preview). On-site practicalities live here; official texts
// stay on Indico and are linked, not copied.

export const metadata: Metadata = {
  title: "Information",
  description: "Help and emergency numbers, the Code of Conduct, practical information at the venue and links to Indico.",
  // Preview of the conference-app edition: not linked from the visitor guide.
  robots: { index: false },
};

/** Filled in once the organizing committee confirms the details. */
const ON_SITE = ["Wi-Fi", "Cloakroom and luggage", "Lost and found", "First aid", "Prayer and quiet room", "Badge"];

export default function InfoPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 pb-14 lg:px-8">
      <h1 className="text-4xl">Information</h1>

      <div className="mt-8 grid gap-x-12 lg:grid-cols-2">
        <section id="help" aria-labelledby="help-h" className="scroll-mt-24 border-t border-foreground pt-3">
          <h2 id="help-h">
            <span className="font-mono text-xs font-normal tracking-wider text-muted uppercase">Help</span>
          </h2>
          <ul className="mt-2">
            {EMERGENCY.map((e) => (
              <li key={e.n} className="border-b border-border">
                <a href={`tel:${e.n}`} className="grid grid-cols-[4rem_1fr] items-baseline gap-x-3 py-3 hover:underline hover:underline-offset-4">
                  <span className="font-mono text-xl tabular-nums">{e.n}</span>
                  <span>{e.what}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">
            Hospitals are on the{" "}
            <Link href="/explore/" className="underline underline-offset-4">
              map
            </Link>
            .
          </p>
        </section>

        <section id="conduct" aria-labelledby="conduct-h" className="mt-10 scroll-mt-24 border-t border-foreground pt-3 lg:mt-0">
          <h2 id="conduct-h">
            <span className="font-mono text-xs font-normal tracking-wider text-muted uppercase">Code of Conduct</span>
          </h2>
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
            Read the Code of Conduct on Indico ↗
          </a>
        </section>

        <section aria-labelledby="onsite-h" className="mt-10 border-t border-foreground pt-3">
          <h2 id="onsite-h">
            <span className="font-mono text-xs font-normal tracking-wider text-muted uppercase">At the venue</span>
          </h2>
          <ul className="mt-2">
            <li className="border-b border-border py-3">
              <Link href="/venue/?find=registration" className="font-medium hover:underline hover:underline-offset-4">
                Registration desk
              </Link>
              <span className="block text-sm text-muted">On the venue plan</span>
            </li>
            {ON_SITE.map((item) => (
              <li key={item} className="border-b border-border py-3">
                <span className="font-medium">{item}</span>
                <span className="block text-sm text-muted">Details to come from the organizing committee</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="contact-h" className="mt-10 border-t border-foreground pt-3">
          <h2 id="contact-h">
            <span className="font-mono text-xs font-normal tracking-wider text-muted uppercase">Contact</span>
          </h2>
          <p className="mt-3">
            Secretariat:{" "}
            <a href={`mailto:${SITE.email}`} className="underline underline-offset-4">
              {SITE.email}
            </a>
          </p>
        </section>
      </div>

      <section aria-labelledby="indico-h" className="mt-12">
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
    </main>
  );
}
