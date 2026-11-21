import type { Metadata } from "next";
import { Suspense } from "react";
import { JoinFlow } from "@/components/JoinFlow";

export const metadata: Metadata = { title: "Sign in or become a member" };

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <JoinFlow />
    </Suspense>
  );
}
