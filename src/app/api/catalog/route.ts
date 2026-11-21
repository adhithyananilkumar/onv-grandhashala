import { read } from "@/server/db";
import { handle, ok } from "@/server/http";

/** Everything public in one call: books, classes, events and Vipani products. */
export const GET = handle(async () => {
  const { books, classes, events, products } = await read();
  return ok({ books, classes, events, products });
});
