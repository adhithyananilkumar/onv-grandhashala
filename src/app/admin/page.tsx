import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminApp } from "@/components/admin/AdminApp";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function AdminPage() {
  return (
    <Suspense>
      <AdminApp />
    </Suspense>
  );
}
