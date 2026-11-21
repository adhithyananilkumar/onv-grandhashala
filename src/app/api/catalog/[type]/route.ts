import { read, write } from "@/server/db";
import { body, fail, handle, ok, requireAdmin } from "@/server/http";
import { clean, isContentType, SCHEMA } from "@/lib/schema";

export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/catalog/[type]">) => {
  const { type } = await ctx.params;
  if (!isContentType(type)) return fail("Unknown list.", 404);
  return ok((await read())[type]);
});

/** Staff: add an item. */
export const POST = handle(async (req: Request, ctx: RouteContext<"/api/catalog/[type]">) => {
  const { type } = await ctx.params;
  if (!isContentType(type)) return fail("Unknown list.", 404);
  await requireAdmin();
  const c = clean(type, await body(req));
  if (!c.ok) return fail(c.error, 400, { field: c.field });
  const item = await write((db) => {
    const list = db[type] as unknown as { id: string }[];
    const max = list.reduce((m, x) => Math.max(m, Number(x.id.replace(/\D/g, "")) || 0), 0);
    const it = { id: `${SCHEMA[type].prefix}${max + 1}`, ...c.value };
    list.unshift(it);
    return it;
  });
  return ok(item, 201);
});
