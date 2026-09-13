const loadInductees = require("../../lib/loadInductees");

module.exports = async function () {
  const inductees = await loadInductees();

  const byYear = new Map();
  for (const i of inductees) {
    const key = i.inductionYear !== null ? i.inductionYear : "unknown";
    if (!byYear.has(key)) byYear.set(key, []);
    byYear.get(key).push(i);
  }

  return [...byYear.entries()]
    .map(([year, items]) => ({
      year,
      inductees: items.slice().sort((a, b) => a.name.localeCompare(b.name)),
      count: items.length,
    }))
    .sort((a, b) => {
      const ay = typeof a.year === "number" ? a.year : -1;
      const by = typeof b.year === "number" ? b.year : -1;
      return by - ay;
    });
};
