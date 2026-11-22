import type { Metadata } from "next";
import { AccountPage } from "@/components/Account";

export const metadata: Metadata = { title: "Profile & PIN" };

export default function Page() {
  return <AccountPage section="profile" />;
}
