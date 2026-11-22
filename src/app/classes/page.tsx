import type { Metadata } from "next";
import { ClassesBrowser } from "@/components/Browse";
import { MyItems } from "@/components/MyItems";

export const metadata: Metadata = { title: "Classes" };

export default function ClassesPage() {
  return (
    <>
      <MyItems kind="classes" banner={{ title: "Classes", ml: "കല, സംഗീതം, നൃത്തം, യോഗ, പി.എസ്.സി", art: "classes", text: "Taught by local teachers and volunteers. Many are free, and the rest are kept affordable." }}>
        <ClassesBrowser />
      </MyItems>
    </>
  );
}
