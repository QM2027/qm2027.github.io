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

If a page shows styles older than the code (a Tailwind class that has no effect), stop the dev
server, delete `.next/dev` (its Turbopack cache) and start it again.

## Preview switches and design looks

Query parameters set before the first paint and remembered in the browser
([src/lib/edition-script.ts](src/lib/edition-script.ts)):

| Parameter | Values | What |
| --- | --- | --- |
| `edition` | `guide` (default), `app` | Visitor guide or the conference-app edition |
| `look` | `default`, `plain`, `brand` | The design: current, current layout without the tells of generated design, or pages redesigned on the logo's colours |
| `notice` | `on` (default), `off` | The "Not fully developed" bar |

[public/compare.html](public/compare.html) shows any of these side by side.

How the looks are built, so one can be kept and the others removed later:

- **Variants** in [src/app/globals.css](src/app/globals.css): `plain:` applies in plain and brand,
  `brand:` in brand only. Markup carries each look's differences beside the current classes
  (`plain:hidden`, `hidden brand:block` for changed words or blocks).
- **Tokens:** plain and brand switch the accent to the logo's blue and headings to Plex Sans.
  Brand adds the blue field (`bg-brand-field`) with `field-ink` (white ink, white focus rings) and
  `field-bleed` (the field across the window from inside a padded container).
- **Brand-only pages:** [BrandHome](src/components/home/BrandHome.tsx) and
  [BrandGettingThere](src/components/BrandGettingThere.tsx); other pages restyle in place.
- **To keep one look:** delete the other looks' classes and nodes, then the variant and the
  `LOOKS` entry. Searching for `plain:`, `brand:` and `brand-field` finds every place.

Photos in [src/assets/photos/](src/assets/photos/) are from Wikimedia Commons; each is credited
in the caption beside it, with its licence. Keep the credit if a photo is reused.

## Program

The program (talks and posters) is not part of this repository. [QM2027/program-data](https://github.com/QM2027/program-data)
fetches it from Indico and publishes it under `https://qm2027.github.io/program-data/`:

| File | Contents |
| --- | --- |
| `index.json` | Tiny index |
| `program.<hash>.json` | Sessions, talks, posters, changes |
| `abstracts.<hash>.json` | Abstracts and authors |

The program page and the venue "Now / Next" load these files in the browser through one shared
store ([src/lib/program.ts](src/lib/program.ts)), so program updates go live without rebuilding
this site.

- **Polling:** only `index.json` is polled: on load, when the tab comes back into view, and every
  5 minutes.
- **Hashed files:** fetched once per version, with abstracts loaded after the program.
- **Service worker:** keeps them for offline use, and falls back to the cached index after 4 s
  on a slow network.

`npm run dev` uses the live files. To use other data, build it in program-data, serve or copy
that folder, and set `NEXT_PUBLIC_PROGRAM_BASE`:

```bash
# in program-data
EVENT_ID=1334113 node scripts/sync.mjs --out ../../qm2027_pwa/public/dev-program
# here
NEXT_PUBLIC_PROGRAM_BASE=/dev-program npm run dev
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
