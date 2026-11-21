import { publicUser, write } from "@/server/db";
import { body, fail, handle, hashPin, newSalt, ok, startSession, str, validPin, weakPin } from "@/server/http";

/** Step 3: set a new PIN and sign in. */
export const POST = handle(async (req: Request) => {
  const b = await body<{ phone?: string; otp?: string; pin?: string }>(req);
  const phone = str(b.phone, 10), pin = str(b.pin, 4);
  if (!/^\d{6}$/.test(str(b.otp, 6))) return fail("Enter all 6 digits.", 400, { field: "otp" });
  if (!validPin(pin) || weakPin(pin)) return fail("Choose a 4-digit PIN that isn't easy to guess.", 400, { field: "pin" });
  const user = await write((db) => {
    const u = db.users.find((x) => x.phone === phone);
    if (!u) return null;
    u.salt = newSalt(); u.hash = hashPin(pin, u.salt); u.fails = 0; u.lockUntil = 0;
    return publicUser(u);
  });
  if (!user) return fail("We can't find a library card for this number.", 404, { field: "phone" });
  if (user.blocked) return fail("This card is on hold. Please talk to the librarian.", 403);
  await startSession(user.card, user.role);
  return ok({ user });
});
