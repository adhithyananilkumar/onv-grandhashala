import { useId } from "react";

/*
 * Procedural painted art for cards. Every piece is generated from a seed
 * (a book id, an event id...), so each card gets its own washes, colours,
 * motif and layout, but the same thing always renders the same way.
 */

const C = {
  ink: "#231b16",
  red: "#c0392b",
  vermilion: "#9b2c1f",
  gold: "#d29a2e",
  goldLight: "#ecc56a",
  green: "#2e7d4f",
  greenDeep: "#1f5c38",
  peacock: "#1d4e47",
  teal: "#2f6e78",
  sepia: "#a8763e",
  plum: "#5a2a4a",
  paper: "#fffaf1",
};

export type Motif = "lotus" | "palm" | "lamp" | "boat" | "drum" | "sun" | "brush" | "leaf" | "book" | "elephant";

const sid = (id: string) => id.replace(/[^a-zA-Z0-9]/g, "");

/** Small deterministic random generator. */
export function rng(seedText: string) {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) h = Math.imul(h ^ seedText.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Filters({ id, seed }: { id: string; seed: number }) {
  return (
    <defs>
      <filter id={`w${id}`} x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="4" seed={seed} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d" />
        <feGaussianBlur in="d" stdDeviation="1.6" result="b" />
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed={seed + 3} result="g" />
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.2" result="gm" />
        <feComposite in="b" in2="gm" operator="in" />
      </filter>
      <filter id={`r${id}`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed={seed + 1} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  );
}

/** Motif drawn in a 100 × 100 box. `line` is the ink colour, `fill` the pigment. */
export function MotifShape({ m, line, fill, accent }: { m: Motif; line: string; fill: string; accent: string }) {
  const s = { stroke: line, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (m) {
    case "lotus":
      return (
        <g {...s}>
          <path d="M50 78 C 40 62 42 38 50 24 C 58 38 60 62 50 78Z" fill={fill} />
          <path d="M50 78 C 34 72 24 56 24 42 C 38 46 48 60 50 78Z" fill={fill} fillOpacity="0.8" />
          <path d="M50 78 C 66 72 76 56 76 42 C 62 46 52 60 50 78Z" fill={fill} fillOpacity="0.8" />
          <path d="M50 78 C 30 80 14 72 8 62 C 24 60 40 66 50 78Z M50 78 C 70 80 86 72 92 62 C 76 60 60 66 50 78Z" fill={accent} fillOpacity="0.6" />
          <path d="M20 88 C 40 82 60 82 80 88" fill="none" />
        </g>
      );
    case "palm":
      return (
        <g {...s} fill="none">
          <path d="M46 96 Q 50 60 58 30" strokeWidth="3.5" />
          {[[-34, 10], [-26, 24], [-10, 30], [12, 28], [28, 20], [36, 6], [20, -8], [-20, -8]].map(([dx, dy], i) => (
            <path key={i} d={`M58 30 Q ${58 + dx * 0.55} ${14} ${58 + dx} ${30 + dy}`} stroke={i % 2 ? fill : line} strokeWidth="3" />
          ))}
          <circle cx="55" cy="35" r="3.5" fill={accent} stroke="none" />
          <circle cx="61" cy="36" r="3.5" fill={accent} stroke="none" />
        </g>
      );
    case "lamp":
      return (
        <g {...s}>
          {[34, 50, 66].map((x) => <path key={x} className="lamp-flame" d={`M${x} 14 C ${x + 5} 22 ${x + 4} 28 ${x} 30 C ${x - 4} 28 ${x - 5} 22 ${x} 14Z`} fill={accent} strokeWidth="1.2" />)}
          <path d="M24 32 Q 50 46 76 32Z" fill={fill} />
          <path d="M47 42 V 84 M53 42 V 84" />
          <ellipse cx="50" cy="54" rx="8" ry="3" fill={fill} />
          <ellipse cx="50" cy="68" rx="6" ry="2.5" fill={fill} />
          <path d="M32 94 C 38 84 44 82 50 82 C 56 82 62 84 68 94Z" fill={fill} />
        </g>
      );
    case "boat":
      return (
        <g {...s}>
          <path d="M4 66 C 30 72 66 72 84 62 C 90 54 92 40 96 26 C 92 44 90 60 86 68 C 64 80 30 78 4 70Z" fill={line} />
          {Array.from({ length: 8 }, (_, i) => 14 + i * 9).map((x) => (
            <g key={x}><circle cx={x} cy="58" r="2.2" fill={line} /><path d={`M${x} 60 L ${x - 6} 80`} stroke={accent} strokeWidth="1.5" /></g>
          ))}
          <path d="M46 56 V 44" /><path d="M40 45 A 6 4 0 0 1 52 45Z" fill={fill} strokeWidth="1.2" />
          <path d="M10 88 H 40 M56 92 H 90" stroke={fill} strokeWidth="2" />
        </g>
      );
    case "drum":
      return (
        <g {...s}>
          <path d="M30 30 V 82 C 30 90 70 90 70 82 V 30Z" fill={fill} />
          <path d="M33 34 L 38 82 L 43 34 L 48 82 L 53 34 L 58 82 L 63 34 L 68 82" stroke={C.paper} strokeWidth="1.4" fill="none" />
          <path d="M30 54 C 44 60 56 60 70 54 V 62 C 56 68 44 68 30 62Z" fill={accent} />
          <ellipse cx="50" cy="30" rx="20" ry="6" fill={C.paper} />
          <path d="M14 12 C 26 16 36 22 44 28 M86 8 C 74 12 64 18 56 26" strokeWidth="3" fill="none" />
        </g>
      );
    case "sun":
      return (
        <g {...s}>
          <circle cx="50" cy="44" r="18" fill={accent} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            // rounded so server and browser produce identical markup
            const f = (n: number) => Math.round(n * 100) / 100;
            return <path key={i} d={`M${f(50 + Math.cos(a) * 24)} ${f(44 + Math.sin(a) * 24)} L ${f(50 + Math.cos(a) * 32)} ${f(44 + Math.sin(a) * 32)}`} />;
          })}
          <path d="M4 92 C 24 74 40 76 52 86 C 64 72 82 72 96 90Z" fill={fill} />
        </g>
      );
    case "brush":
      return (
        <g {...s}>
          <path d="M14 78 C 30 50 54 66 70 40 C 76 30 84 26 90 28" stroke={accent} strokeWidth="9" fill="none" opacity="0.85" />
          <path d="M60 20 L 82 64" strokeWidth="5" stroke={C.sepia} />
          <path d="M82 64 C 86 72 84 80 78 84 C 76 76 78 70 82 64Z" fill={line} />
          <path d="M14 90 C 34 84 54 86 76 90" stroke={fill} strokeWidth="3" fill="none" />
        </g>
      );
    case "leaf":
      return (
        <g {...s}>
          <path d="M10 82 C 20 40 56 14 92 12 C 86 46 56 78 10 82Z" fill={fill} />
          <path d="M10 82 C 40 58 64 36 92 12" fill="none" />
          {[0.25, 0.45, 0.65].map((t) => <path key={t} d={`M${10 + 82 * t} ${82 - 70 * t} l ${-10} ${-12} M${10 + 82 * t} ${82 - 70 * t} l ${12} ${8}`} strokeWidth="1.4" fill="none" />)}
          <circle cx="76" cy="74" r="7" fill={accent} />
        </g>
      );
    case "book":
      return (
        <g {...s}>
          <path d="M50 30 C 38 22 20 22 8 26 V 80 C 20 76 38 76 50 84Z" fill={fill} />
          <path d="M50 30 C 62 22 80 22 92 26 V 80 C 80 76 62 76 50 84Z" fill={accent} fillOpacity="0.85" />
          <path d="M16 38 C 26 36 36 36 44 40 M16 50 C 26 48 36 48 44 52 M56 40 C 64 36 74 36 84 38 M56 52 C 64 48 74 48 84 50" strokeWidth="1.3" fill="none" />
          <circle cx="50" cy="14" r="6" fill={accent} />
        </g>
      );
    case "elephant":
      return (
        <g {...s}>
          <path d="M18 70 C 14 44 30 30 52 30 C 70 30 82 40 84 56 C 86 66 84 74 80 80 L 74 80 L 72 68 L 60 68 L 58 82 L 50 82 L 48 68 L 34 70 L 32 82 L 24 82Z" fill={fill} />
          <path d="M84 56 C 92 62 94 74 90 86" fill="none" strokeWidth="4" stroke={fill} />
          <path d="M30 30 C 40 20 60 18 72 28 L 66 40 C 56 34 44 34 36 40Z" fill={accent} />
          {[38, 48, 58].map((x) => <circle key={x} cx={x} cy="28" r="2.5" fill={C.paper} stroke="none" />)}
          <circle cx="70" cy="48" r="2" fill={line} />
        </g>
      );
  }
}

