import Link from "next/link";
import { Clock3, Gavel, MapPin, UserRound } from "lucide-react";
import type { Book, ClassItem, EventItem, Product } from "@/lib/data";
import { Countdown } from "./Countdown";

export function SectionHead({ title, ml, href, cta }: { title: string; ml?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        <h2 className="font-display text-[1.75rem] leading-tight font-bold tracking-[-0.02em] sm:text-4xl">{title}</h2>
        {ml && <p className="mt-1 font-ml text-[15px] text-muted sm:text-base">{ml}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 rounded-full px-3 py-2 text-[15px] font-semibold text-teal underline decoration-teal/30 decoration-2 underline-offset-4 transition-colors hover:decoration-teal">
          {cta ?? "See all"}
        </Link>
      )}
    </div>
  );
}

export function PageHero({ title, ml, children }: { title: string; ml: string; children?: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-8 pb-8 sm:pt-14 sm:pb-12">
      <h1 className="font-display text-[2.4rem] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-6xl">{title}</h1>
      <p className="mt-2 font-ml text-lg text-ink-2 sm:text-xl">{ml}</p>
      {children}
    </section>
  );
}

const COVERS = ["#1c1f4a", "#0b6e69", "#8a3219", "#2f5d3a", "#5b2a4e", "#7a5a12"];

/** Generated cover: colour from a fixed set, kasavu double rule, Malayalam title. Replace with real cover photos later. */
export function BookCover({ book, className = "", size = "md" }: { book: Book; className?: string; size?: "sm" | "md" }) {
  const bg = COVERS[(parseInt(book.id.replace(/\D/g, ""), 10) || book.hue) % COVERS.length];
  const sm = size === "sm";
  return (
    <div
      className={`relative flex aspect-[2/3] flex-col overflow-hidden rounded-[6px_12px_12px_6px] text-white shadow-lift ${sm ? "p-2" : "p-3.5"} ${className}`}
      style={{ backgroundColor: bg }}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/30 to-transparent" />
      <span aria-hidden="true" className={`block border-y-2 border-kani/90 ${sm ? "h-1" : "h-1.5"}`} />
      <p className={`mt-auto font-ml leading-[1.2] font-bold text-balance ${sm ? "text-[11px]" : "text-[19px]"}`}>{book.titleMl ?? book.title}</p>
      {!sm && <p className="mt-2 text-[12px] leading-snug text-white/80">{book.author}</p>}
      <span aria-hidden="true" className={`block bg-kani/90 ${sm ? "mt-1.5 h-0.5" : "mt-3 h-1"}`} />
    </div>
  );
}

export function Availability({ book, reserved, compact }: { book: Book; reserved?: boolean; compact?: boolean }) {
  if (reserved) {
    return <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-kani-700"><span className="size-2 rounded-full bg-kani" />Reserved for you</span>;
  }
  return book.available > 0 ? (
    <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-teal">
      <span className="size-2 rounded-full bg-teal" />{compact ? "Available" : `Available, ${book.available} of ${book.copies}`}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-laterite">
      <span className="size-2 rounded-full bg-laterite" />{compact ? "On loan" : "On loan, join the queue"}
    </span>
  );
}

/** Vertical card: cover on top, readable text below. Used in the carousel and the desktop grid. */
export function BookCard({ book, reserved }: { book: Book; reserved?: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <BookCover book={book} />
      <p className="mt-3 text-[16px] leading-snug font-semibold">{book.title}</p>
      <p className="text-[14px] text-muted">{book.author}</p>
      <div className="mt-1.5"><Availability book={book} reserved={reserved} compact /></div>
    </div>
  );
}

/** Horizontal card for phone lists: small cover, large readable text. */
export function BookRow({ book, reserved }: { book: Book; reserved?: boolean }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-card p-3 shadow-lift">
      <BookCover book={book} size="sm" className="w-[68px] shrink-0" />
      <div className="min-w-0 flex-1 py-0.5">
        {book.titleMl && <p className="font-ml text-[17px] leading-snug font-semibold">{book.titleMl}</p>}
        <p className={book.titleMl ? "text-[14px] text-ink-2" : "text-[17px] leading-snug font-semibold"}>{book.title}</p>
        <p className="text-[14px] text-muted">{book.author}</p>
        <p className="mt-0.5 text-[13px] text-muted">{book.category}, shelf {book.shelf}</p>
        <div className="mt-1.5"><Availability book={book} reserved={reserved} /></div>
      </div>
    </div>
  );
}

