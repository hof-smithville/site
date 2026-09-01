module.exports = function slugify(str) {
  return (str || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/['’"]/g, "") // drop quotes/apostrophes entirely rather than turning them into hyphens
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
