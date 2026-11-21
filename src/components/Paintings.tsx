import { useId } from "react";

/*
 * Hand-built SVG "ink-wash" paintings of Kerala subjects.
 * Shared look: soft pigment washes with ragged edges (turbulence displacement),
 * ink line work, and a limited palette that matches the site tokens.
 */

const P = {
  ink: "#231b16",
  red: "#c0392b",
  vermilion: "#9b2c1f",
  gold: "#d29a2e",
  goldLight: "#ecc56a",
  green: "#2e7d4f",
  greenDeep: "#1f5c38",
  teal: "#2f6e78",
  sepia: "#a8763e",
  paper: "#fffaf1",
};

const sid = (id: string) => id.replace(/[^a-zA-Z0-9]/g, "");

/** Filters every painting uses: a ragged wash and a slightly rough ink line. */
function Defs({ id }: { id: string }) {
  return (
    <defs>
      <filter id={`wash${id}`} x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G" result="d" />
        <feGaussianBlur in="d" stdDeviation="2.2" result="b" />
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="3" result="grain" />
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.25" result="g" />
        <feComposite in="b" in2="g" operator="in" />
      </filter>
      <filter id={`rough${id}`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="2" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={`brush${id}`} x="-10%" y="-30%" width="120%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.3" numOctaves="3" seed="9" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  );
}

/* ───────────────────────── Hero background ───────────────────────── */

/**
 * Soft pigment washes that drift slowly behind the hero. The doodles (Scene.tsx) sit on top.
 */
export function HeroWashes({ className }: { className?: string }) {
  const id = sid(useId());
  return (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <Defs id={id} />
      <g filter={`url(#wash${id})`}>
        <g className="drift drift-a"><ellipse cx="120" cy="140" rx="300" ry="210" fill={P.gold} opacity="0.3" /></g>
        <g className="drift drift-b"><ellipse cx="1100" cy="120" rx="260" ry="180" fill={P.red} opacity="0.14" /></g>
        <g className="drift drift-c"><ellipse cx="1080" cy="700" rx="360" ry="220" fill={P.teal} opacity="0.24" /></g>
        <g className="drift drift-b"><ellipse cx="140" cy="720" rx="300" ry="190" fill={P.green} opacity="0.2" /></g>
      </g>
    </svg>
  );
}

/* ───────────────────────── Kathakali ───────────────────────── */

export function Kathakali({ className }: { className?: string }) {
  const id = sid(useId());
  const studs = Array.from({ length: 28 }, (_, i) => {
    const a = Math.PI + (i / 27) * Math.PI; // upper half of the crown
    return [200 + Math.cos(a) * 168, 196 + Math.sin(a) * 168];
  });
  return (
    <svg viewBox="0 0 400 500" className={className} role="img" aria-label="Painting of a Kathakali dancer's face in green pacha make-up with a golden crown">
      <Defs id={id} />

      {/* background washes */}
      <g filter={`url(#wash${id})`}>
        <ellipse cx="215" cy="250" rx="185" ry="215" fill={P.sepia} opacity="0.22" />
        <ellipse cx="110" cy="390" rx="120" ry="80" fill={P.teal} opacity="0.28" />
        <ellipse cx="320" cy="120" rx="80" ry="60" fill={P.red} opacity="0.22" />
      </g>

      <g filter={`url(#rough${id})`}>
        {/* crown halo (kireedam) */}
        <circle cx="200" cy="196" r="178" fill={P.gold} opacity="0.95" />
        <circle cx="200" cy="196" r="178" fill="none" stroke={P.vermilion} strokeWidth="6" />
        <circle cx="200" cy="196" r="150" fill="none" stroke={P.vermilion} strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" />
        <circle cx="200" cy="196" r="134" fill={P.vermilion} opacity="0.92" />
        <circle cx="200" cy="196" r="122" fill="none" stroke={P.goldLight} strokeWidth="2" />
        {studs.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 2 ? 4.5 : 6.5} fill={i % 2 ? P.paper : P.red} stroke={P.ink} strokeWidth="1" />
        ))}
        {/* petal rays inside the halo */}
        {Array.from({ length: 16 }, (_, i) => {
          const a = Math.PI + 0.12 + (i / 15) * (Math.PI - 0.24);
          const x1 = 200 + Math.cos(a) * 124, y1 = 196 + Math.sin(a) * 124;
          const x2 = 200 + Math.cos(a) * 146, y2 = 196 + Math.sin(a) * 146;
          return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={P.goldLight} strokeWidth="5" strokeLinecap="round" />;
        })}

        {/* black hair falling at the sides */}
        <path d="M108 200 C 92 280 96 360 120 430 L 150 430 C 132 360 130 280 140 210 Z" fill={P.ink} opacity="0.9" />
        <path d="M292 200 C 308 280 304 360 280 430 L 250 430 C 268 360 270 280 260 210 Z" fill={P.ink} opacity="0.9" />

        {/* tiara band over the forehead */}
        <path d="M122 186 C 150 150 250 150 278 186 L 270 204 C 244 176 156 176 130 204 Z" fill={P.goldLight} stroke={P.ink} strokeWidth="2" />
        {[140, 160, 180, 200, 220, 240, 260].map((x, i) => (
          <circle key={x} cx={x} cy={184 - Math.sin((i / 6) * Math.PI) * 10} r="4.5" fill={i % 2 ? P.green : P.red} stroke={P.ink} strokeWidth="1" />
        ))}

        {/* chutti: the white rice-paper frame along the jaw */}
        <path d="M128 232 C 118 330 158 396 200 400 C 242 396 282 330 272 232" fill="none" stroke={P.paper} strokeWidth="30" strokeLinecap="round" />
        <path d="M113 232 C 102 336 152 414 200 418 C 248 414 298 336 287 232" fill="none" stroke={P.paper} strokeWidth="9" strokeDasharray="1 11" strokeLinecap="round" />
        <path d="M141 236 C 134 322 166 382 200 385 C 234 382 266 322 259 236" fill="none" stroke={P.red} strokeWidth="3" />

        {/* green face (pacha) */}
        <path d="M140 210 C 140 176 260 176 260 210 L 260 268 C 260 330 236 370 200 372 C 164 370 140 330 140 268 Z" fill={P.green} />
        <path d="M150 300 C 160 340 180 360 200 362 C 220 360 240 340 250 300 C 236 326 220 338 200 340 C 180 338 164 326 150 300 Z" fill={P.greenDeep} opacity="0.55" />

        {/* forehead mark: yellow namam with red centre */}
        <path d="M172 206 C 184 196 216 196 228 206 C 216 202 184 202 172 206 Z" fill={P.goldLight} stroke={P.ink} strokeWidth="1" />
        <path d="M193 206 C 196 190 204 190 207 206 L 203 236 L 197 236 Z" fill={P.goldLight} stroke={P.ink} strokeWidth="1.2" />
        <path d="M198 204 L 202 204 L 201 230 L 199 230 Z" fill={P.red} />

        {/* eyebrows */}
        <path d="M150 222 C 160 206 182 206 190 218 C 178 214 162 214 150 226 Z" fill={P.ink} />
        <path d="M250 222 C 240 206 218 206 210 218 C 222 214 238 214 250 226 Z" fill={P.ink} />

        {/* eyes: long black liner swept to the temples, red-tinted whites */}
        <path d="M144 244 C 158 228 182 228 192 242 C 180 252 160 254 144 244 Z" fill={P.paper} stroke={P.ink} strokeWidth="3.5" />
        <path d="M256 244 C 242 228 218 228 208 242 C 220 252 240 254 256 244 Z" fill={P.paper} stroke={P.ink} strokeWidth="3.5" />
        <path d="M150 244 C 160 236 180 236 188 243 C 178 249 162 250 150 244 Z" fill={P.red} opacity="0.35" />
        <path d="M250 244 C 240 236 220 236 212 243 C 222 249 238 250 250 244 Z" fill={P.red} opacity="0.35" />
        <circle cx="172" cy="241" r="6.5" fill={P.ink} />
        <circle cx="228" cy="241" r="6.5" fill={P.ink} />
        <circle cx="174" cy="239" r="1.8" fill={P.paper} />
        <circle cx="230" cy="239" r="1.8" fill={P.paper} />
        <path d="M144 244 C 136 238 128 236 120 238" stroke={P.ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M256 244 C 264 238 272 236 280 238" stroke={P.ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />

        {/* nose */}
        <path d="M200 250 C 196 270 192 284 194 292 C 198 296 204 296 208 292" stroke={P.greenDeep} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="201" cy="292" r="3.2" fill={P.red} />

        {/* lips */}
        <path d="M172 318 C 186 308 214 308 228 318 C 216 332 184 332 172 318 Z" fill={P.red} stroke={P.ink} strokeWidth="2" />
        <path d="M174 318 C 190 322 210 322 226 318" stroke={P.vermilion} strokeWidth="2" fill="none" />
        <path d="M166 316 C 168 312 170 312 172 318 M234 316 C 232 312 230 312 228 318" stroke={P.ink} strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* ear ornaments (kundalam) */}
        {[118, 282].map((x) => (
          <g key={x}>
            <circle cx={x} cy="258" r="20" fill={P.goldLight} stroke={P.ink} strokeWidth="2" />
            <circle cx={x} cy="258" r="10" fill={P.red} stroke={P.ink} strokeWidth="1.2" />
            <circle cx={x} cy="258" r="3.5" fill={P.paper} />
          </g>
        ))}

        {/* necklace */}
        <path d="M150 420 C 170 446 230 446 250 420" stroke={P.goldLight} strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M140 432 C 166 470 234 470 260 432" stroke={P.red} strokeWidth="6" fill="none" strokeLinecap="round" />
        {[170, 186, 200, 214, 230].map((x, i) => (
          <circle key={x} cx={x} cy={440 + (i === 2 ? 8 : Math.abs(2 - i) === 1 ? 5 : 0)} r="5" fill={P.goldLight} stroke={P.ink} strokeWidth="1" />
        ))}
      </g>

      {/* a few loose ink brush marks, like a painter's signature strokes */}
      <g filter={`url(#brush${id})`} stroke={P.ink} fill="none" strokeLinecap="round" opacity="0.75">
        <path d="M24 470 C 90 452 150 470 220 462" strokeWidth="5" />
        <path d="M300 478 C 330 470 360 474 386 466" strokeWidth="3" />
      </g>
    </svg>
  );
}

