import { cardKey, write } from "@/server/db";
import { body, fail, handle, ok, requireUser, str } from "@/server/http";
import type { RequestStatus } from "@/lib/types";

const STATUSES: RequestStatus[] = ["pending", "confirmed", "ready", "done", "cancelled", "declined"];

/** Members can cancel their own open bookings; staff can move any booking to any status. */
export const PATCH = handle(async (req: Request, ctx: RouteContext<"/api/requests/[id]">) => {
  const { id } = await ctx.params;
  const me = await requireUser();
  const b = await body<{ status?: string; note?: string }>(req);
  const status = str(b.status) as RequestStatus;
  if (!STATUSES.includes(status)) return fail("Unknown status.");
  const admin = me.role === "admin";

  const r = await write((db) => {
    const x = db.requests.find((q) => q.id === id);
    if (!x) return { error: "Booking not found.", status: 404 };
    if (!admin) {
      if (cardKey(x.card) !== cardKey(me.card)) return { error: "Booking not found.", status: 404 };
      if (status !== "cancelled" || !["pending", "confirmed", "ready"].includes(x.status) || x.kind === "Bid") return { error: "This booking can't be cancelled now. Talk to the desk.", status: 409 };
    }
    const wasOpen = ["pending", "confirmed", "ready"].includes(x.status);
    const nowClosed = status === "cancelled" || status === "declined";
    // Give the seat back, and drop the unpaid fee or order charge.
    if (wasOpen && nowClosed) {
      if (x.kind === "Enrol") { const c = db.classes.find((k) => k.id === x.itemId); if (c) c.seatsLeft += 1; }
      for (const p of db.payments) if (p.ref === x.id && p.status === "due") p.status = "waived";
    }
    // A reservation marked "ready" holds a copy at the desk; cancelling it puts the copy back.
    if (x.kind === "Reserve") {
      const book = db.books.find((k) => k.id === x.itemId);
      if (book && status === "ready" && x.status !== "ready") {
        if (book.available <= 0) return { error: "No copy on the shelf to hold yet.", status: 409 };
        book.available -= 1;
      }
      if (book && x.status === "ready" && (status === "cancelled" || status === "declined" || status === "pending")) book.available = Math.min(book.copies, book.available + 1);
    }
    x.status = status;
    if (b.note !== undefined && admin) x.note = str(b.note, 200) || undefined;
    return { request: x };
  });
  return "error" in r ? fail(r.error as string, r.status as number) : ok(r);
});
