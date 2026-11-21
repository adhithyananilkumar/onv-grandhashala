import { write } from "@/server/db";
import { body, fail, handle, ok, requireAdmin, str } from "@/server/http";
import type { Notice } from "@/lib/types";

/** Staff: post a notice to every member's home screen. */
export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const b = await body<{ title?: string; body?: string; tone?: string }>(req);
  const title = str(b.title, 120), text = str(b.body, 600);
  if (title.length < 3) return fail("Add a short title.", 400, { field: "title" });
  const n: Notice = { id: `N-${Date.now()}`, title, body: text, at: new Date().toISOString(), tone: b.tone === "alert" ? "alert" : "info" };
  await write((db) => { db.notices.unshift(n); });
  return ok(n, 201);
});
