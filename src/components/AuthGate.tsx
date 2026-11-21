"use client";

import { useSession } from "@/lib/session";

/**
 * Visitor-only content. The `guest-only` class hides it before first paint when the session
 * hint cookie says someone is signed in; once the session is confirmed it is removed entirely.
 */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  if (user) return null;
  return <div className="guest-only">{children}</div>;
}

/** Member-only content: hidden by CSS until the session is known, never rendered for visitors. */
export function MemberOnly({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { user, ready } = useSession();
  if (ready && !user) return null;
  return <div className={`member-only ${className}`}>{children}</div>;
}
