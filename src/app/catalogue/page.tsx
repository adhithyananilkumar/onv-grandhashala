import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogueBrowser } from "@/components/CatalogueBrowser";
import { MyItems } from "@/components/MyItems";

export const metadata: Metadata = { title: "Book catalogue" };

export default function CataloguePage() {
  return (
    <>
      <MyItems kind="books" banner={{ title: "Find a book", ml: "പുസ്തകം തിരയൂ, റിസർവ് ചെയ്യൂ", art: "books", text: "Malayalam classics, poetry, children's books and PSC guides. Reserve from your phone and collect at the desk." }}>
        <Suspense>
          <CatalogueBrowser />
        </Suspense>
      </MyItems>
    </>
  );
}
