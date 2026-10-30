import { ICC } from "@/lib/geo";
import { placeById } from "./places";

export type Stamp = {
  id: string;
  emoji: string;
  name: string;
  lat: number;
  lng: number;
  /** Check-in radius in metres; large sites need more slack. */
  radius: number;
};

const fromPlace = (id: string, emoji: string, radius = 400): Stamp => {
  const p = placeById(id);
  if (!p) throw new Error(`Unknown place ${id}`);
  return { id, emoji, name: p.name, lat: p.lat, lng: p.lng, radius };
};

export const STAMPS: Stamp[] = [
  { id: "icc", emoji: "⚛️", name: "ICC Jeju (QM2027)", lat: ICC.lat, lng: ICC.lng, radius: 400 },
  fromPlace("jusangjeolli", "🧱"),
  fromPlace("cheonjeyeon", "💧"),
  fromPlace("saekdal", "🏄"),
  fromPlace("oedolgae", "🪨"),
  fromPlace("cheonjiyeon", "🌊"),
  fromPlace("olle-market", "🍊"),
  fromPlace("sanbangsan", "⛰️", 800),
  fromPlace("osulloc", "🍵"),
  fromPlace("seongsan", "🌅", 800),
  fromPlace("manjanggul", "🕳️", 600),
  fromPlace("yeongsil", "🥾", 1500),
];

export const BADGES = [
  { min: 1, title: "Arrived", emoji: "🛬" },
  { min: 4, title: "Jungmun Explorer", emoji: "🧭" },
  { min: 8, title: "Island Hopper", emoji: "🏝️" },
  { min: STAMPS.length, title: "Jeju Master", emoji: "🏆" },
];
