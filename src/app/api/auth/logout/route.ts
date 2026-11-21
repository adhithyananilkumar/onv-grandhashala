import { endSession, handle, ok } from "@/server/http";

export const POST = handle(async () => {
  await endSession();
  return ok({ ok: true });
});
