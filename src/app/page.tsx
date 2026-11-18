import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, MapPin, Palette, Phone, Search, ShoppingBasket } from "lucide-react";
import { books, classes, events, products } from "@/lib/data";
import { site } from "@/lib/site";
import { LotusBorder } from "@/components/Art";
import { BooksLamp, Chenda, HeroWashes, PalmMarket, SnakeBoat } from "@/components/Paintings";
import { LogoIcon } from "@/components/Logo";
import { BookCard, ClassCard, EventCard, ProductCard, SectionHead } from "@/components/ui";

const sections = [
  { href: "/catalogue", icon: BookOpen, Art: BooksLamp, cta: "Find a book", title: "Books", ml: "പുസ്തകങ്ങൾ", text: "Malayalam classics, children's books and PSC guides. Search the shelves and reserve from your phone." },
  { href: "/classes", icon: Palette, Art: Chenda, cta: "See classes", title: "Classes", ml: "ക്ലാസുകൾ", text: "Carnatic music, Bharatanatyam, drawing, yoga, PSC coaching and computer basics, taught by people from the village." },
  { href: "/events", icon: CalendarDays, Art: SnakeBoat, cta: "See events", title: "Events and camps", ml: "പരിപാടികൾ", text: "Eye and health check-ups, holiday camps for children, and poetry evenings in memory of ONV." },
  { href: "/vipani", icon: ShoppingBasket, Art: PalmMarket, cta: "Visit the market", title: "Naattu Vipani", ml: "നാട്ടു വിപണി", text: "Coconut oil, banana chips, handwoven mundu and fresh produce from local growers. Order, or bid in an auction." },
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
      {/* Hero: a framed panel, gold lotus borders gliding top and bottom, painted washes in the corners */}
      <section className="px-3 pt-2 sm:px-5 sm:pt-4">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-card shadow-lift">
          <LotusBorder moving className="relative z-10" />
          <HeroWashes className="pointer-events-none absolute inset-0 h-full w-full" />

          <div className="relative mx-auto max-w-2xl px-5 py-12 text-center sm:py-20">
            <LogoIcon className="mx-auto h-14 w-auto sm:h-16" priority />
            <h1 className="mt-6 font-ml text-[2.6rem] leading-[1.15] font-extrabold tracking-[-0.01em] text-royal sm:text-[4rem]">
              {site.nameMl}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[18px] leading-relaxed text-ink-2 sm:text-xl">
              Puthanambalam&apos;s public library. Borrow books, learn music and art, join a health camp, or shop from local growers.
            </p>

            <form action="/catalogue" role="search" className="mx-auto mt-8 max-w-xl text-left">
              <label htmlFor="hero-q" className="sr-only">Search books by title or author</label>
              <div className="flex items-center gap-2 rounded-full border-2 border-royal bg-card p-1.5 pl-4 shadow-lift transition-shadow focus-within:shadow-[0_0_0_4px_var(--color-royal-50)]">
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
                <button className="h-12 shrink-0 rounded-full bg-royal px-5 text-[16px] font-semibold text-mist transition-colors hover:bg-royal-700 sm:px-7">
                  Search
                </button>
              </div>
            </form>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[15px] text-muted">Try</span>
              {suggestions.map((s) => (
                <Link
                  key={s.q}
                  href={`/catalogue?q=${encodeURIComponent(s.q)}`}
                  className="rounded-full bg-mist-2 px-3.5 py-1.5 text-[15px] font-medium text-ink transition-colors hover:bg-royal hover:text-mist"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          <LotusBorder moving reverse className="relative z-10" />
        </div>
      </section>

      {/* Visiting: the facts people most often need */}
      <section className="mx-auto max-w-6xl px-5 pt-10">
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
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="group flex flex-col rounded-2xl bg-royal p-5 text-mist shadow-lift transition-colors hover:bg-royal-700">
            <h2 className="font-display text-lg font-bold">Call the library</h2>
            <p className="mt-2 flex items-center gap-2 text-[17px] font-semibold"><Phone size={18} />{site.phone}</p>
          </a>
        </div>
      </section>

      {/* What's here */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-24">
        <SectionHead title="What you can do here" ml="ഗ്രന്ഥശാലയിൽ എന്തെല്ലാം" />
        <ul className="space-y-4 sm:space-y-6">
          {sections.map((s, i) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group grid overflow-hidden rounded-3xl bg-mist-2 transition-shadow duration-300 hover:shadow-lift md:grid-cols-2"
              >
                <div className={`relative h-52 overflow-hidden sm:h-64 md:h-80 ${i % 2 ? "md:order-2" : ""}`}>
                  <s.Art className="art-fade h-full w-full transition-transform duration-700 group-hover:scale-[1.03]" />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-10">
                  <span className="mb-4 grid size-11 place-items-center rounded-full bg-card text-royal">
                    <s.icon size={21} strokeWidth={1.9} />
                  </span>
                  <h3 className="font-display text-[1.6rem] leading-tight font-bold sm:text-3xl">{s.title}</h3>
                  <p className="font-ml text-[16px] text-muted">{s.ml}</p>
                  <p className="mt-3 max-w-sm text-[17px] leading-relaxed text-ink-2">{s.text}</p>
                  <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-royal px-5 py-2.5 text-[15px] font-semibold text-mist transition-colors group-hover:bg-royal-700">
                    {s.cta} <ArrowRight size={17} />
                  </span>
                </div>
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
            <Link href="/join" className="mt-6 inline-flex items-center gap-2 rounded-full bg-royal px-6 py-3.5 text-[16px] font-semibold text-mist transition-colors hover:bg-royal-700">
              Get my card <ArrowRight size={18} />
            </Link>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <div className="relative aspect-[1.586] overflow-hidden rounded-3xl bg-royal p-6 text-mist shadow-bar">
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
