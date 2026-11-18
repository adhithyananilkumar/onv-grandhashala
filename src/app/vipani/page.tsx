import type { Metadata } from "next";
import { products } from "@/lib/data";
import { PageHero, ProductCard, SectionHead } from "@/components/ui";

export const metadata: Metadata = { title: "ONV Naattu Vipani" };

export default function VipaniPage() {
  const auctions = products.filter((p) => p.auction);
  const shop = products.filter((p) => !p.auction);
  return (
    <>
      <PageHero eyebrow="ONV Naattu Vipani" title={<>Our village <em>market</em></>} ml="ഒ.എൻ.വി നാട്ടു വിപണി · നാട്ടിലെ ഉൽപന്നങ്ങൾ">
        <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-ink-2">
          Farmers, Kudumbashree units and artisans sell here directly. Order online and collect at the library on market day, or bid in a live auction.
        </p>
      </PageHero>
      <section className="mx-auto max-w-6xl px-4">
        <SectionHead index="01" eyebrow="Bidding now" title={<>Live <em>auctions</em></>} ml="ലേലം" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pt-20">
        <SectionHead index="02" eyebrow="Shop" title={<>Local <em>goods</em></>} ml="നാടൻ ഉൽപന്നങ്ങൾ" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shop.map((p, i) => <ProductCard key={p.id} p={p} i={i + 1} />)}
        </div>
      </section>
    </>
  );
}
