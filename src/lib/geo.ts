export type LatLng = { lat: number; lng: number };

/** ICC Jeju, Jungmun Tourist Complex, Seogwipo. */
export const ICC: LatLng = { lat: 33.2416, lng: 126.4235 };

const EARTH_RADIUS_KM = 6371;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Rough travel time. Jeju roads wind, so straight-line distance is scaled by a
 * detour factor before applying an average speed.
 */
export function travelMinutes(km: number, mode: "walk" | "car"): number {
  const road = km * 1.35;
  const kmh = mode === "walk" ? 4.5 : km > 15 ? 55 : 40;
  return Math.max(1, Math.round((road / kmh) * 60));
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Deep links that open directions in Korean map apps (Google Maps directions are limited in Korea). */
export function directionLinks(name: string, p: LatLng) {
  const q = encodeURIComponent(name);
  return {
    kakao: `https://map.kakao.com/link/to/${q},${p.lat},${p.lng}`,
    naver: `https://map.naver.com/p/directions/-/${p.lng},${p.lat},${q},,/-/transit`,
    google: `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`,
  };
}
