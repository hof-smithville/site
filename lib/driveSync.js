const { getAuthClient, isLiveModeConfigured } = require("./googleAuth");
const { syncDriveFolder } = require("./googleDrive");
const { LIVE_MEDIA_DIR } = require("./resolveMedia");

// The sync must finish before Eleventy starts copying files, so it runs from
// an "eleventy.before" hook rather than from a data file. Data files read the
// result from here afterwards.
let status = { error: null, fileCount: 0 };

async function runDriveSync() {
  if (!isLiveModeConfigured()) {
    status = { error: null, fileCount: 0 };
    return status;
  }

  const result = await syncDriveFolder(
    getAuthClient(),
    process.env.GOOGLE_DRIVE_FOLDER_ID,
    LIVE_MEDIA_DIR
  );
  status = { error: result.error, fileCount: result.files.length };
  return status;
}

module.exports = { runDriveSync, getSyncStatus: () => status };
