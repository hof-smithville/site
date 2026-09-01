const fs = require("fs");
const path = require("path");
const { resolveAnnouncementPhoto } = require("./resolveMedia");

const ROOT = path.join(__dirname, "..");
const DATA_PATH = path.join(ROOT, "announcements.json");

module.exports = function loadAnnouncements() {
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  const rows = JSON.parse(raw);

  const mismatches = [];

  const published = rows
    .filter((r) => (r.publish || "").toLowerCase() === "yes")
    .map((r) => {
      let photoUrl = null;
      if (r.photoFilename && r.photoFilename.trim()) {
        const photo = resolveAnnouncementPhoto(r.photoFilename);
        if (photo.matched) {
          photoUrl = photo.url;
        } else {
          mismatches.push({ headline: r.headline, requested: r.photoFilename, reason: "not-found" });
        }
      }
      return {
        date: r.date,
        headline: r.headline,
        body: r.body,
        linkText: r.linkText || null,
        linkUrl: r.linkUrl || null,
        photoUrl,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 3);

  published.mismatches = mismatches;
  return published;
};
