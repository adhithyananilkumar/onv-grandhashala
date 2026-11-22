"use client";

import { useState } from "react";
import Link from "next/link";
import { Ban, BookOpen, Check, Copy, ExternalLink, KeyRound, Megaphone, Pencil, Plus, Receipt, RotateCcw, ShieldCheck, Trash2, Undo2, UserPlus, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useSession } from "@/lib/session";
import { daysLeft, dueLabel, fine, fmtShort, fmtTime, inr, loanTone, PAYMENT_LABEL, paymentTone, Pill } from "@/lib/format";
import { clean, SCHEMA, toForm, type AnyItem, type FieldSpec } from "@/lib/schema";
import type { AdminOverview, ContentType, Payment, PaymentKind, User } from "@/lib/types";
import { Sheet } from "../forms";
import { BookCover } from "../ui";
import { usePending } from "./AdminShell";
import { Btn, Chips, EmptyRow, inputBox, Labeled, matchText, Panel, SearchBox, Stat, useRun } from "./kit";

/* ───────── Members ───────── */

const MEMBER_TABS = ["All", "Staff", "With dues", "Overdue", "On hold"] as const;

export function MembersPanel({ d }: { d: AdminOverview }) {
  const r = useRun();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof MEMBER_TABS)[number]>("All");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  usePending("members", (p) => { if (p.action === "new") setAdding(true); if (p.id) setOpen(p.id); if (p.q) setQ(p.q); });

  const dueOf = (m: User) => d.payments.filter((p) => p.card === m.card && p.status === "due").reduce((s, p) => s + p.amount, 0);
  const lateOf = (m: User) => d.loans.filter((l) => l.card === m.card && !l.returnedAt && daysLeft(l.dueAt) < 0).length;
  const list = d.members.filter((m) =>
    matchText(q, m.name, m.card, m.phone, m.ward) &&
    (tab === "All" || (tab === "Staff" ? m.role === "admin" : tab === "With dues" ? dueOf(m) > 0 : tab === "Overdue" ? lateOf(m) > 0 : !!m.blocked)));
  const member = open ? d.members.find((m) => m.card === open) : undefined;

  return (
    <>
      <Panel action={<Btn icon={UserPlus} onClick={() => setAdding(true)}>New member</Btn>} title={<>Members <span className="text-muted">{d.members.length}</span></>}>
        <div className="space-y-2.5">
          <SearchBox value={q} onChange={setQ} placeholder="Name, card, phone or ward" />
          <Chips options={MEMBER_TABS} value={tab} onChange={setTab} />
        </div>
        {list.length ? (
          <ul className="mt-2 divide-y divide-line">
            {list.map((m) => {
              const due = dueOf(m), late = lateOf(m), out = d.loans.filter((l) => l.card === m.card && !l.returnedAt).length;
              return (
                <li key={m.card}>
                  <button onClick={() => setOpen(m.card)} className="flex w-full items-center gap-3 py-3 text-left">
                    <span className={`grid size-10 shrink-0 place-items-center rounded-full font-display text-[14px] font-bold ${m.role === "admin" ? "bg-ink text-mist" : "bg-royal-50 text-royal"}`}>
                      {m.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5"><span className="truncate font-semibold">{m.name}</span>{m.role === "admin" && <ShieldCheck size={15} className="shrink-0 text-royal" />}</span>
                      <span className="block truncate text-[13px] text-muted">{m.card} · +91 {m.phone}{m.ward ? ` · ${m.ward}` : ""}</span>
                    </span>
                    <span className="flex flex-col items-end gap-1 text-[12.5px]">
                      {m.blocked ? <Pill tone="bad">On hold</Pill> : late ? <Pill tone="bad">{late} late</Pill> : out ? <Pill tone="info">{out} out</Pill> : null}
                      {due > 0 && <span className="font-semibold text-laterite-700">{inr(due)} due</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : <div className="mt-3"><EmptyRow>No members match.</EmptyRow></div>}
      </Panel>
      {member && <MemberSheet m={member} d={d} r={r} onClose={() => setOpen(null)} />}
      {adding && <NewMemberSheet r={r} onClose={() => setAdding(false)} onCreated={(c) => { setAdding(false); setOpen(c); }} />}
      {r.toast}
    </>
  );
}

function PinReveal({ card, pin, onClose }: { card: string; pin: string; onClose: () => void }) {
  return (
    <div className="rounded-2xl bg-kani-50 p-4 text-center">
      <p className="text-[13.5px] text-kani-700">Give these to the member. The PIN is shown only once.</p>
      <p className="mt-2 font-mono text-lg font-semibold">{card}</p>
      <p className="font-mono text-3xl font-extrabold tracking-[0.3em]">{pin}</p>
      <div className="mt-3 flex justify-center gap-2">
        <Btn tone="soft" icon={Copy} onClick={() => navigator.clipboard?.writeText(`${card} PIN ${pin}`).catch(() => undefined)}>Copy</Btn>
        <Btn tone="ghost" onClick={onClose}>Done</Btn>
      </div>
    </div>
  );
}

function MemberSheet({ m, d, r, onClose }: { m: User; d: AdminOverview; r: ReturnType<typeof useRun>; onClose: () => void }) {
  const { user: me } = useSession();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(m.name);
  const [phone, setPhone] = useState(m.phone);
  const [ward, setWard] = useState(m.ward ?? "");
  const [pin, setPin] = useState<string | null>(null);
  const [charge, setCharge] = useState(false);
  const self = me?.card === m.card;
  const loans = d.loans.filter((l) => l.card === m.card && !l.returnedAt);
  const pays = d.payments.filter((p) => p.card === m.card);
  const reqs = d.requests.filter((x) => x.card === m.card).slice(0, 6);
  const patch = (body: Record<string, unknown>, msg: string) => r.run(`m-${m.card}`, () => api<{ pin?: string }>(`/api/admin/members/${m.card.match(/\d{4}/)?.[0]}`, { method: "PATCH", body }), msg);

  return (
    <Sheet title={m.name} subtitle={`${m.card} · member since ${m.since}`} onClose={onClose}>
      <div className="space-y-4">
        {pin && <PinReveal card={m.card} pin={pin} onClose={() => setPin(null)} />}
        <div className="flex flex-wrap gap-2">
          <Btn tone="soft" icon={Pencil} onClick={() => setEdit((v) => !v)}>Edit</Btn>
          <Btn tone="soft" icon={Receipt} onClick={() => setCharge((v) => !v)}>Add charge</Btn>
          <Btn tone="soft" icon={KeyRound} onClick={async () => { if (!confirm(`Reset the PIN for ${m.name}?`)) return; const res = await patch({ resetPin: true }, "New PIN made."); if (res?.pin) setPin(res.pin); }}>Reset PIN</Btn>
          {!self && (m.role === "admin"
            ? <Btn tone="soft" icon={ShieldCheck} onClick={() => patch({ role: "member" }, "Staff access removed.")}>Remove staff</Btn>
            : <Btn tone="soft" icon={ShieldCheck} onClick={() => { if (confirm(`Give ${m.name} full admin access?`)) patch({ role: "admin" }, "Now library staff."); }}>Make staff</Btn>)}
          {!self && (m.blocked
            ? <Btn tone="ghost" icon={Undo2} onClick={() => patch({ blocked: false }, "Card active again.")}>Lift hold</Btn>
            : <Btn tone="danger" icon={Ban} onClick={() => { if (confirm(`Put ${m.name}'s card on hold? They'll be signed out.`)) patch({ blocked: true }, "Card on hold."); }}>Hold card</Btn>)}
        </div>

        {edit && (
          <form className="space-y-2.5 rounded-2xl bg-card p-3.5 ring-1 ring-line/70" onSubmit={async (e) => { e.preventDefault(); if (await patch({ name, phone, ward }, "Details saved.")) setEdit(false); }}>
            <Labeled label="Name"><input className={inputBox} value={name} onChange={(e) => setName(e.target.value)} /></Labeled>
            <Labeled label="Mobile"><input className={inputBox} inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} /></Labeled>
            <Labeled label="Address / ward"><input className={inputBox} value={ward} onChange={(e) => setWard(e.target.value)} /></Labeled>
            <Btn type="submit" busy={r.busy === `m-${m.card}`} className="w-full py-2.5">Save</Btn>
          </form>
        )}
        {charge && <ChargeForm card={m.card} r={r} onDone={() => setCharge(false)} />}

        <dl className="grid grid-cols-2 gap-2 text-[14px]">
          <div className="rounded-2xl bg-card p-3 ring-1 ring-line/70"><dt className="text-muted">Mobile</dt><dd className="font-semibold">+91 {m.phone}</dd></div>
          <div className="rounded-2xl bg-card p-3 ring-1 ring-line/70"><dt className="text-muted">Status</dt><dd className="font-semibold">{m.blocked ? "On hold" : m.role === "admin" ? "Staff" : "Member"}</dd></div>
          {m.ward && <div className="col-span-2 rounded-2xl bg-card p-3 ring-1 ring-line/70"><dt className="text-muted">Address</dt><dd className="font-semibold">{m.ward}</dd></div>}
        </dl>

        <div>
          <p className="mb-1.5 text-[13px] font-semibold tracking-[0.1em] text-muted uppercase">On loan · {loans.length}</p>
          {loans.length ? (
            <ul className="divide-y divide-line rounded-2xl bg-card px-3.5 ring-1 ring-line/70">
              {loans.map((l) => (
                <li key={l.id} className="flex items-center gap-2 py-2.5">
                  <span className="min-w-0 flex-1 truncate font-medium">{l.title}</span>
                  <Pill tone={loanTone(l)}>{dueLabel(l).split(" · ")[0]}</Pill>
                  <Btn icon={Undo2} busy={r.busy === l.id} onClick={() => r.run(l.id, () => api(`/api/admin/loans/${l.id}/return`, { body: {} }), fine(l, d.settings.finePerDay) ? `Returned. Fine ${inr(fine(l, d.settings.finePerDay))} added.` : "Returned.")}>Return</Btn>
                </li>
              ))}
            </ul>
          ) : <EmptyRow>No books out.</EmptyRow>}
        </div>

        <div>
          <p className="mb-1.5 text-[13px] font-semibold tracking-[0.1em] text-muted uppercase">Payments · {pays.length}</p>
          {pays.length ? (
            <ul className="divide-y divide-line rounded-2xl bg-card px-3.5 ring-1 ring-line/70">
              {pays.map((p) => <PaymentRow key={p.id} p={p} r={r} compact />)}
            </ul>
          ) : <EmptyRow>No payments.</EmptyRow>}
        </div>

        {reqs.length > 0 && (
          <div>
            <p className="mb-1.5 text-[13px] font-semibold tracking-[0.1em] text-muted uppercase">Recent requests</p>
            <ul className="divide-y divide-line rounded-2xl bg-card px-3.5 ring-1 ring-line/70 text-[14px]">
              {reqs.map((x) => <li key={x.id} className="flex justify-between gap-2 py-2"><span className="truncate">{x.kind}: {x.title}</span><span className="shrink-0 text-muted">{x.status}</span></li>)}
            </ul>
          </div>
        )}
      </div>
    </Sheet>
  );
}

function NewMemberSheet({ r, onClose, onCreated }: { r: ReturnType<typeof useRun>; onClose: () => void; onCreated: (card: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ward, setWard] = useState("");
  const [staff, setStaff] = useState(false);
  const [err, setErr] = useState<{ field?: string; msg?: string }>({});
  const [made, setMade] = useState<{ user: User; pin: string } | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr({});
    try {
      const res = await api<{ user: User; pin: string }>("/api/admin/members", { body: { name, phone, ward, role: staff ? "admin" : "member" } });
      setMade(res);
      r.run("noop", async () => res, `Card ${res.user.card} issued.`);
    } catch (er) { const a = er as ApiError; setErr({ field: a.field, msg: a.message }); }
  };
  return (
    <Sheet title="New library card" subtitle="Issue a card at the desk" onClose={onClose}>
      {made ? (
        <div className="space-y-3">
          <PinReveal card={made.user.card} pin={made.pin} onClose={() => onCreated(made.user.card)} />
          <p className="text-center text-[13.5px] text-muted">They can change the PIN after signing in, under Profile.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <Labeled label="Full name" error={err.field === "name" ? err.msg : undefined}><input autoFocus className={inputBox} value={name} onChange={(e) => setName(e.target.value)} /></Labeled>
          <Labeled label="Mobile" error={err.field === "phone" ? err.msg : undefined}><input className={inputBox} inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10 digits" /></Labeled>
          <Labeled label="House, place, ward"><input className={inputBox} value={ward} onChange={(e) => setWard(e.target.value)} /></Labeled>
          <label className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-line/70 text-[14.5px]">
            <input type="checkbox" checked={staff} onChange={(e) => setStaff(e.target.checked)} className="size-5 accent-[var(--color-royal)]" /> Library staff (full admin access)
          </label>
          {err.msg && !err.field && <p className="text-[14px] text-laterite-700">{err.msg}</p>}
          <Btn type="submit" icon={UserPlus} className="w-full py-3 text-[15px]">Issue card</Btn>
        </form>
      )}
    </Sheet>
  );
}

/* ───────── Payments ───────── */

const PAY_TABS = ["To confirm", "Due", "Paid", "All"] as const;
const PAY_KINDS: PaymentKind[] = ["Fine", "Class fee", "Order", "Membership", "Other"];

function PaymentRow({ p, r, compact }: { p: Payment; r: ReturnType<typeof useRun>; compact?: boolean }) {
  const act = (action: string, msg: string) => r.run(p.id, () => api(`/api/admin/payments/${p.id}`, { method: "PATCH", body: { action } }), msg);
  return (
    <li className={`flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 ${r.busy === p.id ? "opacity-60" : ""}`}>
      <span className="min-w-[min(100%,15rem)] flex-1">
        <span className="flex items-center gap-2"><span className="truncate font-semibold">{compact ? p.title : `${p.name} · ${p.title}`}</span></span>
        <span className="block truncate text-[12.5px] text-muted">{p.id} · {p.kind} · {fmtShort(p.createdAt)}{p.method ? ` · ${p.method}` : ""}{p.utr ? ` · UTR ${p.utr}` : ""}{!compact ? ` · ${p.card}` : ""}</span>
      </span>
      <span className="flex flex-wrap items-center gap-1.5">
        <span className="font-display font-bold tabular-nums">{inr(p.amount)}</span>
        <Pill tone={paymentTone(p.status)}>{PAYMENT_LABEL[p.status]}</Pill>
        {p.status === "verifying" && <><Btn icon={Check} onClick={() => act("confirm", "UPI payment confirmed.")}>Confirm</Btn><Btn tone="danger" onClick={() => act("reject", "Sent back: reference didn't match.")}>Reject</Btn></>}
        {p.status === "due" && <><Btn onClick={() => act("cash", "Marked paid in cash.")}>Cash paid</Btn><Btn tone="soft" onClick={() => { if (confirm("Waive this charge?")) act("waive", "Waived."); }}>Waive</Btn></>}
        {(p.status === "paid" || p.status === "waived") && !compact && <Btn tone="soft" icon={RotateCcw} aria-label="Re-open" onClick={() => { if (confirm("Mark this as unpaid again?")) act("reopen", "Re-opened."); }} />}
      </span>
    </li>
  );
}

function ChargeForm({ card, r, onDone }: { card?: string; r: ReturnType<typeof useRun>; onDone: () => void }) {
  const [c, setC] = useState(card ?? "");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<PaymentKind>("Membership");
  const [paid, setPaid] = useState(false);
  return (
    <form className="space-y-2.5 rounded-2xl bg-card p-3.5 ring-1 ring-line/70" onSubmit={async (e) => {
      e.preventDefault();
      if (await r.run("charge", () => api("/api/admin/payments", { body: { card: c, title, amount: Number(amount), kind, paid } }), paid ? "Payment recorded." : "Charge added.")) onDone();
    }}>
      {!card && <Labeled label="Library number"><input className={inputBox} inputMode="numeric" value={c} onChange={(e) => setC(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="4 digits" /></Labeled>}
      <div className="grid grid-cols-2 gap-2.5">
        <Labeled label="Type">
          <select className={inputBox} value={kind} onChange={(e) => setKind(e.target.value as PaymentKind)}>{PAY_KINDS.map((k) => <option key={k}>{k}</option>)}</select>
        </Labeled>
        <Labeled label="Amount (₹)"><input className={inputBox} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 6))} /></Labeled>
      </div>
      <Labeled label="For"><input className={inputBox} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Membership 2027, damaged cover" /></Labeled>
      <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="size-4 accent-[var(--color-royal)]" /> Already paid in cash</label>
      <Btn type="submit" busy={r.busy === "charge"} className="w-full py-2.5">{paid ? "Record payment" : "Add charge"}</Btn>
    </form>
  );
}

export function PaymentsPanel({ d }: { d: AdminOverview }) {
  const r = useRun();
  const [tab, setTab] = useState<(typeof PAY_TABS)[number]>(d.payments.some((p) => p.status === "verifying") ? "To confirm" : "Due");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const list = d.payments.filter((p) => (tab === "All" || (tab === "To confirm" ? p.status === "verifying" : tab === "Due" ? p.status === "due" : p.status === "paid")) && matchText(q, p.name, p.card, p.title, p.id, p.utr));
  const sum = (s: Payment["status"]) => d.payments.filter((p) => p.status === s).reduce((a, p) => a + p.amount, 0);
  const lateFines = d.loans.filter((l) => !l.returnedAt).reduce((s, l) => s + fine(l, d.settings.finePerDay), 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="To confirm" value={inr(sum("verifying"))} sub={`${d.payments.filter((p) => p.status === "verifying").length} UPI payments`} tone="bg-kani-50" onClick={() => setTab("To confirm")} />
        <Stat label="Due" value={inr(sum("due"))} sub={`+ ${inr(lateFines)} running fines`} tone="bg-laterite-50" onClick={() => setTab("Due")} />
        <Stat label="Collected" value={inr(sum("paid"))} sub="all time" tone="bg-teal-50" onClick={() => setTab("Paid")} />
        <Stat label="UPI ID" value={<span className="text-[1.05rem]">{d.settings.upiId}</span>} sub={d.settings.upiName} />
      </div>
      <Panel title="Payments" action={<Btn icon={Plus} onClick={() => setAdding((v) => !v)}>{adding ? "Close" : "Add charge"}</Btn>}>
        {adding && <div className="mb-3"><ChargeForm r={r} onDone={() => setAdding(false)} /></div>}
        <div className="space-y-2.5">
          <Chips options={PAY_TABS} value={tab} onChange={setTab} counts={{ "To confirm": d.payments.filter((p) => p.status === "verifying").length, Due: d.payments.filter((p) => p.status === "due").length }} />
          <SearchBox value={q} onChange={setQ} placeholder="Name, card, reference or UTR" />
        </div>
        {list.length ? <ul className="mt-2 divide-y divide-line">{list.map((p) => <PaymentRow key={p.id} p={p} r={r} />)}</ul> : <div className="mt-3"><EmptyRow>Nothing here.</EmptyRow></div>}
      </Panel>
      {r.toast}
    </div>
  );
}

/* ───────── Catalogue, classes, events, Vipani ───────── */

const PUBLIC_PATH: Record<ContentType, string> = { books: "/catalogue", classes: "/classes", events: "/events", products: "/vipani" };

export function ContentManager({ d, type }: { d: AdminOverview; type: ContentType }) {
  const r = useRun();
  const spec = SCHEMA[type];
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<AnyItem | "new" | null>(null);
  usePending(type === "books" ? "books" : type === "classes" ? "classes" : type === "events" ? "events" : "products", (p) => { if (p.action === "new") setEditing("new"); });
  const items = d[type] as AnyItem[];
  const list = items.filter((i) => matchText(q, ...Object.values(i).map((v) => (typeof v === "string" ? v : undefined))));

  const summary = (i: AnyItem): string => {
    if (type === "books") { const b = i as AdminOverview["books"][number]; return `${b.author} · ${b.category} · shelf ${b.shelf} · ${b.available}/${b.copies} on shelf`; }
    if (type === "classes") { const c = i as AdminOverview["classes"][number]; return `${c.teacher} · ${c.schedule} · ${c.fee} · ${c.seatsLeft} seats`; }
    if (type === "events") { const e = i as AdminOverview["events"][number]; return `${fmtShort(e.date + "T00:00:00+05:30")} · ${e.time} · ${e.place} · ${d.requests.filter((x) => x.itemId === e.id && x.kind === "Register" && x.status !== "cancelled").length} registered`; }
    const p = i as AdminOverview["products"][number];
    return `${p.seller} · ${p.auction ? `Auction ${inr(p.auction.currentBid)} · ${p.auction.bids} bids · closes ${fmtTime(p.auction.endsAt)}` : `${inr(p.price)} / ${p.unit}`}`;
  };

  return (
    <>
      <Panel title={<>{spec.plural} <span className="text-muted">{items.length}</span></>} action={<Btn icon={Plus} onClick={() => setEditing("new")}>Add {spec.noun}</Btn>}>
        <SearchBox value={q} onChange={setQ} placeholder={`Search ${spec.plural.toLowerCase()}`} />
        {list.length ? (
          <ul className="mt-2 divide-y divide-line">
            {list.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-3">
                {type === "books" ? <BookCover book={i as AdminOverview["books"][number]} size="sm" className="w-10 shrink-0" />
                  : type === "products" ? <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-kani-50 text-xl">{(i as AdminOverview["products"][number]).emoji}</span>
                  : <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-royal-50 text-royal"><BookOpen size={18} /></span>}
                <button onClick={() => setEditing(i)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-semibold">{"title" in i ? i.title : i.name}</span>
                  <span className="block truncate text-[13px] text-muted">{summary(i)}</span>
                </button>
                <Link href={`${PUBLIC_PATH[type]}/${i.id}`} aria-label="View on site" className="hidden size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-mist-2 sm:grid"><ExternalLink size={16} /></Link>
                <Btn tone="soft" icon={Pencil} onClick={() => setEditing(i)} aria-label="Edit" />
              </li>
            ))}
          </ul>
        ) : <div className="mt-3"><EmptyRow>Nothing found.</EmptyRow></div>}
      </Panel>
      {editing && <ItemEditor type={type} item={editing === "new" ? null : editing} r={r} onClose={() => setEditing(null)} />}
      {r.toast}
    </>
  );
}

function FieldInput({ f, value, set }: { f: FieldSpec; value: unknown; set: (v: unknown) => void }) {
  if (f.type === "toggle") {
    return (
      <label className="flex items-center justify-between gap-3 rounded-2xl bg-mist px-4 py-3">
        <span className="text-[15px] font-semibold">{f.label}</span>
        <input type="checkbox" checked={!!value} onChange={(e) => set(e.target.checked)} className="size-5 accent-[var(--color-royal)]" />
      </label>
    );
  }
  if (f.type === "select") return <select className={inputBox} value={String(value ?? "")} onChange={(e) => set(e.target.value)}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>;
  if (f.type === "textarea") return <textarea rows={4} className={`${inputBox} h-auto py-2.5`} value={String(value ?? "")} onChange={(e) => set(e.target.value)} />;
  return (
    <input className={inputBox} value={String(value ?? "")}
      type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "datetime" ? "datetime-local" : "text"}
      min={f.min} max={f.max} inputMode={f.type === "number" ? "numeric" : undefined}
      onChange={(e) => set(f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} />
  );
}

export function ItemEditor({ type, item, r, onClose, preset }: { type: ContentType; item: AnyItem | null; r: ReturnType<typeof useRun>; onClose: () => void; preset?: Record<string, unknown> }) {
  const spec = SCHEMA[type];
  const [v, setV] = useState<Record<string, unknown>>(() => ({ ...toForm(type, item as Record<string, unknown> | null), ...(item ? {} : preset) }));
  const [err, setErr] = useState<{ field?: string; msg?: string }>({});
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = clean(type, v, item as Record<string, unknown> | undefined);
    if (!c.ok) return setErr({ field: c.field, msg: c.error });
    setBusy(true); setErr({});
    const ok = await r.run(`save-${type}`, () => (item
      ? api(`/api/catalog/${type}/${item.id}`, { method: "PATCH", body: v })
      : api(`/api/catalog/${type}`, { body: v })), item ? "Saved." : `New ${spec.noun} added.`);
    setBusy(false);
    if (ok) onClose();
  };
  const remove = async () => {
    if (!item || !confirm(`Delete this ${spec.noun}? Members won't see it any more.`)) return;
    if (await r.run(`del-${item.id}`, () => api(`/api/catalog/${type}/${item.id}`, { method: "DELETE" }), "Deleted.")) onClose();
  };

  return (
    <Sheet title={item ? `Edit ${spec.noun}` : `Add a ${spec.noun}`} subtitle={item ? ("title" in item ? item.title : item.name) : undefined} onClose={onClose}>
      <form noValidate onSubmit={save} className="grid grid-cols-2 gap-x-4 gap-y-4 pt-1">
        {spec.fields.filter((f) => !f.when || v[f.when]).map((f) => (
          <Labeled key={f.key} label={`${f.label}${f.required ? "" : " (optional)"}`} hint={f.hint} error={err.field === f.key ? err.msg : undefined} className={f.half ? "col-span-1" : "col-span-2"}>
            <FieldInput f={f} value={v[f.key]} set={(x) => { setV((s) => ({ ...s, [f.key]: x })); if (err.field === f.key) setErr({}); }} />
          </Labeled>
        ))}
        {err.msg && !spec.fields.some((f) => f.key === err.field) && <p className="col-span-2 text-[14px] text-laterite-700">{err.msg}</p>}
        <div className="sticky bottom-0 z-10 col-span-2 -mx-1 mt-1 flex gap-2 border-t border-line/70 bg-mist px-1 pt-4">
          {item && <Btn tone="danger" icon={Trash2} busy={r.busy === `del-${item.id}`} onClick={remove}>Delete</Btn>}
          <Btn type="submit" busy={busy} className="flex-1 py-3 text-[15px]">{item ? "Save changes" : `Add ${spec.noun}`}</Btn>
        </div>
      </form>
    </Sheet>
  );
}

/* ───────── Notices ───────── */

export function NoticesPanel({ d }: { d: AdminOverview }) {
  const r = useRun();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tone, setTone] = useState<"info" | "alert">("info");
  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <Panel title="Post a notice">
        <form className="space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          if (await r.run("notice", () => api("/api/admin/notices", { body: { title, body, tone } }), "Posted to every member's home screen.")) { setTitle(""); setBody(""); }
        }}>
          <Labeled label="Title"><input className={inputBox} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Closed on Sunday" /></Labeled>
          <Labeled label="Message"><textarea rows={4} className={`${inputBox} h-auto py-2.5`} value={body} onChange={(e) => setBody(e.target.value)} /></Labeled>
          <Chips options={["info", "alert"] as const} value={tone} onChange={setTone} />
          <Btn type="submit" icon={Megaphone} busy={r.busy === "notice"} className="w-full py-3 text-[15px]">Post notice</Btn>
        </form>
      </Panel>
      <Panel title={<>Live notices <span className="text-muted">{d.notices.length}</span></>}>
        {d.notices.length ? (
          <ul className="space-y-2">
            {d.notices.map((n) => (
              <li key={n.id} className={`flex items-start gap-3 rounded-2xl p-3.5 ${n.tone === "alert" ? "bg-kani-50" : "bg-mist"}`}>
                <Megaphone size={18} className="mt-0.5 shrink-0 text-royal" />
                <div className="min-w-0 flex-1"><p className="font-semibold">{n.title}</p>{n.body && <p className="text-[14px] text-ink-2">{n.body}</p>}<p className="text-[12px] text-muted">{fmtTime(n.at)}</p></div>
                <Btn tone="soft" icon={X} aria-label="Remove notice" busy={r.busy === n.id} onClick={() => r.run(n.id, () => api(`/api/admin/notices/${n.id}`, { method: "DELETE" }), "Removed.")} />
              </li>
            ))}
          </ul>
        ) : <EmptyRow>No notices.</EmptyRow>}
      </Panel>
      {r.toast}
    </div>
  );
}

