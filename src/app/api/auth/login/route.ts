import { findUser, publicUser, write } from "@/server/db";
import { body, fail, handle, hashPin, ok, startSession, str } from "@/server/http";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

export const POST = handle(async (req: Request) => {
  const b = await body<{ card?: string; pin?: string }>(req);
  const card = str(b.card), pin = str(b.pin);
  if (!/\d{4}/.test(card)) return fail("Enter the 4 digits after ONV on your card.", 400, { field: "card" });
  if (!/^\d{4}$/.test(pin)) return fail("Enter your 4-digit PIN.", 400, { field: "pin" });

  const r = await write((db) => {
    const u = findUser(db, card);
    if (!u) return { error: "We can't find that library number.", field: "card" } as const;
    if (u.blocked) return { error: "This card is on hold. Please talk to the librarian.", field: "card" } as const;
    if (u.lockUntil > Date.now()) return { error: `Too many tries. Try again in ${Math.ceil((u.lockUntil - Date.now()) / 60000)} minutes, or reset your PIN.`, field: "pin" } as const;
    if (hashPin(pin, u.salt) !== u.hash) {
      u.fails += 1;
      if (u.fails >= MAX_FAILS) { u.fails = 0; u.lockUntil = Date.now() + LOCK_MS; return { error: "Too many tries. Try again in 15 minutes, or reset your PIN.", field: "pin" } as const; }
      const left = MAX_FAILS - u.fails;
      return { error: `That PIN isn't right. ${left} ${left === 1 ? "try" : "tries"} left.`, field: "pin" } as const;
    }
    u.fails = 0; u.lockUntil = 0;
    return { user: publicUser(u) };
  });
  if ("error" in r) return fail(r.error ?? "Sign in failed.", 401, { field: r.field });
  await startSession(r.user.card, r.user.role);
  return ok({ user: r.user });
});
