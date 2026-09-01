const inductees = require("./inductees.js");

const seen = new Map();
for (const i of inductees) {
  for (const s of i.sports) {
    if (!seen.has(s.slug)) seen.set(s.slug, s);
  }
}

module.exports = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
