const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const slugify = require("./slugify");
const { resolvePhoto, resolveVideo } = require("./resolveMedia");
const { getSportIcon, slugifySport } = require("./sportIcons");

const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(ROOT, "hall-of-fame-data.csv");

function splitList(v) {
  return (v || "").split(",").map((s) => s.trim()).filter(Boolean);
}

function parseYearLoose(raw) {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

module.exports = function loadInductees() {
  const raw = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    relax_quotes: true, // committee-typed data will contain stray quotes (e.g. Robert "Coach" Thompson) that aren't RFC4180 field-quoting
  });

  const mismatches = [];
  const badYears = [];
  const seenSlugs = new Map();

  const inductees = rows.map((row) => {
    const name = row["Inductee name"];

    const inductionYearRaw = row["Induction year"];
    const inductionYear = parseYearLoose(inductionYearRaw);
    if (inductionYear === null) {
      badYears.push({ name, field: "Induction year", raw: inductionYearRaw });
    }

    const graduationYearRaw = row["Graduation year"];
    const graduationYear = graduationYearRaw ? parseYearLoose(graduationYearRaw) : null;
    if (graduationYearRaw && graduationYear === null) {
      badYears.push({ name, field: "Graduation year", raw: graduationYearRaw });
    }

    const sports = splitList(row["Sport"]).map((s) => ({
      name: s,
      slug: slugifySport(s),
      icon: getSportIcon(s),
    }));

    const category = (row["Category"] || "").trim();
    const teamMembers = splitList(row["Team members"]);

    let slug = `${inductionYear !== null ? inductionYear : "unknown"}-${slugify(name)}`;
    const count = seenSlugs.get(slug) || 0;
    if (count > 0) slug = `${slug}-${count + 1}`;
    seenSlugs.set(slug, count + 1);

    const photoFilename = (row["Photo filename"] || "").trim();
    const photo = resolvePhoto(photoFilename);
    if (photoFilename && !photo.matched) {
      mismatches.push({ name, inductionYear, requested: photoFilename, reason: "not-found" });
    } else if (!photoFilename) {
      mismatches.push({ name, inductionYear, requested: null, reason: "not-provided" });
    }

    const video = resolveVideo(photoFilename);

    return {
      name,
      inductionYear,
      graduationYear,
      sports,
      sportsLabel: sports.map((s) => s.name).join(" · "),
      sportSlugsAttr: sports.map((s) => s.slug).join(" "),
      category,
      categorySlug: slugify(category),
      isTeam: category.toLowerCase() === "team",
      accomplishments: row["Accomplishments"],
      teamMembers,
      notes: (row["Notes"] || "").trim() || null,
      photo,
      photoUrl: photo.matched ? photo.url : "/assets/icons/blacksmith-silhoutte.png",
      movingPortrait: video.matched ? { enabled: true, url: video.url } : { enabled: false },
      slug,
      url: `/inductees/${slug}/`,
      searchText: [name, sports.map((s) => s.name).join(" "), graduationYearRaw, inductionYearRaw, category]
        .join(" ")
        .toLowerCase(),
    };
  });

  inductees.sort((a, b) => {
    const ay = a.inductionYear !== null ? a.inductionYear : -1;
    const by = b.inductionYear !== null ? b.inductionYear : -1;
    return by - ay || a.name.localeCompare(b.name);
  });

  inductees.mismatches = mismatches;
  inductees.badYears = badYears;
  return inductees;
};