export function ClassCard({ c }: { c: ClassItem }) {
  const few = c.seatsLeft <= 3;
  return (
    <article className="flex flex-col rounded-2xl bg-card p-5 shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl leading-tight font-bold">{c.title}</h3>
          <p className="font-ml text-[15px] text-muted">{c.titleMl}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-semibold ${c.fee === "Free" ? "bg-teal-50 text-teal-700" : "bg-mist-2 text-ink"}`}>{c.fee}</span>
      </div>
      <dl className="mt-4 space-y-1.5 text-[15px] text-ink-2">
        <div className="flex items-center gap-2.5"><Clock3 size={17} className="shrink-0 text-muted" /><dd>{c.schedule}</dd></div>
        <div className="flex items-center gap-2.5"><UserRound size={17} className="shrink-0 text-muted" /><dd>{c.teacher}, ages {c.ages}</dd></div>
      </dl>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className={`text-[14px] font-medium ${few ? "text-laterite" : "text-muted"}`}>{few ? `Only ${c.seatsLeft} seats left` : `${c.seatsLeft} seats left`}</span>
        <button className="rounded-full bg-ink px-5 py-2.5 text-[15px] font-semibold text-mist transition-colors hover:bg-ink-2">Enrol</button>
      </div>
    </article>
  );
}

export function EventCard({ e, highlight }: { e: EventItem; highlight?: boolean }) {
  const d = new Date(e.date + "T00:00:00+05:30");
  const fmt = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-IN", { ...o, timeZone: "Asia/Kolkata" });
  return (
    <article className="flex gap-4 rounded-2xl bg-card p-4 shadow-lift sm:gap-5 sm:p-5">
      <div className={`flex h-[84px] w-[72px] shrink-0 flex-col items-center justify-center rounded-xl ${highlight ? "bg-kani text-ink" : "bg-mist-2 text-ink"}`}>
        <span className="text-[13px] font-medium">{fmt({ weekday: "short" })}</span>
        <span className="font-display text-[2rem] leading-none font-extrabold">{fmt({ day: "numeric" })}</span>
        <span className="text-[13px] font-semibold">{fmt({ month: "short" })}</span>
      </div>
      <div className="min-w-0 flex-1">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold ${e.kind === "Health" ? "bg-laterite-50 text-laterite-700" : "bg-teal-50 text-teal-700"}`}>
          {e.kind === "Health" ? "Health camp" : e.kind === "Camp" ? "Children's camp" : e.kind === "Literary" ? "Literature" : "Culture"}
        </span>
        <h3 className="mt-2 font-display text-[1.2rem] leading-snug font-bold sm:text-[1.3rem]">{e.title}</h3>
        <p className="font-ml text-[15px] text-muted">{e.titleMl}</p>
        <p className="mt-2 text-[15px] text-ink-2">{e.blurb}</p>
        <div className="mt-3 space-y-1 text-[14px] text-muted">
          <p className="flex items-center gap-2"><Clock3 size={16} className="shrink-0" />{e.time}</p>
          <p className="flex items-center gap-2"><MapPin size={16} className="shrink-0" />{e.place}</p>
        </div>
        <button className="mt-4 rounded-full border-2 border-ink px-5 py-2 text-[15px] font-semibold transition-colors hover:bg-ink hover:text-mist">
          Register
        </button>
      </div>
    </article>
  );
}

const TINTS = ["bg-teal-50", "bg-kani-50", "bg-laterite-50"];

export function ProductCard({ p, i = 0 }: { p: Product; i?: number }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-lift">
      <div className={`relative grid aspect-[16/9] place-items-center ${TINTS[i % TINTS.length]}`}>
        <span className="px-6 text-center font-ml text-[1.7rem] leading-tight font-bold text-ink">{p.nameMl}</span>
        {p.auction && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[13px] font-semibold text-mist">
            <span className="size-2 animate-pulse rounded-full bg-kani" /> Live auction
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-[16px] leading-snug font-semibold">{p.name}</h3>
        <p className="text-[14px] text-muted">{p.seller}, per {p.unit}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          {p.auction ? (
            <div>
              <p className="text-[13px] text-muted">Highest bid of {p.auction.bids}</p>
              <p className="font-display text-[1.75rem] leading-tight font-extrabold">₹{p.auction.currentBid.toLocaleString("en-IN")}</p>
              <Countdown to={p.auction.endsAt} />
            </div>
          ) : (
            <p className="font-display text-[1.75rem] leading-tight font-extrabold">₹{p.price}</p>
          )}
          <button className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-[15px] font-semibold transition-colors ${p.auction ? "bg-kani text-ink hover:brightness-95" : "bg-ink text-mist hover:bg-ink-2"}`}>
            {p.auction ? <><Gavel size={17} /> Place bid</> : "Order"}
          </button>
        </div>
      </div>
    </article>
  );
}
