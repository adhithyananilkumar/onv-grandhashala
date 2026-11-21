import { read } from "@/server/db";
import { body, fail, handle, ok, str } from "@/server/http";

/** Step 2: check the SMS code (mock: any 6 digits) and tell the member their library number. */
export const POST = handle(async (req: Request) => {
  const b = await body<{ phone?: string; otp?: string }>(req);
  if (!/^\d{6}$/.test(str(b.otp, 6))) return fail("Enter all 6 digits.", 400, { field: "otp" });
  const u = (await read()).users.find((x) => x.phone === str(b.phone, 10));
  return ok({ card: u?.card ?? null });
});
