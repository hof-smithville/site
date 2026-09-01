const SPORT_ICON_MAP = {
  baseball: "sports-baseball",
  basketball: "sports-basketball",
  cheerleading: "sports-cheerleading",
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

module.exports = { getSportIcon, slugifySport, normalizeSportKey, SPORT_ICON_MAP };
