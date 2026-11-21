"use client";

import { useEffect, useRef } from "react";

// Page tokens: royal-700 for shadows, a muted kani gold for mid tones.
const INK = [20, 58, 53] as const;
const TINT = [168, 120, 40] as const;
const MORPH_MS = 3000;

type Crop = [number, number, number, number];
type Props = {
  src: string;
  alt: string;
  crop?: Crop;
  className?: string;
};

const images = new Map<string, Promise<HTMLImageElement>>();
function loadImage(src: string) {
  let p = images.get(src);
  if (!p) {
    p = new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });
    images.set(src, p);
  }
  return p;
}

/** Start loading (and decoding) images ahead of time so a later change is instant. */
export function preloadImages(srcs: string[]) {
  for (const s of srcs) loadImage(s).catch(() => {});
}

// Sampling is the slow part of a change, so keep results per image and box size.
const samples = new Map<string, Float32Array>();

/**
 * Turns a photo into N stippled points: [x, y, z, lum, fade] each, centred on the box,
 * sorted top to bottom so a morph between two portraits moves points to nearby places.
 */
function sample(img: HTMLImageElement, crop: Crop, W: number, H: number, N: number) {
  const [cx, cy, cw, ch] = crop;
  const sw = img.naturalWidth * cw, sh = img.naturalHeight * ch;
  const ir = sw / sh;
  // Fit inside the box, leaving room for the edges to dissolve.
  let dh = H * 0.9, dw = dh * ir;
  if (dw > W * 0.98) { dw = W * 0.98; dh = dw / ir; }
  const grain = Math.max(1.2, Math.sqrt((dw * dh) / 90000));
  const cols = Math.round(dw / grain), rows = Math.round(dh / grain);

  const off = document.createElement("canvas");
  off.width = cols; off.height = rows;
  const o = off.getContext("2d", { willReadFrequently: true })!;
  o.drawImage(img, img.naturalWidth * cx, img.naturalHeight * cy, sw, sh, 0, 0, cols, rows);
  const data = o.getImageData(0, 0, cols, rows).data;

  // Auto-levels between the 3rd and 97th percentile, then an S-curve for contrast.
  const lums = new Float32Array(cols * rows);
  for (let q = 0; q < lums.length; q++) lums[q] = (0.299 * data[q * 4] + 0.587 * data[q * 4 + 1] + 0.114 * data[q * 4 + 2]) / 255;
  const sorted = Float32Array.from(lums).sort();
  const lo = sorted[Math.floor(sorted.length * 0.03)], hi = sorted[Math.floor(sorted.length * 0.97)];
  const span = Math.max(0.05, hi - lo);

  // Weight each cell: darker = more dots, faded towards an oval edge on every side.
  const weight = new Float32Array(cols * rows);
  const tone = new Float32Array(cols * rows);
  const fades = new Float32Array(cols * rows);
  let total = 0;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const q = j * cols + i;
      const lin = Math.min(1, Math.max(0, (lums[q] - lo) / span));
      const lum = lin * lin * (3 - 2 * lin);
      const nx = (i / cols - 0.5) / 0.5, ny = (j / rows - 0.46) / 0.54;
      const d = Math.sqrt(nx * nx + ny * ny);
      const fade = d < 0.5 ? 1 : Math.max(0, 1 - (d - 0.5) / 0.5) ** 1.6;
      const w = (0.02 + Math.pow(1 - lum, 1.6)) * fade;
      tone[q] = lum; fades[q] = fade; weight[q] = w; total += w;
    }
  }
  const cum = new Float32Array(cols * rows);
  let acc = 0;
  for (let q = 0; q < cum.length; q++) { acc += weight[q]; cum[q] = acc; }

  const out = new Float32Array(N * 5);
  const ox = -dw / 2, oy = -dh / 2;
  for (let p = 0; p < N; p++) {
    // Importance-sample a cell by weight (binary search on the running total).
    const r = Math.random() * total;
    let a = 0, b = cum.length - 1;
    while (a < b) { const m = (a + b) >> 1; if (cum[m] < r) a = m + 1; else b = m; }
    const i = a % cols, j = (a / cols) | 0;
    const lum = tone[a];
    out[p * 5] = ox + (i + Math.random()) * grain;
    out[p * 5 + 1] = oy + (j + Math.random()) * grain;
    out[p * 5 + 2] = (lum - 0.5) * 80 * fades[a];
    out[p * 5 + 3] = lum;
    out[p * 5 + 4] = fades[a];
  }
  // Sort by row band, then x, so particle i lands near where particle i was.
  const idx = Array.from({ length: N }, (_, p) => p);
  const band = grain * 6;
  idx.sort((u, v) => (Math.floor(out[u * 5 + 1] / band) - Math.floor(out[v * 5 + 1] / band)) || (out[u * 5] - out[v * 5]));
  const res = new Float32Array(N * 5);
  idx.forEach((u, p) => res.set(out.subarray(u * 5, u * 5 + 5), p * 5));
  return res;
}