/* ───────────────────────── Feature paintings ───────────────────────── */

/** Chundan vallam (snake boat) racing on the backwaters. */
export function SnakeBoat({ className }: { className?: string }) {
  const id = sid(useId());
  const rowers = Array.from({ length: 22 }, (_, i) => 70 + i * 20);
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" className={className} role="img" aria-label="Painting of a snake boat race on the Kerala backwaters">
      <Defs id={id} />
      <g filter={`url(#wash${id})`}>
        <ellipse cx="460" cy="110" rx="200" ry="90" fill={P.gold} opacity="0.35" />
        <rect x="-40" y="230" width="720" height="160" fill={P.teal} opacity="0.4" />
        <ellipse cx="120" cy="170" rx="200" ry="70" fill={P.green} opacity="0.25" />
      </g>
      {/* far palms */}
      <g stroke={P.ink} fill="none" strokeLinecap="round" opacity="0.45" filter={`url(#rough${id})`}>
        {[40, 90, 150, 560, 610].map((x, i) => (
          <g key={x}>
            <path d={`M${x} 210 Q ${x + 4} 170 ${x + (i % 2 ? 8 : -6)} 130`} strokeWidth="2.5" />
            {[-30, -18, 0, 18, 30].map((dx) => (
              <path key={dx} d={`M${x + (i % 2 ? 8 : -6)} 130 q ${dx / 2} -10 ${dx} ${8 + Math.abs(dx) / 3}`} strokeWidth="1.8" />
            ))}
          </g>
        ))}
      </g>
      <g filter={`url(#rough${id})`}>
        {/* hull with the high curved stern */}
        <path d="M30 244 C 180 258 420 258 560 238 C 586 226 600 180 612 120 C 616 112 622 112 620 124 C 612 190 600 240 570 254 C 420 274 180 274 30 252 Z" fill={P.ink} />
        <path d="M40 248 C 200 260 420 260 556 244" stroke={P.gold} strokeWidth="2" fill="none" />
        {/* golden muthukuda umbrellas */}
        {[300, 340].map((x) => (
          <g key={x}>
            <path d={`M${x} 236 V 196`} stroke={P.ink} strokeWidth="2" />
            <path d={`M${x - 16} 198 A 16 12 0 0 1 ${x + 16} 198 Z`} fill={P.gold} stroke={P.ink} strokeWidth="1.2" />
            <path d={`M${x - 16} 198 h 32`} stroke={P.red} strokeWidth="3" strokeDasharray="2 2" />
          </g>
        ))}
        {/* rowers and oars */}
        {rowers.map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={226 - (i % 3)} r="4" fill={P.ink} />
            <path d={`M${x} 230 l 3 10`} stroke={i % 4 === 0 ? P.red : P.paper} strokeWidth="4" strokeLinecap="round" />
            <path d={`M${x + 2} 232 L ${x - 14} 274`} stroke={P.sepia} strokeWidth="2" strokeLinecap="round" />
          </g>
        ))}
      </g>
      {/* water strokes */}
      <g filter={`url(#brush${id})`} stroke={P.paper} strokeLinecap="round" opacity="0.8">
        <path d="M60 290 H 240" strokeWidth="3" />
        <path d="M300 302 H 520" strokeWidth="3" />
        <path d="M120 322 H 300" strokeWidth="2" />
        <path d="M420 330 H 600" strokeWidth="2" />
      </g>
    </svg>
  );
}

