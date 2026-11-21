"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, KeyRound, LockKeyhole } from "lucide-react";
import { ApiError } from "@/lib/api";
import { login, onAskLogin, useSession } from "@/lib/session";
import { Field, FormError, OtpInput, Sheet, Submit, TextInput } from "./forms";

/**
 * Mounted once in the layout. Anything that needs a signed-in member calls askLogin();
 * this sheet asks for the library number and PIN, then lets the action carry on.
 */
export function LoginHost() {
  const [ask, setAsk] = useState<{ resolve: (ok: boolean) => void; reason?: string } | null>(null);
  const askRef = useRef(ask);
  useEffect(() => { askRef.current = ask; }, [ask]);
  const { user } = useSession();

  useEffect(() => onAskLogin((a) => {
    askRef.current?.resolve(false);
    setAsk(a);
  }), []);

  // Signed in some other way (another tab) while the sheet was open.
  useEffect(() => { if (user && askRef.current) { askRef.current.resolve(true); setAsk(null); } }, [user]);

  if (!ask) return null;
  const close = (ok: boolean) => { ask.resolve(ok); setAsk(null); };
  return (
    <Sheet title="Sign in to continue" subtitle={ask.reason ?? "തുടരാൻ സൈൻ ഇൻ ചെയ്യുക"} onClose={() => close(false)}>
      <LoginForm onDone={() => close(true)} onLeave={() => close(false)} />
    </Sheet>
  );
}

/** Library number + PIN form. Used in the sheet and on /join. */
export function LoginForm({ onDone, onLeave, compact = true }: { onDone?: () => void; onLeave?: () => void; compact?: boolean }) {
  const path = usePathname();
  const [card, setCard] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ card?: string; pin?: string; form?: string }>({});
  const next = encodeURIComponent(path === "/join" ? "/" : path);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = { card: card.length === 4 ? undefined : "Enter the 4 digits after ONV on your card.", pin: pin.length === 4 ? undefined : "Enter your 4-digit PIN." };
    setErrors(er);
    if (er.card || er.pin) return;
    setBusy(true);
    try {
      await login(card, pin);
      onDone?.();
    } catch (err) {
      setPin("");
      const a = err as ApiError;
      setErrors(a.field === "card" ? { card: a.message } : a.field === "pin" ? { pin: a.message } : { form: a.message });
    } finally {
      setBusy(false);
    }
  };

  const link = "font-semibold text-teal underline decoration-teal/30 underline-offset-4 hover:decoration-teal";
  return (
    <form noValidate onSubmit={submit} className="space-y-4 [--field-filter:drop-shadow(0_6px_14px_rgb(42_29_32/0.09))] [--field:var(--color-card)]">
      {compact && (
        <p className="flex items-center gap-2.5 rounded-2xl bg-royal-50 px-4 py-3 text-[14.5px] text-royal">
          <LockKeyhole size={18} className="shrink-0" /> Your bookings, loans and payments are kept on your library card.
        </p>
      )}
      <Field label="Library ID" error={errors.card}>
        {(id) => <TextInput icon={BookOpen} id={id} autoFocus inputMode="numeric" autoComplete="username" placeholder="Library ID · ഐഡി (4 digits)" value={card} onChange={(e) => { setCard(e.target.value.replace(/\D/g, "").slice(0, 4)); setErrors({}); }} />}
      </Field>
      <div>
        <div className="flex items-center gap-4">
          <KeyRound size={22} className="ml-3 shrink-0 text-royal" aria-hidden />
          <div className="flex-1"><OtpInput mask length={4} value={pin} onChange={(v) => { setPin(v); setErrors({}); }} label="4-digit PIN" /></div>
        </div>
        {errors.pin && <p className="mt-1 text-[13.5px] font-medium text-laterite" role="alert">{errors.pin}</p>}
      </div>
      <FormError>{errors.form}</FormError>
      <Submit busy={busy}>{busy ? "Checking…" : "Sign in"}</Submit>
      {compact && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[14.5px] text-muted">
          <span>New here? <Link href={`/join?mode=register&next=${next}`} onClick={onLeave} className={link}>Get a free card</Link></span>
          <Link href={`/join?mode=forgot&next=${next}`} onClick={onLeave} className={link}>Forgot PIN?</Link>
        </div>
      )}
    </form>
  );
}
