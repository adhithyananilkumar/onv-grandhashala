import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3, Gavel, MapPin, UserRound } from "lucide-react";
import type { Book, ClassItem, EventItem, Product } from "@/lib/data";
import { Countdown } from "./Countdown";
import { InkWash } from "./Art";

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-muted uppercase ${className}`}>
      <span className="h-px w-6 bg-current opacity-50" />
      {children}
    </p>
  );
}

export function SectionHead({ index, eyebrow, title, ml, href, cta }: { index?: string; eyebrow: string; title: React.ReactNode; ml?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Eyebrow>{index ? `${index} · ${eyebrow}` : eyebrow}</Eyebrow>
        <h2 className="mt-3 font-serif text-[2.35rem] leading-[1.02] tracking-tight sm:text-5xl">{title}</h2>
        {ml && <p className="mt-2 font-ml text-[15px] text-muted">{ml}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-ink/25 px-4 py-2 text-sm transition hover:border-ink hover:bg-ink hover:text-paper">
          {cta ?? "View all"}
          <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function PageHero({ eyebrow, title, ml, children }: { eyebrow: string; title: React.ReactNode; ml: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden px-4 pt-14 pb-10 text-center sm:pt-20">
      <InkWash className="pointer-events-none absolute top-6 left-1/2 h-56 w-[min(900px,140%)] -translate-x-1/2 opacity-60" />
      <div className="relative mx-auto max-w-3xl animate-rise">
        <Eyebrow className="justify-center">{eyebrow}</Eyebrow>
        <h1 className="mt-4 font-serif text-5xl leading-[0.98] tracking-tight sm:text-7xl">{title}</h1>
        <p className="mt-3 font-ml-serif text-lg text-ink-2">{ml}</p>
        {children}
      </div>
    </section>
  );
}

export function Stamp({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-block -rotate-[7deg] rounded-[4px] border-2 px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-[0.14em] uppercase outline outline-1 outline-offset-2 ${
        ok ? "border-wash text-wash outline-wash/50" : "border-clay text-clay outline-clay/50"
      }`}
    >
      {children}
    </span>
  );
}

/** A book as a library catalogue card: call number, red rule, ruled lines, punched hole. */
export function BookCard({ book, reserved, className = "" }: { book: Book; reserved?: boolean; className?: string }) {
  return (
    <div className={`ruled relative flex h-full flex-col rounded-md border border-line bg-card px-4 pt-3 pb-6 shadow-soft ${className}`}>
      <div className="flex items-center justify-between font-mono text-[10.5px] tracking-wider text-muted uppercase">
        <span>{book.shelf} · {book.category}</span>
        <span>{book.language === "Malayalam" ? "മല" : "EN"}</span>
      </div>
      <div className="mt-2 h-px bg-clay/60" />
      <div className="mt-3 flex-1">
        {book.titleMl ? (
          <>
            <p className="font-ml-serif text-[19px] leading-snug font-semibold">{book.titleMl}</p>
            <p className="font-serif text-[15px] text-ink-2 italic">{book.title}</p>
          </>
        ) : (
          <p className="font-serif text-[22px] leading-tight">{book.title}</p>
        )}
        <p className="mt-2 font-mono text-[11.5px] text-muted">{book.author}</p>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span className="font-mono text-[10.5px] text-muted">{book.available}/{book.copies} copies</span>
        {reserved ? <Stamp ok>Reserved</Stamp> : <Stamp ok={book.available > 0}>{book.available > 0 ? "On shelf" : "On loan"}</Stamp>}
      </div>
      <span aria-hidden="true" className="absolute bottom-1.5 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-paper-2 shadow-[inset_0_1px_2px_rgb(0_0_0/0.25)]" />
    </div>
  );
}

