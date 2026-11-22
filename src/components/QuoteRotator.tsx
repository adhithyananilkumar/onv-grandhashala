"use client";

import { useEffect, useRef, useState } from "react";
import { portraits, type Quote } from "@/lib/quotes";

function shuffled(n: number) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Opens on quote `first` (so it is in the server HTML and visible on the very first paint), then
 * shows the rest in a fresh random order for every visitor, cross-fading calmly from one to the next.
 * `onChange` also gets the quote after this one, so the portrait can be prepared ahead of time.
 */
export function QuoteRotator({ quotes, first = 0, interval = 8000, onChange }: { quotes: Quote[]; first?: number; interval?: number; onChange?: (q: Quote, next?: Quote) => void }) {
  const [state, setState] = useState<{ order: number[]; pos: number }>({ order: [first], pos: 0 });
  const started = state.order.length > 1;

  // Shuffle the rest after hydration so server and client markup match.
  useEffect(() => {
    const t = setTimeout(() => setState((s) => (s.order.length > 1 ? s : { order: [first, ...shuffled(quotes.length).filter((i) => i !== first)], pos: 0 })));
    return () => clearTimeout(t);
  }, [first, quotes.length]);

  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => {
      if (document.hidden) return;
      setState((s) => {
        if (s.pos + 1 < s.order.length) return { ...s, pos: s.pos + 1 };
        // New round, new order; never repeat the quote that was just showing.
        const next = shuffled(quotes.length);
        if (next[0] === s.order[s.pos]) next.push(next.shift()!);
        return { order: next, pos: 0 };
      });
    }, interval);
    return () => clearInterval(t);
  }, [started, interval, quotes.length]);

  const current = state.order[state.pos];
  const upcoming = state.order[state.pos + 1];

  // Tell the parent which quote is showing (the hero uses it to swap the portrait) and which is next.
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });
  useEffect(() => {
    onChangeRef.current?.(quotes[current], upcoming === undefined ? undefined : quotes[upcoming]);
  }, [current, upcoming, quotes]);

  // Malayalam words never break mid-word, so a long compound (സ്നേഹമാണഖിലസാരമൂഴിയിൽ) can be wider
  // than the column. Shrink any quote whose longest word overflows until it fits. Runs once the
  // fonts are in and again whenever the column width changes.
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    let lastWidth = -1;
    const fit = (force = false) => {
      const w = el.clientWidth;
      if (!force && w === lastWidth) return;
      lastWidth = w;
      el.querySelectorAll<HTMLElement>("[data-fit]").forEach((p) => {
        p.style.fontSize = "";
        let size = parseFloat(getComputedStyle(p).fontSize);
        while (p.scrollWidth > p.clientWidth + 1 && size > 18) {
          size *= 0.94;
          p.style.fontSize = `${size}px`;
        }
      });
    };
    fit(true);
    document.fonts?.ready.then(() => fit(true));
    const ro = new ResizeObserver(() => fit());
    ro.observe(el);
    return () => ro.disconnect();
  }, [quotes]);

  return (
    <figure aria-live="off" className="w-full">
      <div ref={grid} className="grid grid-cols-[minmax(0,1fr)]">
        {quotes.map((q, n) => (
          <blockquote
            key={q.ml}
            aria-hidden={n !== current}
            // The old line fades out while the new one rises in a beat later, on the same soft curve,
            // so the two overlap briefly instead of blinking.
            className={`[grid-area:1/1] min-w-0 self-center transition-[opacity,transform] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${n === current ? "translate-y-0 opacity-100 delay-[350ms] duration-[1100ms]" : "pointer-events-none -translate-y-1.5 opacity-0 duration-[600ms]"}`}
          >
            <p data-fit className={`font-ml leading-[1.22] font-extrabold tracking-[-0.01em] text-balance text-royal [overflow-wrap:normal] ${q.ml.length > 48 ? "text-[1.45rem] sm:text-[2.7rem] lg:text-[3rem] xl:text-[3.5rem]" : q.ml.length > 30 ? "text-[1.8rem] sm:text-[3.4rem] lg:text-[3.7rem] xl:text-[4.3rem]" : "text-[2.2rem] sm:text-[4.4rem] lg:text-[5.2rem] xl:text-[6rem]"}`}>{q.ml}</p>
            <span aria-hidden="true" className="mx-auto mt-4 block h-[2px] w-16 rounded-full bg-kani sm:mt-6" />
            <p className="mx-auto mt-3 max-w-2xl font-display text-[1.05rem] leading-snug text-balance text-ink-2 sm:text-[1.5rem] lg:text-[1.65rem]">{q.en}</p>
            {/* Name, then the English credit, then the years (hidden on phones), all centred under each other. */}
            <footer className="mt-3 flex flex-col items-center text-center sm:mt-5">
              <p className="font-ml text-[17px] font-bold text-royal sm:text-[20px]">{portraits[q.portrait].nameMl}</p>
              <p className="mt-1 text-[12px] font-semibold tracking-[0.2em] text-balance text-kani-700 uppercase sm:text-[13px]">{q.by}</p>
              <p className="mt-1 hidden text-[12px] font-semibold tracking-[0.18em] text-muted sm:block sm:text-[13px]">{portraits[q.portrait].years}</p>
            </footer>
          </blockquote>
        ))}
      </div>
    </figure>
  );
}
