// Traces the original logo icon (public/brand/onv-icon.png) into a vector: public/brand/onv-icon.svg.
//   node scripts/logo-svg.cjs
// The artwork is a solid single-colour mark, so tracing its outline is exact up to pixel level:
// pixel boundaries are chained into closed loops, then smoothed (Ramer–Douglas–Peucker) and
// drawn with the even-odd rule so holes stay holes. Uses currentColor, so it takes any colour.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "public", "brand", "onv-icon.png");
const OUT = path.join(__dirname, "..", "public", "brand", "onv-icon.svg");
const UP = 3; // trace at 3x for smoother curves
const EPS = 0.9; // smoothing tolerance, in traced pixels

(async () => {
  const meta = await sharp(SRC).metadata();
  const W = meta.width * UP, H = meta.height * UP;
  const { data } = await sharp(SRC).resize(W, H, { kernel: "cubic" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const on = (x, y) => x >= 0 && y >= 0 && x < W && y < H && data[(y * W + x) * 4 + 3] > 128;

  // Directed boundary edges with the filled pixel on the right; keyed by start corner.
  const next = new Map();
  const add = (ax, ay, bx, by) => { const k = ay * (W + 1) + ax; (next.get(k) ?? next.set(k, []).get(k)).push([bx, by]); };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!on(x, y)) continue;
    if (!on(x, y - 1)) add(x, y, x + 1, y);
    if (!on(x + 1, y)) add(x + 1, y, x + 1, y + 1);
    if (!on(x, y + 1)) add(x + 1, y + 1, x, y + 1);
    if (!on(x - 1, y)) add(x, y + 1, x, y);
  }

  const loops = [];
  for (const [k0, list] of next) {
    while (list.length) {
      const pts = [[k0 % (W + 1), Math.floor(k0 / (W + 1))]];
      let [cx, cy] = list.pop();
      while (!(cx === pts[0][0] && cy === pts[0][1])) {
        pts.push([cx, cy]);
        const l = next.get(cy * (W + 1) + cx);
        if (!l || !l.length) break;
        [cx, cy] = l.pop();
      }
      if (pts.length > 6) loops.push(pts);
    }
  }

  // Ramer–Douglas–Peucker on a closed loop (split at the farthest point from the start).
  const rdp = (p, eps) => {
    if (p.length < 3) return p;
    const [ax, ay] = p[0], [bx, by] = p[p.length - 1];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    let max = 0, idx = 0;
    for (let i = 1; i < p.length - 1; i++) {
      const d = Math.abs(dy * p[i][0] - dx * p[i][1] + bx * ay - by * ax) / len;
      if (d > max) { max = d; idx = i; }
    }
    if (max <= eps) return [p[0], p[p.length - 1]];
    return [...rdp(p.slice(0, idx + 1), eps).slice(0, -1), ...rdp(p.slice(idx), eps)];
  };
  const f = (n) => +(n / UP).toFixed(2);
  let d = "";
  for (const loop of loops) {
    let far = 0, best = 0;
    for (let i = 0; i < loop.length; i++) { const v = Math.hypot(loop[i][0] - loop[0][0], loop[i][1] - loop[0][1]); if (v > best) { best = v; far = i; } }
    const a = rdp(loop.slice(0, far + 1), EPS), b = rdp([...loop.slice(far), loop[0]], EPS);
    const pts = [...a.slice(0, -1), ...b.slice(0, -1)];
    if (pts.length < 3) continue;
    d += "M" + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L") + "Z";
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${meta.width} ${meta.height}" fill="currentColor"><path fill-rule="evenodd" d="${d}"/></svg>\n`;
  fs.writeFileSync(OUT, svg);
  console.log(OUT, loops.length, "loops", svg.length, "bytes");
})();
