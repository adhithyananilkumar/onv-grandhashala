import { newId, write } from "@/server/db";
import { body, fail, handle, ok, requireAdmin, str } from "@/server/http";
import type { LedgerEntry, PayMethod } from "@/lib/types";

/** Staff: add a line to the day book (a donation, a bill, petty cash, a grant…). */
export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const b = await body<{ type?: string; category?: string; amount?: number; method?: string; note?: string; party?: string; date?: string }>(req);
  const type = b.type === "out" ? "out" : "in";
  const amount = Math.round(Number(b.amount) || 0);
  const category = str(b.category, 40);
  const method = (["Cash", "UPI", "Bank"].includes(str(b.method)) ? str(b.method) : "Cash") as PayMethod;
  if (amount <= 0 || amount > 10_000_000) return fail("Enter an amount in rupees.", 400, { field: "amount" });
  if (!category) return fail("Pick a category.", 400, { field: "category" });
  // A date picked in the form is a day in Kerala; keep the time of day so the book stays in order.
  const picked = /^\d{4}-\d{2}-\d{2}$/.test(str(b.date)) ? new Date(`${b.date}T12:00:00+05:30`) : new Date();
  const e: LedgerEntry = { id: newId("LED"), date: picked.toISOString(), type, category, amount, method, note: str(b.note, 160), ...(str(b.party, 60) ? { party: str(b.party, 60) } : {}) };
  await write((db) => { (db.ledger ??= []).unshift(e); });
  return ok(e, 201);
});
