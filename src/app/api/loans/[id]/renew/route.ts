import { cardKey, DAY, write } from "@/server/db";
import { fail, handle, ok, requireUser } from "@/server/http";

/** Renew a loan for another loan period: not overdue, under the renewal limit, nobody waiting. */
export const POST = handle(async (_req: Request, ctx: RouteContext<"/api/loans/[id]/renew">) => {
  const { id } = await ctx.params;
  const me = await requireUser();
  const r = await write((db) => {
    const l = db.loans.find((x) => x.id === id);
    if (!l || (me.role !== "admin" && cardKey(l.card) !== cardKey(me.card))) return { error: "Loan not found.", status: 404 };
    if (l.returnedAt) return { error: "This book is already returned.", status: 409 };
    if (new Date(l.dueAt).getTime() < Date.now()) return { error: "It's overdue, so it can't be renewed online. Please bring it to the desk.", status: 409 };
    if (l.renewals >= db.settings.maxRenewals) return { error: `Renewed ${db.settings.maxRenewals} times already. Please return it.`, status: 409 };
    if (db.requests.some((q) => q.kind === "Reserve" && q.itemId === l.bookId && q.status === "pending" && cardKey(q.card) !== cardKey(l.card))) return { error: "Someone is waiting for this book, so it can't be renewed.", status: 409 };
    l.dueAt = new Date(new Date(l.dueAt).getTime() + db.settings.loanDays * DAY).toISOString();
    l.renewals += 1;
    return { loan: l };
  });
  return "error" in r ? fail(r.error as string, r.status as number) : ok(r);
});
