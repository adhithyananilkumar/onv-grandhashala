import Link from "next/link";
import { ActionModal } from "./ActionModal";
import { ArrowLeft, ArrowRight, CalendarDays, CircleCheck, Clock3, Gavel, MapPin, UserRound, Users } from "lucide-react";
import type { Book, ClassItem, EventItem, Product } from "@/lib/data";
import { Countdown } from "./Countdown";
import { ArtTile, CoverArt, WashBanner, type Motif } from "./ArtKit";
import type { SceneSet } from "./Scene";
import { TONE } from "@/lib/format";

/** A signed-in member's own status on a card ("Enrolled", "On loan", "Leading"). */
export type Mine = { label: string; tone: string; note?: string };

const mineTone = (m: Mine) => TONE[m.tone] ?? TONE.muted;

/** Status badge that sits on a card's painted header, top right. */
function MineBadge({ mine }: { mine: Mine }) {
  return (
    <span className={`absolute top-3.5 right-3.5 z-[1] inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold shadow-lift ring-1 ring-white/70 ${mineTone(mine)}`}>
      <CircleCheck size={14} strokeWidth={2.4} /> {mine.label}
    </span>
  );
}

/** A card's tap target: a link to the public page, or a button when the card opens the member's own details. */
function Tap({ href, onOpen, className, children }: { href: string; onOpen?: () => void; className?: string; children: React.ReactNode }) {
  return onOpen
    ? <button type="button" onClick={onOpen} className={`text-left ${className ?? ""}`}>{children}</button>
    : <Link href={href} className={className}>{children}</Link>;
}

