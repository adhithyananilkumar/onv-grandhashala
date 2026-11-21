import { cardKey, findUser, publicUser, write } from "@/server/db";
import { body, fail, handle, hashPin, newSalt, ok, requireAdmin, str, validPhone } from "@/server/http";

/**
 * Staff: change a member. Body may hold name, phone, ward, role ("member" | "admin"),
 * blocked (true / false) and resetPin (true: returns a new one-time PIN).
 */
export const PATCH = handle(async (req: Request, ctx: RouteContext<"/api/admin/members/[card]">) => {
  const { card } = await ctx.params;
  const me = await requireAdmin();
  const b = await body<Record<string, unknown>>(req);
  if (b.phone !== undefined && !validPhone(b.phone)) return fail("Enter a 10-digit mobile number.", 400, { field: "phone" });
  const self = cardKey(card) === cardKey(me.card);
  if (self && (b.role === "member" || b.blocked === true)) return fail("You can't remove your own staff access or put your own card on hold.", 409);

  const r = await write((db) => {
    const u = findUser(db, card);
    if (!u) return { error: "Member not found.", status: 404 };
    if (b.phone !== undefined && db.users.some((x) => x !== u && x.phone === b.phone)) return { error: "Another card already uses this number.", status: 409 };
    if (b.name !== undefined && str(b.name).length >= 2) u.name = str(b.name, 80);
    if (b.phone !== undefined) u.phone = str(b.phone, 10);
    if (b.ward !== undefined) u.ward = str(b.ward, 160) || undefined;
    if (b.role === "admin" || b.role === "member") u.role = b.role;
    if (typeof b.blocked === "boolean") {
      u.blocked = b.blocked || undefined;
      if (b.blocked) for (const [t, s] of Object.entries(db.sessions)) if (cardKey(s.card) === cardKey(u.card)) delete db.sessions[t];
    }
    let pin: string | undefined;
    if (b.resetPin) {
      do pin = String(Math.floor(1000 + Math.random() * 9000)); while (/^(\d)\1+$/.test(pin));
      u.salt = newSalt(); u.hash = hashPin(pin, u.salt); u.fails = 0; u.lockUntil = 0;
    }
    return { user: publicUser(u), pin };
  });
  return "error" in r ? fail(r.error as string, r.status as number) : ok(r);
});
