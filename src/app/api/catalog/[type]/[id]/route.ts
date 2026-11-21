import { read, write } from "@/server/db";
import { body, fail, handle, ok, requireAdmin } from "@/server/http";
import { clean, isContentType } from "@/lib/schema";

type Ctx = RouteContext<"/api/catalog/[type]/[id]">;

export const GET = handle(async (_req: Request, ctx: Ctx) => {
  const { type, id } = await ctx.params;
  if (!isContentType(type)) return fail("Unknown list.", 404);
  const item = ((await read())[type] as { id: string }[]).find((x) => x.id === id);
  return item ? ok(item) : fail("Not found.", 404);
});

/** Staff: edit an item. */
export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  const { type, id } = await ctx.params;
  if (!isContentType(type)) return fail("Unknown list.", 404);
  await requireAdmin();
  const input = await body(req);
  const r = await write((db) => {
    const list = db[type] as unknown as Record<string, unknown>[];
    const i = list.findIndex((x) => x.id === id);
    if (i < 0) return { error: "Not found.", status: 404 } as const;
    const c = clean(type, input, list[i]);
    if (!c.ok) return { error: c.error, field: c.field, status: 400 } as const;
    list[i] = { id, ...c.value };
    return { item: list[i] };
  });
  return "error" in r ? fail(r.error ?? "Not saved.", r.status, { field: "field" in r ? r.field : undefined }) : ok(r.item);
});

/** Staff: remove an item. */
export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  const { type, id } = await ctx.params;
  if (!isContentType(type)) return fail("Unknown list.", 404);
  await requireAdmin();
  const done = await write((db) => {
    const list = db[type] as unknown as { id: string }[];
    const i = list.findIndex((x) => x.id === id);
    if (i < 0) return false;
    list.splice(i, 1);
    return true;
  });
  return done ? ok({ ok: true }) : fail("Not found.", 404);
});
