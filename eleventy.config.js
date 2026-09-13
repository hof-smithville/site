require("dotenv").config();
const fs = require("fs");
const { runDriveSync } = require("./lib/driveSync");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ assets: "assets" });

  // Photos and moving-portrait videos synced live from Drive land here. The
  // sync has to complete before passthrough copy enumerates the directory -
  // doing it from a data file instead races the copy and can kill the build.
  fs.mkdirSync(".cache/media/inductees", { recursive: true });
  eleventyConfig.on("eleventy.before", runDriveSync);
  eleventyConfig.addPassthroughCopy({ ".cache/media/inductees": "assets/media/inductees" });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
