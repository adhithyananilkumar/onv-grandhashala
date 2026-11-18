import { useId } from "react";

const safe = (id: string) => id.replace(/[^a-zA-Z0-9]/g, "");

const GOLD = "var(--color-kani)";
const GOLD_DEEP = "var(--color-kani-700)";

function Flame({ x, y, h = 30, fill }: { x: number; y: number; h?: number; fill: string }) {
  const w = h * 0.3;
  return (
    <g className="lamp-flame" style={{ animationDelay: `${(x % 7) * 0.17}s` }}>
      <path d={`M${x} ${y - h} C ${x + w} ${y - h * 0.5} ${x + w * 0.9} ${y - h * 0.08} ${x} ${y} C ${x - w * 0.9} ${y - h * 0.08} ${x - w} ${y - h * 0.5} ${x} ${y - h} Z`} fill={fill} stroke={GOLD_DEEP} strokeWidth="0.8" />
      <path d={`M${x} ${y - h * 0.5} C ${x + w * 0.4} ${y - h * 0.28} ${x + w * 0.35} ${y - h * 0.08} ${x} ${y - h * 0.04} C ${x - w * 0.35} ${y - h * 0.08} ${x - w * 0.4} ${y - h * 0.28} ${x} ${y - h * 0.5} Z`} fill="var(--color-card)" opacity="0.85" />
    </g>
  );
}

/**
 * Nilavilakku, the traditional Kerala brass lamp lit for learning and
 * auspicious beginnings, drawn as fine gold line work inside a temple arch.
 */
export function Nilavilakku({ className }: { className?: string }) {
  const id = safe(useId());
  const body = { fill: GOLD, fillOpacity: 0.16, stroke: GOLD_DEEP, strokeWidth: 1.4 } as const;
  const flameId = `flame${id}`;
  return (
    <svg viewBox="0 0 320 440" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`glow${id}`} cx="160" cy="118" r="130" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.38" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={flameId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1d9a0" />
          <stop offset="1" stopColor={GOLD} />
        </linearGradient>
      </defs>

      {/* Temple arch, double-ruled with a dotted inner line */}
      <g fill="none" strokeLinecap="round">
        <path d="M28 432 V188 C28 96 92 40 160 20 C228 40 292 96 292 188 V432" stroke={GOLD} strokeWidth="1.4" />
        <path d="M40 432 V190 C40 106 100 56 160 36 C220 56 280 106 280 190 V432" stroke={GOLD_DEEP} strokeWidth="1" />
        <path d="M50 432 V192 C50 114 106 70 160 52 C214 70 270 114 270 192 V432" stroke={GOLD_DEEP} strokeWidth="1.2" strokeDasharray="0.5 6" />
        <path d="M16 432 H304 M24 438 H296" stroke={GOLD_DEEP} strokeWidth="1" />
      </g>
      {/* Lotus at the apex */}
      <g fill={GOLD} fillOpacity="0.3" stroke={GOLD_DEEP} strokeWidth="1">
        <path d="M160 22 C155 12 156 4 160 0 C164 4 165 12 160 22Z" />
        <path d="M160 22 C152 20 147 14 146 8 C153 9 158 14 160 22Z" />
        <path d="M160 22 C168 20 173 14 174 8 C167 9 162 14 160 22Z" />
      </g>

      <circle cx="160" cy="118" r="130" fill={`url(#glow${id})`} />

      {/* Wick plate with scalloped rim and five flames */}
      <path d="M86 132 Q100 158 160 160 Q220 158 234 132" {...body} />
      <ellipse cx="160" cy="132" rx="74" ry="9" {...body} fillOpacity={0.28} />
      <path d={Array.from({ length: 10 }, (_, i) => `M${90 + i * 14} 140 q 7 6 14 0`).join(" ")} fill="none" stroke={GOLD_DEEP} strokeWidth="0.9" opacity="0.8" />
      {[96, 128, 160, 192, 224].map((x) => <path key={`w${x}`} d={`M${x} 131 v-4`} stroke={GOLD_DEEP} strokeWidth="1.4" />)}
      {[96, 128, 160, 192, 224].map((x) => <Flame key={x} x={x} y={127} h={x === 160 ? 38 : 30} fill={`url(#${flameId})`} />)}

      {/* Stem with knops */}
      <path d="M154 162 V344 M166 162 V344" stroke={GOLD_DEEP} strokeWidth="1.4" />
      <rect x="154" y="162" width="12" height="182" fill={GOLD} fillOpacity="0.16" />
      <ellipse cx="160" cy="166" rx="16" ry="4" {...body} />
      <ellipse cx="160" cy="188" rx="21" ry="8" {...body} fillOpacity={0.26} />
      <ellipse cx="160" cy="222" rx="14" ry="5" {...body} />
      <ellipse cx="160" cy="230" rx="11" ry="3.5" {...body} />
      <path d="M150 246 C135 256 135 274 150 284 H170 C185 274 185 256 170 246 Z" {...body} fillOpacity={0.24} />
      <path d="M146 265 H174" stroke={GOLD_DEEP} strokeWidth="0.8" opacity="0.7" />
      <ellipse cx="160" cy="302" rx="16" ry="5" {...body} />
      <ellipse cx="160" cy="326" rx="22" ry="6" {...body} />

      {/* Lower tray */}
      <path d="M106 344 Q160 368 214 344" {...body} />
      <ellipse cx="160" cy="344" rx="54" ry="8" {...body} fillOpacity={0.26} />
      <path d="M155 356 V388 M165 356 V388" stroke={GOLD_DEEP} strokeWidth="1.4" />

      {/* Tiered foot */}
      <ellipse cx="160" cy="390" rx="28" ry="6" {...body} />
      <path d="M116 422 C128 404 144 396 160 395 C176 396 192 404 204 422 Z" {...body} fillOpacity={0.22} />
      <path d={Array.from({ length: 7 }, (_, i) => `M${132 + i * 9.5} ${405 + Math.abs(i - 3) * 2} v8`).join(" ")} stroke={GOLD_DEEP} strokeWidth="0.8" opacity="0.6" />
      <ellipse cx="160" cy="423" rx="48" ry="7" {...body} fillOpacity={0.3} />
    </svg>
  );
}

