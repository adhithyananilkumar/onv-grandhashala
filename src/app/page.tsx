import Link from "next/link";
import { ArrowRight, ArrowUp, ArrowUpRight, BookOpen, CalendarDays, Palette, ShoppingBasket, Sparkles } from "lucide-react";
import { books, classes, events, products } from "@/lib/data";
import { site } from "@/lib/site";
import { InkWash, KeralaScape } from "@/components/Art";
import { LogoIcon } from "@/components/Logo";
import { BookCard, ClassRow, EventTicket, Eyebrow, ProductCard, SectionHead } from "@/components/ui";

const doors = [
  { href: "/catalogue", icon: BookOpen, title: "Books", ml: "പുസ്തകങ്ങൾ", text: "Search 12,000+ titles, reserve from your phone, collect at the desk." },
  { href: "/classes", icon: Palette, title: "Classes", ml: "ക്ലാസുകൾ", text: "Music, dance, drawing, yoga, PSC coaching and computer basics." },
  { href: "/events", icon: CalendarDays, title: "Events & camps", ml: "പരിപാടികൾ", text: "Health check-ups, holiday camps and evenings of poetry." },
  { href: "/vipani", icon: ShoppingBasket, title: "Naattu Vipani", ml: "നാട്ടു വിപണി", text: "Buy from village farmers and makers, or bid in a live auction." },
];

const chips = [
  { label: "Malayalam novels", q: "Novel" },
  { label: "ONV poetry", q: "onv" },
  { label: "Children", q: "Children" },
  { label: "PSC", q: "PSC" },
];

