"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, BookOpen, CalendarDays, CornerDownLeft, Palette, Search, ShoppingBasket, X } from "lucide-react";
import { useCatalog } from "@/lib/api";
import type { Catalog } from "@/lib/types";

type Hit = { href: string; title: string; sub: string; ml?: string; hay: string };
type Group = { key: string; label: string; icon: ComponentType<{ size?: number; className?: string }>; all: string; hits: Hit[] };

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
// Searchable text: each field as written plus a squashed copy, so "onv" finds "O. N. V. Kurup".
const hay = (parts: (string | undefined)[]) => {
  const t = norm(parts.filter(Boolean).join(" | "));
  return `${t} ${t.split(" | ").map((x) => x.replace(/[^p{L}p{N}]/gu, "")).join(" ")}`;
};
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

type Index = (Omit<Group, "hits"> & { items: Hit[] })[];

// Everything on the site that can be searched, built from the API data.
const buildIndex = ({ books, classes, events, products }: Catalog): Index => [
  {
    key: "books", label: "Books", icon: BookOpen, all: "/catalogue",
    items: books.map((b) => ({
      href: `/catalogue/${b.id}`, title: b.title, ml: b.titleMl,
      sub: `${b.author} · ${b.category} · ${b.available > 0 ? `${b.available} on the shelf` : "All out, join the queue"}`,
      hay: hay([b.title, b.titleMl, b.author, b.category, b.language, b.shelf]),
    })),
  },
  {
    key: "classes", label: "Classes", icon: Palette, all: "/classes",
    items: classes.map((c) => ({
      href: `/classes/${c.id}`, title: c.title, ml: c.titleMl,
      sub: `${c.teacher} · ${c.schedule} · ${c.fee}`,
      hay: hay([c.title, c.titleMl, c.teacher, c.schedule, c.ages, c.fee]),
    })),
  },
  {
    key: "events", label: "Events", icon: CalendarDays, all: "/events",
    items: events.map((e) => ({
      href: `/events/${e.id}`, title: e.title, ml: e.titleMl,
      sub: `${fmtDate(e.date)} · ${e.time} · ${e.place}`,
      hay: hay([e.title, e.titleMl, e.kind, e.place, e.blurb]),
    })),
  },
  {
    key: "vipani", label: "Naattu Vipani", icon: ShoppingBasket, all: "/vipani",
    items: products.map((p) => ({
      href: `/vipani/${p.id}`, title: p.name, ml: p.nameMl,
      sub: `${p.seller} · ${p.auction ? `Bid ₹${p.auction.currentBid}` : `₹${p.price} / ${p.unit}`}`,
      hay: hay([p.name, p.nameMl, p.seller, p.auction ? "auction bid" : "buy order"]),
    })),
  },
];

const popular = ["ONV", "Basheer", "Novel", "Yoga", "Eye camp", "Coconut oil"];

function search(index: Index, q: string): Group[] {
  const words = norm(q).trim().split(/\s+/).filter(Boolean);
  return index.map(({ items, ...g }) => ({
    ...g,
    hits: words.length ? items.filter((h) => words.every((w) => h.hay.includes(w))) : [],
  })).filter((g) => g.hits.length);
}

/** Up to 6 hits per group, each group knowing where its first hit sits in the flat list. */
function limit(groups: Group[]) {
  const out: (Group & { start: number; shown: Hit[] })[] = [];
  let at = 0;
  for (const g of groups) { const hits = g.hits.slice(0, 6); out.push({ ...g, start: at, shown: hits }); at += hits.length; }
  return out;
}

function Mark({ text, q }: { text: string; q: string }) {
  const w = norm(q).trim().split(/\s+/).filter(Boolean)[0];
  const i = w ? norm(text).indexOf(w) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark className="rounded-sm bg-kani-50 text-ink">{text.slice(i, i + w.length)}</mark>{text.slice(i + w.length)}</>;
}

