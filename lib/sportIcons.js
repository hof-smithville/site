const SPORT_ICON_MAP = {
  anvil: "sports-anvil",
  baseball: "sports-baseball",
  basketball: "sports-basketball",
  cheerleading: "sports-cheerleading",
  coach: "sports-coach",
  "cross country": "sports-crosscountry",
  crosscountry: "sports-crosscountry",
  football: "sports-football",
  golf: "sports-golf",
  soccer: "sports-soccer",
  softball: "sports-softball",
  track: "sports-trackandfield",
  "track and field": "sports-trackandfield",
  "track & field": "sports-trackandfield",
  volleyball: "sports-volleyball",
  wrestling: "sports-wrestling",
};

function normalizeSportKey(raw) {
  return (raw || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ");
}

function getSportIcon(raw) {
  const key = SPORT_ICON_MAP[normalizeSportKey(raw)];
  return key ? `/assets/icons/sports/${key}.png` : null;
}

function slugifySport(raw) {
  return normalizeSportKey(raw)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Every distinct icon in the map, first spelling wins - the map has aliases
// (track / track and field / track & field) pointing at one file.
function getAllSportIcons() {
  const byFile = new Map();
  for (const [key, file] of Object.entries(SPORT_ICON_MAP)) {
    if (byFile.has(file)) continue;
    byFile.set(file, {
      name: key.replace(/\b\w/g, (c) => c.toUpperCase()),
      slug: slugifySport(key),
      icon: `/assets/icons/sports/${file}.png`,
    });
  }
  return [...byFile.values()];
}

module.exports = { getSportIcon, slugifySport, normalizeSportKey, getAllSportIcons, SPORT_ICON_MAP };
