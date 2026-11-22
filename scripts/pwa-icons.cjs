// Builds the install icons in public/icons from the original logo artwork.
//   node scripts/pwa-icons.cjs
// "any" icons: the black logo on the page's ivory. "maskable": the white logo on peacock green,
// kept inside the central safe zone so Android can crop it to any shape.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const out = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(out, { recursive: true });

const IVORY = "#f6f1e6";
const GREEN = "#1d4e47";

async function icon(file, size, src, bg, scale) {
  const w = Math.round(size * scale);
  const logo = await sharp(path.join(__dirname, "..", "public", "brand", src)).resize({ width: w }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: logo, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(out, file));
  console.log(file);
}

(async () => {
  await icon("icon-192.png", 192, "onv-icon.png", IVORY, 0.78);
  await icon("icon-512.png", 512, "onv-icon.png", IVORY, 0.78);
  await icon("maskable-192.png", 192, "onv-icon-white.png", GREEN, 0.6);
  await icon("maskable-512.png", 512, "onv-icon-white.png", GREEN, 0.6);
  await icon("apple-touch-icon.png", 180, "onv-icon.png", IVORY, 0.76);
})();
