# Sports Hall of Fame Website — Design Notes

*Side project, built as a favor. Captured from a design conversation; agreed direction, not yet implemented.*

---

## 1. Context

- A simple website to show off a high school sports hall of fame.
- Inductions happen every couple of years — **five to ten new members** per cycle — with a banquet where inductees give a short speech and receive a plaque bearing their picture and a short summary of accomplishments.
- Roughly **100 inductees** already.
- An entire team can be inducted; that counts as a **single entry**.
- The people involved are **non-technical**, and on a shoestring budget.
- Mallen is helping from the tech side only.

### The governing constraint

Someone has to add inductees every couple of years. If that means editing code or wrestling with a CMS, the site goes stale after the first cycle. Every decision below follows from that.

---

## 2. The data problem

**This is a data project with a website attached, not a website project.** The build is a weekend; getting a hundred inductees into one clean structure is where the time goes.

- Plaque photos are not digitized — the plaques will likely have to be photographed on the wall.
- Existing records are scattered across emails, application forms, and other disparate sources. No single organized data source. Assume chaos.
- **Assumption:** the committee has someone who knows the history well enough to fill in the data. Mallen provides the tooling. If they don't follow through, the burden is theirs.

> Worth stating out loud to the committee early — *"we'll get you the data"* is the promise that quietly evaporates.

---

## 3. Source of truth — Google Sheets

The committee has used Google Sheets before, it's easy for them, and it's free for their purposes. It's the one tool in the stack they can genuinely operate, and it doubles as what the site builds from.

Set it up with pre-labelled columns and two or three example rows already filled in.

### Columns

| Column | Notes |
|---|---|
| Inductee name | For a team entry, the team name goes here |
| Induction year | The banquet class |
| Sport | Allow more than one — plenty played two or three |
| Graduation year | Different from induction year, and what people actually search on |
| Category | Athlete, coach, contributor, or team |
| Accomplishments | The blurb, straight from the plaque |
| Photo filename | Matches the file in the Drive folder |
| Team members | All team members and/or coaches — empty for individuals |
| Notes | For the committee to flag anything uncertain |

### Design points

- **Every column is plain text.** Never ask them to format anything — a committee will absolutely put `Class of '87` into a date field.
- **The notes column matters more than it sounds.** It's where *"we think this is 1994 but nobody's sure"* goes, instead of them guessing silently.
- **Teams share the sheet**, no separate tab. One shape, easier than remembering which tab to use. The category column already tells the site it's a team entry.
- **No cross-linking.** Individuals from an inducted team do sometimes get inducted separately later, but linking those entries would mean asking the committee to maintain IDs — exactly the kind of thing that breaks.

### A second tab — About page content

The inductee roster isn't the only thing on the site the committee should be able to update without touching code. A second tab in the same sheet drives the About page:

| Column | Notes |
|---|---|
| Name | Committee member's name |
| Title | Their role on the committee (chair, secretary, etc.) — maps to the `role` field the site already uses in `committee.json` |

Plus one more value somewhere on that tab for the **Contribution form URL** — the link to the Google Form sponsors and donors use to contribute to the general fund or the Senior Scholarship Fund. A single value, not a column, since there's only ever one.

Same rules as the inductee tab: plain text, no formatting tricks.

---

## 4. Photos

### Storage

- A single Google Drive folder, shared with the same people as the sheet.
- The photo filename column points at a file in it.
- The build pulls sheet and folder with the **same service account credentials** — one auth setup, not two.

### Naming convention

Keep filenames dumb and human-typed rather than clever:

```
2026_Smith_John
```

Induction year, surname, first name. It sorts naturally in Drive, it's guessable by a human, and it stays unique in practice since you rarely get two same-named inductees in one class.

**Why not auto-derive it from the name column?** Names have apostrophes, hyphens, accents and trailing spaces. Any auto-slugging rule will disagree with what they actually named the file. Typing it explicitly feels redundant, but the link is then whatever they say it is.

**Safety valve:** match case-insensitively and ignore the file extension. That alone kills most typos.

### Image fallback order

1. An original photo of the inductee, if anyone has one — usually better than a photograph of a photograph on a plaque.
2. A plaque photo.
3. A silhouette placeholder.

### The plaque photography caveat