const WASH_COLOURS = [C.gold, C.red, C.teal, C.green, C.sepia, C.plum];
const MOTIFS: Motif[] = ["lotus", "palm", "lamp", "boat", "drum", "sun", "brush", "leaf", "book", "elephant"];

/**
 * A painted tile for card headers: two or three washes and one motif.
 * Pass `motif` to choose the subject; colours and placement come from `seed`.
 */
export function ArtTile({ seed, motif, className }: { seed: string; motif?: Motif; className?: string }) {
  const id = sid(useId());
  const r = rng(seed);
  const m = motif ?? MOTIFS[Math.floor(r() * MOTIFS.length)];
  const washes = Array.from({ length: 3 }, () => ({
    cx: 40 + r() * 240, cy: 20 + r() * 140, rx: 70 + r() * 70, ry: 40 + r() * 40,
    fill: WASH_COLOURS[Math.floor(r() * WASH_COLOURS.length)], o: 0.22 + r() * 0.2,
  }));
  const mx = 160 + (r() - 0.5) * 120;
  const pigment = [C.gold, C.green, C.teal, C.vermilion][Math.floor(r() * 4)];
  const accent = [C.red, C.goldLight, C.gold][Math.floor(r() * 3)];
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <Filters id={id} seed={Math.floor(r() * 90) + 1} />
      <g filter={`url(#w${id})`}>
        {washes.map((w, i) => <ellipse key={i} cx={w.cx} cy={w.cy} rx={w.rx} ry={w.ry} fill={w.fill} opacity={w.o} />)}
      </g>
      <g filter={`url(#r${id})`} transform={`translate(${mx - 55} 30) scale(1.1)`}>
        <MotifShape m={m} line={C.ink} fill={pigment} accent={accent} />
      </g>
      <path d={`M${20 + r() * 40} 166 C 120 ${156 + r() * 8} 200 ${160 + r() * 8} ${260 + r() * 40} 160`} stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.5" filter={`url(#r${id})`} />
    </svg>
  );
}