/** Chenda, the Kerala temple drum, with its curved sticks. */
export function Chenda({ className }: { className?: string }) {
  const id = sid(useId());
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" className={className} role="img" aria-label="Painting of a chenda drum with two sticks">
      <Defs id={id} />
      <g filter={`url(#wash${id})`}>
        <ellipse cx="330" cy="180" rx="230" ry="150" fill={P.red} opacity="0.3" />
        <ellipse cx="470" cy="260" rx="160" ry="90" fill={P.gold} opacity="0.35" />
      </g>
      <g filter={`url(#rough${id})`} transform="rotate(-8 320 190)">
        {/* body */}
        <path d="M230 90 L 230 290 C 230 312 410 312 410 290 L 410 90 Z" fill={P.sepia} stroke={P.ink} strokeWidth="3" />
        {/* lacing */}
        <path d={Array.from({ length: 9 }, (_, i) => `M${238 + i * 20} 104 L ${248 + i * 20} 280 L ${258 + i * 20} 104`).join(" ")} stroke={P.paper} strokeWidth="2.5" fill="none" />
        {/* red cloth band */}
        <path d="M230 170 C 290 184 350 184 410 170 L 410 200 C 350 214 290 214 230 200 Z" fill={P.red} stroke={P.ink} strokeWidth="2" />
        <path d="M230 185 C 290 199 350 199 410 185" stroke={P.gold} strokeWidth="3" fill="none" strokeDasharray="6 5" />
        {/* top skin */}
        <ellipse cx="320" cy="90" rx="90" ry="22" fill={P.paper} stroke={P.ink} strokeWidth="3" />
        <ellipse cx="320" cy="90" rx="78" ry="17" fill="none" stroke={P.gold} strokeWidth="3" />
        {/* sticks */}
        <path d="M200 40 C 250 50 290 68 318 84" stroke={P.ink} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M470 30 C 430 40 396 54 360 76" stroke={P.ink} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M352 80 C 360 70 372 66 380 70" stroke={P.ink} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
      <g filter={`url(#brush${id})`} stroke={P.ink} fill="none" strokeLinecap="round" opacity="0.6">
        <path d="M120 320 C 220 306 420 312 540 300" strokeWidth="4" />
      </g>
    </svg>
  );
}

