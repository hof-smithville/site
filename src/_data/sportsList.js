const loadInductees = require("../../lib/loadInductees");

module.exports = async function () {
  const inductees = await loadInductees();

  const seen = new Map();
  for (const i of inductees) {
    for (const s of i.sports) {
      if (!seen.has(s.slug)) seen.set(s.slug, s);
    }
  }

  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
};
