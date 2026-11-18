import type { Metadata } from "next";
import { Suspense } from "react";
import { books } from "@/lib/data";
import { CatalogueBrowser } from "@/components/CatalogueBrowser";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Book catalogue" };

export default function CataloguePage() {
  return (
    <>
      <PageHero eyebrow="The card catalogue" title={<>Find your <em>next read</em></>} ml="പുസ്തക ശേഖരം · തിരയൂ, റിസർവ് ചെയ്യൂ" />
      <Suspense>
        <CatalogueBrowser books={books} />
      </Suspense>
    </>
  );
}
