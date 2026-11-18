import type { Metadata } from "next";
import Link from "next/link";
import { TaxiCard } from "@/components/TaxiCard";
import { INDICO_ACCOMMODATION, INDICO_VENUE } from "@/data/indico-links";

export const metadata: Metadata = {
  title: "Getting there",
  description: "From Jeju International Airport (CJU) to ICC Jeju: bus and taxi compared.",
};

// Fares and times follow the Indico venue page (INDICO_VENUE), which takes precedence. No rental
// car option: renting is hard for many foreign visitors (permit rules), so the guide doesn't suggest it.
const OPTIONS = [
  {
    title: "Airport Limousine Bus 600",
    time: "≈ 60 min",
    cost: "≈ ₩4,500",
    best: "Best value",
    steps: [
      "Exit arrivals (1F) and find the Limousine 600 stop; buses run 06:00–21:25, every 16–40 min",
      "Pay by T-money card or credit card on boarding",
      "Get off at “ICC Jeju” (or the stop for your Jungmun hotel)",
    ],
  },
  {
    title: "Taxi",
    time: "≈ 50 min",
    cost: "≈ ₩35,000–50,000",
    best: "Door to door",
    steps: [
      "Use the taxi rank outside arrivals, or book with the Kakao T app",
      "Show the driver the Korean card below",
      "Most taxis accept foreign credit cards",
    ],
  },
];

export default function GettingTherePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10 lg:px-8">
      <p className="font-mono text-xs tracking-widest text-muted uppercase">CJU → ICC Jeju</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Getting to the venue</h1>
      <p className="mt-3 max-w-2xl text-muted">
        ICC Jeju is in the Jungmun resort area on the south coast, about 45 km from Jeju International Airport.
        Hotels are listed on the{" "}
        <a href={INDICO_ACCOMMODATION} target="_blank" rel="noreferrer" className="text-sea underline">
          Indico accommodation page
        </a>
        .
      </p>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2">
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
      <p className="mt-3 text-xs text-muted">
        Fares and times from the{" "}
        <a href={INDICO_VENUE} target="_blank" rel="noreferrer" className="underline">
          Indico venue page
        </a>
        , which has the latest details and takes precedence.
      </p>

      <div className="mt-8">
        <TaxiCard />
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
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
    </main>
  );
}
