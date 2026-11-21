import { findUser, write } from "@/server/db";
import { body, fail, handle, hashPin, newSalt, ok, requireUser, str, validPin, weakPin } from "@/server/http";

/** Change your PIN (needs the current one). */
export const POST = handle(async (req: Request) => {
  const me = await requireUser();
  const b = await body<{ current?: string; pin?: string }>(req);
  const current = str(b.current, 4), pin = str(b.pin, 4);
  if (hashPin(current, me.salt) !== me.hash) return fail("Your current PIN isn't right.", 400, { field: "current" });
  if (!validPin(pin) || weakPin(pin)) return fail("Choose a 4-digit PIN that isn't easy to guess.", 400, { field: "pin" });
  await write((db) => { const u = findUser(db, me.card)!; u.salt = newSalt(); u.hash = hashPin(pin, u.salt); });
  return ok({ ok: true });
});
