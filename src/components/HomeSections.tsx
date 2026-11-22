"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/api";
import { BookCard, ClassCard, EventCard, ProductCard, SectionHead } from "./ui";

function Row({ n, className }: { n: number; className: string }) {
  return <>{Array.from({ length: n }, (_, i) => <div key={i} aria-hidden className={`animate-pulse rounded-3xl bg-mist-2 ${className}`} />)}</>;
}

/** Shelves, auctions, events and classes on the home page, loaded from /api/catalog. */
export function HomeSections() {
  const { data, loading } = useCatalog();
  const today = new Date().toISOString().slice(0, 10);
  const books = data?.books.slice(0, 8) ?? [];
  const auctions = data?.products.filter((p) => p.auction) ?? [];
  const events = (data?.events ?? []).filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 2);
  const classes = data?.classes.slice(0, 3) ?? [];

  return (
    <>
      <section className="pt-14 sm:pt-24">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHead title="New on the shelves" ml="പുതിയ പുസ്തകങ്ങൾ" href="/catalogue" cta="All books" />
        </div>
        <ul className="no-scrollbar mx-auto flex max-w-6xl snap-x scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 sm:gap-6">
          {loading && <Row n={6} className="h-[260px] w-[148px] shrink-0 sm:w-[176px]" />}
          {books.map((b) => (
            <li key={b.id} className="w-[148px] shrink-0 snap-start sm:w-[176px]">
              <Link href={`/catalogue/${b.id}`} className="block transition-transform duration-200 hover:-translate-y-1">
                <BookCard book={b} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {(loading || auctions.length > 0) && (
        <section className="mt-10 py-14 [background:linear-gradient(to_bottom,transparent,var(--color-kani-50)_28%,var(--color-kani-50)_72%,transparent)] sm:mt-16 sm:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <SectionHead title="Naattu Vipani auctions" ml="നാട്ടിലെ ഉൽപന്നങ്ങൾ, നാട്ടുകാരിൽ നിന്ന്" href="/vipani" cta="Visit the market" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loading && <Row n={3} className="h-64" />}
              {auctions.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 pt-10 sm:pt-20">
        <SectionHead title="Coming up" ml="വരാനിരിക്കുന്ന പരിപാടികൾ" href="/events" cta="All events" />
        <div className="grid gap-4 lg:grid-cols-2">
          {loading && <Row n={2} className="h-44" />}
          {events.map((e, i) => <EventCard key={e.id} e={e} highlight={i === 0} />)}
          {!loading && !events.length && <p className="rounded-3xl bg-mist-2 p-8 text-center text-muted">No events on the calendar right now.</p>}
        </div>
      </section>

      <section className="mt-10 py-14 [background:linear-gradient(to_bottom,transparent,var(--color-royal-50)_28%,var(--color-royal-50)_72%,transparent)] sm:mt-16 sm:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHead title="Classes this season" ml="കല, സംഗീതം, നൃത്തം, യോഗ" href="/classes" cta="All classes" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading && <Row n={3} className="h-64" />}
            {classes.map((c) => <ClassCard key={c.id} c={c} />)}
          </div>
        </div>
      </section>
    </>
  );
}