/** Books, a palm-leaf manuscript and a small lit nilavilakku. */
export function BooksLamp({ className }: { className?: string }) {
  const id = sid(useId());
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" className={className} role="img" aria-label="Painting of stacked books beside a lit brass lamp">
      <Defs id={id} />
      <g filter={`url(#wash${id})`}>
        <ellipse cx="420" cy="120" rx="140" ry="110" fill={P.gold} opacity="0.4" />
        <ellipse cx="240" cy="250" rx="240" ry="100" fill={P.green} opacity="0.25" />
      </g>
      <g filter={`url(#rough${id})`}>
        {/* books */}
        <rect x="150" y="248" width="230" height="34" rx="3" fill={P.vermilion} stroke={P.ink} strokeWidth="2.5" />
        <rect x="170" y="214" width="200" height="34" rx="3" fill={P.green} stroke={P.ink} strokeWidth="2.5" />
        <rect x="160" y="180" width="210" height="34" rx="3" fill={P.teal} stroke={P.ink} strokeWidth="2.5" />
        {[[150, 265, 380], [170, 231, 370], [160, 197, 370]].map(([x1, y, x2], i) => (
          <path key={i} d={`M${x1 + 14} ${y} H ${x2 - 14}`} stroke={P.gold} strokeWidth="2.5" strokeDasharray={i === 1 ? "0" : "10 6"} />
        ))}
        {/* palm-leaf manuscript (thaliyola) */}
        <rect x="180" y="160" width="190" height="18" rx="9" fill={P.goldLight} stroke={P.ink} strokeWidth="2" />
        {[0, 1, 2].map((k) => <path key={k} d={`M196 ${165 + k * 4} H 354`} stroke={P.ink} strokeWidth="0.8" opacity="0.5" />)}
        <circle cx="275" cy="169" r="3" fill={P.ink} />
        {/* lamp */}
        <g transform="translate(440 0)">
          <path d="M-40 120 Q 0 146 40 120 Z" fill={P.gold} stroke={P.ink} strokeWidth="2" />
          <ellipse cx="0" cy="120" rx="40" ry="7" fill={P.goldLight} stroke={P.ink} strokeWidth="2" />
          {[-26, 0, 26].map((x) => (
            <path key={x} className="lamp-flame" d={`M${x} 92 C ${x + 7} 104 ${x + 6} 113 ${x} 116 C ${x - 6} 113 ${x - 7} 104 ${x} 92 Z`} fill={P.red} stroke={P.gold} strokeWidth="1.5" />
          ))}
          <path d="M-5 132 V 268 M5 132 V 268" stroke={P.ink} strokeWidth="2.5" />
          {[160, 200, 236].map((y) => <ellipse key={y} cx="0" cy={y} rx={y === 200 ? 14 : 10} ry="5" fill={P.gold} stroke={P.ink} strokeWidth="2" />)}
          <path d="M-34 282 C -24 266 -10 262 0 262 C 10 262 24 266 34 282 Z" fill={P.gold} stroke={P.ink} strokeWidth="2" />
        </g>
      </g>
      <g filter={`url(#brush${id})`} stroke={P.ink} fill="none" strokeLinecap="round" opacity="0.6">
        <path d="M100 300 C 260 290 440 294 560 286" strokeWidth="4" />
      </g>
    </svg>
  );
}

