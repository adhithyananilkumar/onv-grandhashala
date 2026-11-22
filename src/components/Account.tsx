"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen, Check, CheckCircle2, Clock3, Copy, CreditCard, KeyRound, Landmark,
  LogOut, Receipt, Smartphone, UserRound, Wallet, X,
} from "lucide-react";
import { api, ApiError, invalidate, useApi } from "@/lib/api";
import { logout, updateSessionUser, useSession } from "@/lib/session";
import { fine, fmtShort, inr, PAYMENT_LABEL, paymentTone, Pill } from "@/lib/format";
import type { MemberSummary, Payment, User } from "@/lib/types";
import { Choice, Field, FormError, OtpInput, PhoneInput, Sheet, Skeleton, Submit, TextInput } from "./forms";
import { LibraryCard } from "./LibraryCard";
import { LoginForm } from "./LoginSheet";
import { PageHero } from "./ui";
import type { SceneSet } from "./Scene";

/** The member's own pages, each at its own address. */
export type AccountSection = "payments" | "card" | "profile";

const BANNERS: Record<AccountSection, { title: string; ml: string; art: SceneSet }> = {
  payments: { title: "Payments", ml: "പണമടയ്ക്കൽ", art: "home" },
  card: { title: "Library card", ml: "ലൈബ്രറി കാർഡ്", art: "books" },
  profile: { title: "Profile & PIN", ml: "പ്രൊഫൈൽ", art: "join" },
};

export function AccountPage({ section }: { section: AccountSection }) {
  const { user, ready } = useSession();
  const { data, error, loading } = useApi<MemberSummary>(user ? "/api/me" : null);
  const b = BANNERS[section];

  return (
    <>
      <PageHero title={b.title} ml={b.ml} art={b.art} compact />
      <div className="mx-auto mt-6 max-w-6xl px-4 pb-10 sm:mt-8 sm:px-5" key={section}>
        {!ready ? (
          <div className="space-y-3"><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
        ) : !user ? (
          <div className="max-w-md rounded-[28px] bg-card p-5 ring-1 ring-line/70 sm:p-6">
            <p className="mb-4 text-[15px] text-ink-2">Sign in to see your payments, card and profile.</p>
            <LoginForm />
          </div>
        ) : (
          <>
            {error && <FormError>{error.message}</FormError>}
            {loading || !data ? (
              <div className="space-y-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
            ) : section === "payments" ? <PaymentsTab d={data} />
              : section === "card" ? <CardTab u={data.user} />
              : <ProfileTab u={data.user} />}
          </>
        )}
      </div>
    </>
  );
}

/* ───────── shared bits ───────── */

function H({ children, count }: { children: React.ReactNode; count?: number }) {
  return <h2 className="mt-7 mb-3 flex items-center gap-2 font-display text-lg font-bold first:mt-0">{children}{count !== undefined && <span className="text-[14px] font-semibold text-muted">{count}</span>}</h2>;
}

function Empty({ icon: I, text, href, cta }: { icon: typeof BookOpen; text: string; href?: string; cta?: string }) {
  return (
    <div className="grid place-items-center rounded-3xl border-2 border-dashed border-line px-6 py-10 text-center">
      <I size={26} className="text-muted" />
      <p className="mt-2 max-w-xs text-[15px] text-muted">{text}</p>
      {href && <Link href={href} className="mt-4 rounded-full bg-royal px-5 py-2.5 text-[14.5px] font-semibold text-mist">{cta}</Link>}
    </div>
  );
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div role="status" className="fixed inset-x-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-[14.5px] text-mist shadow-2xl md:bottom-6">
      <CheckCircle2 size={18} className="shrink-0 text-kani" /> <span className="flex-1">{msg}</span>
      <button onClick={onClose} aria-label="Dismiss" className="text-mist/70"><X size={16} /></button>
    </div>
  );
}

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const show = (m: string) => { setMsg(m); setTimeout(() => setMsg((x) => (x === m ? null : x)), 3500); };
  return { show, node: msg ? <Toast msg={msg} onClose={() => setMsg(null)} /> : null };
}

/* ───────── Payments ───────── */

