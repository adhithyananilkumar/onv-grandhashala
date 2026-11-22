import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CalendarDays, Palette, ShoppingBasket } from "lucide-react";
import { OfflineDoodle } from "@/components/OfflineDoodle";
import { RetryButton } from "@/components/Pwa";
import { LogoMark } from "@/components/Logo";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };

const saved = [
  { href: "/catalogue", label: "Books", icon: BookOpen },
  { href: "/classes", label: "Classes", icon: Palette },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/vipani", label: "Vipani", icon: ShoppingBasket },
];

/** Shown by the service worker when a page can't load and no saved copy exists. Fully static. */
export default function OfflinePage() {
  return (
    <div data-offline-page className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-10 text-center">
      <div aria-hidden className="pointer-events-none fixed inset-0 [background:radial-gradient(40rem_28rem_at_15%_10%,var(--color-kani-50),transparent_70%),radial-gradient(40rem_28rem_at_90%_95%,var(--color-royal-50),transparent_70%)]" />
      <div className="relative w-full max-w-sm">
        <LogoMark className="mx-auto h-9 text-royal" label="ONV Grameena Grandhashala" />
        <OfflineDoodle className="mx-auto mt-6 w-full max-w-[300px]" />
        <h1 className="mt-4 font-display text-[2rem] leading-tight font-extrabold tracking-[-0.025em]">You&rsquo;re offline</h1>
        <p className="mt-1 font-ml text-[1.1rem] text-ink-2">ഇന്റർനെറ്റ് ബന്ധമില്ല</p>
        <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-muted">
          Pages you opened before still work. Everything else will be here when you&rsquo;re back online.
        </p>
        <RetryButton />
        <nav aria-label="Saved pages" className="mt-8 grid grid-cols-4 gap-2">
          {saved.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex flex-col items-center gap-1.5 rounded-2xl bg-card/80 py-3 text-[12.5px] font-semibold text-ink-2 ring-1 ring-line/70 transition-colors hover:text-royal">
              <Icon size={20} className="text-royal" /> {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
