"use client";

import { useFetchJson } from "./use-fetch-json";
import type { Forecast } from "./weather";

// Published hourly by QM2027/weather-data from data.go.kr (KMA warnings and forecasts, AirKorea).
// Same origin in production; in development the live files are used (GitHub Pages sends CORS headers).
export const WEATHER_DATA_URL =
  (process.env.NEXT_PUBLIC_WEATHER_DATA_BASE ??
    (process.env.NODE_ENV === "development" ? "https://qm2027.github.io/weather-data" : "/weather-data")) + "/weather.json";

export type WarningKind = "wind" | "rain" | "snow" | "seas" | "storm-surge" | "typhoon" | "dry" | "cold" | "heat" | "dust" | "fog" | "other";

export type WeatherWarning = {
  kind: WarningKind;
  level: "advisory" | "warning";
  /** Announced in advance, not in force yet. */
  preliminary: boolean;
  labelKo: string;
  label: string;
  /** KMA forecast zones, e.g. 제주도남부 (the venue's), 제주도산지 (Hallasan). */
  areas: string[];
  affectsVenue: boolean;
};

export type WeatherData = {
  generatedAt: string;
  attribution: string;
  /** Same shape as the Open-Meteo forecast; mid-range days have no wind (null). */
  forecast: (Forecast & { fetchedAt: string; issuedAt: string }) | null;
  warnings: { fetchedAt: string; issuedAt: string | null; items: WeatherWarning[] } | null;
  air: {
    fetchedAt: string;
    station: string;
    dataTime: string;
    pm10: number | null;
    pm25: number | null;
    pm10Grade: AirGrade | null;
    pm25Grade: AirGrade | null;
  } | null;
  errors: { source: "forecast" | "warnings" | "air"; message: string }[];
};

/** AirKorea scale. */
export type AirGrade = 1 | 2 | 3 | 4;
export const AIR_GRADE: Record<AirGrade, string> = { 1: "Good", 2: "Moderate", 3: "Unhealthy", 4: "Very unhealthy" };

/** Older than this, a section is not shown as current: a stale "no warnings" would mislead. */
const MAX_AGE_MS = 3 * 3600_000;
const fresh = (iso: string | undefined | null, now = Date.now()) => !!iso && now - Date.parse(iso) < MAX_AGE_MS;

/** Sections that are recent enough to show; null when the file or the section isn't. */
export function currentWeatherData(d: WeatherData | null, now = Date.now()) {
  return {
    warnings: d?.warnings && fresh(d.warnings.fetchedAt, now) ? d.warnings : null,
    air: d?.air && fresh(d.air.fetchedAt, now) ? d.air : null,
  };
}

/** Warnings in force for the venue area. Preliminary ones are listed separately by the UI. */
export const venueWarnings = (items: WeatherWarning[]) => items.filter((w) => w.affectsVenue);
/** Warnings for Hallasan's mountain zones (산지), where trails close first. */
export const mountainWarnings = (items: WeatherWarning[]) => items.filter((w) => w.areas.some((a) => a.includes("산지")));

/** Worse of the two particulate grades. */
export function airGrade(air: NonNullable<WeatherData["air"]>): AirGrade | null {
  const g = Math.max(air.pm10Grade ?? 0, air.pm25Grade ?? 0);
  return g ? (g as AirGrade) : null;
}

/** Outdoor plans should give way: a wind/rain/snow/typhoon warning in force at the venue, or unhealthy air. */
export function outdoorsDiscouraged(d: ReturnType<typeof currentWeatherData>) {
  const blocking: WarningKind[] = ["wind", "rain", "snow", "typhoon", "dust"];
  const warned = !!d.warnings && venueWarnings(d.warnings.items).some((w) => !w.preliminary && blocking.includes(w.kind));
  const grade = d.air ? airGrade(d.air) : null;
  return warned || (grade ?? 0) >= 3;
}

export function useWeatherData() {
  const res = useFetchJson<WeatherData>(WEATHER_DATA_URL);
  return currentWeatherData(res.status === "ok" ? res.data : null);
}
