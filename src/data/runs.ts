// The Olle 8 route is traced from an Olle GPX (scripts/olle-slice.mjs, trkpt 122..75 of
// course 8, local copy in docs/olle_gpx/). The other two are still hand-drawn and
// approximate. Keep runners on marked paths either way.

import { ICC, type LatLng } from "@/lib/geo";

export type Run = {
  id: string;
  title: string;
  level: "Easy" | "Moderate";
  surface: string;
  text: string;
  /** Closed loop or out-and-back; the last point returns to the start. */
  path: [number, number][];
  /** Metres, one per path point; null where the source has no elevation (hand-drawn stretch). */
  ele?: (number | null)[];
  /** Path is A..Z..A over the same points (see outAndBack). */
  outAndBack?: boolean;
};

/** Out and back along the same points: A..Z then Z..A. */
const outAndBack = <T,>(xs: T[]): T[] => [...xs, ...xs.slice(0, -1).reverse()];

// Olle 8 from where it passes the venue, east past Jusangjeolli to Daepo port.
const OLLE8_EAST: [number, number][] = [
  [ICC.lat, ICC.lng],
  [33.23968, 126.42332], [33.23963, 126.4234], [33.2394, 126.42362], [33.23927, 126.42372],
  [33.23879, 126.42378], [33.23786, 126.42483], [33.23786, 126.42487], [33.23771, 126.42632],
  [33.23777, 126.42636], [33.23768, 126.42668], [33.23716, 126.42734], [33.23689, 126.42749],
  [33.23685, 126.42751], [33.2364, 126.42751], [33.23629, 126.42743], [33.23614, 126.42751],
  [33.236, 126.42769], [33.236, 126.42801], [33.23587, 126.4282], [33.23594, 126.42854],
  [33.236, 126.42864], [33.23618, 126.42884], [33.23639, 126.42935], [33.23641, 126.42957],
  [33.2364, 126.43006], [33.23635, 126.43024], [33.23574, 126.43076], [33.23563, 126.43097],
  [33.23561, 126.43148], [33.23536, 126.43183], [33.23511, 126.432], [33.23491, 126.43215],
  [33.23496, 126.43227], [33.23511, 126.43227], [33.23526, 126.43224], [33.23546, 126.43397],
  [33.23599, 126.4345], [33.23677, 126.43505], [33.23678, 126.43507], [33.23701, 126.43616],
  [33.23769, 126.4365], [33.23813, 126.43676], [33.2382, 126.43674], [33.23889, 126.43669],
  [33.23887, 126.43689], [33.23898, 126.4372], [33.2391, 126.43769], [33.23911, 126.43841],
];
const OLLE8_EAST_ELE: (number | null)[] = [null, 28, 28, 27, 27, 22, 17, 17, 17, 18, 15, 10, 9, null, null, null, null, null, null, null, null, null, null, 11, 11, 10, null, null, null, null, null, null, null, null, null, 9, 7, 7, 6, 6, 9, 12, 13, 14, 19, 17, 14, 10, 7];

export const RUNS: Run[] = [
  {
    id: "resort-loop",
    title: "Jungmun resort loop",
    level: "Easy",
    surface: "Pavement",
    text: "A flat loop on the resort roads past the hotels and Saekdal Beach viewpoint. Well lit, so fine before sunrise.",
    path: [
  [33.2416, 126.4235], [33.2440, 126.4200], [33.2460, 126.4160], [33.2452, 126.4125],
  [33.2425, 126.4140], [33.2408, 126.4190], [33.2416, 126.4235],
    ],
  },
  {
    id: "olle8-coast",
    title: "Olle 8: columns & coast",
    level: "Moderate",
    surface: "Coastal path, some steps",
    text: "Follow the blue and orange Olle ribbons east along the cliffs, past the Jusangjeolli basalt columns to Daepo port, then turn back. Daepo port sits about 20 m below the trail at the venue, so the way back climbs.",
    path: outAndBack(OLLE8_EAST),
    ele: outAndBack(OLLE8_EAST_ELE),
    outAndBack: true,
  },
  {
    id: "falls-beach",
    title: "Waterfalls & beach",
    level: "Moderate",
    surface: "Pavement and park paths",
    text: "North to the Cheonjeyeon Falls gorge and Seonimgyo Bridge, then down to Saekdal Beach. The falls park opens after sunrise.",
    path: [
  [33.2416, 126.4235], [33.2450, 126.4215], [33.2490, 126.4195], [33.2523, 126.4183],
  [33.2496, 126.4178], [33.2470, 126.4160], [33.2445, 126.4119], [33.2420, 126.4160],
  [33.2416, 126.4235],
    ],
  },
];

export const toLatLng = (path: [number, number][]): LatLng[] => path.map(([lat, lng]) => ({ lat, lng }));
