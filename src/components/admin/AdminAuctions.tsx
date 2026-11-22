"use client";

import { useState } from "react";
import { ArrowLeft, Gavel, Globe, Hammer, Pause, Play, Plus, RotateCcw, Timer, Trophy, Users } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { fmtTime, inr, Pill } from "@/lib/format";
import type { AdminOverview, Product } from "@/lib/types";
import { Sheet } from "../forms";
import { Countdown } from "../Countdown";
import { ItemEditor } from "./AdminContent";
import { usePending } from "./AdminShell";
import { Btn, EmptyRow, inputBox, Labeled, Panel, useRun } from "./kit";

type Auction = NonNullable<Product["auction"]>;
const stepOf = (bid: number) => (bid >= 1000 ? 50 : 10);
const isClosed = (a: Auction) => !!a.closedAt || new Date(a.endsAt).getTime() < Date.now();

function State({ a }: { a: Auction }) {
  if (a.closedAt) return <Pill tone="muted">{a.winner ? "Sold" : "Closed"}</Pill>;
  if (isClosed(a)) return <Pill tone="warn">Time up</Pill>;
  if (a.live) return <span className="inline-flex items-center gap-1.5 rounded-full bg-teal px-2.5 py-0.5 text-[12px] font-bold text-mist"><span className="size-1.5 animate-pulse rounded-full bg-mist" /> LIVE</span>;
  return <Pill tone="info">Open online</Pill>;
}

