const loadInductees = require("../../lib/loadInductees");
const loadClasses = require("./classes.js");
const announcements = require("./announcements.js");

module.exports = async function () {
  const inductees = await loadInductees();
  const classes = await loadClasses();

  return {
    generatedAt: new Date(),
    totalInductees: inductees.length,
    totalClasses: classes.length,
    photoMissing: inductees.mismatches.filter((m) => m.reason === "not-provided"),
    photoMismatched: inductees.mismatches.filter((m) => m.reason === "not-found"),
    announcementPhotoMismatches: announcements.mismatches || [],
    badYears: inductees.badYears,
    driveError: inductees.driveError,
    flaggedNotes: inductees.filter((i) => i.notes),
  };
};
