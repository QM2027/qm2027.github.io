export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a public asset path with the deploy base path. `<Link>` does this on its own. */
export function withBase(path: string): string {
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The site's live domain, where the data repos (program-data, weather-data, tour-data) are published
 * next to it. Production reads them from its own origin; development reads the live files from here.
 * It must be the domain itself: github.io answers with a redirect that has no CORS headers. Change it
 * when the site moves (e.g. to the conference's official domain).
 */
export const LIVE_ORIGIN = "https://qm2027.isaack.dev";
