import { write } from "@/server/db";
import { body, fail, handle, ok, requireAdmin, str } from "@/server/http";

/**
 * Staff: settle a payment. Body: { action: "confirm" | "cash" | "reject" | "waive" | "reopen" }.
 * confirm: the UPI payment arrived. cash: paid at the counter. reject: UPI reference didn't match.
 */
export const PATCH = handle(async (req: Request, ctx: RouteContext<"/api/admin/payments/[id]">) => {
  const { id } = await ctx.params;
  await requireAdmin();
  const action = str((await body<{ action?: string }>(req)).action);
  const r = await write((db) => {
    const p = db.payments.find((x) => x.id === id);
    if (!p) return { error: "Payment not found.", status: 404 };
    const now = new Date().toISOString();
    if (action === "confirm") { if (p.status !== "verifying") return { error: "Nothing to confirm.", status: 409 }; p.status = "paid"; p.paidAt = now; }
    else if (action === "cash") { p.status = "paid"; p.method = "Cash"; p.paidAt = now; p.utr = undefined; }
    else if (action === "reject") { p.status = "due"; p.utr = undefined; p.method = undefined; }
    else if (action === "waive") { p.status = "waived"; }
    else if (action === "reopen") { p.status = "due"; p.paidAt = undefined; p.method = undefined; p.utr = undefined; }
    else return { error: "Unknown action.", status: 400 };
    return { payment: p };
  });
  return "error" in r ? fail(r.error as string, r.status as number) : ok(r);
});
