import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_FIELD } from "@/components/PageTitle";
import { GUIDES } from "@/data/guides";

// The conference-app edition's Jeju tab (preview): the visitor guide's contents, minus the
// conference pages that have their own tabs there.

export const metadata: Metadata = {
  title: "Jeju",
  description: "Map, getting to the venue, travel toolkit and guides to Jeju for the conference week.",
  // Preview of the conference-app edition: not linked from the visitor guide.
  robots: { index: false },
};

type Entry = { href: string; title: string; text: string };

const CONTENTS: Entry[] = [
  { href: "/explore/", title: "Map of Jeju", text: "Sights, food, transport and hospitals, with distances from the venue" },
  { href: "/getting-there/", title: "Airport to venue", text: "Bus or taxi, and a card in Korean for the driver" },
  { href: "/travel/", title: "Travel toolkit", text: "Weather, money, phone, emergency numbers" },
  ...GUIDES.map((g) => ({ href: g.href, title: g.title, text: g.text })),
];

/** Brand look: the same pages grouped by when they are needed, as on the visitor guide's brand home.
    Free time takes every page the other groups do not name, so none drops out. */
const entry = (href: string) => {
  const e = CONTENTS.find((c) => c.href === href);
  if (!e) throw new Error(`Jeju page: no entry at ${href}`);
  return e;
};
const BEFORE = ["/travel/", "/explore/korea/", "/explore/companions/"].map(entry);
const ARRIVAL = ["/getting-there/", "/explore/"].map(entry);
const WHEN: { title: string; links: Entry[] }[] = [
  { title: "Before you go", links: BEFORE },
  { title: "On arrival", links: ARRIVAL },
  { title: "Free time", links: CONTENTS.filter((c) => ![...BEFORE, ...ARRIVAL].includes(c)) },
];

export default function JejuPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 pb-14 lg:px-8 brand:pb-16 lg:brand:pb-24">
      {/* Brand look: the opening on the blue field; the block cancels the page's top padding. */}
      <div
        className={`${BRAND_FIELD} brand:-mt-10 brand:pt-12 brand:pb-10 sm:brand:pt-16 lg:brand:grid lg:brand:grid-cols-12 lg:brand:items-end lg:brand:gap-x-12 lg:brand:pt-20 lg:brand:pb-14`}
      >
        <h1 className="text-4xl brand:leading-[1.05] sm:brand:text-5xl lg:brand:col-span-7 lg:brand:text-6xl">Jeju</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted brand:mt-4 brand:max-w-xl brand:leading-relaxed lg:brand:col-span-5 lg:brand:mt-0">
          Getting around the island and what to do before, between and after the sessions.
        </p>
      </div>
      <ol className="mt-8 grid border-t border-border md:grid-cols-2 md:gap-x-12 brand:hidden">
        {CONTENTS.map((c, i) => (
          <li key={c.href} className="border-b border-border">
            <Link href={c.href} className="group grid grid-cols-[2.5rem_1fr] gap-x-3 py-4 plain:grid-cols-1">
              <span className="font-mono text-sm text-muted tabular-nums plain:hidden">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="font-medium group-hover:underline group-hover:underline-offset-4">{c.title}</span>
                <span className="mt-0.5 block text-sm text-muted">{c.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {/* Brand look: ruled rows, the group in three columns of twelve and its pages in nine. */}
      <div className="mt-14 hidden brand:block lg:mt-20">
        {WHEN.map((w) => (
          <div key={w.title} className="grid gap-x-12 gap-y-3 border-t border-foreground py-6 lg:grid-cols-12">
            <h2 className="text-xl font-semibold lg:col-span-3">{w.title}</h2>
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
    </main>
  );
}
