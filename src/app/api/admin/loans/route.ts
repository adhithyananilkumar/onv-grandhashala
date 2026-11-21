import { cardKey, DAY, findUser, newId, write } from "@/server/db";
import { body, fail, handle, ok, requireAdmin, str } from "@/server/http";
import type { Loan } from "@/lib/types";

/** Staff: issue a book to a member. Body: { card, bookId, requestId? } (requestId closes a reservation). */
export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const b = await body<{ card?: string; bookId?: string; requestId?: string; days?: number }>(req);
  const r = await write((db) => {
    const u = findUser(db, str(b.card));
    if (!u) return { error: "No member with that library number.", field: "card", status: 404 };
    if (u.blocked) return { error: "This card is on hold.", field: "card", status: 409 };
    const book = db.books.find((x) => x.id === str(b.bookId));
    if (!book) return { error: "Pick a book.", field: "bookId", status: 404 };
    const rq = b.requestId ? db.requests.find((x) => x.id === b.requestId) : undefined;
    // A copy held for a "ready" reservation was already taken off the shelf.
    const held = rq?.kind === "Reserve" && rq.status === "ready";
    if (!held && book.available <= 0) return { error: "No copies on the shelf. Return one first, or put the member in the queue.", field: "bookId", status: 409 };
    if (db.loans.some((l) => l.bookId === book.id && !l.returnedAt && cardKey(l.card) === cardKey(u.card))) return { error: "This member already has this book.", field: "bookId", status: 409 };
    if (!held) book.available -= 1;
    const now = Date.now();
    const days = Math.min(60, Math.max(1, Number(b.days) || db.settings.loanDays));
    const loan: Loan = { id: newId("LN"), bookId: book.id, title: book.title, card: u.card, issuedAt: new Date(now).toISOString(), dueAt: new Date(now + days * DAY).toISOString(), renewals: 0 };
    db.loans.unshift(loan);
    if (rq) rq.status = "done";
    // Close any other open reservation this member had for the same book.
    for (const x of db.requests) if (x.kind === "Reserve" && x.itemId === book.id && cardKey(x.card) === cardKey(u.card) && ["pending", "ready"].includes(x.status)) x.status = "done";
    return { loan };
  });
  return "error" in r ? fail(r.error as string, r.status as number, { field: r.field }) : ok(r, 201);
});
