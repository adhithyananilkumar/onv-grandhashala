import type { Metadata } from "next";
import { VipaniBrowser } from "@/components/Browse";
import { PageHero } from "@/components/ui";
import { MyItems } from "@/components/MyItems";
import { GuestOnly } from "@/components/AuthGate";

export const metadata: Metadata = { title: "ONV Naattu Vipani" };

export default function VipaniPage() {
  return (
    <>
      {/* Visitors: the painted banner. Members: what they've booked, then a "More …" button that opens the search. */}
      <GuestOnly>
        <PageHero title="Naattu Vipani" ml="ഒ.എൻ.വി നാട്ടു വിപണി" art="market">
          <p>Farmers, Kudumbashree units and craftspeople sell here directly. Buy at a fixed price or bid in an auction.</p>
        </PageHero>
      </GuestOnly>
      <MyItems kind="vipani">
        <VipaniBrowser />
      </MyItems>
    </>
  );
}
