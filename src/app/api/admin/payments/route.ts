import { findUser, newId, write } from "@/server/db";
import { body, fail, handle, ok, requireAdmin, str } from "@/server/http";
import type { Payment, PaymentKind } from "@/lib/types";

const KINDS: PaymentKind[] = ["Fine", "Class fee", "Order", "Membership", "Other"];

/** Staff: add a charge to a member (membership, damaged book, class fee…). */
export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const b = await body<{ card?: string; title?: string; kind?: string; amount?: number; paid?: boolean }>(req);
  const title = str(b.title, 120);
  const amount = Math.round(Number(b.amount) || 0);
  const kind = (KINDS.includes(str(b.kind) as PaymentKind) ? str(b.kind) : "Other") as PaymentKind;
  if (title.length < 2) return fail("What is this charge for?", 400, { field: "title" });
  if (amount <= 0 || amount > 100000) return fail("Enter an amount in rupees.", 400, { field: "amount" });
  const r = await write((db) => {
    const u = findUser(db, str(b.card));
    if (!u) return null;
    const now = new Date().toISOString();
    const p: Payment = { id: newId("PAY"), card: u.card, name: u.name, title, kind, amount, createdAt: now, status: b.paid ? "paid" : "due", ...(b.paid ? { method: "Cash" as const, paidAt: now } : {}) };
    db.payments.unshift(p);
    return p;
  });
  return r ? ok(r, 201) : fail("No member with that library number.", 404, { field: "card" });
});
