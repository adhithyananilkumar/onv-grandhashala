"use client";

import { useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { fmtShort, inr, Pill } from "@/lib/format";
import type { AdminOverview, Book, ClassItem, EventItem } from "@/lib/types";
import { BookCover } from "../ui";
import { ItemEditor } from "./AdminContent";
import { useAdmin, usePending } from "./AdminShell";
import { Btn, Chips, EmptyRow, matchText, Panel, SearchBox, useRun } from "./kit";

/* ───────── Books ───────── */

const BOOK_TABS = ["All", "On shelf", "All out", "Malayalam", "English"] as const;

export function BooksPanel({ d }: { d: AdminOverview }) {
  const r = useRun();
  const { go } = useAdmin();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof BOOK_TABS)[number]>("All");
  const [editing, setEditing] = useState<Book | "new" | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  usePending("books", (p) => {
    if (p.action === "new") setEditing("new");
    if (p.q) setQ(p.q);
    if (p.action === "search") setTimeout(() => searchRef.current?.querySelector("input")?.focus(), 80);
  });

  const list = d.books.filter((b) =>
    matchText(q, b.title, b.titleMl, b.author, b.shelf, b.category, b.id) &&
    (tab === "All" || (tab === "On shelf" ? b.available > 0 : tab === "All out" ? b.available === 0 : b.language === tab)));
  const copies = d.books.reduce((s, b) => s + b.copies, 0);
  const out = d.books.reduce((s, b) => s + (b.copies - b.available), 0);
  const stock = (b: Book, delta: number) => r.run(`stock-${b.id}`, () => api(`/api/admin/books/${b.id}/stock`, { body: { delta } }), delta > 0 ? `Added a copy of ${b.title}.` : `Removed a copy of ${b.title}.`);

  return (
    <>
      <Panel title={<>Books <span className="text-muted">{d.books.length} titles · {copies} copies · {out} out</span></>} action={<Btn icon={Plus} onClick={() => setEditing("new")}>Add book</Btn>}>
        <div className="space-y-2.5">
          <div ref={searchRef}><SearchBox value={q} onChange={setQ} placeholder="Title, author, shelf or subject" /></div>
          <Chips options={BOOK_TABS} value={tab} onChange={setTab} counts={{ "All out": d.books.filter((b) => b.available === 0).length }} />
        </div>
        {list.length ? (
          <ul className="mt-2 divide-y divide-line">
            {list.map((b) => (
              <li key={b.id} className={`flex items-center gap-3 py-3 ${r.busy === `stock-${b.id}` ? "opacity-60" : ""}`}>
                <BookCover book={b} size="sm" className="w-10 shrink-0" />
                <button onClick={() => go("books", { id: b.id })} className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-semibold">{b.title}</span>
                  <span className="block truncate text-[13px] text-muted">{b.author} · shelf {b.shelf} · {b.category}</span>
                  <span className="mt-0.5 block"><Pill tone={b.available > 0 ? "good" : "bad"}>{b.available}/{b.copies} on shelf</Pill></span>
                </button>
                <span className="flex shrink-0 items-center gap-1" aria-label="Copies owned">
                  <Btn tone="soft" icon={Minus} aria-label="Remove a copy" disabled={b.available <= 0} onClick={() => { if (b.copies > 1 || confirm(`Remove the last copy of ${b.title}?`)) stock(b, -1); }} className="size-10 p-0!" />
                  <Btn tone="soft" icon={Plus} aria-label="Add a copy" onClick={() => stock(b, 1)} className="size-10 p-0!" />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 space-y-3"><EmptyRow>No book matches{q ? ` “${q}”` : ""}.</EmptyRow>{q && <Btn icon={Plus} className="w-full py-3" onClick={() => setEditing("new")}>Add it as a new book</Btn>}</div>
        )}
        <p className="mt-3 text-[12.5px] text-muted">Tap a book to see where every copy is, who has it and its history. + and − add or remove a copy.</p>
      </Panel>
      {editing && <ItemEditor type="books" item={editing === "new" ? null : editing} preset={editing === "new" && q ? { title: q } : undefined} r={r} onClose={() => setEditing(null)} />}
      {r.toast}
    </>
  );
}

/* ───────── Events ───────── */

export type Person = { key: string; guest: boolean; id: string; name: string; phone?: string; card?: string; people: number; here: boolean; note?: string };

const today = () => new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10);

export function people(d: AdminOverview, eventId: string): Person[] {
  const members = d.requests
    .filter((x) => x.kind === "Register" && x.itemId === eventId && ["pending", "confirmed", "ready", "done"].includes(x.status))
    .map((x): Person => ({ key: x.id, guest: false, id: x.id, name: x.name, card: x.card, phone: d.members.find((m) => m.card === x.card)?.phone, people: parseInt(x.detail ?? "1", 10) || 1, here: x.status === "done" }));
  const guests = d.guests.filter((g) => g.eventId === eventId)
    .map((g): Person => ({ key: g.id, guest: true, id: g.id, name: g.name, phone: g.phone, people: g.people, here: !!g.attended, note: g.note }));
  return [...members, ...guests];
}
export const total = (ps: Person[]) => ps.reduce((s, p) => s + p.people, 0);

export function EventsPanel({ d }: { d: AdminOverview }) {
  const r = useRun();
  const { go } = useAdmin();
  const [editing, setEditing] = useState<EventItem | "new" | null>(null);
  const [past, setPast] = useState(false);
  const t = today();
  const upcoming = d.events.filter((e) => e.date >= t).sort((a, b) => a.date.localeCompare(b.date));
  const gone = d.events.filter((e) => e.date < t).sort((a, b) => b.date.localeCompare(a.date));

  usePending("events", (p) => { if (p.action === "new") setEditing("new"); });

  const row = (e: EventItem, dim = false) => {
    const n = total(people(d, e.id));
    const full = !!e.capacity && n >= e.capacity;
    return (
      <li key={e.id}>
        <button onClick={() => go("events", { id: e.id })} className={`flex w-full items-center gap-3 py-3 text-left ${dim ? "opacity-60" : ""}`}>
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-royal-50 text-center font-display text-[12px] leading-tight font-bold text-royal">{fmtShort(`${e.date}T00:00:00+05:30`)}</span>
          <span className="min-w-0 flex-1">
            <b className="block truncate font-semibold">{e.title}</b>
            <span className="block truncate text-[13px] text-muted">{e.time} · {e.place}{e.fee ? ` · ${inr(e.fee)}` : " · Free"}</span>
          </span>
          <span className="flex flex-col items-end gap-1"><Pill tone={full ? "bad" : "info"}>{n}{e.capacity ? ` / ${e.capacity}` : ""} in</Pill></span>
        </button>
      </li>
    );
  };

  return (
    <>
      <Panel title={<>Events <span className="text-muted">{d.events.length}</span></>} action={<Btn icon={Plus} onClick={() => setEditing("new")}>Add event</Btn>}>
        {upcoming.length ? <ul className="divide-y divide-line">{upcoming.map((e) => row(e))}</ul> : <EmptyRow>No events coming up. Add one.</EmptyRow>}
        {gone.length > 0 && (
          <div className="mt-3">
            <Btn tone="soft" onClick={() => setPast((v) => !v)}>{past ? "Hide" : "Show"} past events · {gone.length}</Btn>
            {past && <ul className="mt-1 divide-y divide-line">{gone.map((e) => row(e, true))}</ul>}
          </div>
        )}
      </Panel>
      {editing && <ItemEditor type="events" item={editing === "new" ? null : editing} r={r} onClose={() => setEditing(null)} />}
      {r.toast}
    </>
  );
}


/* ───────── Classes ───────── */

const feeNum = (f: string) => (f === "Free" ? 0 : Number(f.replace(/[^0-9]/g, "")) || 0);

/** Everyone in a class: members' enrolments (themselves or a child) plus walk-in students added at the desk. */
export function students(d: AdminOverview, classId: string): Person[] {
  const members = d.requests
    .filter((x) => x.kind === "Enrol" && x.itemId === classId && ["pending", "confirmed", "ready", "done"].includes(x.status))
    .map((x): Person => {
      const who = x.detail?.startsWith("For ") ? x.detail.slice(4).split(" · ")[0] : "";
      return { key: x.id, guest: false, id: x.id, name: who ? who.replace(/, *\?$/, "") : x.name, card: x.card, phone: d.members.find((m) => m.card === x.card)?.phone, people: 1, here: x.status === "done", note: who ? `Parent: ${x.name}` : undefined };
    });
  const guests = d.guests.filter((g) => g.eventId === classId)
    .map((g): Person => ({ key: g.id, guest: true, id: g.id, name: g.age ? `${g.name}, ${g.age}` : g.name, phone: g.phone, people: 1, here: !!g.attended }));
  return [...members, ...guests];
}

export function ClassesPanel({ d }: { d: AdminOverview }) {
  const r = useRun();
  const { go } = useAdmin();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<ClassItem | "new" | null>(null);
  usePending("classes", (p) => { if (p.action === "new") setEditing("new"); });
  const list = d.classes.filter((c) => matchText(q, c.title, c.titleMl, c.teacher, c.schedule));
  return (
    <>
      <Panel title={<>Classes <span className="text-muted">{d.classes.length}</span></>} action={<Btn icon={Plus} onClick={() => setEditing("new")}>Add class</Btn>}>
        <SearchBox value={q} onChange={setQ} placeholder="Search classes" />
        {list.length ? (
          <ul className="mt-2 divide-y divide-line">
            {list.map((c) => {
              const n = students(d, c.id).length;
              return (
                <li key={c.id}>
                  <button onClick={() => go("classes", { id: c.id })} className="flex w-full items-center gap-3 py-3 text-left">
                    <span className="min-w-0 flex-1">
                      <b className="block truncate font-semibold">{c.title}</b>
                      <span className="block truncate text-[13px] text-muted">{c.teacher} · {c.schedule} · {feeNum(c.fee) ? c.fee : "Free"}</span>
                    </span>
                    <span className="flex flex-col items-end gap-1"><Pill tone="info">{n} enrolled</Pill><span className={`text-[12.5px] ${c.seatsLeft <= 0 ? "font-semibold text-laterite-700" : "text-muted"}`}>{c.seatsLeft <= 0 ? "Full" : `${c.seatsLeft} seats left`}</span></span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : <div className="mt-3"><EmptyRow>No class found.</EmptyRow></div>}
      </Panel>
      {editing && <ItemEditor type="classes" item={editing === "new" ? null : editing} r={r} onClose={() => setEditing(null)} />}
      {r.toast}
    </>
  );
}
