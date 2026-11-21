"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownUp, Check, ChevronDown, RotateCcw, Search, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCatalog } from "@/lib/api";
import { DoodleArt } from "./Scene";
import { ClassCard, EventCard, ProductCard, kindLabel } from "./ui";

/** Ignore case, spaces and punctuation, so "onv" matches "O. N. V. Kurup". */
export const norm = (s: string) => s.toLowerCase().replace(/[\s.,'’&\-·/()]/g, "");
export const matches = (term: string, fields: (string | undefined)[]) => !term || fields.some((f) => f && norm(f).includes(term));

export type FilterGroup = { label: string; options: string[]; value: string; set: (v: string) => void; all?: string };

/**
 * Search, sort and filter in one floating panel that overlaps the bottom of the page banner.
 * The search field is a single pill: no inner box, no browser clear button.
 */
export function Toolbar({
  q, setQ, placeholder, sorts, sort, setSort, filters = [], count, total, noun, onReset,
}: {
  q: string; setQ: (v: string) => void; placeholder: string;
  sorts: string[]; sort: string; setSort: (v: string) => void;
  filters?: FilterGroup[]; count: number; total: number; noun: string; onReset: () => void;
}) {
  const dirty = q !== "" || filters.some((f) => f.value !== (f.all ?? "All")) || sort !== sorts[0];
  const inputRef = useRef<HTMLInputElement>(null);
  // Phones: focusing search lifts the bar to the top and hides banner + nav, so results show above the keyboard.
  const [mode, setMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("search-mode", mode);
    if (mode) window.scrollTo({ top: 0, behavior: "instant" });
    return () => root.classList.remove("search-mode");
  }, [mode]);

  useEffect(() => {
    if (!mode) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") exit(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const enter = () => { if (!mode && window.matchMedia("(max-width: 639px)").matches) setMode(true); };
  const exit = () => { setMode(false); inputRef.current?.blur(); };

  return (
    <div
      className={`relative z-20 mx-auto max-w-6xl px-3 sm:mt-7 sm:px-5 ${
        mode ? "sticky top-0 z-40 bg-mist/95 pt-[max(10px,env(safe-area-inset-top))] pb-1 backdrop-blur-xl" : "mt-3"
      }`}
    >
      <div className={`rounded-[22px] bg-card/95 p-2 ring-1 ring-line/80 backdrop-blur-xl sm:rounded-[26px] sm:p-3 ${mode ? "" : "shadow-[0_20px_50px_-24px_rgb(42_29_32/0.4)]"}`}>
        <div className="flex items-center gap-2">
          <label className="group flex h-11 min-w-0 flex-1 cursor-text items-center gap-2.5 rounded-full bg-mist px-3.5 ring-2 ring-transparent transition-all focus-within:bg-card focus-within:ring-royal sm:h-[52px] sm:px-4">
            <Search size={19} className="shrink-0 text-muted transition-colors group-focus-within:text-royal" />
            <span className="sr-only">{placeholder}</span>
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              value={q}
              onFocus={enter}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
              placeholder={placeholder}
              className="search-bare h-full min-w-0 flex-1 text-[16px] placeholder:text-muted sm:text-[16.5px]"
            />
            {q && (
              <button type="button" onClick={() => { setQ(""); inputRef.current?.focus(); }} aria-label="Clear search" className="-mr-1.5 grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-mist-2 hover:text-ink">
                <X size={17} />
              </button>
            )}
          </label>

          {mode ? (
            <button type="button" onClick={exit} className="shrink-0 rounded-full px-2.5 py-2 text-[15px] font-semibold text-royal">Done</button>
          ) : (
            <SortMenu sorts={sorts} sort={sort} setSort={setSort} />
          )}
        </div>

        {filters.length > 0 && (
          <div className="no-scrollbar -mx-2 mt-2 flex items-center gap-1.5 overflow-x-auto px-2 sm:-mx-3 sm:mt-2.5 sm:gap-2 sm:px-3">
            {filters.map((g, gi) => (
              <div key={g.label} role="group" aria-label={g.label} className="flex shrink-0 items-center gap-1.5">
                {gi > 0 && <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-line sm:mx-1 sm:h-6" />}
                {[g.all ?? "All", ...g.options].map((o) => {
                  const on = g.value === o;
                  return (
                    <button key={o} type="button" aria-pressed={on} onClick={() => g.set(on && o !== (g.all ?? "All") ? (g.all ?? "All") : o)}
                      className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-medium transition-colors sm:px-3.5 sm:py-1.5 sm:text-[14.5px] ${on ? "bg-royal text-mist" : "bg-mist text-ink-2 hover:bg-mist-2"}`}>
                      {o === (g.all ?? "All") ? `All ${g.label.toLowerCase()}` : o}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-2 flex min-h-7 items-center justify-between gap-3 px-2 text-[13.5px] text-muted sm:mt-3 sm:min-h-8 sm:text-[14.5px]" aria-live="polite">
        <span>{count === total ? `${total} ${noun}` : `${count} of ${total} ${noun}`}</span>
        {dirty && (
          <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-semibold text-teal hover:text-teal-700">
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </div>
    </div>
  );
}

/** Sort picker: a pill button that opens a small card menu (no native dropdown). */
function SortMenu({ sorts, sort, setSort }: { sorts: string[]; sort: string; setSort: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const changed = sort !== sorts[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    wrap.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const move = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = [...(wrap.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
  };

  return (
    <div ref={wrap} className="relative shrink-0">
      <button
        ref={btn} type="button" aria-haspopup="menu" aria-expanded={open} aria-label={`Sort: ${sort}`} onClick={() => setOpen((o) => !o)}
        className={`relative flex h-11 items-center justify-center gap-2 rounded-full ring-2 ring-transparent transition-all focus-visible:ring-royal focus-visible:outline-none max-sm:w-11 sm:h-[52px] sm:pr-4 sm:pl-4 ${
          open ? "bg-royal text-mist" : "bg-mist text-ink hover:bg-mist-2"
        }`}
      >
        <ArrowDownUp size={17} className={open ? "" : "text-ink-2"} />
        <span className="hidden text-[15.5px] font-medium sm:inline">{sort}</span>
        <ChevronDown size={17} className={`hidden transition-transform sm:block ${open ? "rotate-180" : "text-muted"}`} />
        {changed && !open && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-kani ring-2 ring-card sm:hidden" />}
      </button>
      {open && (
        <div role="menu" aria-label="Sort by" onKeyDown={move}
          className="absolute top-full right-0 z-50 mt-2 w-60 origin-top-right animate-[pop-in_.18s_cubic-bezier(0.2,0.9,0.3,1.1)] rounded-[22px] bg-card p-1.5 shadow-[0_24px_60px_-18px_rgb(35_27_22/0.45)] ring-1 ring-line">
          <p className="px-3 pt-2 pb-1.5 text-[11.5px] font-semibold tracking-[0.14em] text-muted uppercase">Sort by</p>
          {sorts.map((s) => {
            const on = s === sort;
            return (
              <button key={s} type="button" role="menuitemradio" aria-checked={on} onClick={() => { setSort(s); setOpen(false); btn.current?.focus(); }}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left text-[15px] transition-colors focus-visible:outline-none ${
                  on ? "bg-royal-50 font-semibold text-royal" : "text-ink-2 hover:bg-mist focus-visible:bg-mist"
                }`}>
                {s}
                {on && <Check size={17} strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Birds crossing a soft sky above the doodle, each flock on its own height, size and pace. */
const FLOCKS = [
  { top: "6%", w: "w-16", dur: "15s", delay: "0s" },
  { top: "22%", w: "w-10", dur: "21s", delay: "-7s" },
  { top: "2%", w: "w-8", dur: "26s", delay: "-15s" },
];

/** Painted "nothing here" state: birds flying over a doodle, a Malayalam line, and a way out. */
export function EmptyState({ title, ml, text, art = "uruli", onReset, resetLabel = "Clear search and filters" }: {
  title: string; ml: string; text: string; art?: Parameters<typeof DoodleArt>[0]["d"]; onReset?: () => void; resetLabel?: string;
}) {
  return (
    <div className="sheet-up mx-auto flex max-w-md flex-col items-center px-4 py-10 text-center sm:py-14">
      <div
        aria-hidden="true"
        className="@container relative h-48 w-full overflow-hidden sm:h-56"
        style={{ maskImage: "linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)" }}
      >
        {FLOCKS.map((f, i) => (
          <div key={i} className="fly-across absolute left-0" style={{ top: f.top, ["--dur" as string]: f.dur, ["--delay" as string]: f.delay, ["--span" as string]: "100cqw" }}>
            <DoodleArt d="birds" className={`fly-bob ${f.w} opacity-80`} />
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-3 flex flex-col items-center">
          <DoodleArt d={art} className="float-a relative w-36 sm:w-40" />
          <div className="mt-1 h-3 w-32 rounded-[50%] bg-ink/10 blur-[3px]" />
        </div>
      </div>
      <p className="mt-6 font-ml text-[17px] text-muted">{ml}</p>
      <h3 className="mt-1 font-display text-2xl font-bold text-balance">{title}</h3>
      <p className="mt-2 text-[15.5px] leading-relaxed text-ink-2">{text}</p>
      {onReset && (
        <button onClick={onReset} className="mt-5 inline-flex items-center gap-2 rounded-full bg-royal px-5 py-3 text-[15.5px] font-semibold text-mist transition-colors hover:bg-royal-700">
          <RotateCcw size={16} /> {resetLabel}
        </button>
      )}
    </div>
  );
}

/** Results area keeps a sensible height even when empty, so the footer never rides up the page. */
export function Results({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-[48svh] max-w-6xl px-4 pt-2 sm:px-5">{children}</div>;
}

/** "6 – 16" → [6, 16], "8+" → [8, 99], "All ages" → [0, 99] */
const ageRange = (a: string): [number, number] => {
  const n = a.match(/\d+/g)?.map(Number) ?? [];
  return [n[0] ?? 0, n[1] ?? 99];
};
const feeNum = (f: string) => (f === "Free" ? 0 : Number(f.replace(/\D/g, "")) || 0);

/* ───────── Classes ───────── */

const NONE: never[] = [];

/** Placeholder cards while the list loads from the API. */
export function ListSkeleton({ rows }: { rows?: boolean }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: 6 }, (_, i) => <div key={i} className={`animate-pulse rounded-3xl bg-mist-2 ${rows ? "h-28" : "h-64"}`} />)}
    </div>
  );
}

export function ClassesBrowser() {
  const { data, loading } = useCatalog();
  const classes = data?.classes ?? NONE;
  const sorts = ["Recommended", "Fewest seats left", "Fee: low to high", "A to Z"];
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(sorts[0]);
  const [fee, setFee] = useState("All");
  const [age, setAge] = useState("All");
  const reset = () => { setQ(""); setSort(sorts[0]); setFee("All"); setAge("All"); };
  const list = useMemo(() => {
    const t = norm(q);
    const r = classes.filter((c) =>
      matches(t, [c.title, c.titleMl, c.teacher, c.schedule]) &&
      (fee === "All" || (fee === "Free" ? c.fee === "Free" : c.fee !== "Free")) &&
      (age === "All" || (age === "Children" ? ageRange(c.ages)[0] < 12 : ageRange(c.ages)[1] >= 18)),
    );
    if (sort === "Fewest seats left") r.sort((a, b) => a.seatsLeft - b.seatsLeft);
    if (sort === "Fee: low to high") r.sort((a, b) => feeNum(a.fee) - feeNum(b.fee));
    if (sort === "A to Z") r.sort((a, b) => a.title.localeCompare(b.title));
    return r;
  }, [classes, q, sort, fee, age]);
  return (
    <>
      <Toolbar q={q} setQ={setQ} placeholder="Class, teacher or day" sorts={sorts} sort={sort} setSort={setSort} count={list.length} total={classes.length} noun="classes" onReset={reset}
        filters={[{ label: "Fees", options: ["Free", "Paid"], value: fee, set: setFee }, { label: "Ages", options: ["Children", "Adults"], value: age, set: setAge }]} />
      <Results>
        {loading ? <ListSkeleton /> : list.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((c) => <ClassCard key={c.id} c={c} />)}</div>
        ) : (
          <EmptyState art="kathakali" ml="ക്ലാസ് കണ്ടെത്താനായില്ല" title="No classes match" text="Try another day or teacher, or clear the filters. You can also suggest a class at the desk." onReset={reset} />
        )}
      </Results>
    </>
  );
}

/* ───────── Events ───────── */

export function EventsBrowser() {
  const { data, loading } = useCatalog();
  const events = data?.events ?? NONE;
  const sorts = ["Soonest first", "Latest first", "A to Z"];
  const kinds = Array.from(new Set(events.map((e) => kindLabel(e.kind))));
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(sorts[0]);
  const [kind, setKind] = useState("All");
  const reset = () => { setQ(""); setSort(sorts[0]); setKind("All"); };
  const list = useMemo(() => {
    const t = norm(q);
    const r = events.filter((e) => matches(t, [e.title, e.titleMl, e.place, e.blurb]) && (kind === "All" || kindLabel(e.kind) === kind));
    if (sort === "Soonest first") r.sort((a, b) => a.date.localeCompare(b.date));
    if (sort === "Latest first") r.sort((a, b) => b.date.localeCompare(a.date));
    if (sort === "A to Z") r.sort((a, b) => a.title.localeCompare(b.title));
    return r;
  }, [events, q, sort, kind]);
  return (
    <>
      <Toolbar q={q} setQ={setQ} placeholder="Camp, check-up or place" sorts={sorts} sort={sort} setSort={setSort} count={list.length} total={events.length} noun="events" onReset={reset}
        filters={[{ label: "Types", options: kinds, value: kind, set: setKind }]} />
      <Results>
        {loading ? <ListSkeleton /> : list.length ? (
          <div className="grid gap-5 lg:grid-cols-2">{list.map((e, i) => <EventCard key={e.id} e={e} highlight={i === 0 && sort === sorts[0]} />)}</div>
        ) : (
          <EmptyState art="theyyam" ml="ഇപ്പോൾ പരിപാടികളൊന്നുമില്ല" title="No events match" text="Nothing on for that search right now. New camps and evenings are added every month." onReset={reset} />
        )}
      </Results>
    </>
  );
}

/* ───────── Vipani ───────── */

export function VipaniBrowser() {
  const { data, loading } = useCatalog();
  const products = data?.products ?? NONE;
  const sorts = ["Auctions first", "Price: low to high", "Price: high to low", "Ending soonest"];
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(sorts[0]);
  const [type, setType] = useState("All");
  const reset = () => { setQ(""); setSort(sorts[0]); setType("All"); };
  const price = (p: Product) => p.auction?.currentBid ?? p.price;
  const list = useMemo(() => {
    const t = norm(q);
    const r = products.filter((p) => matches(t, [p.name, p.nameMl, p.seller]) && (type === "All" || (type === "Auctions" ? !!p.auction : !p.auction)));
    if (sort === "Auctions first") r.sort((a, b) => Number(!!b.auction) - Number(!!a.auction));
    if (sort === "Price: low to high") r.sort((a, b) => price(a) - price(b));
    if (sort === "Price: high to low") r.sort((a, b) => price(b) - price(a));
    if (sort === "Ending soonest") r.sort((a, b) => (a.auction?.endsAt ?? "9").localeCompare(b.auction?.endsAt ?? "9"));
    return r;
  }, [products, q, sort, type]);
  return (
    <>
      <Toolbar q={q} setQ={setQ} placeholder="Product or seller" sorts={sorts} sort={sort} setSort={setSort} count={list.length} total={products.length} noun="products" onReset={reset}
        filters={[{ label: "Listings", options: ["Auctions", "Fixed price"], value: type, set: setType }]} />
      <Results>
        {loading ? <ListSkeleton /> : list.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        ) : (
          <EmptyState art="uruli" ml="ഈ ഉൽപന്നം ഇപ്പോൾ ലഭ്യമല്ല" title="Nothing on the stall" text="We couldn't find that product. Sellers bring fresh stock every market day, so check back on Saturday." onReset={reset} />
        )}
      </Results>
    </>
  );
}
