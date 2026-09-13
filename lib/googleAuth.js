const fs = require("fs");
const { JWT } = require("google-auth-library");

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
];

function readCredentials() {
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (inline) return JSON.parse(inline);

  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyFile) return JSON.parse(fs.readFileSync(keyFile, "utf8"));

  return null;
}

// Live mode needs a service account plus the sheet/folder it should read.
function isLiveModeConfigured() {
  return Boolean(
    (process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS) &&
      process.env.GOOGLE_SHEETS_ID &&
      process.env.GOOGLE_DRIVE_FOLDER_ID
  );
}

let cachedClient = null;
function getAuthClient() {
  if (cachedClient) return cachedClient;
  const creds = readCredentials();
  if (!creds) throw new Error("No Google service-account credentials found in the environment");
  cachedClient = new JWT({ email: creds.client_email, key: creds.private_key, scopes: SCOPES });
  return cachedClient;
}

module.exports = { getAuthClient, isLiveModeConfigured };
