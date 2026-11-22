import type { Metadata } from "next";
import { AccountPage } from "@/components/Account";

export const metadata: Metadata = { title: "Payments" };

export default function Page() {
  return <AccountPage section="payments" />;
}
