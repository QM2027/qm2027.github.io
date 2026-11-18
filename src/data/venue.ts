// ICC Jeju, traced from the venue's own floor plans (1F, 3F, 5F; reference images kept locally in docs/floorplans, not committed).
// Each floor's coordinates are the pixel space of its plan image, so shapes can be checked by overlay.
// Hall shapes, walls, escalators and facility positions follow the plans. Room *uses* marked
// `estimated` are the committee's working allocation and may change. Confirmed: Tamna A plenary,
// Tamna B+C (opened into one hall) lunch, 300 / 303A / 303B / 304 offices and child care.

export type RoomKind =
  | "plenary"
  | "parallel"
  | "poster"
  | "registration"
  | "catering"
  | "office"
  | "childcare"
  | "info"
  | "entrance"
  | "restroom"
  | "elevator"
  | "escalator"
  | "other";

export type Point = [number, number];

/** Drawing primitives for details: escalators, stairs, arrows, text. */
export type Part =
  | { t: "esc"; x: number; y: number; w: number; h: number }
  | { t: "stairs"; cx: number; cy: number; rx: number; ry: number }
  | { t: "poly"; points: Point[] }
  | { t: "path"; d: string; fill?: boolean }
  | { t: "arrow"; from: Point; to: Point }
  /** A doorway: thick bar along a wall; `via` is a quadratic control point for curved walls. */
  | { t: "door"; from: Point; to: Point; via?: Point }
  /** A pill-shaped label, with an optional pointer line to a spot. */
  | { t: "badge"; x: number; y: number; text: string; to?: Point }
  | { t: "text"; x: number; y: number; text: string; size?: number; anchor?: "start" | "middle" | "end"; rotate?: number; bold?: boolean };

export type Room = {
  id: string;
  name: string;
  kind: RoomKind;
  /** Rectangle… */
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  /** …or an SVG path, with an explicit label position. */
  d?: string;
  lx?: number;
  ly?: number;
  evenodd?: boolean;
  /** Shorter label drawn on the map when the room is too small for the name. */
  short?: string;
  /** Small second line under the label (what the room is for). */
  sub?: string;
  /** Run the label along the long side of a tall room. */
  vertical?: boolean;
  /** Width available for the label, when it differs from the shape (paths, rings). */
  lw?: number;
  /** Door openings on a horizontal wall, drawn as gaps. */
  doors?: Point[];
  /** Curved seat rows (auditorium), clipped to the room. */
  seats?: { cx: number; cy: number; r0: number; r1: number; step: number };
  /** Dot pattern of round tables (dining). */
  tables?: boolean;
  /** Diagonal hatch (open void, no floor). */
  hatch?: boolean;
  /** Dashed line of poster boards. */
  boards?: string;
  /** Details drawn as part of this room and selecting it. */
  parts?: Part[];
  /** Point facilities (restrooms, elevators…): one marker per location, all selecting this room. */
  spots?: Point[];
  note?: string;
  capacity?: number;
  /** The use shown is a working allocation, not yet confirmed. */
  estimated?: boolean;
  /** Room names as they appear in the Indico timetable, for "now / next" sessions. */
  indicoRooms?: string[];
};

export type Floor = {
  id: string;
  label: string;
  width: number;
  height: number;
  /** Building footprint, drawn as one merged outline. */
  base: string[];
  /** Staff and service areas, shaded so the public space reads clearly. */
  service?: string[];
  /** Stroke-only details (canopies, inner walls). */
  decor?: string[];
  /** Non-interactive annotations. */
  labels?: Part[];
  rooms: Room[];
};

export type Route = {
  id: string;
  label: string;
  steps: string[];
  /** Polylines per floor id. */
  paths: Record<string, Point[][]>;
};

/**
 * Four groups, one colour each. The colours (globals.css, --k-*) were checked to stay apart under
 * protan, deutan and tritan simulation, and each group also has its own glyph shape, so colour is
 * never the only cue.
 */
