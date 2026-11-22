"use client";

// One page per section, shaped by what the member has:
//  - Books, classes, events: nothing of yours → the normal page (banner + full list).
//    Something of yours → "Your …" on top (tap a card for your details: due date, renew, cancel),
//    then the full list underneath. No separate "my account" pages needed.
//  - Vipani: always the live market, with a "Your orders" button that opens your orders and bids.

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, ChevronUp, History, RefreshCw, ShoppingBasket } from "lucide-react";
import { api, ApiError, invalidate, refreshContent, useApi, useCatalog } from "@/lib/api";
import { useSession } from "@/lib/session";
import { daysLeft, dueLabel, fine, fmtDate, fmtShort, fmtTime, inr, loanTone, Pill, REQUEST_LABEL, requestTone } from "@/lib/format";
import type { Book, Catalog, ClassItem, EventItem, LibRequest, Loan, MemberSummary, Product } from "@/lib/types";
import { BookCover, PageHero, CLASS_MOTIFS, EVENT_MOTIFS, PRODUCT_MOTIFS, type Mine } from "./ui";
import { ArtTile } from "./ArtKit";
import type { SceneSet } from "./Scene";
import { ListSkeleton } from "./Browse";
import { Countdown } from "./Countdown";
import { FormError, Sheet } from "./forms";

type Kind = "books" | "classes" | "events" | "vipani";

const COPY: Record<Kind, { yours: string; ml: string; all: string }> = {
  books: { yours: "Your books", ml: "നിങ്ങളുടെ പുസ്തകങ്ങൾ", all: "All books" },
  classes: { yours: "Your classes", ml: "നിങ്ങളുടെ ക്ലാസുകൾ", all: "All classes" },
  events: { yours: "Your events", ml: "നിങ്ങളുടെ പരിപാടികൾ", all: "All events" },
  vipani: { yours: "Your orders & bids", ml: "നിങ്ങളുടെ ഓർഡറുകൾ", all: "Vipani Live" },
};

const OPEN = ["pending", "confirmed", "ready"];
const WANT: Record<Exclude<Kind, "books">, LibRequest["kind"][]> = { classes: ["Enrol"], events: ["Register"], vipani: ["Order", "Bid"] };

/** What the details sheet is showing. */
type Open = { loan: Loan; book?: Book } | { req: LibRequest; book?: Book; cls?: ClassItem; ev?: EventItem; p?: Product };

/** The page's painted banner: full for visitors and members with nothing yet, slim above a member's own items. */
export type Banner = { title: string; ml: string; art: SceneSet; text: string };

