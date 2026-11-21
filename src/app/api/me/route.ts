import { cardKey, publicUser, read } from "@/server/db";
import { handle, ok, requireUser } from "@/server/http";
import type { LibRequest, Loan, MemberSummary, Notice, Payment } from "@/lib/types";

/** The signed-in member's loans, bookings, payments and notices. */
export const GET = handle(async () => {
  const db = await read();
  const me = await requireUser(db);
  const mine = <T extends { card: string }>(xs: T[]) => xs.filter((x) => cardKey(x.card) === cardKey(me.card));
  const by = <T,>(k: keyof T) => (a: T, b: T) => String(b[k] ?? "").localeCompare(String(a[k] ?? ""));
  const out: MemberSummary = {
    user: publicUser(me),
    loans: mine(db.loans).sort(by<Loan>("issuedAt")),
    requests: mine(db.requests).sort(by<LibRequest>("at")),
    payments: mine(db.payments).sort(by<Payment>("createdAt")),
    notices: [...db.notices].sort(by<Notice>("at")),
    finePerDay: db.settings.finePerDay,
    maxRenewals: db.settings.maxRenewals,
    upi: { id: db.settings.upiId, name: db.settings.upiName },
  };
  return ok(out);
});
