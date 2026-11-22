"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeIndianRupee, BookOpen, BookUp, CalendarDays, Check, ClipboardList, LayoutDashboard, Megaphone, Palette, Plus,
  RotateCcw, Settings, ShieldAlert, ShoppingBasket, Undo2, UserPlus, Users, X,
} from "lucide-react";
import { api, useApi } from "@/lib/api";
import { useSession } from "@/lib/session";
import { daysLeft, dueLabel, fine, fmtShort, fmtTime, inr, loanTone, Pill, REQUEST_LABEL, requestTone } from "@/lib/format";
import type { AdminOverview, LibRequest, Loan, RequestKind } from "@/lib/types";
import { Skeleton } from "../forms";
import { LoginForm } from "../LoginSheet";
import { Btn, Chips, EmptyRow, inputBox, Labeled, matchText, Panel, SearchBox, Stat, useRun } from "./kit";
import { ContentManager, MembersPanel, NoticesPanel, PaymentsPanel, SettingsPanel } from "./AdminContent";

export const SECTIONS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "desk", label: "Issue & return", icon: BookUp },
  { key: "requests", label: "Requests", icon: ClipboardList },
  { key: "members", label: "Members", icon: Users },
  { key: "payments", label: "Payments", icon: BadgeIndianRupee },
  { key: "books", label: "Catalogue", icon: BookOpen },
  { key: "classes", label: "Classes", icon: Palette },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "products", label: "Vipani", icon: ShoppingBasket },
  { key: "notices", label: "Notices", icon: Megaphone },
  { key: "settings", label: "Settings", icon: Settings },
] as const;
export type Section = (typeof SECTIONS)[number]["key"];

