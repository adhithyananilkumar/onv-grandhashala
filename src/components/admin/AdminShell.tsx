"use client";

import { createContext, useCallback, useContext, useEffect, useEffectEvent, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, BookUp, CalendarPlus, Ellipsis, Gavel, House, LayoutDashboard, LogOut, Megaphone, Plus, ReceiptText, ShieldAlert, ShieldCheck, UserPlus, Wallet, X } from "lucide-react";
import { useApi } from "@/lib/api";
import { daysLeft } from "@/lib/format";
import { initials, logout, useSession } from "@/lib/session";
import { site } from "@/lib/site";
import type { AdminOverview } from "@/lib/types";
import { Sheet, Skeleton } from "../forms";
import { LogoIcon } from "../Logo";
import { GROUPS, SECTIONS, sectionPath, type Pending, type SectionKey } from "./sections";

type AdminCtx = {
  d: AdminOverview;
  /** Open a section, optionally telling it what to do on arrival. */
  go: (section: SectionKey, extra?: Omit<Pending, "section">) => void;
  pending: Pending | null;
  clear: () => void;
  section: SectionKey;
  /** The item open on a detail page (/admin/events/e1 → "e1"). */
  id?: string;
};

/** The event coming up soonest (or the first one if none are ahead). */
function nextEventId(d: AdminOverview) {
  const t = new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10);
  return d.events.filter((e) => e.date >= t).sort((a, b) => a.date.localeCompare(b.date))[0]?.id ?? d.events[0]?.id;
}

/** Sections whose items have their own page. */
const DETAIL: SectionKey[] = ["events", "classes", "books", "products"];
const Ctx = createContext<AdminCtx | null>(null);
export const useAdmin = () => useContext(Ctx)!;

/** Run `fn` once when a shortcut sends you to this section with something to do. */
export function usePending(section: SectionKey, fn: (p: Pending) => void) {
  const { pending, clear } = useAdmin();
  const run = useEffectEvent(fn);
  useEffect(() => {
    if (pending?.section === section) { run(pending); clear(); }
  }, [pending, section, clear]);
}

export const sectionFromPath = (path: string): SectionKey => {
  const k = path.replace(/^\/admin\/?/, "").split("/")[0];
  return (SECTIONS.find((s) => s.key === k)?.key ?? "dashboard") as SectionKey;
};

