const { getAuthClient, isLiveModeConfigured } = require("./googleAuth");

// The params tab is a plain key/value table, not a header-row table like the
// other tabs, so it doesn't go through fetchSheetRows.
async function fetchParams(auth, spreadsheetId) {
  const headers = await auth.getRequestHeaders();
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("params!A:B")}`,
    { headers }
  );
  if (!res.ok) throw new Error(`Sheets API ${res.status} for params tab: ${await res.text()}`);
  const data = await res.json();

  const params = {};
  for (const [key, value] of data.values || []) {
    if (key) params[key.trim()] = (value || "").trim();
  }
  return params;
}

// Returns {} when not in live mode or when a key is blank in the sheet -
// callers fall back to their own placeholder for anything missing.
module.exports = async function loadParams() {
  if (!isLiveModeConfigured()) return {};
  return fetchParams(getAuthClient(), process.env.GOOGLE_SHEETS_ID);
};
