import { ICC } from "@/lib/geo";
import { placeById } from "./places";

export type Stamp = {
  id: string;
  /** Short Korean name printed on the stamp. */
  ko: string;
  name: string;
  lat: number;
  lng: number;
  /** Check-in radius in metres; large sites need more slack. */
  radius: number;
};

const fromPlace = (id: string, ko: string, radius = 400): Stamp => {
  const p = placeById(id);
  if (!p) throw new Error(`Unknown place ${id}`);
  return { id, ko, name: p.name, lat: p.lat, lng: p.lng, radius };
};

export const STAMPS: Stamp[] = [
  { id: "icc", ko: "학회장", name: "ICC Jeju (QM2027)", lat: ICC.lat, lng: ICC.lng, radius: 400 },
  fromPlace("jusangjeolli", "주상절리"),
  fromPlace("cheonjeyeon", "천제연"),
  fromPlace("saekdal", "색달"),
  fromPlace("oedolgae", "외돌개"),
  fromPlace("cheonjiyeon", "천지연"),
  fromPlace("olle-market", "올레시장"),
  fromPlace("sanbangsan", "산방산", 800),
  fromPlace("osulloc", "오설록"),
  fromPlace("seongsan", "성산", 800),
  fromPlace("manjanggul", "만장굴", 600),
  fromPlace("yeongsil", "영실", 1500),
];

export const BADGES = [
  { min: 1, title: "Arrived" },
  { min: 4, title: "Jungmun Explorer" },
  { min: 8, title: "Island Hopper" },
  { min: STAMPS.length, title: "Jeju Master" },
];
