"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, BookOpen, CalendarDays, ChevronRight, CreditCard, Gavel, IdCard, LayoutDashboard, Megaphone, Palette, ShoppingBasket, UserRound, Wallet } from "lucide-react";
import { useApi } from "@/lib/api";
import { useSession } from "@/lib/session";
import { daysLeft, dueLabel, fine, inr, loanTone, Pill, REQUEST_LABEL, requestTone } from "@/lib/format";
import type { MemberSummary } from "@/lib/types";
import { LibraryCard } from "./LibraryCard";
import { WashBanner } from "./ArtKit";

const lift = "shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_1px_2px_rgba(60,45,20,0.05),0_18px_40px_-20px_rgba(60,45,20,0.28)]";
const panel = `rounded-[28px] bg-gradient-to-b from-card to-card/90 p-5 ring-1 ring-line/60 sm:p-6 ${lift}`;

function PanelHead({ title, href, cta = "See all" }: { title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-display text-[1.15rem] font-bold sm:text-xl">{title}</h2>
      {href && <Link href={href} className="inline-flex items-center gap-1 text-[14px] font-semibold text-teal hover:text-teal-700">{cta} <ArrowRight size={15} /></Link>}
    </div>
  );
}

/** App home for signed-in members. Phones: a stacked app screen. Desktop: a two-column dashboard beside the sidebar. */
export function MemberHome() {
  const { user, isAdmin } = useSession();
  const { data } = useApi<MemberSummary>(user ? "/api/me" : null);

  const out = data?.loans.filter((l) => !l.returnedAt) ?? [];
  const fines = out.reduce((s, l) => s + fine(l, data?.finePerDay ?? 1), 0);
  // Running late fines are shown with the overdue alert; they're billed when the book comes back.
  const owed = data?.payments.filter((p) => p.status === "due").reduce((s, p) => s + p.amount, 0) ?? 0;
  const ready = data?.requests.filter((r) => r.status === "ready") ?? [];
  const late = out.filter((l) => daysLeft(l.dueAt) < 0);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" });
  const booked = data?.requests.filter((r) => r.kind !== "Reserve" && ["pending", "confirmed", "ready"].includes(r.status)) ?? [];

  const tiles = [
    { href: "/catalogue", label: "Books", ml: "പുസ്തകം", icon: BookOpen, tint: "bg-royal-50 text-royal" },
    { href: "/classes", label: "Classes", ml: "ക്ലാസ്", icon: Palette, tint: "bg-kani-50 text-kani-700" },
    { href: "/events", label: "Events", ml: "പരിപാടി", icon: CalendarDays, tint: "bg-teal-50 text-teal-700" },
    { href: "/vipani", label: "Vipani", ml: "വിപണി", icon: ShoppingBasket, tint: "bg-laterite-50 text-laterite-700" },
    { href: "/me/payments", label: "Payments", ml: "പണമടയ്ക്കൽ", icon: Wallet, tint: "bg-kani-50 text-kani-700" },
    { href: "/me/card", label: "My card", ml: "കാർഡ്", icon: IdCard, tint: "bg-laterite-50 text-laterite-700" },
    isAdmin
      ? { href: "/admin", label: "Admin", ml: "നിയന്ത്രണം", icon: LayoutDashboard, tint: "bg-ink text-mist" }
      : { href: "/me/profile", label: "Profile", ml: "പ്രൊഫൈൽ", icon: UserRound, tint: "bg-royal-50 text-royal" },
  ];

  const stats = [
    { href: "/catalogue", v: data ? String(out.length) : "–", l: "Books out", icon: BookOpen, bg: "bg-royal-50", fg: "text-royal" },
    { href: "/catalogue", v: data ? String(late.length) : "–", l: "Overdue", icon: AlertTriangle, bg: late.length ? "bg-laterite-50" : "bg-mist-2", fg: late.length ? "text-laterite-700" : "text-muted" },
    { href: "/classes", v: data ? String(booked.length) : "–", l: "Bookings", icon: CalendarDays, bg: "bg-teal-50", fg: "text-teal-700" },
    { href: "/me/payments", v: data ? inr(owed) : "–", l: "To pay", icon: Wallet, bg: owed ? "bg-kani-50" : "bg-mist-2", fg: owed ? "text-kani-700" : "text-muted" },
  ];

  const alerts = (
    <>
      {late.length > 0 && (
        <Link href="/catalogue" className="flex items-center gap-3 rounded-2xl bg-laterite-50 px-4 py-3 text-laterite-700">
          <AlertTriangle size={20} className="shrink-0" />
          <span className="min-w-0 flex-1 text-[14.5px]"><b className="font-semibold">{late.length === 1 ? late[0].title : `${late.length} books`}</b> overdue. Fine so far {inr(fines)}.</span>
          <ChevronRight size={18} />
        </Link>
      )}
      {ready.map((r) => (
        <Link key={r.id} href="/catalogue" className="flex items-center gap-3 rounded-2xl bg-kani-50 px-4 py-3 text-kani-700">
          <BookOpen size={20} className="shrink-0" />
          <span className="min-w-0 flex-1 text-[14.5px]"><b className="font-semibold">{r.title}</b> is ready at the desk.</span>
          <ChevronRight size={18} />
        </Link>
      ))}
      {owed > 0 && (
        <Link href="/me/payments" className={`flex items-center gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-line/60 ${lift}`}>
          <CreditCard size={20} className="shrink-0 text-royal" />
          <span className="min-w-0 flex-1 text-[14.5px]">You have <b className="font-semibold">{inr(owed)}</b> to pay. Pay by UPI in a few taps.</span>
          <span className="rounded-full bg-royal px-3 py-1 text-[13px] font-semibold text-mist">Pay</span>
        </Link>
      )}
    </>
  );

  return (
    <section className="mx-auto max-w-6xl px-4 pt-3 sm:px-5 sm:pt-6 md:pt-0">
      {/* ── Painted greeting banner + stat tiles (phones and desktop) ── */}
      <div>
        <div className="relative overflow-hidden rounded-[28px] bg-card shadow-[0_30px_60px_-30px_rgba(40,30,10,0.4)] ring-1 ring-line/60 md:rounded-[32px]">
          <WashBanner seed="member-home" className="pointer-events-none absolute inset-0 h-full w-full" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-card/90 via-card/55 to-card/10" />
          <div className="relative px-6 py-7 md:px-10 md:py-10 lg:px-12 lg:py-12">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase md:text-[13px]">{today}</p>
              <h1 className="mt-2 md:mt-3">
                <span className="block font-ml text-[1.5rem] leading-tight font-semibold text-ink-2 md:text-[1.9rem]">നമസ്കാരം,</span>
                <span className="mt-1 block font-display text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] md:text-[3.6rem] lg:text-[4.2rem]">
                  {user ? user.name.split(" ")[0] : <span className="inline-block h-14 w-56 animate-pulse rounded-2xl bg-ink/10 align-middle" />}
                </span>
              </h1>
              <p className="mt-2 font-ml text-[1.05rem] text-ink-2 md:mt-3 md:text-[1.15rem]">ഇന്ന് എന്ത് വായിക്കാം?</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:mt-5 md:grid-cols-4 md:gap-4">
          {stats.map((s) => (
            <Link key={s.l} href={s.href} className={`group relative min-w-0 overflow-hidden rounded-3xl p-4 transition-transform duration-200 hover:-translate-y-0.5 sm:p-5 ${s.bg}`}>
              <s.icon size={84} strokeWidth={1.25} aria-hidden className={`pointer-events-none absolute -right-4 -bottom-4 opacity-[0.12] transition-transform group-hover:rotate-6 ${s.fg}`} />
              <span className={`grid size-9 place-items-center rounded-xl bg-card shadow-sm ${s.fg}`}><s.icon size={18} /></span>
              <span className="mt-4 block text-[11.5px] font-semibold tracking-[0.14em] text-muted uppercase">{s.l}</span>
              <span className="relative mt-1 block font-display text-[1.6rem] leading-none font-extrabold tracking-tight tabular-nums sm:text-[1.8rem]">{s.v}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Phones: alerts, then shortcuts (desktop has the sidebar instead) */}
      <div className="mt-4 space-y-2.5 md:hidden">{alerts}</div>
      <ul className="mt-5 grid grid-cols-4 gap-x-2 gap-y-4 sm:gap-4 md:hidden">
        {tiles.map((t) => (
          <li key={t.href + t.label}>
            <Link href={t.href} className="flex flex-col items-center gap-1.5 rounded-2xl py-2 text-center transition-transform active:scale-95 sm:bg-card sm:py-4 sm:ring-1 sm:ring-line/70">
              <span className={`grid size-14 place-items-center rounded-[18px] ${t.tint}`}><t.icon size={24} /></span>
              <span className="text-[13px] leading-tight font-semibold">{t.label}</span>
              <span className="-mt-1 hidden font-ml text-[11.5px] text-muted sm:block">{t.ml}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* ── Dashboard body: two columns on large screens ── */}
      <div className="mt-7 grid gap-5 md:mt-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <div className="hidden space-y-2.5 md:block empty:hidden">{alerts}</div>

          {/* Books on loan */}
          <div className={panel}>
            <PanelHead title="On loan" href="/catalogue" />
            {!data ? (
              <div className="space-y-2">{[0, 1].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-mist-2" />)}</div>
            ) : out.length ? (
              <ul className="divide-y divide-line/80">
                {out.slice(0, 4).map((l) => (
                  <li key={l.id}>
                    <Link href={`/catalogue/${l.bookId}`} className="-mx-2 flex items-center gap-3 rounded-2xl px-2 py-3 transition-colors hover:bg-mist">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-royal-50 text-royal"><BookOpen size={18} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{l.title}</span>
                        <span className="text-[13px] text-muted">{dueLabel(l)}</span>
                      </span>
                      <Pill tone={loanTone(l)}>{loanTone(l) === "bad" ? "Late" : loanTone(l) === "warn" ? "Soon" : "On time"}</Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] text-ink-2">No books with you. <Link href="/catalogue" className="font-semibold text-teal">Find one to read</Link>.</p>
            )}
          </div>

          {/* Classes, events and orders they've booked */}
          <div className={panel}>
            <PanelHead title="Coming up for you" href="/classes" />
            {!data ? (
              <div className="space-y-2.5">{[0, 1].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-mist-2" />)}</div>
            ) : booked.length ? (
              <ul className="space-y-2.5">
                {booked.slice(0, 6).map((r) => {
                  const I = r.kind === "Enrol" ? Palette : r.kind === "Register" ? CalendarDays : r.kind === "Bid" ? Gavel : ShoppingBasket;
                  const href = r.kind === "Enrol" ? "/classes" : r.kind === "Register" ? "/events" : "/vipani";
                  return (
                    <li key={r.id} className="min-w-0">
                      <Link href={href} className="flex min-w-0 items-center gap-3 rounded-2xl bg-mist/70 p-3 transition hover:bg-mist-2">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-teal-700 ring-1 ring-line/60"><I size={18} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{r.title}</span>
                          <span className="block truncate text-[13px] text-muted">{r.detail}</span>
                        </span>
                        <Pill tone={requestTone(r.status)}>{REQUEST_LABEL[r.status]}</Pill>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-[15px] text-ink-2">Nothing booked yet. Try a <Link href="/classes" className="font-semibold text-teal">class</Link> or an <Link href="/events" className="font-semibold text-teal">event</Link>.</p>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-5">
          {/* The library card, ready to show at the desk */}
          {user && (
            <div className={panel}>
              <PanelHead title="Your library card" href="/me/card" cta="Open" />
              <Link href="/me/card" className="block max-w-md"><LibraryCard name={user.name} cardNo={user.card} since={user.since} /></Link>
            </div>
          )}

          {/* Notices from the library */}
          {!!data?.notices.length && (
            <div className={panel}>
              <PanelHead title="From the library" />
              <ul className="space-y-2.5">
                {data.notices.slice(0, 3).map((n) => (
                  <li key={n.id} className={`flex gap-3 rounded-2xl px-4 py-3.5 ${n.tone === "alert" ? "bg-kani-50" : "bg-mist/70"}`}>
                    <Megaphone size={19} className={`mt-0.5 shrink-0 ${n.tone === "alert" ? "text-kani-700" : "text-royal"}`} />
                    <div className="min-w-0">
                      <p className="font-semibold">{n.title}</p>
                      {n.body && <p className="text-[14.5px] leading-snug text-ink-2">{n.body}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
