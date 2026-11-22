"use client";

import { useMemo, useState } from "react";
import {
  BookOpen, BookUp, CalendarDays, Check, Gavel, Megaphone, Minus, Plus, RotateCcw, UserPlus, Undo2, Users, Wallet, X,
} from "lucide-react";
import { api } from "@/lib/api";
import { daysLeft, dueLabel, fine, fmtShort, fmtTime, inr, loanTone, Pill, REQUEST_LABEL, requestTone } from "@/lib/format";
import type { AdminOverview, LibRequest, Loan, RequestKind } from "@/lib/types";
import { useAdmin, usePending } from "./AdminShell";
import { Btn, Chips, EmptyRow, inputBox, Labeled, matchText, Panel, SearchBox, Stat, useRun } from "./kit";

const istDay = () => new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10);

/* ───────── Dashboard ───────── */

/** One box that finds books, members and events, so staff never have to know which screen to open. */
function FindAnything({ d }: { d: AdminOverview }) {
  const { go } = useAdmin();
  const [q, setQ] = useState("");
  const t = q.trim();
  const books = useMemo(() => (t ? d.books.filter((b) => matchText(t, b.title, b.titleMl, b.author, b.shelf, b.category, b.id)).slice(0, 4) : []), [t, d.books]);
  const members = useMemo(() => (t ? d.members.filter((m) => matchText(t, m.name, m.card, m.phone, m.ward)).slice(0, 4) : []), [t, d.members]);
  const events = useMemo(() => (t ? d.events.filter((e) => matchText(t, e.title, e.titleMl, e.place)).slice(0, 3) : []), [t, d.events]);
  const none = t && !books.length && !members.length && !events.length;
  const row = "flex w-full items-center gap-3 px-4 py-3 text-left active:bg-mist-2";
  return (
    <div className="relative">
      <SearchBox value={q} onChange={setQ} placeholder="Find a book, member or event" />
      {t && (
        <div className="mt-2 overflow-hidden rounded-3xl bg-card ring-1 ring-line/70">
          {none && <p className="px-4 py-5 text-center text-muted">Nothing found for &ldquo;{t}&rdquo;.</p>}
          {books.map((b) => (
            <button key={b.id} className={row} onClick={() => go("books", { q: t })}>
              <BookOpen size={18} className="shrink-0 text-royal" />
              <span className="min-w-0 flex-1"><b className="block truncate font-semibold">{b.title}</b><span className="block truncate text-[13px] text-muted">{b.author} · shelf {b.shelf}</span></span>
              <Pill tone={b.available > 0 ? "good" : "bad"}>{b.available}/{b.copies}</Pill>
            </button>
          ))}
          {members.map((m) => (
            <button key={m.card} className={`${row} border-t border-line/60`} onClick={() => go("members", { id: m.card })}>
              <Users size={18} className="shrink-0 text-royal" />
              <span className="min-w-0 flex-1"><b className="block truncate font-semibold">{m.name}</b><span className="block truncate text-[13px] text-muted">{m.card} · +91 {m.phone}</span></span>
            </button>
          ))}
          {events.map((e) => (
            <button key={e.id} className={`${row} border-t border-line/60`} onClick={() => go("events", { id: e.id })}>
              <CalendarDays size={18} className="shrink-0 text-royal" />
              <span className="min-w-0 flex-1"><b className="block truncate font-semibold">{e.title}</b><span className="block truncate text-[13px] text-muted">{fmtShort(`${e.date}T00:00:00+05:30`)} · {e.place}</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Dashboard({ d }: { d: AdminOverview }) {
  const { go } = useAdmin();
  const r = useRun();
  const out = d.loans.filter((l) => !l.returnedAt);
  const late = out.filter((l) => daysLeft(l.dueAt) < 0);
  const pending = d.requests.filter((x) => x.status === "pending");
  const verify = d.payments.filter((p) => p.status === "verifying");
  const dueTotal = d.payments.filter((p) => p.status === "due").reduce((s, p) => s + p.amount, 0);
  const month = new Date().toISOString().slice(0, 7);
  const collected = d.payments.filter((p) => p.status === "paid" && (p.paidAt ?? "").startsWith(month)).reduce((s, p) => s + p.amount, 0);
  const copies = d.books.reduce((s, b) => s + b.copies, 0);
  const live = d.products.filter((p) => p.auction?.live && !p.auction.closedAt);
  const today = istDay();
  const upcoming = d.events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const regs = (id: string) => d.requests.filter((x) => x.itemId === id && x.kind === "Register" && ["pending", "confirmed", "ready", "done"].includes(x.status)).length + d.guests.filter((g) => g.eventId === id).length;
  const visitors = d.visits[today] ?? 0;
  const tally = (delta: number) => r.run("visit", () => api("/api/admin/visits", { body: { delta } }));

  return (
    <div className="space-y-4">
      <FindAnything d={d} />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { l: "Issue a book", I: BookUp, k: "desk" as const },
          { l: "New member", I: UserPlus, k: "members" as const, a: "new" },
          { l: "Add a book", I: Plus, k: "books" as const, a: "new" },
          { l: "Register for event", I: CalendarDays, k: "events" as const, a: "register" },
          { l: "Money in", I: Wallet, k: "accounts" as const, a: "in" },
          { l: "Money out", I: Minus, k: "accounts" as const, a: "out" },
          { l: "Live bidding", I: Gavel, k: "auctions" as const },
          { l: "Post notice", I: Megaphone, k: "notices" as const },
        ].map((a) => (
          <button key={a.l} onClick={() => go(a.k, a.a ? { action: a.a } : undefined)} className="flex min-h-14 items-center gap-3 rounded-2xl bg-royal px-4 py-3 text-left text-[14.5px] leading-tight font-semibold text-mist active:scale-[0.97] sm:hover:bg-royal-700">
            <a.I size={19} className="shrink-0 text-kani" /> {a.l}
          </button>
        ))}
      </div>

      {live.map((p) => (
        <button key={p.id} onClick={() => go("auctions", { id: p.id })} className="flex w-full items-center gap-3 rounded-3xl bg-teal-50 p-4 text-left ring-1 ring-teal/30 active:scale-[0.99]">
          <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-teal text-mist"><Gavel size={21} /><span className="absolute -top-1 -right-1 size-3 animate-pulse rounded-full bg-laterite ring-2 ring-teal-50" /></span>
          <span className="min-w-0 flex-1"><span className="block text-[12px] font-bold tracking-[0.12em] text-teal-700 uppercase">Live now</span><b className="block truncate font-display text-[1.05rem]">{p.name}</b><span className="block text-[13.5px] text-ink-2">{inr(p.auction!.currentBid)} · {p.auction!.bids} bids</span></span>
          <span className="text-[13px] font-semibold text-teal-700">Run it →</span>
        </button>
      ))}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Members" value={d.members.length} sub={`${d.members.filter((m) => m.role === "admin").length} staff`} onClick={() => go("members")} />
        <Stat label="Books out" value={out.length} sub={`of ${copies} copies`} onClick={() => go("desk")} />
        <Stat label="Overdue" value={late.length} sub={late.length ? `${inr(late.reduce((s, l) => s + fine(l, d.settings.finePerDay), 0))} in fines` : "All on time"} tone={late.length ? "bg-laterite-50" : "bg-card"} onClick={() => go("desk")} />
        <Stat label="Collected" value={inr(collected)} sub={`this month · ${inr(dueTotal)} due`} tone="bg-teal-50" onClick={() => go("payments")} />
      </div>

      <Panel title="Reading room today" action={<span className="hidden text-[13px] text-muted sm:inline">for the Library Council count</span>}>
        <div className="flex items-center justify-between gap-4">
          <Btn tone="soft" icon={Minus} disabled={r.busy === "visit" || visitors <= 0} onClick={() => tally(-1)} aria-label="One less" className="size-14 p-0!" />
          <div className="text-center"><p className="font-display text-5xl leading-none font-extrabold tabular-nums">{visitors}</p><p className="mt-1 text-[13px] text-muted">visitors in so far</p></div>
          <Btn icon={Plus} disabled={r.busy === "visit"} onClick={() => tally(1)} aria-label="One more" className="size-14 p-0!" />
        </div>
        <div className="mt-3 flex gap-2">
          {[5, 10].map((n) => <Btn key={n} tone="ghost" className="flex-1" disabled={r.busy === "visit"} onClick={() => tally(n)}>+{n}</Btn>)}
        </div>
      </Panel>

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

        <Panel title="Coming up" action={<Btn tone="soft" onClick={() => go("events")}>Events</Btn>}>
          {upcoming.length ? (
            <ul className="divide-y divide-line">
              {upcoming.map((e) => (
                <li key={e.id}>
                  <button onClick={() => go("events", { id: e.id })} className="flex w-full items-center gap-3 py-3 text-left">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-royal-50 text-center font-display text-[12px] leading-tight font-bold text-royal">{fmtShort(`${e.date}T00:00:00+05:30`)}</span>
                    <span className="min-w-0 flex-1"><b className="block truncate font-semibold">{e.title}</b><span className="block truncate text-[13px] text-muted">{e.time} · {e.place}</span></span>
                    <span className="text-[13px] font-semibold text-royal">{regs(e.id)}{e.capacity ? `/${e.capacity}` : ""} in</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <EmptyRow>No events coming up.</EmptyRow>}
        </Panel>

        <Panel title={<>Overdue <span className="text-muted">{late.length}</span></>}>
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

export function LoanRow({ l, d, r }: { l: Loan; d: AdminOverview; r: ReturnType<typeof useRun> }) {
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

export function RequestRow({ x, d, r, compact }: { x: LibRequest; d: AdminOverview; r: ReturnType<typeof useRun>; compact?: boolean }) {
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

export function Desk({ d }: { d: AdminOverview }) {
  const r = useRun();
  const [card, setCard] = useState("");
  const [bq, setBq] = useState("");
  const [bookId, setBookId] = useState("");
  usePending("desk", (p) => { if (p.id) setBookId(p.id); if (p.q) setCard(p.q); });
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

export function Requests({ d }: { d: AdminOverview }) {
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
