"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookUp, Check, ClipboardCopy, Download, Gavel, Minus, Pencil, Phone, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { daysLeft, fmtDate, fmtShort, fmtTime, inr, Pill } from "@/lib/format";
import type { AdminOverview, Book, ClassItem, EventItem, Product } from "@/lib/types";
import { BookCover } from "../ui";
import { ItemEditor } from "./AdminContent";
import { people, students, total, type Person } from "./AdminBooksEvents";
import { downloadCsv } from "./AdminMoney";
import { LoanRow, RequestRow } from "./AdminOps";
import { useAdmin, usePending } from "./AdminShell";
import { sectionPath, type SectionKey } from "./sections";
import { Btn, EmptyRow, inputBox, Labeled, Panel, useRun } from "./kit";

type Run = ReturnType<typeof useRun>;
const feeNum = (f: string) => (f === "Free" ? 0 : Number(f.replace(/[^\d]/g, "")) || 0);
const dayDiff = (a: string, b: string) => Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000));

function Missing({ section, what }: { section: SectionKey; what: string }) {
  return (
    <div className="space-y-3">
      <EmptyRow>That {what} isn&apos;t there any more.</EmptyRow>
      <Link href={sectionPath(section)} className="inline-flex items-center gap-2 text-[15px] font-semibold text-royal"><ArrowLeft size={16} /> Back to the list</Link>
    </div>
  );
}

function Back({ section, label }: { section: SectionKey; label: string }) {
  return <Link href={sectionPath(section)} className="mb-3 hidden items-center gap-1.5 text-[14.5px] font-semibold text-royal lg:inline-flex"><ArrowLeft size={16} /> {label}</Link>;
}

