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

## Program sync

`npm run sync` pulls the public Indico timetable into `public/data/program.json`. It keeps the
previous snapshot on any error and only rewrites the file when the program changed. The
`Sync Indico timetable` workflow runs it on a schedule, commits changes and triggers a deploy.

To try the program UI with real data from a past conference:

```bash
EVENT_ID=1334113 node scripts/sync-indico.mjs --out public/data/program.json   # QM2025 — don't commit
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