export type KindGroup = "hall" | "participant" | "office" | "service" | "other";
export const KIND_GROUPS: Record<KindGroup, { label: string; color: string }> = {
  hall: { label: "Lecture halls", color: "var(--k-hall)" },
  participant: { label: "Participant areas", color: "var(--k-participant)" },
  office: { label: "Secretariat & LOC", color: "var(--k-office)" },
  service: { label: "Venue services", color: "var(--k-service)" },
  other: { label: "Other spaces", color: "var(--muted)" },
};

const kind = (label: string, group: KindGroup, extra: { marker?: boolean; hidden?: boolean } = {}) => ({
  label,
  group,
  color: KIND_GROUPS[group].color,
  ...extra,
});
export const ROOM_KINDS: Record<RoomKind, { label: string; group: KindGroup; color: string; marker?: boolean; hidden?: boolean }> = {
  plenary: kind("Plenary", "hall"),
  parallel: kind("Parallel sessions", "hall"),
  poster: kind("Posters", "participant"),
  registration: kind("Registration", "participant"),
  catering: kind("Lunch", "participant"),
  childcare: kind("Child care", "participant"),
  office: kind("Secretariat & LOC offices", "office"),
  info: kind("Info & services", "service", { marker: true }),
  entrance: kind("Entrances", "service"),
  restroom: kind("Restrooms", "service", { marker: true }),
  elevator: kind("Elevators", "service", { marker: true }),
  escalator: kind("Escalators & stairs", "service"),
  other: kind("Other spaces", "other", { hidden: true }),
};

export const DEFAULT_FLOOR = "3f";

// ---------------------------------------------------------------- smooth curves
// Catmull-Rom through points, as cubic segments, so long facades have no kinks where pieces join.
// Shapes that share a wall reuse the same segments (reversed where needed), so edges match exactly.
type Seg = [Point, Point, Point, Point];
const r1 = (n: number) => Math.round(n * 10) / 10;
function spline(pts: Point[]): Seg[] {
  const at = (i: number): Point => {
    if (i < 0) return [2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1]];
    const n = pts.length - 1;
    if (i > n) return [2 * pts[n][0] - pts[n - 1][0], 2 * pts[n][1] - pts[n - 1][1]];
    return pts[i];
  };
  const segs: Seg[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    segs.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
  }
  return segs;
}
const reversed = (segs: Seg[]): Seg[] => segs.slice().reverse().map(([a, b, c, d]) => [d, c, b, a]);
/** Path commands continuing from the first segment's start point. */
const curve = (segs: Seg[]) => segs.map(([, b, c, d]) => `C${r1(b[0])} ${r1(b[1])} ${r1(c[0])} ${r1(c[1])} ${r1(d[0])} ${r1(d[1])}`).join(" ");
/** A standalone stroke through points. */
const stroke = (pts: Point[]) => `M${pts[0][0]} ${pts[0][1]} ${curve(spline(pts))}`;

