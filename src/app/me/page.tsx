import { redirect } from "next/navigation";

// Old /me?tab=… links: each part of the account now has its own page.
const MOVED: Record<string, string> = {
  payments: "/me/payments", card: "/me/card", profile: "/me/profile", books: "/catalogue", bookings: "/classes",
};

export default async function MePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  redirect(MOVED[tab ?? ""] ?? "/me/payments");
}
