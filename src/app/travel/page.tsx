import type { Metadata } from "next";
import Link from "next/link";
import { CurrencyConverter } from "@/components/travel/CurrencyConverter";
import { PhraseBook } from "@/components/travel/PhraseBook";
import { WeatherCard } from "@/components/travel/WeatherCard";

export const metadata: Metadata = {
  title: "Travel toolkit",
  description: "Live Jeju weather, currency converter, emergency numbers, Korean phrase cards and practical tips.",
};

const EMERGENCY = [
  { n: "119", what: "Fire & ambulance" },
  { n: "112", what: "Police" },
  { n: "1330", what: "Tourist hotline (English, 24 h)" },
  { n: "1345", what: "Immigration contact center" },
];

const LINKS = [
  { href: "/getting-there/", title: "Airport → venue", text: "Bus, taxi and car compared, plus a taxi card." },
  { href: "/explore/plan/", title: "Free-time planner", text: "A loop from the venue that fits your time." },
  { href: "/explore/hallasan/", title: "Hallasan trails", text: "Profiles, reservations and March conditions." },
  { href: "/explore/companions/", title: "Companions & families", text: "Kid-friendly and step-free ideas." },
];

const PRACTICAL: { title: string; items: string[] }[] = [
  {
    title: "Money",
    items: [
      "Credit cards are accepted almost everywhere, including taxis and small cafés.",
      "Some market stalls and rural buses prefer cash. ATMs marked “Global” take foreign cards.",
      "No tipping. Prices include tax.",
      "Tourists can get an immediate tax refund in stores showing “Tax Free” for purchases from ₩15,000. Bring your passport.",
    ],
  },
  {
    title: "Getting around",
    items: [
      "Buses accept T-money cards, which convenience stores sell and top up. Credit card tap-to-pay often works too.",
      "Use Kakao Map or Naver Map for routes; Google Maps can't do walking or driving directions in Korea.",
      "Kakao T books taxis with a foreign card. Taxis are plentiful in Jungmun and at the airport.",
      "Driving requires an International Driving Permit (1949 Geneva convention).",
    ],
  },
  {
    title: "Phone & internet",
    items: [
      "eSIM and prepaid SIM data plans are sold online and at the airport.",
      "Free Wi-Fi is everywhere, including buses and many public places.",
      "Install Papago for translation, including from photos of menus and signs.",
    ],
  },
  {
    title: "Power & essentials",
    items: [
      "220 V, 60 Hz, with Type C/F (European round-pin) sockets.",
      "Convenience stores are open 24 h and sell basics, medicine for colds and adapters.",
      "Tap water is safe, but most people drink filtered or bottled water.",
      "Bring a windproof layer. Jeju's coast is windy in March.",
    ],
  },
  {
    title: "Entry to Korea",
    items: [
      "Check visa or K-ETA requirements for your passport well in advance on the official Korean government sites.",
      "Invitation letters for visa applications are arranged through the conference. See Indico registration.",
      "Jeju has its own visa-free entry scheme for some nationalities flying directly into Jeju. Check if it applies to you.",
    ],
  },
  {
    title: "Souvenirs",
    items: [
      "Hallabong and tangerine chocolates, O'sulloc green tea, omegi rice cakes and Jeju-made cosmetics.",
      "Citrus boxes can be shipped domestically; agricultural products usually can't go through foreign customs.",
      "Duty-free shops are in Jeju City and at the airport (departures).",
    ],
  },
];

export default function TravelPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
      <p className="font-mono text-xs tracking-widest text-muted uppercase">Practical Jeju</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Travel toolkit</h1>

      <section aria-label="Emergency numbers" className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {EMERGENCY.map((e) => (
          <a key={e.n} href={`tel:${e.n}`} className="flex items-center gap-3 rounded-md border border-border bg-surface p-3 hover:border-tangerine">
            <span className="text-2xl font-bold tabular-nums text-tangerine">{e.n}</span>
            <span className="text-sm leading-tight">{e.what}</span>
          </a>
        ))}
      </section>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="flex h-full items-start gap-3 rounded-md bg-surface p-4 hover:bg-border/60">
              <span>
                <span className="block font-semibold">{l.title}</span>
                <span className="block text-sm text-muted">{l.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <WeatherCard />
        <CurrencyConverter />
      </div>

      <div className="mt-4">
        <PhraseBook />
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Good to know</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRACTICAL.map((g) => (
            <div key={g.title} className="rounded-md border border-border bg-surface p-5">
              <h3 className="font-semibold">{g.title}</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted">
                {g.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Rules and prices change. Confirm entry requirements and tax-refund thresholds before you travel.</p>
      </section>
    </main>
  );
}
