"use client";

import { useFetchJson } from "@/lib/use-fetch-json";
import { FORECAST_URL, MARCH_CLIMATE, describeWeather, type Forecast } from "@/lib/weather";
import { useWeatherData } from "@/lib/weather-data";
import { WeatherAlerts } from "./WeatherAlerts";

export function WeatherCard() {
  const f = useFetchJson<Forecast>(FORECAST_URL);
  const kma = useWeatherData();

  return (
    <section className="rounded-md border border-border bg-surface p-5">
      <h2 className="font-semibold">Weather at the venue</h2>
      <div className="mt-3 empty:hidden">
        <WeatherAlerts data={kma} />
      </div>
      {f.status === "ok" ? (
        <>
          <div className="mt-3">
            <div>
              <p className="font-mono text-4xl tabular-nums">{Math.round(f.data.current.temperature_2m)}°C</p>
              <p className="text-sm text-muted">
                {describeWeather(f.data.current.weather_code)} · feels {Math.round(f.data.current.apparent_temperature)}° ·
                wind {Math.round(f.data.current.wind_speed_10m)} m/s
              </p>
            </div>
          </div>
          <ul className="mt-4 grid grid-cols-5 gap-1 text-center text-xs">
            {f.data.daily.time.map((day, i) => (
              <li key={day} className="rounded-md bg-background p-2">
                <p className="text-muted">{new Date(`${day}T00:00:00+09:00`).toLocaleDateString("en-GB", { weekday: "short", timeZone: "Asia/Seoul" })}</p>
                <p className="truncate">{describeWeather(f.data.daily.weather_code[i])}</p>
                <p className="tabular-nums">{Math.round(f.data.daily.temperature_2m_max[i])}° / {Math.round(f.data.daily.temperature_2m_min[i])}°</p>
                <p className="tabular-nums text-muted">rain {f.data.daily.precipitation_probability_max[i]}%</p>
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
      <p className="mt-2 text-xs text-muted">
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline underline-offset-2">
          Weather data by Open-Meteo.com
        </a>
      </p>
    </section>
  );
}
