const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

// Committee members upload straight off phones and scanners - 10-20 MB files
// that would otherwise ship as-is to show in a 210px card. Each photo becomes
// two web copies: <name>.webp for the detail page and <name>-thumb.webp for
// cards and class rows. Widths are ~2x the largest CSS size for sharp retina
// display. Anything that isn't an image (moving-portrait videos) is copied over.
const SIZES = [
  { suffix: "", width: 800 },
  { suffix: "-thumb", width: 480 },
];

async function optimizeFile(srcPath, outDir) {
  const base = path.parse(srcPath).name;
  // rotate() with no args applies the EXIF orientation - without it, portrait
  // iPhone shots come out sideways once the metadata is stripped.
  const input = sharp(srcPath).rotate();
  await Promise.all(
    SIZES.map(({ suffix, width }) =>
      input
        .clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(outDir, `${base}${suffix}.webp`))
    )
  );
}

// Returns the names of files that couldn't be processed; one bad upload must
// never fail the build, it just won't have a photo.
async function optimizeImages(srcDir, outDir) {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  let names = [];
  try {
    names = fs.readdirSync(srcDir);
  } catch {
    return [];
  }

  const failed = [];
  // One at a time: decoding a 20 MB PNG takes a few hundred MB of memory.
  for (const name of names) {
    const srcPath = path.join(srcDir, name);
    try {
      if (IMAGE_EXTS.includes(path.extname(name).toLowerCase())) {
        await optimizeFile(srcPath, outDir);
      } else {
        fs.copyFileSync(srcPath, path.join(outDir, name));
      }
    } catch (err) {
      failed.push(`${name}: ${err.message}`);
    }
  }
  return failed;
}

module.exports = { optimizeImages };
