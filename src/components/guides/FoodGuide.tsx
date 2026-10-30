"use client";

import { useState } from "react";
import { ShowCard } from "@/components/ShowCard";
import { DIETS, DISHES, PHRASES, type Diet, type Phrase } from "@/data/food";
import { useLocalSet } from "@/lib/use-local-set";

const DIET_KEYS = Object.keys(DIETS) as Diet[];

export function FoodGuide() {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [tried, toggleTried] = useLocalSet("qm2027:food-tried");
  const [shown, setShown] = useState<Phrase>();

  const dishes = DISHES.filter((d) => diets.every((x) => d.fits.includes(x)));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <div className="flex flex-wrap items-center gap-2">
          {DIET_KEYS.map((d) => (
            <button
              key={d}
              onClick={() => setDiets((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]))}
              aria-pressed={diets.includes(d)}
              className="min-h-10 rounded-full border border-border px-4 text-sm aria-pressed:border-transparent aria-pressed:bg-foreground aria-pressed:text-background"
            >
              {DIETS[d]}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          Tried {DISHES.filter((d) => tried.has(d.id)).length} of {DISHES.length} · {dishes.length} shown
        </p>
        {diets.length > 0 && (
          <p className="mt-2 rounded-xl bg-canola/15 p-3 text-sm">
            Many Korean dishes use anchovy broth, fish sauce or pork stock, even when they look vegetable-only. Show
            a phrase card to confirm.
          </p>
        )}

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {dishes.map((d) => {
            const done = tried.has(d.id);
            return (
              <li key={d.id} className="flex flex-col rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl" aria-hidden>{d.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{d.name}</h3>
                    <p className="text-sm text-muted" lang="ko">{d.nameKo}{d.spicy && " · 🌶"}</p>
                  </div>
                  <button
                    onClick={() => toggleTried(d.id)}
                    aria-pressed={done}
                    aria-label={done ? `Mark ${d.name} as not tried` : `Mark ${d.name} as tried`}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-lg aria-pressed:border-transparent aria-pressed:bg-sea aria-pressed:text-white"
                  >
                    {done ? "✓" : "＋"}
                  </button>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{d.text}</p>
                <p className="mt-auto pt-2 text-xs text-muted">📍 {d.where}</p>
              </li>
            );
          })}
        </ul>
        {dishes.length === 0 && <p className="mt-6 text-muted">No dishes match every filter. Try removing one.</p>}
      </section>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-semibold">Show-the-staff phrases</h2>
          <p className="mt-1 text-sm text-muted">Tap a phrase to show it full screen.</p>
          <ul className="mt-3 space-y-2">
            {PHRASES.map((p) => (
              <li key={p.id}>
                <button onClick={() => setShown(p)} className="w-full rounded-xl border border-border px-3 py-2.5 text-left hover:border-sea">
                  <span className="block text-sm font-medium">{p.en}</span>
                  <span className="block text-sm text-muted" lang="ko">{p.ko}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {shown && <ShowCard main={shown.ko} english={shown.en} onClose={() => setShown(undefined)} />}
    </div>
  );
}