/* ───────── Settings ───────── */

export function SettingsPanel({ d }: { d: AdminOverview }) {
  const r = useRun();
  const [s, setS] = useState(d.settings);
  const set = (k: keyof typeof s) => (e: React.ChangeEvent<HTMLInputElement>) => setS((x) => ({ ...x, [k]: typeof x[k] === "number" ? Number(e.target.value.replace(/\D/g, "")) : e.target.value }));
  return (
    <Panel title="Library rules and payments" className="max-w-xl">
      <form className="grid grid-cols-2 gap-3" onSubmit={(e) => { e.preventDefault(); r.run("settings", () => api("/api/admin/settings", { method: "PATCH", body: s }), "Settings saved."); }}>
        <Labeled label="Loan length (days)"><input className={inputBox} inputMode="numeric" value={s.loanDays} onChange={set("loanDays")} /></Labeled>
        <Labeled label="Renewals allowed"><input className={inputBox} inputMode="numeric" value={s.maxRenewals} onChange={set("maxRenewals")} /></Labeled>
        <Labeled label="Late fine per day (₹)" className="col-span-2"><input className={inputBox} inputMode="numeric" value={s.finePerDay} onChange={set("finePerDay")} /></Labeled>
        <Labeled label="UPI ID" hint="Members pay to this" className="col-span-2"><input className={inputBox} value={s.upiId} onChange={set("upiId")} /></Labeled>
        <Labeled label="Name on UPI" className="col-span-2"><input className={inputBox} value={s.upiName} onChange={set("upiName")} /></Labeled>
        <Btn type="submit" busy={r.busy === "settings"} className="col-span-2 py-3 text-[15px]">Save settings</Btn>
      </form>
      {r.toast}
    </Panel>
  );
}
