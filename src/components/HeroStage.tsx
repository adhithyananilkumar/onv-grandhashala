import type { ReactNode } from "react";

/** Full-width hero on the page background, content centred, with a quiet painted backdrop. */
export function HeroStage({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-[calc(100svh-80px)] flex-col items-center justify-center px-6 pt-2 pb-[calc(96px+env(safe-area-inset-bottom))] text-center sm:px-[8%] md:pb-6 lg:min-h-[calc(100svh-96px)] lg:px-10 lg:pt-0 lg:pb-0">
      <HeroAccent />
      {children}
    </div>
  );
}

/**
 * Light, decorative layers behind the hero: two soft colour washes, a fine paper
 * grain and a hairline gold rule at the bottom. Everything sits at low opacity
 * so the quote and portrait lead.
 */
function HeroAccent() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-28 bottom-0 -z-10 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_75%,transparent)]">
      {/* Washes: warm gold behind the words, cool peacock green behind the portrait. */}
      <div className="absolute -top-[10%] -left-[10%] h-[70%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgb(210_154_46/0.13),transparent)]" />
      <div className="absolute right-[-12%] bottom-[-15%] h-[80%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgb(29_78_71/0.08),transparent)]" />

      {/* Paper grain. */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04]">
        <filter id="hero-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.14  0 0 0 0 0.11  0 0 0 0 0.09  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>

      {/* Hairline gold rule closing the hero. */}
      <div className="absolute inset-x-[8%] bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgb(210_154_46/0.45),transparent)]" />
    </div>
  );
}
