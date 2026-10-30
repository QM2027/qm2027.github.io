"use client";

import { useFetchJson } from "@/lib/use-fetch-json";
import { FORECAST_URL, MARCH_CLIMATE, describeWeather, type Forecast } from "@/lib/weather";

export function WeatherCard() {
  const f = useFetchJson<Forecast>(FORECAST_URL);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-semibold">Weather at the venue</h2>
      {f.status === "ok" ? (
        <>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-5xl" aria-hidden>{describeWeather(f.data.current.weather_code).emoji}</span>
            <div>
              <p className="text-3xl font-semibold tabular-nums">{Math.round(f.data.current.temperature_2m)}°C</p>
              <p className="text-sm text-muted">
                {describeWeather(f.data.current.weather_code).label} · feels {Math.round(f.data.current.apparent_temperature)}° ·
                wind {Math.round(f.data.current.wind_speed_10m)} m/s
              </p>
            </div>
          </div>
          <ul className="mt-4 grid grid-cols-5 gap-1 text-center text-xs">
            {f.data.daily.time.map((day, i) => (
              <li key={day} className="rounded-xl bg-background p-2">
                <p className="text-muted">{new Date(`${day}T00:00:00+09:00`).toLocaleDateString("en-GB", { weekday: "short", timeZone: "Asia/Seoul" })}</p>
                <p className="text-xl" aria-label={describeWeather(f.data.daily.weather_code[i]).label}>{describeWeather(f.data.daily.weather_code[i]).emoji}</p>
                <p className="tabular-nums">{Math.round(f.data.daily.temperature_2m_max[i])}° / {Math.round(f.data.daily.temperature_2m_min[i])}°</p>
                <p className="tabular-nums text-sea">{f.data.daily.precipitation_probability_max[i]}%</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted">{f.status === "loading" ? "Loading forecast…" : "Live forecast unavailable right now."}</p>
      )}
      <p className="mt-4 text-sm">
        <b>Late March, typically:</b> {MARCH_CLIMATE.high}° / {MARCH_CLIMATE.low}°C, about {MARCH_CLIMATE.rainyDays} rainy
        days in the month. {MARCH_CLIMATE.text}
      </p>
      <p className="mt-2 text-xs text-muted">Forecast by Open-Meteo.</p>
    </section>
  );
}
