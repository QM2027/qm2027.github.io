import { INDICO_DATES } from "./indico-links";

// Copied from Indico's Important Dates page (INDICO_DATES), which stays the source: the app home
// shows the next of these with a link there. Dates without a time on Indico count to the end of
// the day (KST). Re-check against Indico when that page changes.

export type KeyDate = { at: string; labels: string[]; timed: boolean };

export const KEY_DATES: KeyDate[] = [
  { at: "2026-06-20T00:00:00+09:00", timed: true, labels: ["Registration opening", "Abstract submission opening"] },
  { at: "2026-09-30T23:59:00+09:00", timed: true, labels: ["Abstract submission closing"] },
  { at: "2026-11-07T23:59:00+09:00", timed: true, labels: ["Early-career researcher support application deadline"] },
  { at: "2026-11-30T23:59:00+09:00", timed: false, labels: ["Abstract acceptance notification"] },
  { at: "2026-12-10T23:59:00+09:00", timed: false, labels: ["Early-career researcher support recipient notification"] },
  {
    at: "2026-12-31T23:59:00+09:00",
    timed: true,
    labels: ["Early-bird registration closing", "Child care services application deadline"],
  },
  {
    at: "2027-01-31T23:59:00+09:00",
    timed: true,
    labels: [
      "Regular registration closing",
      "Visa invitation letter request deadline",
      "Excursion registration deadline",
      "Accompanying person registration deadline",
    ],
  },
];

/** Registration on Indico closes here; the app home stops offering the Register button after it. */
export const REGISTRATION_CLOSES = "2027-01-31T23:59:00+09:00";

export const KEY_DATES_SOURCE = INDICO_DATES;