/**
 * Draws a portrait as fine particles in the page's ink, gently swaying in 3D.
 * When `src` changes, the same particles drift slowly along curved paths into
 * the new face. Pixels go straight into an ImageData buffer, so tens of
 * thousands of particles stay smooth. No dependencies.
 */
export function ParticlePortrait({ src, alt, crop, className = "" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<{ show: (src: string, crop: Crop) => void } | null>(null);

  useEffect(() => {
    const el = wrap.current!;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let N = 0, W = 0, H = 0, dpr = 1, size = 1, raf = 0, visible = true, dead = false;
    let px = new Float32Array(0), py = px, sx = px, sy = px, hx = px, hy = px, hz = px;
    let lumA = px, lumB = px, fadeA = px, fadeB = px, delay = px, swirl = px, reach = px, depth = px;
    let ctlX = px, ctlY = px, spin = px;
    // Transition motion: 0 vortex, 1 burst, 2 wind, 3 streams.
    const STYLES = 4;
    let style = Math.floor(Math.random() * STYLES), vcx = 0, vcy = 0, squash = 0.75;
    const col = { v: new Uint32Array(0) };
    let buf: ImageData | null = null, u32 = new Uint32Array(0);
    let morphAt = -1e9, morphing = false;
    let want: { src: string; crop: Crop } | null = null;
    let token = 0;
    const tilt = { x: 0, y: 0 };

    const colour = (lum: number, fade: number) => {
      const t = Math.min(1, lum / 0.75);
      const r = INK[0] + (TINT[0] - INK[0]) * t, g = INK[1] + (TINT[1] - INK[1]) * t, b = INK[2] + (TINT[2] - INK[2]) * t;
      const a = Math.min(255, (0.45 + (1 - lum) * 0.7) * Math.min(1, fade * 1.3) * 255);
      return ((a & 255) << 24) | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255);
    };

    function alloc(n: number) {
      const f = () => new Float32Array(n);
      px = f(); py = f(); sx = f(); sy = f(); hx = f(); hy = f(); hz = f();
      lumA = f(); lumB = f(); fadeA = f(); fadeB = f(); delay = f(); swirl = f(); reach = f(); depth = f();
      ctlX = f(); ctlY = f(); spin = f();
      col.v = new Uint32Array(n);
      for (let p = 0; p < n; p++) {
        // Start as loose, invisible dust spread over the box.
        px[p] = Math.random() * W; py[p] = Math.random() * H;
        lumA[p] = 1; fadeA[p] = 0;
      }
    }

    function resize() {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      const changed = Math.abs(rect.width - W) > 1 || Math.abs(rect.height - H) > 1;
      W = rect.width; H = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      buf = ctx.createImageData(cv.width, cv.height);
      u32 = new Uint32Array(buf.data.buffer);
      size = Math.max(1, Math.round(dpr * 1.05));
      const n = Math.min(70000, Math.round(W * H * 0.16));
      if (n !== N) { N = n; alloc(N); }
      return changed;
    }

    async function show(next: string, c: Crop) {
      want = { src: next, crop: c };
      const my = ++token;
      const img = await loadImage(next).catch(() => null);
      if (dead || my !== token || !img || !W) return;
      const sk = `${next}|${c.join(",")}|${W | 0}x${H | 0}|${N}`;
      let s = samples.get(sk);
      if (!s) { s = sample(img, c, W, H, N); samples.set(sk, s); }
      const now = performance.now(), m = Math.min(W, H), half = Math.max(W, H) / 2;
      const rnd = (a: number, b: number) => a + Math.random() * (b - a);

      // Pick a different motion each time (never the same one twice in a row) with fresh settings.
      style = (style + 1 + Math.floor(Math.random() * (STYLES - 1))) % STYLES;
      const dir = Math.random() < 0.5 ? -1 : 1;
      vcx = W / 2 + rnd(-0.18, 0.18) * W; vcy = H / 2 + rnd(-0.15, 0.15) * H;
      squash = rnd(0.45, 1);
      const wind = Math.random() * Math.PI * 2, wx = Math.cos(wind), wy = Math.sin(wind);
      const freq = rnd(0.004, 0.012), ph1 = rnd(0, 9), ph2 = rnd(0, 9), curl = rnd(0.8, 1.6) * Math.PI;
      // When each particle sets off: a ripple from a random point, a sweep from a random side, or scattered.
      const wave = Math.floor(Math.random() * 3);
      const ox = rnd(-0.3, 0.3) * W, oy = rnd(-0.3, 0.3) * H;
      const sweep = Math.random() * Math.PI * 2, swx = Math.cos(sweep), swy = Math.sin(sweep);
      const span = Math.max(W, H);

      for (let p = 0; p < N; p++) {
        // Remember where each particle is and what tone it shows, then aim it at the new face.
        const e = morphing ? progress(p, now) : 1;
        sx[p] = px[p]; sy[p] = py[p];
        lumA[p] = lumA[p] + (lumB[p] - lumA[p]) * e;
        fadeA[p] = fadeA[p] + (fadeB[p] - fadeA[p]) * e;
        hx[p] = s[p * 5]; hy[p] = s[p * 5 + 1]; hz[p] = s[p * 5 + 2];
        lumB[p] = s[p * 5 + 3]; fadeB[p] = s[p * 5 + 4];
        const jitter = Math.random() * 0.08;
        delay[p] = jitter + (wave === 0
          ? Math.min(1, Math.hypot(hx[p] - ox, hy[p] - oy) / half) * 0.18
          : wave === 1 ? ((hx[p] * swx + hy[p] * swy) / span + 0.5) * 0.2 : Math.random() * 0.16);

        reach[p] = m * rnd(0.08, 0.5);
        depth[p] = rnd(0.05, 0.6);
        swirl[p] = Math.atan2(sy[p] - vcy, sx[p] - vcx) + rnd(-0.6, 0.6);
        spin[p] = dir * rnd(0.4, 1.6) * Math.PI;

        // Bend point for the trip, depending on the motion picked above.
        // Spread evenly: every particle's bend point is a uniformly random spot over (and a bit
        // beyond) the whole box, so mid-flight the dust fills all the area equally, no ring or swirl.
        ctlX[p] = rnd(-0.5, 1.5) * W; ctlY[p] = rnd(-0.5, 1.5) * H;
      }
      morphAt = performance.now(); morphing = !reduce;
      if (reduce) { for (let p = 0; p < N; p++) { lumA[p] = lumB[p]; fadeA[p] = fadeB[p]; col.v[p] = colour(lumB[p], fadeB[p]); } }
      if (reduce) { place(); draw(); }
    }

    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    function progress(p: number, now: number) {
      const t = (now - morphAt) / MORPH_MS;
      return ease(Math.min(1, Math.max(0, (t - delay[p]) / 0.74)));
    }

    // Project the 3D home point with the current tilt.
    let cyR = 1, syR = 0, cxR = 1, sxR = 0;
    function target(p: number) {
      const x1 = hx[p] * cyR + hz[p] * syR;
      const z1 = -hx[p] * syR + hz[p] * cyR;
      const y2 = hy[p] * cxR - z1 * sxR;
      const z2 = hy[p] * sxR + z1 * cxR;
      const k = 900 / (900 - z2);
      return [W / 2 + x1 * k, H / 2 + y2 * k] as const;
    }

    function place() {
      for (let p = 0; p < N; p++) { const [tx, ty] = target(p); px[p] = tx; py[p] = ty; }

    }

    function draw() {
      if (!buf) return;
      u32.fill(0);
      const bw = buf.width, bh = buf.height, c = col.v;
      for (let p = 0; p < N; p++) {
        const x = (px[p] * dpr) | 0, y = (py[p] * dpr) | 0;
        if (x < 0 || y < 0 || x >= bw - size || y >= bh - size) continue;
        const v = c[p];
        if (!(v >>> 24)) continue;
        let idx = y * bw + x;
        for (let yy = 0; yy < size; yy++, idx += bw) for (let xx = 0; xx < size; xx++) u32[idx + xx] = v;
      }
      ctx.putImageData(buf, 0, 0);
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (!visible || !N || !want) return;

      // A slow, small 3D sway so the portrait feels alive.
      const s = now / 1000;
      tilt.x = Math.sin(s * 0.23) * 0.32; tilt.y = Math.cos(s * 0.17) * 0.2;
      const ry = tilt.x * 0.35, rx = -tilt.y * 0.25;
      cyR = Math.cos(ry); syR = Math.sin(ry); cxR = Math.cos(rx); sxR = Math.sin(rx);

      if (morphing && now - morphAt > MORPH_MS * 1.05) {
        morphing = false;
        for (let p = 0; p < N; p++) { lumA[p] = lumB[p]; fadeA[p] = fadeB[p]; col.v[p] = colour(lumB[p], fadeB[p]); }
      }

      for (let p = 0; p < N; p++) {
        const [tx, ty] = target(p);
        if (morphing) {
          const e = progress(p, now), u = 1 - e, mid = Math.sin(Math.PI * e);
          // Curve through a bend point (quadratic Bezier: old spot → bend → new spot).
          let vx: number, vy: number;
          vx = ctlX[p]; vy = ctlY[p];
          let x = u * u * sx[p] + 2 * u * e * vx + e * e * tx;
          let y = u * u * sy[p] + 2 * u * e * vy + e * e * ty;
          // Rush toward the viewer mid-flight, then settle back: real depth, not a flat slide.
          px[p] = x; py[p] = y;
          // Mid-flight the dust glows gold, then cools into the new portrait's tones.
          const lum = lumA[p] + (lumB[p] - lumA[p]) * e;
          const fade = fadeA[p] + (fadeB[p] - fadeA[p]) * e;
          col.v[p] = colour(lum + (0.72 - lum) * mid * 0.85, Math.max(fade, mid * 0.55));
        } else {
          px[p] += (tx - px[p]) * 0.12; py[p] += (ty - py[p]) * 0.12;
        }
      }
      draw();
    }

    const ro = new ResizeObserver(() => { if (resize() && want) show(want.src, want.crop); });
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    resize();
    ro.observe(el); io.observe(el);
    if (!reduce) raf = requestAnimationFrame(frame);
    engine.current = { show: (a, b) => { show(a, b); } };

    return () => {
      dead = true; engine.current = null;
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
    };
  }, []);

  const key = `${src}|${crop ? crop.join(",") : ""}`;
  useEffect(() => {
    if (src) engine.current?.show(src, crop ?? [0, 0, 1, 1]);
    // `key` captures both src and crop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div ref={wrap} role="img" aria-label={alt} className={`relative ${className}`}>
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_68%,transparent_100%)]"
      />
    </div>
  );
}
