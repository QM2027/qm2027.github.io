import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/data/guides";

// The conference-app edition's Jeju tab (preview): the visitor guide's contents, minus the
// conference pages that have their own tabs there.

export const metadata: Metadata = {
  title: "Jeju",
  description: "Map, getting to the venue, travel toolkit and guides to Jeju for the conference week.",
  // Preview of the conference-app edition: not linked from the visitor guide.
  robots: { index: false },
};

const CONTENTS = [
  { href: "/explore/", title: "Map of Jeju", text: "Sights, food, transport and hospitals, with distances from the venue" },
  { href: "/getting-there/", title: "Airport to venue", text: "Bus or taxi, and a card in Korean for the driver" },
  { href: "/travel/", title: "Travel toolkit", text: "Weather, money, phone, emergency numbers" },
  ...GUIDES.map((g) => ({ href: g.href, title: g.title, text: g.text })),
];

export default function JejuPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 pb-14 lg:px-8">
      <h1 className="text-4xl">Jeju</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Getting around the island and what to do before, between and after the sessions.
      </p>
      <ol className="mt-8 grid border-t border-border md:grid-cols-2 md:gap-x-12">
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
    </main>
  );
}
