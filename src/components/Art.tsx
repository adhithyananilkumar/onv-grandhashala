import { useId } from "react";

const safe = (id: string) => id.replace(/[^a-zA-Z0-9]/g, "");
// Deterministic "random" so server and client render the same art.
const rnd = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

function Flower({ cx, cy, r, rot }: { cx: number; cy: number; r: number; rot: number }) {
  return (
    <g>
      {[0, 1, 2, 3, 4].map((k) => {
        const a = ((rot + k * 72) * Math.PI) / 180;
        return <circle key={k} cx={cx + Math.cos(a) * r * 0.52} cy={cy + Math.sin(a) * r * 0.52} r={r * 0.56} fill="var(--color-kani)" />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.26} fill="var(--color-kani-700)" />
    </g>
  );
}

function Raceme({ x, y, len, drift, seed, delay }: { x: number; y: number; len: number; drift: number; seed: number; delay: number }) {
  const n = Math.round(len / 13);
  const pt = (t: number) => {
    // quadratic curve from (x,y) to (x+drift, y+len) bowing slightly outward
    const cx = x + drift * 0.2;
    const cy = y + len * 0.5;
    const ex = x + drift;
    const ey = y + len;
    const u = 1 - t;
    return [u * u * x + 2 * u * t * cx + t * t * ex, u * u * y + 2 * u * t * cy + t * t * ey];
  };
  return (
    <g className="kani-raceme" style={{ animationDelay: `${delay}s` }}>
      <path d={`M${x} ${y} Q ${x + drift * 0.2} ${y + len * 0.5} ${x + drift} ${y + len}`} stroke="var(--color-kani-700)" strokeWidth="1.4" fill="none" opacity="0.7" />
      {Array.from({ length: n }, (_, i) => {
        const t = 0.06 + (i / n) * 0.94;
        const [px, py] = pt(t);
        const side = i % 2 ? 1 : -1;
        const spread = (1 - t) * 9 + 3;
        const jx = (rnd(seed + i) - 0.5) * 5;
        const fx = px + side * spread + jx;
        const fy = py + (rnd(seed + i * 3) - 0.5) * 6;
        if (t > 0.86) {
          return <ellipse key={i} cx={fx * 0.4 + px * 0.6} cy={fy} rx="2.6" ry="3.6" fill="var(--color-kani)" opacity="0.75" />;
        }
        const r = 10.5 * (1 - t * 0.55);
        return (
          <g key={i}>
            <path d={`M${px} ${py} L ${fx} ${fy}`} stroke="var(--color-kani-700)" strokeWidth="0.8" opacity="0.5" />
            <Flower cx={fx} cy={fy} r={r} rot={rnd(seed + i * 7) * 72} />
          </g>
        );
      })}
    </g>
  );
}

/**
 * Kanikonna (Cassia fistula), Kerala's state flower: a branch with
 * drooping golden racemes. The hero's one bold element.
 */
export function Kanikonna({ className }: { className?: string }) {
  const racemes = [
    { x: 60, len: 250, drift: -8 },
    { x: 135, len: 330, drift: 6 },
    { x: 205, len: 210, drift: -4 },
    { x: 285, len: 370, drift: 10 },
    { x: 365, len: 280, drift: -6 },
    { x: 440, len: 230, drift: 4 },
    { x: 520, len: 310, drift: -10 },
  ];
  const branchY = (x: number) => 26 + Math.sin(x / 95) * 9;
  return (
    <svg viewBox="0 0 580 420" className={className} aria-hidden="true">
      {/* branch */}
      <path d="M-10 30 C 120 14, 220 44, 330 26 S 520 16, 600 36" stroke="var(--color-ink)" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.85" />
      {/* pinnate leaves */}
      {[30, 100, 175, 250, 330, 405, 480, 555].map((lx, i) => (
        <g key={lx} transform={`translate(${lx} ${branchY(lx) - 2}) rotate(${i % 2 ? -24 : 18})`}>
          {[0, 1, 2, 3].map((k) => (
            <g key={k}>
              <ellipse cx={8 + k * 13} cy={-7} rx="7" ry="3.2" fill="var(--color-teal)" opacity={0.85 - k * 0.12} transform={`rotate(-28 ${8 + k * 13} -7)`} />
              <ellipse cx={8 + k * 13} cy={6} rx="7" ry="3.2" fill="var(--color-teal-700)" opacity={0.8 - k * 0.12} transform={`rotate(28 ${8 + k * 13} 6)`} />
            </g>
          ))}
        </g>
      ))}
      {racemes.map((r, i) => (
        <Raceme key={r.x} x={r.x} y={branchY(r.x) + 4} len={r.len} drift={r.drift} seed={i * 31 + 5} delay={0.15 + i * 0.09} />
      ))}
    </svg>
  );
}

const FRONDS: [number, number][] = [[-54, 14], [-42, 32], [-18, 40], [18, 38], [44, 28], [56, 12], [32, -6], [-30, -8]];

function Palm({ x, base, h, lean, s = 1 }: { x: number; base: number; h: number; lean: number; s?: number }) {
  const tx = x + lean;
  const ty = base - h;
  return (
    <g stroke="var(--color-ink)" fill="none" strokeLinecap="round">
      <path d={`M${x} ${base} Q ${x + lean * 0.15} ${base - h * 0.55} ${tx} ${ty}`} strokeWidth={3 * s} />
      {FRONDS.map(([dx, dy], i) => (
        <path key={i} d={`M${tx} ${ty} Q ${tx + dx * s * 0.55} ${ty - 20 * s} ${tx + dx * s} ${ty + dy * s}`} strokeWidth={2 * s} />
      ))}
      <circle cx={tx - 3 * s} cy={ty + 5 * s} r={3 * s} fill="var(--color-ink)" stroke="none" />
      <circle cx={tx + 3 * s} cy={ty + 6 * s} r={3 * s} fill="var(--color-ink)" stroke="none" />
    </g>
  );
}

/** Quiet line drawing of the village: hills, backwater, palms, and the grandhashala with its tiled roof. */
export function KeralaScape({ className }: { className?: string }) {
  const id = safe(useId());
  return (
    <svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`f${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-mist)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--color-mist)" />
        </linearGradient>
      </defs>
      <path d="M0 175 C 150 125 260 148 380 122 S 620 78 760 118 S 1000 98 1200 132 V300 H0Z" fill="var(--color-teal)" opacity="0.12" />
      <path d="M0 212 C 120 182 240 198 360 180 S 560 156 700 188 S 960 172 1200 196 V300 H0Z" fill="var(--color-teal)" opacity="0.2" />
      <rect x="0" y="242" width="1200" height="58" fill="var(--color-mist-2)" />
      {[252, 264, 278].map((y, i) => (
        <path key={y} d={`M0 ${y} H1200`} stroke="var(--color-ink)" strokeOpacity={0.16 - i * 0.04} strokeDasharray={`${50 + i * 20} ${16 + i * 6}`} strokeDashoffset={i * 23} />
      ))}
      <g transform="translate(300 256)">
        <path d="M0 0 Q 46 14 92 0 Q 46 7 0 0Z" fill="var(--color-ink)" />
        <path d="M58 2 L 70 -34" stroke="var(--color-ink)" strokeWidth="2" />
        <circle cx="56" cy="-14" r="3.5" fill="var(--color-ink)" />
        <path d="M56 -10 L 54 2" stroke="var(--color-ink)" strokeWidth="3" />
      </g>
      <Palm x={120} base={242} h={140} lean={-18} />
      <Palm x={205} base={244} h={96} lean={14} s={0.8} />
      <Palm x={440} base={242} h={118} lean={-10} s={0.9} />
      <Palm x={790} base={242} h={130} lean={16} />
      <Palm x={860} base={244} h={86} lean={-12} s={0.75} />
      <Palm x={1050} base={242} h={150} lean={-20} s={1.05} />
      <Palm x={1130} base={244} h={104} lean={10} s={0.85} />
      <g transform="translate(600 242)">
        <rect x="-78" y="-10" width="156" height="10" fill="var(--color-ink)" />
        <rect x="-62" y="-48" width="124" height="38" fill="var(--color-card)" stroke="var(--color-ink)" strokeWidth="2" />
        {[-46, -24, 24, 46].map((px) => <path key={px} d={`M${px} -48 V -10`} stroke="var(--color-ink)" strokeWidth="2.5" />)}
        <rect x="-9" y="-36" width="18" height="26" fill="var(--color-ink)" />
        <path d="M-90 -44 Q -76 -48 -64 -66 L 0 -94 L 64 -66 Q 76 -48 90 -44 Z" fill="var(--color-laterite)" stroke="var(--color-ink)" strokeWidth="2" />
        <path d="M-30 -80 L 0 -112 L 30 -80 Z" fill="var(--color-laterite-700)" stroke="var(--color-ink)" strokeWidth="2" />
        <path d="M0 -112 V -122" stroke="var(--color-ink)" strokeWidth="2" />
        <circle cx="0" cy="-124" r="3.5" fill="var(--color-kani)" />
      </g>
      <rect x="0" y="262" width="1200" height="38" fill={`url(#f${id})`} />
    </svg>
  );
}
