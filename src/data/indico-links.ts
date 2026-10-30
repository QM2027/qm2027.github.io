const EVENT = "https://indico.cern.ch/event/1622375";

export type IndicoLink = { label: string; href: string };
export type IndicoGroup = { title: string; links: IndicoLink[] };

/** Text-heavy content lives on Indico; this site only deep-links to it. */
export const INDICO_GROUPS: IndicoGroup[] = [
  {
    title: "Conference",
    links: [
      { label: "Overview", href: `${EVENT}/overview` },
      { label: "Important Dates", href: `${EVENT}/page/41198-important-dates` },
      { label: "Committee", href: `${EVENT}/page/41202-committee` },
      { label: "Supporters", href: `${EVENT}/page/41203-supporters` },
      { label: "Code of Conduct", href: `${EVENT}/page/41204-code-of-conduct` },
      { label: "Previous Meetings", href: `${EVENT}/page/41971-previous-meetings` },
    ],
  },
  {
    title: "Abstracts & Program",
    links: [
      { label: "Call for Abstracts", href: `${EVENT}/abstracts/` },
      { label: "Program at a Glance", href: `${EVENT}/page/43130-program-at-a-glance` },
      { label: "Timetable", href: `${EVENT}/timetable/` },
      { label: "Proceedings", href: `${EVENT}/page/41199-proceedings` },
    ],
  },
  {
    title: "Registration & Stay",
    links: [
      { label: "Registration Guidelines", href: `${EVENT}/page/43164-registration-guidelines` },
      { label: "Register", href: `${EVENT}/registrations/` },
      { label: "Participant List", href: `${EVENT}/registrations/participants` },
      { label: "Accommodation", href: `${EVENT}/page/41208-accommodation` },
      { label: "Conference Venue", href: `${EVENT}/page/41212-conference-venue` },
    ],
  },
  {
    title: "During the Week",
    links: [
      { label: "Excursions", href: `${EVENT}/page/41216-excursions` },
      { label: "Hallasan Summit Hiking", href: `${EVENT}/page/44280-hallasan-summit-hiking-information` },
      { label: "Child Care Services", href: `${EVENT}/page/41209-child-care-services` },
      { label: "Visit Jeju", href: `${EVENT}/page/41217-visit-jeju` },
    ],
  },
  {
    title: "Early-Career & Satellites",
    links: [
      { label: "Early-Career Researcher Day", href: `${EVENT}/page/41220-early-career-researcher-day` },
      { label: "Early-Career Support", href: `${EVENT}/page/41219-early-career-researcher-support` },
      { label: "Satellite Meetings", href: `${EVENT}/page/41221-satellite-meetings` },
    ],
  },
];

export const INDICO_TIMETABLE = `${EVENT}/timetable/`;
export const INDICO_ACCOMMODATION = `${EVENT}/page/41208-accommodation`;