/** Coconut palms and a woven basket of produce for the market. */
export function PalmMarket({ className }: { className?: string }) {
  const id = sid(useId());
  const palm = (x: number, base: number, h: number, lean: number, s: number) => {
    const tx = x + lean, ty = base - h;
    return (
      <g key={x} stroke={P.ink} fill="none" strokeLinecap="round">
        <path d={`M${x} ${base} Q ${x + lean * 0.2} ${base - h * 0.5} ${tx} ${ty}`} strokeWidth={5 * s} />
        {[[-70, 18], [-54, 44], [-24, 56], [24, 54], [56, 40], [72, 14], [40, -8], [-40, -10]].map(([dx, dy], i) => (
          <path key={i} d={`M${tx} ${ty} Q ${tx + dx * s * 0.55} ${ty - 26 * s} ${tx + dx * s} ${ty + dy * s}`} stroke={i % 3 ? P.greenDeep : P.green} strokeWidth={4.5 * s} />
        ))}
        <circle cx={tx - 5 * s} cy={ty + 8 * s} r={6 * s} fill={P.sepia} stroke={P.ink} strokeWidth="1.5" />
        <circle cx={tx + 5 * s} cy={ty + 9 * s} r={6 * s} fill={P.sepia} stroke={P.ink} strokeWidth="1.5" />
      </g>
    );
  };
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" className={className} role="img" aria-label="Painting of coconut palms and a basket of village produce">
      <Defs id={id} />
      <g filter={`url(#wash${id})`}>
        <circle cx="480" cy="110" r="70" fill={P.red} opacity="0.3" />
        <ellipse cx="320" cy="300" rx="340" ry="80" fill={P.green} opacity="0.3" />
        <ellipse cx="160" cy="140" rx="160" ry="110" fill={P.gold} opacity="0.3" />
      </g>
      <g filter={`url(#rough${id})`}>
        {palm(120, 300, 220, -24, 1)}
        {palm(210, 304, 160, 18, 0.8)}
        {palm(560, 300, 200, 20, 0.95)}
        {/* basket (vatti) */}
        <path d="M300 250 C 300 306 460 306 460 250 Z" fill={P.sepia} stroke={P.ink} strokeWidth="2.5" />
        <path d={Array.from({ length: 8 }, (_, i) => `M${312 + i * 19} 254 L ${322 + i * 19} 296`).join(" ")} stroke={P.ink} strokeWidth="1" opacity="0.5" />
        {/* bananas, coconuts, jackfruit */}
        <path d="M318 248 C 326 220 360 210 372 214 C 356 222 340 236 334 250 Z" fill={P.goldLight} stroke={P.ink} strokeWidth="1.8" />
        <path d="M332 250 C 344 224 372 216 384 222 C 368 228 354 240 348 252 Z" fill={P.gold} stroke={P.ink} strokeWidth="1.8" />
        <ellipse cx="410" cy="234" rx="30" ry="24" fill={P.green} stroke={P.ink} strokeWidth="2" />
        <path d="M388 224 l 6 4 M396 238 l 6 4 M412 222 l 6 4 M420 240 l 6 4 M404 250 l 6 4" stroke={P.greenDeep} strokeWidth="2" />
        <circle cx="440" cy="250" r="14" fill={P.sepia} stroke={P.ink} strokeWidth="2" />
        <circle cx="368" cy="252" r="12" fill={P.sepia} stroke={P.ink} strokeWidth="2" />
      </g>
    </svg>
  );
}
