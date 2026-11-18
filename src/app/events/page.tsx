import type { Metadata } from "next";
import { events } from "@/lib/data";
import { EventTicket, PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Events & camps" };

export default function EventsPage() {
  return (
    <>
      <PageHero eyebrow="Community" title={<>Events <em>&amp;</em> camps</>} ml="ആരോഗ്യ ക്യാമ്പുകൾ, സാഹിത്യ സന്ധ്യകൾ, അവധിക്കാല ക്യാമ്പുകൾ" />
      <div className="mx-auto grid max-w-3xl gap-4 px-4">
        {events.map((e) => <EventTicket key={e.id} e={e} />)}
      </div>
    </>
  );
}