/** Wide pigment washes (no motif) for page banners, in the same style as the card art. */
export function WashBanner({ seed, className }: { seed: string; className?: string }) {
  const id = sid(useId());
  const r = rng(seed);
  const spots = [
    { cx: 60, cy: 70 }, { cx: 1140, cy: 60 }, { cx: 120, cy: 330 }, { cx: 1080, cy: 330 }, { cx: 600, cy: 380 },
  ].map((p, i) => ({
    cx: p.cx + (r() - 0.5) * 160, cy: p.cy + (r() - 0.5) * 60, rx: 200 + r() * 140, ry: 110 + r() * 70,
    fill: [C.gold, C.red, C.teal, C.green, C.goldLight][(i + Math.floor(r() * 5)) % 5], o: 0.18 + r() * 0.16,
  }));
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <Filters id={id} seed={Math.floor(r() * 90) + 1} />
      <g filter={`url(#w${id})`}>
        {spots.map((w, i) => (
          <g key={i} className={`drift drift-${"abc"[i % 3]}`}>
            <ellipse cx={w.cx} cy={w.cy} rx={w.rx} ry={w.ry} fill={w.fill} opacity={w.o} />
          </g>
        ))}
      </g>
    </svg>
  );
}

const COVER_BG = ["#9b2c1f", "#1f5c38", "#2f6e78", "#7a5410", "#5a2a4a", "#1d4e47", "#231b16", "#8a4210"];

