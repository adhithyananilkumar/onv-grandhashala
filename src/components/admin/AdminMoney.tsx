"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Download, Minus, Plus, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { daysLeft, fmtDate, inr, Pill } from "@/lib/format";
import type { AdminOverview, LedgerType, PayMethod } from "@/lib/types";
import { Sheet } from "../forms";
import { usePending } from "./AdminShell";
import { Btn, Chips, EmptyRow, inputBox, Labeled, Panel, Stat, useRun } from "./kit";

const IN_CATS = ["Donation", "Membership", "Fine", "Class fee", "Event fee", "Book sale", "Vipani table fee", "Auction", "Grant", "Other"];
const OUT_CATS = ["Books purchase", "Newspapers", "Honorarium", "Electricity & water", "Repairs", "Event expenses", "Stationery", "Refund", "Other"];
const METHODS: PayMethod[] = ["Cash", "UPI", "Bank"];

/** A day in Kerala, YYYY-MM-DD, for an ISO instant. */
const day = (iso: string) => new Date(new Date(iso).getTime() + 5.5 * 3_600_000).toISOString().slice(0, 10);
const monthOf = (iso: string) => day(iso).slice(0, 7);
const monthLabel = (m: string) => new Date(`${m}-15T12:00:00+05:30`).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
const shiftMonth = (m: string, by: number) => { const [y, mo] = m.split("-").map(Number); const t = new Date(Date.UTC(y, mo - 1 + by, 1)); return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}`; };

export type Line = { id: string; date: string; type: LedgerType; category: string; amount: number; method: PayMethod; note: string; party?: string; manual: boolean };

/** The full day book: lines staff typed in, plus every member payment confirmed as paid. */
export function dayBook(d: AdminOverview): Line[] {
  const manual = d.ledger.map((e): Line => ({ ...e, manual: true }));
  const paid = d.payments.filter((p) => p.status === "paid").map((p): Line => ({
    id: p.id, date: p.paidAt ?? p.createdAt, type: "in", category: p.kind === "Order" ? "Vipani / orders" : p.kind, amount: p.amount,
    method: p.method === "UPI" ? "UPI" : "Cash", note: p.title, party: p.name, manual: false,
  }));
  return [...manual, ...paid].sort((a, b) => b.date.localeCompare(a.date));
}

export function downloadCsv(name: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const blob = new Blob(["﻿" + rows.map((r) => r.map(esc).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ───────── Accounts ───────── */

export function AccountsPanel({ d }: { d: AdminOverview }) {
  const r = useRun();
  const [month, setMonth] = useState(() => monthOf(new Date().toISOString()));
  const [adding, setAdding] = useState<LedgerType | null>(null);
  usePending("accounts", (p) => { if (p.action === "in" || p.action === "out") setAdding(p.action); });

  const book = useMemo(() => dayBook(d), [d]);
  const lines = book.filter((l) => monthOf(l.date) === month);
  const sum = (f: (l: Line) => boolean) => lines.filter(f).reduce((s, l) => s + l.amount, 0);
  const inn = sum((l) => l.type === "in"), out = sum((l) => l.type === "out");
  // Money brought forward from earlier months, so the balance is what's actually in hand.
  const before = book.filter((l) => monthOf(l.date) < month).reduce((s, l) => s + (l.type === "in" ? l.amount : -l.amount), 0);
  const byMethod = (m: PayMethod) => sum((l) => l.type === "in" && l.method === m) - sum((l) => l.type === "out" && l.method === m);

  const cats = (type: LedgerType) => {
    const m = new Map<string, number>();
    for (const l of lines) if (l.type === type) m.set(l.category, (m.get(l.category) ?? 0) + l.amount);
    return [...m].sort((a, b) => b[1] - a[1]);
  };
  const dayMap = new Map<string, Line[]>();
  for (const l of lines) { const k = day(l.date); dayMap.set(k, [...(dayMap.get(k) ?? []), l]); }
  const days = [...dayMap];

  const bar = (type: LedgerType) => {
    const rows = cats(type), top = rows[0]?.[1] ?? 1;
    if (!rows.length) return <p className="text-[14px] text-muted">None this month.</p>;
    return (
      <ul className="space-y-2">
        {rows.map(([c, v]) => (
          <li key={c}>
            <div className="flex justify-between text-[14px]"><span>{c}</span><b className="tabular-nums">{inr(v)}</b></div>
            <div className="mt-1 h-2 rounded-full bg-mist-2"><div className={`h-full rounded-full ${type === "in" ? "bg-teal" : "bg-laterite"}`} style={{ width: `${Math.max(4, (v / top) * 100)}%` }} /></div>
          </li>
        ))}
      </ul>
    );
  };

  const exportCsv = () => downloadCsv(`day-book-${month}.csv`, [
    ["Date", "Type", "Category", "Amount", "Method", "Party", "Note", "Source"],
    ...[...lines].reverse().map((l) => [day(l.date), l.type === "in" ? "Receipt" : "Payment", l.category, l.amount, l.method, l.party ?? "", l.note, l.manual ? "Day book" : "Member payment"]),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 rounded-full bg-card p-1.5 ring-1 ring-line/70">
        <Btn tone="soft" icon={ChevronLeft} aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))} className="size-11 p-0!" />
        <b className="font-display text-[1.05rem]">{monthLabel(month)}</b>
        <Btn tone="soft" icon={ChevronRight} aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))} className="size-11 p-0!" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Money in" value={inr(inn)} sub={`${lines.filter((l) => l.type === "in").length} receipt(s)`} tone="bg-teal-50" />
        <Stat label="Money out" value={inr(out)} sub={`${lines.filter((l) => l.type === "out").length} payment(s)`} tone="bg-laterite-50" />
        <Stat label="This month" value={<span className={inn - out < 0 ? "text-laterite-700" : ""}>{inn - out < 0 ? "−" : ""}{inr(Math.abs(inn - out))}</span>} sub={inn >= out ? "surplus" : "deficit"} />
        <Stat label="In hand" value={inr(before + inn - out)} sub={`brought forward ${inr(before)}`} tone="bg-kani-50" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {METHODS.map((m) => (
          <div key={m} className="rounded-2xl bg-card p-3 ring-1 ring-line/70"><p className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">{m}</p><p className="font-display text-[1.1rem] font-bold tabular-nums">{byMethod(m) < 0 ? "−" : ""}{inr(Math.abs(byMethod(m)))}</p></div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Btn icon={ArrowDownLeft} onClick={() => setAdding("in")} className="py-3.5 text-[15px]">Money in</Btn>
        <Btn tone="danger" icon={ArrowUpRight} onClick={() => setAdding("out")} className="py-3.5 text-[15px]">Money out</Btn>
      </div>

      <Panel title="Day book" action={<Btn tone="soft" icon={Download} onClick={exportCsv} disabled={!lines.length}>CSV for Tally / Excel</Btn>}>
        {days.length ? days.map(([k, ls]) => (
          <div key={k} className="mb-3 last:mb-0">
            <p className="mb-1 flex justify-between text-[12.5px] font-semibold tracking-[0.08em] text-muted uppercase"><span>{fmtDate(`${k}T12:00:00+05:30`)}</span><span className="tabular-nums">{inr(ls.reduce((s, l) => s + (l.type === "in" ? l.amount : -l.amount), 0))}</span></p>
            <ul className="divide-y divide-line rounded-2xl bg-mist px-3.5">
              {ls.map((l) => (
                <li key={l.id} className={`flex items-center gap-3 py-2.5 ${r.busy === l.id ? "opacity-60" : ""}`}>
                  <span className={`grid size-9 shrink-0 place-items-center rounded-full ${l.type === "in" ? "bg-teal-50 text-teal-700" : "bg-laterite-50 text-laterite-700"}`}>{l.type === "in" ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5"><b className="truncate font-semibold">{l.category}</b><Pill tone="muted">{l.method}</Pill></span>
                    <span className="block truncate text-[12.5px] text-muted">{[l.party, l.note].filter(Boolean).join(" · ") || "—"}</span>
                  </span>
                  <b className={`font-display tabular-nums ${l.type === "in" ? "text-teal-700" : "text-laterite-700"}`}>{l.type === "in" ? "+" : "−"}{inr(l.amount)}</b>
                  {l.manual && <Btn tone="soft" icon={Trash2} aria-label="Delete entry" onClick={() => { if (confirm("Delete this entry?")) r.run(l.id, () => api(`/api/admin/ledger/${l.id}`, { method: "DELETE" }), "Entry deleted."); }} className="size-9 p-0!" />}
                </li>
              ))}
            </ul>
          </div>
        )) : <EmptyRow>Nothing recorded in {monthLabel(month)}.</EmptyRow>}
        <p className="mt-3 text-[12.5px] text-muted">Member payments marked paid (fines, fees, orders, UPI) appear here automatically. Add everything else with Money in / Money out.</p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Where it came from">{bar("in")}</Panel>
        <Panel title="Where it went">{bar("out")}</Panel>
      </div>

      {adding && <EntrySheet type={adding} r={r} onClose={() => setAdding(null)} />}
      {r.toast}
    </div>
  );
}

function EntrySheet({ type: first, r, onClose }: { type: LedgerType; r: ReturnType<typeof useRun>; onClose: () => void }) {
  const [type, setType] = useState<LedgerType>(first);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [method, setMethod] = useState<PayMethod>("Cash");
  const [party, setParty] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => day(new Date().toISOString()));
  const [err, setErr] = useState<{ field?: string; msg?: string }>({});
  const cats = type === "in" ? IN_CATS : OUT_CATS;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr({});
    try {
      await api("/api/admin/ledger", { body: { type, amount: Number(amount), category, method, party, note, date } });
      r.run("noop", async () => 0, `${type === "in" ? "Received" : "Paid"} ${inr(Number(amount))}.`);
      onClose();
    } catch (x) { const a = x as ApiError; setErr({ field: a.field, msg: a.message }); }
  };

  return (
    <Sheet title="Record money" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-1.5 rounded-full bg-mist-2 p-1">
          {(["in", "out"] as const).map((t) => (
            <button key={t} type="button" onClick={() => { setType(t); setCategory(""); }} aria-pressed={type === t}
              className={`h-11 rounded-full text-[15px] font-semibold ${type === t ? (t === "in" ? "bg-teal text-mist" : "bg-laterite text-mist") : "text-ink-2"}`}>{t === "in" ? "Money in" : "Money out"}</button>
          ))}
        </div>
        <Labeled label="Amount (₹)" error={err.field === "amount" ? err.msg : undefined}>
          <input autoFocus className={`${inputBox} h-14 font-display text-2xl font-bold tabular-nums`} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="0" />
        </Labeled>
        <div>
          <span className="mb-1 block text-[13px] font-semibold text-ink-2">Category</span>
          <div className="flex flex-wrap gap-1.5">
            {cats.map((c) => <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c} className={`rounded-full px-3.5 py-2 text-[13.5px] font-semibold ${category === c ? "bg-royal text-mist" : "bg-mist-2 text-ink-2"}`}>{c}</button>)}
          </div>
          {err.field === "category" && <p className="mt-1 text-[13px] font-medium text-laterite" role="alert">{err.msg}</p>}
        </div>
        <Chips options={METHODS} value={method} onChange={setMethod} />
        <Labeled label={type === "in" ? "From (optional)" : "Paid to (optional)"}><input className={inputBox} value={party} onChange={(e) => setParty(e.target.value)} /></Labeled>
        <Labeled label="Note (optional)"><input className={inputBox} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Bill no. 214" /></Labeled>
        <Labeled label="Date"><input type="date" className={inputBox} value={date} max={day(new Date().toISOString())} onChange={(e) => setDate(e.target.value)} /></Labeled>
        <Btn type="submit" icon={type === "in" ? Plus : Minus} className="w-full py-3.5 text-[15px]">Save</Btn>
      </form>
    </Sheet>
  );
}

/* ───────── Reports ───────── */

export function ReportsPanel({ d }: { d: AdminOverview }) {
  const [month, setMonth] = useState(() => monthOf(new Date().toISOString()));
  const inMonth = (iso?: string) => !!iso && monthOf(iso) === month;
  const issued = d.loans.filter((l) => inMonth(l.issuedAt));
  const returned = d.loans.filter((l) => inMonth(l.returnedAt));
  const joined = d.members.filter((m) => inMonth(m.joinedAt));
  const visits = Object.entries(d.visits).filter(([k]) => k.startsWith(month)).reduce((s, [, v]) => s + v, 0);
  const regs = d.requests.filter((x) => x.kind === "Register" && inMonth(x.at)).length + d.guests.filter((g) => inMonth(g.at)).length;
  const book = dayBook(d).filter((l) => monthOf(l.date) === month);
  const income = book.filter((l) => l.type === "in").reduce((s, l) => s + l.amount, 0);
  const spend = book.filter((l) => l.type === "out").reduce((s, l) => s + l.amount, 0);
  const late = d.loans.filter((l) => !l.returnedAt && daysLeft(l.dueAt) < 0).length;

  const top = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of issued) m.set(l.title, (m.get(l.title) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [issued]);
  const subjects = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of issued) { const c = d.books.find((b) => b.id === l.bookId)?.category ?? "Other"; m.set(c, (m.get(c) ?? 0) + 1); }
    return [...m].sort((a, b) => b[1] - a[1]);
  }, [issued, d.books]);
  const idle = d.books.filter((b) => !d.loans.some((l) => l.bookId === b.id)).length;

  const row = (k: string, v: string | number) => <div className="flex justify-between border-b border-line/60 py-2.5 last:border-0"><span className="text-ink-2">{k}</span><b className="tabular-nums">{v}</b></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 rounded-full bg-card p-1.5 ring-1 ring-line/70">
        <Btn tone="soft" icon={ChevronLeft} aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))} className="size-11 p-0!" />
        <b className="font-display text-[1.05rem]">{monthLabel(month)}</b>
        <Btn tone="soft" icon={ChevronRight} aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))} className="size-11 p-0!" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Books issued" value={issued.length} sub={`${returned.length} returned`} />
        <Stat label="New members" value={joined.length} sub={`${d.members.length} in all`} />
        <Stat label="Reading room" value={visits} sub="visitors counted" />
        <Stat label="Event sign-ups" value={regs} sub="members and walk-ins" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Most borrowed">
          {top.length ? <ol className="space-y-1">{top.map(([t, n], i) => <li key={t} className="flex items-center gap-3 py-1.5"><span className="grid size-7 place-items-center rounded-full bg-royal-50 text-[13px] font-bold text-royal">{i + 1}</span><span className="min-w-0 flex-1 truncate">{t}</span><b className="tabular-nums">{n}</b></li>)}</ol> : <EmptyRow>No books issued this month.</EmptyRow>}
        </Panel>
        <Panel title="By subject">
          {subjects.length ? <div>{subjects.map(([c, n]) => row(c, n))}</div> : <EmptyRow>Nothing issued.</EmptyRow>}
        </Panel>
        <Panel title="Library health">
          {row("Titles in the catalogue", d.books.length)}
          {row("Copies owned", d.books.reduce((s, b) => s + b.copies, 0))}
          {row("Never borrowed", idle)}
          {row("Overdue now", late)}
          {row("Money in this month", inr(income))}
          {row("Money out this month", inr(spend))}
        </Panel>
        <Panel title="Download">
          <p className="mb-3 text-[14px] text-muted">Spreadsheets you can open in Excel or send to the Library Council.</p>
          <div className="flex flex-wrap gap-2">
            <Btn tone="soft" icon={Download} onClick={() => downloadCsv("members.csv", [["Card", "Name", "Mobile", "Ward", "Joined", "Role"], ...d.members.map((m) => [m.card, m.name, m.phone, m.ward ?? "", m.since, m.role])])}>Members</Btn>
            <Btn tone="soft" icon={Download} onClick={() => downloadCsv("books.csv", [["ID", "Title", "Author", "Language", "Subject", "Shelf", "Copies", "On shelf"], ...d.books.map((b) => [b.id, b.title, b.author, b.language, b.category, b.shelf, b.copies, b.available])])}>Books</Btn>
            <Btn tone="soft" icon={Download} onClick={() => downloadCsv(`issues-${month}.csv`, [["Issued", "Card", "Book", "Due", "Returned"], ...issued.map((l) => [day(l.issuedAt), l.card, l.title, day(l.dueAt), l.returnedAt ? day(l.returnedAt) : ""])])}>Issues this month</Btn>
            <Btn tone="soft" icon={Download} onClick={() => downloadCsv(`visitors-${month}.csv`, [["Date", "Visitors"], ...Object.entries(d.visits).filter(([k]) => k.startsWith(month)).sort()])}>Visitors</Btn>
          </div>
        </Panel>
      </div>
    </div>
  );
}
