import { PLACES, type Category, type Place } from "@/data/places";
import { ICC, distanceKm, travelMinutes, type LatLng } from "./geo";

export type Mode = "walk" | "taxi" | "car";
export type Interest = Extract<Category, "sight" | "nature" | "culture" | "food">;

export type PlanInput = {
  minutes: number;
  mode: Mode;
  interests: Interest[];
  wet: boolean;
  family?: boolean;
  /** Departure time, minutes after midnight. */
  startMin: number;
};

export type Stop = { place: Place; travel: number; arrive: number; leave: number };

const MAX_WALK_KM = 2.5;

/**
 * Rough closing time in minutes after midnight. Real hours vary, so this only keeps
 * plans from sending people to a museum at 19:00.
 */
export function closingMin(p: Place) {
  if (p.tags?.includes("evening")) return 22 * 60;
  if (p.category === "food") return 21 * 60;
  if (p.category === "culture" || p.indoor || p.category === "sight") return 18 * 60;
  return 24 * 60; // open-air nature; the UI warns about sunset separately
}

/** Taxis and rental cars both need time to find, park or flag down. */
const OVERHEAD: Record<Mode, number> = { walk: 0, taxi: 10, car: 10 };

function legMinutes(a: LatLng, b: LatLng, mode: Mode) {
  const km = distanceKm(a, b);
  return mode === "walk" ? travelMinutes(km, "walk") : travelMinutes(km, "car") + OVERHEAD[mode];
}

function score(p: Place, input: PlanInput) {
  let s = 1;
  if (input.interests.includes(p.category as Interest)) s += 2;
  if (input.wet) s += p.indoor ? 3 : -2;
  if (input.family && p.tags?.includes("family")) s += 1.5;
  if (p.march) s += 0.5;
  return s;
}

/**
 * Greedy itinerary from ICC Jeju and back: at each step pick the stop with the best
 * score weighted by the share of time actually spent there rather than in transit,
 * among stops that still leave time to return.
 */
export function planTrip(input: PlanInput): { stops: Stop[]; returnTravel: number; used: number } {
  const pool = PLACES.filter(
    (p) =>
      p.durationMin > 0 &&
      p.durationMin <= input.minutes &&
      p.category !== "transport" &&
      p.category !== "health" &&
      (input.mode !== "walk" || distanceKm(ICC, p) <= MAX_WALK_KM) &&
      // Long hikes only make sense when they are the whole plan.
      (p.durationMin < 240 || input.minutes >= 480),
  );

  const stops: Stop[] = [];
  let here: LatLng = ICC;
  let t = 0;

  while (true) {
    let best: { place: Place; travel: number; value: number } | undefined;
    for (const p of pool) {
      if (stops.some((s) => s.place.id === p.id)) continue;
      const travel = legMinutes(here, p, input.mode);
      const back = legMinutes(p, ICC, input.mode);
      if (t + travel + p.durationMin + back > input.minutes) continue;
      if (input.startMin + t + travel + p.durationMin > closingMin(p)) continue;
      const value = (score(p, input) * p.durationMin) / (travel + p.durationMin);
      if (!best || value > best.value) best = { place: p, travel, value };
    }
    if (!best) break;
    const arrive = t + best.travel;
    stops.push({ place: best.place, travel: best.travel, arrive, leave: arrive + best.place.durationMin });
    t = arrive + best.place.durationMin;
    here = best.place;
  }

  const returnTravel = stops.length ? legMinutes(here, ICC, input.mode) : 0;
  return { stops, returnTravel, used: t + returnTravel };
}
