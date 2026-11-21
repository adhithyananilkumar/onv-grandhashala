"use client";

import { useCallback, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Search, X } from "lucide-react";
import { ApiError, refreshContent } from "@/lib/api";

/** Run an API call with a busy key, then refresh every screen and show a short message. */
export function useRun() {
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; bad?: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback((msg: string, bad?: boolean) => {
    setToast({ msg, bad });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), bad ? 6000 : 3500);
  }, []);
  const run = useCallback(async <T,>(key: string, fn: () => Promise<T>, okMsg?: string | ((r: T) => string)): Promise<T | undefined> => {
    setBusy(key);
    try {
      const r = await fn();
      refreshContent();
      if (okMsg) show(typeof okMsg === "function" ? okMsg(r) : okMsg);
      return r;
    } catch (e) {
      show((e as ApiError).message ?? "Something went wrong.", true);
      return undefined;
    } finally {
      setBusy(null);
    }
  }, [show]);
  const node = toast ? (
    <div role="status" className={`fixed inset-x-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[90] mx-auto flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 text-[14.5px] shadow-2xl md:bottom-6 ${toast.bad ? "bg-laterite-700 text-mist" : "bg-ink text-mist"}`}>
      {toast.bad ? <AlertCircle size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0 text-kani" />}
      <span className="flex-1">{toast.msg}</span>
      <button onClick={() => setToast(null)} aria-label="Dismiss" className="text-mist/70"><X size={16} /></button>
    </div>
  ) : null;
  return { busy, run, show, toast: node };
}

export function Panel({ title, action, children, className = "" }: { title?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-[24px] bg-card p-4 ring-1 ring-line/70 sm:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-[1.1rem] font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

type BtnTone = "primary" | "ghost" | "danger" | "soft";
const BTN: Record<BtnTone, string> = {
  primary: "bg-royal text-mist hover:bg-royal-700",
  ghost: "ring-2 ring-line text-ink hover:ring-royal",
  danger: "bg-laterite-50 text-laterite-700 hover:bg-laterite hover:text-mist",
  soft: "bg-mist-2 text-ink hover:bg-line",
};

export function Btn({ tone = "primary", busy, icon: I, children, className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: BtnTone; busy?: boolean; icon?: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <button type="button" disabled={busy || p.disabled} {...p}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition active:scale-95 disabled:opacity-50 ${BTN[tone]} ${className}`}>
      {busy ? <span className="size-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" /> : I && <I size={15} />}
      {children}
    </button>
  );
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-mist px-4 ring-2 ring-transparent focus-within:bg-card focus-within:ring-royal">
      <Search size={17} className="shrink-0 text-muted" />
      <span className="sr-only">{placeholder}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="search-bare min-w-0 flex-1 text-[15px] placeholder:text-muted" type="search" />
      {value && <button type="button" onClick={() => onChange("")} aria-label="Clear" className="text-muted"><X size={16} /></button>}
    </label>
  );
}

export function Chips<T extends string>({ options, value, onChange, counts }: { options: readonly T[]; value: T; onChange: (v: T) => void; counts?: Partial<Record<T, number>> }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)} aria-pressed={value === o}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition-colors ${value === o ? "bg-royal text-mist" : "bg-mist-2 text-ink-2 hover:bg-line"}`}>
          {o}{counts?.[o] ? <span className={`ml-1.5 tabular-nums ${value === o ? "text-mist/75" : "text-muted"}`}>{counts[o]}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Stat({ label, value, sub, tone = "bg-card", onClick }: { label: string; value: React.ReactNode; sub?: string; tone?: string; onClick?: () => void }) {
  const C = onClick ? "button" : "div";
  return (
    <C onClick={onClick} className={`rounded-[22px] p-4 text-left ring-1 ring-line/60 transition ${onClick ? "active:scale-[0.98] sm:hover:shadow-lift" : ""} ${tone}`}>
      <p className="text-[12.5px] font-semibold tracking-[0.08em] text-muted uppercase">{label}</p>
      <p className="mt-1 font-display text-[1.7rem] leading-tight font-extrabold tabular-nums">{value}</p>
      {sub && <p className="text-[13px] text-muted">{sub}</p>}
    </C>
  );
}

export function EmptyRow({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-mist px-4 py-6 text-center text-[14.5px] text-muted">{children}</p>;
}

export const inputBox = "h-11 w-full rounded-2xl bg-mist px-3.5 text-[15px] ring-2 ring-transparent placeholder:text-muted focus:bg-card focus:ring-royal focus:outline-none";

export function Labeled({ label, error, hint, children, className = "" }: { label: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[13px] font-semibold text-ink-2">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-[13px] font-medium text-laterite" role="alert">{error}</span> : hint ? <span className="mt-1 block text-[12.5px] text-muted">{hint}</span> : null}
    </label>
  );
}

export const matchText = (q: string, ...fields: (string | undefined)[]) => {
  const t = q.trim().toLowerCase();
  return !t || fields.some((f) => f?.toLowerCase().includes(t));
};
