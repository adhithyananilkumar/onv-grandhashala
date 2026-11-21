import type { Metadata } from "next";
import { Suspense } from "react";
import { MemberApp } from "@/components/MemberApp";

export const metadata: Metadata = { title: "My account" };

export default function MePage() {
  return (
    <Suspense>
      <MemberApp />
    </Suspense>
  );
}
