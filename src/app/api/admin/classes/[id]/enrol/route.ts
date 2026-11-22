import { cardKey, findUser, newId, write } from "@/server/db";
import { body, fail, handle, ok, requireAdmin, str, validPhone } from "@/server/http";
import type { GuestReg, LedgerEntry, LibRequest, Payment } from "@/lib/types";

const feeNum = (f: string) => (f === "Free" ? 0 : Number(f.replace(/[^\d]/g, "")) || 0);

type Body = { card?: string; student?: string; age?: string; name?: string; phone?: string; collect?: string };

/**
 * Staff: enrol someone in a class at the desk.
 * With a library number it goes on that member's account (for themselves, or for a child if `student` is given)
 * and the first month's fee is billed. Otherwise it's a walk-in student with just a name.
 * `collect: "cash" | "upi"` records the fee as already paid.
 */
export const POST = handle(async (req: Request, ctx: RouteContext<"/api/admin/classes/[id]/enrol">) => {
  const { id } = await ctx.params;
  await requireAdmin();
  const b = await body<Body>(req);
  const card = str(b.card, 12);
  const collect = str(b.collect, 6);
  const paidNow = collect === "cash" || collect === "upi";

  const r = await write((db): { error: string; status?: number; field?: string } | { request?: LibRequest; guest?: GuestReg; payment?: Payment } => {
    const c = db.classes.find((x) => x.id === id);
    if (!c) return { error: "That class isn't running.", status: 404 };
    if (c.seatsLeft <= 0) return { error: "This class is full.", status: 409 };
    const now = new Date().toISOString();
    const fee = feeNum(c.fee);

    if (cardKey(card)) {
      const u = findUser(db, card);
      if (!u) return { error: "No member with that library number.", status: 404, field: "card" };
      const student = str(b.student, 60);
      if (student && student.length < 2) return { error: "Enter the student's name.", status: 400, field: "student" };
      const open = (x: LibRequest) => x.kind === "Enrol" && x.itemId === id && cardKey(x.card) === cardKey(u.card) && ["pending", "confirmed", "ready"].includes(x.status);
      if (!student && db.requests.some(open)) return { error: `${u.name} is already enrolled.`, status: 409, field: "card" };
      c.seatsLeft -= 1;
      const request: LibRequest = { id: newId("CLS"), kind: "Enrol", card: u.card, name: u.name, itemId: id, title: c.title, detail: [student ? `For ${student}, ${str(b.age, 2) || "?"}` : "", c.schedule].filter(Boolean).join(" · "), amount: fee || undefined, at: now, status: "confirmed" };
      db.requests.unshift(request);
      if (!fee) return { request };
      const payment: Payment = { id: newId("PAY"), card: u.card, name: u.name, title: `${c.title}, first month fee`, kind: "Class fee", amount: fee, createdAt: now, status: paidNow ? "paid" : "due", ref: request.id, ...(paidNow ? { method: collect === "upi" ? ("UPI" as const) : ("Cash" as const), paidAt: now } : {}) };
      db.payments.unshift(payment);
      return { request, payment };
    }

    const name = str(b.name, 60);
    const phone = str(b.phone, 10).replace(/\D/g, "");
    if (name.length < 2) return { error: "Enter the student's name.", status: 400, field: "name" };
    if (phone && !validPhone(phone)) return { error: "Enter a 10-digit mobile number, or leave it empty.", status: 400, field: "phone" };
    c.seatsLeft -= 1;
    const age = str(b.age, 2);
    const guest: GuestReg = { id: newId("GST"), kind: "class", eventId: id, eventTitle: c.title, name, ...(phone ? { phone } : {}), ...(age ? { age } : {}), people: 1, at: now };
    (db.guests ??= []).unshift(guest);
    // No account to bill, so a fee taken at the desk goes straight into the day book.
    if (fee && paidNow) {
      const e: LedgerEntry = { id: newId("LED"), date: now, type: "in", category: "Class fee", amount: fee, method: collect === "upi" ? "UPI" : "Cash", note: `${c.title} – ${name}`, party: name };
      (db.ledger ??= []).unshift(e);
    }
    return { guest };
  });
  return "error" in r ? fail(r.error, r.status ?? 400, { field: r.field }) : ok(r, 201);
});
