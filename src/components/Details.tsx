"use client";

// Detail pages: the item is fetched from the mock API (/api/catalog) by the id in the URL.

import Link from "next/link";
import { useParams } from "next/navigation";
import { Armchair, ArrowLeft, BookOpen, CalendarDays, Clock3, Gavel, Languages, Library, MapPin, Package, SearchX, Store, Tag, Ticket, Timer, Trophy, UserRound, Users, History, Wallet, ListChecks, TrendingUp, ArrowUp } from "lucide-react";
import { useCatalog, useLivePoll } from "@/lib/api";
import { fmtTime, inr } from "@/lib/format";
import type { ClassItem, Product } from "@/lib/types";
import { BidForm, EnrolForm, OrderForm, RegisterForm, ReserveForm } from "./Actions";
import { Comments } from "./Comments";
import { Countdown } from "./Countdown";
import { Availability, BookCover, CLASS_MOTIFS, DateBadge, DetailShell, EVENT_MOTIFS, PRODUCT_MOTIFS } from "./ui";

function useItem<K extends "books" | "classes" | "events" | "products">(list: K) {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useCatalog();
  const item = data?.[list].find((x) => x.id === id) as NonNullable<typeof data>[K][number] | undefined;
  return { item, loading, error };
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-5 sm:pt-6" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-32 animate-pulse rounded-full bg-mist-2" />
      <div className="mt-4 h-64 animate-pulse rounded-[32px] bg-mist-2 sm:h-72" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-3xl bg-mist-2" />)}</div>
    </div>
  );
}

function Missing({ back, label, error }: { back: string; label: string; error?: string }) {
  return (
    <div className="mx-auto grid max-w-md place-items-center px-5 py-24 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-mist-2 text-muted"><SearchX size={28} /></span>
      <h1 className="mt-4 font-display text-2xl font-bold">{error ? "Couldn't load this" : "Not found"}</h1>
      <p className="mt-1 text-muted">{error ?? "It may have been removed from the library's list."}</p>
      <Link href={back} className="mt-6 inline-flex items-center gap-2 rounded-full bg-royal px-5 py-3 font-semibold text-mist"><ArrowLeft size={17} /> {label}</Link>
    </div>
  );
}

export function BookDetail() {
  const { item: b, loading, error } = useItem("books");
  if (loading) return <DetailSkeleton />;
  if (!b) return <Missing back="/catalogue" label="All books" error={error?.message} />;
  const queue = b.available === 0;
  return (
    <DetailShell
      back="/catalogue" backLabel="All books" seed={`${b.id}-${b.title}`} motif="book"
      badge={<BookCover book={b} className="w-28 sm:w-36" />}
      title={b.title} ml={b.titleMl} sub={b.author}
      facts={[
        { icon: BookOpen, label: "Copies", value: <Availability book={b} /> },
        { icon: Library, label: "Shelf", value: b.shelf },
        { icon: Languages, label: "Language", value: b.language },
        { icon: Tag, label: "Category", value: b.category },
      ]}
      formTitle={queue ? "Join the queue" : "Reserve this book"}
      formNote={queue ? "All copies are out. We'll message you when one is returned." : "We hold it at the desk for 3 days."}
      form={<ReserveForm book={b} />}
      after={<Comments itemId={`book-${b.id}`} />}
    >
      <h2 className="font-display text-2xl font-bold text-ink">How it works</h2>
      <ol className="grid gap-3 sm:grid-cols-3">
        {[
          ["Reserve", queue ? "Add your name to the queue here." : "Pick a day and send the form."],
          ["We confirm", "You'll see it under My books when it's ready at the desk."],
          ["Collect", "Show your library card at the desk."],
        ].map(([t, d], i) => (
          <li key={t} className="rounded-2xl bg-card p-5 ring-1 ring-line/70">
            <span className="grid size-8 place-items-center rounded-full bg-royal text-[14px] font-bold text-mist">{i + 1}</span>
            <p className="mt-3 font-semibold text-ink">{t}</p>
            <p className="mt-1 text-[15px] leading-snug text-muted">{d}</p>
          </li>
        ))}
      </ol>
      <p>Books are lent for 14 days and can be renewed twice from My books, or at the desk.</p>
    </DetailShell>
  );
}

