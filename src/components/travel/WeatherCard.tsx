"use client";

import { useFetchJson } from "@/lib/use-fetch-json";
import { FORECAST_URL, MARCH_CLIMATE, describeWeather, type Forecast } from "@/lib/weather";
import { useWeatherData } from "@/lib/weather-data";
import { PLAIN_OPEN_PANEL, PLAIN_TILE } from "@/lib/look";
import { WeatherAlerts } from "./WeatherAlerts";

const weekday = (day: string) => new Date(`${day}T00:00:00+09:00`).toLocaleDateString("en-GB", { weekday: "short", timeZone: "Asia/Seoul" });

/* Brand look (?look=brand): the heading takes three of twelve columns and the rest sits in the
   other nine, the temperature now first and the five days as one ruled row (rows on a phone). */
export function WeatherCard() {
  const f = useFetchJson<Forecast>(FORECAST_URL);
  const kma = useWeatherData();

  return (
    <section className={`rounded-md border border-border bg-surface p-5 ${PLAIN_OPEN_PANEL} brand:pt-6 brand:lg:grid brand:lg:grid-cols-12 brand:lg:gap-x-12`}>
      <h2 className="font-semibold plain:text-xl brand:lg:col-span-3">Weather at the venue</h2>
      <div className="brand:mt-4 brand:flex brand:flex-col brand:gap-y-8 brand:lg:col-span-9 brand:lg:mt-0">
        <div className="mt-3 empty:hidden brand:mt-0">
          <WeatherAlerts data={kma} />
        </div>
        {f.status === "ok" ? (
          <>
            <div className="mt-3 brand:mt-0">
              <div>
                <p className="font-mono text-4xl tabular-nums brand:font-sans brand:font-semibold">
                  {Math.round(f.data.current.temperature_2m)}°C
                </p>
                <p className="text-sm text-muted brand:mt-2 brand:text-base">
                  {describeWeather(f.data.current.weather_code)}
                  <span className="plain:hidden"> · </span>
                  <span className="hidden plain:inline">, </span>
                  feels {Math.round(f.data.current.apparent_temperature)}°
                  <span className="plain:hidden"> · </span>
                  <span className="hidden plain:inline">, </span>
                  wind {Math.round(f.data.current.wind_speed_10m)} m/s
                </p>
              </div>
            </div>
            <ul className="mt-4 grid grid-cols-5 gap-1 text-center text-xs brand:hidden">
              {f.data.daily.time.map((day, i) => (
                <li key={day} className={`rounded-md bg-background p-2 ${PLAIN_TILE}`}>
                  <p className="text-muted">{weekday(day)}</p>
                  <p className="truncate">{describeWeather(f.data.daily.weather_code[i])}</p>
                  <p className="tabular-nums">{Math.round(f.data.daily.temperature_2m_max[i])}° / {Math.round(f.data.daily.temperature_2m_min[i])}°</p>
                  <p className="tabular-nums text-muted">rain {f.data.daily.precipitation_probability_max[i]}%</p>
                </li>
              ))}
            </ul>
            <ol aria-label="Next five days" className="hidden border-t border-border brand:grid sm:grid-cols-5">
              {f.data.daily.time.map((day, i) => (
                <li
                  key={day}
                  className="grid grid-cols-[2.75rem_1fr_auto_4.75rem] items-baseline gap-x-3 border-b border-border py-3 sm:block sm:border-b-0 sm:border-l sm:px-4 sm:pt-4 sm:pb-1 sm:first:border-l-0 sm:first:pl-0"
                >
                  <p className="text-sm text-muted">{weekday(day)}</p>
                  <p className="min-w-0 truncate text-sm sm:mt-1">{describeWeather(f.data.daily.weather_code[i])}</p>
                  <p className="text-right tabular-nums sm:mt-2 sm:text-left sm:text-lg">
                    <span className="font-semibold">{Math.round(f.data.daily.temperature_2m_max[i])}°</span>
                    <span className="text-muted"> / {Math.round(f.data.daily.temperature_2m_min[i])}°</span>
                  </p>
                  <p className="text-right text-sm text-muted tabular-nums sm:mt-1 sm:text-left">rain {f.data.daily.precipitation_probability_max[i]}%</p>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted brand:mt-0">{f.status === "loading" ? "Loading forecast…" : "Live forecast unavailable right now."}</p>
        )}
        <div>
          <p className="mt-4 text-sm brand:mt-0 brand:max-w-2xl brand:text-base brand:leading-relaxed">
            <b>Late March, typically:</b> {MARCH_CLIMATE.high}° / {MARCH_CLIMATE.low}°C, about {MARCH_CLIMATE.rainyDays} rainy
            days in the month. {MARCH_CLIMATE.text}
          </p>
          <p className="mt-2 text-xs text-muted">
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline underline-offset-2">
              Weather data by Open-Meteo.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
