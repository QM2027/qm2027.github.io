"use client";

import { useState } from "react";
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

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-semibold">Currency</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3">
          <span className="text-muted">₩</span>
          <input
            inputMode="numeric"
            value={krw}
            onChange={(e) => setKrw(e.target.value.replace(/[^\d]/g, ""))}
            className="w-full min-w-0 bg-transparent outline-none"
            aria-label="Amount in Korean won"
          />
        </label>
        <span aria-hidden>→</span>
        <select value={cur} onChange={(e) => setCur(e.target.value)} className="min-h-11 rounded-xl border border-border bg-background px-3" aria-label="Currency">
          {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums">
        {rate ? `${fmt(Number(krw || 0) * rate)} ${cur}` : rates.status === "loading" ? "…" : "Rates unavailable"}
      </p>
      {rate && (
        <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {PRICES.map((p) => (
            <li key={p.label} className="rounded-xl bg-background p-2">
              <span className="block text-xs text-muted">{p.label}</span>
              ₩{p.krw.toLocaleString("en")} ≈ {fmt(p.krw * rate)} {cur}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted">
        {rates.status === "ok" ? `ECB reference rate of ${rates.data.date}, via Frankfurter. ` : ""}
        Sample prices are typical, not quotes.
      </p>
    </section>
  );
}
