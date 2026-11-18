// Indico room name → floor-plan room id (see src/data/venue.ts). A room's own `indicoRooms` list
// in venue.ts matches too; this table is for names that differ, without editing the plan data.
// It drives "Show on floor plan" in the program and the Now / Next card on the venue map.

export const INDICO_ROOM_MAP: Record<string, string> = {
  // QM2025 (Frankfurt) rooms placed on ICC Jeju, only so the QM2025 preview can be tested. The
  // pairing is arbitrary; remove these once QM2027 is published.
  "HZ 1 + HZ 2": "tamna-a",
  "HZ 3": "halla-a",
  "HZ 4": "halla-b",
  "HZ 5": "samda-a",
  "HZ 6": "samda-b",
  "HZ 7": "yeongju",
  H1: "room-301",
  H2: "room-302",
  "HZ 13": "ocean-view",

  // QM2027: add the Indico room names here when the timetable is published, if they don't match
  // the names in venue.ts (e.g. "Halla Hall A (3F)": "halla-a").
};

/** Floor-plan rooms that some Indico room maps to. */
export const MAPPED_ROOM_IDS = new Set(Object.values(INDICO_ROOM_MAP));
