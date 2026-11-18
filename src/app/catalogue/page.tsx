import type { Metadata } from "next";
import { Suspense } from "react";
import { books } from "@/lib/data";
import { CatalogueBrowser } from "@/components/CatalogueBrowser";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Book catalogue" };

export default function CataloguePage() {
  return (
    <>
      <PageHero title="Find a book" ml="പുസ്തകം തിരയൂ, റിസർവ് ചെയ്യൂ" />
      <Suspense>
        <CatalogueBrowser books={books} />
      </Suspense>
    </>
  );
}
