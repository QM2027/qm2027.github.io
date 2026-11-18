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

// ---------------------------------------------------------------- 1F
const F1_BASE = "M195 72 H323 V3 H633 V72 H693 V168 A32 32 0 1 1 680 230 L630 225 Q600 300 545 350 Q480 385 413 407 Q350 420 300 420 H195 Z";

// ---------------------------------------------------------------- 3F
const F3_LOBBY =
  "M68 100 H505 V190 H552 V267 H365 V352 H445 V410 L420 425 Q330 470 185 475 Q160 400 135 363 Q80 300 18 250 Q35 205 70 182 L68 145 Z";
const F3_BACK = "M68 40 H108 V7 H500 V0 H573 V40 H505 V100 H172 V110 H68 Z";
const F3_RESTAURANT = "M505 40 H683 V157 A45 45 0 1 1 650 233 V215 H573 V185 H538 V100 H505 Z";

// ---------------------------------------------------------------- 5F
const F5_FOYER =
  "M150 98 H500 Q560 130 576 200 Q582 290 500 362 L447 370 V405 H395 V370 H357 V400 Q345 410 333 400 V425 Q292 455 250 425 V400 H247 Q236 410 225 400 V370 H158 Q100 335 80 280 Q66 220 85 160 Q95 128 112 112 Z";
const F5_BACK = "M70 42 H110 V10 H613 V72 H585 V100 H500 L150 98 H112 Q100 130 80 185 H70 Z";
const F5_HALL = "M180 108 H500 Q548 150 550 215 Q550 285 505 325 H180 Q140 290 140 215 Q142 150 180 108 Z";
const F5_OCEAN = "M545 108 L585 100 V72 H650 V158 A48 48 0 1 1 640 222 H590 Q585 160 545 108 Z";