const bez = ([a, b, c, d]: Seg, t: number): Point => {
  const u = 1 - t;
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return [k[0] * a[0] + k[1] * b[0] + k[2] * c[0] + k[3] * d[0], k[0] * a[1] + k[1] * b[1] + k[2] * c[1] + k[3] * d[1]];
};
const lerp = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
function splitSeg([a, b, c, d]: Seg, t: number): [Seg, Seg] {
  const ab = lerp(a, b, t), bc = lerp(b, c, t), cd = lerp(c, d, t);
  const abc = lerp(ab, bc, t), bcd = lerp(bc, cd, t), m = lerp(abc, bcd, t);
  return [[a, ab, abc, m], [m, bcd, cd, d]];
}
/** Parameter where a left-to-right segment reaches x. */
function tAtX(seg: Seg, x: number) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (bez(seg, m)[0] < x) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}
/** The part of the left-to-right stretch of a run of segments between two x positions. */
function between(segs: Seg[], x0: number, x1: number): Seg[] {
  const out: Seg[] = [];
  for (let seg of segs) {
    if (seg[3][0] <= seg[0][0] || seg[3][0] <= x0 || seg[0][0] >= x1) continue;
    if (seg[0][0] < x0) seg = splitSeg(seg, tAtX(seg, x0))[1];
    if (seg[3][0] > x1) seg = splitSeg(seg, tAtX(seg, x1))[0];
    out.push(seg);
  }
  return out;
}
/** Height of the run at x, rounded like path output. */
const yAt = (segs: Seg[], x: number) => r1(between(segs, x - 1, x)[0][3][1]);
/** A short stretch as one quadratic, right to left, for a door gap on a curved wall. */
const span = (segs: Seg[], x0: number, x1: number) => {
  const part = between(segs, x0, x1);
  const a = part[0][0], d = part[part.length - 1][3];
  const xm = (x0 + x1) / 2, m: Point = [xm, yAt(segs, xm)];
  // Control point of the quadratic through both ends and the middle.
  const via: Point = [r1(2 * m[0] - (a[0] + d[0]) / 2), r1(2 * m[1] - (a[1] + d[1]) / 2)];
  return { from: [r1(d[0]), r1(d[1])] as Point, via, to: [r1(a[0]), r1(a[1])] as Point };
};

// Roof truss outer edge, traced from the plans. 3F and 5F share it: it is one canopy over both levels.
const CANOPY_PTS: Point[] = [[72, 170], [59, 186], [46, 202], [34, 220], [23, 240], [14, 261], [7, 283], [3, 307], [2, 330], [6, 353], [14, 374], [25, 395], [40, 412], [56, 428], [75, 441], [95, 452], [116, 461], [137, 468], [158, 473], [179, 477], [199, 479], [219, 480], [238, 480], [257, 479], [275, 477], [293, 474], [310, 471], [327, 467], [342, 463], [359, 459], [374, 454], [390, 448], [405, 442], [419, 436], [434, 429], [449, 421], [463, 413], [477, 404], [495, 392], [510, 380], [524, 368], [536, 356], [547, 344], [557, 332], [566, 320], [574, 308], [581, 296], [587, 284], [593, 272], [597, 260], [601, 248], [604, 236]];
const CANOPY = stroke(CANOPY_PTS);
// The 3F plan is drawn a touch smaller at the bottom and right; same curve, scaled to sit on its line.
const CANOPY_3F_SEGS = spline(CANOPY_PTS.map(([x, y]): Point => [r1(2 + (x - 2) * 0.995), r1(y > 330 ? 330 + (y - 330) * 0.976 : y)]));
const CANOPY_3F = `M${CANOPY_3F_SEGS[0][0][0]} ${CANOPY_3F_SEGS[0][0][1]} ${curve(CANOPY_3F_SEGS)}`;


// ---------------------------------------------------------------- 1F
const F1_BASE = "M195 72 H323 V3 H633 V72 H693 V168 A32 32 0 1 1 680 230 L630 225 Q600 300 545 350 Q480 385 413 407 Q350 420 300 420 H195 Z";

// ---------------------------------------------------------------- 3F
// The south facade runs right along the canopy: one curve, so the two never drift apart.
const wall3 = (x0: number, x1: number) => curve(reversed(between(CANOPY_3F_SEGS, x0, x1)));
const F3_LOBBY = `M68 100 H505 V185 H573 V267 H365 V352 H445 V${yAt(CANOPY_3F_SEGS, 445)} ${wall3(185, 445)} Q160 400 135 363 Q80 300 18 250 Q35 205 68 182 Z`;
const F3_BACK = "M68 40 H108 V7 H500 V0 H573 V40 H505 V100 H172 V110 H68 Z";
const F3_RESTAURANT = "M505 40 H683 V157 A45 45 0 1 1 650 233 V215 H573 V185 H538 V100 H505 Z";

