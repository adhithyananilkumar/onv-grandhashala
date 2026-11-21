"use client";

import { usePathname } from "next/navigation";

/** Hides site chrome (nav, footer, dock) on standalone pages such as /join. */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/join") return null;
  return <>{children}</>;
}
