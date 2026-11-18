// Print a slice of a GPX track as TypeScript tuples for src/data/runs.ts. Source GPX
// files stay local (docs/*_gpx/ is gitignored).
//
//   node scripts/olle-slice.mjs <file.gpx> <from> <to> [--start lat,lng] [--fill]
//
// Indices are trkpt positions (0-based, inclusive); from > to walks the track backwards.
// --start prepends a point (e.g. the venue door) before the slice.
// Points whose <ele> is -1 or missing have no elevation. With --fill they are looked up
// in SRTM 30 m (OpenTopoData public API, dev-time only) and shifted so each gap meets
// the track's own elevation at both ends; without it they come out as null.

import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const [, v] = args.splice(i, name === "--fill" ? 1 : 2);
  return v ?? true;
};
const fill = flag("--fill") === true;
const start = flag("--start");
const [file, fromArg, toArg] = args;
if (!file) {
  console.error("usage: node scripts/olle-slice.mjs <file.gpx> [from] [to] [--start lat,lng] [--fill]");
  process.exit(1);
}

const xml = readFileSync(file, "utf8");
const pts = [...xml.matchAll(/<trkpt lat="([^"]+)" lon="([^"]+)">\s*(?:<ele>([^<]*)<\/ele>)?/g)].map((m) => {
  const ele = m[3] === undefined ? -1 : Number(m[3]);
  return { lat: Number(m[1]), lng: Number(m[2]), ele: ele === -1 ? null : ele };
});

const from = fromArg === undefined ? 0 : Number(fromArg);
const to = toArg === undefined ? pts.length - 1 : Number(toArg);
const step = from <= to ? 1 : -1;
const slice = [];
if (start) {
  const [lat, lng] = start.split(",").map(Number);
  slice.push({ lat, lng, ele: null });
}
for (let i = from; i !== to + step; i += step) slice.push({ ...pts[i] });

async function srtm(points) {
  const out = [];
  for (let i = 0; i < points.length; i += 100) {
    const locs = points.slice(i, i + 100).map((p) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join("|");
    const res = await fetch(`https://api.opentopodata.org/v1/srtm30m?interpolation=bilinear&locations=${locs}`);
    if (!res.ok) throw new Error(`OpenTopoData ${res.status}`);
    out.push(...(await res.json()).results.map((r) => r.elevation));
    await new Promise((r) => setTimeout(r, 1100)); // public API: 1 request/second
  }
  return out;
}

if (fill && slice.some((p) => p.ele === null)) {
  const dem = await srtm(slice);
  // Residual (track - DEM) at known points, interpolated by distance along each gap.
  const known = slice.flatMap((p, i) => (p.ele === null ? [] : [i]));
  for (let i = 0; i < slice.length; i++) {
    if (slice[i].ele !== null) continue;
    const a = known.filter((k) => k < i).at(-1);
    const b = known.find((k) => k > i);
    const ra = a === undefined ? undefined : slice[a].ele - dem[a];
    const rb = b === undefined ? undefined : slice[b].ele - dem[b];
    const t = a !== undefined && b !== undefined ? (i - a) / (b - a) : 0;
    const r = ra === undefined ? rb : rb === undefined ? ra : ra + (rb - ra) * t;
    slice[i].ele = dem[i] + (r ?? 0);
    slice[i].filled = true;
  }
}

const fmt = (n) => Number(n.toFixed(5));
const rows = [];
for (let i = 0; i < slice.length; i += 4) {
  rows.push("  " + slice.slice(i, i + 4).map((p) => `[${fmt(p.lat)}, ${fmt(p.lng)}]`).join(", ") + ",");
}
const filled = slice.filter((p) => p.filled).length;
console.log(`// ${slice.length} points, trkpt ${from}..${to}${filled ? `, ${filled} elevations from SRTM` : ""}`);
console.log(`path: [\n${rows.join("\n")}\n],`);
console.log(`ele: [${slice.map((p) => (p.ele === null ? "null" : Math.round(p.ele))).join(", ")}],`);