// ---------------------------------------------------------------- 5F
// Foyer outer wall: east side from the back of house round to the front, west side back up.
const F5_EAST = spline([[500, 98], [540, 116], [563, 140], [578, 175], [585, 212], [582, 245], [568, 285], [540, 324], [512, 350], [488, 362], [447, 370]]);
const F5_WEST = spline([[158, 370], [118, 348], [92, 315], [78, 275], [75, 235], [82, 185], [95, 155], [110, 130], [130, 112], [157, 98]]);
const F5_FOYER = `M157 98 H500 ${curve(F5_EAST)} V405 H395 V370 H357 V400 Q345 410 333 400 V425 Q292 455 250 425 V400 H247 Q236 410 225 400 V370 H158 ${curve(F5_WEST)} Z`;
const F5_BACK = `M70 42 H110 V10 H613 V70 H585 V98 H157 ${curve(reversed(F5_WEST.slice(5)))} H70 Z`;
const F5_HALL = "M180 108 H500 Q548 150 550 215 Q550 285 505 325 H180 Q140 290 140 215 Q142 150 180 108 Z";
// Ocean View shares the foyer's outer curve on its west side.
const F5_OCEAN = `M500 98 H585 V70 H650 V158 A48 48 0 1 1 640 222 H585 L585 212 ${curve(reversed(F5_EAST.slice(0, 4)))} Z`;

