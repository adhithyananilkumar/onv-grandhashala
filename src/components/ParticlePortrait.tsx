"use client";

import { useEffect, useRef } from "react";

// Page tokens: royal-700 for shadows, a muted kani gold for mid tones.
const INK = [20, 58, 53] as const;
const TINT = [168, 120, 40] as const;
/** One author to the next. */
const MORPH_MS = 2600;
/** The very first portrait gathers out of the dust quickly, so the hero is never empty for long. */
const FIRST_MS = 1300;

type Crop = [number, number, number, number];
type Props = {
  src: string;
  alt: string;
  crop?: Crop;
  /** The portrait that comes after this one: sampled ahead of time while the page is idle. */
  next?: { src: string; crop?: Crop };
  className?: string;
};

const images = new Map<string, Promise<HTMLImageElement>>();
function loadImage(src: string) {
  let p = images.get(src);
  if (!p) {
    p = new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    }).then((img) => img.decode().then(() => img, () => img));
    images.set(src, p);
  }
  return p;
}

/** Load images one after another (never all at once) so a later change is instant. */
export function preloadImages(srcs: string[]) {
  srcs.reduce<Promise<unknown>>((chain, s) => chain.then(() => loadImage(s)).catch(() => {}), Promise.resolve());
}

const idle = (f: () => void) => (typeof requestIdleCallback === "function" ? requestIdleCallback(f, { timeout: 2500 }) : setTimeout(f, 300));

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
 * When `src` changes, the same particles glide along soft curves into the new
 * face. Pixels go straight into an ImageData buffer and the frame loop allocates
 * nothing, so tens of thousands of particles stay smooth on phones. No dependencies.
 */