export default function Home() {
  const auctions = products.filter((p) => p.auction);
  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden">
        <InkWash className="pointer-events-none absolute top-10 left-1/2 h-72 w-[min(1100px,170%)] -translate-x-1/2 opacity-55" seed={7} />
        <div className="relative mx-auto max-w-3xl px-4 pt-12 text-center sm:pt-20">
          <Link
            href="/events"
            className="inline-flex max-w-full animate-rise items-center gap-2 rounded-full border border-line bg-card/70 py-1.5 pr-3 pl-2 text-[12.5px] text-ink-2 backdrop-blur hover:border-ink/30"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-clay px-2 py-0.5 font-mono text-[10px] tracking-wider text-paper uppercase">
              <Sparkles size={11} /> New
            </span>
            <span className="truncate">Free eye check-up camp · 29 Nov</span>
            <ArrowRight size={13} className="shrink-0" />
          </Link>

          <h1 className="mt-7 animate-rise font-ml-serif text-[2.6rem] leading-[1.18] font-bold tracking-tight [animation-delay:80ms] sm:text-[4.2rem]">
            {site.nameMl}
          </h1>
          <p className="mt-3 animate-rise font-serif text-[1.65rem] leading-tight text-ink-2 [animation-delay:160ms] sm:text-4xl">
            A village library, <em className="text-clay">open to everyone.</em>
          </p>

          {/* Search, the main action */}
          <form action="/catalogue" className="mx-auto mt-9 max-w-2xl animate-rise rounded-[26px] border border-line bg-card/85 p-2 text-left shadow-float backdrop-blur-xl [animation-delay:240ms]">
            <label htmlFor="hero-q" className="sr-only">Search the catalogue</label>
            <input
              id="hero-q"
              name="q"
              autoComplete="off"
              placeholder="Search a book, author or subject…"
              className="h-14 w-full bg-transparent px-4 text-[16px] placeholder:text-muted focus:outline-none"
            />
            <div className="flex items-center justify-between gap-2 px-2 pb-1">
              <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
                {chips.map((c) => (
                  <Link key={c.q} href={`/catalogue?q=${encodeURIComponent(c.q)}`} className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[12.5px] text-ink-2 transition hover:border-ink/40 hover:bg-paper">
                    {c.label}
                  </Link>
                ))}
              </div>
              <button aria-label="Search" className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-paper transition hover:bg-clay">
                <ArrowUp size={18} />
              </button>
            </div>
          </form>

          <div className="mt-7 flex animate-rise flex-wrap justify-center gap-2 [animation-delay:320ms] sm:gap-2.5">
            <Link href="/classes" className="rounded-full border border-ink/25 px-4 py-2.5 text-sm transition hover:border-ink sm:px-5">Classes</Link>
            <Link href="/events" className="rounded-full border border-ink/25 px-4 py-2.5 text-sm transition hover:border-ink sm:px-5">Events</Link>
            <Link href="/vipani" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm text-paper transition hover:bg-ink-2 sm:px-5">
              Naattu Vipani <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

        <KeralaScape className="mt-6 h-52 w-full sm:mt-2 sm:h-auto" />
      </section>

      {/* ───────── Ledger ───────── */}
      <section className="mx-auto max-w-6xl px-4">
        <dl className="grid grid-cols-2 border-y border-ink/80 sm:grid-cols-4">
          {site.stats.map((s, i) => (
            <div key={s.label} className={`px-3 py-5 ${i % 2 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""}`}>
              <dt className="font-mono text-[10.5px] tracking-[0.2em] text-muted uppercase">{s.label}</dt>
              <dd className="mt-1 font-serif text-[2.6rem] leading-none tracking-tight">{s.value}</dd>
              <dd className="mt-1 font-ml text-xs text-muted">{s.ml}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ───────── Four doors ───────── */}
      <section className="mx-auto max-w-6xl px-4 pt-24">
        <SectionHead index="01" eyebrow="What we do" title={<>One library, <em>four doors.</em></>} ml="ഒരു ഗ്രന്ഥശാല, നാലു വാതിലുകൾ" />
        <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {doors.map((d, i) => (
            <Link key={d.href} href={d.href} className="group relative flex flex-col bg-card p-5 transition hover:bg-paper sm:min-h-60 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-full border border-ink/15 transition group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                  <d.icon size={19} strokeWidth={1.6} />
                </span>
                <span className="font-mono text-[11px] text-muted">0{i + 1}</span>
              </div>
              <h3 className="mt-auto pt-5 font-serif text-[2rem] leading-none sm:pt-10">{d.title}</h3>
              <p className="mt-1 font-ml text-sm text-muted">{d.ml}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{d.text}</p>
              <ArrowUpRight size={18} className="absolute right-6 bottom-6 opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>

      {/* ───────── New on the shelves ───────── */}
      <section className="pt-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHead index="02" eyebrow="Catalogue" title={<>New on <em>our shelves</em></>} ml="പുതിയ പുസ്തകങ്ങൾ" href="/catalogue" cta="Browse the catalogue" />
        </div>
        <div className="no-scrollbar mx-auto flex max-w-6xl snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pt-2 pb-6">
          {books.slice(0, 8).map((b, i) => (
            <Link key={b.id} href={`/catalogue?q=${encodeURIComponent(b.title)}`} className={`w-64 shrink-0 snap-start transition hover:-translate-y-1 ${i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"}`}>
              <BookCard book={b} className="min-h-48" />
            </Link>
          ))}
        </div>
      </section>

      {/* ───────── Events ───────── */}
      <section className="mx-auto max-w-6xl px-4 pt-20">
        <SectionHead index="03" eyebrow="Coming up" title={<>Events <em>&amp;</em> camps</>} ml="വരാനിരിക്കുന്ന പരിപാടികൾ" href="/events" cta="All events" />
        <div className="grid gap-4 lg:grid-cols-2">
          {events.slice(0, 2).map((e) => <EventTicket key={e.id} e={e} />)}
        </div>
      </section>

      {/* ───────── Classes ───────── */}
      <section className="mx-auto max-w-6xl px-4 pt-24">
        <SectionHead index="04" eyebrow="Learn with us" title={<>Classes for <em>every age</em></>} ml="കല, സംഗീതം, നൃത്തം, യോഗ" href="/classes" cta="All classes" />
        <div className="border-b border-line">
          {classes.slice(0, 4).map((c, i) => <ClassRow key={c.id} c={c} n={i + 1} />)}
        </div>
      </section>

      {/* ───────── Vipani ───────── */}
      <section className="px-3 pt-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-paper-2 px-4 py-12 sm:px-8">
          <InkWash className="pointer-events-none absolute -top-10 -right-40 h-72 w-[720px] opacity-60" tone="clay" seed={11} />
          <div className="relative">
            <SectionHead index="05" eyebrow="ONV Naattu Vipani" title={<>Fresh from <em>our village</em></>} ml="നാട്ടിലെ ഉൽപന്നങ്ങൾ, നാട്ടുകാരിൽ നിന്ന്" href="/vipani" cta="Visit the market" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {auctions.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Library card ───────── */}
      <section className="mx-auto max-w-6xl px-4 pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>06 · Membership</Eyebrow>
            <h2 className="mt-3 font-serif text-5xl leading-[0.98] tracking-tight sm:text-6xl">
              Your card to <em className="text-clay">every shelf.</em>
            </h2>
            <p className="mt-3 font-ml text-muted">അംഗമാകൂ, വായനയുടെ ലോകത്തേക്ക്</p>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-2">
              Borrow books, reserve from home, and get first seats in classes and camps. All you need is your mobile number.
            </p>
            <Link href="/join" className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm text-paper transition hover:bg-clay">
              Get your library card <ArrowRight size={16} />
            </Link>
          </div>

          {/* Membership card mock-up */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-3 rounded-3xl bg-clay/80" />
            <div className="relative aspect-[1.586] -rotate-2 overflow-hidden rounded-3xl bg-ink p-6 text-paper shadow-float transition duration-500 hover:rotate-0">
              <InkWash className="absolute -right-24 -bottom-10 h-48 w-[520px] opacity-50" tone="gold" seed={2} />
              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <LogoIcon white className="h-8 w-auto" />
                  <span className="font-mono text-[10px] tracking-[0.2em] text-paper/60 uppercase">Member · അംഗം</span>
                </div>
                <p className="mt-auto font-ml-serif text-lg">{site.nameMl}</p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-paper/50 uppercase">Card no.</p>
                    <p className="font-mono text-[15px] tracking-[0.2em]">ONV · 0001 · 2026</p>
                  </div>
                  <div aria-hidden="true" className="flex h-9 items-end gap-[2px]">
                    {[3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3].map((w, i) => (
                      <span key={i} className="h-full bg-paper/85" style={{ width: w }} />
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
