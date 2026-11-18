/* eslint-disable @typescript-eslint/no-require-imports */
// Usage: node scripts/brand-cut.cjs . "[21,22,17,30,29,13,19]"   (pass "list" to see ink components)
// Finds connected ink components in the original logo, reports them, and writes
// transparent PNG variants. The artwork itself is not altered.
const path = require("path");
const fs = require("fs");
const root = process.argv[2];
const sharp = require(path.join(root, "node_modules", "sharp"));
const src = path.join(root, "assets", "logo-original.png");
const out = path.join(root, "public", "brand");
fs.mkdirSync(out, { recursive: true });

(async () => {
  const { data, info } = await sharp(src).flatten({ background: "#fff" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const lab = new Int32Array(W * H).fill(-1);
  const comps = [];
  for (let i = 0; i < W * H; i++) {
    if (data[i] >= 160 || lab[i] !== -1) continue;
    const id = comps.length, stack = [i];
    let n = 0, x0 = W, y0 = H, x1 = 0, y1 = 0;
    lab[i] = id;
    while (stack.length) {
      const p = stack.pop(), x = p % W, y = (p / W) | 0;
      n++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      for (const q of [p - 1, p + 1, p - W, p + W]) {
        if (q < 0 || q >= W * H) continue;
        if (Math.abs((q % W) - x) > 1) continue;
        if (data[q] < 160 && lab[q] === -1) { lab[q] = id; stack.push(q); }
      }
    }
    comps.push({ id, n, x0, y0, x1, y1 });
  }
  const big = comps.filter((c) => c.n > 150).sort((a, b) => b.n - a.n);
  if (process.argv[3] === "list") {
    for (const c of big) console.log(c.id, c.n, `x${c.x0}-${c.x1} y${c.y0}-${c.y1}`);
    return;
  }
  const iconIds = new Set(JSON.parse(process.argv[3]));

  // Alpha from darkness keeps the original anti-aliased edges.
  const make = async (keep, rgb, file, pad = 0, ids = iconIds, fixed = null) => {
    const iconIds = ids;
    const buf = Buffer.alloc(W * H * 4);
    let bx0 = W, by0 = H, bx1 = 0, by1 = 0;
    for (let i = 0; i < W * H; i++) {
      const x = i % W, y = (i / W) | 0;
      // edge-of-image frame lines are scanner artefacts, drop them
      if (x < 3 || y < 3 || x > W - 4 || y > H - 4) continue;
      let ok = keep === "all";
      if (!ok) {
        // include AA pixels next to a kept component
        for (let dy = -1; dy <= 1 && !ok; dy++) for (let dx = -1; dx <= 1 && !ok; dx++) {
          const q = i + dy * W + dx;
          if (q >= 0 && q < W * H && iconIds.has(lab[q])) ok = true;
        }
      }
      const a = 255 - data[i];
      if (!ok || a < 8) continue;
      buf[i * 4] = rgb[0]; buf[i * 4 + 1] = rgb[1]; buf[i * 4 + 2] = rgb[2]; buf[i * 4 + 3] = a;
      bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y);
    }
    if (fixed) [bx0, by0, bx1, by1] = fixed;
    const img = sharp(buf, { raw: { width: W, height: H, channels: 4 } })
      .extract({ left: bx0, top: by0, width: bx1 - bx0 + 1, height: by1 - by0 + 1 })
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } });
    await img.png().toFile(path.join(out, file));
    console.log("wrote", file, bx1 - bx0 + 1, "x", by1 - by0 + 1, "bbox", [bx0, by0, bx1, by1].join(","));
    return [bx0, by0, bx1, by1];
  };

  await make("all", [0, 0, 0], "onv-logo.png", 8);
  await make("all", [255, 255, 255], "onv-logo-white.png", 8);
  const box = await make("icon", [0, 0, 0], "onv-icon.png", 6);
  await make("icon", [255, 255, 255], "onv-icon-white.png", 6);
  // Loader layers: same canvas as the icon so they stack exactly.
  await make("icon", [0, 0, 0], "loader-head.png", 6, new Set([13]), box);
  await make("icon", [0, 0, 0], "loader-book.png", 6, new Set([...iconIds].filter((i) => i !== 13)), box);

  // Favicon / app icons: original icon centred on a white rounded tile.
  const tile = async (size, file, radius) => {
    const inner = Math.round(size * 0.78);
    const icon = await sharp(path.join(out, "onv-icon.png")).resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
    const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#ffffff"/></svg>`);
    await sharp(bg).composite([{ input: icon, gravity: "center" }]).png().toFile(file);
    console.log("wrote", file);
  };
  await tile(512, path.join(root, "src", "app", "icon.png"), 96);
  await tile(180, path.join(root, "src", "app", "apple-icon.png"), 0);
})();