export const FLOORS: Floor[] = [
  {
    id: "1f",
    label: "1F",
    width: 758,
    height: 489,
    base: [F1_BASE],
    service: [
      "M195 72 H323 V3 H633 V72 H550 V100 H195 Z",
      // West service block, with the public corridor cut out (opposite winding makes a hole).
      "M195 100 H266 V245 H238 V420 H195 Z M195 190 V268 H238 V190 Z",
      // East block between Yeongju and ICC Plaza (restrooms, stairs).
      "M523 128 H550 V245 H523 Z",
    ],
    labels: [{ t: "text", x: 345, y: 262, text: "1F LOBBY", size: 9 }],
    rooms: [
      { id: "parking", name: "Parking", kind: "other", d: "M28 48 H170 V22 H322 V72 H195 V420 H185 A31 31 0 0 1 125 420 L110 407 L28 315 V122 Q4 108 6 86 Q8 58 28 48 Z", lx: 110, ly: 230 },
      { id: "ieodo-plaza", name: "Ieodo Plaza", kind: "other", d: "M630 225 L680 230 L700 238 H758 V489 H600 L578 410 L545 350 Q600 300 630 225 Z", lx: 672, ly: 330, lw: 110, sub: "outdoor", note: "Outdoor garden by the sea, through the 1F lobby doors." },
      { id: "icc-plaza", name: "ICC Plaza", kind: "other", d: "M550 72 H693 V168 A32 32 0 1 1 680 230 L630 225 L605 215 H550 Z", lx: 612, ly: 160, lw: 100, sub: "shops" },
      { id: "event-hall", name: "Event Hall", kind: "other", x: 266, y: 128, w: 257, h: 117, lx: 308, ly: 186, lw: 80, note: "Divisible exhibition hall; Yeongju and Baekrok are sections of it." },
      { id: "baekrok", name: "Baekrok", kind: "parallel", sub: "Parallel", x: 351, y: 128, w: 57, h: 117, doors: [[380, 245]], estimated: true, indicoRooms: ["Baekrok", "Baekrok Hall"] },
      { id: "yeongju", name: "Yeongju", kind: "parallel", sub: "Parallel", x: 437, y: 128, w: 86, h: 117, doors: [[465, 245], [497, 245]], estimated: true, indicoRooms: ["Yeongju", "Yeongju Hall"] },
      { id: "duty-free", name: "Duty-free shop", kind: "other", d: "M238 302 H550 V345 L545 350 Q480 385 413 407 Q350 420 300 420 H238 Z", lx: 380, ly: 358, lw: 200 },
      {
        id: "entrance-1f", name: "Doors to Ieodo Plaza", kind: "entrance",
        parts: [{ t: "arrow", from: [583, 290], to: [622, 316] }, { t: "text", x: 626, y: 300, text: "Doors", size: 9, anchor: "start" }],
      },
      {
        id: "west-corridor", name: "West corridor", short: "Corridor", kind: "other",
        d: "M195 190 H238 V268 H195 Z", lx: 217, ly: 204, lw: 40, h: 24,
        // Into the restrooms at the south end.
        doors: [[217, 268]],
        parts: [
          { t: "door", from: [238, 249], to: [238, 264] },
          { t: "text", x: 243, y: 256, text: "Auto door", size: 6.5, anchor: "start", bold: true },
          { t: "door", from: [195, 244], to: [195, 258] },
        ],
        note: "Through the automatic door off the 1F lobby. One corridor leads to the restrooms, the elevator and the parking garage.",
      },
      { id: "wc-1f", name: "Restrooms", kind: "restroom", spots: [[215, 287], [540, 188]] },
      { id: "lift-1f", name: "Elevators", kind: "elevator", spots: [[213, 230], [362, 107], [475, 107], [598, 222]] },
      {
        id: "esc-1f", name: "Escalator & stairs", kind: "escalator", note: "These escalators go up to the 3F lobby (main entrance level), arriving across the atrium.",
        parts: [{ t: "esc", x: 517, y: 276, w: 21, h: 6.5 }, { t: "esc", x: 514, y: 284.5, w: 21, h: 6.5 }, { t: "text", x: 526, y: 300, text: "To 3F", size: 8, bold: true }, { t: "stairs", cx: 250, cy: 282, rx: 10, ry: 14 }],
      },
    ],
  },
  {
    id: "3f",
    label: "3F",
    width: 755,
    height: 484,
    base: [F3_BACK, F3_LOBBY, F3_RESTAURANT],
    service: [F3_BACK, "M68 143 H158 V225 H88 V182 H68 Z", "M505 40 H538 V185 H505 Z"],
    decor: [
      // Glass canopy outside the main entrance, and along the south-east facade.
      CANOPY_3F,
      // Glass partition in the side passage, and the internet lounge.
      "M143 110 V143",
      "M58 228 H74 V252 H58 Z",
    ],
    labels: [
      { t: "text", x: 230, y: 440, text: "MAIN LOBBY", size: 10 },
      { t: "text", x: 58, y: 244, text: "Internet", size: 6, anchor: "end" },
    ],
    rooms: [
      { id: "atrium", name: "Atrium", kind: "other", sub: "open to below", d: `M365 267 H573 ${curve(spline([[573, 267], [558, 302], [533, 336], [505, 360], [475, 381], [445, 398]]))} V352 H365 Z`, lx: 515, ly: 300, lw: 60, hatch: true, note: "Open void. The long escalators across it go down to 1F." },
      { id: "halla-a", name: "Halla A", kind: "parallel", sub: "Parallel", x: 360, y: 100, w: 72, h: 122, doors: [[400, 222]], estimated: true, indicoRooms: ["Halla A", "Halla Hall A"], note: "Halla Hall seats about 660 with A and B combined." },
      { id: "halla-b", name: "Halla B", kind: "parallel", sub: "Parallel", x: 432, y: 100, w: 73, h: 122, doors: [[460, 222]], estimated: true, indicoRooms: ["Halla B", "Halla Hall B"], note: "Halla Hall seats about 660 with A and B combined." },
      { id: "samda-a", name: "Samda A", kind: "parallel", sub: "Parallel", x: 158, y: 143, w: 45, h: 82, doors: [[180, 225]], estimated: true, indicoRooms: ["Samda A", "Samda Hall A"], note: "Samda Hall seats about 300 with A and B combined." },
      { id: "samda-b", name: "Samda B", kind: "parallel", sub: "Parallel", x: 203, y: 143, w: 50, h: 82, doors: [[222, 225]], estimated: true, indicoRooms: ["Samda B", "Samda Hall B"], note: "Samda Hall seats about 300 with A and B combined." },
      { id: "registration", name: "Registration", kind: "registration", x: 285, y: 128, w: 45, h: 122, vertical: true, estimated: true, note: "In the lobby between Samda and Halla, straight ahead from the main entrance. Badge pick-up from Sunday 21 March; bring your passport or ID." },
      { id: "room-301", name: "301", kind: "other", x: 213, y: 7, w: 37, h: 68, note: "Not assigned yet." },
      { id: "room-302", name: "302", kind: "other", x: 288, y: 7, w: 32, h: 68, note: "Not assigned yet." },
      { id: "secretariat", name: "300 · Secretariat", short: "300", sub: "Secretariat", kind: "office", x: 325, y: 7, w: 32, h: 43, note: "Room 300. Conference secretariat." },
      { id: "loc-office", name: "303A · LOC Office", short: "303A", sub: "LOC", kind: "office", x: 357, y: 7, w: 38, h: 43, note: "Room 303A. Local organising committee." },
      { id: "working-place", name: "303B · Working place", short: "303B", sub: "Work", kind: "office", x: 395, y: 7, w: 37, h: 43, note: "Room 303B. Working place." },
      { id: "child-care", name: "304 · Child care", short: "304", sub: "Child care", kind: "childcare", x: 432, y: 7, w: 33, h: 43, note: "Room 304. Booking and hours are on Indico." },
      { id: "business-center", name: "Business Center", kind: "other", x: 68, y: 143, w: 72, h: 39 },
      { id: "cloakroom", name: "Cloakroom", kind: "info", x: 107, y: 182, w: 33, h: 43, note: "Luggage and coats." },
      { id: "delizia", name: "Restaurant Delizia", sub: "Closed", note: "Temporarily closed.", kind: "other", d: "M538 40 H683 V157 A45 45 0 1 1 650 233 V215 H573 V185 H538 Z", lx: 618, ly: 140, lw: 100 },
      { id: "convenience", name: "Store", kind: "other", d: `M304.4 433 L345.8 430 V${yAt(CANOPY_3F_SEGS, 345.8)} ${wall3(304.4, 345.8)} Z`, lx: 325, ly: 446, lw: 40 },
      { id: "souvenir", name: "Jeju goods", kind: "other", d: `M345.8 430 L362 393 H416.4 V${yAt(CANOPY_3F_SEGS, 416.4)} ${wall3(345.8, 416.4)} Z`, lx: 385, ly: 416, lw: 50, note: "Local specialty shop." },
      {
        id: "main-entrance", name: "Main Entrance", kind: "entrance",
        note: "Taxi drop-off and bus stop are outside this entrance. The building sits on a slope, so the street level is 3F.",
        parts: [
          // On the curved glazing: the wall curve from (135,363) for t in [0, 0.25].
          { t: "door", from: [135, 363], via: [121.25, 347.25], to: [107, 332.3] },
          { t: "badge", x: 72, y: 398, text: "MAIN ENTRANCE", to: [121, 347] },
        ],
      },
      {
        id: "south-entrance", name: "Side Entrance", kind: "entrance",
        note: "A small pair of doors on the south side of the lobby, just left of the convenience store.",
        parts: [
          // On the south wall curve (420,425) Q330 470 (185,475), for t in [0.69, 0.77].
          { t: "door", ...span(CANOPY_3F_SEGS, 248.8, 269.7) },
          { t: "text", x: 259, y: 458, text: "Entrance", size: 7.5, bold: true },
        ],
      },
      {
        id: "info-desk", name: "Info Desk", kind: "info", note: "Lost & found, taxi help, first aid.",
        parts: [{ t: "path", d: "M179 306 A14 17 0 1 1 178.9 306 Z" }, { t: "text", x: 179, y: 323, text: "i", size: 13, bold: true }, { t: "text", x: 179, y: 350, text: "Info desk", size: 9 }],
      },
      { id: "wc-3f", name: "Restrooms", kind: "restroom", spots: [[153, 90], [280, 32], [525, 145]] },
      { id: "lift-3f", name: "Elevators", kind: "elevator", spots: [[80, 238], [263, 83], [407, 83], [562, 218], [408, 363]] },
      {
        id: "esc-3f", name: "Escalators & stairs", kind: "escalator",
        note: "The four escalators below the info desk go straight up to 5F. The long escalators across the atrium go down to 1F. The small one in the back corridor goes to 4F; ride a second time for 5F.",
        parts: [
          // Up to 5F: two pairs below the info desk.
          { t: "esc", x: 260, y: 367, w: 8, h: 30 }, { t: "esc", x: 270, y: 367, w: 8, h: 30 },
          { t: "esc", x: 295, y: 367, w: 9, h: 30 }, { t: "esc", x: 306, y: 367, w: 9, h: 30 },
          { t: "text", x: 287, y: 408, text: "To 5F", size: 9, bold: true },
          // Long escalators across the atrium, with a landing in the middle.
          { t: "esc", x: 365, y: 292, w: 47, h: 8 }, { t: "esc", x: 365, y: 308, w: 47, h: 8 },
          { t: "path", d: "M412 290 H434 V318 H412 Z" },
          { t: "esc", x: 434, y: 292, w: 49, h: 8 }, { t: "esc", x: 434, y: 308, w: 49, h: 8 },
          { t: "text", x: 424, y: 327, text: "To 1F", size: 9, bold: true },
          // Back corridor: up to 4F.
          { t: "esc", x: 355, y: 77, w: 42, h: 9 },
          { t: "text", x: 376, y: 94, text: "To 4F", size: 7.5, bold: true },
          { t: "stairs", cx: 233, cy: 387, rx: 11, ry: 17 },
          { t: "stairs", cx: 97, cy: 203, rx: 8, ry: 17 },
          { t: "stairs", cx: 340, cy: 388, rx: 11, ry: 17 },
          { t: "stairs", cx: 430, cy: 388, rx: 10, ry: 16 },
        ],
      },
    ],
  },
  {
    id: "5f",
    label: "5F",
    width: 731,
    height: 483,
    base: [F5_BACK, F5_FOYER, "M613 42 H685 V148 H650 V70 H613 Z", F5_OCEAN],
    decor: [
      // Steel canopy around the outside of the foyer.
      CANOPY,
      F5_HALL,
    ],
    service: [F5_BACK],
    labels: [{ t: "text", x: 450, y: 30, text: "BACK OF HOUSE", size: 8 }],
    rooms: [
      {
        id: "foyer-5f", name: "Foyer", sub: "Posters", kind: "poster", evenodd: true, lx: 117, ly: 215, lw: 40, estimated: true,
        d: `${F5_FOYER} ${F5_HALL}`,
        // Openings in the hall's outer wall, in line with the hall doors.
        doors: [[202, 325], [272, 325], [390, 325], [470, 325]],
        boards: "M110 125 Q72 220 100 305 Q135 360 200 356 H445 Q520 345 555 280 Q572 220 545 150",
        note: "Poster boards line the foyer around Tamna Hall and continue upstairs: take the escalator in front of Tamna A.",
      },
      {
        id: "posters-up", name: "Escalator up to more posters", kind: "poster", estimated: true,
        note: "The poster area continues on the level above.",
        parts: [{ t: "esc", x: 334, y: 330, w: 12, h: 14 }, { t: "text", x: 350, y: 346, text: "Up: more posters", size: 7.5, anchor: "start", bold: true }],
      },
      {
        id: "tamna-a", name: "Tamna A", sub: "Plenary", kind: "plenary", d: "M327 115 H497 Q541 154 543 215 Q543 283 502 318 H327 Z", lx: 452, ly: 215, lw: 110,
        capacity: 1500, doors: [[390, 318], [470, 318]], seats: { cx: 250, cy: 215, r0: 150, r1: 300, step: 7 },
        parts: [{ t: "path", d: "M327 135 H358 Q390 215 358 295 H327 Z", fill: true }, { t: "text", x: 345, y: 215, text: "STAGE", size: 8, rotate: -90 }],
        indicoRooms: ["Tamna A", "Tamna Hall A", "Tamna Hall"], note: "Fixed raked seating. Opening, plenaries and closing.",
      },
      {
        id: "tamna-bc", name: "Tamna B+C", sub: "Lunch", kind: "catering", d: "M327 115 H183 Q149 154 147 215 Q147 286 183 318 H327 Z", lx: 245, ly: 215, lw: 140,
        tables: true, doors: [[202, 318], [272, 318]], note: "Tamna B and C are opened into one hall for lunch, next to the plenary.",
      },
      { id: "ocean-view", name: "Ocean View", kind: "other", d: F5_OCEAN, lx: 640, ly: 180, lw: 90 },
      { id: "terrace", name: "Terrace", kind: "other", d: "M613 42 H685 V148 H650 V70 H613 Z", lx: 667, ly: 105, lw: 34, vertical: true },
      { id: "wc-5f", name: "Restrooms", kind: "restroom", spots: [[117, 103], [523, 83], [543, 178], [542, 258]] },
      { id: "lift-5f", name: "Elevators", kind: "elevator", spots: [[80, 240], [267, 85], [412, 85], [567, 228], [408, 380]] },
      {
        id: "esc-5f", name: "Escalators & stairs", kind: "escalator", note: "The four escalators at the front come up from the 3F lobby.",
        parts: [
          { t: "esc", x: 255, y: 366, w: 13, h: 56 }, { t: "esc", x: 273, y: 366, w: 14, h: 56 },
          { t: "esc", x: 290, y: 366, w: 15, h: 56 }, { t: "esc", x: 310, y: 366, w: 13, h: 56 },
          { t: "text", x: 289, y: 436, text: "From 3F", size: 8, bold: true },
          { t: "esc", x: 355, y: 79, w: 48, h: 11 },
          { t: "stairs", cx: 237, cy: 387, rx: 9, ry: 14 },
          { t: "stairs", cx: 345, cy: 387, rx: 9, ry: 14 },
          { t: "stairs", cx: 433, cy: 388, rx: 9, ry: 14 },
        ],
      },
    ],
  },
];

