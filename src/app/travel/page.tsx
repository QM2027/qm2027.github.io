import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { CurrencyConverter } from "@/components/travel/CurrencyConverter";
import { PhraseBook } from "@/components/travel/PhraseBook";
import { WeatherCard } from "@/components/travel/WeatherCard";
import { EMERGENCY } from "@/data/emergency";
import { PLAIN_OPEN_PANEL } from "@/lib/look";

export const metadata: Metadata = {
  title: "Travel toolkit",
  description: "Live Jeju weather, currency converter, emergency numbers, Korean phrase cards and practical tips.",
};

const LINKS: { href: string; title: string; plainTitle?: string; text: string }[] = [
  { href: "/getting-there/", title: "Airport → venue", plainTitle: "Airport to venue", text: "Bus, taxi and car compared, plus a taxi card." },
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
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8 brand:max-w-none brand:px-0 brand:pt-0 brand:pb-16 brand:sm:pt-0 brand:lg:px-0 brand:lg:pb-24">
      {/* Brand look: the page opens on a band of the logo blue, full width, holding the title and
          the four numbers a visitor may need in a hurry. */}
      <div className="hidden bg-brand-field text-on-brand-field brand:block">
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-10 sm:pt-16 lg:px-8 lg:pt-20 lg:pb-14">
          <h1 className="text-4xl sm:text-5xl">Travel toolkit</h1>
          <p className="mt-3 max-w-xl text-lg text-brand-field-muted">Weather, money, phrases and the numbers to call</p>

          <section aria-labelledby="brand-emergency" className="mt-12 border-t border-brand-field-muted/40 pt-6 lg:mt-16 lg:grid lg:grid-cols-12 lg:gap-x-12">
            <h2 id="brand-emergency" className="text-lg lg:col-span-3">
              Emergency numbers
            </h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 lg:col-span-9 lg:mt-0 lg:gap-x-12">
              {EMERGENCY.map((e) => (
                <li key={e.n}>
                  <a
                    href={`tel:${e.n}`}
                    className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-brand-field"
                  >
                    <span className="block text-3xl font-semibold tabular-nums underline decoration-transparent underline-offset-4 group-hover:decoration-on-brand-field">
                      {e.n}
                    </span>
                    <span className="mt-1 block text-sm text-brand-field-muted">{e.what}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="brand:mx-auto brand:max-w-7xl brand:px-4 brand:lg:px-8">
        <PageTitle kicker="Practical Jeju" plainKicker="Weather, money, phrases and the numbers to call" title="Travel toolkit" className="brand:hidden" />

        <section aria-label="Emergency numbers" className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 brand:hidden">
          {EMERGENCY.map((e) => (
            <a key={e.n} href={`tel:${e.n}`} className="flex items-center gap-3 rounded-md border border-border bg-surface p-3 hover:border-tangerine">
              <span className="text-2xl font-bold tabular-nums text-tangerine">{e.n}</span>
              <span className="text-sm leading-tight">{e.what}</span>
            </a>
          ))}
        </section>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 brand:hidden">
          {LINKS.map((l) => (
            <li key={l.href}>
              {/* Plain look: four equal filled tiles read as a template; they become rows under a rule. */}
              <Link
                href={l.href}
                className="group flex h-full items-start gap-3 rounded-md bg-surface p-4 hover:bg-border/60 plain:rounded-none plain:border-t plain:border-foreground plain:bg-transparent plain:px-0 plain:pt-3 plain:pb-0 plain:hover:bg-transparent"
              >
                <span>
                  <span className="block font-semibold plain:group-hover:underline plain:group-hover:underline-offset-4">
                    {l.plainTitle ? (
                      <>
                        <span className="plain:hidden">{l.title}</span>
                        <span className="hidden plain:inline">{l.plainTitle}</span>
                      </>
                    ) : (
                      l.title
                    )}
                  </span>
                  <span className="block text-sm text-muted">{l.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Brand look: the tools stack as full-width sections, each heading in three columns of twelve. */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2 plain:mt-12 plain:gap-x-12 plain:gap-y-12 brand:mt-12 brand:gap-y-16 brand:lg:mt-16 brand:lg:grid-cols-1 brand:lg:gap-y-24">
          <WeatherCard />
          <CurrencyConverter />
        </div>

        <div className="mt-4 plain:mt-12 brand:mt-16 brand:lg:mt-24">
          <PhraseBook />
        </div>

        <section aria-labelledby="brand-know" className="mt-20 hidden brand:block lg:mt-28">
          <h2 id="brand-know" className="text-2xl sm:text-3xl">
            Good to know
          </h2>
          <div className="mt-6">
            {PRACTICAL.map((g) => (
              <div key={g.title} className="grid gap-x-12 gap-y-3 border-t border-foreground py-6 lg:grid-cols-12">
                <h3 className="text-xl font-semibold lg:col-span-3">{g.title}</h3>
                <ul className="grid gap-x-12 gap-y-3 leading-relaxed sm:grid-cols-2 lg:col-span-9">
                  {g.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="border-t border-border pt-4 text-sm text-muted">Rules and prices change. Confirm entry requirements and tax-refund thresholds before you travel.</p>
        </section>

        <section aria-labelledby="brand-more" className="mt-16 hidden border-t border-foreground pt-6 brand:block lg:mt-24 lg:grid-cols-12 lg:gap-x-12 brand:lg:grid">
          <h2 id="brand-more" className="text-xl lg:col-span-3">
            More in this guide
          </h2>
          <ul className="mt-4 grid gap-x-12 gap-y-5 sm:grid-cols-2 lg:col-span-9 lg:mt-0">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="group block">
                  <span className="font-medium group-hover:underline group-hover:underline-offset-4">{l.plainTitle ?? l.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{l.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 plain:mt-16 brand:hidden">
          <h2 className="text-xl font-semibold plain:text-2xl">Good to know</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 plain:mt-6 plain:gap-x-12 plain:gap-y-10">
            {PRACTICAL.map((g) => (
              <div key={g.title} className={`rounded-md border border-border bg-surface p-5 ${PLAIN_OPEN_PANEL}`}>
                <h3 className="font-semibold">{g.title}</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted">
                  {g.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Rules and prices change. Confirm entry requirements and tax-refund thresholds before you travel.</p>
        </section>
      </div>
    </main>
  );
}
