import { ICC } from "./geo";

// Open-Meteo: free, keyless and CORS-enabled. https://open-meteo.com/
export const FORECAST_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${ICC.lat}&longitude=${ICC.lng}` +
  "&current=temperature_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code,cloud_cover" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max" +
  "&timezone=Asia%2FSeoul&forecast_days=5&wind_speed_unit=ms";

export type Forecast = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
    cloud_cover: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };
};

/** WMO weather code → emoji and label. */
export function describeWeather(code: number) {
  if (code === 0) return { emoji: "☀️", label: "Clear" };
  if (code <= 2) return { emoji: "🌤️", label: "Partly cloudy" };
  if (code === 3) return { emoji: "☁️", label: "Overcast" };
  if (code <= 48) return { emoji: "🌫️", label: "Fog" };
  if (code <= 57) return { emoji: "🌦️", label: "Drizzle" };
  if (code <= 67) return { emoji: "🌧️", label: "Rain" };
  if (code <= 77) return { emoji: "🌨️", label: "Snow" };
  if (code <= 82) return { emoji: "🌧️", label: "Showers" };
  if (code <= 86) return { emoji: "🌨️", label: "Snow showers" };
  return { emoji: "⛈️", label: "Thunderstorm" };
}

/** Wet or very windy — prefer indoor plans. Jeju's coast is often gusty. */
export function isBadWeather(f: Forecast) {
  return f.current.precipitation > 0.2 || f.current.weather_code >= 51 || f.current.wind_speed_10m > 10;
}

/** Typical late-March climate at Seogwipo, for when the forecast isn't available or the trip is far away. */
export const MARCH_CLIMATE = {
  high: 15,
  low: 7,
  rainyDays: 9,
  text: "Mild days and cool mornings with frequent wind. Bring a windproof layer and an umbrella; it rarely freezes on the south coast, but Hallasan can still have snow.",
};
