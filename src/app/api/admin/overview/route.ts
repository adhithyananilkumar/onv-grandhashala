import { publicUser, read } from "@/server/db";
import { handle, ok, requireAdmin } from "@/server/http";
import type { AdminOverview } from "@/lib/types";

/** Everything the admin console shows, in one call. */
export const GET = handle(async () => {
  const db = await read();
  await requireAdmin(db);
  const out: AdminOverview = {
    books: db.books, classes: db.classes, events: db.events, products: db.products,
    members: db.users.map(publicUser).sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)),
    loans: [...db.loans].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    requests: [...db.requests].sort((a, b) => b.at.localeCompare(a.at)),
    payments: [...db.payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    notices: [...db.notices].sort((a, b) => b.at.localeCompare(a.at)),
    settings: db.settings,
    guests: [...(db.guests ?? [])].sort((a, b) => b.at.localeCompare(a.at)),
    ledger: [...(db.ledger ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
    visits: db.visits ?? {},
  };
  return ok(out);
});
