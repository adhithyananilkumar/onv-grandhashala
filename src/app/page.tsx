import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, MapPin, Palette, Phone, Search, ShoppingBasket } from "lucide-react";
import { books, classes, events, products } from "@/lib/data";
import { site } from "@/lib/site";
import { Kanikonna, KeralaScape } from "@/components/Art";
import { LogoIcon } from "@/components/Logo";
import { BookCard, ClassCard, EventCard, ProductCard, SectionHead } from "@/components/ui";

const sections = [
  { href: "/catalogue", icon: BookOpen, title: "Books", ml: "പുസ്തകങ്ങൾ", text: "Search the shelves and reserve from your phone." },
  { href: "/classes", icon: Palette, title: "Classes", ml: "ക്ലാസുകൾ", text: "Music, dance, drawing, yoga, PSC and computers." },
  { href: "/events", icon: CalendarDays, title: "Events and camps", ml: "പരിപാടികൾ", text: "Health check-ups, holiday camps, poetry evenings." },
  { href: "/vipani", icon: ShoppingBasket, title: "Naattu Vipani", ml: "നാട്ടു വിപണി", text: "Buy from local farmers and makers, or bid." },
];

const suggestions = [
  { label: "ONV poetry", q: "onv" },
  { label: "Basheer", q: "basheer" },
  { label: "Novels", q: "Novel" },
  { label: "Children's books", q: "Children" },
  { label: "PSC", q: "PSC" },
];

