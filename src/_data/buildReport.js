const inductees = require("./inductees.js");
const announcements = require("./announcements.js");
const classes = require("./classes.js");

module.exports = {
  generatedAt: new Date(),
  totalInductees: inductees.length,
  totalClasses: classes.length,
  photoMissing: inductees.mismatches.filter((m) => m.reason === "not-provided"),
  photoMismatched: inductees.mismatches.filter((m) => m.reason === "not-found"),
  announcementPhotoMismatches: announcements.mismatches || [],
  badYears: inductees.badYears,
  flaggedNotes: inductees.filter((i) => i.notes),
};
