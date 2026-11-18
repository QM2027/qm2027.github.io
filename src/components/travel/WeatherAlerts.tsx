"use client";

import { AIR_GRADE, airGrade, mountainWarnings, venueWarnings, type WeatherWarning, type useWeatherData } from "@/lib/weather-data";

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" });

function WarningList({ items, where }: { items: WeatherWarning[]; where: string }) {
  const now = items.filter((w) => !w.preliminary);
  const soon = items.filter((w) => w.preliminary);
  if (!items.length) return null;
  return (
    <div role="status" className="rounded-md border border-alert/40 p-3 text-sm">
      {now.length > 0 && (
        <p>
          <b className="text-alert">In force {where}:</b> {now.map((w) => w.label).join(", ")}
        </p>
      )}
      {soon.length > 0 && (
        <p className={now.length ? "mt-1" : ""}>
          <b>Expected {where}:</b> {soon.map((w) => w.label).join(", ")}
        </p>
      )}
    </div>
  );
}

/**
 * KMA weather warnings for the venue (or Hallasan) and AirKorea air quality. Shows nothing when
 * the data is unavailable or stale, so it can sit on any page.
 */
export function WeatherAlerts({ data, scope = "venue", air = true }: { data: ReturnType<typeof useWeatherData>; scope?: "venue" | "mountain"; air?: boolean }) {
  const { warnings, air: a } = data;
  const items = warnings ? (scope === "venue" ? venueWarnings(warnings.items) : mountainWarnings(warnings.items)) : [];
  const grade = a && air ? airGrade(a) : null;
  if (!items.length && !grade) return null;

  return (
    <div className="space-y-2">
      <WarningList items={items} where={scope === "venue" ? "at the venue" : "on Hallasan"} />
      {grade && a && (
        <p className="text-sm">
          <b className={grade >= 3 ? "text-alert" : ""}>Air: {AIR_GRADE[grade]}</b>
          <span className="text-muted">
            {" "}
            · PM10 {a.pm10 ?? "–"}, PM2.5 {a.pm25 ?? "–"} µg/m³ at {a.station}, {time(a.dataTime)}
            {grade >= 3 ? ". Go easy on hard exercise outdoors." : ""}
          </span>
        </p>
      )}
      <p className="text-xs text-muted">
        {[items.length > 0 && "Warnings: Korea Meteorological Administration.", grade && "Air quality: AirKorea."].filter(Boolean).join(" ")}
      </p>
    </div>
  );
}
