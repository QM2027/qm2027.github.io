// Trail lengths are the published ones. Elevations are SRTM 30 m: sampled every
// ~200 m along recorded tracks for Seongpanak and Gwaneumsa (shelters placed by their
// OSM position on the track), and at the marked points only for Yeongsil and Eorimok.
// The summit is pinned to the official 1,947 m; SRTM smooths the crater rim lower.
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
    profile: [[0, 1236, "Trailhead"], [2.5, 1579, "Byeongpung rock"], [3.7, 1666, "Witse-oreum shelter"], [5.8, 1610, "Nambyeok junction"]],
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
    profile: [[0, 970, "Trailhead"], [2.4, 1412, "Sajebi hill"], [3.2, 1594, "Mansedongsan"], [4.7, 1666, "Witse-oreum shelter"], [6.8, 1610, "Nambyeok junction"]],
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
    profile: [
      [0, 755, "Trailhead"], [0.2, 771], [0.4, 793], [0.6, 804], [0.8, 817], [1, 827], [1.2, 832], [1.4, 839],
      [1.6, 858], [1.9, 887], [2.1, 912], [2.3, 939], [2.5, 971], [2.7, 994], [2.9, 1011], [3.1, 1029],
      [3.3, 1042], [3.5, 1059], [3.7, 1073], [3.9, 1085], [4.1, 1105, "Sokbat shelter"], [4.3, 1116], [4.5, 1130], [4.7, 1143],
      [4.9, 1157], [5.1, 1171], [5.3, 1196], [5.5, 1223], [5.8, 1257, "Saraoreum junction"], [6, 1280], [6.2, 1325], [6.4, 1356],
      [6.6, 1395], [6.8, 1435], [7, 1471], [7.2, 1490, "Jindallaebat shelter"], [7.4, 1511], [7.6, 1527], [7.8, 1568], [8, 1615],
      [8.2, 1662], [8.4, 1705], [8.6, 1726], [8.8, 1756], [9.1, 1801], [9.3, 1861], [9.5, 1907], [9.6, 1947, "Baengnokdam summit"],
    ],
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
    profile: [
      [0, 589, "Trailhead"], [0.2, 601], [0.4, 617], [0.6, 642], [0.8, 661], [1, 680], [1.2, 707], [1.4, 734],
      [1.6, 756], [1.9, 775], [2, 796], [2.3, 816], [2.5, 826], [2.7, 837], [2.9, 859], [3.1, 884, "Tamna Valley shelter"],
      [3.3, 934], [3.5, 983], [3.7, 1012], [3.9, 1062], [4.1, 1118], [4.3, 1159], [4.5, 1189], [4.7, 1231],
      [4.9, 1273], [5.1, 1305], [5.3, 1340], [5.5, 1385], [5.8, 1431], [6, 1455], [6.2, 1492, "Samgakbong shelter"], [6.4, 1496],
      [6.6, 1524], [6.8, 1497], [7, 1519], [7.2, 1554], [7.4, 1618], [7.6, 1672], [7.8, 1722], [8, 1787],
      [8.2, 1840], [8.4, 1887], [8.6, 1914], [8.7, 1947, "Baengnokdam summit"],
    ],
    access: "≈ 70 min by car; on the Jeju City (north) side.",
    text: "Steep and dramatic, through deep valleys. A popular loop goes up Seongpanak and down Gwaneumsa. Reservation is required.",
  },
];