export const FLOORS: Floor[] = [
  {
    id: "1f",
    label: "1F",
    width: 758,
    height: 489,
    base: [F1_BASE],
    service: ["M195 72 H323 V3 H633 V72 H550 V100 H195 Z"],
    decor: ["M195 100 H530 V128", "M266 100 V128"],
    labels: [{ t: "text", x: 300, y: 262, text: "1F LOBBY", size: 9 }],
    rooms: [
      { id: "parking", name: "Parking", kind: "other", d: "M40 48 H195 V470 H150 L8 330 V100 Q8 60 40 48 Z", lx: 105, ly: 230 },
      { id: "ieodo-plaza", name: "Ieodo Plaza", kind: "other", d: "M630 225 L680 230 Q700 238 720 238 H758 V489 H600 L578 410 L545 350 Q600 300 630 225 Z", lx: 672, ly: 330, lw: 110, sub: "outdoor", note: "Outdoor garden by the sea, through the 1F lobby doors." },
      { id: "icc-plaza", name: "ICC Plaza", kind: "other", d: "M550 75 H693 V168 A32 32 0 1 1 680 230 L630 225 L605 215 H550 Z", lx: 612, ly: 160, lw: 100, sub: "shops" },
      { id: "event-hall", name: "Event Hall", kind: "other", x: 266, y: 128, w: 257, h: 115, lx: 308, ly: 186, lw: 80, note: "Divisible exhibition hall; Yeongju and Baekrok are sections of it." },
      { id: "baekrok", name: "Baekrok", kind: "parallel", sub: "Parallel", x: 351, y: 128, w: 57, h: 115, doors: [[380, 243]], estimated: true, indicoRooms: ["Baekrok", "Baekrok Hall"] },
      { id: "yeongju", name: "Yeongju", kind: "parallel", sub: "Parallel", x: 437, y: 128, w: 86, h: 115, doors: [[465, 243], [497, 243]], estimated: true, indicoRooms: ["Yeongju", "Yeongju Hall"] },
      { id: "duty-free", name: "Duty-free shop", kind: "other", d: "M238 302 H550 V345 Q480 385 413 407 Q350 420 300 420 H238 Z", lx: 380, ly: 358, lw: 200 },
      {
        id: "entrance-1f", name: "Doors to Ieodo Plaza", kind: "entrance",
        parts: [{ t: "arrow", from: [583, 290], to: [622, 316] }, { t: "text", x: 626, y: 300, text: "Doors", size: 9, anchor: "start" }],
      },
      { id: "wc-1f", name: "Restrooms", kind: "restroom", spots: [[215, 287], [540, 188]] },
      { id: "lift-1f", name: "Elevators", kind: "elevator", spots: [[213, 230], [362, 107], [475, 107], [598, 222]] },
      {
        id: "esc-1f", name: "Escalator & stairs", kind: "escalator",
        parts: [{ t: "esc", x: 517, y: 276, w: 21, h: 6.5 }, { t: "esc", x: 514, y: 284.5, w: 21, h: 6.5 }, { t: "stairs", cx: 250, cy: 282, rx: 10, ry: 14 }],
      },
    ],
  },
  {
    id: "3f",
    label: "3F",
    width: 755,
    height: 484,
    base: [F3_BACK, F3_LOBBY, F3_RESTAURANT],
    service: [F3_BACK, "M70 143 H158 V225 H88 V182 H70 Z", "M505 40 H538 V185 H505 Z"],
    decor: [
      // Glass canopy outside the main entrance, and along the south-east facade.
      "M70 182 Q15 225 8 300 Q5 400 110 450 Q160 475 250 482",
      "M250 482 Q380 478 470 430 Q560 370 605 245",
      // Glass partition in the side passage, and the internet lounge.
      "M143 110 V143",
      "M58 228 H74 V252 H58 Z",
    ],
    labels: [
      { t: "text", x: 230, y: 440, text: "MAIN LOBBY", size: 10 },
      { t: "text", x: 58, y: 244, text: "Internet", size: 6, anchor: "end" },
    ],
    rooms: [
      { id: "atrium", name: "Atrium", kind: "other", sub: "open to below", d: "M365 267 H552 Q548 315 505 352 H365 Z", lx: 515, ly: 300, lw: 60, hatch: true, note: "Open void. The long escalators across it go up to 4F." },
      { id: "halla-a", name: "Halla A", kind: "parallel", sub: "Parallel", x: 360, y: 103, w: 72, h: 119, doors: [[400, 222]], estimated: true, indicoRooms: ["Halla A", "Halla Hall A"], note: "Halla Hall seats about 660 with A and B combined." },
      { id: "halla-b", name: "Halla B", kind: "parallel", sub: "Parallel", x: 432, y: 103, w: 71, h: 119, doors: [[460, 222]], estimated: true, indicoRooms: ["Halla B", "Halla Hall B"], note: "Halla Hall seats about 660 with A and B combined." },
      { id: "samda-a", name: "Samda A", kind: "parallel", sub: "Parallel", x: 158, y: 143, w: 45, h: 82, doors: [[180, 225]], estimated: true, indicoRooms: ["Samda A", "Samda Hall A"], note: "Samda Hall seats about 300 with A and B combined." },
      { id: "samda-b", name: "Samda B", kind: "parallel", sub: "Parallel", x: 203, y: 143, w: 50, h: 82, doors: [[222, 225]], estimated: true, indicoRooms: ["Samda B", "Samda Hall B"], note: "Samda Hall seats about 300 with A and B combined." },
      { id: "registration", name: "Registration", kind: "registration", x: 285, y: 128, w: 45, h: 122, vertical: true, estimated: true, note: "In the lobby between Samda and Halla, straight ahead from the main entrance. Badge pick-up from Sunday 21 March; bring your passport or ID." },
      { id: "room-301", name: "301", kind: "other", x: 213, y: 10, w: 37, h: 65, note: "Not assigned yet." },
      { id: "room-302", name: "302", kind: "other", x: 288, y: 10, w: 32, h: 65, note: "Not assigned yet." },
      { id: "secretariat", name: "300 · Secretariat", short: "300", sub: "Secretariat", kind: "office", x: 325, y: 10, w: 32, h: 40, note: "Room 300. Conference secretariat." },
      { id: "loc-office", name: "303A · LOC Office", short: "303A", sub: "LOC", kind: "office", x: 357, y: 10, w: 38, h: 40, note: "Room 303A. Local organising committee." },
      { id: "working-place", name: "303B · Working place", short: "303B", sub: "Work", kind: "office", x: 395, y: 10, w: 35, h: 40, note: "Room 303B. Working place." },
      { id: "child-care", name: "304 · Child care", short: "304", sub: "Child care", kind: "childcare", x: 432, y: 10, w: 33, h: 40, note: "Room 304. Booking and hours are on Indico." },
      { id: "business-center", name: "Business Center", kind: "other", x: 70, y: 143, w: 70, h: 39 },
      { id: "cloakroom", name: "Cloakroom", kind: "info", x: 107, y: 182, w: 33, h: 43, note: "Luggage and coats." },
      { id: "melizia", name: "Restaurant Melizia", kind: "other", d: "M538 40 H683 V157 A45 45 0 1 1 650 233 V215 H573 V185 H538 Z", lx: 618, ly: 140, lw: 100 },
      { id: "convenience", name: "Store", kind: "other", d: "M302 433 L345 430 V455 L302 462 Z", lx: 323, ly: 446, lw: 40 },
      { id: "souvenir", name: "Jeju goods", kind: "other", d: "M345 430 L362 393 H418 V425 L345 455 Z", lx: 385, ly: 416, lw: 50, note: "Local specialty shop." },
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
        id: "info-desk", name: "Info Desk", kind: "info", note: "Lost & found, taxi help, first aid.",
        parts: [{ t: "path", d: "M179 306 A14 17 0 1 1 178.9 306 Z" }, { t: "text", x: 179, y: 323, text: "i", size: 13, bold: true }, { t: "text", x: 179, y: 350, text: "Info desk", size: 9 }],
      },
      { id: "wc-3f", name: "Restrooms", kind: "restroom", spots: [[153, 90], [280, 32], [525, 145]] },
      { id: "lift-3f", name: "Elevators", kind: "elevator", spots: [[80, 238], [263, 83], [407, 83], [562, 218], [408, 363]] },
      {
        id: "esc-3f", name: "Escalators & stairs", kind: "escalator",
        note: "The four escalators below the info desk go straight up to 5F. The long escalators across the atrium go to 4F; ride a second time for 5F.",
        parts: [
          // Up to 5F: two pairs below the info desk.
          { t: "esc", x: 260, y: 367, w: 8, h: 30 }, { t: "esc", x: 270, y: 367, w: 8, h: 30 },
          { t: "esc", x: 295, y: 367, w: 9, h: 30 }, { t: "esc", x: 306, y: 367, w: 9, h: 30 },
          { t: "text", x: 287, y: 408, text: "To 5F", size: 9, bold: true },
          // Long escalators across the atrium, with a landing in the middle.
          { t: "esc", x: 365, y: 292, w: 47, h: 8 }, { t: "esc", x: 365, y: 308, w: 47, h: 8 },
          { t: "path", d: "M412 290 H434 V318 H412 Z" },
          { t: "esc", x: 434, y: 292, w: 49, h: 8 }, { t: "esc", x: 434, y: 308, w: 49, h: 8 },
          { t: "text", x: 424, y: 327, text: "To 4F", size: 9, bold: true },
          // Back corridor.
          { t: "esc", x: 355, y: 77, w: 42, h: 9 },
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
      "M75 172 Q-5 260 10 320 Q40 430 250 475 Q420 470 560 375 Q605 320 612 240",
      F5_HALL,
    ],
    service: [F5_BACK],
    labels: [{ t: "text", x: 450, y: 30, text: "BACK OF HOUSE", size: 8 }],
    rooms: [
      {
        id: "foyer-5f", name: "Foyer", sub: "Posters", kind: "poster", evenodd: true, lx: 120, ly: 205, lw: 40, estimated: true,
        d: `${F5_FOYER} ${F5_HALL}`,
        boards: "M110 125 Q72 220 100 305 Q135 360 200 356 H445 Q520 345 555 280 Q572 220 545 150",
        note: "Poster boards line the foyer around Tamna Hall and continue upstairs: take the escalator in front of Tamna A.",
      },
      {
        id: "posters-up", name: "Escalator up to more posters", kind: "poster", estimated: true,
        note: "The poster area continues on the level above.",
        parts: [{ t: "esc", x: 334, y: 330, w: 12, h: 14 }, { t: "text", x: 350, y: 346, text: "Up: more posters", size: 7.5, anchor: "start", bold: true }],
      },
      {
        id: "tamna-a", name: "Tamna A", sub: "Plenary", kind: "plenary", d: "M327 115 H497 Q540 155 542 215 Q540 280 500 315 H327 Z", lx: 452, ly: 215, lw: 110,
        capacity: 1500, doors: [[390, 315], [470, 315]], seats: { cx: 250, cy: 215, r0: 150, r1: 300, step: 7 },
        parts: [{ t: "path", d: "M327 135 H358 Q390 215 358 295 H327 Z", fill: true }, { t: "text", x: 345, y: 215, text: "STAGE", size: 8, rotate: -90 }],
        indicoRooms: ["Tamna A", "Tamna Hall A", "Tamna Hall"], note: "Fixed raked seating. Opening, plenaries and closing.",
      },
      {
        id: "tamna-bc", name: "Tamna B+C", sub: "Lunch", kind: "catering", d: "M327 115 H175 Q145 160 148 215 Q148 270 172 315 H327 Z", lx: 245, ly: 215, lw: 140,
        tables: true, doors: [[202, 315], [272, 315]], note: "Tamna B and C are opened into one hall for lunch, next to the plenary.",
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
    steps: ["Take an elevator from the 3F lobby down to 1F.", "On 1F, the halls open onto the lobby, opposite the duty-free shop."],
    paths: { "1f": [[[598, 240], [497, 262], [497, 248]], [[497, 262], [380, 262], [380, 248]]] },
  },
  {
    id: "posters",
    label: "Plenary → Posters",
    steps: ["Posters start in the 5F foyer right outside Tamna Hall.", "More boards continue upstairs: take the escalator in front of Tamna A."],
    paths: { "5f": [[[390, 322], [390, 337], [348, 337]]] },
  },
];
