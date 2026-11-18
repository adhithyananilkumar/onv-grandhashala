import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { LogoIcon } from "./Logo";

const links = [
  { href: "/catalogue", label: "Book catalogue" },
  { href: "/classes", label: "Classes" },
  { href: "/events", label: "Events & camps" },
  { href: "/vipani", label: "Naattu Vipani" },
  { href: "/join", label: "Library card" },
  { href: "/brand", label: "Logo & brand" },
];

export function Footer() {
  return (
    <footer className="mt-24 px-3 pb-3">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-ink text-paper">
        <div className="px-6 pt-12 pb-8 sm:px-10">
          <LogoIcon white className="h-10 w-auto opacity-90" />
          <p className="mt-8 max-w-3xl font-serif text-[2.6rem] leading-[1.02] tracking-tight sm:text-6xl">
            Read. Learn. <em className="text-gold">Gather.</em> Grow.
          </p>
          <p className="mt-3 font-ml text-paper/60">വായിച്ചു വളരുക, ചിന്തിച്ചു വിവേകം നേടുക</p>

          <div className="mt-12 grid gap-10 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-paper/45 uppercase">Find us</p>
              <p className="mt-3 font-ml-serif text-[15px] leading-relaxed">{site.nameMl}</p>
              <p className="mt-1 font-ml text-sm text-paper/70">{site.addressMl}</p>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="mt-3 inline-block font-mono text-sm text-paper/80 hover:text-paper">{site.phone}</a>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-paper/45 uppercase">Open</p>
              <ul className="mt-3 space-y-2 text-sm">
                {site.hours.map((h) => (
                  <li key={h.days}>
                    <span className="block text-paper">{h.days}</span>
                    <span className="font-mono text-[12.5px] text-paper/65">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-paper/45 uppercase">Explore</p>
              <ul className="mt-3 grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-1">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="group inline-flex items-center gap-1 text-paper/80 hover:text-paper">
                      {l.label}
                      <ArrowUpRight size={13} className="opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-t border-white/10 px-6 py-4 font-mono text-[11px] text-paper/45 sm:flex-row sm:justify-between sm:px-10">
          <span>REG. NO. {site.regNo} · Kerala State Library Council</span>
          <span>In memory of O. N. V. Kurup, 1931–2016</span>
        </div>
      </div>
    </footer>
  );
}