/** Gold lotus-and-vine border between double rules, like a kasavu or temple frieze. */
export function LotusBorder({ className }: { className?: string }) {
  const id = safe(useId());
  return (
    <svg width="100%" height="40" className={className} aria-hidden="true">
      <defs>
        <pattern id={`p${id}`} width="72" height="40" patternUnits="userSpaceOnUse" x="50%">
          <path d="M0 20 C12 10 24 10 36 20 S60 30 72 20" fill="none" stroke={GOLD_DEEP} strokeWidth="1" />
          <g fill={GOLD} fillOpacity="0.35" stroke={GOLD_DEEP} strokeWidth="0.8">
            <path d="M36 20 C33 14 34 9 36 6 C38 9 39 14 36 20Z" />
            <path d="M36 20 C31 18 28 14 28 11 C32 12 35 15 36 20Z" />
            <path d="M36 20 C41 18 44 14 44 11 C40 12 37 15 36 20Z" />
            <ellipse cx="14" cy="23" rx="4" ry="1.8" transform="rotate(25 14 23)" />
            <ellipse cx="58" cy="23" rx="4" ry="1.8" transform="rotate(-25 58 23)" />
          </g>
          <circle cx="0" cy="20" r="1.6" fill={GOLD_DEEP} />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="1.5" fill={GOLD_DEEP} />
      <rect x="0" y="4" width="100%" height="0.75" fill={GOLD} />
      <rect x="0" y="6" width="100%" height="28" fill={`url(#p${id})`} />
      <rect x="0" y="35.25" width="100%" height="0.75" fill={GOLD} />
      <rect x="0" y="38.5" width="100%" height="1.5" fill={GOLD_DEEP} />
    </svg>
  );
}
