import { notFound } from "next/navigation";
import { isSection, SECTIONS } from "@/components/admin/sections";

export function generateStaticParams() {
  return SECTIONS.filter((s) => s.key !== "dashboard").map((s) => ({ section: s.key }));
}

export default async function AdminSection({ params }: PageProps<"/admin/[section]">) {
  const { section } = await params;
  if (section === "dashboard" || !isSection(section)) notFound();
  return null;
}
