const { getAuthClient, isLiveModeConfigured } = require("./googleAuth");
const { fetchSheetRows } = require("./googleSheets");
const localScholarships = require("../scholarships.json");

function buildYears(rows) {
  const years = rows
    .map((r) => {
      const recipients = (r["Recipients"] || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const year = parseInt(r["Year"], 10);
      return { year: Number.isFinite(year) ? year : r["Year"], recipients, count: recipients.length };
    })
    .filter((y) => y.recipients.length)
    .sort((a, b) => {
      const ay = typeof a.year === "number" ? a.year : -1;
      const by = typeof b.year === "number" ? b.year : -1;
      return by - ay;
    });

  years.totalRecipients = years.reduce((sum, y) => sum + y.count, 0);
  years.firstYear = years.length ? years[years.length - 1].year : null;
  return years;
}

module.exports = async function loadScholarships() {
  if (!isLiveModeConfigured()) return buildYears(localScholarships);

  const rows = await fetchSheetRows(getAuthClient(), process.env.GOOGLE_SHEETS_ID, "scholarships!A:B");
  return buildYears(rows.length ? rows : localScholarships);
};