export function AdminApp() {
  const { user, ready, isAdmin } = useSession();
  const params = useSearchParams();
  const router = useRouter();
  const s = (SECTIONS.some((x) => x.key === params.get("s")) ? params.get("s") : "dashboard") as Section;
  const { data, error } = useApi<AdminOverview>(isAdmin ? "/api/admin/overview" : null);
  const go = (k: Section, extra = "") => router.push(k === "dashboard" ? "/admin" : `/admin?s=${k}${extra}`, { scroll: false });

  if (!ready) return <div className="mx-auto max-w-6xl space-y-3 px-4 pt-6"><Skeleton className="h-12" /><Skeleton className="h-40" /></div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 pt-10 pb-16">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Library staff</h1>
        <p className="mt-1 text-muted">Sign in with a staff library card.</p>
        <div className="mt-6 rounded-[28px] bg-card p-5 ring-1 ring-line/70"><LoginForm /></div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto grid max-w-md place-items-center px-5 py-24 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-laterite-50 text-laterite-700"><ShieldAlert size={28} /></span>
        <h1 className="mt-4 font-display text-2xl font-bold">Staff only</h1>
        <p className="mt-1 text-muted">This area is for library staff. Ask the librarian if you need access.</p>
        <Link href="/" className="mt-6 rounded-full bg-royal px-5 py-3 font-semibold text-mist">Go home</Link>
      </div>
    );
  }

  const counts: Partial<Record<Section, number>> = data ? {
    requests: data.requests.filter((r) => r.status === "pending").length,
    payments: data.payments.filter((p) => p.status === "verifying").length,
    desk: data.loans.filter((l) => !l.returnedAt && daysLeft(l.dueAt) < 0).length,
  } : {};
  const current = SECTIONS.find((x) => x.key === s)!;

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-0 pb-10 sm:px-5 lg:pt-6">
      {/* Desktop: side rail */}
      <aside className="sticky top-24 app:md:top-5 hidden h-fit w-60 shrink-0 rounded-[24px] bg-card p-2 ring-1 ring-line/70 lg:block">
        <p className="px-3 pt-2 pb-1 text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">Admin</p>
        {SECTIONS.map((x) => (
          <button key={x.key} onClick={() => go(x.key)} aria-current={s === x.key ? "page" : undefined}
            className={`flex h-11 w-full items-center gap-3 rounded-full px-3 text-[15px] font-medium ${s === x.key ? "bg-royal-50 font-semibold text-royal" : "text-ink-2 hover:bg-mist-2"}`}>
            <x.icon size={18} /> <span className="flex-1 text-left">{x.label}</span>
            {!!counts[x.key] && <span className="rounded-full bg-laterite px-2 text-[12px] font-bold text-mist">{counts[x.key]}</span>}
          </button>
        ))}
      </aside>

      <div className="min-w-0 flex-1">
        {/* Phones: title + scrolling section chips under the app bar */}
        <div className="sticky top-14 z-30 bg-mist/95 px-4 pt-3 pb-2 backdrop-blur-xl md:top-20 app:md:top-0 lg:static lg:bg-transparent lg:px-0 lg:pt-0 lg:backdrop-blur-none">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold tracking-[0.14em] text-kani-700 uppercase">Admin</p>
              <h1 className="truncate font-display text-[1.6rem] leading-tight font-extrabold tracking-tight">{current.label}</h1>
            </div>
          </div>
          <div className="no-scrollbar -mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 lg:hidden">
            {SECTIONS.map((x) => (
              <button key={x.key} onClick={() => go(x.key)} aria-pressed={s === x.key}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13.5px] font-semibold ${s === x.key ? "bg-royal text-mist" : "bg-card text-ink-2 ring-1 ring-line/70"}`}>
                <x.icon size={15} /> {x.label}
                {!!counts[x.key] && <span className={`rounded-full px-1.5 text-[11px] font-bold ${s === x.key ? "bg-mist text-royal" : "bg-laterite text-mist"}`}>{counts[x.key]}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pt-3 lg:px-0" key={s}>
          {error && <p className="mb-3 rounded-2xl bg-laterite-50 px-4 py-3 text-laterite-700">{error.message}</p>}
          {!data ? (
            <div className="grid gap-3 sm:grid-cols-2"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-64 sm:col-span-2" /></div>
          ) : s === "dashboard" ? <Dashboard d={data} go={go} />
            : s === "desk" ? <Desk d={data} />
            : s === "requests" ? <Requests d={data} />
            : s === "members" ? <MembersPanel d={data} />
            : s === "payments" ? <PaymentsPanel d={data} />
            : s === "notices" ? <NoticesPanel d={data} />
            : s === "settings" ? <SettingsPanel d={data} />
            : <ContentManager d={data} type={s} />}
        </div>
      </div>
    </div>
  );
}

/* ───────── Dashboard ───────── */

function Dashboard({ d, go }: { d: AdminOverview; go: (k: Section, extra?: string) => void }) {
  const r = useRun();
  const out = d.loans.filter((l) => !l.returnedAt);
  const late = out.filter((l) => daysLeft(l.dueAt) < 0);
  const pending = d.requests.filter((x) => x.status === "pending");
  const verify = d.payments.filter((p) => p.status === "verifying");
  const dueTotal = d.payments.filter((p) => p.status === "due").reduce((s, p) => s + p.amount, 0);
  const month = new Date().toISOString().slice(0, 7);
  const collected = d.payments.filter((p) => p.status === "paid" && (p.paidAt ?? "").startsWith(month)).reduce((s, p) => s + p.amount, 0);
  const copies = d.books.reduce((s, b) => s + b.copies, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Members" value={d.members.length} sub={`${d.members.filter((m) => m.role === "admin").length} staff`} onClick={() => go("members")} />
        <Stat label="Books out" value={out.length} sub={`of ${copies} copies`} onClick={() => go("desk")} />
        <Stat label="Overdue" value={late.length} sub={late.length ? `${inr(late.reduce((s, l) => s + fine(l, d.settings.finePerDay), 0))} in fines` : "All on time"} tone={late.length ? "bg-laterite-50" : "bg-card"} onClick={() => go("desk")} />
        <Stat label="Collected" value={inr(collected)} sub={`this month · ${inr(dueTotal)} due`} tone="bg-teal-50" onClick={() => go("payments")} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { l: "Issue a book", I: BookUp, k: "desk" as const },
          { l: "New member", I: UserPlus, k: "members" as const, x: "&new=1" },
          { l: "Add a book", I: Plus, k: "books" as const, x: "&new=1" },
          { l: "Post notice", I: Megaphone, k: "notices" as const },
        ].map((a) => (
          <button key={a.l} onClick={() => go(a.k, a.x)} className="flex items-center gap-3 rounded-2xl bg-royal px-4 py-3.5 text-left text-[14.5px] font-semibold text-mist active:scale-[0.98] sm:hover:bg-royal-700">
            <a.I size={19} className="shrink-0 text-kani" /> {a.l}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={<>Waiting for you <span className="text-muted">{pending.length}</span></>} action={<Btn tone="soft" onClick={() => go("requests")}>All requests</Btn>}>
          {pending.length ? (
            <ul className="divide-y divide-line">
              {pending.slice(0, 5).map((x) => <RequestRow key={x.id} x={x} d={d} r={r} compact />)}
            </ul>
          ) : <EmptyRow>No new requests.</EmptyRow>}
        </Panel>

        <Panel title={<>UPI to confirm <span className="text-muted">{verify.length}</span></>} action={<Btn tone="soft" onClick={() => go("payments")}>Payments</Btn>}>
          {verify.length ? (
            <ul className="divide-y divide-line">
              {verify.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{p.name} · {inr(p.amount)}</span>
                    <span className="block truncate text-[13px] text-muted">{p.title} · UTR {p.utr}</span>
                  </span>
                  <Btn icon={Check} busy={r.busy === p.id} onClick={() => r.run(p.id, () => api(`/api/admin/payments/${p.id}`, { method: "PATCH", body: { action: "confirm" } }), "Payment confirmed.")}>Confirm</Btn>
                </li>
              ))}
            </ul>
          ) : <EmptyRow>Nothing to check.</EmptyRow>}
        </Panel>

        <Panel title={<>Overdue <span className="text-muted">{late.length}</span></>} className="lg:col-span-2">
          {late.length ? (
            <ul className="divide-y divide-line">
              {late.map((l) => <LoanRow key={l.id} l={l} d={d} r={r} />)}
            </ul>
          ) : <EmptyRow>Every book is on time.</EmptyRow>}
        </Panel>
      </div>
      {r.toast}
    </div>
  );
}

/* ───────── Shared rows ───────── */

function LoanRow({ l, d, r }: { l: Loan; d: AdminOverview; r: ReturnType<typeof useRun> }) {
  const m = d.members.find((x) => x.card === l.card);
  const f = fine(l, d.settings.finePerDay);
  const ret = (waiveFine = false) => r.run(l.id, () => api<{ payment?: { amount: number } }>(`/api/admin/loans/${l.id}/return`, { body: { waiveFine } }),
    (res) => (res.payment ? `Returned. Fine ${inr(res.payment.amount)} ${waiveFine ? "waived" : "added to payments"}.` : "Returned. Back on the shelf."));
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-royal-50 text-royal"><BookOpen size={18} /></span>
      <span className="min-w-[min(100%,15rem)] flex-1">
        <span className="block truncate font-semibold">{l.title}</span>
        <span className="block truncate text-[13px] text-muted">{m?.name ?? l.card} · {l.card} · {m ? `+91 ${m.phone}` : ""}</span>
      </span>
      <span className="flex items-center gap-2">
        <Pill tone={loanTone(l)}>{dueLabel(l).split(" · ")[0]}</Pill>
        {f > 0 && <span className="text-[13px] font-semibold text-laterite-700">{inr(f)}</span>}
        <Btn icon={Undo2} busy={r.busy === l.id} onClick={() => ret(false)}>Return</Btn>
        {f > 0 && <Btn tone="soft" disabled={r.busy === l.id} onClick={() => ret(true)} title="Return and waive the fine">Waive</Btn>}
      </span>
    </li>
  );
}

function RequestRow({ x, d, r, compact }: { x: LibRequest; d: AdminOverview; r: ReturnType<typeof useRun>; compact?: boolean }) {
  const set = (status: string, msg: string) => r.run(x.id, () => api(`/api/requests/${x.id}`, { method: "PATCH", body: { status } }), msg);
  const issue = () => r.run(x.id, () => api("/api/admin/loans", { body: { card: x.card, bookId: x.itemId, requestId: x.id } }), `${x.title} issued to ${x.name}.`);
  const book = x.kind === "Reserve" ? d.books.find((b) => b.id === x.itemId) : undefined;
  const open = ["pending", "confirmed", "ready"].includes(x.status);

  const actions: React.ReactNode[] = [];
  if (x.kind === "Reserve" && x.status === "pending") {
    if (book && book.available > 0) actions.push(<Btn key="h" tone="ghost" onClick={() => set("ready", "Copy held at the desk. Member sees it's ready.")}>Hold copy</Btn>);
    actions.push(<Btn key="i" icon={BookUp} disabled={!book || book.available <= 0} onClick={issue}>Issue</Btn>);
  }
  if (x.kind === "Reserve" && x.status === "ready") actions.push(<Btn key="i" icon={BookUp} onClick={issue}>Issue</Btn>);
  if (x.kind === "Order" && x.status === "pending") actions.push(<Btn key="r" onClick={() => set("ready", "Marked ready for pickup.")}>Ready</Btn>);
  if (x.kind === "Order" && x.status === "ready") actions.push(<Btn key="d" icon={Check} onClick={() => set("done", "Order collected.")}>Collected</Btn>);
  if ((x.kind === "Enrol" || x.kind === "Register") && x.status === "confirmed") actions.push(<Btn key="d" tone="ghost" icon={Check} onClick={() => set("done", "Marked as attended.")}>Done</Btn>);
  if (open && x.kind !== "Bid") actions.push(<Btn key="x" tone="danger" icon={X} onClick={() => { if (confirm(`Decline ${x.id}?`)) set("declined", "Declined."); }} aria-label="Decline" />);
  if (!open && x.kind !== "Bid") actions.push(<Btn key="o" tone="soft" icon={RotateCcw} onClick={() => set("pending", "Re-opened.")} aria-label="Re-open" />);

  return (
    <li className={`flex flex-wrap items-center gap-x-3 gap-y-2 py-3 ${r.busy === x.id ? "opacity-60" : ""}`}>
      <span className="min-w-[min(100%,15rem)] flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-semibold">{x.title}</span>
          {!compact && <Pill tone={requestTone(x.status)}>{x.kind === "Bid" && x.status === "confirmed" ? "Leading" : REQUEST_LABEL[x.status]}</Pill>}
        </span>
        <span className="block truncate text-[13px] text-muted">{x.kind} · {x.name} ({x.card}) · {x.detail}{x.amount ? ` · ${inr(x.amount)}` : ""}</span>
        <span className="block text-[12px] text-muted">{x.id} · {fmtTime(x.at)}{book ? ` · ${book.available} on shelf` : ""}</span>
      </span>
      <span className="flex flex-wrap items-center gap-1.5">{actions}</span>
    </li>
  );
}

/* ───────── Desk: issue and return ───────── */

function Desk({ d }: { d: AdminOverview }) {
  const r = useRun();
  const [card, setCard] = useState("");
  const [bq, setBq] = useState("");
  const [bookId, setBookId] = useState("");
  const [days, setDays] = useState(String(d.settings.loanDays));
  const [q, setQ] = useState("");
  const key = card.match(/\d{4}/)?.[0];
  const member = key ? d.members.find((m) => m.card.endsWith(key)) : undefined;
  const memberLoans = member ? d.loans.filter((l) => l.card === member.card && !l.returnedAt) : [];
  const memberDue = member ? d.payments.filter((p) => p.card === member.card && p.status === "due").reduce((s, p) => s + p.amount, 0) : 0;
  const bookHits = useMemo(() => (bq.trim() ? d.books.filter((b) => matchText(bq, b.title, b.titleMl, b.author, b.shelf, b.id)).slice(0, 6) : []), [bq, d.books]);
  const book = d.books.find((b) => b.id === bookId);
  const out = d.loans.filter((l) => !l.returnedAt && matchText(q, l.title, l.card, d.members.find((m) => m.card === l.card)?.name)).sort((a, b) => a.dueAt.localeCompare(b.dueAt));

  const issue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return r.show("Enter a valid library number.", true);
    if (!book) return r.show("Pick a book.", true);
    const res = await r.run("issue", () => api("/api/admin/loans", { body: { card: member.card, bookId: book.id, days: Number(days) } }), `${book.title} issued to ${member.name}.`);
    if (res) { setBookId(""); setBq(""); }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[400px_1fr]">
      <Panel title="Issue a book">
        <form onSubmit={issue} className="space-y-3">
          <Labeled label="Library number" hint="The 4 digits on the member's card">
            <input className={inputBox} inputMode="numeric" value={card} onChange={(e) => setCard(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="e.g. 1234" />
          </Labeled>
          {key?.length === 4 && (member ? (
            <div className={`rounded-2xl px-3.5 py-2.5 text-[14px] ${member.blocked ? "bg-laterite-50 text-laterite-700" : "bg-teal-50 text-teal-700"}`}>
              <b className="font-semibold">{member.name}</b> · {memberLoans.length} out{memberDue ? ` · ${inr(memberDue)} due` : ""}{member.blocked ? " · ON HOLD" : ""}
            </div>
          ) : <p className="rounded-2xl bg-laterite-50 px-3.5 py-2.5 text-[14px] text-laterite-700">No member with ONV {key}.</p>)}
          <Labeled label="Book">
            {book ? (
              <div className="flex items-center gap-2 rounded-2xl bg-royal-50 px-3.5 py-2.5">
                <span className="min-w-0 flex-1"><b className="block truncate">{book.title}</b><span className="text-[13px] text-muted">{book.author} · shelf {book.shelf} · {book.available}/{book.copies} on shelf</span></span>
                <button type="button" onClick={() => setBookId("")} aria-label="Change book" className="text-muted"><X size={17} /></button>
              </div>
            ) : (
              <>
                <input className={inputBox} value={bq} onChange={(e) => setBq(e.target.value)} placeholder="Search title, author or shelf" />
                {bookHits.length > 0 && (
                  <ul className="mt-1.5 overflow-hidden rounded-2xl ring-1 ring-line">
                    {bookHits.map((b) => (
                      <li key={b.id}>
                        <button type="button" disabled={b.available <= 0} onClick={() => setBookId(b.id)} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left hover:bg-mist disabled:opacity-50">
                          <span className="min-w-0 flex-1 truncate">{b.title} <span className="text-[13px] text-muted">· {b.author}</span></span>
                          <span className="text-[12.5px] text-muted">{b.available > 0 ? `${b.available} left` : "All out"}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </Labeled>
          <Labeled label="Loan length (days)">
            <input className={inputBox} inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, "").slice(0, 2))} />
          </Labeled>
          <Btn type="submit" icon={BookUp} busy={r.busy === "issue"} disabled={!member || !book || member.blocked} className="w-full py-3 text-[15px]">Issue book</Btn>
        </form>
      </Panel>

      <Panel title={<>Books out <span className="text-muted">{d.loans.filter((l) => !l.returnedAt).length}</span></>}>
        <SearchBox value={q} onChange={setQ} placeholder="Find by title, name or card" />
        {out.length ? <ul className="mt-2 divide-y divide-line">{out.map((l) => <LoanRow key={l.id} l={l} d={d} r={r} />)}</ul> : <div className="mt-3"><EmptyRow>No books out{q ? " for that search" : ""}.</EmptyRow></div>}
      </Panel>
      {r.toast}
    </div>
  );
}

/* ───────── Requests ───────── */

const STATUS_TABS = ["Open", "Waiting", "Ready", "Closed", "All"] as const;
const KINDS = ["All kinds", "Reserve", "Enrol", "Register", "Order", "Bid"] as const;

function Requests({ d }: { d: AdminOverview }) {
  const r = useRun();
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]>("Open");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("All kinds");
  const [q, setQ] = useState("");
  const isOpen = (x: LibRequest) => ["pending", "confirmed", "ready"].includes(x.status);
  const byTab = (x: LibRequest) => tab === "All" || (tab === "Open" ? isOpen(x) : tab === "Waiting" ? x.status === "pending" : tab === "Ready" ? x.status === "ready" : !isOpen(x));
  const list = d.requests.filter((x) => byTab(x) && (kind === "All kinds" || x.kind === (kind as RequestKind)) && matchText(q, x.title, x.name, x.card, x.id));
  const counts = { Open: d.requests.filter(isOpen).length, Waiting: d.requests.filter((x) => x.status === "pending").length, Ready: d.requests.filter((x) => x.status === "ready").length };

  return (
    <Panel>
      <div className="space-y-2.5">
        <Chips options={STATUS_TABS} value={tab} onChange={setTab} counts={counts} />
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchBox value={q} onChange={setQ} placeholder="Search name, card, item or reference" />
          <select value={kind} onChange={(e) => setKind(e.target.value as (typeof KINDS)[number])} className="h-11 rounded-full bg-mist px-4 text-[14.5px] font-semibold">
            {KINDS.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
      </div>
      {list.length ? <ul className="mt-2 divide-y divide-line">{list.map((x) => <RequestRow key={x.id} x={x} d={d} r={r} />)}</ul> : <div className="mt-3"><EmptyRow>Nothing here.</EmptyRow></div>}
      <p className="mt-3 text-[12.5px] text-muted">Reservations: Hold copy takes one off the shelf and tells the member it&apos;s ready; Issue lends it. Updated {fmtShort(new Date().toISOString())}.</p>
      {r.toast}
    </Panel>
  );
}
