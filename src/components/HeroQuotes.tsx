"use client";

import { useEffect, useState } from "react";
import { preload } from "react-dom";
import { ParticlePortrait, preloadImages } from "@/components/ParticlePortrait";
import { QuoteRotator } from "@/components/QuoteRotator";
import { portraits, type PortraitId, type Quote } from "@/lib/quotes";

// The hero always opens on the same line, so its words are in the server HTML and its
// portrait can be fetched with the page instead of after a client-side shuffle.
const OPENING = "A library in every village.";

/** The hero: a screen-filling rotating quote with its author's particle portrait beside it. */
export function HeroQuotes({ quotes }: { quotes: Quote[] }) {
  const first = Math.max(0, quotes.findIndex((q) => q.en === OPENING));
  const [id, setId] = useState<PortraitId>(quotes[first].portrait);
  const [next, setNext] = useState<PortraitId | null>(null);
  const p = portraits[id];
  const name = quotes.find((q) => q.portrait === id)?.by.split(",")[0];

  // High priority: the opening portrait is part of the first screen.
  preload(p.src, { as: "image", fetchPriority: "high" });

  // The rest load one by one once the page is idle, so they never compete with the first screen.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((f: () => void) => setTimeout(f, 1200));
    const h = idle(() => preloadImages(Object.values(portraits).map((x) => x.src)));
    return () => (window.cancelIdleCallback ?? clearTimeout)(h as number);
  }, []);

  const n = next ? portraits[next] : null;

  return (
    // Below lg the hero is exactly one screen between the header and the bottom bar: the quote keeps
    // its natural height and the portrait takes whatever is left, so nothing slips under the bar.
    <div className="flex h-[calc(100svh-80px-104px-env(safe-area-inset-bottom))] w-full max-w-[1500px] flex-col md:h-[calc(100svh-80px-32px)] lg:grid lg:h-auto lg:min-h-[calc(100svh-96px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:items-center lg:gap-4">
      <figure className="relative -mx-6 min-h-[120px] flex-1 sm:-mx-[8vw] lg:order-2 lg:mx-0 lg:-mr-10 lg:flex-none lg:self-stretch">
        <ParticlePortrait
          src={p.src}
          crop={p.crop}
          next={n ? { src: n.src, crop: n.crop } : undefined}
          alt={name ? `Portrait of ${name}` : ""}
          className="h-full w-full lg:min-h-[640px]"
        />
      </figure>
      <div className="mt-1 w-full shrink-0 lg:mt-0 lg:pl-4">
        <QuoteRotator quotes={quotes} first={first} interval={9000} onChange={(q, upcoming) => { setId(q.portrait); setNext(upcoming?.portrait ?? null); }} />
      </div>
    </div>
  );
}
