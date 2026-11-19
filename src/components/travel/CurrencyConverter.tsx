"use client";

import { useState } from "react";
import { PLAIN_OPEN_PANEL, PLAIN_TILE } from "@/lib/look";
import { useFetchJson } from "@/lib/use-fetch-json";

const CURRENCIES = ["USD", "EUR", "JPY", "CNY", "GBP", "CHF", "INR", "AUD", "CAD"] as const;
// Frankfurter publishes ECB reference rates; keyless and CORS-enabled.
const RATES_URL = `https://api.frankfurter.dev/v1/latest?base=KRW&symbols=${CURRENCIES.join(",")}`;

type Rates = { date: string; rates: Record<string, number> };

const PRICES = [
  { label: "Coffee", krw: 5000 },
  { label: "Bus ride", krw: 1500 },
  { label: "Black pork dinner", krw: 30000 },
  { label: "Taxi, airport → venue", krw: 50000 },
];

export function CurrencyConverter() {
  const rates = useFetchJson<Rates>(RATES_URL);
  const [cur, setCur] = useState<string>("USD");
  const [krw, setKrw] = useState("10000");
  const rate = rates.status === "ok" ? rates.data.rates[cur] : undefined;
  const fmt = (n: number) => n.toLocaleString("en", { maximumFractionDigits: cur === "JPY" ? 0 : 2 });

  // Brand look (?look=brand): heading in three of twelve columns; in the other nine the converter
  // and its result on one side, the sample prices as ruled rows on the other.
  return (
    <section className={`rounded-md border border-border bg-surface p-5 ${PLAIN_OPEN_PANEL} brand:pt-6 brand:lg:grid brand:lg:grid-cols-12 brand:lg:gap-x-12`}>
      <h2 className="font-semibold plain:text-xl brand:lg:col-span-3">Currency</h2>
      <div className="brand:mt-4 brand:grid brand:content-start brand:gap-x-12 brand:gap-y-6 brand:md:grid-cols-2 brand:lg:col-span-9 brand:lg:mt-0">
        <div className="brand:md:col-start-1">
          <div className="mt-3 flex flex-wrap items-center gap-2 brand:mt-0">
            <label className="flex min-h-11 flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 brand:min-h-12 brand:text-lg">
              <span className="text-muted">₩</span>
              <input
                inputMode="numeric"
                value={krw}
                onChange={(e) => setKrw(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full min-w-0 bg-transparent outline-none brand:tabular-nums"
                aria-label="Amount in Korean won"
              />
            </label>
            <span aria-hidden>→</span>
            <select value={cur} onChange={(e) => setCur(e.target.value)} className="min-h-11 rounded-md border border-border bg-background px-3 brand:min-h-12 brand:text-lg" aria-label="Currency">
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums brand:mt-5 brand:text-3xl">
            {rate ? `${fmt(Number(krw || 0) * rate)} ${cur}` : rates.status === "loading" ? "…" : "Rates unavailable"}
          </p>
        </div>
        {rate && (
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm brand:mt-0 brand:grid-cols-1 brand:gap-0 brand:border-t brand:border-border brand:md:col-start-2 brand:md:row-span-2 brand:md:row-start-1">
            {PRICES.map((p) => (
              <li
                key={p.label}
                className={`rounded-md bg-background p-2 ${PLAIN_TILE} brand:flex brand:items-baseline brand:justify-between brand:gap-4 brand:rounded-none brand:border-b brand:border-border brand:bg-transparent brand:px-0 brand:py-3 brand:text-right brand:tabular-nums`}
              >
                <span className="block text-xs text-muted brand:text-left brand:text-sm">{p.label}</span>
                ₩{p.krw.toLocaleString("en")} ≈ {fmt(p.krw * rate)} {cur}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted brand:mt-0 brand:md:col-start-1">
          {rates.status === "ok" ? `ECB reference rate of ${rates.data.date}, via Frankfurter. ` : ""}
          Sample prices are typical, not quotes.
        </p>
      </div>
    </section>
  );
}
