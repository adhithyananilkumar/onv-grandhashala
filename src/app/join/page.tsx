import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Library card" };

export default function JoinPage() {
  return (
    <>
      <PageHero eyebrow="Membership" title={<>Get your <em>library card</em></>} ml="അംഗത്വം · മൊബൈൽ നമ്പർ മാത്രം മതി" />
      <div className="mx-auto max-w-md px-4">
        <form className="rounded-[26px] border border-line bg-card/85 p-6 shadow-float backdrop-blur">
          <label htmlFor="phone" className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Mobile number</label>
          <div className="mt-2 flex items-center rounded-2xl border border-line bg-paper focus-within:border-ink">
            <span className="pl-4 font-mono text-ink-2">+91</span>
            <input id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98xxx xxxxx" className="h-14 min-w-0 flex-1 bg-transparent px-3 font-mono text-[16px] tracking-wider focus:outline-none" />
          </div>
          <button type="button" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-paper transition hover:bg-clay">
            Send OTP <ArrowRight size={16} />
          </button>
          <p className="mt-4 text-center font-mono text-[10.5px] text-muted">Phone sign-in arrives in phase 2 (see PLAN.md)</p>
        </form>
      </div>
    </>
  );
}
