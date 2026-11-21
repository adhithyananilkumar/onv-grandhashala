import { cardKey, newId, write } from "@/server/db";
import { body, fail, handle, ok, requireUser, str } from "@/server/http";
import type { LibRequest, Payment } from "@/lib/types";

const feeNum = (f: string) => (f === "Free" ? 0 : Number(f.replace(/[^\d]/g, "")) || 0);
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * A member acts on something: reserve a book, enrol in a class, register for an event,
 * order from Vipani or bid in an auction. Body: { kind, itemId, ...details }.
 */
export const POST = handle(async (req: Request) => {
  const me = await requireUser();
  const b = await body<Record<string, unknown>>(req);
  const kind = str(b.kind), itemId = str(b.itemId);

  const r = await write((db): { error: string; status?: number } | { request: LibRequest; payment?: Payment } => {
    const now = new Date().toISOString();
    const base = { card: me.card, name: me.name, itemId, at: now };
    const open = (k: string) => db.requests.find((x) => x.kind === k && x.itemId === itemId && cardKey(x.card) === cardKey(me.card) && ["pending", "confirmed", "ready"].includes(x.status));
    const charge = (title: string, kindP: Payment["kind"], amount: number, ref: string): Payment =>
      ({ id: newId("PAY"), card: me.card, name: me.name, title, kind: kindP, amount, createdAt: now, status: "due", ref });

    if (kind === "Reserve") {
      const book = db.books.find((x) => x.id === itemId);
      if (!book) return { error: "That book isn't in the catalogue.", status: 404 };
      if (open("Reserve")) return { error: "You've already reserved this book. See My books.", status: 409 };
      if (db.loans.some((l) => l.bookId === itemId && !l.returnedAt && cardKey(l.card) === cardKey(me.card))) return { error: "You already have this book on loan.", status: 409 };
      const queue = book.available === 0;
      const pickup = str(b.pickup, 40) || "Tomorrow";
      const request: LibRequest = { ...base, id: newId("RSV"), kind: "Reserve", title: book.title, detail: queue ? "In the queue" : `Collect ${pickup.toLowerCase()}`, status: "pending" };
      db.requests.unshift(request);
      return { request };
    }

    if (kind === "Enrol") {
      const c = db.classes.find((x) => x.id === itemId);
      if (!c) return { error: "That class isn't running.", status: 404 };
      if (c.seatsLeft <= 0) return { error: "This class is full. Ask at the desk to join the waiting list.", status: 409 };
      const who = str(b.who, 20) === "My child" ? str(b.student, 60) : "";
      if (str(b.who, 20) === "My child" && (who.length < 2 || !str(b.age, 2))) return { error: "Add the student's name and age." };
      if (!who && open("Enrol")) return { error: "You're already enrolled in this class.", status: 409 };
      c.seatsLeft -= 1;
      const fee = feeNum(c.fee);
      const request: LibRequest = { ...base, id: newId("CLS"), kind: "Enrol", title: c.title, detail: [who ? `For ${who}, ${str(b.age, 2)}` : "", c.schedule].filter(Boolean).join(" · "), amount: fee || undefined, status: "confirmed" };
      db.requests.unshift(request);
      const payment = fee ? charge(`${c.title}, first month fee`, "Class fee", fee, request.id) : undefined;
      if (payment) db.payments.unshift(payment);
      return { request, payment };
    }

    if (kind === "Register") {
      const e = db.events.find((x) => x.id === itemId);
      if (!e) return { error: "That event isn't on the calendar.", status: 404 };
      if (open("Register")) return { error: "You're already registered. See My bookings.", status: 409 };
      const people = Math.min(6, Math.max(1, Number(b.people) || 1));
      const slot = str(b.slot, 30);
      const request: LibRequest = { ...base, id: newId("EVT"), kind: "Register", title: e.title, detail: `${people} ${people === 1 ? "person" : "people"}${e.kind === "Health" && slot ? ` · ${slot} token` : ""}`, status: "confirmed" };
      db.requests.unshift(request);
      return { request };
    }

    if (kind === "Order") {
      const p = db.products.find((x) => x.id === itemId);
      if (!p || p.auction) return { error: "That product can't be ordered.", status: 404 };
      const qty = Math.min(10, Math.max(1, Number(b.qty) || 1));
      const pickup = str(b.pickup, 40) || "Market day (Saturday)";
      const amount = qty * p.price;
      const request: LibRequest = { ...base, id: newId("ORD"), kind: "Order", title: p.name, detail: `${qty} × ${inr(p.price)} · ${pickup}`, amount, status: "pending" };
      db.requests.unshift(request);
      const payment = charge(`${p.name} (${qty} × ${p.unit})`, "Order", amount, request.id);
      db.payments.unshift(payment);
      return { request, payment };
    }

    if (kind === "Bid") {
      const p = db.products.find((x) => x.id === itemId);
      if (!p?.auction) return { error: "That auction isn't running.", status: 404 };
      if (new Date(p.auction.endsAt).getTime() < Date.now()) return { error: "This auction has closed.", status: 409 };
      const step = p.auction.currentBid >= 1000 ? 50 : 10;
      const amount = Math.round(Number(b.amount) || 0);
      const min = p.auction.currentBid + step;
      if (amount < min) return { error: `Bid at least ${inr(min)}.`, status: 409 };
      p.auction.currentBid = amount;
      p.auction.bids += 1;
      for (const x of db.requests) if (x.kind === "Bid" && x.itemId === itemId && x.status === "confirmed") { x.status = "declined"; x.note = `Outbid at ${inr(amount)}`; }
      const request: LibRequest = { ...base, id: newId("BID"), kind: "Bid", title: p.name, detail: `Highest bid ${inr(amount)}`, amount, status: "confirmed" };
      db.requests.unshift(request);
      return { request };
    }

    return { error: "Unknown action." };
  });
  if ("error" in r) return fail(r.error, r.status ?? 400);
  return ok(r, 201);
});
