const { getAuthClient, isLiveModeConfigured } = require("./googleAuth");
const { fetchSheetRows } = require("./googleSheets");
const localCommittee = require("../committee.json");

module.exports = async function loadCommittee() {
  if (!isLiveModeConfigured()) return localCommittee;

  const rows = await fetchSheetRows(getAuthClient(), process.env.GOOGLE_SHEETS_ID, "committee!A:B");
  if (!rows.length) return localCommittee;

  return rows.map((r) => ({ name: r["Name"], role: r["Title"] }));
};
