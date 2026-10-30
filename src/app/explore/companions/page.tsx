import type { Metadata } from "next";
import Link from "next/link";
import { GuideHeader } from "@/components/GuideNav";
import { PlacesMap } from "@/components/map/PlacesMap";
import { INDICO_GROUPS } from "@/data/indico-links";
import { CATEGORIES, PLACES, type Place } from "@/data/places";
import { ICC, distanceKm, formatDistance } from "@/lib/geo";

export const metadata: Metadata = {
  title: "Companions & families",
  description: "Ideas for partners and children while the sessions run: kid-friendly and step-free places near ICC Jeju.",
};

const childCare = INDICO_GROUPS.flatMap((g) => g.links).find((l) => l.label === "Child Care Services")!;
const byDistance = (a: Place, b: Place) => distanceKm(ICC, a) - distanceKm(ICC, b);
const KIDS = PLACES.filter((p) => p.tags?.includes("family")).sort(byDistance);
const STEP_FREE = PLACES.filter((p) => p.tags?.includes("accessible")).sort(byDistance);

const PRESETS = [
  { href: "/explore/plan/?t=240&mode=walk&family=1", title: "Half day on foot", text: "Botanical garden, teddy bears and the beach, all walkable from the venue." },
  { href: "/explore/plan/?t=240&mode=taxi&family=1&like=culture", title: "Half day by taxi", text: "Museums and markets in Seogwipo, back for the evening." },
  { href: "/explore/plan/?t=480&mode=car&family=1", title: "Full day with a car", text: "East coast: lava tube, aquarium and haenyeo museum." },
];

const TIPS = [
  ["Strollers", "Coastal paths and waterfalls often have steps. The resort roads in Jungmun are smooth, and most museums lend strollers or wheelchairs."],
  ["Supplies", "Convenience stores (GS25, CU, 7-Eleven) stock diapers, formula and baby food. For more, try the large E-mart and Lotte Mart stores in Seogwipo and Jeju City."],
  ["Taxis & car seats", "Taxis don't carry child seats. Rental companies offer them on request, so book ahead."],
  ["Kids' prices", "Children usually pay less for attractions and buses, and under-3s often go free. Carry a passport copy for age proof."],
  ["Medical", "Pharmacies (약국) are common. For emergencies call 119, or use the 24-hour ER at Seogwipo Medical Center."],
];

function PlaceRow({ p }: { p: Place }) {
  return (
    <li>
      <Link href={`/explore/?place=${p.id}`} className="flex items-start gap-3 py-2.5 hover:text-sea">
        <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: CATEGORIES[p.category].color }} />
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{p.name}{p.indoor && " ☂"}</span>
          <span className="block truncate text-sm text-muted">{p.summary}</span>
        </span>
        <span className="shrink-0 text-xs text-muted">{formatDistance(distanceKm(ICC, p))}</span>
      </Link>
    </li>
  );
}

export default function CompanionsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
      <GuideHeader kicker="While the sessions run" title="Companions & families">
        Travelling with a partner or children? These places work well with kids or without steps, and the planner
        presets below build a half or full day around them. Child care during the conference is described on{" "}
        <a href={childCare.href} target="_blank" rel="noreferrer" className="text-sea underline">Indico</a>.
      </GuideHeader>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {PRESETS.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="block h-full rounded-2xl bg-canola/10 p-4 hover:bg-canola/20">
              <span className="block font-semibold">{p.title} →</span>
              <span className="mt-1 block text-sm text-muted">{p.text}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-[1fr_1fr_400px]">
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-semibold">👨‍👩‍👧 Good with kids</h2>
          <ul className="mt-2 divide-y divide-border">{KIDS.map((p) => <PlaceRow key={p.id} p={p} />)}</ul>
        </section>
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-semibold">♿ Step-free main route</h2>
          <ul className="mt-2 divide-y divide-border">{STEP_FREE.map((p) => <PlaceRow key={p.id} p={p} />)}</ul>
          <p className="mt-2 text-xs text-muted">Step-free means the main visitor route, as far as we know. Call ahead if it matters.</p>
        </section>
        <div className="h-80 overflow-hidden rounded-2xl border border-border md:col-span-2 lg:col-span-1 lg:sticky lg:top-20 lg:h-[32rem]">
          <PlacesMap ids={[...new Set([...KIDS, ...STEP_FREE].map((p) => p.id))]} />
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Practical tips</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TIPS.map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-border bg-surface p-4">
              <dt className="font-medium">{title}</dt>
              <dd className="mt-1 text-sm text-muted">{text}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
