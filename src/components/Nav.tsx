"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BookOpen, CalendarDays, House, Palette, Search, ShoppingBasket, UserRound } from "lucide-react";
import { nav, site } from "@/lib/site";
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

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useScrolled();
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
    <header className={`sticky top-0 z-50 px-3 transition-[padding] duration-300 sm:px-5 ${scrolled ? "pt-2" : "pt-3 sm:pt-4"}`}>
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-[22px] border pr-2 pl-3.5 transition-all duration-300 sm:pl-4 ${
          scrolled ? "h-14 border-line bg-card/90 shadow-bar backdrop-blur-xl" : "h-16 border-transparent bg-transparent"
        }`}
      >
        <Link href="/" aria-label={`${site.nameEn}, home`} className="flex min-w-0 items-center gap-3">
          <LogoIcon className="h-8 w-auto shrink-0" priority />
          <span className="min-w-0 leading-tight">
            <span className="block font-ml text-[14px] font-semibold sm:text-[15px]">{site.nameMl}</span>
            <span className="block text-[12px] text-muted">{site.placeEn}</span>
          </span>
        </Link>

        <div ref={navRef} className="relative hidden items-center gap-1 md:flex" role="navigation" aria-label="Main">
          {pill && (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 rounded-full bg-kani transition-[left,width] duration-300 ease-[cubic-bezier(0.3,1.3,0.5,1)]"
              style={{ left: pill.left, width: pill.width }}
            />
          )}
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className="relative rounded-full px-4 py-2 text-[15px] font-medium text-ink-2 transition-colors hover:bg-ink/5 aria-[current=page]:text-ink aria-[current=page]:hover:bg-transparent"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Link href="/catalogue" aria-label="Search books" className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5 md:hidden">
            <Search size={21} strokeWidth={2} />
          </Link>
          <Link
            href="/join"
            aria-label="Sign in or create your library card"
            title="Sign in"
            className="group grid size-11 place-items-center rounded-full bg-ink text-mist transition-all duration-200 hover:scale-105 hover:bg-ink-2 active:scale-95"
          >
            <UserRound size={20} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BottomDock() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(10px,env(safe-area-inset-bottom))] md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[24px] bg-ink p-1.5 shadow-bar">
        {nav.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = icons[item.icon];
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-[60px] flex-col items-center justify-center gap-1 rounded-[18px] text-[11.5px] transition-colors duration-200 ${
                  active ? "bg-kani font-semibold text-ink" : "text-mist/75 active:bg-white/10"
                }`}
              >
                <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
