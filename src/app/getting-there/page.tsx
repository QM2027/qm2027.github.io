import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { BrandArrival, BrandMore } from "@/components/BrandGettingThere";
import { TaxiCard } from "@/components/TaxiCard";
import { AIRPORT_KM, AIRPORT_OPTIONS as OPTIONS } from "@/data/airport";
import { INDICO_ACCOMMODATION, INDICO_VENUE } from "@/data/indico-links";

export const metadata: Metadata = {
  title: "Getting there",
  description: "From Jeju International Airport (CJU) to ICC Jeju: bus and taxi compared.",
};

export default function GettingTherePage() {
  return (
    // The brand look (?look=brand) has its own versions of the parts around the driver card
    // (BrandArrival, BrandMore); the current ones carry brand:hidden.
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10 lg:px-8 brand:max-w-none brand:px-0 brand:pt-0 brand:pb-16 sm:brand:pt-0 lg:brand:px-0 lg:brand:pb-24">
      <div className="hidden brand:block">
        <BrandArrival />
      </div>
      <PageTitle kicker="CJU → ICC Jeju" plainKicker="From Jeju International Airport (CJU)" title="Getting to the venue" className="brand:hidden" />
      <p className="mt-3 max-w-2xl text-muted brand:hidden">
        ICC Jeju is in the Jungmun resort area on the south coast, about {AIRPORT_KM} km from Jeju International Airport.
        Hotels are listed on the{" "}
        <a href={INDICO_ACCOMMODATION} target="_blank" rel="noreferrer" className="text-sea underline">
          Indico accommodation page
        </a>
        .
      </p>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2 brand:hidden">
        {OPTIONS.map((o) => (
          <li key={o.title} className="flex flex-col rounded-md border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-sea/10 px-2.5 py-0.5 text-xs font-medium text-sea">{o.best}</span>
            </div>
            <h2 className="mt-3 text-lg font-semibold">{o.title}</h2>
            <dl className="mt-2 flex gap-4 text-sm">
              <div><dt className="text-muted">Time</dt><dd className="font-medium">{o.time}</dd></div>
              <div><dt className="text-muted">Cost</dt><dd className="font-medium">{o.cost}</dd></div>
            </dl>
            <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-muted">
              {o.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-muted brand:hidden">
        Fares and times from the{" "}
        <a href={INDICO_VENUE} target="_blank" rel="noreferrer" className="underline">
          Indico venue page
        </a>
        , which has the latest details and takes precedence.
      </p>

      <div className="mt-8 brand:mx-auto brand:mt-20 brand:max-w-7xl brand:px-4 lg:brand:mt-28 lg:brand:px-8">
        <TaxiCard />
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 brand:hidden">
        <div className="rounded-md border border-border bg-surface p-5">
          <h2 className="font-semibold">Apps worth installing</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li><b className="text-foreground">Kakao Map / Naver Map</b>: bus routes and walking directions</li>
            <li><b className="text-foreground">Kakao T</b>: taxis (works with foreign cards)</li>
            <li><b className="text-foreground">Papago</b>: translation, including from photos</li>
          </ul>
        </div>
        <div className="rounded-md border border-border bg-surface p-5">
          <h2 className="font-semibold">Around the island</h2>
          <p className="mt-2 text-sm text-muted">
            See suggested courses with distances from the venue on the{" "}
            <Link href="/explore/?tab=courses" className="text-sea underline">Explore map</Link>.
          </p>
        </div>
      </section>
      <div className="hidden brand:block">
        <BrandMore />
      </div>
    </main>
  );
}
