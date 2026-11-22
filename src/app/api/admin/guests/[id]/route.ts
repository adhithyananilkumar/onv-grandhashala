import { write } from "@/server/db";
import { body, fail, handle, ok, requireAdmin } from "@/server/http";

type Ctx = RouteContext<"/api/admin/guests/[id]">;

/** Staff: tick a walk-in off as arrived (or undo it). */
export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  await requireAdmin();
  const b = await body<{ attended?: boolean }>(req);
  const g = await write((db) => {
    const x = db.guests?.find((q) => q.id === id);
    if (x) x.attended = !!b.attended;
    return x;
  });
  return g ? ok(g) : fail("Registration not found.", 404);
});

/** Staff: remove a walk-in registration. */
export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  await requireAdmin();
  const done = await write((db) => {
    const i = db.guests?.findIndex((q) => q.id === id) ?? -1;
    if (i < 0) return false;
    const [g] = db.guests!.splice(i, 1);
    // A class seat goes back when a walk-in student is removed.
    if (g.kind === "class") { const c = db.classes.find((x) => x.id === g.eventId); if (c) c.seatsLeft += 1; }
    return true;
  });
  return done ? ok({ ok: true }) : fail("Registration not found.", 404);
});
