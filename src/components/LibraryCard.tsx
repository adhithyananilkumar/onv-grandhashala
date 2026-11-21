"use client";

import { useRef } from "react";
import { site } from "@/lib/site";

const FOIL = "linear-gradient(115deg,#8a6420 0%,#f3d58a 22%,#c9952f 42%,#fff1c4 55%,#b8862a 72%,#ecc56a 100%)";

/** The logo printed in gold foil: the PNG is used as a mask over a foil gradient. */
function FoilLogo({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block aspect-[1.5] ${className}`}
      style={{
        background: FOIL,
        WebkitMask: "url(/brand/onv-icon-white.png) center / contain no-repeat",
        mask: "url(/brand/onv-icon-white.png) center / contain no-repeat",
      }}
    />
  );
}

/** Fine engraved guilloche lines, like the security print on banknotes. */
function Guilloche() {
  const lines = [];
  for (let i = 0; i < 26; i++) {
    const y = 10 + i * 9;
    lines.push(<path key={i} d={`M-20 ${y} C 80 ${y - 34}, 160 ${y + 34}, 260 ${y} S 440 ${y - 30}, 540 ${y}`} />);
  }
  return (
    <svg viewBox="0 0 500 315" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <g fill="none" stroke="#ecc56a" strokeWidth="0.45" opacity="0.13">{lines}</g>
      <g fill="none" stroke="#ecc56a" strokeWidth="0.5" opacity="0.1">
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx="430" cy="40" r={40 + i * 16} />
        ))}
      </g>
    </svg>
  );
}

/**
 * The library membership card, made to feel like a premium metal card:
 * deep peacock-black stock, engraved guilloche, gold-foil logo,
 * embossed name. Moving the pointer over it tilts it and slides the light.
 */
export function LibraryCard({
  name = "Your name here",
  cardNo = "ONV 0000 2026",
  since = "2026",
  className = "",
  tilt = true,
}: { name?: string; cardNo?: string; since?: string; className?: string; tilt?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  function move(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || !tilt || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
    el.style.setProperty("--lx", `${x * 100}%`);
    el.style.setProperty("--ly", `${y * 100}%`);
  }
  function leave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--lx", "30%");
    el.style.setProperty("--ly", "20%");
  }

  const emboss = { textShadow: "0 1px 0 rgb(255 255 255 / 0.18), 0 -1px 0 rgb(0 0 0 / 0.6)" };

  return (
    <div className={`w-full [container-type:inline-size] [perspective:1100px] ${className}`}>
      <div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={leave}
        style={{ ["--lx" as string]: "30%", ["--ly" as string]: "20%" }}
        className="relative aspect-[1.586] w-full overflow-hidden rounded-[4.2cqw] bg-[linear-gradient(150deg,#1b4741_0%,#0f2d29_45%,#081c19_100%)] text-mist shadow-[0_50px_80px_-40px_rgb(0_0_0/0.8),0_18px_30px_-20px_rgb(0_0_0/0.6)] transition-transform duration-300 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]"
      >
        <Guilloche />
        {/* brushed-metal grain */}
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay [background:repeating-linear-gradient(90deg,#fff_0_1px,transparent_1px_3px)]" />
        {/* moving light */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_var(--lx)_var(--ly),rgb(255_244_214/0.22),transparent_45%)]" />
        {/* bevelled edge */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.18),inset_0_0_0_1px_rgb(236_197_106/0.18)]" />

        <div className="relative flex h-full flex-col px-[7cqw] py-[6.5cqw]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-[2.6cqw]">
              <FoilLogo className="w-[11cqw]" />
              <div className="leading-tight">
                <p className="font-ml text-[3.3cqw] font-semibold text-mist/95">{site.nameMl}</p>
                <p className="mt-[0.5cqw] text-[2cqw] font-semibold tracking-[0.32em] text-kani/80 uppercase">Grameena Grandhashala</p>
              </div>
            </div>
            <p
              className="bg-clip-text font-display text-[4.6cqw] leading-none font-extrabold tracking-[0.04em] text-transparent"
              style={{ backgroundImage: FOIL }}
            >
              ONV
            </p>
          </div>

          <p className="mt-[9cqw] text-[2cqw] font-semibold tracking-[0.32em] text-mist/45 uppercase">Library card · <span className="font-ml tracking-normal">അംഗത്വ കാർഡ്</span></p>

          <div className="mt-auto flex items-end justify-between gap-[4cqw]">
            <div className="min-w-0">
              <p className="font-mono text-[4.4cqw] font-medium tracking-[0.2em] text-mist/90 tabular-nums" style={emboss}>{cardNo}</p>
              <p className="mt-[2.4cqw] truncate text-[3.6cqw] font-semibold tracking-[0.14em] uppercase" style={emboss}>{name}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[1.8cqw] font-semibold tracking-[0.28em] text-mist/45 uppercase">Member since</p>
              <p className="mt-[0.6cqw] font-mono text-[3.2cqw] font-semibold text-kani tabular-nums">{since}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