export function ClassRow({ c, n }: { c: ClassItem; n: number }) {
  return (
    <article className="group grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 border-t border-line py-6 md:grid-cols-[3rem_1.4fr_1fr_8rem_auto] md:items-center md:gap-6">
      <span className="font-mono text-xs text-muted md:pt-1">{String(n).padStart(2, "0")}</span>
      <div>
        <h3 className="font-serif text-[1.7rem] leading-none transition group-hover:italic">{c.title}</h3>
        <p className="mt-1.5 font-ml text-sm text-muted">{c.titleMl}</p>
      </div>
      <dl className="col-start-2 space-y-1 text-[13.5px] text-ink-2 md:col-start-auto">
        <div className="flex items-center gap-2"><Clock3 size={14} className="text-muted" /><dd className="font-mono text-[12.5px]">{c.schedule}</dd></div>
        <div className="flex items-center gap-2"><UserRound size={14} className="text-muted" /><dd>{c.teacher} · {c.ages}</dd></div>
      </dl>
      <div className="col-start-2 md:col-start-auto">
        <p className="font-serif text-xl">{c.fee}</p>
        <p className={`font-mono text-[11px] ${c.seatsLeft <= 3 ? "text-clay" : "text-muted"}`}>{c.seatsLeft} seats left</p>
      </div>
      <button className="col-start-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition hover:bg-clay md:col-start-auto">
        Enrol <ArrowUpRight size={15} />
      </button>
    </article>
  );
}

/** An event as a ticket: date stub, perforation, details. */
export function EventTicket({ e }: { e: EventItem }) {
  const d = new Date(e.date + "T00:00:00+05:30");
  const fmt = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-IN", { ...o, timeZone: "Asia/Kolkata" });
  const health = e.kind === "Health";
  return (
    <article className="relative flex overflow-hidden rounded-2xl border border-line bg-card shadow-soft">
      <div className={`flex w-[5.5rem] shrink-0 flex-col items-center justify-center py-5 ${health ? "bg-clay-50" : "bg-wash-50"}`}>
        <span className="font-mono text-[10.5px] tracking-[0.2em] text-muted uppercase">{fmt({ weekday: "short" })}</span>
        <span className="font-serif text-5xl leading-none">{fmt({ day: "numeric" })}</span>
        <span className="mt-1 font-mono text-[11px] tracking-[0.2em] uppercase">{fmt({ month: "short" })}</span>
      </div>
      <div className="relative w-0 border-l border-dashed border-line">
        <span className="absolute -top-2 -left-2 size-4 rounded-full border border-line bg-paper" />
        <span className="absolute -bottom-2 -left-2 size-4 rounded-full border border-line bg-paper" />
      </div>
      <div className="min-w-0 flex-1 p-5">
        <p className={`font-mono text-[10.5px] tracking-[0.2em] uppercase ${health ? "text-clay" : "text-wash"}`}>{e.kind}</p>
        <h3 className="mt-1.5 font-serif text-[1.55rem] leading-[1.08]">{e.title}</h3>
        <p className="mt-1 font-ml text-sm text-muted">{e.titleMl}</p>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{e.blurb}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1 font-mono text-[11.5px] text-muted">
            <span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{e.time}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={13} />{e.place}</span>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-full border border-ink/25 px-4 py-2 text-sm transition hover:border-ink hover:bg-ink hover:text-paper">
            Register <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

const tagTones = ["bg-wash-50", "bg-clay-50", "bg-paper-2"];

export function ProductCard({ p, i = 0 }: { p: Product; i?: number }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-soft">
      <div className={`hatch relative grid aspect-[16/10] place-items-center ${tagTones[i % tagTones.length]}`}>
        <span className="px-6 text-center font-ml-serif text-[1.65rem] leading-tight font-bold text-ink/85 transition duration-500 group-hover:scale-105">
          {p.nameMl}
        </span>
        {p.auction && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] text-paper uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-clay" /> Live · ലേലം
          </span>
        )}
        <span className="absolute right-3 bottom-3 font-mono text-[10px] tracking-wider text-muted uppercase">{p.unit}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] leading-snug font-medium">{p.name}</h3>
        <p className="mt-0.5 font-mono text-[11px] text-muted">by {p.seller}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          {p.auction ? (
            <div>
              <p className="font-mono text-[10px] tracking-wider text-muted uppercase">Bid · {p.auction.bids} so far</p>
              <p className="font-serif text-3xl leading-none">₹{p.auction.currentBid.toLocaleString("en-IN")}</p>
              <Countdown to={p.auction.endsAt} />
            </div>
          ) : (
            <p className="font-serif text-3xl leading-none">₹{p.price}</p>
          )}
          <button className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm transition ${p.auction ? "bg-clay text-paper hover:bg-clay-700" : "bg-ink text-paper hover:bg-ink-2"}`}>
            {p.auction ? <><Gavel size={15} /> Bid</> : "Order"}
          </button>
        </div>
      </div>
    </article>
  );
}
