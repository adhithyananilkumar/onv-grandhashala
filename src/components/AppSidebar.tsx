"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays, House, IdCard, LayoutDashboard, LibraryBig, LogOut, Palette, ShieldCheck, ShoppingBasket, UserRound, Wallet,
} from "lucide-react";
import { useApi } from "@/lib/api";
import { initials, logout, useSession } from "@/lib/session";
import { daysLeft, inr } from "@/lib/format";
import type { MemberSummary } from "@/lib/types";
import { site } from "@/lib/site";
import { LogoIcon } from "./Logo";
import { SearchButton } from "./SearchModal";

type Item = { href: string; label: string; icon: typeof House; badge?: string; alert?: boolean };

/**
 * Desktop app shell for signed-in members: a fixed left sidebar in place of the floating top nav.
 * Shown from md up only when signed in (the `app:` variant); phones keep the app bar + bottom dock.
 */
export function AppSidebar() {
  const { user, isAdmin } = useSession();
  const { data } = useApi<MemberSummary>(user ? "/api/me" : null);
  const path = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const tab = params.get("tab");

  const out = data?.loans.filter((l) => !l.returnedAt).length ?? 0;
  const lateBooks = data?.loans.some((l) => !l.returnedAt && daysLeft(l.dueAt) < 0) ?? false;
  const reserved = data?.requests.filter((r) => r.kind === "Reserve" && ["pending", "ready"].includes(r.status)).length ?? 0;
  const count = (k: string) => data?.requests.filter((r) => r.kind === k && ["pending", "confirmed", "ready"].includes(r.status)).length ?? 0;
  const n = (x: number) => (x ? String(x) : undefined);
  const owed = data?.payments.filter((p) => p.status === "due").reduce((s, p) => s + p.amount, 0) ?? 0;

  const explore: Item[] = [
    { href: "/", label: "Home", icon: House },
    { href: "/catalogue", label: "Books", icon: LibraryBig, badge: n(out + reserved), alert: lateBooks },
    { href: "/classes", label: "Classes", icon: Palette, badge: n(count("Enrol")) },
    { href: "/events", label: "Events", icon: CalendarDays, badge: n(count("Register")) },
    { href: "/vipani", label: "Vipani", icon: ShoppingBasket, badge: n(count("Order") + count("Bid")) },
  ];
  const mine: Item[] = [
    { href: "/me/payments", label: "Payments", icon: Wallet, badge: owed ? inr(owed) : undefined, alert: owed > 0 },
    { href: "/me/card", label: "Library card", icon: IdCard },
    { href: "/me/profile", label: "Profile & PIN", icon: UserRound },
  ];

  const active = (href: string) => {
    const [p, q] = href.split("?");
    if (q) return path === p && `tab=${tab}` === q;
    if (p === "/") return path === "/";
    return path.startsWith(p);
  };

  const signOut = async () => {
    setLeaving(true);
    await logout();
    setLeaving(false);
    router.push("/");
  };

  const group = (title: string, items: Item[]) => (
    <div className="pt-5">
      <p className="px-3 pb-1.5 text-[11.5px] font-semibold tracking-[0.14em] text-muted uppercase">{title}</p>
      <ul className="space-y-0.5">
        {items.map((it) => {
          const on = active(it.href);
          return (
            <li key={it.href}>
              <Link href={it.href} aria-current={on ? "page" : undefined}
                className={`group flex h-11 items-center gap-3 rounded-full px-3.5 text-[15px] font-medium transition-all duration-200 ${on ? "bg-royal text-mist shadow-[0_8px_20px_-10px_rgb(29_78_71/0.7)]" : "text-ink-2 hover:bg-ink/5 hover:text-ink"}`}>
                <it.icon size={19} className={`shrink-0 ${on ? "" : "text-muted group-hover:text-royal"}`} />
                <span className="flex-1 truncate">{it.label}</span>
                {it.badge && (
                  <span className={`rounded-full px-2 py-0.5 text-[12px] font-bold tabular-nums ${on ? "bg-mist text-royal" : it.alert ? "bg-laterite text-mist" : "bg-royal-50 text-royal"}`}>{it.badge}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <aside data-hide-in-search aria-label="App"
      className="member-only fixed top-4 bottom-4 left-4 z-40 hidden w-[256px] flex-col overflow-hidden rounded-[30px] border border-white/70 bg-card/85 shadow-[0_24px_60px_-28px_rgb(35_27_22/0.45),0_2px_6px_-2px_rgb(35_27_22/0.08)] ring-1 ring-line/50 backdrop-blur-xl app:md:flex">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <Link href="/" aria-label={`${site.nameEn}, home`} className="flex min-w-0 items-center gap-3">
          <LogoIcon className="h-9 w-auto shrink-0" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-ml text-[14px] font-semibold">{site.nameMl}</span>
            <span className="block text-[12px] text-muted">{site.placeEn}</span>
          </span>
        </Link>
      </div>

      <div className="px-3">
        <SearchButton label="Search" className="w-full justify-start bg-mist/80 px-4 text-[15px] text-muted ring-1 ring-line/60 hover:bg-mist-2" />
      </div>

      <nav aria-label="Main" className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {group("Explore", explore)}
        {group("Account", mine)}
        {isAdmin && group("Staff", [{ href: "/admin", label: "Admin console", icon: LayoutDashboard }])}
      </nav>

      {user && (
        <div className="p-3 pt-0">
          <div className="flex items-center gap-3 rounded-[22px] bg-mist/80 px-3 py-2.5 ring-1 ring-line/60">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-kani font-display text-[15px] font-bold text-ink">{initials(user.name) || "★"}</span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[14.5px] font-semibold">{user.name}</span>
              <span className="flex items-center gap-1 font-mono text-[12.5px] text-muted">{isAdmin && <ShieldCheck size={12} className="text-royal" />}{user.card}</span>
            </span>
            <button type="button" onClick={signOut} disabled={leaving} aria-label="Sign out" title="Sign out"
              className="grid size-9 shrink-0 place-items-center rounded-full text-laterite-700 transition-colors hover:bg-laterite-50 disabled:opacity-50">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
