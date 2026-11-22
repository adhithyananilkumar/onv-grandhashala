import type { Metadata } from "next";
import { VipaniBrowser } from "@/components/Browse";
import { MyItems } from "@/components/MyItems";

export const metadata: Metadata = { title: "ONV Naattu Vipani" };

export default function VipaniPage() {
  return (
    <>
      <MyItems kind="vipani" banner={{ title: "Naattu Vipani", ml: "ഒ.എൻ.വി നാട്ടു വിപണി", art: "market", text: "Farmers, Kudumbashree units and craftspeople sell here directly. Buy at a fixed price or bid in an auction." }}>
        <VipaniBrowser />
      </MyItems>
    </>
  );
}
