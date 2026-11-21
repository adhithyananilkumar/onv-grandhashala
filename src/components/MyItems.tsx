"use client";

// Signed-in members see their own classes / events / books / orders first on each list page,
// then "More …" with the usual search below. Visitors never see this block.

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, ChevronRight, Gavel, Palette, Search, ShoppingBasket } from "lucide-react";
import { useApi, useCatalog } from "@/lib/api";
import { useSession } from "@/lib/session";
import { dueLabel, fmtShort, inr, loanTone, Pill, REQUEST_LABEL, requestTone } from "@/lib/format";
import type { MemberSummary } from "@/lib/types";

type Kind = "books" | "classes" | "events" | "vipani";

const COPY: Record<Kind, { title: string; ml: string; more: string; empty: string; icon: typeof BookOpen; tab: string }> = {
  books: { title: "Your books", ml: "നിങ്ങളുടെ പുസ്തകങ്ങൾ", more: "Find more books", empty: "No books with you or reserved. Search below and reserve one.", icon: BookOpen, tab: "books" },
  classes: { title: "Your classes", ml: "നിങ്ങളുടെ ക്ലാസുകൾ", more: "More classes", empty: "You haven't joined a class yet. Pick one below.", icon: Palette, tab: "bookings" },
  events: { title: "Your events", ml: "നിങ്ങളുടെ പരിപാടികൾ", more: "More events", empty: "You're not registered for any event yet. See what's coming up below.", icon: CalendarDays, tab: "bookings" },
  vipani: { title: "Your orders & bids", ml: "നിങ്ങളുടെ ഓർഡറുകൾ", more: "More from the market", empty: "No orders or bids yet. Browse the stalls below.", icon: ShoppingBasket, tab: "bookings" },
};

const OPEN = ["pending", "confirmed", "ready"];

