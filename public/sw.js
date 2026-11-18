// Offline support for the visitor guide. Plain JS so it can be served as-is from /public.
// Bump VERSION when the caching strategy changes; hashed build assets need no bumping.
const VERSION = "v3";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const TILES = `tiles-${VERSION}`;
const DATA = `data-${VERSION}`;
const PROGRAM = `program-${VERSION}`;
const MAX_TILES = 600;
/** Hashed program files kept for offline use: a few versions of the program, abstracts and materials. */
const MAX_PROGRAM_FILES = 9;

const BASE = new URL(self.registration.scope).pathname; // "/" or "/<repo>/"
const SHELL = [
  "", "explore/", "venue/", "travel/", "program/", "getting-there/",
  "explore/plan/", "explore/season/", "explore/food/", "explore/run/",
  "explore/science/", "explore/hallasan/", "explore/companions/",
  "explore/passport/", "explore/korea/",
].map((p) => BASE + p);
// QM2027/program-data is published at the host root, next to this site. index.json names the
// current hashed files; those never change once published.
const PROGRAM_DATA = "/program-data/";
const PROGRAM_INDEX = `${PROGRAM_DATA}index.json`;
/** On weak venue Wi-Fi, show the cached program rather than wait for the network. */
const INDEX_TIMEOUT_MS = 4000;

self.addEventListener("install", (event) => {
  // Pre-cache every page so the guide works offline after the first visit.
  event.waitUntil(
    caches.open(PAGES).then((c) => Promise.allSettled([...SHELL, PROGRAM_INDEX].map((url) => c.add(url)))).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = [PAGES, ASSETS, TILES, DATA, PROGRAM];
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (const k of keys.slice(0, Math.max(0, keys.length - max))) await cache.delete(k);
}

/** Fresh when online, cached when not. With `timeoutMs`, a slow network falls back to the cache. */
async function networkFirst(request, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  // RSC payload URLs carry a changing ?_rsc= token, so match on the path alone.
  const cached = async () => (await cache.match(request, { ignoreSearch: true })) ?? (await caches.match(request));
  const network = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  });
  network.catch(() => {}); // may settle after a timeout has already answered from the cache
  try {
    if (timeoutMs) {
      const first = await Promise.race([network, new Promise((r) => setTimeout(r, timeoutMs))]);
      if (first) return first;
      const hit = await cached();
      if (hit) return hit;
    }
    return await network;
  } catch {
    const hit = await cached();
    if (hit) return hit;
    if (request.mode === "navigate") return (await cache.match(BASE)) ?? Response.error();
    return Response.error();
  }
}

async function cacheFirst(request, cacheName, max) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok || res.type === "opaque") {
    await cache.put(request, res.clone());
    if (max) trim(cacheName, max);
  }
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.hostname.endsWith("tile.openstreetmap.org")) {
    event.respondWith(cacheFirst(request, TILES, MAX_TILES));
  } else if (url.hostname === "api.open-meteo.com" || url.hostname === "api.frankfurter.dev") {
    event.respondWith(networkFirst(request, DATA));
  } else if (url.origin === self.location.origin && url.pathname.startsWith(PROGRAM_DATA)) {
    if (url.pathname === PROGRAM_INDEX) event.respondWith(networkFirst(request, PAGES, INDEX_TIMEOUT_MS));
    else event.respondWith(cacheFirst(request, PROGRAM, MAX_PROGRAM_FILES));
  } else if (url.origin === self.location.origin) {
    if (request.mode === "navigate" || url.pathname.endsWith(".txt") || url.pathname.endsWith(".json")) {
      // Pages and RSC payloads: fresh when online, cached when not.
      event.respondWith(networkFirst(request, PAGES));
    } else if (url.pathname.startsWith(`${BASE}_next/static/`) || url.pathname.startsWith(`${BASE}icons/`)) {
      event.respondWith(cacheFirst(request, ASSETS));
    }
  }
});
