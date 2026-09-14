# Next Steps

*Companion to `hall-of-fame-site-design.md`. That doc is the agreed design; this one is the punch list for getting from "site works locally" to "site is live and current."*

---

## Where things stand

The Eleventy site is built and committed (`main`) — all 6 pages, driven entirely by `hall-of-fame-data.csv` and the assets already in the repo. See the root `README.md` for how to run it. It's local-data-first on purpose: nothing here talks to Google yet.

The remaining work splits cleanly into two tracks that can run in parallel: **getting real data into a real sheet** (mostly committee work), and **wiring the site up to read that sheet automatically** (mostly dev work). Per the design doc's own framing, the first one is the actual bottleneck — the build is a weekend, the data is where the time goes.

---

## 1. Real data — the critical path

- ✅ **Real Google Sheet created** — `hall_of_fame_data`, spreadsheet ID `1PaNpe6nyvnZ8II-g69T2JeQcCFhgiLew0WR3J5CWgYA`. It ended up with more structure than the design doc originally called for — four tabs: `inductees` (the roster, columns match §3 exactly), `committee` (Name/Title — already has 4 real members filled in), `params` (key/value: `donation_form_url` is filled in with a real Zeffy link; `nomination_form_url`, `scholarship_form_url` and `ceremony_tickets_url` exist but are still blank), and `scholarships` (year → recipients, 15 years of real data — now driving `/scholarships/`).
- ✅ **Drive photo folder created and readable** — `1S7OFE5zSloM42X5vP9XtDvHed0x26EUl`, set to "anyone with the link, Viewer". It briefly wasn't readable by the service account, which failed *silently*: Drive returns an empty file list (not an error) for a folder the caller can't see, so a permissions problem is indistinguishable from an empty folder. `lib/googleDrive.js` now checks reachability explicitly and the build report shows a banner if it ever breaks again.
- ✅ **Moving-portrait videos now come from Drive too**, in the same folder as the photos, matched by the same base filename and separated by extension. This supersedes the design doc's original assumption that clips were added to the repo by a developer — the committee only has Google access, so Sheets/Drive/Forms is the whole maintainer-facing data layer (design doc §4).
- ✅ **Committee notified** and populating the `inductees` tab — ~80 rows exist already (real names, but accomplishments text is still lorem-ipsum placeholder pending the real writeups).
- ⬜ **Plaque photography** — still undecided. The first real photo is in and working end-to-end (`KelleighSimmonsAllen`, 2014 — note the sheet says `.jpg` and the Drive file is `.jpeg`, which the extension-agnostic matching absorbed exactly as intended). The other ~79 rows have an empty `Photo filename` and render with the silhouette placeholder.
- ⬜ **Written instructions for the committee** — the whole design rests on them maintaining Sheets/Drive/Forms unaided (design doc §4). Needs to cover: the photo/video filename convention, that uploading a video is what turns on a moving portrait, and to upload JPG/PNG rather than HEIC (phones default to HEIC, which browsers won't render and the build won't match). Either someone photographs the plaques (design doc §4 has the "phone on a tripod, lights off, square to the wall" tips) or the committee supplies photos another way — decide before it blocks launch.

---

## 2. Wire the site to the real sheet (technical, mine)

