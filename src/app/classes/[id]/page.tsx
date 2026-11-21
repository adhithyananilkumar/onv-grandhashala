import type { Metadata } from "next";
import { Suspense } from "react";
import { ClassDetail } from "@/components/Details";

export const metadata: Metadata = { title: "Class" };

// The item is loaded from the mock API in the browser, so new ones added in the admin console work too.
export default function Page() {
  return (
    <Suspense>
      <ClassDetail />
    </Suspense>
  );
}
