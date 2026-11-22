import { write } from "@/server/db";
import { body, fail, handle, ok, requireAdmin } from "@/server/http";

/** Staff: add or remove copies of a book (new stock, lost or withdrawn copies). Body: { delta: number }. */
export const POST = handle(async (req: Request, ctx: RouteContext<"/api/admin/books/[id]/stock">) => {
  const { id } = await ctx.params;
  await requireAdmin();
  const { delta } = await body<{ delta?: number }>(req);
  const d = Math.round(Number(delta) || 0);
  if (!d || Math.abs(d) > 50) return fail("Enter how many copies to add or remove.");
  const r = await write((db) => {
    const b = db.books.find((x) => x.id === id);
    if (!b) return { error: "Book not found.", status: 404 } as const;
    if (b.copies + d < 0) return { error: "There aren't that many copies.", status: 409 } as const;
    // Copies on loan or held stay out; only shelf copies can be taken away.
    if (b.available + d < 0) return { error: "Those copies are on loan. Wait for them to come back first.", status: 409 } as const;
    b.copies += d;
    b.available += d;
    return { book: b } as const;
  });
  return "error" in r ? fail(r.error ?? "Not saved.", r.status) : ok(r.book);
});
