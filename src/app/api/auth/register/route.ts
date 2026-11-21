import { cardKey, publicUser, write, type StoredUser } from "@/server/db";
import { body, fail, handle, hashPin, newSalt, ok, startSession, str, validPhone, validPin, weakPin } from "@/server/http";

export const POST = handle(async (req: Request) => {
  const b = await body<Record<string, unknown>>(req);
  const name = str(b.name, 80), phone = str(b.phone, 10), pin = str(b.pin, 4), otp = str(b.otp, 6);
  if (name.length < 2) return fail("Please enter your full name.", 400, { field: "name" });
  if (!validPhone(phone)) return fail("Enter a 10-digit mobile number.", 400, { field: "phone" });
  if (!/^\d{6}$/.test(otp)) return fail("Enter the 6-digit code.", 400, { field: "otp" });
  if (!validPin(pin) || weakPin(pin)) return fail("Choose a 4-digit PIN that isn't easy to guess.", 400, { field: "pin" });
  const interests = Array.isArray(b.interests) ? b.interests.filter((x): x is string => typeof x === "string").slice(0, 6) : [];
  const ward = [str(b.house, 80), str(b.place, 80)].filter(Boolean).join(", ");

  const r = await write((db) => {
    if (db.users.some((u) => u.phone === phone)) return { error: "This number already has a library card. Sign in, or reset your PIN." } as const;
    const taken = new Set(db.users.map((u) => cardKey(u.card)));
    let n = "";
    for (let i = 0; i < 200 && (!n || taken.has(n)); i++) n = String(Math.floor(1000 + Math.random() * 9000));
    const salt = newSalt();
    const u: StoredUser = {
      card: `ONV ${n}`, name, phone, ward: ward || undefined, interests, since: String(new Date().getFullYear()),
      role: "member", joinedAt: new Date().toISOString(), salt, hash: hashPin(pin, salt), fails: 0, lockUntil: 0,
    };
    db.users.push(u);
    return { user: publicUser(u) };
  });
  if ("error" in r) return fail(r.error ?? "Could not create the card.", 409, { field: "phone" });
  await startSession(r.user.card, r.user.role);
  return ok({ user: r.user }, 201);
});
