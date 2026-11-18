# QM2027 Jeju Visitor Guide

Companion travel guide for participants of [Quark Matter 2027](https://indico.cern.ch/event/1622375/)
(21–27 March 2027, ICC Jeju), prepared by the organizing committee. Official information
(registration, abstracts, program, deadlines) stays on Indico; this site adds what Indico pages
can't: interactive maps, a venue plan, trip planners and an offline program.

Static Next.js export, hosted on GitHub Pages. Installable as a PWA and usable offline.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run build      # static export in out/
```

Local build with the GitHub Pages base path (Git Bash on Windows needs `MSYS_NO_PATHCONV=1`):

```bash
NEXT_PUBLIC_BASE_PATH=/qm2027_pwa npm run build
```

## Program

The program (talks and posters) is not part of this repository. [QM2027/program-data](https://github.com/QM2027/program-data)
fetches it from Indico and publishes `https://qm2027.github.io/program-data/program.json`.
The program page and the venue "Now / Next" load that file in the browser
([src/lib/program.ts](src/lib/program.ts)), so program updates go live without rebuilding
this site. Updates are checked on every load, when the tab comes back into view, and every
5 minutes. The service worker keeps the last copy for offline use.

`npm run dev` uses the live file. To try the UI with real data from a past conference, build
it in program-data and point the site at it:

```bash
# in program-data
EVENT_ID=1334113 node scripts/sync.mjs --out ../../qm2027_pwa/public/dev-program.json
# here
NEXT_PUBLIC_PROGRAM_URL=/dev-program.json npm run dev
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`. In the repository settings, set
**Pages → Source** to **GitHub Actions**. The workflow passes the right base path and site URL,
so switching to a custom domain needs no code change (add `public/CNAME`).

## Where things live

| Path | What |
| --- | --- |
| `src/data/` | Places, courses, food, season, trails, venue rooms, Indico links |
| `src/app/explore/*` | Map and guides (planner, season, food, runs, science, Hallasan, passport, Korea, companions) |
| `src/app/venue`, `travel`, `program` | Floor plan, travel toolkit, synced program |
| `public/sw.js` | Service worker (offline pages, map tiles, program data) |
| `docs/ROADMAP.md` | Status, open tasks and data to verify before launch |
