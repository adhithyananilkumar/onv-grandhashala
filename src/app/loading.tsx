import { LogoLoader } from "@/components/Logo";

export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <LogoLoader label="ലോഡ് ചെയ്യുന്നു…" />
    </div>
  );
}
