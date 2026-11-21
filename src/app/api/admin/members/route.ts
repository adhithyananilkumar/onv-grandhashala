import { cardKey, publicUser, write, type StoredUser } from "@/server/db";
import { body, fail, handle, hashPin, newSalt, ok, requireAdmin, str, validPhone } from "@/server/http";

/** Staff: issue a library card at the desk. Returns a one-time PIN to hand to the member. */
export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const b = await body<Record<string, unknown>>(req);
  const name = str(b.name, 80), phone = str(b.phone, 10);
  if (name.length < 2) return fail("Enter the member's full name.", 400, { field: "name" });
  if (!validPhone(phone)) return fail("Enter a 10-digit mobile number.", 400, { field: "phone" });
  const role = str(b.role) === "admin" ? "admin" : "member";
  const r = await write((db) => {
    if (db.users.some((u) => u.phone === phone)) return null;
    const taken = new Set(db.users.map((u) => cardKey(u.card)));
    let n = "";
    for (let i = 0; i < 200 && (!n || taken.has(n)); i++) n = String(Math.floor(1000 + Math.random() * 9000));
    let pin = "";
    do pin = String(Math.floor(1000 + Math.random() * 9000)); while (/^(\d)\1+$/.test(pin));
    const salt = newSalt();
    const u: StoredUser = { card: `ONV ${n}`, name, phone, ward: str(b.ward, 160) || undefined, since: String(new Date().getFullYear()), role, joinedAt: new Date().toISOString(), salt, hash: hashPin(pin, salt), fails: 0, lockUntil: 0 };
    db.users.push(u);
    return { user: publicUser(u), pin };
  });
  return r ? ok(r, 201) : fail("This number already has a library card.", 409, { field: "phone" });
});