function Fact({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="rounded-2xl bg-card p-3 ring-1 ring-line/70"><dt className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">{k}</dt><dd className="mt-0.5 font-semibold">{v}</dd></div>;
}

function Tile({ n, label, tone = "bg-card ring-1 ring-line/70" }: { n: React.ReactNode; label: string; tone?: string }) {
  return <div className={`rounded-2xl p-3 text-center ${tone}`}><p className="font-display text-2xl font-extrabold tabular-nums">{n}</p><p className="text-[12px] text-muted">{label}</p></div>;
}

/* ───────── Participants (events and classes) ───────── */

function PeopleList({ list, r, onToggle, onRemove, checkIn, extra }: {
  list: Person[]; r: Run; onToggle?: (p: Person) => void; onRemove: (p: Person) => void; checkIn: boolean; extra?: (p: Person) => React.ReactNode;
}) {
  const { go } = useAdmin();
  if (!list.length) return <EmptyRow>No one yet.</EmptyRow>;
  return (
    <ul className="divide-y divide-line">
      {list.map((p) => (
        <li key={p.key} className={`flex items-center gap-2 py-2.5 ${r.busy === p.key ? "opacity-60" : ""}`}>
          {checkIn && onToggle && (
            <button onClick={() => onToggle(p)} aria-pressed={p.here} aria-label={p.here ? `Mark ${p.name} as not arrived` : `Check in ${p.name}`}
              className={`grid size-11 shrink-0 place-items-center rounded-full ring-2 ${p.here ? "bg-teal text-mist ring-teal" : "bg-card text-transparent ring-line"}`}><Check size={20} /></button>
          )}
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-x-1.5">
              {p.card ? <button onClick={() => go("members", { id: p.card })} className="text-left font-semibold underline-offset-2 hover:underline">{p.name}</button> : <b className="font-semibold">{p.name}</b>}
              {p.people > 1 && <span className="text-[13px] text-muted">× {p.people}</span>}
              {p.guest && <Pill tone="muted">Walk-in</Pill>}
              {extra?.(p)}
            </span>
            <span className="block truncate text-[12.5px] text-muted">{p.card ?? "No account"}{p.phone ? ` · +91 ${p.phone}` : ""}{p.note ? ` · ${p.note}` : ""}</span>
          </span>
          {p.phone && <a href={`tel:+91${p.phone}`} aria-label={`Call ${p.name}`} className="grid size-10 place-items-center rounded-full bg-mist-2 text-ink-2"><Phone size={16} /></a>}
          <Btn tone="soft" icon={Trash2} aria-label={`Remove ${p.name}`} onClick={() => onRemove(p)} className="size-10 p-0!" />
        </li>
      ))}
    </ul>
  );
}

function Stepper({ n, set, max = 20 }: { n: number; set: (n: number) => void; max?: number }) {
  return (
    <span className="flex items-center gap-3">
      <Btn tone="soft" icon={Minus} aria-label="One fewer" disabled={n <= 1} onClick={() => set(n - 1)} className="size-10 p-0!" />
      <b className="w-6 text-center font-display text-xl tabular-nums">{n}</b>
      <Btn tone="soft" icon={Plus} aria-label="One more" onClick={() => set(Math.min(max, n + 1))} className="size-10 p-0!" />
    </span>
  );
}

/* ───────── Event page ───────── */

export function EventDetail({ d, id }: { d: AdminOverview; id: string }) {
  const r = useRun();
  const e = d.events.find((x) => x.id === id);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  usePending("events", (p) => { if (p.action === "register") setAdding(true); });
  if (!e) return <Missing section="events" what="event" />;

  const list = people(d, e.id).sort((a, b) => Number(a.here) - Number(b.here) || a.name.localeCompare(b.name));
  const n = total(list);
  const here = total(list.filter((p) => p.here));
  const left = e.capacity ? Math.max(0, e.capacity - n) : null;

  const toggle = (p: Person) => r.run(p.key, () => p.guest
    ? api(`/api/admin/guests/${p.id}`, { method: "PATCH", body: { attended: !p.here } })
    : api(`/api/requests/${p.id}`, { method: "PATCH", body: { status: p.here ? "confirmed" : "done" } }));
  const remove = (p: Person) => {
    if (!confirm(`Remove ${p.name} from this event?`)) return;
    r.run(p.key, () => p.guest ? api(`/api/admin/guests/${p.id}`, { method: "DELETE" }) : api(`/api/requests/${p.id}`, { method: "PATCH", body: { status: "declined" } }), "Removed.");
  };
  const lines = () => list.map((p, i) => `${i + 1}. ${p.name}${p.people > 1 ? ` (${p.people})` : ""}${p.phone ? ` · ${p.phone}` : ""}${p.card ? "" : " · walk-in"}`).join("\n");
  const copy = () => navigator.clipboard?.writeText(`${e.title} · ${e.date}\n${lines()}`).then(() => r.show("List copied."), () => r.show("Couldn't copy.", true));
  const csv = () => downloadCsv(`${e.id}-participants.csv`, [["Name", "People", "Mobile", "Library no.", "Arrived"], ...list.map((p) => [p.name, p.people, p.phone ?? "", p.card ?? "walk-in", p.here ? "yes" : ""])]);

  return (
    <div className="space-y-4">
      <Back section="events" label="All events" />
      <Panel>
        <div className="flex flex-wrap items-start gap-2"><Pill tone="info">{e.kind}</Pill></div>
        <h2 className="mt-2 font-display text-2xl leading-tight font-extrabold">{e.title}</h2>
        <p className="font-ml text-muted">{e.titleMl}</p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[14px] sm:grid-cols-4">
          <Fact k="Date" v={fmtDate(`${e.date}T00:00:00+05:30`)} />
          <Fact k="Time" v={e.time} />
          <Fact k="Place" v={e.place} />
          <Fact k="Entry" v={e.fee ? `${inr(e.fee)} per person` : "Free"} />
        </dl>
        {e.blurb && <p className="mt-3 text-[15px] text-ink-2">{e.blurb}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn tone="soft" icon={Pencil} onClick={() => setEditing(true)}>Edit details</Btn>
          <Link href={`/events/${e.id}`} className="inline-flex items-center rounded-full bg-mist-2 px-3.5 py-2 text-[13.5px] font-semibold hover:bg-line">View on site</Link>
        </div>
      </Panel>

      <div className="grid grid-cols-3 gap-2.5">
        <Tile n={n} label="registered" />
        <Tile n={here} label="arrived" tone="bg-teal-50" />
        <Tile n={left === null ? "∞" : left} label="places left" />
      </div>
      {e.fee ? <p className="text-[13.5px] text-muted">Collect the {inr(e.fee)} entry fee at the door and record it under Accounts → Money in ({inr(e.fee * n)} if everyone pays).</p> : null}

      <Panel title={<><Users size={16} className="mr-1.5 inline text-muted" />Participants <span className="text-muted">{list.length}</span></>} action={<Btn icon={UserPlus} onClick={() => setAdding((v) => !v)}>{adding ? "Close" : "Add person"}</Btn>}>
        {adding && <div className="mb-3"><AddPerson e={e} r={r} d={d} onDone={() => setAdding(false)} /></div>}
        <PeopleList list={list} r={r} checkIn onToggle={toggle} onRemove={remove} />
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn tone="soft" icon={ClipboardCopy} onClick={copy} disabled={!list.length}>Copy list</Btn>
          <Btn tone="soft" icon={Download} onClick={csv} disabled={!list.length}>Download CSV</Btn>
        </div>
      </Panel>
      {editing && <ItemEditor type="events" item={e as EventItem} r={r} onClose={() => setEditing(false)} />}
      {r.toast}
    </div>
  );
}

/** Add someone at the desk: by library number, or just a name for people without an account. */
function AddPerson({ e, r, d, onDone }: { e: EventItem; r: Run; d: AdminOverview; onDone: () => void }) {
  const [card, setCard] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [count, setCount] = useState(1);
  const [err, setErr] = useState<{ field?: string; msg?: string }>({});
  const key = card.match(/\d{4}/)?.[0];
  const member = key ? d.members.find((m) => m.card.endsWith(key)) : undefined;

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErr({});
    try {
      await api(`/api/admin/events/${e.id}/register`, { body: { card: member ? member.card : "", name, phone, people: count } });
      r.run("noop", async () => 0, `${member?.name ?? name} registered.`);
      setCard(""); setName(""); setPhone(""); setCount(1);
      onDone();
    } catch (x) { const a = x as ApiError; setErr({ field: a.field, msg: a.message }); }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-mist p-3.5">
      <Labeled label="Library number (if they have one)" hint="Leave empty for someone without an account" error={err.field === "card" ? err.msg : undefined}>
        <input className={inputBox} inputMode="numeric" value={card} onChange={(x) => setCard(x.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="e.g. 1234" />
      </Labeled>
      {key?.length === 4 && (member
        ? <p className="rounded-2xl bg-teal-50 px-3.5 py-2.5 text-[14px] text-teal-700"><b>{member.name}</b> · +91 {member.phone}</p>
        : <p className="rounded-2xl bg-laterite-50 px-3.5 py-2.5 text-[14px] text-laterite-700">No member with ONV {key}. Clear it to add them as a walk-in.</p>)}
      {!key && (
        <>
          <Labeled label="Name" error={err.field === "name" ? err.msg : undefined}><input className={inputBox} value={name} onChange={(x) => setName(x.target.value)} autoComplete="off" /></Labeled>
          <Labeled label="Mobile (optional)" error={err.field === "phone" ? err.msg : undefined}><input className={inputBox} inputMode="numeric" value={phone} onChange={(x) => setPhone(x.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10 digits" /></Labeled>
        </>
      )}
      <div className="flex items-center justify-between rounded-2xl bg-card px-3.5 py-2"><span className="text-[14.5px] font-semibold">How many people?</span><Stepper n={count} set={setCount} /></div>
      {err.msg && (!err.field || err.field === "people") && <p className="text-[14px] text-laterite-700">{err.msg}</p>}
      <Btn type="submit" icon={UserPlus} className="w-full py-3 text-[15px]" disabled={key?.length === 4 && !member}>Register</Btn>
    </form>
  );
}

/* ───────── Class page ───────── */

export function ClassDetail({ d, id }: { d: AdminOverview; id: string }) {
  const r = useRun();
  const c = d.classes.find((x) => x.id === id);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  usePending("classes", (p) => { if (p.action === "enrol") setAdding(true); });
  if (!c) return <Missing section="classes" what="class" />;

  const list = students(d, c.id).sort((a, b) => a.name.localeCompare(b.name));
  const fee = feeNum(c.fee);
  const feeFor = (p: Person) => (p.guest ? undefined : d.payments.find((x) => x.ref === p.id));
  const owing = list.reduce((s, p) => s + (feeFor(p)?.status === "due" ? feeFor(p)!.amount : 0), 0);

  const remove = (p: Person) => {
    if (!confirm(`Remove ${p.name} from ${c.title}? The seat goes back${p.guest ? "" : " and any unpaid fee is cancelled"}.`)) return;
    r.run(p.key, () => p.guest ? api(`/api/admin/guests/${p.id}`, { method: "DELETE" }) : api(`/api/requests/${p.id}`, { method: "PATCH", body: { status: "declined" } }), "Removed. Seat given back.");
  };
  const csv = () => downloadCsv(`${c.id}-students.csv`, [["Student", "Mobile", "Library no.", "Note", "Fee"], ...list.map((p) => [p.name, p.phone ?? "", p.card ?? "walk-in", p.note ?? "", feeFor(p)?.status ?? ""])]);

  return (
    <div className="space-y-4">
      <Back section="classes" label="All classes" />
      <Panel>
        <h2 className="font-display text-2xl leading-tight font-extrabold">{c.title}</h2>
        <p className="font-ml text-muted">{c.titleMl}</p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[14px] sm:grid-cols-4">
          <Fact k="Teacher" v={c.teacher} />
          <Fact k="When" v={c.schedule} />
          <Fact k="Ages" v={c.ages} />
          <Fact k="Fee" v={fee ? c.fee : "Free"} />
        </dl>
        {c.about && <p className="mt-3 text-[15px] text-ink-2">{c.about}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn tone="soft" icon={Pencil} onClick={() => setEditing(true)}>Edit class</Btn>
          <Link href={`/classes/${c.id}`} className="inline-flex items-center rounded-full bg-mist-2 px-3.5 py-2 text-[13.5px] font-semibold hover:bg-line">View on site</Link>
        </div>
      </Panel>

      <div className="grid grid-cols-3 gap-2.5">
        <Tile n={list.length} label="enrolled" />
        <Tile n={c.seatsLeft} label="seats left" tone={c.seatsLeft <= 0 ? "bg-laterite-50" : "bg-card ring-1 ring-line/70"} />
        <Tile n={fee ? inr(owing) : "–"} label="fees unpaid" tone={owing ? "bg-kani-50" : "bg-card ring-1 ring-line/70"} />
      </div>

      <Panel title={<>Students <span className="text-muted">{list.length}</span></>} action={<Btn icon={UserPlus} disabled={c.seatsLeft <= 0 && !adding} onClick={() => setAdding((v) => !v)}>{adding ? "Close" : c.seatsLeft <= 0 ? "Class is full" : "Enrol student"}</Btn>}>
        {adding && <div className="mb-3"><AddStudent c={c} d={d} r={r} onDone={() => setAdding(false)} /></div>}
        <PeopleList list={list} r={r} checkIn={false} onRemove={remove}
          extra={(p) => { const f = feeFor(p); return f ? <><Pill tone={f.status === "paid" ? "good" : f.status === "due" ? "bad" : "muted"}>{f.status === "paid" ? "Fee paid" : f.status === "due" ? `${inr(f.amount)} due` : f.status}</Pill>{f.status === "due" && <button onClick={() => r.run(f.id, () => api(`/api/admin/payments/${f.id}`, { method: "PATCH", body: { action: "cash" } }), "Fee marked paid in cash.")} className="text-[12.5px] font-semibold text-royal underline">Paid cash</button>}</> : null; }} />
        <div className="mt-3"><Btn tone="soft" icon={Download} onClick={csv} disabled={!list.length}>Download CSV</Btn></div>
      </Panel>
      {editing && <ItemEditor type="classes" item={c as ClassItem} r={r} onClose={() => setEditing(false)} />}
      {r.toast}
    </div>
  );
}

function AddStudent({ c, d, r, onDone }: { c: ClassItem; d: AdminOverview; r: Run; onDone: () => void }) {
  const [card, setCard] = useState("");
  const [child, setChild] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [collect, setCollect] = useState<"later" | "cash" | "upi">("later");
  const [err, setErr] = useState<{ field?: string; msg?: string }>({});
  const key = card.match(/\d{4}/)?.[0];
  const member = key ? d.members.find((m) => m.card.endsWith(key)) : undefined;
  const fee = feeNum(c.fee);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErr({});
    try {
      await api(`/api/admin/classes/${c.id}/enrol`, { body: member ? { card: member.card, student: child ? name : "", age, collect } : { name, age, phone, collect } });
      r.run("noop", async () => 0, `${member && !child ? member.name : name} enrolled.`);
      onDone();
    } catch (x) { const a = x as ApiError; setErr({ field: a.field, msg: a.message }); }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-mist p-3.5">
      <Labeled label="Library number (parent or student)" hint="Leave empty for a student without an account" error={err.field === "card" ? err.msg : undefined}>
        <input className={inputBox} inputMode="numeric" value={card} onChange={(x) => setCard(x.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="e.g. 1234" />
      </Labeled>
      {key?.length === 4 && (member
        ? (
          <>
            <p className="rounded-2xl bg-teal-50 px-3.5 py-2.5 text-[14px] text-teal-700"><b>{member.name}</b> · +91 {member.phone}</p>
            <label className="flex items-center gap-3 rounded-2xl bg-card px-3.5 py-3 text-[14.5px]"><input type="checkbox" checked={child} onChange={(x) => setChild(x.target.checked)} className="size-5 accent-[var(--color-royal)]" /> This is for their child</label>
          </>
        )
        : <p className="rounded-2xl bg-laterite-50 px-3.5 py-2.5 text-[14px] text-laterite-700">No member with ONV {key}. Clear it to add a walk-in.</p>)}
      {(!key || child) && (
        <>
          <Labeled label="Student's name" error={err.field === "name" || err.field === "student" ? err.msg : undefined}><input className={inputBox} value={name} onChange={(x) => setName(x.target.value)} autoComplete="off" /></Labeled>
          <div className="grid grid-cols-2 gap-2.5">
            <Labeled label="Age"><input className={inputBox} inputMode="numeric" value={age} onChange={(x) => setAge(x.target.value.replace(/\D/g, "").slice(0, 2))} /></Labeled>
            {!key && <Labeled label="Mobile (optional)" error={err.field === "phone" ? err.msg : undefined}><input className={inputBox} inputMode="numeric" value={phone} onChange={(x) => setPhone(x.target.value.replace(/\D/g, "").slice(0, 10))} /></Labeled>}
          </div>
        </>
      )}
      {fee > 0 && (
        <div>
          <span className="mb-1 block text-[13px] font-semibold text-ink-2">First month fee · {inr(fee)}</span>
          <div className="grid grid-cols-3 gap-1.5 rounded-full bg-mist-2 p-1">
            {([["later", member ? "Bill later" : "Not yet"], ["cash", "Cash paid"], ["upi", "UPI paid"]] as const).map(([v, l]) => (
              <button key={v} type="button" onClick={() => setCollect(v)} aria-pressed={collect === v} className={`h-10 rounded-full text-[13.5px] font-semibold ${collect === v ? "bg-royal text-mist" : "text-ink-2"}`}>{l}</button>
            ))}
          </div>
        </div>
      )}
      {err.msg && !err.field && <p className="text-[14px] text-laterite-700">{err.msg}</p>}
      <Btn type="submit" icon={UserPlus} className="w-full py-3 text-[15px]" disabled={key?.length === 4 && !member}>Enrol</Btn>
    </form>
  );
}

/* ───────── Book page ───────── */

export function BookDetail({ d, id }: { d: AdminOverview; id: string }) {
  const r = useRun();
  const { go } = useAdmin();
  const b = d.books.find((x) => x.id === id);
  const [editing, setEditing] = useState(false);
  if (!b) return <Missing section="books" what="book" />;

  const loans = d.loans.filter((l) => l.bookId === b.id).sort((a, z) => z.issuedAt.localeCompare(a.issuedAt));
  const out = loans.filter((l) => !l.returnedAt);
  const done = loans.filter((l) => l.returnedAt);
  const held = d.requests.filter((x) => x.kind === "Reserve" && x.itemId === b.id && x.status === "ready");
  const waiting = d.requests.filter((x) => x.kind === "Reserve" && x.itemId === b.id && x.status === "pending");
  const avg = done.length ? Math.round(done.reduce((s, l) => s + dayDiff(l.issuedAt, l.returnedAt!), 0) / done.length) : 0;
  const who = (card: string) => d.members.find((m) => m.card === card)?.name ?? card;
  const stock = (delta: number) => r.run("stock", () => api(`/api/admin/books/${b.id}/stock`, { body: { delta } }), delta > 0 ? "Added a copy." : "Removed a copy.");

  return (
    <div className="space-y-4">
      <Back section="books" label="All books" />
      <Panel>
        <div className="flex gap-4">
          <BookCover book={b as Book} className="w-24 shrink-0 sm:w-28" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl leading-tight font-extrabold">{b.title}</h2>
            {b.titleMl && <p className="font-ml text-muted">{b.titleMl}</p>}
            <p className="mt-1 text-[15px] text-ink-2">{b.author}</p>
            <div className="mt-2 flex flex-wrap gap-1.5"><Pill tone="info">{b.language}</Pill><Pill tone="muted">{b.category}</Pill><Pill tone="muted">{b.id}</Pill></div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn icon={BookUp} disabled={b.available <= 0} onClick={() => go("desk", { id: b.id })}>Issue a copy</Btn>
          <Btn tone="soft" icon={Pencil} onClick={() => setEditing(true)}>Edit</Btn>
          <Link href={`/catalogue/${b.id}`} className="inline-flex items-center rounded-full bg-mist-2 px-3.5 py-2 text-[13.5px] font-semibold hover:bg-line">View on site</Link>
        </div>
      </Panel>

      <Panel title="Where is it?">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Tile n={b.available} label={`on shelf ${b.shelf}`} tone={b.available > 0 ? "bg-teal-50" : "bg-laterite-50"} />
          <Tile n={out.length} label="out on loan" />
          <Tile n={held.length} label="held at the desk" />
          <Tile n={b.copies} label="copies owned" />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-mist px-3.5 py-2">
          <span className="text-[14.5px] font-semibold">Copies owned</span>
          <span className="flex items-center gap-3">
            <Btn tone="soft" icon={Minus} aria-label="Remove a copy" disabled={b.available <= 0} onClick={() => stock(-1)} className="size-10 p-0!" />
            <b className="w-6 text-center font-display text-xl tabular-nums">{b.copies}</b>
            <Btn tone="soft" icon={Plus} aria-label="Add a copy" onClick={() => stock(1)} className="size-10 p-0!" />
          </span>
        </div>

        <p className="mt-4 mb-1 text-[13px] font-semibold tracking-[0.1em] text-muted uppercase">With members now · {out.length}</p>
        {out.length ? <ul className="divide-y divide-line">{out.map((l) => <LoanRow key={l.id} l={l} d={d} r={r} />)}</ul> : <EmptyRow>Every copy is on the shelf.</EmptyRow>}

        {(held.length > 0 || waiting.length > 0) && (
          <>
            <p className="mt-4 mb-1 text-[13px] font-semibold tracking-[0.1em] text-muted uppercase">Reservations · {held.length + waiting.length}</p>
            <ul className="divide-y divide-line">{[...held, ...waiting].map((x) => <RequestRow key={x.id} x={x} d={d} r={r} />)}</ul>
          </>
        )}
      </Panel>

      <Panel title={<>History <span className="text-muted">{loans.length} loans</span></>}>
        {loans.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2.5">
            <Tile n={loans.length} label="times borrowed" />
            <Tile n={done.length ? `${avg} d` : "–"} label="average loan" />
            <Tile n={done[0]?.returnedAt ? fmtShort(done.sort((a, z) => z.returnedAt!.localeCompare(a.returnedAt!))[0].returnedAt!) : "–"} label="last returned" />
          </div>
        )}
        {loans.length ? (
          <ol className="relative space-y-3 border-l-2 border-line pl-4">
            {loans.map((l) => (
              <li key={l.id} className="relative">
                <span className={`absolute top-1.5 -left-[23px] size-3 rounded-full ring-4 ring-card ${l.returnedAt ? "bg-teal" : daysLeft(l.dueAt) < 0 ? "bg-laterite" : "bg-kani"}`} />
                <button onClick={() => go("members", { id: l.card })} className="text-left font-semibold underline-offset-2 hover:underline">{who(l.card)}</button>
                <span className="text-[13px] text-muted"> · {l.card}</span>
                <p className="text-[13.5px] text-ink-2">
                  Issued {fmtTime(l.issuedAt)} · due {fmtShort(l.dueAt)}
                  {l.returnedAt ? ` · returned ${fmtTime(l.returnedAt)} (${dayDiff(l.issuedAt, l.returnedAt)} days)` : daysLeft(l.dueAt) < 0 ? ` · ${-daysLeft(l.dueAt)} days overdue` : " · out now"}
                  {l.renewals ? ` · renewed ${l.renewals}×` : ""}
                </p>
              </li>
            ))}
          </ol>
        ) : <EmptyRow>Never borrowed yet.</EmptyRow>}
      </Panel>
      {editing && <ItemEditor type="books" item={b as Book} r={r} onClose={() => setEditing(false)} />}
      {r.toast}
    </div>
  );
}

/* ───────── Vipani product page ───────── */

export function ProductDetail({ d, id }: { d: AdminOverview; id: string }) {
  const r = useRun();
  const { go } = useAdmin();
  const p = d.products.find((x) => x.id === id);
  const [editing, setEditing] = useState(false);
  if (!p) return <Missing section="products" what="product" />;
  const orders = d.requests.filter((x) => x.kind === "Order" && x.itemId === p.id);
  const live = orders.filter((x) => x.status !== "declined" && x.status !== "cancelled");
  const revenue = live.reduce((s, x) => s + (x.amount ?? 0), 0);
  const a = p.auction;

  return (
    <div className="space-y-4">
      <Back section="products" label="All Vipani items" />
      <Panel>
        <div className="flex items-start gap-3">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-kani-50 text-4xl">{p.emoji}</span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl leading-tight font-extrabold">{p.name}</h2>
            <p className="font-ml text-muted">{p.nameMl}</p>
          </div>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[14px] sm:grid-cols-4">
          <Fact k="Seller" v={p.seller} />
          <Fact k={a ? "Opening price" : "Price"} v={`${inr(p.price)} / ${p.unit}`} />
          <Fact k="Orders" v={live.length} />
          <Fact k="Value" v={inr(revenue)} />
        </dl>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn tone="soft" icon={Pencil} onClick={() => setEditing(true)}>Edit item</Btn>
          {a && <Btn icon={Gavel} onClick={() => go("auctions", { id: p.id })}>Open live bidding</Btn>}
          <Link href={`/vipani/${p.id}`} className="inline-flex items-center rounded-full bg-mist-2 px-3.5 py-2 text-[13.5px] font-semibold hover:bg-line">View on site</Link>
        </div>
      </Panel>
      {!a && (
        <Panel title={<>Orders <span className="text-muted">{orders.length}</span></>}>
          {orders.length ? <ul className="divide-y divide-line">{orders.map((x) => <RequestRow key={x.id} x={x} d={d} r={r} />)}</ul> : <EmptyRow>No orders yet.</EmptyRow>}
        </Panel>
      )}
      {a && (
        <Panel title="Auction">
          <p className="text-[15px] text-ink-2">Highest bid {inr(a.currentBid)} · {a.bids} bids · {a.closedAt ? (a.winner ? `sold to ${a.winner.name}` : "closed") : `closes ${fmtTime(a.endsAt)}`}.</p>
        </Panel>
      )}
      {editing && <ItemEditor type="products" item={p as Product} r={r} onClose={() => setEditing(false)} />}
      {r.toast}
    </div>
  );
}
