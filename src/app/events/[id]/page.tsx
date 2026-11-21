import type { Metadata } from "next";
import { Suspense } from "react";
import { EventDetail } from "@/components/Details";

export const metadata: Metadata = { title: "Event" };

// The item is loaded from the mock API in the browser, so new ones added in the admin console work too.
export default function Page() {
  return (
    <Suspense>
      <EventDetail />
    </Suspense>
  );
}
