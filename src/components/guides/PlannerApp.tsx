"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { LazyMap } from "@/components/map/LazyMap";
import { CATEGORIES } from "@/data/places";
import { ICC, formatMinutes } from "@/lib/geo";
import { planTrip, type Interest, type Mode } from "@/lib/planner";
import { formatClock, sunTimes } from "@/lib/sky";
import { useFetchJson } from "@/lib/use-fetch-json";
import { FORECAST_URL, describeWeather, isBadWeather, type Forecast } from "@/lib/weather";

const DURATIONS = [
  { min: 120, label: "2 hours" },
  { min: 240, label: "Half day" },
  { min: 480, label: "Full day" },
];
const MODES: { id: Mode; label: string }[] = [
  { id: "walk", label: "On foot" },
  { id: "taxi", label: "Taxi / bus" },
  { id: "car", label: "Rental car" },
];
const INTERESTS: Interest[] = ["sight", "nature", "culture", "food"];

function choice<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function PlannerApp() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const minutes = Number(choice(params.get("t"), ["120", "240", "480"], "240"));
  const mode = choice(params.get("mode"), ["walk", "taxi", "car"], "taxi");
  const interestParam = params.get("like") ?? "";
  const weatherPref = choice(params.get("weather"), ["auto", "dry", "wet"], "auto");
  const family = params.get("family") === "1";
  const start = params.get("start") ?? "14:00";

  const forecast = useFetchJson<Forecast>(weatherPref === "auto" ? FORECAST_URL : null);
  const wet = weatherPref === "wet" || (weatherPref === "auto" && forecast.status === "ok" && isBadWeather(forecast.data));

  const interests = useMemo(
    () => interestParam.split(",").filter((x): x is Interest => (INTERESTS as string[]).includes(x)),
    [interestParam],
  );
  const [sh, sm] = start.split(":").map(Number);
  const startMin = (sh || 0) * 60 + (sm || 0);
  const plan = useMemo(
    () => planTrip({ minutes, mode, interests, wet, family, startMin }),
    [minutes, mode, interests, wet, family, startMin],
  );
  const route = useMemo(() => [ICC, ...plan.stops.map((s) => s.place), ICC], [plan]);

  function update(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  const now = new Date();
  const { sunset } = sunTimes(now.getFullYear(), now.getMonth() + 1, now.getDate(), ICC.lat, ICC.lng);
  const afterDark = plan.stops.filter((s) => !s.place.indoor && startMin + s.arrive > sunset);

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="space-y-5">
        <Field label="How much time do you have?">
          {DURATIONS.map((d) => (
            <Chip key={d.min} on={minutes === d.min} onClick={() => update({ t: String(d.min) })}>{d.label}</Chip>
          ))}
        </Field>
        <Field label="Getting around">
          {MODES.map((m) => (
            <Chip key={m.id} on={mode === m.id} onClick={() => update({ mode: m.id })}>{m.label}</Chip>
          ))}
        </Field>
        <Field label="Interested in (optional)">
          {INTERESTS.map((i) => (
            <Chip
              key={i}
              on={interests.includes(i)}
              onClick={() =>
                update({
                  like: (interests.includes(i) ? interests.filter((x) => x !== i) : [...interests, i]).join(",") || undefined,
                })
              }
            >
              {CATEGORIES[i].label}
            </Chip>
          ))}
          <Chip on={family} onClick={() => update({ family: family ? undefined : "1" })}>With kids</Chip>
        </Field>
        <Field label="Weather">
          {(["auto", "dry", "wet"] as const).map((w) => (
            <Chip key={w} on={weatherPref === w} onClick={() => update({ weather: w === "auto" ? undefined : w })}>
              {{ auto: "Live forecast", dry: "Dry", wet: "Rain or wind" }[w]}
            </Chip>
          ))}
        </Field>
        {weatherPref === "auto" && (
          <p className="rounded-md bg-surface p-3 text-sm">
            {forecast.status === "ok"
              ? `Now at the venue: ${describeWeather(forecast.data.current.weather_code).toLowerCase()}, ${Math.round(forecast.data.current.temperature_2m)}°C, wind ${Math.round(forecast.data.current.wind_speed_10m)} m/s${wet ? ", so indoor options come first." : "."}`
              : forecast.status === "loading"
                ? "Checking the forecast…"
                : "Forecast unavailable. Choose dry or rain above."}
          </p>
        )}
        <label className="flex items-center justify-between gap-3 text-sm font-medium">
          Leaving the venue at
          <input
            type="time"
            value={start}
            onChange={(e) => update({ start: e.target.value || undefined })}
            className="min-h-11 rounded-md border border-border bg-surface px-3"
          />
        </label>
      </div>

      <div className="space-y-4">
        <div className="h-72 overflow-hidden rounded-md border border-border sm:h-96">
          <LazyMap places={plan.stops.map((s) => s.place)} onSelect={() => {}} route={plan.stops.length ? route : []} />
        </div>

        {plan.stops.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-5 text-muted">
            Nothing fits. Try more time or a faster way to get around.
          </p>
        ) : (
          <ol className="relative space-y-2 rounded-md border border-border bg-surface p-4">
            <Row time={startMin} title="Leave ICC Jeju" />
            {plan.stops.map((s, i) => (
              <li key={s.place.id}>
                <p className="ml-14 text-xs text-muted">↓ {formatMinutes(s.travel)}</p>
                <div className="flex gap-3">
                  <span className="w-11 shrink-0 pt-0.5 text-right text-sm font-semibold tabular-nums">{formatClock(startMin + s.arrive)}</span>
                  <div className="min-w-0">
                    <Link href={`/explore/?place=${s.place.id}`} className="font-medium hover:text-sea">
                      {i + 1}. {s.place.name}
                    </Link>
                    <p className="text-sm text-muted">
                      {formatMinutes(s.place.durationMin)} · {s.place.indoor ? "indoor" : "outdoor"}
                    </p>
                  </div>
                </div>
              </li>
            ))}
            <li className="ml-14 text-xs text-muted">↓ {formatMinutes(plan.returnTravel)}</li>
            <Row time={startMin + plan.used} title="Back at ICC Jeju" />
          </ol>
        )}
        {afterDark.length > 0 && (
          <p className="border-l-2 border-tangerine bg-surface p-3 text-sm">
            Sunset is around {formatClock(sunset)}. {afterDark.map((s) => s.place.name).join(", ")} will be after dark.
          </p>
        )}
        <p className="text-xs text-muted">
          Times are rough estimates from straight-line distance, and museums are assumed to close around 18:00.
          Check opening hours and the last bus. The link in your
          address bar shares this plan.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="min-h-10 rounded-md border border-border bg-surface px-4 text-sm aria-pressed:border-transparent aria-pressed:bg-foreground aria-pressed:text-background"
    >
      {children}
    </button>
  );
}

function Row({ time, title }: { time: number; title: string }) {
  return (
    <li className="flex gap-3">
      <span className="w-11 shrink-0 text-right text-sm font-semibold tabular-nums text-tangerine">{formatClock(time)}</span>
      <span className="font-medium">{title}</span>
    </li>
  );
}
