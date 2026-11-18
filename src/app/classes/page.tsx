import type { Metadata } from "next";
import { classes } from "@/lib/data";
import { ClassRow, PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Classes" };

export default function ClassesPage() {
  return (
    <>
      <PageHero eyebrow="Learn with us" title={<>Arts, music <em>&amp; more</em></>} ml="കല, സംഗീതം, നൃത്തം, യോഗ, പി.എസ്.സി">
        <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-ink-2">
          Taught by local teachers and volunteers in the library hall. Many classes are free, and the rest are kept affordable.
        </p>
      </PageHero>
      <div className="mx-auto max-w-6xl border-b border-line px-4">
        {classes.map((c, i) => <ClassRow key={c.id} c={c} n={i + 1} />)}
      </div>
    </>
  );
}
