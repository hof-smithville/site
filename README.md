# Smithville All-Sports Hall of Fame

Static site, built with [Eleventy](https://www.11ty.dev/). See `hall-of-fame-site-design.md` for the full design notes.

## Current status: local-data-first

This build reads `hall-of-fame-data.csv` (and `announcements.json` / `committee.json`) directly from the repo — there is **no Google Sheets/Drive integration yet**. That's a deliberate, separate follow-up once a GCP service account exists for the committee's real sheet and Drive folder. See `lib/loadInductees.js` and `lib/loadAnnouncements.js` — those are the only two files a Sheets-backed version would need to change; everything else (templates, matching logic, the build report) stays the same.

## Running locally

```sh
npm install
npm run dev      # eleventy --serve, live-reloading dev server
npm run build    # one-shot build to _site/
```

## Data model

- **`hall-of-fame-data.csv`** — the inductee roster. Columns: `Inductee name, Induction year, Sport, Graduation year, Category, Accomplishments, Photo filename, Team members, Notes`. `Sport` and `Team members` are comma-separated. All fields are plain text.
- **`announcements.json`** — local stand-in for a second sheet tab, in the same shape the design doc describes. Only the 3 most recent `publish: "yes"` rows show on the landing page.
- **`committee.json`** — the About page's committee roster; hand-authored, not part of the CSV schema.

## Photos

Drop matched files into:
- `assets/photos/inductees/` — inductee photos. Filename must match the CSV's `Photo filename` column, case-insensitively, extension ignored (e.g. `Photo filename` = `2024_Smith_John` matches `2024_smith_john.JPG`).
- `assets/videos/inductees/` — **opt-in** moving-portrait clips. Same filename-matching rule as photos. Adding a clip here for a given inductee **is** the opt-in — there's no separate spreadsheet column for it, since these are Higgsfield-generated and added deliberately, not committee-supplied.
- `assets/photos/announcements/` — optional photos for `announcements.json` entries, matched the same way.

Anyone without a matched photo automatically falls back to `assets/icons/blacksmith-silhoutte.png`. A missing or mismatched filename never fails the build — check `/build-report/` for what didn't match.

## Not built yet

- Google Sheets + Drive API integration (service account, replacing the local CSV/JSON reads)
- GitHub Actions nightly/weekly build + deploy to GitHub Pages
- Image optimization for real (likely large, phone-photographed) inductee photos
- Three.js virtual wall (explicitly v2 in the design doc)

The real Google Form URL still needs to be swapped into `src/_data/site.js` (`googleFormUrl`).
