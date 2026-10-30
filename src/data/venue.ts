// SCHEMATIC PLACEHOLDER — room names, positions and floors are illustrative.
// Replace with the official ICC Jeju floor plan once the organisers confirm room allocation.
// Coordinates are in a 400 × 260 SVG viewBox.

export type RoomKind =
  | "plenary"
  | "parallel"
  | "poster"
  | "registration"
  | "catering"
  | "restroom"
  | "elevator"
  | "nursing"
  | "info";

export type Room = {
  id: string;
  name: string;
  kind: RoomKind;
  x: number;
  y: number;
  w: number;
  h: number;
  note?: string;
  capacity?: number;
  /** Room names as they appear in the Indico timetable, for "now / next" sessions. */
  indicoRooms?: string[];
};

export type Floor = { id: string; label: string; rooms: Room[] };

// Theme greys by role; the accent is reserved for where you go first (registration).
export const ROOM_KINDS: Record<RoomKind, { label: string; color: string; facility?: boolean }> = {
  plenary: { label: "Plenary", color: "var(--foreground)" },
  parallel: { label: "Parallel sessions", color: "var(--foreground)" },
  poster: { label: "Posters", color: "var(--muted)" },
  registration: { label: "Registration", color: "var(--tangerine)", facility: true },
  catering: { label: "Coffee & lunch", color: "var(--muted)", facility: true },
  restroom: { label: "Restrooms", color: "var(--muted)", facility: true },
  elevator: { label: "Elevators & stairs", color: "var(--muted)", facility: true },
  nursing: { label: "Nursing / child care", color: "var(--muted)", facility: true },
  info: { label: "Info & first aid", color: "var(--muted)", facility: true },
};

export const FLOORS: Floor[] = [
  {
    id: "1f",
    label: "1F",
    rooms: [
      { id: "registration", name: "Registration Desk", kind: "registration", x: 20, y: 150, w: 120, h: 50, note: "Badge pick-up from Sunday 21 March. Bring your passport or ID." },
      { id: "info-desk", name: "Info & First Aid", kind: "info", x: 150, y: 150, w: 70, h: 50, note: "Lost & found, local SIM and taxi help." },
      { id: "poster-hall", name: "Poster Hall", kind: "poster", x: 20, y: 20, w: 240, h: 110, note: "Posters stay up all week. Poster sessions are listed in the program." },
      { id: "coffee-1f", name: "Coffee Station", kind: "catering", x: 270, y: 20, w: 110, h: 60 },
      { id: "wc-1f", name: "Restrooms", kind: "restroom", x: 270, y: 90, w: 50, h: 40 },
      { id: "lift-1f", name: "Elevators", kind: "elevator", x: 330, y: 90, w: 50, h: 40 },
      { id: "nursing-1f", name: "Nursing Room", kind: "nursing", x: 230, y: 150, w: 70, h: 50, note: "Child care details are on Indico." },
      { id: "entrance", name: "Main Entrance", kind: "info", x: 310, y: 150, w: 70, h: 90, note: "Taxi stand and bus stop outside." },
    ],
  },
  {
    id: "3f",
    label: "3F",
    rooms: [
      { id: "plenary-hall", name: "Plenary Hall", kind: "plenary", x: 20, y: 20, w: 240, h: 150, capacity: 900, note: "All plenary sessions, the opening and the closing." },
      { id: "foyer-3f", name: "Foyer · Coffee", kind: "catering", x: 20, y: 180, w: 240, h: 60, note: "Coffee breaks between plenaries." },
      { id: "wc-3f", name: "Restrooms", kind: "restroom", x: 270, y: 20, w: 50, h: 50 },
      { id: "lift-3f", name: "Elevators", kind: "elevator", x: 330, y: 20, w: 50, h: 50 },
      { id: "speaker-ready", name: "Speaker Ready Room", kind: "info", x: 270, y: 80, w: 110, h: 60, note: "Upload and test your slides at least one session before your talk." },
    ],
  },
  {
    id: "5f",
    label: "5F",
    rooms: [
      { id: "parallel-1", name: "Parallel Room 1", kind: "parallel", x: 20, y: 20, w: 110, h: 90, capacity: 200 },
      { id: "parallel-2", name: "Parallel Room 2", kind: "parallel", x: 140, y: 20, w: 110, h: 90, capacity: 200 },
      { id: "parallel-3", name: "Parallel Room 3", kind: "parallel", x: 20, y: 150, w: 110, h: 90, capacity: 150 },
      { id: "parallel-4", name: "Parallel Room 4", kind: "parallel", x: 140, y: 150, w: 110, h: 90, capacity: 150 },
      { id: "lunch-5f", name: "Lunch Hall", kind: "catering", x: 260, y: 20, w: 120, h: 120, note: "Lunch is included with registration." },
      { id: "wc-5f", name: "Restrooms", kind: "restroom", x: 260, y: 150, w: 55, h: 45 },
      { id: "lift-5f", name: "Elevators", kind: "elevator", x: 325, y: 150, w: 55, h: 45 },
    ],
  },
];
