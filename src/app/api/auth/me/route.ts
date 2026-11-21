import { cookies } from "next/headers";
import { findUser, publicUser, write } from "@/server/db";
import { body, currentUser, fail, handle, ok, requireUser, ROLE_COOKIE, str, validPhone } from "@/server/http";

export const GET = handle(async () => {
  const u = await currentUser();
  const jar = await cookies();
  // Keep the layout hint cookie in step with the real session.
  if (!u && jar.get(ROLE_COOKIE)) jar.delete(ROLE_COOKIE);
  if (u && jar.get(ROLE_COOKIE)?.value !== u.role) jar.set(ROLE_COOKIE, u.role, { path: "/", sameSite: "lax", maxAge: 30 * 86_400 });
  return ok({ user: u ? publicUser(u) : null });
});

/** Update your own profile. */
export const PATCH = handle(async (req: Request) => {
  const me = await requireUser();
  const b = await body<Record<string, unknown>>(req);
  if (b.phone !== undefined && !validPhone(b.phone)) return fail("Enter a 10-digit mobile number.", 400, { field: "phone" });
  if (b.name !== undefined && str(b.name).length < 2) return fail("Please enter your full name.", 400, { field: "name" });
  const user = await write((db) => {
    const u = findUser(db, me.card)!;
    if (b.phone !== undefined && db.users.some((x) => x !== u && x.phone === b.phone)) return null;
    if (b.name !== undefined) u.name = str(b.name, 80);
    if (b.phone !== undefined) u.phone = str(b.phone, 10);
    if (b.email !== undefined) u.email = str(b.email, 120) || undefined;
    if (b.ward !== undefined) u.ward = str(b.ward, 160) || undefined;
    if (Array.isArray(b.interests)) u.interests = b.interests.filter((x): x is string => typeof x === "string").slice(0, 6);
    return publicUser(u);
  });
  if (!user) return fail("Another card already uses this number.", 409, { field: "phone" });
  return ok({ user });
});
