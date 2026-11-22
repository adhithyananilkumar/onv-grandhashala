import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminRouter } from "@/components/admin/AdminRouter";

export const metadata: Metadata = { title: "Staff console", robots: { index: false, follow: false } };

/**
 * The staff console is its own app: its own sidebar, bottom bar and quick-add, none of the member or
 * public site chrome. Access is enforced on the server by every /api/admin route, not by this screen.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <AdminShell><AdminRouter /></AdminShell>
      {children}
    </>
  );
}