export function ParticlePortrait({ src, alt, crop, next, className = "" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<{ show: (src: string, crop: Crop) => void; prepare: (src: string, crop: Crop) => void } | null>(null);

  useEffect(() => {
    const el = wrap.current!;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let N = 0, W = 0, H = 0, dpr = 1, size = 1, raf = 0, visible = true, dead = false;
    let px = new Float32Array(0), py = px, sx = px, sy = px, hx = px, hy = px, hz = px;
    let lumA = px, lumB = px, fadeA = px, fadeB = px, delay = px, ctlX = px, ctlY = px;
    let col = new Uint32Array(0);
    let buf: ImageData | null = null, u32 = new Uint32Array(0);
    let morphAt = -1e9, morphing = false, dur = MORPH_MS, shown = false;
    let want: { src: string; crop: Crop } | null = null;
    let token = 0;

    const colour = (lum: number, fade: number) => {
      const t = Math.min(1, lum / 0.75);
      const r = INK[0] + (TINT[0] - INK[0]) * t, g = INK[1] + (TINT[1] - INK[1]) * t, b = INK[2] + (TINT[2] - INK[2]) * t;
      const a = Math.min(255, (0.45 + (1 - lum) * 0.7) * Math.min(1, fade * 1.3) * 255);
      return ((a & 255) << 24) | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255);
    };

    function alloc(n: number) {
      const f = () => new Float32Array(n);
      px = f(); py = f(); sx = f(); sy = f(); hx = f(); hy = f(); hz = f();
      lumA = f(); lumB = f(); fadeA = f(); fadeB = f(); delay = f(); ctlX = f(); ctlY = f();
      col = new Uint32Array(n);
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
      if (!changed && buf) return false;
      W = rect.width; H = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      buf = ctx.createImageData(cv.width, cv.height);
      u32 = new Uint32Array(buf.data.buffer);
      size = Math.max(1, Math.round(dpr * 1.05));
      // Phones have a smaller box and a slower CPU: fewer, slightly bolder dots read the same.
      const n = Math.min(W < 640 ? 30000 : 70000, Math.round(W * H * 0.16));
      if (n !== N) { N = n; alloc(N); }
      return true;
    }

    const keyOf = (s: string, c: Crop) => `${s}|${c.join(",")}|${W | 0}x${H | 0}|${N}`;
    function sampled(img: HTMLImageElement, s: string, c: Crop) {
      const k = keyOf(s, c);
      let v = samples.get(k);
      if (!v) { v = sample(img, c, W, H, N); samples.set(k, v); }
      return v;
    }

    /** Sample the next portrait while the browser is idle, so the change itself costs nothing. */
    function prepare(s: string, c: Crop) {
      loadImage(s).then((img) => idle(() => { if (!dead && W) sampled(img, s, c); })).catch(() => {});
    }

    async function show(nextSrc: string, c: Crop) {
      want = { src: nextSrc, crop: c };
      const my = ++token;
      const img = await loadImage(nextSrc).catch(() => null);
      if (dead || my !== token || !img || !W) return;
      const s = sampled(img, nextSrc, c);
      const now = performance.now(), m = Math.min(W, H), half = Math.max(W, H) / 2;
      const rnd = (a: number, b: number) => a + Math.random() * (b - a);

      // One gentle current for the whole flock, with a random direction and a soft sideways curl.
      const dir = Math.random() < 0.5 ? -1 : 1;
      const wind = Math.random() * Math.PI * 2, wx = Math.cos(wind), wy = Math.sin(wind);
      const drift = m * rnd(0.04, 0.12), curl = rnd(0.18, 0.32) * dir;
      // When each particle sets off: a ripple from a random point, or a sweep from a random side.
      const ripple = Math.random() < 0.5;
      const ox = rnd(-0.3, 0.3) * W, oy = rnd(-0.3, 0.3) * H;
      const sweep = Math.random() * Math.PI * 2, swx = Math.cos(sweep), swy = Math.sin(sweep);
      const span = Math.max(W, H);
      const first = !shown;
      dur = first ? FIRST_MS : MORPH_MS;

      for (let p = 0; p < N; p++) {
        // Remember where each particle is and what tone it shows, then aim it at the new face.
        const e = morphing ? progress(p, now) : 1;
        sx[p] = px[p]; sy[p] = py[p];
        lumA[p] = lumA[p] + (lumB[p] - lumA[p]) * e;
        fadeA[p] = fadeA[p] + (fadeB[p] - fadeA[p]) * e;
        hx[p] = s[p * 5]; hy[p] = s[p * 5 + 1]; hz[p] = s[p * 5 + 2];
        lumB[p] = s[p * 5 + 3]; fadeB[p] = s[p * 5 + 4];
        const jitter = Math.random() * (first ? 0.25 : 0.08);
        delay[p] = jitter + (ripple
          ? Math.min(1, Math.hypot(hx[p] - ox, hy[p] - oy) / half) * 0.16
          : ((hx[p] * swx + hy[p] * swy) / span + 0.5) * 0.16);

        // Bend point: halfway along the trip, pushed a little sideways (a curl) and down-wind.
        // Paths stay short and smooth, so the dust flows rather than scattering across the box.
        const tx = W / 2 + hx[p], ty = H / 2 + hy[p];
        const dx = tx - sx[p], dy = ty - sy[p];
        const k = curl * rnd(0.6, 1.4);
        ctlX[p] = (sx[p] + tx) / 2 - dy * k + wx * drift;
        ctlY[p] = (sy[p] + ty) / 2 + dx * k + wy * drift;
      }
      shown = true;
      morphAt = performance.now(); morphing = !reduce;
      if (reduce) {
        for (let p = 0; p < N; p++) { lumA[p] = lumB[p]; fadeA[p] = fadeB[p]; col[p] = colour(lumB[p], fadeB[p]); }
        frame(performance.now(), true);
      }
    }

    // Smooth start and finish (quintic ease in-out has no visible "kick" at either end).
    const ease = (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2);
    function progress(p: number, now: number) {
      const t = (now - morphAt) / dur;
      return ease(Math.min(1, Math.max(0, (t - delay[p]) / 0.76)));
    }

    function draw() {
      if (!buf) return;
      u32.fill(0);
      const bw = buf.width, bh = buf.height, c = col;
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

    function frame(now: number, once = false) {
      if (!once) raf = requestAnimationFrame(frame);
      if (!visible || !N || !want) return;

      // A slow, small 3D sway so the portrait feels alive.
      const s = reduce ? 0 : now / 1000;
      const ry = Math.sin(s * 0.23) * 0.32 * 0.35, rx = -Math.cos(s * 0.17) * 0.2 * 0.25;
      const cyR = Math.cos(ry), syR = Math.sin(ry), cxR = Math.cos(rx), sxR = Math.sin(rx);
      const W2 = W / 2, H2 = H / 2;

      if (morphing && now - morphAt > dur * 1.02) {
        morphing = false;
        for (let p = 0; p < N; p++) { lumA[p] = lumB[p]; fadeA[p] = fadeB[p]; col[p] = colour(lumB[p], fadeB[p]); }
      }

      for (let p = 0; p < N; p++) {
        // Project the 3D home point with the current tilt (inlined: no allocations per frame).
        const x1 = hx[p] * cyR + hz[p] * syR;
        const z1 = -hx[p] * syR + hz[p] * cyR;
        const y2 = hy[p] * cxR - z1 * sxR;
        const z2 = hy[p] * sxR + z1 * cxR;
        const k = 900 / (900 - z2);
        const tx = W2 + x1 * k, ty = H2 + y2 * k;
        if (morphing) {
          const e = progress(p, now), u = 1 - e, mid = Math.sin(Math.PI * e);
          // Curve through the bend point (quadratic Bezier: old spot → bend → new spot).
          px[p] = u * u * sx[p] + 2 * u * e * ctlX[p] + e * e * tx;
          py[p] = u * u * sy[p] + 2 * u * e * ctlY[p] + e * e * ty;
          // Mid-flight the dust warms towards gold, then cools into the new portrait's tones.
          const lum = lumA[p] + (lumB[p] - lumA[p]) * e;
          const fade = fadeA[p] + (fadeB[p] - fadeA[p]) * e;
          col[p] = colour(lum + (0.72 - lum) * mid * 0.6, Math.max(fade, mid * 0.45));
        } else if (once) {
          px[p] = tx; py[p] = ty;
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
    engine.current = { show: (a, b) => { show(a, b); }, prepare };

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

  const nextKey = next ? `${next.src}|${next.crop ? next.crop.join(",") : ""}` : "";
  useEffect(() => {
    if (next) engine.current?.prepare(next.src, next.crop ?? [0, 0, 1, 1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextKey]);

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
