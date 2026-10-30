export const SITE = {
  guideName: "QM2027 Jeju Visitor Guide",
  name: "Quark Matter 2027",
  shortName: "QM2027",
  tagline:
    "32nd International Conference on Ultra-relativistic Nucleus-Nucleus Collisions",
  dates: "21–27 March 2027",
  start: "2027-03-21T08:30:00+09:00",
  end: "2027-03-27T13:00:00+09:00",
  venue: "Jeju International Convention Center (ICC Jeju)",
  city: "Jeju, Korea",
  email: "secretariat@qm2027.kr",
  indico: "https://indico.cern.ch/event/1622375/",
} as const;

/** Absolute site URL (including any base path), set by the deploy workflow. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const NAV = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/explore/", label: "Explore", icon: "map" },
  { href: "/venue/", label: "Venue", icon: "building" },
  { href: "/travel/", label: "Travel", icon: "route" },
  { href: "/program/", label: "Program", icon: "calendar" },
] as const;
