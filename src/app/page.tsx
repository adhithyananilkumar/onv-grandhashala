import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { quotes } from "@/lib/quotes";
import { site } from "@/lib/site";
import { HeroStage } from "@/components/HeroStage";
import { HeroQuotes } from "@/components/HeroQuotes";
import { HomeSections } from "@/components/HomeSections";
import { MemberHome } from "@/components/MemberHome";
import { GuestOnly, MemberOnly } from "@/components/AuthGate";
import { BooksLamp, Chenda, PalmMarket, SnakeBoat } from "@/components/Paintings";
import { SectionHead } from "@/components/ui";

const sections = [
  { href: "/catalogue", Art: BooksLamp, cta: "Find a book", title: "Books", ml: "പുസ്തകങ്ങൾ", text: "Malayalam classics, children's books and PSC guides. Search the shelves and reserve from your phone." },
  { href: "/classes", Art: Chenda, cta: "See classes", title: "Classes", ml: "ക്ലാസുകൾ", text: "Carnatic music, Bharatanatyam, drawing, yoga, PSC coaching and computer basics, taught by people from the village." },
  { href: "/events", Art: SnakeBoat, cta: "See events", title: "Events and camps", ml: "പരിപാടികൾ", text: "Eye and health check-ups, holiday camps for children, and poetry evenings in memory of ONV." },
  { href: "/vipani", Art: PalmMarket, cta: "Visit the market", title: "Naattu Vipani", ml: "നാട്ടു വിപണി", text: "Coconut oil, banana chips, handwoven mundu and fresh produce from local growers. Order, or bid in an auction." },
];

export default function Home() {
  return (
    <>
      {/* Signed-in members: an app home (greeting, loans, dues, shortcuts) instead of the hero. */}
      <MemberOnly>
        <MemberHome />
      </MemberOnly>

      {/* Visitors: the hero and what the library offers. */}
      <GuestOnly>
        <section className="overflow-x-clip">
          <HeroStage>
            <h1 className="sr-only">{site.nameMl}, {site.nameEn}, {site.placeEn}</h1>
            <HeroQuotes quotes={quotes} />
          </HeroStage>
        </section>

        <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-24">
          <SectionHead title="What you can do here" ml="ഗ്രന്ഥശാലയിൽ എന്തെല്ലാം" />
          <ul className="space-y-4 sm:space-y-6">
            {sections.map((s, i) => (
              <li key={s.href}>
                <Link href={s.href} className="group grid overflow-hidden rounded-3xl bg-mist-2 transition-shadow duration-300 hover:shadow-lift md:grid-cols-2">
                  <div className={`relative h-52 overflow-hidden sm:h-64 md:h-80 ${i % 2 ? "md:order-2" : ""}`}>
                    <s.Art className="art-fade h-full w-full transition-transform duration-700 group-hover:scale-[1.03]" />
                  </div>
                  <div className="flex flex-col justify-center p-6 sm:p-10">
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

        <HomeSections />
      </GuestOnly>
    </>
  );
}
