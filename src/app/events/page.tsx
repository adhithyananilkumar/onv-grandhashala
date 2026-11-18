import type { Metadata } from "next";
import { events } from "@/lib/data";
import { EventCard, PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Events and camps" };

export default function EventsPage() {
  return (
    <>
      <PageHero title="Events and camps" ml="ആരോഗ്യ ക്യാമ്പുകൾ, സാഹിത്യ സന്ധ്യകൾ, അവധിക്കാല ക്യാമ്പുകൾ" />
      <div className="mx-auto grid max-w-3xl gap-4 px-5">
        {events.map((e, i) => <EventCard key={e.id} e={e} highlight={i === 0} />)}
      </div>
    </>
  );
}
