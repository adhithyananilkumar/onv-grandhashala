import type { Metadata } from "next";
import { classes } from "@/lib/data";
import { ClassCard, PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Classes" };

export default function ClassesPage() {
  return (
    <>
      <PageHero title="Classes" ml="കല, സംഗീതം, നൃത്തം, യോഗ, പി.എസ്.സി">
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-2">
          Taught by local teachers and volunteers in the library hall. Many are free, and the rest are kept affordable.
        </p>
      </PageHero>
      <div className="mx-auto grid max-w-6xl gap-4 px-5 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => <ClassCard key={c.id} c={c} />)}
      </div>
    </>
  );
}
