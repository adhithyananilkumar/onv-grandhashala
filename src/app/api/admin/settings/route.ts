import { write } from "@/server/db";
import { body, fail, handle, ok, requireAdmin, str } from "@/server/http";

/** Staff: library rules (fine per day, loan length, renewals) and the UPI ID members pay to. */
export const PATCH = handle(async (req: Request) => {
  await requireAdmin();
  const b = await body<Record<string, unknown>>(req);
  const num = (v: unknown, lo: number, hi: number) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n >= lo && n <= hi ? n : null; };
  const upiId = str(b.upiId, 60);
  if (b.upiId !== undefined && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upiId)) return fail("UPI ID looks like name@bank.", 400, { field: "upiId" });
  const settings = await write((db) => {
    const s = db.settings;
    s.finePerDay = num(b.finePerDay, 0, 100) ?? s.finePerDay;
    s.loanDays = num(b.loanDays, 1, 60) ?? s.loanDays;
    s.maxRenewals = num(b.maxRenewals, 0, 10) ?? s.maxRenewals;
    if (b.upiId !== undefined) s.upiId = upiId;
    if (b.upiName !== undefined && str(b.upiName).length > 1) s.upiName = str(b.upiName, 80);
    return s;
  });
  return ok(settings);
});
