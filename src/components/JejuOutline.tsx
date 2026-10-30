// Hand-traced Jeju coastline (about 20 shore points, smoothed), projected at 1 km ≈ 1 unit.
// Decorative: it sets the scene on the home page, the interactive map lives on /explore.

const COAST =
  "M56,314C55,284 100,244 120,216C141,188 158,161 179,145C200,129 220,130 246,122C271,114 305,102 333,95C361,88 388,85 413,80C437,75 454,70 478,65C501,60 526,50 553,52C580,55 618,69 638,80C659,91 664,104 676,115C687,126 710,133 709,148C708,163 686,182 671,205C657,228 646,263 621,285C596,307 546,326 521,335C496,344 493,334 471,340C449,346 417,362 392,370C367,377 341,385 321,385C300,385 291,372 271,370C250,368 213,368 195,375C177,382 173,409 162,412C151,415 146,411 129,395C111,379 57,344 56,314Z";

// Same projection as COAST: x = (lng − 126.12) × 835 + 20, y = (33.6 − lat) × 1000 + 10.
const x = (lng: number) => (lng - 126.12) * 835 + 20;
const y = (lat: number) => (33.6 - lat) * 1000 + 10;
const LATS = [33.6, 33.5, 33.4, 33.3, 33.2];
const LNGS = [126.2, 126.3, 126.4, 126.5, 126.6, 126.7, 126.8, 126.9];

const ICC = { x: 273, y: 368 };
const HALLA = { x: 365, y: 248 };
const CJU = { x: 332, y: 103 };

export function JejuOutline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 760 450" className={className} role="img" aria-label="Outline map of Jeju Island with the conference venue on the south coast">
      {/* Graticule every 0.1°, labelled at the edges like a printed chart */}
      <g stroke="currentColor" strokeOpacity="0.12" strokeWidth="1">
        {LATS.map((lat) => (
          <line key={lat} x1="0" x2="760" y1={y(lat)} y2={y(lat)} />
        ))}
        {LNGS.map((lng) => (
          <line key={lng} y1="0" y2="450" x1={x(lng)} x2={x(lng)} />
        ))}
      </g>
      <g fill="currentColor" fillOpacity="0.5" fontSize="11" fontFamily="var(--font-mono)">
        {LATS.slice(0, -1).map((lat) => (
          <text key={lat} x="4" y={y(lat) - 4}>{lat.toFixed(1)}°N</text>
        ))}
        {LNGS.filter((_, i) => i % 2 === 0).map((lng) => (
          <text key={lng} x={x(lng) + 4} y="444">{lng.toFixed(1)}°E</text>
        ))}
      </g>

      <path d={COAST} fill="var(--surface)" stroke="currentColor" strokeWidth="1.5" />
      {/* Contour rings around Hallasan */}
      <g fill="none" stroke="var(--sea)" strokeOpacity="0.5">
        <ellipse cx={HALLA.x} cy={HALLA.y} rx="150" ry="70" transform={`rotate(-12 ${HALLA.x} ${HALLA.y})`} />
        <ellipse cx={HALLA.x} cy={HALLA.y} rx="95" ry="44" transform={`rotate(-12 ${HALLA.x} ${HALLA.y})`} />
        <ellipse cx={HALLA.x} cy={HALLA.y} rx="45" ry="21" transform={`rotate(-12 ${HALLA.x} ${HALLA.y})`} />
      </g>

      <g fontFamily="var(--font-mono)" fontSize="13" fill="currentColor">
        <path d={`M${HALLA.x - 8},${HALLA.y + 6} L${HALLA.x},${HALLA.y - 8} L${HALLA.x + 8},${HALLA.y + 6} Z`} />
        <text x={HALLA.x + 14} y={HALLA.y + 5}>Hallasan 1,947 m</text>
        <circle cx={CJU.x} cy={CJU.y} r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x={CJU.x + 10} y={CJU.y + 4}>CJU</text>
        <circle cx={ICC.x} cy={ICC.y} r="9" fill="var(--tangerine)" fillOpacity="0.2" />
        <circle cx={ICC.x} cy={ICC.y} r="4.5" fill="var(--tangerine)" />
        <text x={ICC.x - 14} y={ICC.y + 30} fill="var(--tangerine)" fontWeight="500">ICC Jeju</text>
      </g>
    </svg>
  );
}
