import { fineFor, findUser, newId, write } from "@/server/db";
import { body, fail, handle, ok, requireAdmin } from "@/server/http";
import type { Payment } from "@/lib/types";

/** Staff: take a book back. A late return adds a fine to the member's payments (unless waived). */
export const POST = handle(async (req: Request, ctx: RouteContext<"/api/admin/loans/[id]/return">) => {
  const { id } = await ctx.params;
  await requireAdmin();
  const b = await body<{ waiveFine?: boolean }>(req).catch(() => ({ waiveFine: false }));
  const r = await write((db) => {
    const l = db.loans.find((x) => x.id === id);
    if (!l) return { error: "Loan not found.", status: 404 };
    if (l.returnedAt) return { error: "Already returned.", status: 409 };
    l.returnedAt = new Date().toISOString();
    const book = db.books.find((x) => x.id === l.bookId);
    if (book) book.available = Math.min(book.copies, book.available + 1);
    const fine = fineFor(l, db.settings.finePerDay);
    let payment: Payment | undefined;
    if (fine > 0) {
      payment = {
        id: newId("PAY"), card: l.card, name: findUser(db, l.card)?.name ?? l.card, title: `Late return: ${l.title}`, kind: "Fine",
        amount: fine, createdAt: l.returnedAt, status: b.waiveFine ? "waived" : "due", ref: l.id,
      };
      db.payments.unshift(payment);
    }
    return { loan: l, payment };
  });
  return "error" in r ? fail(r.error as string, r.status as number) : ok(r);
});
