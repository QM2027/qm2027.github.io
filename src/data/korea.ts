// Travel times are typical scheduled times; satellite meeting details live on each meeting's own page.

import type { Place } from "./places";

const city = (id: string, name: string, nameKo: string, lat: number, lng: number, summary: string): Place => ({
  id, name, nameKo, lat, lng, summary, category: "transport", durationMin: 0,
});

export const CITIES = {
  cju: city("cju", "Jeju Airport (CJU)", "제주공항", 33.507, 126.493, "Domestic hub with flights to Seoul every few minutes."),
  gmp: city("gmp", "Seoul Gimpo (GMP)", "김포공항", 37.5583, 126.7906, "Seoul's domestic airport, 40 min by subway to the city centre."),
  icn: city("icn", "Incheon International (ICN)", "인천공항", 37.4602, 126.4407, "Korea's main international gateway, 35 min from Gimpo by AREX train."),
  seoul: city("seoul", "Seoul", "서울", 37.5665, 126.978, "Palaces, food markets and the HotDISCO satellite meeting."),
  cjj: city("cjj", "Cheongju Airport (CJJ)", "청주공항", 36.7166, 127.4991, "Closest airport to Daejeon, about 40 min by bus or taxi."),
  daejeon: city("daejeon", "Daejeon", "대전", 36.3504, 127.3845, "Korea's science city, home to KAIST, IBS and the Daedeok research complex."),
  pus: city("pus", "Busan Gimhae (PUS)", "김해공항", 35.1795, 128.9382, "Busan's airport, with some international flights."),
  busan: city("busan", "Busan", "부산", 35.1796, 129.0756, "Port city of beaches, seafood markets and hillside villages."),
  gyeongju: city("gyeongju", "Gyeongju", "경주", 35.8562, 129.2247, "Capital of the Silla kingdom: royal tombs, temples and a UNESCO historic area."),
};

type CityId = keyof typeof CITIES;

export type Trip = {
  id: string;
  title: string;
  when: string;
  stops: CityId[];
  legs: string[];
  text: string;
};

export const TRIPS: Trip[] = [
  {
    id: "seoul",
    title: "Seoul before or after",
    when: "2–3 days",
    stops: ["cju", "gmp", "seoul"],
    legs: ["Jeju → Gimpo: 1 h 10 min flight, departures every few minutes", "Gimpo → central Seoul: 40 min by subway (Line 5 or 9) or AREX"],
    text: "The Jeju–Seoul air route is one of the busiest in the world, so flexible tickets are easy to find. Combine it with the HotDISCO satellite meeting in Seoul.",
  },
  {
    id: "daejeon",
    title: "Daejeon science city",
    when: "1–2 days",
    stops: ["cju", "cjj", "daejeon"],
    legs: ["Jeju → Cheongju: 1 h flight", "Cheongju Airport → Daejeon: ≈ 40 min by bus or taxi", "Or: Seoul → Daejeon by KTX in about 1 h"],
    text: "Home of the satellite meeting on nuclear structure and high-energy collisions, plus KAIST, the Institute for Basic Science and the National Science Museum.",
  },
  {
    id: "busan-gyeongju",
    title: "Busan & Gyeongju",
    when: "2–3 days",
    stops: ["cju", "pus", "busan", "gyeongju"],
    legs: ["Jeju → Busan: 1 h flight", "Busan → Gyeongju: ≈ 30 min by KTX (Singyeongju) or 1 h by bus"],
    text: "Seafood at Jagalchi Market and the coast at Haeundae, then a day among the Silla royal tombs and Bulguksa temple in Gyeongju.",
  },
  {
    id: "fly-home",
    title: "Flying home via Incheon",
    when: "Allow 4–5 h",
    stops: ["cju", "gmp", "icn"],
    legs: ["Jeju → Gimpo: 1 h 10 min flight", "Gimpo → Incheon: 35 min by AREX train or 40 min by limousine bus"],
    text: "Few international flights leave Jeju, so most people connect in Seoul. Flights from Jeju land at Gimpo, not Incheon, so allow time to change airports and check in again. Some carriers sell through-tickets via Incheon; check before you book.",
  },
];

export const SATELLITES = [
  { name: "HotDISCO", where: "Seoul", href: "https://moim.korea.ac.kr/event/9/" },
  { name: "Intersection of nuclear structure and high-energy nuclear collisions 2027", where: "Daejeon", href: "https://indico.cern.ch/event/1686349/" },
  { name: "C3NT: post-QM", where: "Wuhan", href: "https://indico.pnp.ustc.edu.cn/event/6218/" },
  { name: "C3NT: pre-QM", where: "See website", href: "https://indico.global/event/18423/" },
  { name: "Bayesian Inference for Heavy-Ion Collisions", where: "See website", href: "https://indico.cern.ch/event/1700990/" },
  { name: "QISxQCD", where: "See website", href: "https://indico2.riken.jp/event/5803/" },
];
