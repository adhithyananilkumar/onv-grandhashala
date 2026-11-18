"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, House, Palette, Search, ShoppingBasket, UserRound } from "lucide-react";
import { nav, site } from "@/lib/site";
import { LogoIcon } from "./Logo";

const icons = { home: House, book: BookOpen, music: Palette, calendar: CalendarDays, basket: ShoppingBasket } as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full border border-line/80 bg-card/75 pr-2 pl-4 shadow-float backdrop-blur-xl">
        <Link href="/" aria-label={`${site.nameEn}, home`} className="flex min-w-0 items-center gap-2.5">
          <LogoIcon className="h-7 w-auto shrink-0" priority />
          <span className="min-w-0 leading-none">
            <span className="block font-ml-serif text-[12.5px] leading-[1.25] font-bold sm:text-[14px]">{site.nameMl}</span>
            <span className="mt-0.5 block font-mono text-[9px] tracking-[0.18em] text-muted uppercase sm:text-[9.5px]">{site.placeEn}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className="rounded-full px-3.5 py-2 text-[13.5px] text-ink-2 transition hover:bg-paper-2 aria-[current=page]:bg-ink aria-[current=page]:text-paper"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <Link href="/catalogue" aria-label="Search books" className="grid size-10 place-items-center rounded-full text-ink-2 hover:bg-paper-2 md:hidden">
            <Search size={19} strokeWidth={1.7} />
          </Link>
          <Link href="/join" aria-label="Member sign in" className="grid size-10 place-items-center rounded-full bg-ink text-paper md:hidden">
            <UserRound size={18} strokeWidth={1.7} />
          </Link>
          <Link href="/join" className="hidden rounded-full bg-ink px-4 py-2.5 text-[13.5px] font-medium whitespace-nowrap text-paper transition hover:bg-ink-2 md:inline-flex">
            Library card
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BottomDock() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5 rounded-[26px] border border-white/10 bg-ink/92 p-1.5 shadow-float backdrop-blur-xl">
        {nav.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = icons[item.icon];
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-1 rounded-[20px] text-[10.5px] transition ${
                  active ? "bg-paper text-ink" : "text-paper/65 active:bg-white/10"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.6} />
                <span className={active ? "font-semibold" : ""}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
