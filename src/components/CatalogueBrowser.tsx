"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { Book } from "@/lib/data";
import { BookCard, Stamp } from "./ui";

export function CatalogueBrowser({ books }: { books: Book[] }) {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [lang, setLang] = useState("All");
  const [cat, setCat] = useState("All");
  const [picked, setPicked] = useState<Book | null>(null);
  const [reserved, setReserved] = useState<Set<string>>(new Set());

  const categories = useMemo(() => Array.from(new Set(books.map((b) => b.category))), [books]);
  const results = useMemo(() => {
    // Ignore spaces and punctuation so "onv" matches "O. N. V. Kurup"
    const norm = (s: string) => s.toLowerCase().replace(/[\s.,'’\-]/g, "");
    const term = norm(q);
    return books.filter(
      (b) =>
        (lang === "All" || b.language === lang) &&
        (cat === "All" || b.category === cat) &&
        (!term || [b.title, b.titleMl, b.author, b.category].some((f) => f && norm(f).includes(term))),
    );
  }, [books, q, lang, cat]);

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition ${active ? "border-ink bg-ink text-paper" : "border-line bg-card/70 text-ink-2 hover:border-ink/40"}`;

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="sticky top-[76px] z-30 -mx-4 px-4 pb-4">
        <div className="rounded-[26px] border border-line bg-card/85 p-2 shadow-float backdrop-blur-xl">
          <label className="flex items-center gap-2 px-3">
            <Search size={18} className="text-muted" />
            <span className="sr-only">Search the catalogue</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Title, author or subject · തലക്കെട്ട്, എഴുത്തുകാരൻ"
              className="h-12 min-w-0 flex-1 bg-transparent text-[16px] placeholder:text-muted focus:outline-none"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Clear search" className="grid size-8 place-items-center rounded-full hover:bg-paper-2">
                <X size={16} />
              </button>
            )}
          </label>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-1 pb-1">
            {["All", "Malayalam", "English"].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={chip(lang === l)}>{l}</button>
            ))}
            <span className="mx-1 w-px shrink-0 bg-line" />
            {categories.map((c) => (
              <button key={c} onClick={() => setCat(cat === c ? "All" : c)} className={chip(cat === c)}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-muted uppercase" aria-live="polite">
        {results.length} card{results.length === 1 ? "" : "s"} in the drawer
      </p>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((b) => (
          <li key={b.id}>
            <button onClick={() => setPicked(b)} className="block h-full w-full text-left transition hover:-translate-y-1">
              <BookCard book={b} reserved={reserved.has(b.id)} className="min-h-52" />
            </button>
          </li>
        ))}
      </ul>
      {results.length === 0 && (
        <div className="mt-6 rounded-3xl border border-dashed border-ink/25 p-10 text-center">
          <p className="font-serif text-3xl">No cards match.</p>
          <p className="mt-2 text-sm text-muted">Try another spelling, or suggest this book and we&apos;ll try to buy it.</p>
        </div>
      )}

      {picked && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center" onClick={() => setPicked(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={picked.title}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md animate-rise rounded-t-[28px] bg-paper p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[28px]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" />
            <BookCard book={picked} reserved={reserved.has(picked.id)} />
            <p className="mt-4 text-[14px] leading-relaxed text-ink-2">
              {picked.available > 0
                ? "We'll keep this book at the desk for 3 days. You'll get a WhatsApp message when it's ready."
                : "Every copy is out on loan. Join the queue and we'll message you when one comes back."}
            </p>
            <div className="mt-5 flex gap-2.5">
              <button onClick={() => setPicked(null)} className="flex-1 rounded-full border border-ink/25 py-3.5 text-sm">Close</button>
              <button
                onClick={() => { setReserved((s) => new Set(s).add(picked.id)); setPicked(null); }}
                className="flex-1 rounded-full bg-ink py-3.5 text-sm text-paper transition hover:bg-clay"
              >
                {picked.available > 0 ? "Reserve" : "Join the queue"}
              </button>
            </div>
            <p className="mt-3 flex items-center justify-center gap-2 font-mono text-[10.5px] text-muted">
              <Stamp ok>Demo</Stamp> real reservations arrive with member sign-in
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
