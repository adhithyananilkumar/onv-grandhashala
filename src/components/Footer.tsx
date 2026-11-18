import Link from "next/link";
import { site } from "@/lib/site";
import { LogoIcon } from "./Logo";

const links = [
  { href: "/catalogue", label: "Book catalogue" },
  { href: "/classes", label: "Classes" },
  { href: "/events", label: "Events and camps" },
  { href: "/vipani", label: "Naattu Vipani" },
  { href: "/join", label: "Library card" },
  { href: "/brand", label: "Logo and brand" },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-ink text-mist sm:mt-28">
      <div className="h-1.5 bg-kani" />
      <div className="mx-auto max-w-6xl px-5 pt-12 pb-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <LogoIcon white className="h-11 w-auto" />
            <p className="mt-5 font-ml text-2xl font-semibold text-white">{site.nameMl}</p>
            <p className="mt-1 font-ml text-[15px] text-mist/75">{site.addressMl}</p>
          </div>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="w-fit rounded-full bg-kani px-5 py-3 font-semibold text-ink transition hover:brightness-95">
            Call the library
          </a>
        </div>

        <div className="mt-10 grid gap-8 border-t border-white/15 pt-8 sm:grid-cols-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Opening hours</h2>
            <dl className="mt-3 space-y-2 text-[15px]">
              {site.hours.map((h) => (
                <div key={h.days} className="flex flex-col sm:flex-row sm:gap-4">
                  <dt className="w-28 shrink-0 text-white">{h.days}</dt>
                  <dd className="text-mist/80">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
          <nav aria-label="Footer">
            <h2 className="font-display text-lg font-semibold text-white">Explore</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[15px]">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-mist/85 underline-offset-4 hover:text-white hover:underline">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-10 text-[13px] leading-relaxed text-mist/60">
          Registration no. {site.regNo}, affiliated to the Kerala State Library Council. Named in memory of the poet O. N. V. Kurup (1931–2016).
        </p>
      </div>
    </footer>
  );
}