export const ROUTES: Route[] = [
  {
    id: "registration",
    label: "Main entrance → Registration",
    steps: [
      "Arrive at the main entrance on 3F (street level, taxi and bus drop-off).",
      "Walk straight across the lobby past the info desk.",
      "Registration runs along the lobby between Samda and Halla halls.",
    ],
    paths: { "3f": [[[110, 348], [200, 285], [282, 245]]] },
  },
  {
    id: "plenary",
    label: "Main entrance → Plenary (5F)",
    steps: [
      "From the main entrance, head for the four escalators just past the info desk.",
      "Ride up to 5F. You arrive at the front of the foyer.",
      "Tamna A doors are ahead and to the right.",
    ],
    paths: {
      "3f": [[[110, 348], [230, 345], [285, 362]]],
      "5f": [[[289, 368], [300, 345], [390, 342], [390, 322]]],
    },
  },
  {
    id: "halls-3f",
    label: "Main entrance → Halla & Samda (3F)",
    steps: ["Both halls are on the entrance level.", "Samda is on the left past the info desk; Halla is beyond registration."],
    paths: { "3f": [[[110, 348], [200, 285], [200, 232]], [[200, 285], [400, 265], [400, 228]]] },
  },
  {
    id: "halls-1f",
    label: "Main entrance → Yeongju & Baekrok (1F)",
    steps: ["Cross the 3F lobby to the long escalators over the atrium.", "Ride down to 1F.", "The halls open onto the 1F lobby, opposite the duty-free shop."],
    paths: {
      "3f": [[[110, 348], [150, 290], [362, 300]]],
      "1f": [[[514, 283], [497, 266], [497, 248]], [[497, 266], [380, 266], [380, 248]]],
    },
  },
  {
    id: "posters",
    label: "Plenary → Posters",
    steps: ["Posters start in the 5F foyer right outside Tamna Hall.", "More boards continue upstairs: take the escalator in front of Tamna A."],
    paths: { "5f": [[[390, 322], [390, 337], [348, 337]]] },
  },
];