export default function Home() {
  const auctions = products.filter((p) => p.auction);
  return (
    <>
      {/* Hero: the library's name under a kanikonna branch, and the search box */}
      <section className="relative">
        <div aria-hidden="true" className="-mt-2 h-36 overflow-hidden px-2 [mask-image:linear-gradient(black_55%,transparent)] sm:h-44 lg:hidden">
          <Kanikonna className="mx-auto w-full max-w-xl" />
        </div>
        <Kanikonna className="pointer-events-none absolute top-2 right-0 hidden w-[min(540px,46%)] lg:block" />

        <div className="relative mx-auto max-w-6xl px-5 lg:pt-16">
          <div className="max-w-2xl">
            <h1 className="font-ml text-[2.7rem] leading-[1.12] font-extrabold tracking-[-0.01em] text-ink sm:text-[4.2rem]">
              {site.nameMl}
            </h1>
            <p className="mt-3 max-w-xl text-[18px] leading-relaxed text-ink-2 sm:text-xl">
              Puthanambalam&apos;s public library. Borrow books, learn music and art, join a health camp, or shop from local growers.
            </p>

            <form action="/catalogue" role="search" className="mt-7">
              <label htmlFor="hero-q" className="sr-only">Search books by title or author</label>
              <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-card p-1.5 pl-4 shadow-lift transition-shadow focus-within:shadow-[0_0_0_4px_var(--color-kani)]">
                <Search size={22} className="shrink-0 text-ink" />
                <input
                  id="hero-q"
                  name="q"
                  type="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  placeholder="Book or author"
                  className="h-12 min-w-0 flex-1 bg-transparent text-[17px] placeholder:text-muted focus:outline-none focus-visible:outline-none"
                />
                <button className="h-12 shrink-0 rounded-full bg-ink px-5 text-[16px] font-semibold text-mist transition-colors hover:bg-ink-2 sm:px-7">
                  Search
                </button>
              </div>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[15px] text-muted">Try</span>
              {suggestions.map((s) => (
                <Link
                  key={s.q}
                  href={`/catalogue?q=${encodeURIComponent(s.q)}`}
                  className="rounded-full bg-mist-2 px-3.5 py-1.5 text-[15px] font-medium text-ink transition-colors hover:bg-kani"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <KeralaScape className="mt-8 h-40 w-full sm:h-56 lg:mt-4 lg:h-auto" />
      </section>

      {/* Visiting: the facts people most often need */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-card p-5 shadow-lift">
            <h2 className="font-display text-lg font-bold">Opening hours</h2>
            <dl className="mt-2 space-y-1 text-[15px]">
              {site.hours.map((h) => (
                <div key={h.days}>
                  <dt className="font-semibold">{h.days}</dt>
                  <dd className="text-ink-2">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-lift">
            <h2 className="font-display text-lg font-bold">Find us</h2>
            <p className="mt-2 flex gap-2 font-ml text-[16px] text-ink-2"><MapPin size={18} className="mt-0.5 shrink-0 text-teal" />{site.addressMl}</p>
          </div>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="group flex flex-col rounded-2xl bg-kani p-5 text-ink shadow-lift transition hover:brightness-95">
            <h2 className="font-display text-lg font-bold">Call the library</h2>
            <p className="mt-2 flex items-center gap-2 text-[17px] font-semibold"><Phone size={18} />{site.phone}</p>
          </a>
        </div>
      </section>

      {/* What's here */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-24">
        <SectionHead title="What you can do here" ml="ഗ്രന്ഥശാലയിൽ എന്തെല്ലാം" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="group flex h-full items-start gap-4 rounded-2xl bg-card p-5 shadow-lift transition-transform duration-200 active:scale-[0.98] lg:flex-col">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-kani-50 text-ink transition-colors group-hover:bg-kani">
                  <s.icon size={23} strokeWidth={1.9} />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[1.2rem] leading-tight font-bold">{s.title}</span>
                  <span className="block font-ml text-[15px] text-muted">{s.ml}</span>
                  <span className="mt-1.5 block text-[15px] leading-snug text-ink-2">{s.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* New books */}
      <section className="pt-16 sm:pt-24">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHead title="New on the shelves" ml="പുതിയ പുസ്തകങ്ങൾ" href="/catalogue" cta="All books" />
        </div>
        <ul className="no-scrollbar mx-auto flex max-w-6xl snap-x scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 sm:gap-6">
          {books.slice(0, 8).map((b) => (
            <li key={b.id} className="w-[148px] shrink-0 snap-start sm:w-[176px]">
              <Link href={`/catalogue?q=${encodeURIComponent(b.title)}`} className="block transition-transform duration-200 hover:-translate-y-1">
                <BookCard book={b} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Events */}
      <section className="mx-auto max-w-6xl px-5 pt-14 sm:pt-20">
        <SectionHead title="Coming up" ml="വരാനിരിക്കുന്ന പരിപാടികൾ" href="/events" cta="All events" />
        <div className="grid gap-4 lg:grid-cols-2">
          {events.slice(0, 2).map((e, i) => <EventCard key={e.id} e={e} highlight={i === 0} />)}
        </div>
      </section>

      {/* Classes */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-24">
        <SectionHead title="Classes this season" ml="കല, സംഗീതം, നൃത്തം, യോഗ" href="/classes" cta="All classes" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.slice(0, 3).map((c) => <ClassCard key={c.id} c={c} />)}
        </div>
      </section>

      {/* Vipani */}
      <section className="mt-16 bg-mist-2 py-14 sm:mt-24 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHead title="Naattu Vipani auctions" ml="നാട്ടിലെ ഉൽപന്നങ്ങൾ, നാട്ടുകാരിൽ നിന്ന്" href="/vipani" cta="Visit the market" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {auctions.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
          </div>
        </div>
      </section>

      {/* Library card */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-[2.2rem] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-5xl">Get a library card</h2>
            <p className="mt-2 font-ml text-lg text-ink-2">അംഗമാകൂ, മൊബൈൽ നമ്പർ മാത്രം മതി</p>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink-2">
              Borrow books, reserve them from home, and get first seats in classes and camps. All you need is your mobile number.
            </p>
            <Link href="/join" className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[16px] font-semibold text-mist transition-colors hover:bg-ink-2">
              Get my card <ArrowRight size={18} />
            </Link>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <div className="relative aspect-[1.586] overflow-hidden rounded-3xl bg-ink p-6 text-mist shadow-bar">
              <span aria-hidden="true" className="absolute -top-16 -right-16 size-48 rounded-full bg-kani" />
              <span aria-hidden="true" className="absolute top-14 -right-6 size-20 rounded-full bg-teal" />
              <div className="relative flex h-full flex-col">
                <LogoIcon white className="h-9 w-auto self-start" />
                <p className="mt-auto font-ml text-lg font-semibold text-white">{site.nameMl}</p>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <p className="text-[12px] text-mist/70">Member card</p>
                    <p className="text-[17px] font-semibold tracking-[0.12em] text-white tabular-nums">ONV 0001 2026</p>
                  </div>
                  <div aria-hidden="true" className="flex h-9 items-end gap-[2px]">
                    {[3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3].map((w, i) => (
                      <span key={i} className="h-full bg-mist/90" style={{ width: w }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