const QUICK: { label: string; hint: string; icon: typeof House; section: SectionKey; action?: string }[] = [
  { label: "Issue or return", hint: "At the desk", icon: BookUp, section: "desk" },
  { label: "Find a book", hint: "Search the shelves", icon: BookOpen, section: "books", action: "search" },
  { label: "Add a book", hint: "New title or copies", icon: BookOpen, section: "books", action: "new" },
  { label: "New member", hint: "Issue a card", icon: UserPlus, section: "members", action: "new" },
  { label: "Register for event", hint: "Even without an account", icon: CalendarPlus, section: "events", action: "register" },
  { label: "Money in", hint: "Donation, fee, sale", icon: Wallet, section: "accounts", action: "in" },
  { label: "Money out", hint: "Bill, purchase", icon: ReceiptText, section: "accounts", action: "out" },
  { label: "Live bidding", hint: "Run an auction", icon: Gavel, section: "auctions" },
  { label: "Post a notice", hint: "To every member", icon: Megaphone, section: "notices" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, ready, isAdmin } = useSession();
  const path = usePathname();
  const router = useRouter();
  const section = sectionFromPath(path);
  const id = path.split("/")[3] || undefined;
  const { data, error, refresh } = useApi<AdminOverview>(isAdmin ? "/api/admin/overview" : null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [sheet, setSheet] = useState<"quick" | "more" | null>(null);
  const [leaving, setLeaving] = useState(false);

  const go = useCallback((s: SectionKey, extra?: Omit<Pending, "section">) => {
    setSheet(null);
    let target = extra?.id;
    // "Register for event" with no event chosen: the next one coming up.
    if (s === "events" && extra?.action === "register" && !target && data) {
      target = nextEventId(data);
    }
    if (DETAIL.includes(s) && target) {
      const { action, q } = extra ?? {};
      setPending(action || q ? { section: s, action, q } : null);
      router.push(`/admin/${s}/${target}`, { scroll: false });
      return;
    }
    setPending(extra ? { section: s, ...extra } : null);
    router.push(sectionPath(s), { scroll: false });
  }, [router, data, setSheet]);
  const clear = useCallback(() => setPending(null), []);

  // Signed out: the shared sign-in page, which returns here (same section) once signed in.
  useEffect(() => {
    if (ready && !user) router.replace(`/join?next=${encodeURIComponent(path)}`);
  }, [ready, user, path, router]);

  // Keep the console fresh while it's open; much faster during a live auction.
  useEffect(() => {
    if (!isAdmin) return;
    const id = setInterval(refresh, section === "auctions" ? 4000 : 30_000);
    return () => clearInterval(id);
  }, [isAdmin, section, refresh]);

  // New screen, back to the top.
  useEffect(() => { document.getElementById("admin-scroll")?.scrollTo({ top: 0 }); }, [section]);

  const counts = useMemo<Partial<Record<SectionKey, number>>>(() => data ? {
    requests: data.requests.filter((r) => r.status === "pending").length,
    payments: data.payments.filter((p) => p.status === "verifying").length,
    desk: data.loans.filter((l) => !l.returnedAt && daysLeft(l.dueAt) < 0).length,
    auctions: data.products.filter((p) => p.auction?.live && !p.auction.closedAt).length,
  } : {}, [data]);

  const frame = (inner: React.ReactNode) => <div className="fixed inset-0 z-[60] overflow-y-auto bg-mist">{inner}</div>;

  if (!ready) return frame(<div className="mx-auto max-w-3xl space-y-3 px-4 pt-6"><Skeleton className="h-12" /><Skeleton className="h-40" /></div>);
  // Signed out: use the library's own sign-in page (staff wording), then come straight back here.
  if (!user) return frame(<div className="grid min-h-svh place-items-center"><span className="size-8 animate-spin rounded-full border-4 border-royal/20 border-t-royal" aria-label="Loading" /></div>);
  if (!isAdmin) {
    return frame(
      <div className="mx-auto grid max-w-md place-items-center px-5 py-24 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-laterite-50 text-laterite-700"><ShieldAlert size={28} /></span>
        <h1 className="mt-4 font-display text-2xl font-bold">Staff only</h1>
        <p className="mt-1 text-muted">This area is for library staff. Ask the librarian if you need access.</p>
        <Link href="/" className="mt-6 rounded-full bg-royal px-5 py-3 font-semibold text-mist">Go home</Link>
      </div>,
    );
  }

  const current = SECTIONS.find((s) => s.key === section)!;
  const signOut = async () => { setLeaving(true); await logout(); setLeaving(false); router.push("/"); };
  const badge = (k: SectionKey, on: boolean, big = false) => !!counts[k] && (
    <span className={`rounded-full px-2 text-[12px] font-bold tabular-nums ${big ? "py-0.5" : ""} ${on ? "bg-mist text-royal" : k === "auctions" ? "bg-teal text-mist" : "bg-laterite text-mist"}`}>{counts[k]}</span>
  );

  const bottom: { key: SectionKey; label: string; icon: typeof House }[] = [
    { key: "dashboard", label: "Home", icon: LayoutDashboard },
    { key: "desk", label: "Desk", icon: BookUp },
    { key: "books", label: "Books", icon: BookOpen },
  ];
  const moreActive = !["dashboard", "desk", "books"].includes(section);

  return (
    <Ctx.Provider value={data ? { d: data, go, pending, clear, section, id } : null as unknown as AdminCtx}>
      <div className="fixed inset-0 z-[60] flex bg-mist">
        {/* Desktop: its own sidebar, separate from the member app */}
        <aside aria-label="Admin" className="hidden w-[264px] shrink-0 flex-col border-r border-line/70 bg-card/70 lg:flex">
          <div className="flex items-center gap-3 px-5 pt-5 pb-3">
            <LogoIcon className="h-9 w-auto shrink-0" />
            <span className="min-w-0 leading-tight">
              <span className="block text-[11.5px] font-semibold tracking-[0.14em] text-kani-700 uppercase">Staff console</span>
              <span className="block truncate text-[13.5px] text-muted">{site.nameEn}</span>
            </span>
          </div>
          <nav aria-label="Admin sections" className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-4">
            {GROUPS.map((g) => (
              <div key={g} className="pt-4">
                <p className="px-3 pb-1.5 text-[11.5px] font-semibold tracking-[0.14em] text-muted uppercase">{g}</p>
                {SECTIONS.filter((s) => s.group === g).map((s) => {
                  const on = s.key === section;
                  return (
                    <Link key={s.key} href={sectionPath(s.key)} aria-current={on ? "page" : undefined}
                      className={`flex h-11 items-center gap-3 rounded-full px-3.5 text-[15px] font-medium transition-colors ${on ? "bg-royal text-mist" : "text-ink-2 hover:bg-ink/5"}`}>
                      <s.icon size={18} className={on ? "" : "text-muted"} />
                      <span className="flex-1 truncate">{s.label}</span>
                      {badge(s.key, on)}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="space-y-1 border-t border-line/70 p-3">
            <Link href="/" className="flex h-10 items-center gap-3 rounded-full px-3.5 text-[14.5px] font-medium text-ink-2 hover:bg-ink/5"><ArrowLeft size={17} className="text-muted" /> Library site</Link>
            <div className="flex items-center gap-3 rounded-2xl bg-mist px-3 py-2 ring-1 ring-line/60">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-kani font-display text-[14px] font-bold text-ink">{initials(user.name) || "★"}</span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[14px] font-semibold">{user.name}</span>
                <span className="flex items-center gap-1 font-mono text-[12px] text-muted"><ShieldCheck size={12} className="text-royal" />{user.card}</span>
              </span>
              <button onClick={signOut} disabled={leaving} aria-label="Sign out" className="grid size-9 place-items-center rounded-full text-laterite-700 hover:bg-laterite-50"><LogOut size={17} /></button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Phones and tablets: slim title bar */}
          <header className="flex shrink-0 items-center gap-3 border-b border-line/60 bg-card/80 px-4 pt-[max(0.6rem,env(safe-area-inset-top))] pb-2.5 backdrop-blur-xl lg:hidden">
            <Link href={id ? sectionPath(section) : "/"} aria-label={id ? `Back to ${current.label}` : "Back to the library site"} className="grid size-10 shrink-0 place-items-center rounded-full bg-mist-2 text-ink-2"><ArrowLeft size={19} /></Link>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-kani-700 uppercase">Staff console</p>
              <h1 className="truncate font-display text-[1.25rem] font-extrabold tracking-tight">{current.label}</h1>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-kani font-display text-[14px] font-bold text-ink">{initials(user.name) || "★"}</span>
          </header>

          <main id="admin-scroll" className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(96px+env(safe-area-inset-bottom))] lg:pb-10">
            <div className="mx-auto max-w-5xl px-4 pt-4 lg:max-w-none lg:px-8 lg:pt-7 2xl:px-12">
              <h1 className="mb-4 hidden font-display text-[1.9rem] leading-tight font-extrabold tracking-tight lg:block">{current.label}</h1>
              {error && <p className="mb-3 rounded-2xl bg-laterite-50 px-4 py-3 text-laterite-700">{error.message}</p>}
              {!data ? (
                <div className="grid gap-3 sm:grid-cols-2"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-64 sm:col-span-2" /></div>
              ) : <div key={section}>{children}</div>}
            </div>
          </main>

          {/* Phones: thumb-reach bar with the big + in the middle */}
          <nav aria-label="Admin" className="fixed inset-x-0 bottom-0 z-[65] border-t border-line/70 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
            <ul className="mx-auto grid max-w-lg grid-cols-5 items-end px-2">
              {[...bottom.slice(0, 2), null, bottom[2], "more" as const].map((it, i) => {
                if (it === null) {
                  return (
                    <li key="plus" className="flex justify-center">
                      <button onClick={() => setSheet("quick")} aria-label="Quick add" className="-mt-5 grid size-14 place-items-center rounded-full bg-royal text-mist shadow-[0_10px_24px_-8px_rgb(29_78_71/0.8)] ring-4 ring-card active:scale-95"><Plus size={28} /></button>
                    </li>
                  );
                }
                const on = it === "more" ? moreActive : it.key === section;
                const Icon = it === "more" ? Ellipsis : it.icon;
                const n = it === "more" ? (counts.requests ?? 0) + (counts.payments ?? 0) : counts[it.key] ?? 0;
                const inner = (
                  <>
                    <span className="relative"><Icon size={22} />{n > 0 && <span className="absolute -top-1.5 -right-2.5 grid min-w-4 place-items-center rounded-full bg-laterite px-1 text-[10px] leading-4 font-bold text-mist">{n}</span>}</span>
                    <span className="text-[11.5px] font-semibold">{it === "more" ? "More" : it.label}</span>
                  </>
                );
                const cls = `flex h-[60px] w-full flex-col items-center justify-center gap-0.5 rounded-xl ${on ? "text-royal" : "text-muted"}`;
                return (
                  <li key={i}>
                    {it === "more"
                      ? <button onClick={() => setSheet("more")} className={cls}>{inner}</button>
                      : <Link href={sectionPath(it.key)} aria-current={on ? "page" : undefined} className={cls}>{inner}</Link>}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Quick add: the things staff do all day, one tap away */}
        {sheet === "quick" && (
          <Sheet title="Quick add" subtitle="What do you need to do?" onClose={() => setSheet(null)}>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK.map((q) => (
                <button key={q.label} onClick={() => go(q.section, q.action ? { action: q.action } : undefined)}
                  className="flex min-h-[84px] flex-col items-start justify-between gap-2 rounded-2xl bg-card p-3.5 text-left ring-1 ring-line/70 active:scale-[0.97]">
                  <q.icon size={21} className="text-royal" />
                  <span><span className="block text-[15px] leading-tight font-semibold">{q.label}</span><span className="block text-[12.5px] text-muted">{q.hint}</span></span>
                </button>
              ))}
            </div>
          </Sheet>
        )}

        {/* More: every section */}
        {sheet === "more" && (
          <Sheet title="All sections" onClose={() => setSheet(null)}>
            <div className="space-y-4">
              {GROUPS.map((g) => (
                <div key={g}>
                  <p className="mb-1.5 text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">{g}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTIONS.filter((s) => s.group === g).map((s) => (
                      <button key={s.key} onClick={() => go(s.key)} aria-current={s.key === section ? "page" : undefined}
                        className={`flex h-14 items-center gap-3 rounded-2xl px-3.5 text-left text-[14.5px] font-semibold ring-1 active:scale-[0.97] ${s.key === section ? "bg-royal text-mist ring-royal" : "bg-card ring-line/70"}`}>
                        <s.icon size={19} className="shrink-0" /><span className="flex-1 leading-tight">{s.label}</span>{badge(s.key, s.key === section)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <Link href="/" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-mist-2 text-[14.5px] font-semibold"><House size={17} /> Library site</Link>
                <button onClick={signOut} disabled={leaving} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-laterite-50 text-[14.5px] font-semibold text-laterite-700"><LogOut size={17} /> Sign out</button>
              </div>
              <button onClick={() => setSheet(null)} className="sr-only"><X /> Close</button>
            </div>
          </Sheet>
        )}
      </div>
    </Ctx.Provider>
  );
}
