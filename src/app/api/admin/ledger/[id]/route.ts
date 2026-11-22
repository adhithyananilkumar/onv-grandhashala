import { write } from "@/server/db";
import { fail, handle, ok, requireAdmin } from "@/server/http";

/** Staff: delete a day-book line (payments from members are corrected in Payments instead). */
export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/admin/ledger/[id]">) => {
  const { id } = await ctx.params;
  await requireAdmin();
  const done = await write((db) => {
    const i = db.ledger?.findIndex((q) => q.id === id) ?? -1;
    if (i < 0) return false;
    db.ledger!.splice(i, 1);
    return true;
  });
  return done ? ok({ ok: true }) : fail("Entry not found.", 404);
});
