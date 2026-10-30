// Route geometry is hand-drawn and approximate. Trace it properly (e.g. from an Olle GPX)
// before launch, and keep runners on marked paths.

import type { LatLng } from "@/lib/geo";

export type Run = {
  id: string;
  title: string;
  level: "Easy" | "Moderate";
  surface: string;
  text: string;
  /** Closed loop or out-and-back; the last point returns to the start. */
  path: [number, number][];
};

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
    text: "Follow the blue and orange Olle ribbons east along the cliffs to the Jusangjeolli basalt columns and on toward Daepo, then turn back.",
    path: [
      [33.2416, 126.4235], [33.2400, 126.4250], [33.2385, 126.4262], [33.2378, 126.4253],
      [33.2372, 126.4300], [33.2368, 126.4350], [33.2375, 126.4400], [33.2368, 126.4350],
      [33.2372, 126.4300], [33.2385, 126.4262], [33.2416, 126.4235],
    ],
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
