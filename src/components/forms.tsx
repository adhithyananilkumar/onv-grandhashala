"use client";

import { useEffect, useId, useRef } from "react";
import { CheckCircle2, Minus, Plus, X, type LucideIcon } from "lucide-react";

/** Bottom sheet on phones, centred dialog on larger screens. Esc and backdrop close it. */
export function Sheet({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    ref.current?.querySelector<HTMLElement>("input,select,textarea,button[data-autofocus]")?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", key); };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/50 sm:items-center" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="sheet-up max-h-[92svh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-mist p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[28px] sm:p-6"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-line sm:hidden" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl leading-tight font-bold">{title}</h2>
            {subtitle && <p className="text-[15px] text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-full bg-mist-2 hover:bg-line"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: (id: string) => React.ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">{label}</label>
      <div>{children(id)}</div>
      {error ? <p className="mt-1 text-[13.5px] font-medium text-laterite" role="alert">{error}</p> : hint ? <p className="mt-1 text-[13.5px] text-muted">{hint}</p> : null}
    </div>
  );
}

export const inputCls = "h-[52px] w-full rounded-2xl bg-[var(--field,var(--color-mist))] [filter:var(--field-filter,none)] px-4 text-[16.5px] ring-2 ring-transparent transition-all placeholder:text-muted focus:bg-card focus:ring-royal focus:outline-none focus-visible:outline-none";

/** Borderless field: soft fill, optional leading icon, ring only on focus. */
function Shell({ icon: I, children }: { icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="group flex h-[52px] items-center gap-3 rounded-2xl bg-[var(--field,var(--color-mist))] [filter:var(--field-filter,none)] px-4 ring-2 ring-transparent transition-all focus-within:bg-card focus-within:ring-royal">
      {I && <I size={20} className="shrink-0 text-muted transition-colors group-focus-within:text-royal" />}
      {children}
    </div>
  );
}

export function TextInput({ id, icon, className = "", ...p }: React.InputHTMLAttributes<HTMLInputElement> & { id: string; icon?: LucideIcon }) {
  if (!icon) return <input id={id} {...p} className={`${inputCls} ${className}`} />;
  return <Shell icon={icon}><input id={id} {...p} className={`h-full min-w-0 flex-1 bg-transparent text-[16.5px] placeholder:text-muted focus:outline-none focus-visible:outline-none ${className}`} /></Shell>;
}

export function PhoneInput({ id, value, onChange, icon, placeholder = "10-digit number" }: { id: string; value: string; onChange: (v: string) => void; icon?: LucideIcon; placeholder?: string }) {
  return (
    <Shell icon={icon}>
      <span className="text-[16.5px] font-semibold text-ink-2">+91</span>
      <input id={id} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
        className="h-full min-w-0 flex-1 bg-transparent text-[17px] tracking-wide placeholder:text-muted focus:outline-none focus-visible:outline-none" />
    </Shell>
  );
}

export const validPhone = (v: string) => /^[6-9]\d{9}$/.test(v);

export function Stepper({ value, onChange, min = 1, max = 10 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-mist p-1">
      <button type="button" aria-label="Fewer" onClick={() => onChange(Math.max(min, value - 1))} className="grid size-9 place-items-center rounded-full hover:bg-mist-2"><Minus size={16} /></button>
      <span className="w-8 text-center text-[17px] font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" aria-label="More" onClick={() => onChange(Math.min(max, value + 1))} className="grid size-9 place-items-center rounded-full hover:bg-mist-2"><Plus size={16} /></button>
    </div>
  );
}

export function Submit({ children, busy }: { children: React.ReactNode; busy?: boolean }) {
  return (
    <button type="submit" disabled={busy} aria-busy={busy}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-royal py-4 text-[16px] font-semibold text-mist shadow-lift transition-all hover:bg-royal-700 active:scale-[0.99] disabled:opacity-70">
      {busy && <span className="size-4 animate-spin rounded-full border-2 border-mist/40 border-t-mist" aria-hidden />}
      {children}
    </button>
  );
}

/** A red message under a form, for errors the API sends back. */
export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p role="alert" className="rounded-2xl bg-laterite-50 px-4 py-3 text-[14.5px] font-medium text-laterite-700">{children}</p>;
}

/** Boxes for a code or PIN; typing or pasting fills them in order. `mask` shows dots instead of digits. */
export function OtpInput({ value, onChange, label = "6-digit code", mask, autoFocus, length = 6 }: { value: string; onChange: (v: string) => void; label?: string; mask?: boolean; autoFocus?: boolean; length?: number }) {
  return (
    <div className="relative">
      <input
        autoFocus={autoFocus}
        inputMode="numeric"
        autoComplete={mask ? "off" : "one-time-code"}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
        className="peer absolute inset-0 z-10 w-full cursor-text opacity-0"
      />
      {mask ? (
        <div className="flex justify-center gap-3" aria-hidden="true">
          {Array.from({ length }, (_, i) => (
            <div key={i} className={`grid size-[46px] place-items-center rounded-xl bg-card [filter:var(--field-filter)] ring-2 transition-all ${i === value.length ? "ring-royal" : "ring-transparent"}`}>
              <span className={`rounded-full transition-all ${value[i] ? "size-3.5 bg-royal" : "size-1.5 bg-ink/15"}`} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }} aria-hidden="true">
          {Array.from({ length }, (_, i) => (
            <div key={i} className={`grid h-14 place-items-center rounded-2xl bg-card [filter:var(--field-filter)] font-display text-2xl font-bold tabular-nums ring-2 transition-all ${i === value.length ? "ring-royal" : value[i] ? "ring-royal/30" : "ring-transparent"}`}>
              {value[i] ?? ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Shimmering placeholder while data loads. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-2xl bg-mist-2 ${className}`} />;
}

export function Done({ title, reference, text, children }: { title: string; reference: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="sheet-up py-4 text-center" role="status">
      <div className="relative mx-auto grid size-20 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-teal/15 [animation-iteration-count:2]" />
        <span className="absolute inset-0 rounded-full bg-teal-50" />
        <CheckCircle2 size={44} className="relative text-teal" strokeWidth={1.7} />
      </div>
      <p className="mt-4 font-display text-2xl font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-[15.5px] text-ink-2">{text}</p>
      <p className="mx-auto mt-4 w-fit rounded-full border border-dashed border-kani bg-kani-50 px-4 py-1.5 font-mono font-semibold tracking-wider text-kani-700 tabular-nums">Ref {reference}</p>
      {children && <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">{children}</div>}
      <p className="mt-4 text-[13px] text-muted">Preview only. WhatsApp confirmations start when the backend goes live.</p>
    </div>
  );
}

export function Choice({ options, value, onChange, multi }: { options: string[]; value: string | string[]; onChange: (v: string) => void; multi?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2" role={multi ? "group" : "radiogroup"}>
      {options.map((o) => {
        const on = Array.isArray(value) ? value.includes(o) : value === o;
        return (
          <button
            key={o}
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={on}
            onClick={() => onChange(o)}
            className={`rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${on ? "bg-royal text-mist" : "bg-[var(--field,var(--color-mist))] text-ink hover:bg-mist-2 [filter:var(--field-filter,none)]"}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
