import { cardKey, write } from "@/server/db";
import { body, fail, handle, ok, requireUser, str } from "@/server/http";

/**
 * Member says they've paid by UPI and gives the 12-digit UTR from their UPI app.
 * Staff confirm it in the admin console. (Mock: no money moves.)
 * Body: { method: "UPI", utr } or { method: "Desk" } to say they'll pay at the counter.
 */
export const POST = handle(async (req: Request, ctx: RouteContext<"/api/payments/[id]/pay">) => {
  const { id } = await ctx.params;
  const me = await requireUser();
  const b = await body<{ method?: string; utr?: string }>(req);
  const method = str(b.method) === "Desk" ? "Desk" : "UPI";
  const utr = str(b.utr, 12);
  if (method === "UPI" && !/^\d{12}$/.test(utr)) return fail("Enter the 12-digit UTR / reference number from your UPI app.", 400, { field: "utr" });
  const r = await write((db) => {
    const p = db.payments.find((x) => x.id === id);
    if (!p || cardKey(p.card) !== cardKey(me.card)) return { error: "Payment not found.", status: 404 };
    if (p.status !== "due") return { error: "This one is already settled or being checked.", status: 409 };
    p.method = method;
    if (method === "UPI") { p.status = "verifying"; p.utr = utr; }
    return { payment: p };
  });
  return "error" in r ? fail(r.error as string, r.status as number) : ok(r);
});
