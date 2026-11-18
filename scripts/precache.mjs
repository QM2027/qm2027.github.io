// Runs after `next build`: writes the build's scripts, styles, images and preloaded fonts into
// out/sw.js, so the service worker caches them on install. A visitor who goes offline right after
// the first visit then still gets every page working, not just the one they loaded. It also makes
// sw.js differ on every deploy, which is what makes browsers install the new worker.
import fs from "node:fs";
import path from "node:path";

const out = path.resolve("out");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const files = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const rel = (file) => path.relative(out, file).split(path.sep).join("/");

const assets = files(path.join(out, "_next", "static"))
  .map(rel)
  .filter((p) => /\.(js|css)$/.test(p) || (/\/media\/.*\.(png|svg)$/.test(p) && !p.includes("opengraph-image")));

// Korean glyphs come as ~200 unicode-range files fetched only when a page uses them; precache just
// the Latin fonts every page preloads.
const html = fs.readFileSync(path.join(out, "index.html"), "utf8");
const fonts = [...html.matchAll(/<link rel="preload" href="([^"]+\.woff2)" as="font"/g)].map((m) => m[1].slice(basePath.length + 1));

const precache = [...new Set([...assets, ...fonts])].sort();
const sw = path.join(out, "sw.js");
const source = fs.readFileSync(sw, "utf8");
const marker = "const PRECACHE = [];";
if (!source.includes(marker)) throw new Error(`precache: "${marker}" not found in sw.js`);
fs.writeFileSync(sw, source.replace(marker, `const PRECACHE = ${JSON.stringify(precache)};`));

const bytes = precache.reduce((n, p) => n + fs.statSync(path.join(out, p)).size, 0);
console.log(`precache: ${precache.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB written into sw.js`);