/**
 * Background art for a generated book cover. Each book gets its own base colour,
 * wash placement, motif, and border style.
 */
export function CoverArt({ seed, className }: { seed: string; className?: string }) {
  const id = sid(useId());
  const r = rng(seed);
  const bg = COVER_BG[Math.floor(r() * COVER_BG.length)];
  const m = MOTIFS[Math.floor(r() * MOTIFS.length)];
  const variant = Math.floor(r() * 3); // 0: motif top, 1: motif centre large, 2: framed
  const light = [C.goldLight, C.paper, "#f3d9a4"][Math.floor(r() * 3)];
  const washes = Array.from({ length: 2 }, () => ({ cx: r() * 200, cy: r() * 300, rx: 60 + r() * 60, ry: 50 + r() * 60, fill: [C.gold, C.goldLight, C.red, C.teal, C.green][Math.floor(r() * 5)] }));
  return (
    <svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <Filters id={id} seed={Math.floor(r() * 90) + 1} />
      <rect width="200" height="300" fill={bg} />
      <g filter={`url(#w${id})`}>
        {washes.map((w, i) => <ellipse key={i} cx={w.cx} cy={w.cy} rx={w.rx} ry={w.ry} fill={w.fill} opacity="0.35" />)}
      </g>
      <g opacity="0.9" filter={`url(#r${id})`}
        transform={variant === 0 ? "translate(60 34) scale(0.8)" : variant === 1 ? "translate(30 60) scale(1.4)" : "translate(62 90) scale(0.76)"}>
        <MotifShape m={m} line={light} fill={light} accent={C.gold} />
      </g>
      {variant === 2 && <rect x="12" y="12" width="176" height="276" rx="4" fill="none" stroke={C.goldLight} strokeWidth="1.5" strokeDasharray={r() > 0.5 ? "0" : "2 5"} opacity="0.8" />}
      <path d="M0 0 H 14 V 300 H 0Z" fill="#000" opacity="0.2" />
    </svg>
  );
}

/** Painted backwater scene for the footer: palms, a vallam and washes, in gold on green. */
export function FooterScape({ className }: { className?: string }) {
  const id = sid(useId());
  return (
    <svg viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      <Filters id={id} seed={12} />
      <g filter={`url(#w${id})`}>
        <ellipse cx="180" cy="140" rx="320" ry="90" fill={C.gold} opacity="0.18" />
        <ellipse cx="980" cy="170" rx="360" ry="90" fill={C.teal} opacity="0.35" />
        <ellipse cx="640" cy="60" rx="70" ry="60" fill={C.goldLight} opacity="0.22" />
      </g>
      <g stroke={C.goldLight} fill="none" strokeLinecap="round" opacity="0.55" filter={`url(#r${id})`}>
        {[80, 170, 250, 470, 540, 760, 900, 990, 1080, 1150].map((x, i) => {
          const h = 90 + ((i * 37) % 60), tx = x + (i % 2 ? 12 : -10), ty = 200 - h;
          return (
            <g key={x}>
              <path d={`M${x} 200 Q ${x + 4} ${200 - h / 2} ${tx} ${ty}`} strokeWidth="3" />
              {[-44, -28, -10, 10, 28, 44].map((dx) => (
                <path key={dx} d={`M${tx} ${ty} q ${dx / 2} -14 ${dx} ${10 + Math.abs(dx) / 3}`} strokeWidth="2.4" />
              ))}
            </g>
          );
        })}
        <path d="M0 202 C 300 196 900 208 1200 200" strokeWidth="1.6" />
        <g className="drift drift-boat">
          <path d="M520 206 Q 580 218 640 204 Q 580 212 520 206Z" fill={C.goldLight} stroke="none" />
          <path d="M600 206 L 612 172" strokeWidth="2" />
        </g>
      </g>
    </svg>
  );
}