export function MyItems({ kind, children }: { kind: Kind; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const browseRef = useRef<HTMLDivElement>(null);
  const { user, ready } = useSession();
  const { data } = useApi<MemberSummary>(user ? "/api/me" : null);
  const { data: cat } = useCatalog();
  const c = COPY[kind];

  type Row = { key: string; href: string; title: string; sub: string; pill: React.ReactNode; icon: typeof BookOpen };
  let rows: Row[] = [];
  if (data) {
    if (kind === "books") {
      rows = [
        ...data.requests.filter((r) => r.kind === "Reserve" && ["pending", "ready"].includes(r.status)).map((r) => ({
          key: r.id, href: `/catalogue/${r.itemId}`, title: r.title, sub: r.status === "ready" ? "Ready at the desk" : r.detail ?? "Reserved", icon: BookOpen,
          pill: <Pill tone={requestTone(r.status)}>{REQUEST_LABEL[r.status]}</Pill>,
        })),
        ...data.loans.filter((l) => !l.returnedAt).map((l) => ({
          key: l.id, href: `/catalogue/${l.bookId}`, title: l.title, sub: dueLabel(l), icon: BookOpen,
          pill: <Pill tone={loanTone(l)}>{loanTone(l) === "bad" ? "Late" : "On loan"}</Pill>,
        })),
      ];
    } else {
      const want = kind === "classes" ? ["Enrol"] : kind === "events" ? ["Register"] : ["Order", "Bid"];
      rows = data.requests.filter((r) => want.includes(r.kind) && OPEN.includes(r.status)).map((r) => {
        const ev = kind === "events" ? cat?.events.find((e) => e.id === r.itemId) : undefined;
        const cl = kind === "classes" ? cat?.classes.find((x) => x.id === r.itemId) : undefined;
        return {
          key: r.id,
          href: `/${kind === "vipani" ? "vipani" : kind}/${r.itemId}`,
          title: r.title,
          sub: ev ? `${fmtShort(ev.date + "T00:00:00+05:30")} · ${ev.time} · ${ev.place} · ${r.detail}` : cl ? `${cl.schedule} · ${cl.teacher}` : `${r.detail ?? ""}${r.amount && r.kind === "Order" ? "" : ""}`,
          icon: r.kind === "Bid" ? Gavel : c.icon,
          pill: <Pill tone={requestTone(r.status)}>{r.kind === "Bid" && r.status === "confirmed" ? "Leading" : r.kind === "Order" && r.amount ? inr(r.amount) : REQUEST_LABEL[r.status]}</Pill>,
        };
      });
    }
  }

  // The search opens from the "More …" button; with nothing booked yet it starts open.
  const showBrowse = open || (!!data && rows.length === 0);
  const openBrowse = () => {
    setOpen(true);
    requestAnimationFrame(() => {
      browseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      browseRef.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
    });
  };

  // Visitors: just the search.
  if (ready && !user) return <>{children}</>;

  return (
    <>
      <section className="member-only px-3 pt-2 sm:px-5 sm:pt-3">
        {/* Member banner, in place of the public one: light peacock-to-gold wash with a fine gold lattice, so it reads as "yours". */}
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[22px] bg-[linear-gradient(140deg,var(--color-royal-50)_0%,var(--color-card)_48%,var(--color-kani-50)_100%)] text-ink shadow-lift ring-1 ring-line/70 sm:rounded-[30px]">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.10] [background-image:radial-gradient(circle_at_center,var(--color-kani)_1.2px,transparent_1.6px),linear-gradient(45deg,transparent_48.5%,var(--color-kani)_49.5%,var(--color-kani)_50.5%,transparent_51.5%)] [background-size:22px_22px,44px_44px]" />
          <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-kani/30 blur-3xl" />
          <div className="relative p-5 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-card/85 px-2.5 py-0.5 text-[11.5px] font-semibold tracking-[0.14em] text-kani-700 uppercase backdrop-blur"><c.icon size={13} /> {data ? `${rows.length} active` : "Your account"}</p>
                <h1 className="mt-2 font-display text-[2rem] leading-[1.02] font-extrabold tracking-[-0.03em] sm:text-5xl">{c.title}</h1>
                <p className="mt-1 font-ml text-[15px] text-ink-2 sm:text-lg">{c.ml}</p>
              </div>
              <Link href={`/me?tab=${c.tab}`} className="shrink-0 rounded-full bg-card/85 px-3 py-1.5 text-[13.5px] font-semibold text-teal ring-1 ring-line/70 hover:bg-card">See all</Link>
            </div>

            <div className="mt-5">
              {!data ? (
                <div className="grid gap-2.5 sm:grid-cols-2">{[0, 1].map((i) => <div key={i} className="h-[68px] animate-pulse rounded-2xl bg-card/70" />)}</div>
              ) : rows.length ? (
                <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {rows.map((r) => (
                    <li key={r.key} className="min-w-0">
                      <Link href={r.href} className="flex items-center gap-3 rounded-2xl bg-card p-3 text-ink shadow-sm ring-1 ring-line/60 transition active:scale-[0.99] sm:hover:shadow-lift">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-royal-50 text-royal"><r.icon size={19} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{r.title}</span>
                          <span className="block truncate text-[13px] text-muted">{r.sub}</span>
                        </span>
                        {r.pill}
                        <ChevronRight size={17} className="shrink-0 text-muted" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-2xl bg-card/80 px-4 py-4 text-[14.5px] text-ink-2">{c.empty}</p>
              )}
            </div>

            {!showBrowse && (
              <button type="button" onClick={openBrowse}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-royal px-6 py-3.5 text-[15.5px] font-semibold text-mist shadow-lift transition active:scale-[0.98] hover:bg-royal-700 sm:w-auto">
                <Search size={18} /> {c.more} <ArrowRight size={17} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Visitors always see the search; members see it once they open it. */}
      <div ref={browseRef} className={`scroll-mt-16 ${showBrowse ? "" : "app:hidden"}`}>
        {showBrowse && (
          <div className="member-only mx-auto mt-5 flex max-w-6xl items-center justify-between px-4 sm:px-5">
            <h2 className="font-display text-xl font-bold">{c.more}</h2>
            {open && rows.length > 0 && <button type="button" onClick={() => setOpen(false)} className="text-[14.5px] font-semibold text-teal">Hide</button>}
          </div>
        )}
        {children}
      </div>
    </>
  );
}
