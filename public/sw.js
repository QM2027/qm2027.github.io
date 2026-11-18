// Offline support for the visitor guide. Plain JS so it can be served as-is from /public.
// Bump VERSION when the caching strategy changes; hashed build assets need no bumping.
const VERSION = "v3";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const TILES = `tiles-${VERSION}`;
const DATA = `data-${VERSION}`;
// Deliberately not tied to VERSION: changing the caching strategy must never drop the offline
// program. It holds index.json and exactly the files that index names, nothing else.
const PROGRAM = "program-v3";
const MAX_TILES = 600;

const BASE = new URL(self.registration.scope).pathname; // "/" or "/<repo>/"
// The build's scripts, styles and Latin fonts, relative to BASE. scripts/precache.mjs fills this in
// after `next build`, which also makes every deploy's sw.js new, so browsers install it.
const PRECACHE = [];
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
const PROGRAM_FILES = ["program", "abstracts", "materials"];
/** On weak venue Wi-Fi, show the cached program rather than wait for the network. */
const INDEX_TIMEOUT_MS = 4000;
/** Whenever the guide is in use, fetch the latest program at most this often, on any page. */
const SYNC_MS = 5 * 60_000;

self.addEventListener("install", (event) => {
  // Pre-cache every page and the current program so the guide works offline after the first visit,
  // even if the visitor never opened the program. A first install activates right away; an update
  // waits until the visitor taps "Update" (see PwaSupport), so an open page never loses the
  // scripts it was built with mid-session.
  event.waitUntil(
    Promise.allSettled([
      caches.open(PAGES).then((c) => Promise.allSettled(SHELL.map((url) => c.add(url)))),
      precacheAssets(),
      syncProgram(),
    ]),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "skip-waiting") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const keep = [PAGES, ASSETS, TILES, DATA, PROGRAM];
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))))
      // Earlier versions kept index.json with the pages; only the program cache's copy counts now.
      .then(() => caches.open(PAGES).then((c) => c.delete(PROGRAM_INDEX)))
      .then(pruneAssets)
      .then(() => self.clients.claim()),
  );
});

/** Hashed build files never change, so only the ones not cached yet are downloaded. */
async function precacheAssets() {
  const cache = await caches.open(ASSETS);
  await Promise.allSettled(
    PRECACHE.map(async (p) => {
      if (!(await cache.match(BASE + p))) await cache.add(BASE + p);
    }),
  );
}

/** Drops scripts and styles of earlier deploys. Fonts and images stay: they are shared and small. */
async function pruneAssets() {
  if (!PRECACHE.length) return;
  const keep = new Set(PRECACHE.map((p) => new URL(BASE + p, self.location.origin).href));
  const cache = await caches.open(ASSETS);
  for (const request of await cache.keys()) {
    if (/\.(js|css)$/.test(new URL(request.url).pathname) && !keep.has(request.url)) await cache.delete(request);
  }
}

// Chromium runs this for an installed app even while it is closed (Android, mostly).
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "program") event.waitUntil(syncProgram());
});

/** Hashed program files being downloaded, so the page and a background sync share one download. */
const pending = new Map();

/** A hashed program file from the cache, else the network. Hashed files never change. */
function programFile(path) {
  if (!pending.has(path)) {
    const download = (async () => {
      const cache = await caches.open(PROGRAM);
      const hit = await cache.match(path);
      if (hit) return hit;
      const res = await fetch(path);
      if (res.ok) await cache.put(path, res.clone());
      return res;
    })();
    pending.set(path, download);
    download.finally(() => pending.delete(path)).catch(() => {});
  }
  return pending.get(path).then((res) => res.clone());
}

/**
 * Stores a fresh index.json and every file it names. The index goes in last, so the cached index
 * never names a file that isn't cached; then the files of earlier versions are removed.
 */
async function storeProgram(indexRes) {
  const index = await indexRes.clone().json();
  if (index.schema !== 2) return;
  const paths = PROGRAM_FILES.map((k) => index[k]).filter(Boolean).map((name) => PROGRAM_DATA + name);
  const files = await Promise.all(paths.map(programFile));
  if (!files.every((res) => res.ok)) return;
  const cache = await caches.open(PROGRAM);
  await cache.put(PROGRAM_INDEX, indexRes);
  const keep = new Set([PROGRAM_INDEX, ...paths].map((p) => new URL(p, self.location.origin).href));
  for (const request of await cache.keys()) if (!keep.has(request.url)) await cache.delete(request);
}

let lastSync = 0;

async function fetchIndex() {
  lastSync = Date.now();
  const res = await fetch(PROGRAM_INDEX, { cache: "no-store" });
  if (!res.ok) throw new Error(`index.json: HTTP ${res.status}`);
  return res;
}

async function syncProgram() {
  try {
    await storeProgram(await fetchIndex());
  } catch {}
}

/**
 * index.json: the network, falling back to the cache when offline or slow. A manual refresh
 * (cache: "reload") waits for the network however long it takes. Either way a fresh index is
 * stored with its files in the background.
 */
function programIndex(event) {
  const manual = event.request.cache === "reload";
  const network = fetchIndex();
  event.waitUntil(network.then((res) => storeProgram(res.clone())).catch(() => {}));
  const cached = async () => (await (await caches.open(PROGRAM)).match(PROGRAM_INDEX)) ?? (await caches.match(PROGRAM_INDEX));
  return (async () => {
    try {
      if (!manual) {
        const first = await Promise.race([network, new Promise((r) => setTimeout(r, INDEX_TIMEOUT_MS))]);
        if (first) return first.clone();
        const hit = await cached();
        if (hit) return hit;
      }
      return (await network).clone();
    } catch {
      // A manual refresh must tell the visitor it failed; the page keeps showing what it has.
      if (manual) return Response.error();
      return (await cached()) ?? Response.error();
    }
  })();
}

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
  } else if (
    url.hostname === "api.open-meteo.com" ||
    url.hostname === "api.frankfurter.dev" ||
    // QM2027/weather-data (KMA warnings, air quality); the UI hides sections older than a few hours.
    (url.origin === self.location.origin && url.pathname.startsWith("/weather-data/"))
  ) {
    event.respondWith(networkFirst(request, DATA));
  } else if (url.origin === self.location.origin && url.pathname.startsWith(PROGRAM_DATA)) {
    if (url.pathname === PROGRAM_INDEX) event.respondWith(programIndex(event));
    else event.respondWith(programFile(url.pathname));
  } else if (url.origin === self.location.origin) {
    if (Date.now() - lastSync > SYNC_MS) event.waitUntil(syncProgram());
    if (request.mode === "navigate" || url.pathname.endsWith(".txt") || url.pathname.endsWith(".json")) {
      // Pages and RSC payloads: fresh when online, cached when not.
      event.respondWith(networkFirst(request, PAGES));
    } else if (url.pathname.startsWith(`${BASE}_next/static/`) || url.pathname.startsWith(`${BASE}icons/`)) {
      event.respondWith(cacheFirst(request, ASSETS));
    }
  }
});