function PaymentsTab({ d }: { d: MemberSummary }) {
  const toast = useToast();
  const [paying, setPaying] = useState<Payment | null>(null);
  const due = d.payments.filter((p) => p.status === "due");
  const checking = d.payments.filter((p) => p.status === "verifying");
  const done = d.payments.filter((p) => p.status === "paid" || p.status === "waived");
  const running = d.loans.filter((l) => !l.returnedAt && fine(l, d.finePerDay) > 0);
  const total = due.reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <div className="rounded-[28px] bg-royal p-5 text-mist">
        <p className="text-[14px] text-mist/70">To pay now</p>
        <p className="font-display text-[2.4rem] leading-tight font-extrabold tabular-nums">{inr(total)}</p>
        <p className="text-[13.5px] text-mist/70">{due.length ? `${due.length} ${due.length === 1 ? "item" : "items"} · UPI or cash at the desk` : "You're all paid up. Thank you!"}</p>
      </div>

      {running.length > 0 && (
        <p className="mt-4 rounded-2xl bg-laterite-50 px-4 py-3 text-[14px] text-laterite-700">
          Late fines still growing on {running.map((l) => l.title).join(", ")}: {inr(running.reduce((s, l) => s + fine(l, d.finePerDay), 0))} so far. They are billed when the book comes back.
        </p>
      )}

      <H count={due.length}>Due</H>
      {due.length ? (
        <ul className="space-y-2.5">
          {due.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-3xl bg-card p-4 ring-1 ring-line/70">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-laterite-50 text-laterite-700"><Receipt size={20} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.title}</p>
                <p className="text-[13px] text-muted">{p.kind} · {fmtShort(p.createdAt)}{p.method === "Desk" ? " · paying at desk" : ""}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold tabular-nums">{inr(p.amount)}</p>
                <button onClick={() => setPaying(p)} className="mt-0.5 rounded-full bg-royal px-4 py-1.5 text-[13.5px] font-semibold text-mist active:scale-95">Pay</button>
              </div>
            </li>
          ))}
        </ul>
      ) : <Empty icon={Wallet} text="Nothing to pay." />}

      {checking.length > 0 && (
        <>
          <H count={checking.length}>Being checked</H>
          <ul className="space-y-2.5">
            {checking.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-3xl bg-kani-50 p-4">
                <Clock3 size={20} className="shrink-0 text-kani-700" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.title}</p>
                  <p className="text-[13px] text-ink-2">UPI ref {p.utr} · the desk confirms within a day</p>
                </div>
                <p className="font-display font-bold tabular-nums">{inr(p.amount)}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      {done.length > 0 && (
        <>
          <H count={done.length}>History</H>
          <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-card ring-1 ring-line/70">
            {done.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.title}</span>
                  <span className="text-[13px] text-muted">{p.id} · {fmtShort(p.paidAt ?? p.createdAt)}{p.method ? ` · ${p.method}` : ""}</span>
                </span>
                <span className="text-right">
                  <span className="block font-semibold tabular-nums">{inr(p.amount)}</span>
                  <Pill tone={paymentTone(p.status)}>{PAYMENT_LABEL[p.status]}</Pill>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      {paying && <PaySheet p={paying} upi={d.upi} onClose={() => setPaying(null)} onDone={(m) => { setPaying(null); toast.show(m); }} />}
      {toast.node}
    </>
  );
}

const UPI_APPS = [
  { name: "Google Pay", short: "GPay", bg: "bg-[#fff] ring-1 ring-line", fg: "text-[#1a73e8]" },
  { name: "PhonePe", short: "PhonePe", bg: "bg-[#5f259f]", fg: "text-white" },
  { name: "Paytm", short: "Paytm", bg: "bg-[#00baf2]", fg: "text-white" },
  { name: "BHIM / any UPI", short: "BHIM", bg: "bg-[#f37021]", fg: "text-white" },
];

/** Pay one item: open a UPI app, then enter the UTR; or choose to pay at the desk. */
function PaySheet({ p, upi, onClose, onDone }: { p: Payment; upi: MemberSummary["upi"]; onClose: () => void; onDone: (msg: string) => void }) {
  const [how, setHow] = useState<"upi" | "desk">("upi");
  const [step, setStep] = useState<"choose" | "utr">("choose");
  const [utr, setUtr] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const [copied, setCopied] = useState(false);
  const link = `upi://pay?pa=${encodeURIComponent(upi.id)}&pn=${encodeURIComponent(upi.name)}&am=${p.amount}&cu=INR&tn=${encodeURIComponent(`${p.id} ${p.title}`.slice(0, 60))}`;

  const send = async (body: Record<string, unknown>, msg: string) => {
    setBusy(true); setErr(undefined);
    try { await api(`/api/payments/${p.id}/pay`, { body }); invalidate("/api/me", "/api/admin"); onDone(msg); }
    catch (e) { setErr((e as ApiError).message); }
    finally { setBusy(false); }
  };

  return (
    <Sheet title={`Pay ${inr(p.amount)}`} subtitle={p.title} onClose={onClose}>
      {step === "choose" ? (
        <div className="space-y-4">
          <Choice options={["UPI", "At the desk"]} value={how === "upi" ? "UPI" : "At the desk"} onChange={(v) => setHow(v === "UPI" ? "upi" : "desk")} />
          {how === "upi" ? (
            <>
              <div className="grid grid-cols-4 gap-2">
                {UPI_APPS.map((a) => (
                  <a key={a.name} href={link} onClick={() => setTimeout(() => setStep("utr"), 400)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl p-2 text-center active:bg-mist-2">
                    <span className={`grid size-12 place-items-center rounded-2xl text-[11px] font-extrabold ${a.bg} ${a.fg}`}>{a.short}</span>
                    <span className="text-[12px] leading-tight font-medium">{a.name}</span>
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-line/70">
                <Landmark size={18} className="shrink-0 text-royal" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] text-muted">Or pay to UPI ID</span>
                  <span className="block truncate font-mono font-semibold">{upi.id}</span>
                </span>
                <button type="button" onClick={() => { navigator.clipboard?.writeText(upi.id).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => undefined); }}
                  className="inline-flex items-center gap-1 rounded-full bg-mist-2 px-3 py-1.5 text-[13px] font-semibold">
                  {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
              <button type="button" onClick={() => setStep("utr")} className="w-full rounded-full border-2 border-royal py-3 font-semibold text-royal">I&apos;ve paid, enter reference</button>
              <p className="text-center text-[12.5px] text-muted">Mock payments: nothing is charged. The desk confirms the reference.</p>
            </>
          ) : (
            <>
              <p className="rounded-2xl bg-mist-2 px-4 py-3 text-[14.5px] text-ink-2">Pay cash at the counter next time you visit. Show reference <b className="font-mono">{p.id}</b>; the librarian marks it paid.</p>
              <FormError>{err}</FormError>
              <button onClick={() => send({ method: "Desk" }, "Noted. Pay at the desk when you visit.")} disabled={busy}
                className="w-full rounded-full bg-royal py-4 font-semibold text-mist disabled:opacity-70">I&apos;ll pay at the desk</button>
            </>
          )}
        </div>
      ) : (
        <form noValidate className="space-y-4" onSubmit={(e) => { e.preventDefault(); send({ method: "UPI", utr }, "Thanks! The desk will confirm your payment."); }}>
          <p className="text-[14.5px] text-ink-2">Open your UPI app&apos;s history and type the 12-digit <b>UTR / UPI reference</b> for this payment.</p>
          <OtpInput autoFocus length={12} value={utr} onChange={setUtr} label="12-digit UPI reference" />
          <FormError>{err}</FormError>
          <Submit busy={busy}>Submit reference</Submit>
          <button type="button" onClick={() => setStep("choose")} className="mx-auto block text-[14.5px] font-semibold text-ink-2">Back</button>
        </form>
      )}
    </Sheet>
  );
}

/* ───────── Card ───────── */

function CardTab({ u }: { u: User }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
      <div className="max-w-md">
        <LibraryCard name={u.name} cardNo={u.card} since={u.since} />
        <p className="mt-3 text-[14px] text-muted">Show this at the desk to borrow books.</p>
      </div>
      <dl className="divide-y divide-line overflow-hidden rounded-3xl bg-card ring-1 ring-line/70">
        {[["Library number", u.card], ["Member since", u.since], ["Mobile", `+91 ${u.phone.slice(0, 5)} ${u.phone.slice(5)}`], ["Address", u.ward ?? "—"], ["Account", u.role === "admin" ? "Library staff" : "Member"]].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 px-4 py-3"><dt className="text-[14px] text-muted">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
        ))}
      </dl>
    </div>
  );
}

/* ───────── Profile ───────── */

const INTERESTS = ["Books", "Classes", "Events", "Vipani"];

function ProfileTab({ u }: { u: User }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(u.name);
  const [phone, setPhone] = useState(u.phone);
  const [email, setEmail] = useState(u.email ?? "");
  const [ward, setWard] = useState(u.ward ?? "");
  const [interests, setInterests] = useState<string[]>(u.interests ?? []);
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState<Record<string, string | undefined>>({});
  const [pinOpen, setPinOpen] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErrs({});
    try {
      const { user } = await api<{ user: User }>("/api/auth/me", { method: "PATCH", body: { name, phone, email, ward, interests } });
      updateSessionUser(user); invalidate("/api/me"); toast.show("Profile saved.");
    } catch (er) {
      const a = er as ApiError; setErrs({ [a.field ?? "form"]: a.message });
    } finally { setBusy(false); }
  };

  return (
    <>
      <form noValidate onSubmit={save} className="space-y-3.5 rounded-[28px] bg-card p-5 ring-1 ring-line/70 [--field:var(--color-mist)]">
        <h2 className="font-display text-lg font-bold">Your details</h2>
        <Field label="Full name" error={errs.name}>{(id) => <TextInput icon={UserRound} id={id} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" />}</Field>
        <Field label="Mobile" error={errs.phone}>{(id) => <PhoneInput icon={Smartphone} id={id} value={phone} onChange={setPhone} />}</Field>
        <Field label="Email (optional)">{(id) => <TextInput icon={CreditCard} id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" autoComplete="email" />}</Field>
        <Field label="House, place and ward">{(id) => <TextInput icon={Landmark} id={id} value={ward} onChange={(e) => setWard(e.target.value)} placeholder="House, place, ward" />}</Field>
        <p className="pt-1 text-[13px] font-semibold tracking-[0.1em] text-kani-700 uppercase">Interested in</p>
        <Choice multi options={INTERESTS} value={interests} onChange={(v) => setInterests((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))} />
        <FormError>{errs.form}</FormError>
        <Submit busy={busy}>Save changes</Submit>
      </form>

      <div className="mt-4 divide-y divide-line overflow-hidden rounded-[28px] bg-card ring-1 ring-line/70">
        <button onClick={() => setPinOpen(true)} className="flex w-full items-center gap-4 px-5 py-4 text-left active:bg-mist">
          <KeyRound size={20} className="text-royal" /> <span className="flex-1 font-semibold">Change PIN</span>
        </button>
        <button onClick={async () => { await logout(); router.push("/"); }} className="flex w-full items-center gap-4 px-5 py-4 text-left font-semibold text-laterite-700 active:bg-laterite-50">
          <LogOut size={20} /> Sign out
        </button>
      </div>
      {pinOpen && <PinSheet onClose={() => setPinOpen(false)} onDone={() => { setPinOpen(false); toast.show("PIN changed."); }} />}
      {toast.node}
    </>
  );
}

function PinSheet({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [current, setCurrent] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (current.length !== 4 || pin.length !== 4) return setErr("Enter all 4 digits.");
    if (pin !== pin2) return setErr("The two new PINs don't match.");
    setBusy(true); setErr(undefined);
    try { await api("/api/auth/pin", { body: { current, pin } }); onDone(); }
    catch (er) { setErr((er as ApiError).message); }
    finally { setBusy(false); }
  };
  return (
    <Sheet title="Change PIN" subtitle="പിൻ മാറ്റുക" onClose={onClose}>
      <form noValidate onSubmit={submit} className="space-y-4">
        <div><p className="mb-2 text-[14px] font-semibold">Current PIN</p><OtpInput autoFocus mask length={4} value={current} onChange={setCurrent} label="Current PIN" /></div>
        <div><p className="mb-2 text-[14px] font-semibold">New PIN</p><OtpInput mask length={4} value={pin} onChange={setPin} label="New PIN" /></div>
        <div><p className="mb-2 text-[14px] font-semibold">New PIN again</p><OtpInput mask length={4} value={pin2} onChange={setPin2} label="Repeat new PIN" /></div>
        <FormError>{err}</FormError>
        <Submit busy={busy}>Change PIN</Submit>
      </form>
    </Sheet>
  );
}
