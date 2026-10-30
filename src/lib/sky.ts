// Small astronomy helpers. Accuracy is a few minutes for the sun and a few hours
// for the moon phase, which is plenty for planning a walk or a stargazing trip.

const RAD = Math.PI / 180;
const KST_OFFSET_MIN = 9 * 60;

function dayOfYear(y: number, m: number, d: number) {
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86_400_000);
}

/** Sunrise and sunset in minutes after local (KST) midnight, NOAA approximation. */
export function sunTimes(y: number, m: number, d: number, lat: number, lng: number) {
  const g = ((2 * Math.PI) / 365) * (dayOfYear(y, m, d) - 1);
  const eqTime =
    229.18 *
    (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl =
    0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const ha =
    Math.acos(Math.cos(90.833 * RAD) / (Math.cos(lat * RAD) * Math.cos(decl)) - Math.tan(lat * RAD) * Math.tan(decl)) / RAD;
  return {
    sunrise: 720 - 4 * (lng + ha) - eqTime + KST_OFFSET_MIN,
    sunset: 720 - 4 * (lng - ha) - eqTime + KST_OFFSET_MIN,
  };
}

export function formatClock(minutes: number) {
  const m = Math.round(minutes);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

const SYNODIC = 29.530588853;
const KNOWN_NEW_MOON_JD = 2451550.1; // 2000-01-06

/** Moon age in days (0 = new, ~14.8 = full) and illuminated fraction for a given instant. */
export function moonPhase(date: Date) {
  const jd = date.getTime() / 86_400_000 + 2440587.5;
  const age = ((((jd - KNOWN_NEW_MOON_JD) / SYNODIC) % 1) + 1) % 1 * SYNODIC;
  const illumination = (1 - Math.cos((2 * Math.PI * age) / SYNODIC)) / 2;
  return { age, illumination };
}

export function moonLabel(age: number) {
  const names = ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"];
  const i = Math.round((age / SYNODIC) * 8) % 8;
  return names[i];
}

/** Each conference night, 21–27 March 2027. */
export const CONFERENCE_DAYS = [21, 22, 23, 24, 25, 26, 27].map((d) => ({ y: 2027, m: 3, d }));
