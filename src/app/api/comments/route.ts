import { read, write } from "@/server/db";
import { body, fail, handle, ok, requireUser, str } from "@/server/http";
import type { Comment } from "@/lib/types";

export const GET = handle(async (req: Request) => {
  const item = new URL(req.url).searchParams.get("item") ?? "";
  const list = (await read()).comments.filter((c) => c.item === item).sort((a, b) => b.date.localeCompare(a.date));
  return ok(list.map(({ card: _c, ...c }) => c));
});

/** Signed-in members post a comment and rating. */
export const POST = handle(async (req: Request) => {
  const me = await requireUser();
  const b = await body<{ item?: string; text?: string; rating?: number }>(req);
  const item = str(b.item, 60), text = str(b.text, 800);
  const rating = Math.min(5, Math.max(1, Math.round(Number(b.rating) || 5)));
  if (!item) return fail("Which item is this about?");
  if (text.length < 3) return fail("Write a few words first.", 400, { field: "text" });
  const c: Comment = { id: `c${Date.now()}`, item, name: me.name, card: me.card, text, rating, date: new Date().toISOString() };
  await write((db) => { db.comments.unshift(c); });
  const { card: _c, ...pub } = c;
  return ok(pub, 201);
});
