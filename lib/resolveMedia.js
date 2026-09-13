const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const dirCache = new Map();

// Photos and their moving-portrait videos share one base name in one Drive
// folder (KelleighSimmonsAllen.jpeg / KelleighSimmonsAllen.mp4), and matching
// ignores extensions - so the extension is the only thing telling them apart.
const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const VIDEO_EXTS = [".mp4", ".webm", ".mov", ".m4v"];

function listDir(absDir) {
  if (!dirCache.has(absDir)) {
    let files = [];
    try {
      files = fs.readdirSync(absDir);
    } catch {
      files = []; // missing directory just means no matches - never fail the build
    }
    dirCache.set(absDir, files);
  }
  return dirCache.get(absDir);
}

function norm(name) {
  return path.parse(name).name.trim().toLowerCase();
}

function findMatch(requested, absDir, urlDir, allowedExts) {
  if (!requested || !requested.trim()) {
    return { matched: false, url: null, requested: null };
  }
  const target = norm(requested);
  const found = listDir(absDir).find(
    (f) => norm(f) === target && allowedExts.includes(path.extname(f).toLowerCase())
  );
  return found
    ? { matched: true, url: `${urlDir}/${found}`, requested: requested.trim() }
    : { matched: false, url: null, requested: requested.trim() };
}

const PHOTOS_DIR = path.join(ROOT, "assets/photos/inductees");
const VIDEOS_DIR = path.join(ROOT, "assets/videos/inductees");
const ANNOUNCEMENT_PHOTOS_DIR = path.join(ROOT, "assets/photos/announcements");
// One Drive folder holds both photos and videos, so both live resolvers read
// the same synced directory and separate on extension.
const LIVE_MEDIA_DIR = path.join(ROOT, ".cache/media/inductees");
const LIVE_MEDIA_URL = "/assets/media/inductees";

module.exports = {
  resolvePhoto: (name) => findMatch(name, PHOTOS_DIR, "/assets/photos/inductees", IMAGE_EXTS),
  resolveVideo: (name) => findMatch(name, VIDEOS_DIR, "/assets/videos/inductees", VIDEO_EXTS),
  resolveAnnouncementPhoto: (name) =>
    findMatch(name, ANNOUNCEMENT_PHOTOS_DIR, "/assets/photos/announcements", IMAGE_EXTS),
  resolveLivePhoto: (name) => findMatch(name, LIVE_MEDIA_DIR, LIVE_MEDIA_URL, IMAGE_EXTS),
  resolveLiveVideo: (name) => findMatch(name, LIVE_MEDIA_DIR, LIVE_MEDIA_URL, VIDEO_EXTS),
  LIVE_MEDIA_DIR,
};
