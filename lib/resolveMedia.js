const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const dirCache = new Map();

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

function findMatch(requested, absDir, urlDir) {
  if (!requested || !requested.trim()) {
    return { matched: false, url: null, requested: null };
  }
  const target = norm(requested);
  const found = listDir(absDir).find((f) => norm(f) === target);
  return found
    ? { matched: true, url: `${urlDir}/${found}`, requested: requested.trim() }
    : { matched: false, url: null, requested: requested.trim() };
}

const PHOTOS_DIR = path.join(ROOT, "assets/photos/inductees");
const VIDEOS_DIR = path.join(ROOT, "assets/videos/inductees");
const ANNOUNCEMENT_PHOTOS_DIR = path.join(ROOT, "assets/photos/announcements");

module.exports = {
  resolvePhoto: (name) => findMatch(name, PHOTOS_DIR, "/assets/photos/inductees"),
  resolveVideo: (name) => findMatch(name, VIDEOS_DIR, "/assets/videos/inductees"),
  resolveAnnouncementPhoto: (name) => findMatch(name, ANNOUNCEMENT_PHOTOS_DIR, "/assets/photos/announcements"),
};