A hundred plaques photographed on a wall means glare from overhead lights, keystoning where the camera wasn't square, and lighting that shifts as you move down the wall. Cleanup means cropping to the portrait, straightening perspective, and evening out brightness so a hundred entries look like a *set* rather than a hundred snapshots.

This is tedious and needs someone with proper diligence and knowledge. **Preferred alternative:** the committee supplies proper text and graphics through other means.

> Shooting well beats fixing later — a phone on a small tripod, square to the wall, room lights off, with a window or lamp off to one side, kills most of the glare before it exists.

---

## 5. Site architecture

A **static site generated from the sheet.** No server, no database, no login. Hosts free on GitHub Pages or similar. It can't really break.

### Build trigger

A **scheduled job** — a GitHub Action on a nightly or weekly cron — pulls the sheet, regenerates the site, commits and deploys.

The committee edits the sheet; the site catches up on its own. No button, nothing to teach them, and it survives them not touching it for two years. Changes appear within a day, which is plenty given updates come every two years, not daily.

### Failure behaviour

If a filename doesn't match anything in the folder — and it will happen — **the build must not fail.** It should:

- use the placeholder silhouette for that inductee,
- publish anyway,
- record the mismatches.

Otherwise one typo takes the whole site down and you become the permanent support desk.

### The build report

An **unlisted page on the site itself**, at a boring path you'll remember. No authentication — the worst case is a curious visitor learning that three plaque photos are missing, which is not a secret worth protecting.

Put the **build timestamp at the top**. The failure that bites silently is the cron quietly stopping and nobody noticing for a year.

---

## 6. Pages

| Page | Purpose |
|---|---|
| Landing | Hero graphic (school mascot), plus the nomination call-to-action |
| All inductees | Browsable list with search and filtering |
| Inductee detail | Photo, blurb, and a nomination link at the bottom |
| Induction year | A page per banquet class — how the group thinks about it |
| About | What the hall of fame is, the committee's mission, who's on the committee, how to sponsor / contribute |
| Nomination | Google Form, no backend |
| Build report | Unlisted; doesn't count as a real page |

**Media in hand:** a hero page graphic using the school's mascot, plus video transformations generated with Higgsfield.

---

## 7. The nomination funnel

The committee's nomination process is a real gap — they don't get many nominations and have to pursue candidates themselves. So the site isn't just an archive, it's the **recruitment funnel they don't currently have.** Worth designing for.

- Nomination call-to-action **on the landing page**, not buried in About.
- A **Google Form** for submissions, so the committee owns them with no backend.
- Be explicit on the form about **eligibility, what evidence helps, and the rough deadline.** Vague asks get few responses.
- A **"know someone who belongs here?"** link at the bottom of every inductee page. Someone browsing their old coach's page is exactly the person who'd nominate a teammate — this will likely outperform the landing page.

---

## 8. Playful enhancement — moving portraits

The *Daily Prophet* effect from the Harry Potter films: a still image by default, swapping to a short looping video on hover or tap, and back to the still on leave. A good fit for a hall of fame, since those portraits are exactly the frozen-moment shots that want to come alive — a football player completing the play, or turning to wave.

Cheap to build and it degrades gracefully: no video, you just get the photo. Also a chance to learn Higgsfield image/video generation.

**Two constraints agreed:**

- **Keep clips to a couple of seconds**, not ten. Longer feels like it's holding you hostage on a hover.
- **Committee opt-in per inductee**, not applied to all hundred by default. Some inductees are deceased, and a generated video of someone waving at the camera could land as charming or as unsettling depending on the person and the family.

---

## 9. Future / version two

**A Three.js virtual wall.** An art-museum-style 3D presentation of the plaques — a space you pan along, clicking a plaque to open that inductee.

This is meaningful rather than decorative, because it mirrors the real thing the committee cares about, and it's a genuine Three.js exercise: textures, camera controls, click detection.

**Kept off the initial build.** Three.js earns its keep when you need real 3D; a hall of fame is fundamentally a grid of portraits and text, and forcing 3D onto it usually makes it slower to browse. If pursued, it's an **extra route alongside the plain list, never the only way in** — grandparents on an iPad need the boring page.

Because the site is sheet-driven, this becomes a separate *view over the same data* rather than a rewrite.
