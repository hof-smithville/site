# Smithville All-Sports Hall of Fame

Static site, built with [Eleventy](https://www.11ty.dev/). See `docs/hall-of-fame-site-design.md` for the full design notes.

Lives at `hof-smithville/site`; published to <https://hof-smithville.github.io/site/>.

## Current status: live-sheet-capable, with a local fallback

The build reads from the real Google Sheet (`inductees`, `committee`, and `params` tabs) and the paired Drive photo folder when credentials are configured; otherwise it falls back to the local `hall-of-fame-data.csv` / `committee.json` / placeholder form URLs, so `npm run dev` still works with no setup. `announcements.json` is unaffected either way — it's local-only and isn't rendered anywhere on the site (see below).

Live mode turns on automatically once these three environment variables are all set (a `.env` file works — see `.env.example`):

- `GOOGLE_APPLICATION_CREDENTIALS` — path to the service-account key JSON (or `GOOGLE_SERVICE_ACCOUNT_JSON` with the JSON inline, for CI)
- `GOOGLE_SHEETS_ID` — the spreadsheet ID from its URL
- `GOOGLE_DRIVE_FOLDER_ID` — the photo folder's ID from its URL

The service account (`shs-hof-build@shs-hof-site.iam.gserviceaccount.com`, project `shs-hof-site`) needs Viewer access to both the sheet and the Drive folder. See `lib/googleAuth.js`, `lib/googleSheets.js`, `lib/googleDrive.js` for the plumbing, and `lib/loadInductees.js` / `lib/loadCommittee.js` / `lib/loadParams.js` for how each data source picks live vs. local.

## Running locally

```sh
npm install
npm run dev      # eleventy --serve, live-reloading dev server
npm run build    # one-shot build to _site/
```

## Data model

- **Inductee roster** — live: the sheet's `inductees` tab; local: `hall-of-fame-data.csv`. Columns: `Inductee name, Induction year, Sport, Graduation year, Category, Accomplishments, Photo filename, Team members, Notes`. `Sport` and `Team members` are comma-separated. All fields are plain text.
- **Committee roster** — live: the sheet's `committee` tab (`Name`, `Title`); local: `committee.json`. Feeds the home page's "About the Hall of Fame" section.
- **Scholarship recipients** — live: the sheet's `scholarships` tab (`Year`, `Recipients`, recipients comma-separated); local: `scholarships.json`. Drives `/scholarships/` and the blurb on the home page.
- **Form URLs** — the sheet's `params` tab (`donation_form_url`, `nomination_form_url`, `scholarship_form_url`). All three render as links that open in a new tab, and none has a placeholder: a blank cell hides that page's CTA entirely rather than opening a dead link. Fill the cell in and the button appears on the next build — no code change or deploy. (`/nominate/` previously embedded its form in an iframe; that was dropped so every form behaves the same way, and because a non-Google form — the donation link is Zeffy — can refuse to be iframed at all.)
- **`announcements.json`** — local-only, not read from the sheet. Not currently rendered anywhere on the site; it only feeds the build report's photo-mismatch diagnostics for now.
- The sheet's `params` tab also has a `ceremony_tickets_url` key that nothing in the site reads yet.

## Photos

In live mode, **both photos and moving-portrait videos come from the one Drive folder** — the committee only has Google access, so nothing they maintain lives in this repo (design doc §4). The folder is downloaded into `.cache/drive/inductees/`, then each photo is resized into two WebP copies (`<name>.webp` at 800px for detail pages, `<name>-thumb.webp` at 480px for cards) in `.cache/media/inductees/` (both gitignored), which is served from `/assets/media/inductees/`. Uploads of any size are fine; originals are never published. Files that can't be read as images are listed on the build report.

Filenames match the sheet's `Photo filename` column case-insensitively with the extension ignored, so an inductee's photo and video share one base name (`KelleighSimmonsAllen.jpeg` + `KelleighSimmonsAllen.mp4`) and are told apart **by extension only** — images are `jpg/jpeg/png/gif/webp`, video is `mp4/webm/mov/m4v`. Anything else won't match. Uploading a video *is* the per-inductee opt-in for the moving portrait; there's no spreadsheet column for it.

The sync runs from an `eleventy.before` hook, not a data file — it has to finish before passthrough copy enumerates the directory, or the copy races the download and fails the build.

Locally without credentials, the old local dirs are used instead:
- `assets/photos/inductees/` — inductee photos, same matching rule.
- `assets/videos/inductees/` — moving-portrait clips.
- `assets/photos/announcements/` — optional photos for `announcements.json` entries.

Anyone without a matched photo automatically falls back to `assets/icons/blacksmith-silhoutte.png`. A missing or mismatched filename never fails the build — check `/build-report/` for what didn't match.

Note that a Drive folder the service account can't read returns an empty file list rather than an error, which is indistinguishable from a genuinely empty folder. `lib/googleDrive.js` therefore checks folder reachability explicitly and the build report shows a loud banner if it fails — otherwise a permissions problem looks exactly like "nobody's uploaded photos yet."

## Deployment

`.github/workflows/build-deploy.yml` builds and publishes to GitHub Pages on three triggers: a nightly cron (08:00 UTC), any push to `main`, and a manual "Run workflow" button. The nightly run is what picks up committee edits to the sheet and Drive without anyone touching the repo.

It needs three repository secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | the entire contents of the service-account key JSON file |
| `GOOGLE_SHEETS_ID` | the spreadsheet ID from its URL |
| `GOOGLE_DRIVE_FOLDER_ID` | the photo folder's ID from its URL |

Plus Settings → Pages → Source set to **GitHub Actions**.

`PATH_PREFIX` is supplied automatically by `actions/configure-pages` — it's `/site` for this project repo (published at `https://hof-smithville.github.io/site/`) and empty for a custom domain, and `EleventyHtmlBasePlugin` rewrites absolute URLs to match. Any path in a `data-*` attribute has to go through the `url` filter by hand, since the plugin only rewrites `href`/`src` (see `mascot-widget.njk`).

**Two gotchas worth knowing:**
- GitHub **disables scheduled workflows after 60 days of no commits to the repo**. This site is designed to sit untouched for long stretches, so the cron will eventually be switched off — GitHub emails the repo admin first, and re-enabling is one button in the Actions tab. The build report's timestamp is how you'd notice.
- GitHub Pages on a **private** repo requires a paid plan. On the free tier the repo has to be public for Pages to work.

## Not built yet

- Image optimization for real (likely large, phone-photographed) inductee photos
- Three.js virtual wall (explicitly v2 in the design doc)
