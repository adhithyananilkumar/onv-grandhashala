import type { Metadata } from "next";
import { products } from "@/lib/data";
import { PageHero, ProductCard, SectionHead } from "@/components/ui";

export const metadata: Metadata = { title: "ONV Naattu Vipani" };

export default function VipaniPage() {
  const auctions = products.filter((p) => p.auction);
  const shop = products.filter((p) => !p.auction);
  return (
    <>
      <PageHero title="Naattu Vipani" ml="ഒ.എൻ.വി നാട്ടു വിപണി">
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-2">
          Farmers, Kudumbashree units and craftspeople sell here directly. Order online and collect at the library on market day, or bid in an auction.
        </p>
      </PageHero>
      <section className="mx-auto max-w-6xl px-5">
        <SectionHead title="Auctions open now" ml="ലേലം" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 pt-14 sm:pt-20">
        <SectionHead title="Buy at a fixed price" ml="നാടൻ ഉൽപന്നങ്ങൾ" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shop.map((p, i) => <ProductCard key={p.id} p={p} i={i + 1} />)}
        </div>
      </section>
    </>
  );
}
