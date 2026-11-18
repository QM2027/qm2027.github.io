// Print a slice of an Olle GPX track as TypeScript tuples for src/data/runs.ts.
//
//   node scripts/olle-slice.mjs "docs/olle_gpx/8코스 ....gpx" 122 75
//
// Indices are trkpt positions (0-based, inclusive); from > to walks the track backwards.
// The source GPX files (docs/olle_gpx/, gitignored) were traced in GPS Route Editor:
// points it snapped to a mapped path carry elevation, hand-drawn points (where no path
// was recognised) carry <ele>-1</ele>. Those come out as null, and their position is
// less reliable too.

import { readFileSync } from "node:fs";

const [file, fromArg, toArg] = process.argv.slice(2);
if (!file) {
  console.error("usage: node scripts/olle-slice.mjs <file.gpx> [from] [to]");
  process.exit(1);
}

const xml = readFileSync(file, "utf8");
const pts = [...xml.matchAll(/<trkpt lat="([^"]+)" lon="([^"]+)">\s*(?:<ele>([^<]*)<\/ele>)?/g)].map((m) => {
  const ele = m[3] === undefined ? -1 : Number(m[3]);
  return { lat: Number(m[1]), lng: Number(m[2]), ele: ele === -1 ? null : Math.round(ele) };
});

const from = fromArg === undefined ? 0 : Number(fromArg);
const to = toArg === undefined ? pts.length - 1 : Number(toArg);
const step = from <= to ? 1 : -1;
const slice = [];
for (let i = from; i !== to + step; i += step) slice.push(pts[i]);

const fmt = (n) => Number(n.toFixed(5));
const rows = [];
for (let i = 0; i < slice.length; i += 4) {
  rows.push("      " + slice.slice(i, i + 4).map((p) => `[${fmt(p.lat)}, ${fmt(p.lng)}]`).join(", ") + ",");
}
console.log(`    // ${slice.length} points, trkpt ${from}..${to}\n    path: [\n${rows.join("\n")}\n    ],`);
console.log(`    ele: [${slice.map((p) => p.ele ?? "null").join(", ")}],`);
