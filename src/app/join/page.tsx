import type { Metadata } from "next";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Sign in" };

export default function JoinPage() {
  return (
    <>
      <PageHero title="Sign in" ml="മൊബൈൽ നമ്പർ ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യൂ">
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-2">
          New here? Signing in with your number creates your library card.
        </p>
      </PageHero>
      <div className="mx-auto max-w-6xl px-5">
        <form className="max-w-md rounded-3xl bg-card p-6 shadow-lift">
          <label htmlFor="phone" className="text-[16px] font-semibold">Mobile number</label>
          <div className="mt-2 flex items-center rounded-2xl border-2 border-line bg-mist transition-colors focus-within:border-royal">
            <span className="pl-4 text-[17px] font-semibold text-ink-2">+91</span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="10-digit number"
              className="h-14 min-w-0 flex-1 bg-transparent px-3 text-[18px] tracking-wide focus:outline-none focus-visible:outline-none"
            />
          </div>
          <button type="button" className="mt-4 w-full rounded-full bg-royal py-3.5 text-[16px] font-semibold text-mist transition-colors hover:bg-royal-700">
            Send code
          </button>
          <p className="mt-3 text-[14px] text-muted">We&apos;ll send a 6-digit code by SMS. Sign-in goes live in the next phase.</p>
        </form>
      </div>
    </>
  );
}
