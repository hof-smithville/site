require("dotenv").config();
const fs = require("fs");
const { runDriveSync } = require("./lib/driveSync");

module.exports = async function (eleventyConfig) {
  // GitHub Pages serves a project repo from /<repo>/, which would break every
  // absolute /assets/... link. This plugin rewrites them to match PATH_PREFIX;
  // it's a no-op at the default "/" (custom domain or user-pages site).
  const { EleventyHtmlBasePlugin } = await import("@11ty/eleventy");
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ assets: "assets" });

  // Photos and moving-portrait videos synced live from Drive land here. The
  // sync has to complete before passthrough copy enumerates the directory -
  // doing it from a data file instead races the copy and can kill the build.
  fs.mkdirSync(".cache/media/inductees", { recursive: true });
  eleventyConfig.on("eleventy.before", runDriveSync);
  eleventyConfig.addPassthroughCopy({ ".cache/media/inductees": "assets/media/inductees" });

  return {
    pathPrefix: process.env.PATH_PREFIX || "/",
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
