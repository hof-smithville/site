// Reads a tab's rows as plain objects keyed by its header row - the same
// shape csv-parse's `columns: true` mode produces, so downstream code
// doesn't care whether a row came from the CSV or a live sheet.
async function fetchSheetRows(auth, spreadsheetId, range) {
  const headers = await auth.getRequestHeaders();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}?majorDimension=ROWS`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Sheets API ${res.status} for range "${range}": ${await res.text()}`);
  }
  const data = await res.json();
  const [header, ...rows] = data.values || [];
  if (!header) return [];

  return rows
    .filter((row) => row.some((cell) => (cell || "").trim()))
    .map((row) => {
      const obj = {};
      header.forEach((key, i) => {
        obj[key] = row[i] || "";
      });
      return obj;
    });
}

module.exports = { fetchSheetRows };
