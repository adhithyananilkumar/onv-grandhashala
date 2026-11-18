import { useId } from "react";

const safe = (id: string) => id.replace(/[^a-zA-Z0-9]/g, "");

/** A dry-brush ink-wash stroke, used behind headings (inspired by Chinese/Kerala ink painting). */
export function InkWash({ className, tone = "wash", seed = 3 }: { className?: string; tone?: "wash" | "clay" | "gold"; seed?: number }) {
  const id = safe(useId());
  const color = tone === "clay" ? "var(--color-clay)" : tone === "gold" ? "var(--color-gold)" : "var(--color-wash)";
  return (
    <svg viewBox="0 0 800 300" className={className} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.25" stopColor={color} stopOpacity="0.55" />
          <stop offset="0.6" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={`b${id}`} x="-10%" y="-30%" width="120%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.05" numOctaves="4" seed={seed} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="60" xChannelSelector="R" yChannelSelector="G" result="disp" />
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.16" numOctaves="3" seed={seed + 5} result="streak" />
          <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 2.1" result="mask" />
          <feComposite in="disp" in2="mask" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#b${id})`}>
        <path d="M40 190 C 180 90, 420 70, 760 120" stroke={`url(#g${id})`} strokeWidth="110" fill="none" strokeLinecap="round" />
        <path d="M120 230 C 320 180, 520 190, 700 170" stroke={`url(#g${id})`} strokeWidth="38" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
    </svg>
  );
}

const FRONDS: [number, number][] = [[-54, 14], [-42, 32], [-18, 40], [18, 38], [44, 28], [56, 12], [32, -6], [-30, -8]];

function Palm({ x, base, h, lean, s = 1 }: { x: number; base: number; h: number; lean: number; s?: number }) {
  const tx = x + lean;
  const ty = base - h;
  return (
    <g stroke="var(--color-ink)" fill="none" strokeLinecap="round">
      <path d={`M${x} ${base} Q ${x + lean * 0.15} ${base - h * 0.55} ${tx} ${ty}`} strokeWidth={3.2 * s} />
      {/* trunk rings */}
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((t) => {
        const px = x + (lean * 0.15) * 2 * t * (1 - t) + lean * t * t;
        const py = base - h * 0.55 * 2 * t * (1 - t) - h * t * t;
        return <path key={t} d={`M${px - 3 * s} ${py} h ${6 * s}`} strokeWidth={1} opacity={0.6} />;
      })}
      {FRONDS.map(([dx, dy], i) => (
        <path key={i} d={`M${tx} ${ty} Q ${tx + dx * s * 0.55} ${ty - 20 * s} ${tx + dx * s} ${ty + dy * s}`} strokeWidth={2.1 * s} />
      ))}
      <circle cx={tx - 3 * s} cy={ty + 5 * s} r={3 * s} fill="var(--color-ink)" stroke="none" />
      <circle cx={tx + 3 * s} cy={ty + 6 * s} r={3 * s} fill="var(--color-ink)" stroke="none" />
    </g>
  );
}

/**
 * Village scene as a retro ink print: hills, backwater, coconut palms,
 * a vallam (country boat), and the grandhashala with its tiled Kerala roof.
 */
