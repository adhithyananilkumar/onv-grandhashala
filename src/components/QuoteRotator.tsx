"use client";

import { useEffect, useState } from "react";

export type Quote = { ml: string; en: string; by: string };

/** Cross-fades through a few short lines about reading and learning. Pauses on hover/focus. */
export function QuoteRotator({ quotes, interval = 7000 }: { quotes: Quote[]; interval?: number }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % quotes.length), interval);
    return () => clearInterval(t);
  }, [paused, quotes.length, interval]);

  return (
    <figure onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="grid">
        {quotes.map((q, n) => (
          <blockquote
            key={q.ml}
            aria-hidden={n !== i}
            className={`quote [grid-area:1/1] ${n === i ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
          >
            <p className="font-ml text-[2.15rem] leading-[1.25] font-extrabold text-balance text-royal sm:text-[3.4rem] lg:text-[4rem]">{q.ml}</p>
            <p className="mt-3 font-display text-[1.2rem] leading-snug text-ink-2 sm:text-2xl">{q.en}</p>
            <footer className="mt-3 text-[15px] text-muted">{q.by}</footer>
          </blockquote>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Choose a quote">
        {quotes.map((q, n) => (
          <button
            key={q.ml}
            role="tab"
            aria-selected={n === i}
            aria-label={`Quote ${n + 1} of ${quotes.length}`}
            onClick={() => setI(n)}
            className={`h-2 rounded-full transition-all duration-300 ${n === i ? "w-8 bg-royal" : "w-2 bg-line hover:bg-muted"}`}
          />
        ))}
      </div>
    </figure>
  );
}
