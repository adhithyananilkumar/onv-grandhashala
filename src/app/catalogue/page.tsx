import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogueBrowser } from "@/components/CatalogueBrowser";
import { PageHero } from "@/components/ui";
import { MyItems } from "@/components/MyItems";
import { GuestOnly } from "@/components/AuthGate";

export const metadata: Metadata = { title: "Book catalogue" };

export default function CataloguePage() {
  return (
    <>
      {/* Visitors: the painted banner. Members: what they've booked, then a "More …" button that opens the search. */}
      <GuestOnly>
        <PageHero title="Find a book" ml="പുസ്തകം തിരയൂ, റിസർവ് ചെയ്യൂ" art="books">
          <p>Malayalam classics, poetry, children&apos;s books and PSC guides. Reserve from your phone and collect at the desk.</p>
        </PageHero>
      </GuestOnly>
      <MyItems kind="books">
        <Suspense>
          <CatalogueBrowser />
        </Suspense>
      </MyItems>
    </>
  );
}