export function AuctionsPanel({ d }: { d: AdminOverview }) {
  const r = useRun();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  usePending("auctions", (p) => { if (p.id) setOpenId(p.id); });
  const items = d.products.filter((p) => p.auction);
  const sel = items.find((p) => p.id === openId);

  if (sel) return <Console p={sel} d={d} r={r} onBack={() => setOpenId(null)} />;

  const sorted = [...items].sort((a, b) => Number(isClosed(a.auction!)) - Number(isClosed(b.auction!)) || Number(!!b.auction!.live) - Number(!!a.auction!.live) || a.auction!.endsAt.localeCompare(b.auction!.endsAt));
  return (
    <>
      <Panel title={<>Auctions <span className="text-muted">{items.length}</span></>} action={<Btn icon={Plus} onClick={() => setCreating(true)}>New auction</Btn>}>
        <p className="mb-3 text-[14px] text-muted">Run a bid in the hall and online at the same time. Tap an auction, press Go live, then record each bid as it&apos;s called. Members watch it update on their phones and can bid online too.</p>
        {sorted.length ? (
          <ul className="space-y-2.5">
            {sorted.map((p) => {
              const a = p.auction!;
              return (
                <li key={p.id}>
                  <button onClick={() => setOpenId(p.id)} className={`flex w-full items-center gap-3 rounded-2xl p-3.5 text-left ring-1 active:scale-[0.99] ${a.live && !isClosed(a) ? "bg-teal-50 ring-teal/40" : "bg-mist ring-line/60"}`}>
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-kani-50 text-2xl">{p.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <b className="block leading-snug font-semibold">{p.name}</b>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted"><State a={a} />{a.winner ? `Won by ${a.winner.name}` : `${a.bids} bids · ${fmtTime(a.endsAt)}`}</span>
                    </span>
                    <span className="font-display text-[1.2rem] font-extrabold tabular-nums">{inr(a.currentBid)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : <EmptyRow>No auctions yet. Create one to start.</EmptyRow>}
      </Panel>
      {creating && <ItemEditor type="products" item={null} preset={{ isAuction: true, emoji: "🔨" }} r={r} onClose={() => setCreating(false)} />}
      {r.toast}
    </>
  );
}

function Console({ p, d, r, onBack }: { p: Product; d: AdminOverview; r: ReturnType<typeof useRun>; onBack: () => void }) {
  const a = p.auction!;
  const closed = isClosed(a);
  const step = stepOf(a.currentBid);
  const min = a.bids === 0 ? a.currentBid : a.currentBid + step;
  const [amount, setAmount] = useState("");
  const [who, setWho] = useState("");
  const [err, setErr] = useState<{ field?: string; msg?: string }>({});
  const [closing, setClosing] = useState(false);
  const [editing, setEditing] = useState(false);
  const key = who.match(/^\s*(?:onv[\s-]*)?(\d{4})\s*$/i)?.[1];
  const member = key ? d.members.find((m) => m.card.endsWith(key)) : undefined;
  const act = (action: string, extra: Record<string, unknown>, msg: string) => r.run(action, () => api(`/api/admin/auctions/${p.id}`, { body: { action, ...extra } }), msg);

  const call = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr({});
    const value = Number(amount) || min;
    try {
      await api(`/api/admin/auctions/${p.id}`, { body: { action: "floorBid", amount: value, ...(key ? { card: key } : { name: who }) } });
      r.run("noop", async () => 0, `${inr(value)} recorded.`);
      setAmount(""); setWho("");
    } catch (x) { const z = x as ApiError; setErr({ field: z.field, msg: z.message }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Btn tone="soft" icon={ArrowLeft} onClick={onBack} aria-label="All auctions" className="size-11 p-0!" />
        <span className="min-w-0 flex-1"><b className="block font-display text-[1.1rem] leading-tight">{p.emoji} {p.name}</b><span className="flex items-center gap-2 text-[13px] text-muted">{p.seller} <State a={a} /></span></span>
      </div>

      <div className="rounded-3xl bg-royal p-5 text-mist">
        <p className="text-[12px] font-semibold tracking-[0.14em] text-mist/70 uppercase">{closed ? (a.winner ? "Sold for" : "Closed at") : "Highest bid"}</p>
        <p className="font-display text-[3.2rem] leading-none font-extrabold tabular-nums">{inr(a.currentBid)}</p>
        <p className="mt-2 flex items-center gap-2 text-[15px]">
          <Trophy size={16} className="text-kani" />
          {a.winner ? <>Won by <b>{a.winner.name}</b>{a.winner.card ? ` (${a.winner.card})` : " (walk-in)"}</> : a.leader ? <>Leading: <b>{a.leader.name}</b></> : "No bids yet"}
        </p>
        <div className="mt-3 flex items-center justify-between text-[13.5px] text-mist/80">
          <span>{a.bids} bids</span>
          {!closed ? <span className="text-kani [&_p]:text-kani"><Countdown to={a.endsAt} /></span> : <span>{a.closedAt ? `Closed ${fmtTime(a.closedAt)}` : "Time is up"}</span>}
        </div>
      </div>

      {!closed && (
        <Panel title="Record a bid">
          <form onSubmit={call} className="space-y-3">
            <Labeled label="Amount (₹)" hint={`At least ${inr(min)}`} error={err.field === "amount" ? err.msg : undefined}>
              <input className={`${inputBox} h-14 font-display text-2xl font-bold tabular-nums`} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 7))} placeholder={String(min)} />
            </Labeled>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 5, 10].map((k) => { const v = min + step * k; return <button key={k} type="button" onClick={() => setAmount(String(v))} className={`rounded-full px-4 py-2.5 text-[15px] font-semibold tabular-nums ring-2 ${Number(amount) === v ? "bg-royal text-mist ring-royal" : "bg-card ring-line"}`}>{inr(v)}</button>; })}
            </div>
            <Labeled label="Bidder: library number or name" hint="No account? Just type their name." error={err.field === "name" || err.field === "card" ? err.msg : undefined}>
              <input className={inputBox} value={who} onChange={(e) => setWho(e.target.value)} placeholder="e.g. 1234 or Raghavan" autoComplete="off" />
            </Labeled>
            {key && (member ? <p className="rounded-2xl bg-teal-50 px-3.5 py-2.5 text-[14px] text-teal-700"><b>{member.name}</b> · member</p> : <p className="rounded-2xl bg-laterite-50 px-3.5 py-2.5 text-[14px] text-laterite-700">No member with ONV {key}.</p>)}
            {err.msg && !err.field && <p className="text-[14px] text-laterite-700">{err.msg}</p>}
            <Btn type="submit" icon={Hammer} disabled={!who.trim() || (!!key && !member)} className="w-full py-3.5 text-[16px]">Record bid {amount ? inr(Number(amount)) : inr(min)}</Btn>
          </form>
        </Panel>
      )}

      <Panel title="Controls">
        <div className="grid grid-cols-2 gap-2">
          {!closed && !a.live && <Btn icon={Play} busy={r.busy === "start"} onClick={() => act("start", { hours: 3 }, "Live now. Members can see it update.")} className="col-span-2 py-3.5 text-[15px]">Go live (3 hours)</Btn>}
          {!closed && a.live && <Btn tone="soft" icon={Pause} busy={r.busy === "pause"} onClick={() => act("pause", {}, "Taken off live. Online bidding stays open.")} className="py-3">Stop live</Btn>}
          {!closed && <Btn tone="soft" icon={Timer} busy={r.busy === "extend"} onClick={() => act("extend", { minutes: 10 }, "10 more minutes.")} className="py-3">+10 min</Btn>}
          {!closed && <Btn tone="danger" icon={Gavel} onClick={() => setClosing(true)} className="col-span-2 py-3.5 text-[15px]">{a.bids ? "Sold. Close the auction" : "Close with no sale"}</Btn>}
          {closed && <Btn tone="soft" icon={RotateCcw} busy={r.busy === "reopen"} onClick={() => { if (confirm("Reopen this auction? The winner's bill will be cancelled.")) act("reopen", { hours: 1 }, "Reopened for one hour."); }} className="col-span-2 py-3">Reopen</Btn>}
          <Btn tone="ghost" onClick={() => setEditing(true)} className="col-span-2 py-2.5">Edit item and opening price</Btn>
        </div>
      </Panel>

      <Panel title={<>Bids <span className="text-muted">{a.bids}</span></>}>
        {a.history?.length ? (
          <ul className="divide-y divide-line">
            {a.history.map((h, i) => (
              <li key={h.at + h.by} className={`flex items-center gap-3 py-2.5 ${i === 0 ? "font-semibold" : ""}`}>
                <span className={`grid size-9 shrink-0 place-items-center rounded-full ${h.src === "floor" ? "bg-kani-50 text-kani-700" : "bg-royal-50 text-royal"}`}>{h.src === "floor" ? <Users size={16} /> : <Globe size={16} />}</span>
                <span className="min-w-0 flex-1"><span className="block truncate">{h.by}</span><span className="block text-[12.5px] font-normal text-muted">{h.src === "floor" ? "In the hall" : "Online"} · {fmtTime(h.at)}</span></span>
                <b className="font-display tabular-nums">{inr(h.amount)}</b>
              </li>
            ))}
          </ul>
        ) : <EmptyRow>No bids yet.</EmptyRow>}
      </Panel>

      {closing && <CloseSheet p={p} r={r} onClose={() => setClosing(false)} />}
      {editing && <ItemEditor type="products" item={p} r={r} onClose={() => setEditing(false)} />}
      {r.toast}
    </div>
  );
}

function CloseSheet({ p, r, onClose }: { p: Product; r: ReturnType<typeof useRun>; onClose: () => void }) {
  const a = p.auction!;
  const sold = a.bids > 0 && !!a.leader;
  const go = async (collect: string) => {
    const done = await r.run("close", () => api(`/api/admin/auctions/${p.id}`, { body: { action: "close", collect } }), sold ? `Sold to ${a.leader?.name} for ${inr(a.currentBid)}.` : "Auction closed.");
    if (done) onClose();
  };
  return (
    <Sheet title={sold ? "Sold!" : "Close auction"} subtitle={sold ? `${a.leader!.name} · ${inr(a.currentBid)}` : "No bids were placed."} onClose={onClose}>
      <div className="space-y-2.5">
        {sold ? (
          <>
            <p className="text-[14.5px] text-ink-2">How is {a.leader!.name} paying?{a.leader!.card ? " The payment is added to their account." : " They have no account, so cash or UPI taken now goes in the day book."}</p>
            <Btn busy={r.busy === "close"} onClick={() => go("cash")} className="w-full py-3.5 text-[15px]">Paid in cash now</Btn>
            <Btn busy={r.busy === "close"} onClick={() => go("upi")} className="w-full py-3.5 text-[15px]">Paid by UPI now</Btn>
            <Btn tone="soft" busy={r.busy === "close"} onClick={() => go("later")} className="w-full py-3.5 text-[15px]">{a.leader!.card ? "Bill them, pay later" : "Close, nothing collected yet"}</Btn>
          </>
        ) : <Btn tone="danger" busy={r.busy === "close"} onClick={() => go("later")} className="w-full py-3.5 text-[15px]">Close the auction</Btn>}
      </div>
    </Sheet>
  );
}
