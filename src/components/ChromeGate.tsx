"use client";

import { usePathname } from "next/navigation";

/** Hides site chrome (nav, footer, dock) on standalone pages such as /join and the staff console. */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/join" || path === "/admin" || path.startsWith("/admin/")) return null;
  return <>{children}</>;
}
