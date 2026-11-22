import type { Metadata } from "next";
import { AccountPage } from "@/components/Account";

export const metadata: Metadata = { title: "Library card" };

export default function Page() {
  return <AccountPage section="card" />;
}