/** Heading + body block used under a detail page's facts. */
function InfoCard({ icon: Icon, title, children, className = "" }: { icon: typeof Clock3; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl bg-card p-5 ring-1 ring-line/70 sm:p-6 ${className}`}>
      <h2 className="flex items-center gap-2 font-display text-[1.2rem] font-bold"><Icon size={19} className="text-royal" /> {title}</h2>
      <div className="mt-3 space-y-3 text-[16px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

function ClassInfo({ c }: { c: ClassItem }) {
  return (
    <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
      <InfoCard icon={BookOpen} title="About this class" className="lg:col-span-2">
        <p>{c.about ?? `${c.title} at the library, ${c.schedule.toLowerCase()}, for ages ${c.ages}.`}</p>
      </InfoCard>
      <InfoCard icon={UserRound} title="Your teacher">
        <div className="flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-royal font-display text-[17px] font-bold text-mist" aria-hidden>{c.teacher.replace(/^(Sri|Smt|Dr)\.\s*/, "").charAt(0)}</span>
          <p className="font-display text-[17px] font-bold text-ink">{c.teacher}</p>
        </div>
        {c.teacherNote && <p>{c.teacherNote}</p>}
      </InfoCard>
      <InfoCard icon={ListChecks} title="Before you come" className="lg:col-span-3">
        <ul className="list-disc space-y-1.5 pl-5 marker:text-royal">
          <li>Classes run in the library hall. Come ten minutes early on the first day to meet the teacher and fill in a short form.</li>
          <li>If you need to miss a class, message the library on WhatsApp so someone on the waiting list can take your place.</li>
        </ul>
      </InfoCard>
    </div>
  );
}

export function ClassDetail() {
  const { item: c, loading, error } = useItem("classes");
  if (loading) return <DetailSkeleton />;
  if (!c) return <Missing back="/classes" label="All classes" error={error?.message} />;
  return (
    <DetailShell
      back="/classes" backLabel="All classes" seed={c.id + c.title} motif={CLASS_MOTIFS[c.id] ?? "lotus"}
      title={c.title} ml={c.titleMl}
      facts={[
        { icon: Clock3, label: "When", value: c.schedule },
        { icon: Wallet, label: "Fee", value: c.fee },
        { icon: Users, label: "Ages", value: c.ages },
        { icon: Armchair, label: "Seats", value: c.seatsLeft === 0 ? "Full" : `${c.seatsLeft} left` },
      ]}
      formTitle="Enrol" formNote="Book a seat for yourself or your child."
      form={<EnrolForm c={c} />}
      panel={<ClassInfo c={c} />}
    />
  );
}

export function EventDetail() {
  const { item: e, loading, error } = useItem("events");
  if (loading) return <DetailSkeleton />;
  if (!e) return <Missing back="/events" label="All events" error={error?.message} />;
  const date = new Date(e.date + "T00:00:00+05:30").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
  return (
    <DetailShell
      back="/events" backLabel="All events" seed={e.id + e.title} motif={EVENT_MOTIFS[e.kind]}
      badge={<DateBadge date={e.date} highlight />}
      title={e.title} ml={e.titleMl}
      facts={[
        { icon: CalendarDays, label: "Date", value: date },
        { icon: Clock3, label: "Time", value: e.time },
        { icon: MapPin, label: "Place", value: e.place },
        { icon: Ticket, label: "Entry", value: "Free, registration needed" },
      ]}
      formTitle="Register" formNote="Save places for you and your family."
      form={<RegisterForm e={e} />}
    >
      <p>{e.blurb}</p>
      {e.kind === "Health" && <p>Bring any old prescriptions and your Aadhaar or ration card. Tokens are called in order of registration.</p>}
    </DetailShell>
  );
}

const ago = (iso: string, now = Date.now()) => {
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
};

type Auction = NonNullable<Product["auction"]>;
const pct = (n: number, of: number) => (of ? `${n >= 0 ? "+" : ""}${((n / of) * 100).toFixed(1)}%` : "");

/** Step chart of the price over time, opening price to now. */
function BidChart({ a, start, closed }: { a: Auction; start: number; closed: boolean }) {
  const bids = [...(a.history ?? [])].reverse();
  if (!bids.length) return null;
  const t = (iso: string) => new Date(iso).getTime();
  const first = t(bids[0].at), end = Math.max(closed ? t(a.endsAt) : Date.now(), t(bids[bids.length - 1].at));
  const t0 = first - Math.max((end - first) * 0.08, 3_600_000);
  const pts = [{ x: t0, y: bids.length < a.bids ? bids[0].amount : start }, ...bids.map((b) => ({ x: t(b.at), y: b.amount }))];
  const lo = Math.min(start, ...pts.map((p) => p.y)), hi = Math.max(...pts.map((p) => p.y));
  const pad = (hi - lo || hi * 0.1) * 0.18, yMin = lo - pad, yMax = hi + pad;
  const W = 600, H = 150;
  const X = (x: number) => ((x - t0) / (end - t0)) * W, Y = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;
  let d = `M0 ${Y(pts[0].y)}`;
  for (const p of pts.slice(1)) d += ` H${X(p.x)} V${Y(p.y)}`;
  d += ` H${W}`;
  const ticks = [hi, (hi + lo) / 2, lo];
  return (
    <div className="relative mt-5 h-[150px] pr-14 text-teal-700 sm:h-[170px]">
      <div className="relative h-full">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id="bidfill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity="0.22" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient>
          </defs>
          {ticks.map((v) => <line key={v} x1="0" x2={W} y1={Y(v)} y2={Y(v)} className="stroke-line" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />)}
          <path d={`${d} V${H} H0 Z`} fill="url(#bidfill)" />
          <path d={d} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {pts.slice(1).map((p, i, all) => {
          const last = i === all.length - 1;
          return (
            <span key={p.x} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${(X(p.x) / W) * 100}%`, top: `${(Y(p.y) / H) * 100}%` }}>
              <span className={`relative block rounded-full border-2 border-card bg-teal-700 ${last ? "size-3.5" : "size-2.5"}`} />
            </span>
          );
        })}
      </div>
      {ticks.map((v) => (
        <span key={v} className="absolute right-0 -translate-y-1/2 text-[11.5px] font-medium text-muted tabular-nums" style={{ top: `${(Y(v) / H) * 100}%` }}>{inr(Math.round(v))}</span>
      ))}
    </div>
  );
}

