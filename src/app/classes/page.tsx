import type { Metadata } from "next";
import { ClassesBrowser } from "@/components/Browse";
import { PageHero } from "@/components/ui";
import { MyItems } from "@/components/MyItems";
import { GuestOnly } from "@/components/AuthGate";

export const metadata: Metadata = { title: "Classes" };

export default function ClassesPage() {
  return (
    <>
      {/* Visitors: the painted banner. Members: what they've booked, then a "More …" button that opens the search. */}
      <GuestOnly>
        <PageHero title="Classes" ml="കല, സംഗീതം, നൃത്തം, യോഗ, പി.എസ്.സി" art="classes">
          <p>Taught by local teachers and volunteers. Many are free, and the rest are kept affordable.</p>
        </PageHero>
      </GuestOnly>
      <MyItems kind="classes">
        <ClassesBrowser />
      </MyItems>
    </>
  );
}
