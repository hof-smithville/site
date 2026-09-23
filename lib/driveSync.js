const { getAuthClient, isLiveModeConfigured } = require("./googleAuth");
const { syncDriveFolder } = require("./googleDrive");
const { optimizeImages } = require("./optimizeImages");
const { LIVE_MEDIA_DIR, DRIVE_DOWNLOAD_DIR } = require("./resolveMedia");

// The sync must finish before Eleventy starts copying files, so it runs from
// an "eleventy.before" hook rather than from a data file. Data files read the
// result from here afterwards.
let status = { error: null, fileCount: 0, imageErrors: [] };

async function runDriveSync() {
  if (!isLiveModeConfigured()) {
    status = { error: null, fileCount: 0, imageErrors: [] };
    return status;
  }

  // Originals land in a staging folder; only the resized web copies are
  // published, so a 20 MB upload never reaches visitors.
  const result = await syncDriveFolder(
    getAuthClient(),
    process.env.GOOGLE_DRIVE_FOLDER_ID,
    DRIVE_DOWNLOAD_DIR
  );
  const imageErrors = await optimizeImages(DRIVE_DOWNLOAD_DIR, LIVE_MEDIA_DIR);
  status = { error: result.error, fileCount: result.files.length, imageErrors };
  return status;
}

module.exports = { runDriveSync, getSyncStatus: () => status };