- ✅ **GCP service account**: project `shs-hof-site` (owned by `hofsmithville@gmail.com`), Sheets API + Drive API enabled, service account `shs-hof-build@shs-hof-site.iam.gserviceaccount.com` created with a key. The key lives at `~/.secrets/shs-hof/shs-hof-build-key.json` on Matthew's machine — not in the repo. It'll need to become a GitHub Actions secret for the next step.
- ✅ **Swap the data source**: turned out to be more than the originally-planned two files, since the live sheet has real `committee` and `params` tabs beyond the inductee roster. `lib/loadInductees.js`, `lib/loadCommittee.js`, and `lib/loadParams.js` now read live when `GOOGLE_APPLICATION_CREDENTIALS` / `GOOGLE_SHEETS_ID` / `GOOGLE_DRIVE_FOLDER_ID` are set, and fall back to local CSV/JSON/placeholders otherwise — see `README.md`. `lib/loadAnnouncements.js` was deliberately left untouched: it isn't rendered anywhere on the site and there's no real sheet tab backing it, so wiring it would mean inventing a schema nobody asked for.
- ✅ **Verified end-to-end against real data**: a full `npm run build` against the live sheet correctly pulled 80 real inductees, the real committee roster (now showing on the home page instead of placeholder names), and the real donation URL (`params.donation_form_url`) — while `nomination_form_url` (still blank in the sheet) correctly fell back to the local placeholder instead of breaking the `/nominate/` embed. Also confirmed the local-CSV fallback path still works with no credentials set, for `npm run dev` without secrets.
- ✅ **GitHub Actions workflow** written (`.github/workflows/build-deploy.yml`): nightly cron + push + manual trigger, builds with the service-account secrets and deploys to Pages. Verified by simulating CI locally (fresh clone, `npm ci`, inline-JSON credentials, live sheet + Drive pull, path prefix applied). **Not yet operational** — needs the three repo secrets set, Pages source set to "GitHub Actions", and the private-repo problem below resolved.
- ✅ **Repo moved to its own account**: `hof-smithville/site`, public — so Pages works on the free tier, and the project owns its infrastructure rather than it hanging off a personal account. The old `sighmon606/shs-hof` should be deleted once the new one is verified and deploying, so it's never ambiguous which repo publishes the site. Matthew pushes as `sighmon606` via collaborator access.
- ✅ **`docs/creds.txt` purged from git history** with `git filter-repo` and force-pushed (2026-09-13). Verified by fresh clone: the file and the password appear in no commit. All SHAs changed, and the old "Remove docs/creds.txt" commit was pruned as empty (12 → 11 commits). Backups of the pre-rewrite history are at `E:\Source\shs-hof-backup-20260913-213053.bundle`. **Rotate the password anyway** — a committed secret is a compromised secret, and GitHub can keep unreferenced commits reachable by direct SHA for a while.
- ⚠️ **Scheduled workflows get disabled after 60 days without commits.** The whole point of the cron is surviving two years of committee inactivity, so expect this to bite. GitHub emails the admin before disabling and re-enabling is one click; the build report timestamp is the tell.
- ⬜ **Photo mismatch behavior against real (messier) filenames** — not really testable yet since the Drive folder is empty; revisit once real photos start landing in it.

---

## 3. Content still needed

- ✅ **Real committee roster** — now live from the sheet's `committee` tab, no code change needed when it changes; just edit the sheet.
- ✅ **Contribution/donation link** — now live from `params.donation_form_url` (a Zeffy link, not a Google Form — that's fine, it's just a link on the home page).
- ⬜ **Nomination form URL** for `/nominate/` — the sheet's `params.nomination_form_url` is still blank, so the page shows a short "not open yet" note instead of a CTA. Once the committee drops a URL into that cell it goes live automatically — no code or deploy needed. All three form links now open in a new tab rather than embedding, so none of them carry a placeholder URL: a blank cell hides that CTA rather than opening a dead link.
- ✅ **Scholarships page** — `/scholarships/` now lists all 15 years of recipients (31 since 2012) live from the sheet's `scholarships` tab, with a short blurb and link on the home page. Added to the main nav.
- ⬜ **Scholarship application form URL** — `params.scholarship_form_url` exists but is blank, so the "Apply for a scholarship" button is hidden entirely rather than linking somewhere broken. It appears automatically once the committee fills that cell.
- ⬜ **Confirm eligibility copy** — currently placeholder text ("five years out") copied from the mockup; needs a sanity check against what the committee actually wants to say. The nomination-deadline callout ("March 1") was removed from `/nominate/` — decide whether a deadline comes back once the committee has a real one.

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

1. ✅ Stand up the Sheet + Drive folder (§1).
2. ✅ GCP service account + swap the data source (§2) — done ahead of full data entry, per §1/§2 both being live now.
3. Committee continues populating real rows/accomplishments while plaque photography/sourcing is decided and happens alongside.
4. GitHub Actions cron (§2), so the live pull deploys automatically without someone running `npm run build` by hand.
5. Content fixes (§3) and the two open decisions (§4) can happen anytime before public launch — they don't block the technical work. Two of the four content items in §3 already resolved themselves once the sheet went live.