export function MyItems({ kind, banner, children }: { kind: Kind; banner: Banner; children: React.ReactNode }) {
  const { user, ready } = useSession();
  const { data } = useApi<MemberSummary>(user ? "/api/me" : null);
  const { data: cat } = useCatalog();
  const [sheet, setSheet] = useState<Open | null>(null);
  const [history, setHistory] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const c = COPY[kind];

  const hero = <PageHero title={banner.title} ml={banner.ml} art={banner.art}><p>{banner.text}</p></PageHero>;
  const slimHero = <PageHero title={banner.title} ml={banner.ml} art={banner.art} compact />;
  const publicPage = <>{hero}{children}</>;
  // Visitors see the public page; until the session is known, CSS picks the right block without a flash.
  if (ready && !user) return publicPage;
  const guestFallback = !ready && <div className="guest-only">{publicPage}</div>;

  const loading = !data || !cat;
  const cards = loading ? [] : buildCards(kind, data, cat, setSheet);
  const past = loading ? [] : pastItems(kind, data);
  const grid = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";
  const historyLink = past.length > 0 && (
    <button type="button" onClick={() => setHistory(true)} className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[14.5px] font-semibold text-teal hover:bg-teal-50">
      <History size={16} /> {kind === "books" ? "Reading history" : "Past"}
    </button>
  );
  const sheets = (
    <>
      {sheet && data && <DetailsSheet open={sheet} d={data} onClose={() => setSheet(null)} />}
      {history && <HistorySheet title={kind === "books" ? "Reading history" : `Past ${kind === "vipani" ? "orders & bids" : kind}`} items={past} onClose={() => setHistory(false)} />}
    </>
  );

  /* ───── Vipani: always the live market, your orders behind a button ───── */
  if (kind === "vipani") {
    return (
      <>
        {guestFallback}
        <div className="member-only">
          {hero}
          <div className="mx-auto mt-6 flex max-w-6xl items-center justify-between gap-3 px-4 sm:mt-8 sm:px-5" data-hide-in-search>
            <h2 className="font-display text-[1.6rem] leading-tight font-bold sm:text-3xl">{c.all}</h2>
            <button type="button" onClick={() => setOrdersOpen((o) => !o)} aria-expanded={ordersOpen}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[15px] font-semibold transition active:scale-[0.98] sm:px-5 ${ordersOpen ? "bg-royal-50 text-royal ring-1 ring-royal/20" : "bg-royal text-mist shadow-lift hover:bg-royal-700"}`}>
              {ordersOpen ? <ChevronUp size={17} /> : <ShoppingBasket size={17} />} Your orders
              {cards.length > 0 && <span className={`rounded-full px-2 py-0.5 text-[12.5px] font-bold tabular-nums ${ordersOpen ? "bg-royal text-mist" : "bg-kani text-ink"}`}>{cards.length}</span>}
            </button>
          </div>
          {ordersOpen && (
            <section className="sheet-up mx-auto mt-4 max-w-6xl px-4 sm:px-5" aria-label={c.yours} data-hide-in-search>
              <div className="rounded-[26px] bg-mist-2/60 p-3 ring-1 ring-line/60 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                  <p className="font-display text-lg font-bold">{c.yours}</p>
                  {historyLink}
                </div>
                {loading ? <ListSkeleton /> : cards.length ? <div className={grid}>{cards}</div> : <p className="px-1 pb-1 text-[15.5px] text-ink-2">No orders or bids yet. Pick something from the stalls below.</p>}
              </div>
            </section>
          )}
          {user && children}
          {sheets}
        </div>
      </>
    );
  }

  /* ───── Books, classes, events ───── */
  let body: React.ReactNode;
  if (loading) {
    body = <>{slimHero}<div className="mx-auto mt-6 max-w-6xl px-4 sm:px-5">{kind === "books" ? <ListSkeleton rows /> : <ListSkeleton />}</div></>;
  } else if (cards.length === 0) {
    // Nothing of theirs: the normal page, with past items one tap away if there are any.
    body = (
      <>
        {publicPage}
        {historyLink && <div className="mx-auto mt-6 flex max-w-6xl justify-center px-4 sm:px-5">{historyLink}</div>}
      </>
    );
  } else {
    body = (
      <>
        {slimHero}
        <section className="mx-auto mt-6 max-w-6xl px-4 sm:mt-8 sm:px-5" data-hide-in-search>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-[1.6rem] leading-tight font-bold sm:text-3xl">{c.yours}</h2>
              <p className="font-ml text-[15px] text-muted">{c.ml}</p>
            </div>
            {historyLink}
          </div>
          <div className={grid}>{cards}</div>
        </section>
        <h2 className="mx-auto mt-12 max-w-6xl px-4 font-display text-[1.6rem] leading-tight font-bold sm:mt-14 sm:px-5 sm:text-3xl" data-hide-in-search>{c.all}</h2>
        {children}
      </>
    );
  }

  return (
    <>
      {guestFallback}
      <div className="member-only">
        {body}
        {sheets}
      </div>
    </>
  );
}

/* ───────── Your items as compact rows ───────── */

function MineRow({ thumb, title, sub, mine, onOpen }: { thumb: React.ReactNode; title: string; sub: string; mine: Mine; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen}
      className="group flex w-full items-center gap-3 rounded-[20px] bg-card p-2.5 pr-3 text-left ring-1 ring-line/70 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift hover:ring-royal/30">
      <span className="grid h-[72px] w-12 shrink-0 place-items-center overflow-hidden rounded-xl">{thumb}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-ml text-[16px] leading-snug font-bold">{title}</span>
        <span className="block truncate text-[13px] text-muted">{sub}</span>
        <span className="mt-1.5 flex min-w-0 items-center gap-2">
          <Pill tone={mine.tone}>{mine.label}</Pill>
          {mine.note && <span className="truncate text-[12.5px] text-ink-2">{mine.note}</span>}
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function buildCards(kind: Kind, d: MemberSummary, cat: Catalog, open: (o: Open) => void): React.ReactNode[] {
  if (kind === "books") {
    const loans = d.loans.filter((l) => !l.returnedAt).sort((a, b) => a.dueAt.localeCompare(b.dueAt)).flatMap((l) => {
      const book = cat.books.find((b) => b.id === l.bookId);
      const tone = loanTone(l);
      const mine: Mine = { label: tone === "bad" ? "Late" : "On loan", tone, note: dueLabel(l) };
      return book ? [<MineRow key={l.id} thumb={<BookCover book={book} size="sm" className="h-full w-auto" />} title={book.titleMl ?? book.title} sub={book.title} mine={mine} onOpen={() => open({ loan: l, book })} />] : [];
    });
    const reserved = d.requests.filter((r) => r.kind === "Reserve" && ["pending", "ready"].includes(r.status)).flatMap((r) => {
      const book = cat.books.find((b) => b.id === r.itemId);
      const mine: Mine = { label: r.status === "ready" ? "Ready at desk" : "Reserved", tone: requestTone(r.status), note: r.status === "ready" ? undefined : r.detail };
      return book ? [<MineRow key={r.id} thumb={<BookCover book={book} size="sm" className="h-full w-auto" />} title={book.titleMl ?? book.title} sub={book.title} mine={mine} onOpen={() => open({ req: r, book })} />] : [];
    });
    return [...loans, ...reserved];
  }
  return d.requests.filter((r) => WANT[kind].includes(r.kind) && OPEN.includes(r.status)).flatMap((r) => {
    if (kind === "classes") {
      const cls = cat.classes.find((x) => x.id === r.itemId);
      const mine: Mine = { label: r.status === "confirmed" ? "Enrolled" : REQUEST_LABEL[r.status], tone: requestTone(r.status), note: r.amount ? `${inr(r.amount)} a month` : cls?.fee };
      return cls ? [<MineRow key={r.id} thumb={<ArtTile seed={cls.id + cls.title} motif={CLASS_MOTIFS[cls.id] ?? "lotus"} className="h-full w-full" />} title={cls.titleMl} sub={`${cls.title} · ${cls.schedule}`} mine={mine} onOpen={() => open({ req: r, cls })} />] : [];
    }
    if (kind === "events") {
      const ev = cat.events.find((x) => x.id === r.itemId);
      const mine: Mine = { label: r.status === "confirmed" ? "Registered" : REQUEST_LABEL[r.status], tone: requestTone(r.status), note: r.detail };
      return ev ? [<MineRow key={r.id} thumb={<ArtTile seed={ev.id + ev.title} motif={EVENT_MOTIFS[ev.kind]} className="h-full w-full" />} title={ev.titleMl} sub={`${fmtShort(ev.date + "T00:00:00+05:30")} · ${ev.time}`} mine={mine} onOpen={() => open({ req: r, ev })} />] : [];
    }
    const p = cat.products.find((x) => x.id === r.itemId);
    const bid = r.kind === "Bid";
    const mine: Mine = {
      label: bid ? "You're leading" : r.status === "ready" ? "Ready to collect" : r.status === "confirmed" ? "Ordered" : "Waiting",
      tone: requestTone(r.status),
      note: bid ? `Your bid ${r.amount ? inr(r.amount) : ""}`.trim() : r.detail,
    };
    return p ? [<MineRow key={r.id} thumb={<ArtTile seed={p.id + p.name} motif={PRODUCT_MOTIFS[p.id] ?? "palm"} className="h-full w-full" />} title={p.nameMl} sub={p.name} mine={mine} onOpen={() => open({ req: r, p })} />] : [];
  });
}

type Past = { id: string; title: string; when: string; label: string; tone: string; href: string };

function pastItems(kind: Kind, d: MemberSummary): Past[] {
  if (kind === "books") {
    return d.loans.filter((l) => l.returnedAt).map((l) => ({ id: l.id, title: l.title, when: `${fmtShort(l.issuedAt)} – ${fmtShort(l.returnedAt!)}`, label: "Returned", tone: "muted", href: `/catalogue/${l.bookId}` }));
  }
  const base = kind === "classes" ? "/classes" : kind === "events" ? "/events" : "/vipani";
  return d.requests.filter((r) => WANT[kind].includes(r.kind) && !OPEN.includes(r.status)).map((r) => ({
    id: r.id, title: r.title, when: fmtShort(r.at), label: r.kind === "Bid" && r.status === "declined" ? "Outbid" : REQUEST_LABEL[r.status], tone: requestTone(r.status), href: `${base}/${r.itemId}`,
  }));
}

/* ───────── Details sheet: your loan / booking / order ───────── */

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-[14px] text-muted">{k}</dt>
      <dd className="text-right text-[15px] font-semibold">{children}</dd>
    </div>
  );
}

function DetailsSheet({ open, d, onClose }: { open: Open; d: MemberSummary; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const [done, setDone] = useState<string>();
  const [now] = useState(() => Date.now());

  const run = async (fn: () => Promise<unknown>, msg: string) => {
    setBusy(true); setErr(undefined);
    try { await fn(); setDone(msg); } catch (e) { setErr((e as ApiError).message); } finally { setBusy(false); }
  };
  const cancel = (r: LibRequest, what: string) => {
    if (!confirm(`Cancel this ${what}?`)) return;
    run(() => api(`/api/requests/${r.id}`, { method: "PATCH", body: { status: "cancelled" } }).then(refreshContent), `${what[0].toUpperCase()}${what.slice(1)} cancelled.`);
  };

  const btn = "inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold transition active:scale-[0.98] disabled:opacity-50";
  const primary = `${btn} bg-royal text-mist hover:bg-royal-700`;
  const quiet = `${btn} bg-card text-laterite-700 ring-1 ring-line hover:bg-laterite-50`;
  const pageLink = (href: string, label: string) => (
    <Link href={href} className="mt-4 flex items-center justify-center gap-1 text-[14.5px] font-semibold text-teal">{label} <ArrowRight size={15} /></Link>
  );

  if (done) {
    return (
      <Sheet title={done} onClose={onClose}>
        <button type="button" data-autofocus onClick={onClose} className={`${primary} w-full`}>Done</button>
      </Sheet>
    );
  }

  /* A book on loan */
  if ("loan" in open) {
    const l = open.loan;
    const late = daysLeft(l.dueAt) < 0;
    const f = fine(l, d.finePerDay);
    const canRenew = !late && l.renewals < d.maxRenewals;
    const used = Math.min(1, Math.max(0, (now - new Date(l.issuedAt).getTime()) / (new Date(l.dueAt).getTime() - new Date(l.issuedAt).getTime())));
    const tone = loanTone(l);
    return (
      <Sheet title={l.title} subtitle={open.book?.author} onClose={onClose}>
        <div className="flex gap-4">
          {open.book && <BookCover book={open.book} size="sm" className="h-28 w-auto shrink-0" />}
          <div className="min-w-0 flex-1">
            <Pill tone={tone}>{late ? "Late" : "On loan"}</Pill>
            <p className={`mt-2 font-display text-[1.3rem] leading-tight font-bold ${late ? "text-laterite-700" : ""}`}>{dueLabel(l).split(" · ")[0]}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mist-2">
              <div className={`h-full rounded-full ${tone === "bad" ? "bg-laterite" : tone === "warn" ? "bg-kani" : "bg-teal"}`} style={{ width: `${used * 100}%` }} />
            </div>
          </div>
        </div>
        <dl className="mt-4 divide-y divide-line/70 rounded-2xl bg-card px-4 ring-1 ring-line/60">
          <Row k="Borrowed">{fmtDate(l.issuedAt)}</Row>
          <Row k="Return by">{fmtDate(l.dueAt)}</Row>
          <Row k="Renewed">{l.renewals} of {d.maxRenewals}</Row>
          {open.book?.shelf && <Row k="Shelf">{open.book.shelf}</Row>}
          {late && <Row k="Fine so far"><span className="text-laterite-700">{inr(f)} <span className="font-normal text-muted">({inr(d.finePerDay)}/day)</span></span></Row>}
        </dl>
        <FormError>{err}</FormError>
        <div className="mt-4">
          {canRenew ? (
            <button type="button" disabled={busy} onClick={() => run(() => api(`/api/loans/${l.id}/renew`, { body: {} }).then(() => invalidate("/api/me")), "Renewed. Enjoy the extra time.")} className={`${primary} w-full`}>
              <RefreshCw size={17} className={busy ? "animate-spin" : ""} /> Renew
            </button>
          ) : (
            <p className="rounded-2xl bg-mist-2 px-4 py-3 text-[14.5px] text-ink-2">{late ? "Overdue books can't be renewed. Please bring it back to the desk." : "Renewal limit reached. Please return it by the due date."}</p>
          )}
        </div>
        {pageLink(`/catalogue/${l.bookId}`, "About this book")}
      </Sheet>
    );
  }

  /* A reservation, class, event, order or bid */
  const r = open.req;
  const pay = d.payments.find((p) => p.ref === r.id && p.status === "due");
  const status = r.kind === "Bid" ? "You're leading" : REQUEST_LABEL[r.status];
  const common = (
    <>
      <Row k="Status"><Pill tone={requestTone(r.status)}>{status}</Pill></Row>
      <Row k="Booked on">{fmtTime(r.at)}</Row>
      <Row k="Reference"><span className="font-mono">{r.id}</span></Row>
    </>
  );
  const payBtn = pay && <Link href="/me/payments" className={primary}>Pay {inr(pay.amount)}</Link>;

  if (r.kind === "Reserve") {
    return (
      <Sheet title={r.title} subtitle={open.book?.author} onClose={onClose}>
        <div className="flex gap-4">
          {open.book && <BookCover book={open.book} size="sm" className="h-28 w-auto shrink-0" />}
          <p className="min-w-0 flex-1 self-center font-display text-[1.25rem] leading-snug font-bold">{r.status === "ready" ? "Waiting for you at the desk" : r.detail ?? "Reserved"}</p>
        </div>
        <dl className="mt-4 divide-y divide-line/70 rounded-2xl bg-card px-4 ring-1 ring-line/60">
          {common}
          {open.book?.shelf && <Row k="Shelf">{open.book.shelf}</Row>}
        </dl>
        <p className="mt-3 text-[14px] text-muted">Show the reference at the desk. We hold a ready book for 3 days.</p>
        <FormError>{err}</FormError>
        <div className="mt-4 flex gap-2"><button type="button" disabled={busy} onClick={() => cancel(r, "reservation")} className={quiet}>Cancel reservation</button></div>
        {pageLink(`/catalogue/${r.itemId}`, "About this book")}
      </Sheet>
    );
  }

  if (r.kind === "Enrol") {
    const cl = open.cls;
    return (
      <Sheet title={cl?.title ?? r.title} subtitle={cl?.titleMl} onClose={onClose}>
        <dl className="divide-y divide-line/70 rounded-2xl bg-card px-4 ring-1 ring-line/60">
          {cl && <Row k="When">{cl.schedule}</Row>}
          {cl && <Row k="Teacher">{cl.teacher}</Row>}
          {r.detail?.startsWith("For ") && <Row k="Student">{r.detail.split(" · ")[0].slice(4)}</Row>}
          {cl && <Row k="Fee">{cl.fee}</Row>}
          {common}
        </dl>
        <p className="mt-3 text-[14px] text-muted">Classes run in the library hall. If you can&apos;t make it, message the library on WhatsApp.</p>
        <FormError>{err}</FormError>
        <div className="mt-4 flex gap-2">{payBtn}<button type="button" disabled={busy} onClick={() => cancel(r, "enrolment")} className={quiet}>Leave class</button></div>
        {pageLink(`/classes/${r.itemId}`, "About this class")}
      </Sheet>
    );
  }

  if (r.kind === "Register") {
    const ev = open.ev;
    return (
      <Sheet title={ev?.title ?? r.title} subtitle={ev?.titleMl} onClose={onClose}>
        <dl className="divide-y divide-line/70 rounded-2xl bg-card px-4 ring-1 ring-line/60">
          {ev && <Row k="Date">{fmtDate(ev.date + "T00:00:00+05:30")}</Row>}
          {ev && <Row k="Time">{ev.time}</Row>}
          {ev && <Row k="Place">{ev.place}</Row>}
          {r.detail && <Row k="Places">{r.detail}</Row>}
          {common}
        </dl>
        <FormError>{err}</FormError>
        <div className="mt-4 flex gap-2"><button type="button" disabled={busy} onClick={() => cancel(r, "registration")} className={quiet}>Cancel registration</button></div>
        {pageLink(`/events/${r.itemId}`, "About this event")}
      </Sheet>
    );
  }

  const p = open.p;
  if (r.kind === "Bid") {
    const a = p?.auction;
    return (
      <Sheet title={p?.name ?? r.title} subtitle={p?.seller} onClose={onClose}>
        <dl className="divide-y divide-line/70 rounded-2xl bg-card px-4 ring-1 ring-line/60">
          <Row k="Your bid"><span className="text-teal-700">{r.amount ? inr(r.amount) : "–"}</span></Row>
          {a && <Row k="Highest bid">{inr(a.currentBid)} <span className="font-normal text-muted">· {a.bids} bids</span></Row>}
          {a && <Row k="Closes"><Countdown to={a.endsAt} /></Row>}
          {common}
        </dl>
        <p className="mt-3 text-[14px] text-muted">We&apos;ll message you if someone outbids you, and when the auction closes.</p>
        <div className="mt-4 flex gap-2"><Link href={`/vipani/${r.itemId}`} className={primary}>See bids</Link></div>
      </Sheet>
    );
  }

  return (
    <Sheet title={p?.name ?? r.title} subtitle={p?.seller} onClose={onClose}>
      <dl className="divide-y divide-line/70 rounded-2xl bg-card px-4 ring-1 ring-line/60">
        {r.detail && <Row k="Order">{r.detail}</Row>}
        {r.amount !== undefined && <Row k="Total">{inr(r.amount)}</Row>}
        {common}
      </dl>
      <FormError>{err}</FormError>
      <div className="mt-4 flex gap-2">{payBtn}<button type="button" disabled={busy} onClick={() => cancel(r, "order")} className={quiet}>Cancel order</button></div>
      {pageLink(`/vipani/${r.itemId}`, "About this item")}
    </Sheet>
  );
}

function HistorySheet({ title, items, onClose }: { title: string; items: Past[]; onClose: () => void }) {
  return (
    <Sheet title={title} onClose={onClose}>
      <ul className="divide-y divide-line/70 overflow-hidden rounded-2xl bg-card ring-1 ring-line/60">
        {items.map((x) => (
          <li key={x.id}>
            <Link href={x.href} className="flex items-center gap-3 px-4 py-3 hover:bg-mist">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{x.title}</span>
                <span className="text-[13px] text-muted">{x.when}</span>
              </span>
              <Pill tone={x.tone}>{x.label}</Pill>
            </Link>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
