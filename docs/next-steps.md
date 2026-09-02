# Next Steps

*Companion to `hall-of-fame-site-design.md`. That doc is the agreed design; this one is the punch list for getting from "site works locally" to "site is live and current."*

---

## Where things stand

The Eleventy site is built and committed (`main`) — all 6 pages, driven entirely by `hall-of-fame-data.csv` and the assets already in the repo. See the root `README.md` for how to run it. It's local-data-first on purpose: nothing here talks to Google yet.

The remaining work splits cleanly into two tracks that can run in parallel: **getting real data into a real sheet** (mostly committee work), and **wiring the site up to read that sheet automatically** (mostly dev work). Per the design doc's own framing, the first one is the actual bottleneck — the build is a weekend, the data is where the time goes.

---

## 1. Real data — the critical path

Nothing downstream matters until this exists. Concretely:

- **Create the real Google Sheet**, columns exactly as specified in the design doc (§3): Inductee name, Induction year, Sport, Graduation year, Category, Accomplishments, Photo filename, Team members, Notes. Pre-fill 2–3 example rows so the committee has a pattern to copy — the sample rows already in `hall-of-fame-data.csv` work as-is for this.
- **Create the paired Google Drive folder** for photos, with the same sharing setup the sheet will use (design doc §4: one service account, one auth setup, for both).
- **Get the committee filling in the ~100 existing inductees.** This is the slow part — records are scattered across emails, applications, and memory. Worth reconfirming with them now that the tooling actually exists: *"we'll get you the data"* is the promise that quietly evaporates (design doc §2).
- **Plaque photography.** Either someone photographs the ~100 plaques on the wall (design doc §4 has the "phone on a tripod, lights off, square to the wall" tips — and warns the cleanup afterward is real work), or the committee supplies photos/text through some other channel. Decide which before it becomes the thing blocking launch.

---

## 2. Wire the site to the real sheet (technical, mine)

Blocked on §1 having *something* real to point at — even a partially-filled sheet is enough to start.

- **GCP service account**: new project, enable the Sheets API and Drive API, create a service account, share the real sheet and Drive folder with its email address.
- **Swap the data source**: per `README.md`, only two files change — `lib/loadInductees.js` and `lib/loadAnnouncements.js` — from reading local CSV/JSON to calling the Sheets/Drive APIs with the service-account credentials. Everything else (templates, photo-matching, slugging, the build report) stays as-is; that seam was built deliberately for this.
- **GitHub Actions workflow**: nightly or weekly cron (design doc §5) that pulls the sheet + Drive folder, rebuilds, commits, and deploys to GitHub Pages. Needs the service-account JSON and the sheet/folder IDs as repo secrets.
- **Confirm the never-fail behavior end-to-end** against real (messier) data — a bad filename or a stray character shouldn't take the site down. We already hit one real example of this locally (a name with embedded quotes broke the CSV parser and had to be special-cased); the live sheet will surface more.

---

## 3. Content still needed

Small, but blocking a real launch:

- **Real Google Form URL** for `/nominate/` — `src/_data/site.js` has a literal `TODO` placeholder right now.
- **Real Google Form URL** for the home page's contribution/sponsorship link — same file, same placeholder treatment (`site.contributionFormUrl`).
- **Real committee roster** for the home page's "About the Hall of Fame" section — `committee.json` currently has placeholder names.
- **Confirm eligibility copy** — currently placeholder text ("five years out") copied from the mockup; needs a sanity check against what the committee actually wants to say. The nomination-deadline callout ("March 1") was removed from `/nominate/` — decide whether a deadline comes back once the committee has a real one.

---

## 4. Open questions from the mockup review (still unresolved)

Carried over from the design mockup's own "Open items" list — nobody's answered these yet:

- Does the hover/click moving-portrait treatment apply to real inductee photos the same way it applies to the mascot? We built the mechanism (file presence in `assets/videos/inductees/`, see README), but the actual per-inductee opt-in decision — and who makes it — is still open.
- Is "Contributor" the right fourth category, alongside Athlete / Coach / Team? It's baked into the filter chips now; changing it later just means editing a data value, not code — but worth deciding once rather than migrating real data twice.
- Do induction class pages ever get a banquet photo, or do they stay text-and-portraits only?

---

## 5. Explicitly future (v2, not blocking launch)

- Three.js virtual wall (design doc §9) — a separate view over the same data, not a rewrite, whenever it's worth building.
- Image optimization pipeline (e.g. `@11ty/eleventy-img`) once real, likely large, phone-photographed inductee images start landing in `assets/photos/inductees/`.
- Higgsfield-generated moving-portrait clips for individual inductees, beyond the mascot's.

---

## Suggested order

1. Stand up the Sheet + Drive folder (§1) — start now, runs in parallel with everything else.
2. Committee starts populating real rows while photography/sourcing happens alongside.
3. Once there are a handful of real rows: GCP service account + swap the data source (§2).
4. GitHub Actions cron, once the live pull is proven against real data.
5. Content fixes (§3) and the two open decisions (§4) can happen anytime before public launch — they don't block the technical work.
