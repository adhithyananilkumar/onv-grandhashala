import { cardKey, findUser, newId, write } from "@/server/db";
import { body, fail, handle, ok, requireAdmin, str } from "@/server/http";
import type { LedgerEntry, LibRequest, Payment } from "@/lib/types";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const shortName = (n: string) => { const [first, ...rest] = n.trim().split(/\s+/); return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first; };
const stepFor = (bid: number) => (bid >= 1000 ? 50 : 10);

type Body = { action?: string; amount?: number; name?: string; card?: string; hours?: number; minutes?: number; collect?: string };

/**
 * Staff run an auction live. Actions:
 *  start     – open it for bidding now and mark it LIVE (members see it on their phones and watch it update)
 *  floorBid  – record a bid called out in the hall (a member by library number, or anyone by name)
 *  extend    – give more time
 *  pause     – take off LIVE without closing
 *  close     – sold: fix the winner and raise their payment (or record cash taken at the desk)
 *  reopen    – undo a close
 */
export const POST = handle(async (req: Request, ctx: RouteContext<"/api/admin/auctions/[id]">) => {
  const { id } = await ctx.params;
  await requireAdmin();
  const b = await body<Body>(req);
  const action = str(b.action, 20);

  const r = await write((db): { error: string; status?: number; field?: string } | { product: unknown; payment?: Payment } => {
    const p = db.products.find((x) => x.id === id);
    const a = p?.auction;
    if (!p || !a) return { error: "That isn't an auction.", status: 404 };
    const now = Date.now();
    const iso = new Date(now).toISOString();
    const closed = !!a.closedAt || new Date(a.endsAt).getTime() < now;

    if (action === "start") {
      const hours = Math.min(72, Math.max(0.25, Number(b.hours) || 3));
      a.live = true;
      delete a.closedAt;
      delete a.winner;
      a.endsAt = new Date(now + hours * 3_600_000).toISOString();
      return { product: p };
    }
    if (action === "pause") { a.live = false; return { product: p }; }
    if (action === "extend") {
      const m = Math.min(24 * 60, Math.max(1, Math.round(Number(b.minutes) || 10)));
      if (a.closedAt) return { error: "This auction is closed. Reopen it first.", status: 409 };
      a.endsAt = new Date(Math.max(new Date(a.endsAt).getTime(), now) + m * 60_000).toISOString();
      return { product: p };
    }

    if (action === "floorBid") {
      if (closed) return { error: "This auction is closed.", status: 409 };
      const amount = Math.round(Number(b.amount) || 0);
      const min = a.bids === 0 ? a.currentBid : a.currentBid + stepFor(a.currentBid);
      if (amount < min) return { error: `Bid at least ${inr(min)}.`, status: 409, field: "amount" };
      const cardIn = str(b.card, 12);
      const member = cardKey(cardIn) ? findUser(db, cardIn) : undefined;
      if (cardKey(cardIn) && !member) return { error: "No member with that library number.", status: 404, field: "card" };
      const name = member?.name ?? str(b.name, 60);
      if (name.length < 2) return { error: "Enter the bidder's name or library number.", status: 400, field: "name" };

      a.currentBid = amount;
      a.bids += 1;
      a.history = [{ by: shortName(name), amount, at: iso, src: "floor" as const }, ...(a.history ?? [])].slice(0, 12);
      a.leader = { name, ...(member ? { card: member.card } : {}) };
      // Keep the last two minutes alive while the room is still bidding.
      if (a.live && new Date(a.endsAt).getTime() - now < 120_000) a.endsAt = new Date(now + 120_000).toISOString();
      for (const x of db.requests) if (x.kind === "Bid" && x.itemId === id && x.status === "confirmed") { x.status = "declined"; x.note = `Outbid at ${inr(amount)}`; }
      if (member) {
        const bid: LibRequest = { id: newId("BID"), kind: "Bid", card: member.card, name: member.name, itemId: id, title: p.name, detail: `Highest bid ${inr(amount)} · called in the hall`, amount, at: iso, status: "confirmed" };
        db.requests.unshift(bid);
      }
      return { product: p };
    }

    if (action === "close") {
      if (a.closedAt) return { error: "Already closed.", status: 409 };
      a.closedAt = iso;
      a.live = false;
      if (new Date(a.endsAt).getTime() > now) a.endsAt = iso;
      if (a.bids === 0 || !a.leader) return { product: p };
      a.winner = { ...a.leader, amount: a.currentBid };
      const win = db.requests.find((x) => x.kind === "Bid" && x.itemId === id && x.status === "confirmed" && (!a.leader?.card || cardKey(x.card) === cardKey(a.leader.card)));
      if (win) { win.status = "done"; win.note = "Won"; }
      const collect = str(b.collect, 10);
      const paidNow = collect === "cash" || collect === "upi";
      if (a.winner.card) {
        const m = findUser(db, a.winner.card);
        const pay: Payment = {
          id: newId("PAY"), card: a.winner.card, name: m?.name ?? a.winner.name, title: `${p.name} (auction won)`, kind: "Order", amount: a.currentBid,
          createdAt: iso, status: paidNow ? "paid" : "due", ref: win?.id,
          ...(paidNow ? { method: collect === "upi" ? ("UPI" as const) : ("Cash" as const), paidAt: iso } : {}),
        };
        db.payments.unshift(pay);
        return { product: p, payment: pay };
      }
      // A walk-in has no account to bill, so money taken at the desk goes straight into the day book.
      if (paidNow) {
        const e: LedgerEntry = { id: newId("LED"), date: iso, type: "in", category: "Auction", amount: a.currentBid, method: collect === "upi" ? "UPI" : "Cash", note: `${p.name} – ${a.winner.name}`, party: a.winner.name };
        (db.ledger ??= []).unshift(e);
      }
      return { product: p };
    }

    if (action === "reopen") {
      if (!closed) return { error: "This auction is still open.", status: 409 };
      const hours = Math.min(72, Math.max(0.25, Number(b.hours) || 1));
      const won = db.requests.find((x) => x.kind === "Bid" && x.itemId === id && x.status === "done" && x.note === "Won");
      if (won) {
        won.status = "confirmed";
        delete won.note;
        for (const pay of db.payments) if (pay.ref === won.id && pay.status === "due") pay.status = "waived";
      }
      delete a.closedAt;
      delete a.winner;
      a.endsAt = new Date(now + hours * 3_600_000).toISOString();
      return { product: p };
    }
    return { error: "Unknown action.", status: 400 };
  });
  return "error" in r ? fail(r.error, r.status ?? 400, { field: r.field }) : ok(r);
});
