import { write } from "@/server/db";
import { body, handle, ok, requireAdmin } from "@/server/http";

/** Today's date in Kerala, YYYY-MM-DD. */
const istDay = (t = Date.now()) => new Date(t + 5.5 * 3_600_000).toISOString().slice(0, 10);

/** Staff: tap the reading-room head count up or down. Body: { delta: number }. The Library Council asks for these numbers. */
export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const { delta } = await body<{ delta?: number }>(req);
  const d = Math.max(-50, Math.min(50, Math.round(Number(delta) || 0)));
  const day = istDay();
  const count = await write((db) => {
    const v = (db.visits ??= {});
    v[day] = Math.max(0, (v[day] ?? 0) + d);
    return v[day];
  });
  return ok({ day, count });
});
