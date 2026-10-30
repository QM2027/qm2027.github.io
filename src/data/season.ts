// Typical windows from past years. Bloom dates shift by a week or more with the weather;
// festival dates for 2027 must be confirmed when they are announced.

export type SeasonItem = {
  id: string;
  title: string;
  titleKo: string;
  /** Inclusive day-of-year style dates as "MM-DD". */
  from: string;
  to: string;
  peak?: [string, string];
  kind: "bloom" | "festival" | "food";
  text: string;
  places: string[];
  confirm?: boolean;
};

export const SEASON_RANGE = { from: "03-01", to: "04-20" };
export const CONFERENCE = { from: "03-21", to: "03-27" };

export const SEASON: SeasonItem[] = [
  {
    id: "canola",
    title: "Canola flowers",
    titleKo: "유채꽃",
    from: "03-01",
    to: "04-20",
    peak: ["03-15", "04-10"],
    kind: "bloom",
    text: "Fields of yellow canola cover the island. Classic spots: around Sanbangsan, below Seongsan Ilchulbong and along Noksan-ro.",
    places: ["sanbangsan", "seongsan", "noksanro"],
  },
  {
    id: "cherry",
    title: "King cherry blossoms",
    titleKo: "왕벚꽃",
    from: "03-20",
    to: "04-10",
    peak: ["03-26", "04-03"],
    kind: "bloom",
    text: "Jeju's native king cherry usually opens in the last week of March, so it may just start during the conference. Noksan-ro has canola and cherry blossoms together.",
    places: ["jeonnongro", "noksanro"],
  },
  {
    id: "camellia",
    title: "Camellia (late season)",
    titleKo: "동백꽃",
    from: "03-01",
    to: "03-25",
    kind: "bloom",
    text: "The winter camellia season is ending, but fallen red petals on the paths are still beautiful in early March.",
    places: [],
  },
  {
    id: "walking-festival",
    title: "Seogwipo Canola Walking Festival",
    titleKo: "서귀포 유채꽃 국제걷기대회",
    from: "03-14",
    to: "03-24",
    kind: "festival",
    text: "Walking event through canola fields in Seogwipo, usually held in mid to late March.",
    places: [],
    confirm: true,
  },
  {
    id: "fire-festival",
    title: "Jeju Fire Festival",
    titleKo: "제주들불축제",
    from: "03-08",
    to: "03-17",
    kind: "festival",
    text: "Traditional festival at Saebyeol Oreum. Recent editions changed format and the 2027 edition is not yet announced.",
    places: ["saebyeol"],
    confirm: true,
  },
  {
    id: "citrus",
    title: "Hallabong & cheonhyehyang season",
    titleKo: "한라봉·천혜향",
    from: "03-01",
    to: "04-20",
    kind: "food",
    text: "Premium Jeju citrus is in season. Buy it at Olle Market or Dongmun Market, or ship a box home.",
    places: ["olle-market", "dongmun"],
  },
];

/** Position of "MM-DD" inside SEASON_RANGE as a 0–1 fraction. */
export function seasonPos(mmdd: string) {
  const t = (s: string) => Date.UTC(2027, Number(s.slice(0, 2)) - 1, Number(s.slice(3)));
  const a = t(SEASON_RANGE.from);
  const b = t(SEASON_RANGE.to) + 86_400_000;
  return (t(mmdd) - a) / (b - a);
}

export function overlapsConference(item: Pick<SeasonItem, "from" | "to" | "peak">) {
  const [f, t] = item.peak ?? [item.from, item.to];
  if (f <= CONFERENCE.to && t >= CONFERENCE.from) return item.peak ? "peak" : "yes";
  return item.from <= CONFERENCE.to && item.to >= CONFERENCE.from ? "yes" : "no";
}
