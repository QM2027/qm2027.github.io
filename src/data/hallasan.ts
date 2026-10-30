// Distances and elevations are approximate and drawn from public trail maps.
// Check reservation rules and cut-off times on the Hallasan National Park website before launch.

export type Trail = {
  id: string;
  name: string;
  nameKo: string;
  /** One-way distance in km and estimated one-way time in hours. */
  km: number;
  hoursUp: number;
  summit: boolean;
  reservation: boolean;
  difficulty: "Moderate" | "Hard";
  /** [km from trailhead, elevation m, label?] */
  profile: [number, number, string?][];
  access: string;
  text: string;
};

export const SUMMIT_M = 1947;

export const TRAILS: Trail[] = [
  {
    id: "yeongsil",
    name: "Yeongsil",
    nameKo: "영실코스",
    km: 5.8,
    hoursUp: 2.5,
    summit: false,
    reservation: false,
    difficulty: "Moderate",
    profile: [[0, 1280, "Trailhead"], [1.5, 1400], [2.5, 1600, "Byeongpung rock"], [3.7, 1700, "Witse-oreum"], [5.8, 1600, "Nambyeok junction"]],
    access: "≈ 35 min by taxi from ICC Jeju; ask for 영실매표소.",
    text: "The best choice for a conference week: one steep climb past the Obaek Nahan spires, then an easy walk across alpine plateau with views of the summit wall. It does not reach the summit.",
  },
  {
    id: "eorimok",
    name: "Eorimok",
    nameKo: "어리목코스",
    km: 6.8,
    hoursUp: 3,
    summit: false,
    reservation: false,
    difficulty: "Moderate",
    profile: [[0, 970, "Trailhead"], [2.4, 1420, "Sajebi hill"], [3.2, 1600, "Mansedongsan"], [4.7, 1700, "Witse-oreum"], [6.8, 1600, "Nambyeok junction"]],
    access: "≈ 45 min by car; can be combined with Yeongsil (up one, down the other).",
    text: "Forest climb to open highland meadows. Many hikers go up Eorimok and down Yeongsil, so arrange a taxi pickup.",
  },
  {
    id: "seongpanak",
    name: "Seongpanak",
    nameKo: "성판악코스",
    km: 9.6,
    hoursUp: 4.5,
    summit: true,
    reservation: true,
    difficulty: "Hard",
    profile: [[0, 750, "Trailhead"], [4.1, 1000, "Sokbat"], [5.8, 1200, "Saraoreum"], [7.3, 1500, "Jindallaebat shelter"], [9.6, 1947, "Baengnokdam summit"]],
    access: "≈ 50 min by car or taxi, or bus 281 from Seogwipo.",
    text: "The longest but gentlest route to the summit crater lake. Online reservation is required, and you must pass the Jindallaebat shelter before the cut-off time (around noon).",
  },
  {
    id: "gwaneumsa",
    name: "Gwaneumsa",
    nameKo: "관음사코스",
    km: 8.7,
    hoursUp: 5,
    summit: true,
    reservation: true,
    difficulty: "Hard",
    profile: [[0, 620, "Trailhead"], [3.2, 900, "Tamna valley"], [5.0, 1200, "Gaemideung"], [6.0, 1500, "Samgakbong shelter"], [8.7, 1947, "Baengnokdam summit"]],
    access: "≈ 70 min by car; on the Jeju City (north) side.",
    text: "Steep and dramatic, through deep valleys. A popular loop goes up Seongpanak and down Gwaneumsa. Reservation is required.",
  },
];
