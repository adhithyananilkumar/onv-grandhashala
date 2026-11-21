import { findUser, read } from "@/server/db";
import { body, fail, handle, ok, str, validPhone } from "@/server/http";

/** Step 1 of a reset: check the card and phone match, then "send" an SMS code (mock: any 6 digits work). */
export const POST = handle(async (req: Request) => {
  const b = await body<{ card?: string; phone?: string }>(req);
  const card = str(b.card), phone = str(b.phone, 10);
  if (!validPhone(phone)) return fail("Enter your 10-digit mobile number.", 400, { field: "phone" });
  const db = await read();
  if (card) {
    const u = findUser(db, card);
    if (!u) return fail("We can't find that library number.", 404, { field: "card" });
    if (u.phone !== phone) return fail("That number doesn't match this library card.", 400, { field: "phone" });
  } else if (!db.users.some((u) => u.phone === phone)) {
    return fail("We can't find a library card for this number.", 404, { field: "phone" });
  }
  return ok({ sent: true });
});
