"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BookOpen, CalendarDays, House, Menu, Palette, ShoppingBasket, UserRound } from "lucide-react";
import { nav, site } from "@/lib/site";
import { SearchButton } from "./SearchModal";
import { initials, useSession } from "@/lib/session";
import { AppDrawer } from "./AppDrawer";
import { LogoIcon } from "./Logo";

const icons = { home: House, book: BookOpen, music: Palette, calendar: CalendarDays, basket: ShoppingBasket } as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useMemberInitials() {
  const { user } = useSession();
  return user ? initials(user.name) || "★" : null;
}

export function SiteHeader() {
  const pathname = usePathname();
  const me = useMemberInitials();
  const scrolled = useScrolled();
  // The drawer closes itself when one of its links is tapped.
  const [menu, setMenu] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  // Slide the yellow indicator under the active link.
  useLayoutEffect(() => {
    const place = () => {
      const el = navRef.current?.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
      setPill(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [pathname]);

  return (
    <header data-hide-in-search className={`sticky top-0 z-50 px-3 transition-[padding] duration-300 sm:px-5 app:max-md:bg-card app:max-md:px-0 app:max-md:pt-[env(safe-area-inset-top)] app:max-md:shadow-[0_1px_0_var(--color-line),0_6px_16px_-12px_rgb(35_27_22/0.35)] ${scrolled ? "pt-2" : "pt-3 sm:pt-4"}`}>
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-white/70 bg-card/80 pr-2 pl-5 shadow-[0_10px_40px_-14px_rgb(35_27_22/0.28)] backdrop-blur-xl transition-all duration-300 sm:pl-6 app:max-md:!h-14 app:max-md:rounded-none app:max-md:border-0 app:max-md:bg-transparent app:max-md:pl-4 app:max-md:shadow-none app:max-md:backdrop-blur-none ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <Link href="/" aria-label={`${site.nameEn}, home`} className="flex min-w-0 items-center gap-3">
          <LogoIcon className="h-8 w-auto shrink-0" priority />
          <span className="min-w-0 leading-tight">
            <span className="block font-ml text-[14px] font-semibold sm:text-[15px]">{site.nameMl}</span>
            <span className="hidden text-[12px] text-muted md:block">{site.placeEn}</span>
          </span>
        </Link>

        <div ref={navRef} className="relative hidden items-center gap-1 md:flex" role="navigation" aria-label="Main">
          {pill && (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 rounded-full bg-royal transition-[left,width] duration-300 ease-[cubic-bezier(0.3,1.3,0.5,1)]"
              style={{ left: pill.left, width: pill.width }}
            />
          )}
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className="relative rounded-full px-4 py-2 text-[15px] font-medium text-ink-2 transition-colors hover:bg-ink/5 aria-[current=page]:text-mist aria-[current=page]:hover:bg-transparent"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <SearchButton className="w-11 justify-center" />
          {/* Visitors: sign in. Signed in: the menu (profile, bookings, payments, admin, sign out). */}
          <Link
            href="/join"
            aria-label="Sign in or create your library card"
            title="Sign in"
            className="group grid size-11 place-items-center rounded-full bg-royal text-mist transition-all duration-200 hover:scale-105 hover:bg-royal-700 active:scale-95 app:hidden"
          >
            <UserRound size={20} strokeWidth={2} />
          </Link>
          <button
            type="button"
            onClick={() => setMenu(true)}
            aria-label="Open menu"
            aria-expanded={menu}
            className="relative hidden size-11 place-items-center rounded-full bg-royal text-mist transition-all duration-200 hover:bg-royal-700 active:scale-95 app:grid"
          >
            <Menu size={21} strokeWidth={2.2} />
            {me && <span aria-hidden className="absolute -right-0.5 -bottom-0.5 grid size-5 place-items-center rounded-full bg-kani text-[9.5px] font-bold text-ink ring-2 ring-card">{me}</span>}
          </button>
        </div>
      </div>
      <Suspense><AppDrawer open={menu} onClose={() => setMenu(false)} /></Suspense>
    </header>
  );
}

export function BottomDock() {
  const pathname = usePathname();
  return (
    <nav data-hide-in-search aria-label="Main" className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(10px,env(safe-area-inset-bottom))] md:hidden app:bg-card app:px-0 app:pb-[env(safe-area-inset-bottom)] app:shadow-[0_-1px_0_var(--color-line)]">
      <ul className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[24px] bg-royal p-1.5 shadow-bar app:max-w-none app:rounded-none app:bg-transparent app:px-1 app:py-1 app:shadow-none">
        {nav.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = icons[item.icon];
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group flex h-[60px] flex-col items-center justify-center gap-1 rounded-[18px] text-[11.5px] transition-colors duration-200 app:h-16 app:rounded-none app:bg-transparent ${
                  active ? "bg-mist font-semibold text-royal app:text-royal" : "text-mist/75 active:bg-white/10 app:text-ink-2 app:active:bg-transparent"
                }`}
              >
                <span className={`grid h-8 w-14 place-items-center rounded-full transition-colors duration-200 ${active ? "app:bg-royal-50" : "app:group-active:bg-mist-2"}`}>
                  <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
