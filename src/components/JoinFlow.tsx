"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, BookOpen, IdCard, House, KeyRound, MapPin, MessageCircle, Smartphone, UserRound } from "lucide-react";
import { api, type ApiError } from "@/lib/api";
import { login, register as registerCard, resetPin, useSession } from "@/lib/session";
import { Choice, Field, FormError, OtpInput, PhoneInput, Sheet, Submit, TextInput, validPhone } from "./forms";
import { LogoIcon } from "./Logo";
import { site } from "@/lib/site";

const INTERESTS = ["Books", "Classes", "Events", "Vipani"];
const SUBS = [
  { en: "About you", ml: "നിങ്ങളെക്കുറിച്ച്" },
  { en: "Address", ml: "വിലാസം" },
  { en: "Finish", ml: "പൂർത്തിയാക്കാം" },
];

/** Small bilingual caption above a group of fields. */
function Cap({ en, ml }: { en: string; ml: string }) {
  return <p className="pt-2 text-[13px] font-semibold tracking-[0.1em] text-kani-700 uppercase">{en} <span className="font-ml tracking-normal normal-case">· {ml}</span></p>;
}
/** Standalone page frame for sign-in: logo, back link, centred content. No site nav or footer. */
function AuthShell({ children, wide, full }: { children: React.ReactNode; wide?: boolean; full?: boolean }) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden px-4 py-6 [--field-filter:drop-shadow(0_6px_14px_rgb(42_29_32/0.09))] [--field:var(--color-card)] sm:px-6">
      {/* Soft washes so the fields float on colour, not on a flat page. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 [background:radial-gradient(48rem_32rem_at_12%_8%,var(--color-kani-50),transparent_70%),radial-gradient(44rem_30rem_at_92%_92%,var(--color-royal-50),transparent_70%)]" />
      <div className={`relative mx-auto flex w-full flex-1 flex-col justify-center py-8 ${full ? "max-w-6xl" : wide ? "max-w-lg" : "max-w-md"}`}>
        {children}
        <Link href="/" className="mx-auto mt-4 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-ink-2 hover:text-royal"><ArrowLeft size={16} /> Home</Link>
      </div>
      <p className="relative text-center text-[13px] text-muted">© {new Date().getFullYear()} {site.nameEn}, {site.placeEn}</p>
    </div>
  );
}


type Flow = "signin" | "register" | "forgot";
type Step = "form" | "otp" | "pin";

export function JoinFlow() {
  const params = useSearchParams();
  const router = useRouter();
  const { user: member, ready } = useSession();
  const next = (() => { const n = params.get("next"); return n && n.startsWith("/") && !n.startsWith("//") ? n : null; })();
  const [mode, setMode] = useState<Flow>(params.get("mode") === "register" ? "register" : params.get("mode") === "forgot" ? "forgot" : "signin");
  const [justJoined, setJustJoined] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [sub, setSub] = useState(0);
  const [forgotWhat, setForgotWhat] = useState<"PIN" | "ID">("PIN");
  const [askForgot, setAskForgot] = useState(false);
  const [card, setCard] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [ward, setWard] = useState("");
  const [place, setPlace] = useState("");
  const [ageGroup, setAgeGroup] = useState("18 – 59");
  const [interests, setInterests] = useState<string[]>(["Books"]);
  const [agree, setAgree] = useState(false);
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // Signed in (now or already): carry on to where they were going.
  useEffect(() => {
    if (ready && member) router.replace(next ?? (justJoined ? "/me/card" : "/"));
  }, [ready, member, next, justJoined, router]);

  const fieldError = (e: unknown, fallback = "form") => { const x = e as ApiError; setErrors({ [x.field ?? fallback]: x.message }); };

  const reset = (m: Flow) => { setMode(m); setSub(0); setStep("form"); setErrors({}); setOtp(""); setPin(""); setPin2(""); };
  const switchMode = (m: Flow) => { reset(m); const q = new URLSearchParams(); if (m !== "signin") q.set("mode", m); if (next) q.set("next", next); router.replace(`/join${q.size ? `?${q}` : ""}`, { scroll: false }); };

  /** Form step: sign in checks the PIN; register moves through its sections; forgot sends a code. */
  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string | undefined> = {};
    if (mode === "signin") {
      er.card = card.length === 4 ? undefined : "Enter the 4 digits after ONV on your card.";
      er.pin = pin.length === 4 ? undefined : "Enter your 4-digit PIN.";
      setErrors(er);
      if (er.card || er.pin) return;
      setBusy(true);
      try { await login(card, pin); } catch (err) { setPin(""); fieldError(err); }
      setBusy(false);
      return;
    }
    if (mode === "forgot") {
      er.phone = validPhone(phone) ? undefined : "Enter your 10-digit mobile number.";
      if (forgotWhat === "PIN") er.card = card.length === 4 ? undefined : "Enter the 4 digits of your library number.";
      setErrors(er);
      if (er.card || er.phone) return;
      setBusy(true);
      try { await api("/api/auth/forgot", { body: { phone, card: forgotWhat === "PIN" ? card : undefined } }); setStep("otp"); }
      catch (err) { fieldError(err, "phone"); }
      setBusy(false);
      return;
    }
    if (sub === 0) {
      er.name = name.trim().length < 2 ? "Please enter your full name." : undefined;
      er.phone = validPhone(phone) ? undefined : "Enter a 10-digit mobile number.";
    }
    if (sub === 1) {
      er.ward = ward.trim().length < 2 ? "Add your house name." : undefined;
      er.place = place.trim().length < 2 ? "Add your place and ward." : undefined;
    }
    if (sub === 2) er.agree = agree ? undefined : "Please agree to the library rules.";
    setErrors(er);
    if (Object.values(er).some(Boolean)) return;
    if (sub < SUBS.length - 1) { setSub(sub + 1); return; }
    setStep("otp");
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setErrors({ otp: "Enter all 6 digits." }); return; }
    if (mode === "forgot") {
      try { const r = await api<{ card: string | null }>("/api/auth/verify", { body: { phone, otp } }); if (r.card) setCard(r.card.match(/\d{4}/)?.[0] ?? ""); }
      catch (err) { fieldError(err, "otp"); return; }
    }
    setErrors({}); setPin(""); setPin2(""); setStep("pin");
  };

  const savePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) { setErrors({ pin: "Choose a 4-digit PIN." }); return; }
    if (/^(\d)\1+$/.test(pin) || "0123456789876543210".includes(pin)) { setErrors({ pin: "Too easy to guess. Avoid 11111 or 12345." }); return; }
    if (pin !== pin2) { setErrors({ pin2: "The two PINs don't match." }); return; }
    setBusy(true);
    try {
      if (mode === "forgot") await resetPin(phone, otp, pin);
      else { setJustJoined(true); await registerCard({ name, phone, house: ward, place, ageGroup, interests, otp, pin }); }
    } catch (err) {
      setJustJoined(false);
      const x = err as ApiError;
      // A taken number goes back to the first step so it can be changed.
      if (x.field === "phone" || x.field === "name") { setStep("form"); setSub(0); }
      if (x.field === "otp") setStep("otp");
      fieldError(err, "pin");
    }
    setBusy(false);
  };

  if (!ready || member) return <div className="grid min-h-svh place-items-center"><span className="size-8 animate-spin rounded-full border-4 border-royal/20 border-t-royal" aria-label="Loading" /></div>;

  const register = mode === "register";
  const forgot = mode === "forgot";
  const heading = forgot ? ["Forgot your PIN or ID?", "പിൻ / ഐഡി മറന്നോ?", forgotWhat === "PIN" ? "Enter your ID and phone number. We'll send a code." : "Enter your phone number. We'll find your ID."]
    : register ? ["Create your library card", "ലൈബ്രറി കാർഡ് എടുക്കാം", "Free for everyone in the village."]
    : ["Welcome back", "സ്വാഗതം", "Your library number and PIN, please."];
  const link = "font-semibold text-teal underline decoration-teal/30 underline-offset-4 hover:decoration-teal";

  return (
    <AuthShell wide={register}>
      <div>
        <div className="mb-9 text-center">
          <Link href="/" className="mx-auto mb-6 flex w-fit" aria-label={`${site.nameEn}, home`}>
            <LogoIcon className="h-14 w-auto" />
          </Link>
          <h1 className="font-display text-[2.2rem] leading-[1.1] font-extrabold tracking-[-0.025em] text-balance">{heading[0]}</h1>
          <p className="mt-2 font-ml text-[1.15rem] text-ink-2">{heading[1]}</p>
          <p className="mx-auto mt-3 max-w-xs text-[14.5px] leading-snug text-muted">{heading[2]}</p>
        </div>
        {step === "form" && !forgot && (
          <div role="tablist" aria-label="Sign in or create a card" className="mx-auto mb-7 grid max-w-xs grid-cols-2 rounded-full bg-card p-1 [filter:var(--field-filter)]">
            {([["signin", "Sign in"], ["register", "Create card"]] as const).map(([m, l]) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => mode !== m && switchMode(m)}
                className={`rounded-full py-2.5 text-[15px] font-semibold transition-colors ${mode === m ? "bg-royal text-mist" : "text-ink-2 hover:text-royal"}`}>{l}</button>
            ))}
          </div>
        )}
        <div>
          {step === "form" && (
            <form noValidate onSubmit={submitForm} className="sheet-up space-y-4" key={`${mode}-${sub}`}>
              {register && (
                <div className="flex gap-2" aria-hidden>
                  {SUBS.map((s, i) => <span key={s.en} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= sub ? "bg-royal" : "bg-line"}`} />)}
                </div>
              )}

              {(mode === "signin" || (forgot && forgotWhat === "PIN")) && (
                <Field label="Library ID" error={errors.card}>
                  {(id) => <TextInput icon={IdCard} id={id} inputMode="numeric" autoComplete="off" placeholder="Library ID · ഐഡി" value={card} onChange={(e) => setCard(e.target.value.replace(/\D/g, "").slice(0, 4))} />}
                </Field>
              )}
              {mode === "signin" && (
                <Field label="PIN" error={errors.pin}>
                  {(id) => <TextInput icon={KeyRound} id={id} type="text" inputMode="numeric" autoComplete="off" placeholder="PIN · പിൻ" maxLength={4} value={pin} className="[-webkit-text-security:disc]" onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setErrors((x) => ({ ...x, pin: undefined })); }} />}
                </Field>
              )}
              {forgot && (
                <Field label="Mobile number" error={errors.phone} hint="The number you joined with. We'll send a code. · ഫോൺ നമ്പർ">
                  {(id) => <PhoneInput icon={Smartphone} id={id} value={phone} onChange={setPhone} placeholder="Mobile · ഫോൺ നമ്പർ" />}
                </Field>
              )}

              {register && sub === 0 && (
                <>
                  <Field label="Full name" error={errors.name}>{(id) => <TextInput icon={UserRound} id={id} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Full name · പൂർണ്ണ നാമം" />}</Field>
                  <Field label="Mobile number" error={errors.phone} hint="We'll verify it with a code. · ഫോൺ നമ്പർ">
                    {(id) => <PhoneInput icon={Smartphone} id={id} value={phone} onChange={setPhone} placeholder="Mobile · ഫോൺ നമ്പർ" />}
                  </Field>
                </>
              )}
              {register && sub === 1 && (
                <>
                  <Field label="House name" error={errors.ward}>{(id) => <TextInput icon={House} id={id} value={ward} onChange={(e) => setWard(e.target.value)} autoComplete="address-line1" placeholder="House name · വീട്ടുപേര്" />}</Field>
                  <Field label="Place and ward" error={errors.place}>{(id) => <TextInput icon={MapPin} id={id} value={place} onChange={(e) => setPlace(e.target.value)} autoComplete="address-line2" placeholder="Place, ward · സ്ഥലം, വാർഡ്" />}</Field>
                </>
              )}
              {register && sub === 2 && (
                <>
                  <Cap en="Age group" ml="പ്രായം" />
                  <Field label="Age group">{() => <Choice options={["Under 18", "18 – 59", "60 and above"]} value={ageGroup} onChange={setAgeGroup} />}</Field>
                  <Cap en="Interested in" ml="താൽപര്യം" />
                  <Field label="I'm interested in">{() => <Choice multi options={INTERESTS} value={interests} onChange={(v) => setInterests((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))} />}</Field>
                  <label className="flex items-start gap-3 rounded-2xl bg-card p-3.5 [filter:var(--field-filter)] text-[14.5px] text-ink-2">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--color-royal)]" />
                    <span>I agree to the library rules: return books in 14 days, and look after them as my own.<span className="mt-0.5 block font-ml text-[14px] text-muted">പുസ്തകങ്ങൾ 14 ദിവസത്തിനകം തിരികെ നൽകാം.</span>{errors.agree && <span className="mt-1 block font-medium text-laterite" role="alert">{errors.agree}</span>}</span>
                  </label>
                </>
              )}

              <FormError>{errors.form}</FormError>
              <Submit busy={busy}>{busy ? "Checking…" : mode === "signin" ? "Sign in" : forgot ? "Send code" : sub < SUBS.length - 1 ? "Continue" : "Verify my number"}</Submit>
              {register && sub > 0 && (
                <button type="button" onClick={() => { setErrors({}); setPin(""); setSub(sub - 1); }} className="mx-auto flex items-center gap-1.5 text-[15px] font-semibold text-ink-2 hover:text-royal"><ArrowLeft size={16} /> Back</button>
              )}
              {mode === "signin" && (
                <p className="text-center text-[14.5px] text-muted">Forgot your PIN or ID? <button type="button" onClick={() => setAskForgot(true)} className={link}>Reset it</button></p>
              )}
              {forgot && (
                <p className="text-center text-[14.5px] text-muted">
                  Remembered it? <button type="button" onClick={() => switchMode("signin")} className={link}>Sign in</button>
                </p>
              )}
            </form>
          )}

          {step === "otp" && (
            <form noValidate onSubmit={verifyCode} className="sheet-up space-y-5">
              <button type="button" onClick={() => { setStep("form"); setOtp(""); setErrors({}); }} className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink-2 hover:text-royal"><ArrowLeft size={17} /> Change number</button>
              <div>
                <h2 className="font-display text-2xl font-bold">Enter the code</h2>
                <p className="text-[15px] text-ink-2">Sent by SMS to <span className="font-semibold">+91 {phone.slice(0, 5)} {phone.slice(5)}</span></p>
              </div>
              <OtpInput autoFocus value={otp} onChange={(v) => { setOtp(v); setErrors({}); }} />
              {errors.otp && <p className="text-[13.5px] font-medium text-laterite" role="alert">{errors.otp}</p>}
              <Submit>Verify</Submit>
              <p className="flex items-center justify-center gap-2 text-[14px] text-muted"><MessageCircle size={15} /> Preview: any 6 digits will work until SMS goes live.</p>
            </form>
          )}

          {step === "pin" && (
            <form noValidate onSubmit={savePin} className="sheet-up space-y-5">
              <div className="text-center">
                <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-card text-royal [filter:var(--field-filter)]"><KeyRound size={22} /></span>
                <h2 className="font-display text-2xl font-bold">{forgot ? "Choose a new PIN" : "Choose a PIN"}</h2>
                <p className="font-ml text-[16px] text-ink-2">നിങ്ങളുടെ 4 അക്ക പിൻ</p>
                {forgot && forgotWhat === "ID" && <p className="mx-auto mt-3 w-fit rounded-full bg-card px-4 py-1.5 text-[15px] font-semibold text-royal [filter:var(--field-filter)]">Your ID: {card}</p>}
                <p className="mt-2 text-[15px] text-ink-2">You&apos;ll sign in with your library number and this PIN.</p>
              </div>
              <div>
                <Cap en="PIN" ml="പിൻ" />
                <div className="mt-2"><OtpInput autoFocus mask length={4} value={pin} onChange={(v) => { setPin(v); setErrors({}); }} label="Choose a 4-digit PIN" /></div>
                {errors.pin && <p className="mt-1 text-[13.5px] font-medium text-laterite" role="alert">{errors.pin}</p>}
              </div>
              <div>
                <Cap en="Type it again" ml="വീണ്ടും" />
                <div className="mt-2"><OtpInput mask length={4} value={pin2} onChange={(v) => { setPin2(v); setErrors({}); }} label="Repeat the PIN" /></div>
                {errors.pin2 && <p className="mt-1 text-[13.5px] font-medium text-laterite" role="alert">{errors.pin2}</p>}
              </div>
              <FormError>{errors.form}</FormError>
              <Submit busy={busy}>{busy ? "Saving…" : forgot ? "Save PIN and sign in" : "Get my library card"}</Submit>
            </form>
          )}
        </div>
      </div>
      {askForgot && (
        <Sheet title="I forgot my…" subtitle="എന്താണ് മറന്നത്?" onClose={() => setAskForgot(false)}>
          <div className="grid gap-3">
            {([["PIN", "I know my ID, but not my PIN", "പിൻ"], ["ID", "I don't remember my library number", "ഐഡി"]] as const).map(([k, d, ml]) => (
              <button key={k} type="button" onClick={() => { setForgotWhat(k); reset("forgot"); setAskForgot(false); }}
                className="flex items-center gap-4 rounded-2xl bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-royal-50 text-royal">{k === "PIN" ? <KeyRound size={22} /> : <BookOpen size={22} />}</span>
                <span>
                  <span className="block font-display text-[1.15rem] font-bold">{k} <span className="font-ml text-[15px] font-normal text-muted">· {ml}</span></span>
                  <span className="block text-[14px] text-muted">{d}</span>
                </span>
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </AuthShell>
  );
}
