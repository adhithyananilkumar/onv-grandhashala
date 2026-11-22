import { cardKey, findUser, headcount, newId, write } from "@/server/db";
import { body, fail, handle, ok, requireAdmin, str, validPhone } from "@/server/http";
import type { GuestReg, LibRequest } from "@/lib/types";

/**
 * Staff: register someone for an event at the desk.
 * With a library number the booking goes on that member's account; otherwise it's a walk-in
 * (name and optional phone only), so people without an account can still be counted and checked in.
 */
export const POST = handle(async (req: Request, ctx: RouteContext<"/api/admin/events/[id]/register">) => {
  const { id } = await ctx.params;
  await requireAdmin();
  const b = await body<{ name?: string; phone?: string; card?: string; people?: number; note?: string }>(req);
  const people = Math.min(20, Math.max(1, Math.round(Number(b.people) || 1)));
  const card = str(b.card, 12);
  const phone = str(b.phone, 10).replace(/\D/g, "");

  const r = await write((db): { error: string; status?: number; field?: string } | { guest?: GuestReg; request?: LibRequest } => {
    const e = db.events.find((x) => x.id === id);
    if (!e) return { error: "That event isn't on the calendar.", status: 404 };
    const cap = e.capacity ?? 0;
    if (cap > 0 && headcount(db, id) + people > cap) return { error: `Only ${Math.max(0, cap - headcount(db, id))} places left.`, status: 409, field: "people" };
    const now = new Date().toISOString();

    if (cardKey(card)) {
      const u = findUser(db, card);
      if (!u) return { error: "No member with that library number.", status: 404, field: "card" };
      const dup = db.requests.some((x) => x.kind === "Register" && x.itemId === id && cardKey(x.card) === cardKey(u.card) && ["pending", "confirmed", "ready"].includes(x.status));
      if (dup) return { error: `${u.name} is already registered.`, status: 409, field: "card" };
      const request: LibRequest = { id: newId("EVT"), kind: "Register", card: u.card, name: u.name, itemId: id, title: e.title, detail: `${people} ${people === 1 ? "person" : "people"} · added at desk`, status: "confirmed", at: now };
      db.requests.unshift(request);
      return { request };
    }

    const name = str(b.name, 60);
    if (name.length < 2) return { error: "Enter the person's name.", status: 400, field: "name" };
    if (phone && !validPhone(phone)) return { error: "Enter a 10-digit mobile number, or leave it empty.", status: 400, field: "phone" };
    const guest: GuestReg = { id: newId("GST"), kind: "event", eventId: id, eventTitle: e.title, name, ...(phone ? { phone } : {}), people, at: now, ...(str(b.note, 120) ? { note: str(b.note, 120) } : {}) };
    (db.guests ??= []).unshift(guest);
    return { guest };
  });
  return "error" in r ? fail(r.error, r.status ?? 400, { field: r.field }) : ok(r, 201);
});
