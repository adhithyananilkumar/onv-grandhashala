"use client";

import { useEffect, useState } from "react";
import { ParticlePortrait, preloadImages } from "@/components/ParticlePortrait";
import { QuoteRotator } from "@/components/QuoteRotator";
import { portraits, type PortraitId, type Quote } from "@/lib/quotes";

/** The hero: a screen-filling rotating quote with its author's particle portrait beside it. */
export function HeroQuotes({ quotes }: { quotes: Quote[] }) {
  const [id, setId] = useState<PortraitId | null>(null);
  const p = id ? portraits[id] : null;
  const name = id ? quotes.find((q) => q.portrait === id)?.by.split(",")[0] : null;

  // Load every portrait up front so each one appears the moment its quote does.
  useEffect(() => { preloadImages(Object.values(portraits).map((x) => x.src)); }, []);

  return (
    // Below lg the hero is exactly one screen between the header and the bottom bar: the quote keeps
    // its natural height and the portrait takes whatever is left, so nothing slips under the bar.
    <div className="flex h-[calc(100svh-80px-104px-env(safe-area-inset-bottom))] w-full max-w-[1500px] flex-col md:h-[calc(100svh-80px-32px)] lg:grid lg:h-auto lg:min-h-[calc(100svh-96px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:items-center lg:gap-4">
      <figure className="relative -mx-6 min-h-[120px] flex-1 sm:-mx-[8vw] lg:order-2 lg:mx-0 lg:-mr-10 lg:flex-none lg:self-stretch">
        <ParticlePortrait
          src={p?.src ?? ""}
          crop={p?.crop}
          alt={name ? `Portrait of ${name}` : ""}
          className="h-full w-full lg:min-h-[640px]"
        />
      </figure>
      <div className="mt-1 w-full shrink-0 lg:mt-0 lg:pl-4">
        <QuoteRotator quotes={quotes} interval={9000} onChange={(q) => setId(q.portrait)} />
      </div>
    </div>
  );
}
