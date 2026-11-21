import type { Metadata } from "next";
import { Suspense } from "react";
import { BookDetail } from "@/components/Details";

export const metadata: Metadata = { title: "Book" };

// The item is loaded from the mock API in the browser, so new ones added in the admin console work too.
export default function Page() {
  return (
    <Suspense>
      <BookDetail />
    </Suspense>
  );
}
