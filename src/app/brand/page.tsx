import type { Metadata } from "next";
import Image from "next/image";
import { LogoFull, LogoIcon, LogoLoader, LogoLockup } from "@/components/Logo";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Brand & logo" };

function Tile({ label, note, dark, file, children }: { label: string; note: string; dark?: boolean; file?: string; children: React.ReactNode }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-card shadow-lift">
      <div className={`grid min-h-56 place-items-center p-8 ${dark ? "bg-ink" : "bg-mist-2"}`}>{children}</div>
      <figcaption className="flex items-start justify-between gap-3 p-4">
        <span>
          <span className="block font-semibold">{label}</span>
          <span className="block text-sm text-muted">{note}</span>
        </span>
        {file && (
          <a href={file} download className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:border-ink">
            PNG
          </a>
        )}
      </figcaption>
    </figure>
  );
}

export default function BrandPage() {
  return (
    <>
      <PageHero title="Logo and brand" ml="ഗ്രന്ഥശാലയുടെ ഔദ്യോഗിക ലോഗോ" />
      <div className="mx-auto grid max-w-6xl gap-5 px-4 pt-8 sm:grid-cols-2 lg:grid-cols-3">
        <Tile label="Full logo" note="Notices, certificates, letterheads" file="/brand/onv-logo.png">
          <LogoFull className="h-auto w-56" />
        </Tile>
        <Tile label="Full logo, white" note="On dark or photo backgrounds" dark file="/brand/onv-logo-white.png">
          <LogoFull white className="h-auto w-56" />
        </Tile>
        <Tile label="Icon only" note="Small spaces, social posts, watermarks" file="/brand/onv-icon.png">
          <LogoIcon className="h-auto w-48" />
        </Tile>
        <Tile label="Icon only, white" note="Footer, dark headers" dark file="/brand/onv-icon-white.png">
          <LogoIcon white className="h-auto w-48" />
        </Tile>
        <Tile label="Website header" note="Icon with the name set in type">
          <LogoLockup />
        </Tile>
        <Tile label="App icon / favicon" note="Browser tab, home-screen shortcut" file="/icon.png">
          <Image src="/icon.png" alt="" width={112} height={112} className="rounded-3xl shadow-lift" />
        </Tile>
        <Tile label="Loader" note="Page loading and waiting states">
          <LogoLoader label="ലോഡ് ചെയ്യുന്നു…" />
        </Tile>
      </div>
    </>
  );
}