export function SectionHead({ title, ml, href, cta }: { title: string; ml?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3 sm:mb-8 sm:gap-4">
      <div className="min-w-0">
        <h2 className="font-display text-[1.6rem] leading-[1.15] font-bold tracking-[-0.02em] text-balance sm:text-4xl">{title}</h2>
        {ml && <p className="mt-1 font-ml text-[15px] text-muted sm:text-base">{ml}</p>}
      </div>
      {href && (
        <Link href={href} className="group -mr-3 -mb-2 inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold text-teal">
          {cta ?? "See all"} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** Centred page heading on a painted banner with Kerala doodles around it. */
/** `compact`: a slimmer banner for members, whose own items follow right below. */
export function PageHero({ title, ml, art = "books", compact, children }: { title: string; ml: string; art?: SceneSet; compact?: boolean; children?: React.ReactNode }) {
  return (
    <section data-hide-in-search className="px-3 pt-2 sm:px-5 sm:pt-3">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[22px] bg-card shadow-lift sm:rounded-[30px]">
        <WashBanner seed={`banner-${art}`} className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className={`relative z-[3] flex flex-col items-center justify-center px-5 py-5 text-center ${compact ? "sm:px-16 sm:py-6" : "sm:px-24 sm:py-10"}`}>
          <h1 className={`font-display text-[1.9rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance ${compact ? "sm:text-5xl" : "sm:text-6xl lg:text-[4.2rem]"}`}>{title}</h1>
          <p className="mt-1.5 font-ml text-[15px] text-ink-2 sm:mt-2 sm:text-xl">{ml}</p>
          {children && !compact && <div className="mx-auto mt-3 hidden max-w-xl text-[16px] leading-relaxed text-ink-2 sm:block sm:text-[17px]">{children}</div>}
        </div>
      </div>
    </section>
  );
}

/** Generated painted cover: every book gets its own colour, washes, motif and layout. Replace with real covers later. */
export function BookCover({ book, className = "", size = "md" }: { book: Book; className?: string; size?: "sm" | "md" }) {
  const sm = size === "sm";
  const top = book.id.charCodeAt(book.id.length - 1) % 2 === 0; // title placement varies too
  return (
    <div className={`@container relative flex aspect-[2/3] flex-col overflow-hidden rounded-[6px_12px_12px_6px] text-white shadow-lift ${sm ? "p-2" : "p-3.5"} ${className}`}>
      <CoverArt seed={`${book.id}-${book.title}`} className="absolute inset-0 h-full w-full" />
      <div className={`relative flex h-full flex-col ${top ? "" : "justify-end"}`}>
        <div className="rounded-md bg-black/25 p-1.5 backdrop-blur-[1px]">
          <p className={`font-ml leading-[1.2] font-bold text-balance drop-shadow ${sm ? "text-[10.5px]" : "text-[15px] @[8.5rem]:text-[18px]"}`}>{book.titleMl ?? book.title}</p>
          {!sm && <p className="mt-1 text-[12px] leading-snug text-white/85">{book.author}</p>}
        </div>
      </div>
    </div>
  );
}

/** Status pill: icon + label, plus one tick per copy (filled = on the shelf). */
export function Availability({ book, compact }: { book: Book; compact?: boolean }) {
  const free = book.available > 0;
  const Icon = free ? CircleCheck : Clock3;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-1.5 text-[13px] leading-none font-semibold whitespace-nowrap ${
        free ? "bg-teal-50 text-teal-700" : "bg-laterite-50 text-laterite-700"
      }`}
      title={`${book.available} of ${book.copies} copies on the shelf`}
    >
      <Icon size={15} strokeWidth={2.4} />
      {free ? (compact ? "Available" : `${book.available} of ${book.copies} on the shelf`) : compact ? "On loan" : "All out, join the queue"}
    </span>
  );
}

/** Vertical card: cover on top, readable text below. Used in the carousel. */
export function BookCard({ book }: { book: Book }) {
  return (
    <div className="flex h-full flex-col">
      <BookCover book={book} className="shrink-0" />
      <p title={book.title} className={`mt-3 truncate leading-snug font-bold ${book.titleMl ? "font-ml text-[17px]" : "text-[16px]"}`}>{book.titleMl ?? book.title}</p>
      <p title={book.title} className="truncate text-[14px] leading-snug text-ink-2">{book.titleMl ? book.title : " "}</p>
      <p title={book.author} className="truncate text-[13.5px] leading-snug text-muted">{book.author}</p>
      <div className="mt-1.5"><Availability book={book} compact /></div>
    </div>
  );
}

/** Horizontal card for lists: small cover, large readable text. */
export function BookRow({ book, mine, onOpen }: { book: Book; mine?: Mine; onOpen?: () => void }) {
  return (
    <Tap href={`/catalogue/${book.id}`} onOpen={onOpen} className="group flex h-[132px] w-full gap-4 rounded-[22px] bg-card p-3 ring-1 ring-line/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift hover:ring-royal/30">
      <BookCover book={book} size="sm" className="h-full w-auto shrink-0 transition-transform duration-300 group-hover:-rotate-2" />
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <p className={`truncate leading-snug font-semibold ${book.titleMl ? "font-ml text-[17px]" : "text-[17px]"}`}>{book.titleMl ?? book.title}</p>
        <p className="truncate text-[14px] text-ink-2">{book.titleMl ? book.title : " "}</p>
        <p className="truncate text-[14px] text-muted">{book.author}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {mine ? (
            <>
              <span className={`inline-flex items-center gap-1.5 rounded-full py-1 pr-3 pl-1.5 text-[13px] leading-none font-semibold whitespace-nowrap ${mineTone(mine)}`}>
                <CircleCheck size={15} strokeWidth={2.4} /> {mine.label}
              </span>
              {mine.note && <span className="truncate text-[12.5px] font-medium text-ink-2">{mine.note}</span>}
            </>
          ) : (
            <>
              <Availability book={book} compact />
              <span className="rounded-full bg-mist-2 px-2.5 py-0.5 text-[12.5px] text-muted">{book.category}</span>
            </>
          )}
        </div>
      </div>
    </Tap>
  );
}

/** Painted header that fades into the card body below it. */
function ArtHeader({ seed, motif, className = "h-24 sm:h-36", children }: { seed: string; motif: Motif; className?: string; children?: React.ReactNode }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <ArtTile seed={seed} motif={motif} className="art-fade-down h-full w-full transition-transform duration-700 group-hover:scale-[1.06]" />
      {children}
    </div>
  );
}

const card = "group relative flex flex-col overflow-hidden rounded-[22px] sm:rounded-[28px] bg-card ring-1 ring-line/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgb(42_29_32/0.35)] hover:ring-royal/25";
const Meta = ({ icon: Icon, children }: { icon: typeof Clock3; children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-mist-2 text-muted"><Icon size={15} /></span><span>{children}</span></div>
);

export const CLASS_MOTIFS: Record<string, Motif> = { c1: "drum", c2: "brush", c3: "lotus", c4: "sun", c5: "book", c6: "leaf" };

export function ClassCard({ c, mine, onOpen }: { c: ClassItem; mine?: Mine; onOpen?: () => void }) {
  const few = c.seatsLeft <= 3;
  const pct = Math.min(100, Math.round((c.seatsLeft / 20) * 100));
  return (
    <article className={card}>
      <ArtHeader seed={c.id + c.title} motif={CLASS_MOTIFS[c.id] ?? "lotus"}>
        {mine ? <MineBadge mine={mine} /> : <span className={`absolute top-3.5 right-3.5 rounded-full px-3 py-1 text-[13px] font-semibold shadow-lift ${c.fee === "Free" ? "bg-teal text-mist" : "bg-card/95 text-ink backdrop-blur"}`}>{c.fee}</span>}
      </ArtHeader>
      <div className="flex flex-1 flex-col px-3.5 pt-1 pb-3.5 sm:px-5 sm:pb-5">
        <h3 className="font-ml text-[1.4rem] leading-tight font-bold">
          <Tap href={`/classes/${c.id}`} onOpen={onOpen} className="after:absolute after:inset-0">{c.titleMl}</Tap>
        </h3>
        <p className="text-[15px] text-muted">{c.title}</p>
        <div className="mt-2.5 space-y-1.5 text-[14px] text-ink-2 sm:mt-4 sm:space-y-2 sm:text-[15px]">
          <Meta icon={Clock3}>{c.schedule}</Meta>
          <Meta icon={UserRound}>{c.teacher}, ages {c.ages}</Meta>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3 sm:pt-5">
          {mine ? (
            <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-ink-2">{mine.note ?? c.fee}</span>
          ) : (
            <div className="min-w-0 flex-1">
              <span className={`text-[13.5px] font-medium ${few ? "text-laterite" : "text-muted"}`}>{c.seatsLeft === 0 ? "Full" : few ? `Only ${c.seatsLeft} seats left` : `${c.seatsLeft} seats left`}</span>
              <div className="mt-1.5 h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-mist-2"><div className={`h-full rounded-full ${few ? "bg-laterite" : "bg-teal"}`} style={{ width: `${pct}%` }} /></div>
            </div>
          )}
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-royal px-5 py-2.5 text-[15px] font-semibold text-mist transition-colors group-hover:bg-royal-700">
            {mine ? "Open" : c.seatsLeft === 0 ? "Full" : "Enrol"} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

export const EVENT_MOTIFS: Record<EventItem["kind"], Motif> = { Health: "lotus", Camp: "palm", Literary: "lamp", Culture: "drum" };
export const kindLabel = (k: EventItem["kind"]) => (k === "Health" ? "Health camp" : k === "Camp" ? "Children's camp" : k === "Literary" ? "Literature" : "Culture");

export function DateBadge({ date, highlight }: { date: string; highlight?: boolean }) {
  const d = new Date(date + "T00:00:00+05:30");
  const fmt = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-IN", { ...o, timeZone: "Asia/Kolkata" });
  return (
    <div className={`flex h-[78px] w-[66px] flex-col items-center justify-center rounded-2xl shadow-lift ${highlight ? "bg-royal text-mist" : "bg-card text-ink"}`}>
      <span className="text-[12px] font-medium">{fmt({ weekday: "short" })}</span>
      <span className="font-display text-[1.85rem] leading-none font-extrabold">{fmt({ day: "numeric" })}</span>
      <span className="text-[12px] font-semibold">{fmt({ month: "short" })}</span>
    </div>
  );
}

export function EventCard({ e, highlight, mine, onOpen }: { e: EventItem; highlight?: boolean; mine?: Mine; onOpen?: () => void }) {
  return (
    <article className={`${card} sm:flex-row`}>
      <ArtHeader seed={e.id + e.title} motif={EVENT_MOTIFS[e.kind]} className="h-20 sm:h-auto sm:w-52 sm:shrink-0">
        <div className="absolute top-2.5 left-2.5 origin-top-left scale-[0.8] sm:top-3.5 sm:left-3.5 sm:scale-100"><DateBadge date={e.date} highlight={highlight || !!mine} /></div>
        {mine && <span className="sm:hidden"><MineBadge mine={mine} /></span>}
      </ArtHeader>
      <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-5">
        <h3 className="font-ml text-[1.2rem] leading-snug font-bold sm:text-[1.4rem]">
          <Tap href={`/events/${e.id}`} onOpen={onOpen} className="after:absolute after:inset-0">{e.titleMl}</Tap>
        </h3>
        <p className="text-[15px] text-muted">{e.title}</p>
        <p className="mt-1 line-clamp-2 text-[14px] text-ink-2 sm:mt-2 sm:text-[15px]">{e.blurb}</p>
        <div className="mt-2 mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] sm:mt-3 sm:mb-4 sm:gap-x-5 sm:text-[14px] text-ink-2">
          <Meta icon={Clock3}>{e.time}</Meta>
          <Meta icon={MapPin}>{e.place}</Meta>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          {mine ? (
            <span className="flex min-w-0 items-center gap-2">
              <span className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold sm:inline-flex ${mineTone(mine)}`}><CircleCheck size={13} strokeWidth={2.4} /> {mine.label}</span>
              {mine.note && <span className="truncate text-[13.5px] text-ink-2">{mine.note}</span>}
            </span>
          ) : <span className="text-[14px] text-muted">{kindLabel(e.kind)}</span>}
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-royal px-4 py-1.5 text-[14px] sm:px-5 sm:py-2 sm:text-[15px] font-semibold transition-colors group-hover:bg-royal group-hover:text-mist">
            {mine ? "Open" : "Register"} <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}

export const PRODUCT_MOTIFS: Record<string, Motif> = { p1: "leaf", p2: "palm", p3: "elephant", p4: "leaf", p5: "sun", p6: "lotus" };

export function ProductCard({ p, mine, onOpen }: { p: Product; i?: number; mine?: Mine; onOpen?: () => void }) {
  return (
    <article className={card}>
      <ArtHeader seed={p.id + p.name} motif={PRODUCT_MOTIFS[p.id] ?? "palm"} className="h-28 sm:h-44">
        <span className="absolute inset-x-0 bottom-2 px-5 text-center font-ml text-[1.4rem] leading-tight font-bold text-ink drop-shadow-[0_1px_0_rgba(255,250,241,0.9)]">{p.nameMl}</span>
        {mine && <MineBadge mine={mine} />}
      </ArtHeader>
      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <h3 className="font-ml text-[1.25rem] leading-snug font-bold">
          <Tap href={`/vipani/${p.id}`} onOpen={onOpen} className="after:absolute after:inset-0">{p.nameMl}</Tap>
        </h3>
        <p className="text-[15px] text-ink-2">{p.name}</p>
        <p className="text-[14px] text-muted">{mine?.note ?? `${p.seller} · per ${p.unit}`}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          {p.auction ? (
            <div>
              <p className="text-[13px] text-muted">Highest of {p.auction.bids} bids</p>
              <p className="font-display text-[1.8rem] leading-tight font-extrabold tabular-nums">₹{p.auction.currentBid.toLocaleString("en-IN")}</p>
              <Countdown to={p.auction.endsAt} />
            </div>
          ) : (
            <p className="font-display text-[1.8rem] leading-tight font-extrabold tabular-nums">₹{p.price}</p>
          )}
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-[15px] font-semibold text-mist transition-colors ${p.auction ? "bg-royal group-hover:bg-royal-700" : "bg-ink group-hover:bg-ink-2"}`}>
            {mine ? "Open" : p.auction ? <><Gavel size={17} /> Bid</> : "Buy"}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ───────── Detail pages (enrol, reserve, register, buy, bid) ───────── */

/** Shared layout: back link, painted banner, details on the left, the action form in a card on the right. */
const FACT_TINTS = [
  { bg: "bg-royal-50", fg: "text-royal" },
  { bg: "bg-kani-50", fg: "text-kani-700" },
  { bg: "bg-teal-50", fg: "text-teal-700" },
  { bg: "bg-laterite-50", fg: "text-laterite-700" },
];

export function DetailShell({
  back, backLabel, seed, title, ml, sub, badge, facts, children, form, formTitle, formNote, after, panel,
}: {
  back: string; backLabel: string; seed: string; motif?: Motif; title: string; ml?: string;
  /** English-line extra after the title (e.g. the author). */
  sub?: string;
  /** Shown beside the title (book cover, date). */
  badge?: React.ReactNode;
  facts: { icon: typeof Clock3; label: string; value: React.ReactNode }[]; children?: React.ReactNode; form: React.ReactNode; formTitle: string; formNote?: string;
  /** Full-width section under the main grid (e.g. comments). */
  after?: React.ReactNode;
  /** Box straight under the facts (e.g. recent bids). */
  panel?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 pb-10 sm:px-5 sm:pt-6 lg:pb-16">
      <Link href={back} className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-[15px] font-semibold text-ink-2 hover:text-royal">
        <ArrowLeft size={18} /> {backLabel}
      </Link>
      <div className="mt-4 lg:mt-6">
        <div className="min-w-0">
          {/* Banner: name first on a soft wash, with the action button inside it. */}
          <div className="relative overflow-hidden rounded-[32px] bg-card ring-1 ring-line/70">
            <WashBanner seed={seed} className="absolute inset-0 h-full w-full" />
            <div className="relative flex flex-col gap-6 p-5 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
              <div className="flex min-w-0 items-center gap-5 sm:gap-8">
                {badge && <div className="shrink-0">{badge}</div>}
                <div className="min-w-0">
                  <h1 className="font-display text-[2rem] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance sm:text-[3.4rem]">{title}</h1>
                  {(ml || sub) && <p className="mt-2 font-ml text-[17px] text-ink-2 sm:text-xl">{[ml, sub].filter(Boolean).join(" · ")}</p>}
                </div>
              </div>
              <ActionModal label={formTitle} title={formTitle} note={formNote} className="shrink-0 max-lg:w-full">{form}</ActionModal>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4">
            {facts.map((f, i) => {
              const t = FACT_TINTS[i % FACT_TINTS.length];
              return (
                <div key={f.label} className={`group relative overflow-hidden rounded-3xl p-4 transition-transform hover:-translate-y-0.5 sm:p-5 ${t.bg}`}>
                  <f.icon size={84} strokeWidth={1.25} className={`pointer-events-none absolute -right-4 -bottom-4 opacity-[0.12] transition-transform group-hover:rotate-6 ${t.fg}`} aria-hidden />
                  <span className={`grid size-9 place-items-center rounded-xl bg-card shadow-sm ${t.fg}`}><f.icon size={18} /></span>
                  <dt className="mt-4 text-[11.5px] font-semibold tracking-[0.14em] text-muted uppercase">{f.label}</dt>
                  <dd className="relative mt-1 font-display text-[17px] leading-snug font-bold break-words sm:text-[18px]">{f.value}</dd>
                </div>
              );
            })}
          </dl>
          {panel && <div className="mt-6 sm:mt-8">{panel}</div>}
          {children && <div className="mt-10 space-y-4 text-[16.5px] leading-relaxed text-ink-2 sm:mt-12 [&>p]:max-w-3xl">{children}</div>}
        </div>
      </div>
      {after && <div className="mt-14 sm:mt-20">{after}</div>}
    </div>
  );
}

export const icons = { Clock3, MapPin, UserRound, Users, CalendarDays, Gavel };