export function KeralaScape({ className }: { className?: string }) {
  const id = safe(useId());
  return (
    <svg viewBox="0 0 1200 340" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      <defs>
        <pattern id={`h${id}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <path d="M0 0 V7" stroke="var(--color-ink)" strokeWidth="1" opacity="0.35" />
        </pattern>
        <filter id={`r${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id={`f${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-paper)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--color-paper)" />
        </linearGradient>
      </defs>

      {/* sun, echoing the reader's head in the logo */}
      <g>
        <circle cx="850" cy="120" r="54" fill="var(--color-gold)" opacity="0.28" />
        <circle cx="850" cy="120" r="70" fill="none" stroke="var(--color-ink)" strokeOpacity="0.12" />
        <circle cx="850" cy="120" r="86" fill="none" stroke="var(--color-ink)" strokeOpacity="0.07" />
      </g>

      {/* birds */}
      {[[700, 92, 1], [732, 76, 0.8], [770, 98, 0.7], [312, 70, 0.8]].map(([bx, by, bs], i) => (
        <path key={i} d={`M${bx} ${by} q ${6 * bs} ${-6 * bs} ${12 * bs} 0 q ${6 * bs} ${-6 * bs} ${12 * bs} 0`} stroke="var(--color-ink)" strokeWidth="1.5" fill="none" />
      ))}

      {/* hills */}
      <g filter={`url(#r${id})`}>
        <path d="M0 215 C 150 165 260 188 380 162 S 620 118 760 158 S 1000 138 1200 172 V340 H0Z" fill="var(--color-wash)" opacity="0.22" />
        <path d="M0 252 C 120 222 240 238 360 220 S 560 196 700 228 S 960 212 1200 236 V340 H0Z" fill="var(--color-wash)" opacity="0.4" />
        <path d="M0 252 C 120 222 240 238 360 220 S 560 196 700 228 S 960 212 1200 236 V340 H0Z" fill={`url(#h${id})`} />
      </g>

      {/* backwater */}
      <rect x="0" y="282" width="1200" height="58" fill="var(--color-paper-2)" />
      {[290, 300, 312, 326].map((y, i) => (
        <path key={y} d={`M0 ${y} H1200`} stroke="var(--color-ink)" strokeOpacity={0.22 - i * 0.03} strokeDasharray={`${40 + i * 20} ${14 + i * 6}`} strokeDashoffset={i * 23} />
      ))}

      {/* vallam (boat) */}
      <g transform="translate(300 296)">
        <path d="M0 0 Q 46 14 92 0 Q 46 7 0 0Z" fill="var(--color-ink)" />
        <path d="M58 2 L 70 -34" stroke="var(--color-ink)" strokeWidth="2" />
        <circle cx="56" cy="-14" r="3.5" fill="var(--color-ink)" />
        <path d="M56 -10 L 54 2" stroke="var(--color-ink)" strokeWidth="3" />
      </g>

      {/* palms */}
      <Palm x={120} base={282} h={150} lean={-18} />
      <Palm x={205} base={284} h={104} lean={14} s={0.8} />
      <Palm x={440} base={282} h={126} lean={-10} s={0.9} />
      <Palm x={790} base={282} h={140} lean={16} />
      <Palm x={860} base={284} h={92} lean={-12} s={0.75} />
      <Palm x={1050} base={282} h={162} lean={-20} s={1.05} />
      <Palm x={1130} base={284} h={110} lean={10} s={0.85} />

      {/* the grandhashala: tiled roof, pillared verandah */}
      <g transform="translate(600 282)">
        <rect x="-78" y="-10" width="156" height="10" fill="var(--color-ink)" />
        <rect x="-62" y="-48" width="124" height="38" fill="var(--color-card)" stroke="var(--color-ink)" strokeWidth="2" />
        {[-46, -24, 24, 46].map((px) => <path key={px} d={`M${px} -48 V -10`} stroke="var(--color-ink)" strokeWidth="2.5" />)}
        <rect x="-9" y="-36" width="18" height="26" fill="var(--color-ink)" />
        <path d="M-90 -44 Q -76 -48 -64 -66 L 0 -94 L 64 -66 Q 76 -48 90 -44 Z" fill="var(--color-clay)" stroke="var(--color-ink)" strokeWidth="2" />
        {[-60, -40, -20, 0, 20, 40, 60].map((rx) => <path key={rx} d={`M${rx * 0.55} -88 L ${rx} -50`} stroke="var(--color-ink)" strokeOpacity="0.35" />)}
        <path d="M-30 -80 L 0 -112 L 30 -80 Z" fill="var(--color-clay-700)" stroke="var(--color-ink)" strokeWidth="2" />
        <path d="M-14 -84 L 0 -100 L 14 -84" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" />
        <path d="M0 -112 V -122" stroke="var(--color-ink)" strokeWidth="2" />
        <circle cx="0" cy="-124" r="3" fill="var(--color-gold)" />
      </g>

      <rect x="0" y="300" width="1200" height="40" fill={`url(#f${id})`} />
    </svg>
  );
}
