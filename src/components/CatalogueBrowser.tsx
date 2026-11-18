"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { Book } from "@/lib/data";
import { Availability, BookCover, BookRow } from "./ui";

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
    `shrink-0 rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${active ? "bg-royal text-mist" : "bg-card text-ink shadow-lift hover:bg-kani-50"}`;

  return (
    <div className="mx-auto max-w-6xl px-5">
      <div className="sticky top-[68px] z-30 -mx-5 bg-mist/95 px-5 pt-2 pb-3 backdrop-blur-md">
        <div className="flex items-center gap-2 rounded-full border-2 border-royal bg-card py-1.5 pr-1.5 pl-4 transition-shadow focus-within:shadow-[0_0_0_4px_var(--color-kani)]">
          <Search size={21} className="shrink-0" />
          <label htmlFor="cat-q" className="sr-only">Search by title, author or subject</label>
          <input
            id="cat-q"
            type="search"
            enterKeyHint="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Title, author or subject"
            className="h-11 min-w-0 flex-1 bg-transparent text-[17px] placeholder:text-muted focus:outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search" className="grid size-11 shrink-0 place-items-center rounded-full bg-mist-2 transition-colors hover:bg-line">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
          {["All", "Malayalam", "English"].map((l) => (
            <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={chip(lang === l)}>{l === "All" ? "All languages" : l}</button>
          ))}
          <span aria-hidden="true" className="mx-1 w-px shrink-0 bg-line" />
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(cat === c ? "All" : c)} aria-pressed={cat === c} className={chip(cat === c)}>{c}</button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[15px] text-muted" aria-live="polite">
        {results.length === books.length ? `${books.length} books` : `${results.length} of ${books.length} books match`}
      </p>

      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((b) => (
          <li key={b.id}>
            <button onClick={() => setPicked(b)} className="block w-full text-left transition-transform duration-150 active:scale-[0.99]">
              <BookRow book={b} reserved={reserved.has(b.id)} />
            </button>
          </li>
        ))}
      </ul>
      {results.length === 0 && (
        <div className="mt-4 rounded-2xl bg-card p-8 text-center shadow-lift">
          <p className="font-display text-xl font-bold">No books match “{q}”</p>
          <p className="mt-1 text-[15px] text-ink-2">Check the spelling, try the author&apos;s name, or clear the filters.</p>
          <button onClick={() => { setQ(""); setLang("All"); setCat("All"); }} className="mt-4 rounded-full bg-royal px-5 py-2.5 font-semibold text-mist">
            Clear search and filters
          </button>
        </div>
      )}

      {picked && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/50 sm:items-center" onClick={() => setPicked(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={picked.title}
            onClick={(e) => e.stopPropagation()}
            className="sheet-up w-full max-w-md rounded-t-[28px] bg-mist p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[28px] sm:p-6"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line sm:hidden" />
            <div className="flex gap-4">
              <BookCover book={picked} className="w-28 shrink-0" />
              <div className="min-w-0">
                {picked.titleMl && <p className="font-ml text-xl leading-snug font-bold">{picked.titleMl}</p>}
                <h2 className={picked.titleMl ? "text-[16px] text-ink-2" : "font-display text-xl font-bold"}>{picked.title}</h2>
                <p className="mt-1 text-[15px] text-muted">{picked.author}</p>
                <p className="text-[14px] text-muted">{picked.language}, shelf {picked.shelf}</p>
                <div className="mt-2"><Availability book={picked} reserved={reserved.has(picked.id)} /></div>
              </div>
            </div>
            <p className="mt-5 text-[16px] leading-relaxed text-ink-2">
              {picked.available > 0
                ? "We keep the book at the desk for 3 days and send you a WhatsApp message when it's ready to collect."
                : "All copies are out. Join the queue and we'll message you when one is returned."}
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setPicked(null)} className="flex-1 rounded-full border-2 border-royal py-3 text-[16px] font-semibold">Close</button>
              <button
                onClick={() => { setReserved((s) => new Set(s).add(picked.id)); setPicked(null); }}
                disabled={reserved.has(picked.id)}
                className="flex-1 rounded-full bg-royal py-3 text-[16px] font-semibold text-mist transition-colors hover:bg-royal-700 disabled:opacity-50"
              >
                {reserved.has(picked.id) ? "Reserved" : picked.available > 0 ? "Reserve" : "Join the queue"}
              </button>
            </div>
            <p className="mt-3 text-center text-[13px] text-muted">Preview only. Reservations start when member sign-in goes live.</p>
          </div>
        </div>
      )}
    </div>
  );
}