/** Market-style ticker for an auction: price, change since opening, chart and the latest bids. */
function RecentBids({ a, start, show = 5 }: { a: Auction; start: number; show?: number }) {
  const history = a.history ?? [];
  const list = history.slice(0, show);
  const closed = !!a.closedAt || new Date(a.endsAt).getTime() < Date.now();
  const change = a.currentBid - start;
  const step = a.currentBid >= 1000 ? 50 : 10;
  const prevOf = (i: number) => history[i + 1]?.amount ?? (history.length >= a.bids ? start : undefined);
  const stats = [
    { k: "Opening", v: inr(start) },
    { k: "High", v: inr(a.currentBid) },
    { k: "Bids", v: String(a.bids) },
    { k: closed ? "Status" : "Next bid", v: closed ? "Closed" : `${inr(a.currentBid + step)}+` },
  ];
  return (
    <section className="overflow-hidden rounded-3xl bg-card ring-1 ring-line/70" aria-labelledby="recent-bids">
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <h2 id="recent-bids" className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">
              {closed ? "Final price" : "Current bid"}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="font-display text-[2.4rem] leading-none font-extrabold tracking-[-0.02em] tabular-nums sm:text-[2.8rem]">{inr(a.currentBid)}</p>
              {change > 0 && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2 py-1 text-[14px] font-bold text-teal-700 tabular-nums">
                  <TrendingUp size={15} strokeWidth={2.6} /> {inr(change)} ({pct(change, start)})
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[13px] text-muted">since the opening price</p>
          </div>
          <dl className="grid grid-cols-4 gap-x-5 gap-y-1 sm:gap-x-7">
            {stats.map((s) => (
              <div key={s.k}>
                <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">{s.k}</dt>
                <dd className="mt-0.5 font-display text-[15px] font-bold whitespace-nowrap tabular-nums sm:text-[16px]">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <BidChart a={a} start={start} closed={closed} />
      </div>
      <div className="border-t border-line/70 bg-mist-2/35">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2 sm:px-6">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.14em] text-muted uppercase"><History size={14} /> Recent bids</p>
          {a.bids > list.length && list.length > 0 && <p className="text-[12.5px] text-muted">Last {list.length} of {a.bids}</p>}
        </div>
        {list.length === 0 ? (
          <p className="px-4 pb-5 text-[15px] text-ink-2 sm:px-6">{a.bids === 0 ? "No bids yet. Be the first to bid." : "Bid details aren't available for this auction yet."}</p>
        ) : (
          <table className="w-full text-left text-[14.5px] tabular-nums">
            <thead className="sr-only sm:not-sr-only">
              <tr className="text-[11px] tracking-[0.12em] text-muted uppercase">
                <th className="py-1.5 pl-4 font-semibold sm:pl-6">Bidder</th>
                <th className="hidden py-1.5 font-semibold sm:table-cell">Time</th>
                <th className="py-1.5 text-right font-semibold">Change</th>
                <th className="py-1.5 pr-4 text-right font-semibold sm:pr-6">Bid</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b, i) => {
                const prev = prevOf(i), up = prev !== undefined ? b.amount - prev : undefined;
                return (
                  <tr key={b.at + b.by} className={`border-t border-line/60 ${i === 0 ? "bg-teal-50/60" : ""}`}>
                    <td className="py-3 pl-4 sm:pl-6">
                      <span className="flex items-center gap-2 font-semibold">
                        {b.by}
                        {i === 0 && <span className="inline-flex items-center gap-1 rounded-md bg-kani-50 px-1.5 py-0.5 text-[11.5px] font-bold text-kani-700"><Trophy size={11} strokeWidth={2.6} /> {closed ? "Won" : "Top"}</span>}
                      </span>
                      <time dateTime={b.at} title={fmtTime(b.at)} className="text-[12.5px] text-muted sm:hidden">{ago(b.at)}</time>
                    </td>
                    <td className="hidden py-3 text-muted sm:table-cell"><time dateTime={b.at} title={fmtTime(b.at)}>{ago(b.at)}</time></td>
                    <td className="py-3 text-right">
                      {up !== undefined && up > 0 ? (
                        <span className="inline-flex items-center gap-0.5 font-semibold text-teal-700"><ArrowUp size={13} strokeWidth={2.8} />{inr(up)}<span className="ml-1 hidden text-[12.5px] font-medium opacity-80 sm:inline">{pct(up, prev!)}</span></span>
                      ) : <span className="text-muted">–</span>}
                    </td>
                    <td className={`py-3 pr-4 text-right font-display text-[16px] font-extrabold sm:pr-6 ${i === 0 ? "text-teal-700" : ""}`}>{inr(b.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export function ProductDetail() {
  const { item: p, loading, error } = useItem("products");
  const watch = p?.auction;
  useLivePoll(!!watch && !watch.closedAt, watch?.live ? 3000 : 15000, watch?.endsAt);
  if (loading) return <DetailSkeleton />;
  if (!p) return <Missing back="/vipani" label="Naattu Vipani" error={error?.message} />;
  const a = p.auction;
  return (
    <DetailShell
      back="/vipani" backLabel="Naattu Vipani" seed={p.id + p.name} motif={PRODUCT_MOTIFS[p.id] ?? "palm"}
      title={p.name} ml={p.nameMl}
      facts={[
        { icon: Store, label: "Seller", value: p.seller },
        { icon: Package, label: "Unit", value: p.unit },
        a
          ? { icon: Gavel, label: "Highest bid", value: `₹${a.currentBid.toLocaleString("en-IN")} · ${a.bids} bids` }
          : { icon: Gavel, label: "Price", value: `₹${p.price}` },
        a ? { icon: Timer, label: a.live && !a.closedAt ? "LIVE now" : "Closes", value: a.closedAt ? <span className="text-[13px] font-medium text-laterite">{a.winner ? "Sold" : "Auction closed"}</span> : <Countdown to={a.endsAt} /> } : { icon: Timer, label: "Pickup", value: "Saturday market day" },
      ]}
      formTitle={a ? "Place a bid" : "Buy"} formNote={a ? "The highest bid when the timer ends wins." : "Order now, pay by UPI or when you collect."}
      form={a ? <BidForm p={p} /> : <OrderForm p={p} />}
      panel={a ? <RecentBids a={a} start={p.price} /> : undefined}
    >
      <p>Everything at Naattu Vipani comes straight from people in and around Puthanambalam. The library takes no commission; a small table fee keeps the market running.</p>
    </DetailShell>
  );
}
