import { write } from "@/server/db";
import { fail, handle, ok, requireAdmin } from "@/server/http";

export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/admin/notices/[id]">) => {
  const { id } = await ctx.params;
  await requireAdmin();
  const done = await write((db) => {
    const i = db.notices.findIndex((n) => n.id === id);
    if (i >= 0) db.notices.splice(i, 1);
    return i >= 0;
  });
  return done ? ok({ ok: true }) : fail("Notice not found.", 404);
});
