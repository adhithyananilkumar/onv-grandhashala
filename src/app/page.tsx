import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Palette, Search, ShoppingBasket } from "lucide-react";
import { QuoteRotator, type Quote } from "@/components/QuoteRotator";
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

const quotes: Quote[] = [
  { ml: "വായിച്ചു വളരുക, ചിന്തിച്ചു വിവേകം നേടുക", en: "Read and grow. Think and grow wise.", by: "P. N. Panicker, father of Kerala's library movement" },
  { ml: "വിദ്യകൊണ്ട് പ്രബുദ്ധരാകുക", en: "Be enlightened through learning.", by: "Sree Narayana Guru" },
  { ml: "ഓരോ ഗ്രാമത്തിലും ഒരു ഗ്രന്ഥശാല", en: "A library in every village.", by: "The idea that built Kerala's library movement" },
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
      {/* Hero: fills the first screen. Rotating lines about reading, drifting washes, gliding lotus borders. */}
      <section className="sm:px-5 sm:pt-2">
        <div className="relative mx-auto flex min-h-[calc(100svh-76px-92px)] max-w-6xl flex-col overflow-hidden bg-card sm:rounded-[32px] sm:shadow-lift md:min-h-[calc(100svh-104px)]">
          <h1 className="sr-only">{site.nameMl}, {site.nameEn}, {site.placeEn}</h1>
          <LotusBorder moving className="relative z-10" />
          <HeroWashes className="pointer-events-none absolute inset-0 h-full w-full" />

          <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-10 text-center sm:py-14">
            <div className="w-full max-w-3xl">
              <QuoteRotator quotes={quotes} />
            </div>

            <form action="/catalogue" role="search" className="mt-10 w-full max-w-xl text-left">
              <label htmlFor="hero-q" className="sr-only">Search books by title or author</label>
              <div className="flex items-center gap-2 rounded-full border-2 border-royal bg-card/95 p-1.5 pl-4 shadow-lift backdrop-blur transition-shadow focus-within:shadow-[0_0_0_4px_var(--color-royal-50)]">
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
              {suggestions.map((s, n) => (
                <Link
                  key={s.q}
                  href={`/catalogue?q=${encodeURIComponent(s.q)}`}
                  className={`rounded-full border border-line bg-card/80 px-3.5 py-1.5 text-[15px] font-medium text-ink transition-colors hover:border-royal hover:bg-royal hover:text-mist ${n > 2 ? "hidden sm:inline-block" : ""}`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          <LotusBorder moving reverse className="relative z-10" />
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
