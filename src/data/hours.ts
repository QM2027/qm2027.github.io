// Opening hours for late March 2027, read from TourAPI English (QM2027/tour-data places.json,
// fetched 2026-11-18) and condensed by hand: the source text mixes seasons, notes and languages.
// Re-check against https://qm2027.github.io/tour-data/places.json before launch; places without
// an entry fall back to the planner's rough estimate.

export type PlaceHours = {
  /** Short line for the place card. */
  text: string;
  /** "HH:MM", Korea time. */
  open?: string;
  close?: string;
  /** Last entry or ticket sale, if earlier than closing. */
  lastEntry?: string;
  /** Regular closing days, as the source states them. */
  closed?: string;
  note?: string;
};

export const HOURS: Record<string, PlaceHours> = {
  jusangjeolli: { text: "09:00–18:00, last entry 17:40", open: "09:00", close: "18:00", lastEntry: "17:40" },
  saekdal: { text: "Open 24 hours" },
  cheonjeyeon: { text: "09:00–17:50, last entry 17:10", open: "09:00", close: "17:50", lastEntry: "17:10" },
  yeomiji: { text: "09:00–18:00, tickets until 17:30", open: "09:00", close: "18:00", lastEntry: "17:30", note: "The outdoor garden closes at sunset." },
  teddy: { text: "09:00–18:00, last entry 17:30", open: "09:00", close: "18:00", lastEntry: "17:30" },
  cheonjiyeon: { text: "09:00–22:00, tickets until 21:20", open: "09:00", close: "22:00", lastEntry: "21:20" },
  // Added by hand from operator and tourism listings, not TourAPI; confirm before launch.
  eongdeongmul: { text: "Open 24 hours" },
  "alive-museum": { text: "09:00–19:00, last entry 18:00", open: "09:00", close: "19:00", lastEntry: "18:00" },
  "jungmun-market": { text: "About 09:00–17:00 on market days", open: "09:00", close: "17:00", closed: "Except on dates ending in 3 or 8" },
  "camellia-hill": { text: "08:30–18:30, last entry 17:30", open: "08:30", close: "18:30", lastEntry: "17:30" },
  baksugijeong: { text: "Open 24 hours" },
  "wetland-1100": { text: "Open 24 hours", note: "The 1100 Road closes in snow and ice; check before going." },
  "seogwipo-forest": { text: "09:00–18:00, last entry 17:00", open: "09:00", close: "18:00", lastEntry: "17:00" },
  "aerospace-museum": { text: "09:00–18:00, last entry 17:00", open: "09:00", close: "18:00", lastEntry: "17:00", closed: "Third Monday of the month (15 March in 2027)" },
  "shinhwa-park": { text: "10:00–20:00", open: "10:00", close: "20:00" },
  "bangju-church": { text: "Grounds about 09:00–18:00", open: "09:00", close: "18:00", closed: "During services (Sunday 09:30–14:00, Wednesday 11:00)" },
  jeongbang: { text: "09:00–17:20", open: "09:00", close: "17:20" },
  oedolgae: { text: "Open 24 hours" },
  "olle-market": { text: "07:00–20:00 (shops vary)", open: "07:00", close: "20:00" },
  sanbangsan: {
    text: "Yongmeori coast 09:00–17:00, last entry 16:30",
    open: "09:00",
    close: "17:00",
    lastEntry: "16:30",
    note: "The coast path closes at high tide and in high waves; check on the day.",
  },
  songaksan: { text: "Open 24 hours" },
  osulloc: { text: "09:00–18:00", open: "09:00", close: "18:00" },
  hyeopjae: { text: "Open 24 hours" },
  yeongsil: { text: "Trail entry 05:00–12:00 (October–March)", open: "05:00", lastEntry: "12:00", note: "Trails close in bad weather." },
  seongsan: { text: "05:00–19:00, last tickets 18:00", open: "05:00", close: "19:00", lastEntry: "18:00", closed: "First Monday of the month" },
  udo: { text: "Open 24 hours (ferries run by day)" },
  manjanggul: { text: "09:00–18:00, last entry 17:00", open: "09:00", close: "18:00", lastEntry: "17:00", closed: "First Wednesday of the month" },
  bijarim: { text: "09:00–18:00, last entry 17:00", open: "09:00", close: "18:00", lastEntry: "17:00" },
  "haenyeo-museum": { text: "09:00–18:00, last entry 17:00", open: "09:00", close: "18:00", lastEntry: "17:00", closed: "Mondays" },
  aquaplanet: { text: "09:30–18:00, last entry 17:30", open: "09:30", close: "18:00", lastEntry: "17:30" },
  noksanro: { text: "Open 24 hours" },
  saryeoni: {
    text: "09:00–17:00; entry may stop from 12:00 until March",
    open: "09:00",
    close: "17:00",
    lastEntry: "12:00",
    note: "Closed on rainy days and for two days after rain.",
  },
  saeyeongyo: { text: "Open 24 hours; bridge lit from sunset to 23:30" },
  gwangchigi: { text: "Open 24 hours" },
  hamdeok: { text: "Open 24 hours" },
  dongmun: { text: "07:00–21:00 (shops vary)", open: "07:00", close: "21:00" },
  "peace-park": { text: "09:00–18:00, last entry 17:00", open: "09:00", close: "18:00", lastEntry: "17:00", closed: "First and third Monday" },
};

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
