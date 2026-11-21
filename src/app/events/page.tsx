import type { Metadata } from "next";
import { EventsBrowser } from "@/components/Browse";
import { PageHero } from "@/components/ui";
import { MyItems } from "@/components/MyItems";
import { GuestOnly } from "@/components/AuthGate";

export const metadata: Metadata = { title: "Events and camps" };

export default function EventsPage() {
  return (
    <>
      {/* Visitors: the painted banner. Members: what they've booked, then a "More …" button that opens the search. */}
      <GuestOnly>
        <PageHero title="Events and camps" ml="ആരോഗ്യ ക്യാമ്പുകൾ, സാഹിത്യ സന്ധ്യകൾ, അവധിക്കാല ക്യാമ്പുകൾ" art="events">
          <p>Health check-ups, holiday camps for children and poetry evenings. Register to save your place.</p>
        </PageHero>
      </GuestOnly>
      <MyItems kind="events">
        <EventsBrowser />
      </MyItems>
    </>
  );
}