/** Search button for the header plus the full-screen search it opens (also on Ctrl/⌘ K and "/"). */
export function SearchButton({ className = "", label }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // The header and the desktop sidebar each have a button; only the visible one answers the shortcut.
      if (!btn.current?.offsetParent) return;
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        ref={btn}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search books, classes, events and the market (Ctrl K)"
        title="Search (Ctrl K)"
        aria-haspopup="dialog"
        className={`group flex h-11 items-center gap-2 rounded-full text-ink transition-colors hover:bg-ink/5 ${className}`}
      >
        <Search size={label ? 18 : 21} strokeWidth={2} />
        {label && <span className="flex-1 text-left">{label}</span>}
        {label && <kbd className="rounded-md bg-card px-1.5 py-0.5 font-sans text-[11.5px] text-muted ring-1 ring-line">Ctrl K</kbd>}
      </button>
      {/* Mounted on <body>: the header's blur would otherwise trap the fixed overlay inside it. */}
      {open && createPortal(<SearchDialog onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function SearchDialog({ onClose, initial = "" }: { onClose: () => void; initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const { data } = useCatalog();
  const index = useMemo(() => buildIndex(data ?? { books: [], classes: [], events: [], products: [] }), [data]);
  const groups = useMemo(() => search(index, q), [index, q]);
  // Show up to 6 per group; arrow keys move through exactly what is shown.
  const shown = useMemo(() => limit(groups), [groups]);
  const flat = useMemo(() => shown.flatMap((g) => g.shown), [shown]);
  const total = flat.length;

  useEffect(() => {
    input.current?.focus();
    // Lock page scroll. If that makes the page wider (the scrollbar went away), pad by exactly
    // that much so nothing shifts sideways. Browsers that keep the gutter need no padding.
    const root = document.documentElement;
    const prev = { overflow: root.style.overflow, pad: root.style.paddingRight };
    const before = root.getBoundingClientRect().width;
    root.style.overflow = "hidden";
    const grew = root.getBoundingClientRect().width - before;
    if (grew > 0.5) root.style.paddingRight = `${grew}px`;
    return () => { root.style.overflow = prev.overflow; root.style.paddingRight = prev.pad; };
  }, []);

  useEffect(() => {
    list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (href: string) => { onClose(); router.push(href); };

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") { e.preventDefault(); onClose(); }
    else if (e.key === "ArrowDown" && total) { e.preventDefault(); setActive((a) => (a + 1) % total); }
    else if (e.key === "ArrowUp" && total) { e.preventDefault(); setActive((a) => (a - 1 + total) % total); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (flat[active]) go(flat[active].href);
      else if (q.trim()) go(`/catalogue?q=${encodeURIComponent(q.trim())}`);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-3 pt-[max(12px,8vh)] sm:px-5" onKeyDown={onKey}>
      <button type="button" aria-label="Close search" tabIndex={-1} onClick={onClose} className="absolute inset-0 animate-[fade-in_.2s_ease-out] cursor-default bg-ink/35 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the library"
        className="relative flex max-h-[min(640px,84svh)] w-full max-w-2xl animate-[pop-in_.22s_cubic-bezier(0.2,0.9,0.3,1.1)] flex-col overflow-hidden rounded-[28px] bg-card shadow-[0_30px_80px_-20px_rgb(35_27_22/0.5)] ring-1 ring-line"
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search size={21} className="shrink-0 text-royal" />
          <input
            ref={input}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            role="combobox"
            aria-expanded={total > 0}
            aria-controls="search-results"
            aria-activedescendant={total ? `hit-${active}` : undefined}
            placeholder="Books, authors, classes, events, market…"
            className="search-bare h-16 min-w-0 flex-1 bg-transparent text-[18px] text-ink placeholder:text-muted"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink">
            <X size={19} />
          </button>
        </div>

        <div ref={list} id="search-results" role="listbox" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3">
          {!q.trim() && (
            <div className="p-3">
              <p className="text-[12px] font-semibold tracking-[0.16em] text-muted uppercase">Try</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {popular.map((s) => (
                  <button key={s} type="button" onClick={() => { setQ(s); input.current?.focus(); }} className="rounded-full bg-mist px-3.5 py-1.5 text-[14px] font-medium text-ink-2 ring-1 ring-line transition-colors hover:bg-royal hover:text-mist hover:ring-royal">
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {index.map((g) => (
                  <Link key={g.key} href={g.all} onClick={onClose} className="flex items-center gap-2.5 rounded-2xl bg-mist-2/60 p-3 text-[14px] font-semibold text-ink-2 transition-colors hover:bg-royal-50 hover:text-royal">
                    <g.icon size={18} className="text-royal" /> {g.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {q.trim() && !total && (
            <div className="px-4 py-12 text-center">
              <p className="font-display text-xl font-bold text-ink">Nothing found for “{q.trim()}”</p>
              <p className="mt-1 text-[15px] text-muted">Try an author&apos;s name, a class or a word in Malayalam.</p>
            </div>
          )}

          {shown.map((g) => (
            <section key={g.key} className="mb-2" aria-label={g.label}>
              <div className="flex items-center justify-between px-3 pt-2 pb-1.5">
                <h3 className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.16em] text-muted uppercase">
                  <g.icon size={14} className="text-royal" /> {g.label} <span className="font-mono tracking-normal">{g.hits.length}</span>
                </h3>
                <Link href={g.key === "books" ? `/catalogue?q=${encodeURIComponent(q.trim())}` : g.all} onClick={onClose} className="text-[13px] font-semibold text-royal hover:underline">
                  See all
                </Link>
              </div>
              <ul>
                {g.shown.map((h, j) => {
                  const i = g.start + j, on = i === active;
                  return (
                    <li key={h.href}>
                      <Link
                        id={`hit-${i}`}
                        data-i={i}
                        role="option"
                        aria-selected={on}
                        href={h.href}
                        onClick={onClose}
                        onMouseMove={() => setActive(i)}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${on ? "bg-royal text-mist" : "text-ink hover:bg-mist"}`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[16px] font-semibold"><Mark text={h.title} q={q} />{h.ml && <span className={`ml-2 font-ml text-[14px] font-medium ${on ? "text-mist/75" : "text-muted"}`}>{h.ml}</span>}</span>
                          <span className={`block truncate text-[13.5px] ${on ? "text-mist/75" : "text-muted"}`}>{h.sub}</span>
                        </span>
                        {on ? <CornerDownLeft size={16} className="shrink-0" /> : <ArrowRight size={16} className="shrink-0 text-muted" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <div className="hidden items-center gap-4 border-t border-line bg-mist/60 px-5 py-2.5 text-[12px] text-muted sm:flex">
          <span><kbd className="font-sans font-semibold">↑ ↓</kbd> to move</span>
          <span><kbd className="font-sans font-semibold">Enter</kbd> to open</span>
          <span><kbd className="font-sans font-semibold">Esc</kbd> to close</span>
          {total > 0 && <span className="ml-auto">{total} result{total === 1 ? "" : "s"}</span>}
        </div>
      </div>
    </div>
  );
}
