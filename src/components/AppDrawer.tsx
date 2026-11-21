"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BadgeIndianRupee, BookOpen, BookUp, CalendarDays, ClipboardList, Gavel, House, IdCard, LayoutDashboard, LibraryBig,
  LogOut, Megaphone, Palette, Settings, ShieldCheck, ShoppingBasket, UserRound, Users, Wallet, X,
} from "lucide-react";
import { useApi } from "@/lib/api";
import { initials, logout, useSession } from "@/lib/session";
import { inr } from "@/lib/format";
import type { MemberSummary } from "@/lib/types";
import { site } from "@/lib/site";

type Item = { href: string; label: string; icon: typeof House; badge?: string };

/** Slide-in navigation drawer for signed-in members (and staff tools for admins). */
export function AppDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, isAdmin } = useSession();
  const { data } = useApi<MemberSummary>(user ? "/api/me" : null);
  const path = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const here = path + (params.toString() ? `?${params}` : "");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", key); };
  }, [open, onClose]);

  if (!user) return null;

  const owed = data?.payments.filter((p) => p.status === "due").reduce((s, p) => s + p.amount, 0) ?? 0;
  const out = data?.loans.filter((l) => !l.returnedAt).length ?? 0;

  const mine: Item[] = [
    { href: "/", label: "Home", icon: House },
    { href: "/me?tab=books", label: "My books", icon: BookOpen, badge: out ? String(out) : undefined },
    { href: "/me?tab=payments", label: "Payments", icon: Wallet, badge: owed ? inr(owed) : undefined },
    { href: "/me?tab=bookings", label: "Bookings & orders", icon: Gavel },
    { href: "/me?tab=card", label: "Library card", icon: IdCard },
    { href: "/me?tab=profile", label: "Profile & PIN", icon: UserRound },
  ];
  const explore: Item[] = [
    { href: "/catalogue", label: "Find a book", icon: LibraryBig },
    { href: "/classes", label: "Classes", icon: Palette },
    { href: "/events", label: "Events & camps", icon: CalendarDays },
    { href: "/vipani", label: "Naattu Vipani", icon: ShoppingBasket },
  ];
  const admin: Item[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin?s=desk", label: "Issue & return", icon: BookUp },
    { href: "/admin?s=requests", label: "Requests", icon: ClipboardList },
    { href: "/admin?s=members", label: "Members", icon: Users },
    { href: "/admin?s=payments", label: "Payments", icon: BadgeIndianRupee },
    { href: "/admin?s=books", label: "Catalogue", icon: BookOpen },
    { href: "/admin?s=classes", label: "Classes", icon: Palette },
    { href: "/admin?s=events", label: "Events", icon: CalendarDays },
    { href: "/admin?s=products", label: "Vipani", icon: ShoppingBasket },
    { href: "/admin?s=notices", label: "Notices", icon: Megaphone },
    { href: "/admin?s=settings", label: "Settings", icon: Settings },
  ];

  const signOut = async () => {
    setLeaving(true);
    await logout();
    setLeaving(false);
    onClose();
    router.push("/");
  };

  const group = (title: string, items: Item[]) => (
    <div key={title} className="px-3 pt-4">
      <p className="px-3 pb-1.5 text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">{title}</p>
      <ul>
        {items.map((it) => {
          const active = here === it.href || (it.href === "/admin" && here === "/admin");
          return (
            <li key={it.href}>
              <Link href={it.href} onClick={onClose} aria-current={active ? "page" : undefined}
                className={`flex h-12 items-center gap-4 rounded-full px-3 text-[15.5px] font-medium transition-colors ${active ? "bg-royal-50 font-semibold text-royal" : "text-ink-2 active:bg-mist-2 sm:hover:bg-mist-2"}`}>
                <it.icon size={20} className="shrink-0" />
                <span className="flex-1 truncate">{it.label}</span>
                {it.badge && <span className="rounded-full bg-laterite px-2 py-0.5 text-[12px] font-bold text-mist tabular-nums">{it.badge}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  // On <body>, so it sits above the bottom nav (the sticky header is its own stacking layer).
  return createPortal(
    <div className={`fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-ink/45 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <nav
        aria-label="Menu"
        inert={!open}
        className={`absolute inset-y-0 left-0 flex w-[min(86vw,340px)] flex-col overflow-y-auto overscroll-contain bg-card pb-[env(safe-area-inset-bottom)] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Profile header */}
        <div className="relative bg-royal px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-5 text-mist">
          <button onClick={onClose} aria-label="Close menu" className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 grid size-10 place-items-center rounded-full text-mist/80 hover:bg-white/10"><X size={20} /></button>
          <span className="grid size-14 place-items-center rounded-full bg-kani font-display text-xl font-bold text-ink">{initials(user.name) || "★"}</span>
          <p className="mt-3 font-display text-lg leading-tight font-bold">{user.name}</p>
          <p className="font-mono text-[13.5px] text-mist/75">{user.card}</p>
          {isAdmin && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[12px] font-semibold"><ShieldCheck size={13} /> Library staff</span>}
        </div>

        {group("Me", mine)}
        {isAdmin && group("Admin", admin)}
        {group("Explore", explore)}

        <div className="mt-auto px-3 pt-6 pb-4">
          <button onClick={signOut} disabled={leaving} className="flex h-12 w-full items-center gap-4 rounded-full px-3 text-[15.5px] font-semibold text-laterite-700 hover:bg-laterite-50 disabled:opacity-60">
            <LogOut size={20} /> {leaving ? "Signing out…" : "Sign out"}
          </button>
          <p className="px-3 pt-3 text-[12.5px] leading-snug text-muted">{site.nameEn}<br />{site.hours.map((h) => `${h.days}: ${h.time}`).join(" · ")}</p>
        </div>
      </nav>
    </div>,
    document.body,
  );
}
