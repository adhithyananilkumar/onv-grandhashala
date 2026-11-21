"use client";

import Link from "next/link";
import { AlertTriangle, BookOpen, CalendarDays, ChevronRight, CreditCard, Gavel, IdCard, LayoutDashboard, Megaphone, Palette, ShoppingBasket, Wallet } from "lucide-react";
import { useApi } from "@/lib/api";
import { useSession } from "@/lib/session";
import { daysLeft, dueLabel, fine, inr, loanTone, Pill } from "@/lib/format";
import type { MemberSummary } from "@/lib/types";
import { LibraryCard } from "./LibraryCard";

const greet = () => {
  const h = Number(new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

/** App home for signed-in members: greeting, what's due, money owed, notices and shortcuts. */
export function MemberHome() {
  const { user, isAdmin } = useSession();
  const { data } = useApi<MemberSummary>(user ? "/api/me" : null);

  const out = data?.loans.filter((l) => !l.returnedAt) ?? [];
  const fines = out.reduce((s, l) => s + fine(l, data?.finePerDay ?? 1), 0);
  // Running late fines are shown with the overdue alert; they're billed when the book comes back.
  const owed = data?.payments.filter((p) => p.status === "due").reduce((s, p) => s + p.amount, 0) ?? 0;
  const ready = data?.requests.filter((r) => r.status === "ready") ?? [];
  const late = out.filter((l) => daysLeft(l.dueAt) < 0);
  const booked = data?.requests.filter((r) => r.kind !== "Reserve" && ["pending", "confirmed", "ready"].includes(r.status)) ?? [];

  const tiles = [
    { href: "/catalogue", label: "Books", ml: "പുസ്തകം", icon: BookOpen, tint: "bg-royal-50 text-royal" },
    { href: "/classes", label: "Classes", ml: "ക്ലാസ്", icon: Palette, tint: "bg-kani-50 text-kani-700" },
    { href: "/events", label: "Events", ml: "പരിപാടി", icon: CalendarDays, tint: "bg-teal-50 text-teal-700" },
    { href: "/vipani", label: "Vipani", ml: "വിപണി", icon: ShoppingBasket, tint: "bg-laterite-50 text-laterite-700" },
    { href: "/me?tab=books", label: "My books", ml: "എന്റെ പുസ്തകം", icon: BookOpen, tint: "bg-royal-50 text-royal" },
    { href: "/me?tab=payments", label: "Payments", ml: "പണമടയ്ക്കൽ", icon: Wallet, tint: "bg-kani-50 text-kani-700" },
    { href: "/me?tab=bookings", label: "Bookings", ml: "ബുക്കിംഗ്", icon: Gavel, tint: "bg-teal-50 text-teal-700" },
    isAdmin
      ? { href: "/admin", label: "Admin", ml: "നിയന്ത്രണം", icon: LayoutDashboard, tint: "bg-ink text-mist" }
      : { href: "/me?tab=card", label: "My card", ml: "കാർഡ്", icon: IdCard, tint: "bg-laterite-50 text-laterite-700" },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 pt-3 sm:px-5 sm:pt-6">
      {/* Greeting card */}
      <div className="relative overflow-hidden rounded-[28px] bg-royal p-5 text-mist shadow-lift sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-kani/20 blur-2xl" />
        <p className="text-[14px] text-mist/70">{greet()}</p>
        <h1 className="font-display text-[1.9rem] leading-tight font-extrabold tracking-tight sm:text-4xl">
          {user ? user.name.split(" ")[0] : <span className="inline-block h-9 w-40 animate-pulse rounded-xl bg-white/15" />}
        </h1>
        <p className="font-ml text-[15px] text-mist/70">നമസ്കാരം! · {user?.card ?? "…"}</p>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-lg">
          {[
            { href: "/me?tab=books", v: data ? String(out.length) : "–", l: "Books out" },
            { href: "/me?tab=books", v: data ? String(late.length) : "–", l: "Overdue" },
            { href: "/me?tab=payments", v: data ? inr(owed) : "–", l: "To pay" },
          ].map((s) => (
            <Link key={s.l} href={s.href} className="rounded-2xl bg-white/10 px-3 py-2.5 transition-colors active:bg-white/20 sm:hover:bg-white/15">
              <p className="font-display text-[1.35rem] leading-tight font-bold tabular-nums">{s.v}</p>
              <p className="text-[12.5px] text-mist/70">{s.l}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Alerts that need action */}
      <div className="mt-4 space-y-2.5">
        {late.length > 0 && (
          <Link href="/me?tab=books" className="flex items-center gap-3 rounded-2xl bg-laterite-50 px-4 py-3 text-laterite-700">
            <AlertTriangle size={20} className="shrink-0" />
            <span className="min-w-0 flex-1 text-[14.5px]"><b className="font-semibold">{late.length === 1 ? late[0].title : `${late.length} books`}</b> overdue. Fine so far {inr(fines)}.</span>
            <ChevronRight size={18} />
          </Link>
        )}
        {ready.map((r) => (
          <Link key={r.id} href="/me?tab=books" className="flex items-center gap-3 rounded-2xl bg-kani-50 px-4 py-3 text-kani-700">
            <BookOpen size={20} className="shrink-0" />
            <span className="min-w-0 flex-1 text-[14.5px]"><b className="font-semibold">{r.title}</b> is ready at the desk.</span>
            <ChevronRight size={18} />
          </Link>
        ))}
        {owed > 0 && (
          <Link href="/me?tab=payments" className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-line/70">
            <CreditCard size={20} className="shrink-0 text-royal" />
            <span className="min-w-0 flex-1 text-[14.5px]">You have <b className="font-semibold">{inr(owed)}</b> to pay. Pay by UPI in a few taps.</span>
            <span className="rounded-full bg-royal px-3 py-1 text-[13px] font-semibold text-mist">Pay</span>
          </Link>
        )}
      </div>

      {/* Shortcuts */}
      <ul className="mt-5 grid grid-cols-4 gap-x-2 gap-y-4 sm:gap-4">
        {tiles.map((t) => (
          <li key={t.href + t.label}>
            <Link href={t.href} className="flex flex-col items-center gap-1.5 rounded-2xl py-2 text-center transition-transform active:scale-95 sm:bg-card sm:py-4 sm:ring-1 sm:ring-line/70 sm:hover:shadow-lift">
              <span className={`grid size-14 place-items-center rounded-[18px] ${t.tint}`}><t.icon size={24} /></span>
              <span className="text-[13px] leading-tight font-semibold">{t.label}</span>
              <span className="-mt-1 hidden font-ml text-[11.5px] text-muted sm:block">{t.ml}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Books on loan */}
      {out.length > 0 && (
        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">On loan</h2>
            <Link href="/me?tab=books" className="text-[14.5px] font-semibold text-teal">See all</Link>
          </div>
          <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-card ring-1 ring-line/70">
            {out.slice(0, 3).map((l) => (
              <li key={l.id}>
                <Link href={`/catalogue/${l.bookId}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-mist">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-royal-50 text-royal"><BookOpen size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{l.title}</span>
                    <span className="text-[13px] text-muted">{dueLabel(l)}</span>
                  </span>
                  <Pill tone={loanTone(l)}>{loanTone(l) === "bad" ? "Late" : loanTone(l) === "warn" ? "Soon" : "OK"}</Pill>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Classes, events and orders they've booked */}
      {booked.length > 0 && (
        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Coming up for you</h2>
            <Link href="/me?tab=bookings" className="text-[14.5px] font-semibold text-teal">See all</Link>
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {booked.slice(0, 4).map((r) => {
              const I = r.kind === "Enrol" ? Palette : r.kind === "Register" ? CalendarDays : r.kind === "Bid" ? Gavel : ShoppingBasket;
              const href = r.kind === "Enrol" ? `/classes/${r.itemId}` : r.kind === "Register" ? `/events/${r.itemId}` : `/vipani/${r.itemId}`;
              return (
                <li key={r.id}>
                  <Link href={href} className="flex items-center gap-3 rounded-3xl bg-card p-3.5 ring-1 ring-line/70 active:scale-[0.99]">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"><I size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{r.title}</span>
                      <span className="block truncate text-[13px] text-muted">{r.detail}</span>
                    </span>
                    <ChevronRight size={17} className="shrink-0 text-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* The library card, ready to show at the desk */}
      {user && (
        <div className="mt-7">
          <h2 className="mb-3 font-display text-xl font-bold">Your library card</h2>
          <Link href="/me?tab=card" className="block max-w-md"><LibraryCard name={user.name} cardNo={user.card} since={user.since} /></Link>
        </div>
      )}

      {/* Notices from the library */}
      {!!data?.notices.length && (
        <div className="mt-7">
          <h2 className="mb-3 font-display text-xl font-bold">From the library</h2>
          <ul className="space-y-2.5">
            {data.notices.slice(0, 3).map((n) => (
              <li key={n.id} className={`flex gap-3 rounded-2xl px-4 py-3.5 ${n.tone === "alert" ? "bg-kani-50" : "bg-card ring-1 ring-line/70"}`}>
                <Megaphone size={19} className={`mt-0.5 shrink-0 ${n.tone === "alert" ? "text-kani-700" : "text-royal"}`} />
                <div>
                  <p className="font-semibold">{n.title}</p>
                  {n.body && <p className="text-[14.5px] leading-snug text-ink-2">{n.body}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
