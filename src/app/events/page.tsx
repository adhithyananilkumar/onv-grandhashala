import type { Metadata } from "next";
import { EventsBrowser } from "@/components/Browse";
import { MyItems } from "@/components/MyItems";

export const metadata: Metadata = { title: "Events and camps" };

export default function EventsPage() {
  return (
    <>
      <MyItems kind="events" banner={{ title: "Events and camps", ml: "ആരോഗ്യ ക്യാമ്പുകൾ, സാഹിത്യ സന്ധ്യകൾ, അവധിക്കാല ക്യാമ്പുകൾ", art: "events", text: "Health check-ups, holiday camps for children and poetry evenings. Register to save your place." }}>
        <EventsBrowser />
      </MyItems>
    </>
  );
}
