"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CreditCard, RotateCw, Share, SquarePlus, WifiOff, X, Zap } from "lucide-react";
import { useSession } from "@/lib/session";
import { LogoMark } from "./Logo";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const SNOOZE_KEY = "onv-install-snooze";
const SNOOZE_DAYS = 7;

const standalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

function snoozed() {
  try { return Date.now() < Number(localStorage.getItem(SNOOZE_KEY) ?? 0); } catch { return false; }
}
function snooze(days = SNOOZE_DAYS) {
  try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + days * 864e5)); } catch { /* private mode: ask again next time */ }
}

/**
 * Registers the service worker (production only) and, once someone is signed in, offers to
 * install the app: the browser's own install prompt where there is one (Android, desktop
 * Chrome and Edge), or Add to Home Screen steps on iPhone and iPad.
 */
export function PwaHost() {
  const { user, ready } = useSession();
  const path = usePathname();
  const deferred = useRef<InstallEvent | null>(null);
  const [canPrompt, setCanPrompt] = useState(false);
  const [open, setOpen] = useState<null | "prompt" | "ios">(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      // A worker left over from a production run would serve stale files in development.
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
      return;
    }
    const register = () => navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); deferred.current = e as InstallEvent; setCanPrompt(true); };
    const onInstalled = () => { deferred.current = null; setCanPrompt(false); setOpen(null); snooze(3650); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  // Signed in, not already installed, not snoozed: ask after a short pause so it never fights the page.
  const signedIn = ready && !!user;
  const onAuthPage = path === "/join" || path === "/offline";
  useEffect(() => {
    if (!signedIn || onAuthPage || standalone() || snoozed()) return;
    const kind = canPrompt ? "prompt" : isIos() ? "ios" : null;
    if (!kind) return;
    const t = setTimeout(() => setOpen(kind), 1400);
    return () => clearTimeout(t);
  }, [signedIn, onAuthPage, canPrompt]);

  const close = () => { snooze(); setOpen(null); };
  const install = async () => {
    const e = deferred.current;
    if (!e) return close();
    await e.prompt();
    const { outcome } = await e.userChoice;
    deferred.current = null; setCanPrompt(false); setOpen(null);
    if (outcome === "dismissed") snooze();
  };

  return open ? <InstallModal ios={open === "ios"} name={user?.name.split(" ")[0]} onInstall={install} onClose={close} /> : null;
}

