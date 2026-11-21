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

/** Shows the quotes in a fresh random order for every visitor, cross-fading calmly from one to the next. */
export function QuoteRotator({ quotes, interval = 8000, onChange }: { quotes: Quote[]; interval?: number; onChange?: (q: Quote) => void }) {
  const [state, setState] = useState<{ order: number[]; pos: number } | null>(null);
  const started = state !== null;

  // Shuffle after hydration so server and client markup match.
  useEffect(() => {
    const id = requestAnimationFrame(() => setState({ order: shuffled(quotes.length), pos: 0 }));
    return () => cancelAnimationFrame(id);
  }, [quotes.length]);

  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => {
      if (document.hidden) return;
      setState((s) => {
        if (!s) return s;
        if (s.pos + 1 < s.order.length) return { ...s, pos: s.pos + 1 };
        // New round, new order; never repeat the quote that was just showing.
        const next = shuffled(quotes.length);
        if (next[0] === s.order[s.pos]) next.push(next.shift()!);
        return { order: next, pos: 0 };
      });
    }, interval);
    return () => clearInterval(t);
  }, [started, interval, quotes.length]);

  const current = state ? state.order[state.pos] : -1;

  // Tell the parent which quote is showing (the hero uses it to swap the portrait).
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });
  useEffect(() => {
    if (current >= 0) onChangeRef.current?.(quotes[current]);
  }, [current, quotes]);

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
            className={`[grid-area:1/1] min-w-0 self-center transition-[opacity,transform] ${n === current ? "translate-y-0 opacity-100 delay-200 duration-[1000ms] ease-out" : "pointer-events-none -translate-y-2 opacity-0 duration-200 ease-in"}`}
          >
            <p data-fit className={`font-ml leading-[1.22] font-extrabold tracking-[-0.01em] text-balance text-royal [overflow-wrap:normal] ${q.ml.length > 48 ? "text-[1.45rem] sm:text-[2.7rem] lg:text-[3rem] xl:text-[3.5rem]" : q.ml.length > 30 ? "text-[1.8rem] sm:text-[3.4rem] lg:text-[3.7rem] xl:text-[4.3rem]" : "text-[2.2rem] sm:text-[4.4rem] lg:text-[5.2rem] xl:text-[6rem]"}`}>{q.ml}</p>
            <span aria-hidden="true" className="mx-auto mt-4 block h-[2px] w-16 rounded-full bg-kani sm:mt-6" />
            <p className="mx-auto mt-3 max-w-2xl font-display text-[1.05rem] leading-snug text-balance text-ink-2 sm:text-[1.5rem] lg:text-[1.65rem]">{q.en}</p>
            {/* Name, then the English credit, then the years (hidden on phones), all centred under each other. */}
            <footer className="mt-3 flex flex-col items-center text-center sm:mt-5">
              <p className="font-ml text-[17px] font-bold text-royal sm:text-[20px]">{portraits[q.portrait].nameMl}</p>
              <p className="mt-1 text-[12px] font-semibold tracking-[0.2em] text-kani-700 uppercase sm:text-[13px]">{q.by}</p>
              <p className="mt-1 hidden text-[12px] font-semibold tracking-[0.18em] text-muted sm:block sm:text-[13px]">{portraits[q.portrait].years}</p>
            </footer>
          </blockquote>
        ))}
      </div>
    </figure>
  );
}