function InstallModal({ ios, name, onInstall, onClose }: { ios: boolean; name?: string; onInstall: () => void; onClose: () => void }) {
  const primary = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    primary.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", key); };
  }, [onClose]);

  const perks = [
    { icon: Zap, en: "Opens in one tap", ml: "ഒറ്റ ടാപ്പിൽ തുറക്കാം", text: "Straight from your home screen, full screen, no browser bars." },
    { icon: WifiOff, en: "Works offline", ml: "ഇന്റർനെറ്റില്ലാതെയും", text: "Books, classes and events you've seen stay readable without a signal." },
    { icon: CreditCard, en: "Your card, always at hand", ml: "ലൈബ്രറി കാർഡ് കയ്യിൽ", text: "Show your library card at the desk in a second." },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/45 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        onClick={(e) => e.stopPropagation()}
        className="sheet-up relative w-full max-w-[420px] overflow-hidden rounded-t-[32px] bg-card shadow-[0_30px_80px_-20px_rgb(20_30_28/0.55)] sm:rounded-[32px]"
      >
        {/* Header band: the app icon on peacock green with a few gold sparkles. */}
        <div className="relative overflow-hidden bg-royal px-6 pt-8 pb-14 text-center text-mist">
          <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(18rem_10rem_at_20%_0%,rgb(210_154_46/0.35),transparent_70%),radial-gradient(16rem_10rem_at_100%_100%,rgb(255_255_255/0.08),transparent_70%)]" />
          <svg aria-hidden viewBox="0 0 400 120" className="pointer-events-none absolute inset-0 h-full w-full" fill="none" stroke="var(--color-kani)" strokeLinecap="round" strokeWidth="1.6">
            <path className="offline-twinkle" d="M58 30v10M53 35h10" />
            <path className="offline-twinkle [animation-delay:1.1s]" d="M340 26v8M336 30h8" />
            <path className="offline-twinkle [animation-delay:2s]" d="M312 88v6M309 91h6" opacity="0.7" />
            <path d="M-10 112c60-14 120-14 200-2s150 8 220-6" stroke="rgb(255 255 255 / 0.12)" />
          </svg>
          <button type="button" onClick={onClose} aria-label="Not now" className="absolute top-3.5 right-3.5 grid size-9 place-items-center rounded-full bg-white/10 text-mist/90 transition-colors hover:bg-white/20">
            <X size={18} />
          </button>
          <p className="relative text-[12px] font-semibold tracking-[0.2em] text-kani uppercase">{name ? `Welcome, ${name}` : "Welcome"}</p>
        </div>

        <div className="relative -mt-11 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-7">
          <div className="icon-rise mx-auto grid size-[88px] place-items-center rounded-[26px] bg-mist shadow-[0_14px_30px_-10px_rgb(20_30_28/0.45)] ring-4 ring-card">
            <LogoMark className="w-[62px] text-royal" label="ONV Library app icon" />
          </div>
          <h2 id="install-title" className="mt-4 text-center font-display text-[1.65rem] leading-tight font-extrabold tracking-[-0.02em]">Get the ONV Library app</h2>
          <p className="mt-1 text-center font-ml text-[15.5px] text-ink-2">ആപ്പ് ഫോണിൽ ചേർക്കാം</p>
          <p className="mx-auto mt-2 max-w-[18rem] text-center text-[14px] leading-snug text-muted">Free, light on data, and no app store needed.</p>

          <ul className="mt-5 space-y-3">
            {perks.map(({ icon: Icon, en, ml, text }) => (
              <li key={en} className="flex gap-3.5 rounded-2xl bg-mist/70 p-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-royal-50 text-royal"><Icon size={19} strokeWidth={2} /></span>
                <span className="min-w-0">
                  <span className="block text-[15px] leading-tight font-semibold">{en}</span>
                  <span className="block font-ml text-[12.5px] leading-snug text-muted">{ml}</span>
                  <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-2">{text}</span>
                </span>
              </li>
            ))}
          </ul>

          {ios ? (
            <div className="mt-5 rounded-2xl border border-dashed border-kani/60 bg-kani-50/60 p-4">
              <p className="text-[13px] font-semibold tracking-[0.12em] text-kani-700 uppercase">Two taps in Safari</p>
              <ol className="mt-2 space-y-2 text-[14.5px] text-ink">
                <li className="flex items-center gap-2.5"><span className="grid size-7 place-items-center rounded-full bg-card text-[13px] font-bold text-royal">1</span> Tap <Share size={17} className="text-royal" aria-label="Share" /> <b>Share</b> below</li>
                <li className="flex items-center gap-2.5"><span className="grid size-7 place-items-center rounded-full bg-card text-[13px] font-bold text-royal">2</span> Choose <SquarePlus size={17} className="text-royal" aria-hidden /> <b>Add to Home Screen</b></li>
              </ol>
              <button ref={primary} type="button" onClick={onClose} className="mt-4 w-full rounded-full bg-royal py-3.5 text-[16px] font-semibold text-mist transition-colors hover:bg-royal-700 active:scale-[0.99]">Got it</button>
            </div>
          ) : (
            <div className="mt-6 grid gap-2">
              <button ref={primary} type="button" onClick={onInstall} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-royal py-4 text-[16.5px] font-semibold text-mist shadow-lift transition-all hover:bg-royal-700 active:scale-[0.99]">
                <SquarePlus size={19} /> Install the app
              </button>
              <button type="button" onClick={onClose} className="w-full rounded-full py-3 text-[15px] font-semibold text-ink-2 transition-colors hover:text-royal">Not now</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Offline page: try again, and reload by itself as soon as the connection is back. */
export function RetryButton() {
  useEffect(() => {
    const back = () => location.reload();
    window.addEventListener("online", back);
    return () => window.removeEventListener("online", back);
  }, []);
  return (
    <button type="button" onClick={() => location.reload()} className="mt-6 inline-flex items-center gap-2 rounded-full bg-royal px-6 py-3.5 text-[15.5px] font-semibold text-mist shadow-lift transition-all hover:bg-royal-700 active:scale-[0.98]">
      <RotateCw size={17} /> Try again
    </button>
  );
}
