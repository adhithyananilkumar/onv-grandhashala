"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen, CalendarDays, Check, CheckCircle2, Clock3, Copy, CreditCard, Gavel, History, IdCard, KeyRound, Landmark,
  LogOut, Palette, Receipt, RefreshCw, ShoppingBasket, Smartphone, UserRound, Wallet, X,
} from "lucide-react";
import { api, ApiError, invalidate, refreshContent, useApi } from "@/lib/api";
import { logout, updateSessionUser, useSession } from "@/lib/session";
import { daysLeft, dueLabel, fine, fmtDate, fmtShort, inr, loanTone, PAYMENT_LABEL, paymentTone, Pill, REQUEST_LABEL, requestTone } from "@/lib/format";
import type { LibRequest, Loan, MemberSummary, Payment, User } from "@/lib/types";
import { Choice, Field, FormError, OtpInput, PhoneInput, Sheet, Skeleton, Submit, TextInput } from "./forms";
import { LibraryCard } from "./LibraryCard";
import { LoginForm } from "./LoginSheet";

const TABS = [
  { key: "books", label: "Books", icon: BookOpen },
  { key: "payments", label: "Payments", icon: Wallet },
  { key: "bookings", label: "Bookings", icon: Gavel },
  { key: "card", label: "Card", icon: IdCard },
  { key: "profile", label: "Profile", icon: UserRound },
] as const;
type Tab = (typeof TABS)[number]["key"];

const KIND_ICON = { Reserve: BookOpen, Enrol: Palette, Register: CalendarDays, Order: ShoppingBasket, Bid: Gavel };

export function MemberApp() {
  const { user, ready } = useSession();
  const params = useSearchParams();
  const router = useRouter();
  const tab = (TABS.some((t) => t.key === params.get("tab")) ? params.get("tab") : "books") as Tab;
  const { data, error, loading } = useApi<MemberSummary>(user ? "/api/me" : null);

  if (!ready) return <div className="mx-auto max-w-3xl space-y-3 px-4 pt-6"><Skeleton className="h-12" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 pt-10 pb-16">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Your account</h1>
        <p className="mt-1 text-muted">Sign in to see your books, payments and bookings.</p>
        <div className="mt-6 rounded-[28px] bg-card p-5 ring-1 ring-line/70 sm:p-6"><LoginForm /></div>
      </div>
    );
  }

  const go = (t: Tab) => router.replace(`/me?tab=${t}`, { scroll: false });
  const due = data ? data.payments.filter((p) => p.status === "due").reduce((s, p) => s + p.amount, 0) : 0;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      {/* Title + tabs: sticky under the app bar, like an Android screen. */}
      <div className="sticky top-14 z-30 bg-mist/95 backdrop-blur-xl md:top-20">
        <div className="px-4 pt-4 sm:px-5">
          <h1 className="font-display text-[1.7rem] leading-tight font-extrabold tracking-tight">My account</h1>
          <p className="text-[14px] text-muted">{user.name} · {user.card}</p>
        </div>
        <div role="tablist" aria-label="Account sections" className="no-scrollbar mt-2 flex gap-1 overflow-x-auto border-b border-line px-2 sm:px-3">
          {TABS.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => go(t.key)}
              className={`relative flex shrink-0 items-center gap-2 px-3.5 py-3 text-[14.5px] font-semibold transition-colors ${tab === t.key ? "text-royal" : "text-muted hover:text-ink"}`}>
              <t.icon size={17} /> {t.label}
              {t.key === "payments" && due > 0 && <span className="rounded-full bg-laterite px-1.5 text-[11px] font-bold text-mist">{inr(due)}</span>}
              {tab === t.key && <span className="absolute inset-x-2 -bottom-px h-[3px] rounded-t-full bg-royal" />}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-5 sm:px-5" key={tab}>
        {error && <FormError>{error.message}</FormError>}
        {loading || !data ? (
          <div className="space-y-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
        ) : tab === "books" ? <BooksTab d={data} />
          : tab === "payments" ? <PaymentsTab d={data} />
          : tab === "bookings" ? <BookingsTab d={data} />
          : tab === "card" ? <CardTab u={data.user} />
          : <ProfileTab u={data.user} />}
      </div>
    </div>
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

/* ───────── Books ───────── */

function BooksTab({ d }: { d: MemberSummary }) {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string>();
  const [now] = useState(() => Date.now());
  const out = d.loans.filter((l) => !l.returnedAt).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const past = d.loans.filter((l) => l.returnedAt);
  const reserves = d.requests.filter((r) => r.kind === "Reserve" && ["pending", "ready"].includes(r.status));

  const renew = async (l: Loan) => {
    setBusy(l.id); setErr(undefined);
    try { await api(`/api/loans/${l.id}/renew`, { body: {} }); invalidate("/api/me"); toast.show(`${l.title} renewed.`); }
    catch (e) { setErr((e as ApiError).message); }
    finally { setBusy(null); }
  };
  const cancel = async (r: LibRequest) => {
    setBusy(r.id); setErr(undefined);
    try { await api(`/api/requests/${r.id}`, { method: "PATCH", body: { status: "cancelled" } }); refreshContent(); toast.show("Reservation cancelled."); }
    catch (e) { setErr((e as ApiError).message); }
    finally { setBusy(null); }
  };

  return (
    <>
      <FormError>{err}</FormError>
      {reserves.length > 0 && (
        <>
          <H count={reserves.length}>Reserved</H>
          <ul className="space-y-2.5">
            {reserves.map((r) => (
              <li key={r.id} className={`flex items-center gap-3 rounded-3xl p-4 ${r.status === "ready" ? "bg-kani-50" : "bg-card ring-1 ring-line/70"}`}>
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-card text-royal"><BookOpen size={20} /></span>
                <div className="min-w-0 flex-1">
                  <Link href={`/catalogue/${r.itemId}`} className="block truncate font-semibold">{r.title}</Link>
                  <p className="text-[13.5px] text-muted">{r.status === "ready" ? "Waiting for you at the desk" : r.detail} · {r.id}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Pill tone={requestTone(r.status)}>{REQUEST_LABEL[r.status]}</Pill>
                  <button onClick={() => cancel(r)} disabled={busy === r.id} className="text-[13px] font-semibold text-laterite-700 disabled:opacity-50">Cancel</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <H count={out.length}>On loan</H>
      {out.length ? (
        <ul className="space-y-3">
          {out.map((l) => {
            const tone = loanTone(l);
            const f = fine(l, d.finePerDay);
            const total = new Date(l.dueAt).getTime() - new Date(l.issuedAt).getTime();
            const used = Math.min(1, Math.max(0, (now - new Date(l.issuedAt).getTime()) / total));
            const late = daysLeft(l.dueAt) < 0;
            const canRenew = !late && l.renewals < d.maxRenewals;
            return (
              <li key={l.id} className="rounded-3xl bg-card p-4 ring-1 ring-line/70">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-royal-50 text-royal"><BookOpen size={20} /></span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/catalogue/${l.bookId}`} className="block truncate font-semibold">{l.title}</Link>
                    <p className="text-[13.5px] text-muted">Borrowed {fmtShort(l.issuedAt)} · renewed {l.renewals}/{d.maxRenewals}</p>
                  </div>
                  <Pill tone={tone}>{dueLabel(l).split(" · ")[0]}</Pill>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mist-2">
                  <div className={`h-full rounded-full ${tone === "bad" ? "bg-laterite" : tone === "warn" ? "bg-kani" : "bg-teal"}`} style={{ width: `${used * 100}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-[13.5px] text-ink-2">{late ? <span className="font-semibold text-laterite-700">Fine so far {inr(f)} ({inr(d.finePerDay)}/day)</span> : `Return by ${fmtDate(l.dueAt)}`}</p>
                  <button onClick={() => renew(l)} disabled={!canRenew || busy === l.id}
                    title={late ? "Overdue books must come back to the desk" : l.renewals >= d.maxRenewals ? "Renewal limit reached" : undefined}
                    className="inline-flex items-center gap-1.5 rounded-full bg-royal px-4 py-2 text-[14px] font-semibold text-mist transition active:scale-95 disabled:bg-mist-2 disabled:text-muted">
                    <RefreshCw size={15} className={busy === l.id ? "animate-spin" : ""} /> Renew
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty icon={BookOpen} text="No books with you right now. Reserve one and collect it at the desk." href="/catalogue" cta="Find a book" />
      )}

      {past.length > 0 && (
        <>
          <H count={past.length}>Reading history</H>
          <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-card ring-1 ring-line/70">
            {past.map((l) => (
              <li key={l.id}>
                <Link href={`/catalogue/${l.bookId}`} className="flex items-center gap-3 px-4 py-3 active:bg-mist">
                  <History size={17} className="shrink-0 text-muted" />
                  <span className="min-w-0 flex-1 truncate font-medium">{l.title}</span>
                  <span className="text-[13px] text-muted">{fmtShort(l.issuedAt)} – {fmtShort(l.returnedAt!)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {toast.node}
    </>
  );
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

/* ───────── Bookings ───────── */

function BookingsTab({ d }: { d: MemberSummary }) {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string>();
  const list = d.requests.filter((r) => r.kind !== "Reserve");
  const open = list.filter((r) => ["pending", "confirmed", "ready"].includes(r.status));
  const closed = list.filter((r) => !open.includes(r));

  const cancel = async (r: LibRequest) => {
    if (!confirm(`Cancel ${r.title}?`)) return;
    setBusy(r.id); setErr(undefined);
    try { await api(`/api/requests/${r.id}`, { method: "PATCH", body: { status: "cancelled" } }); refreshContent(); toast.show("Cancelled."); }
    catch (e) { setErr((e as ApiError).message); }
    finally { setBusy(null); }
  };

  const row = (r: LibRequest) => {
    const I = KIND_ICON[r.kind];
    const canCancel = ["pending", "confirmed", "ready"].includes(r.status) && r.kind !== "Bid";
    const href = r.kind === "Enrol" ? `/classes/${r.itemId}` : r.kind === "Register" ? `/events/${r.itemId}` : `/vipani/${r.itemId}`;
    return (
      <li key={r.id} className="rounded-3xl bg-card p-4 ring-1 ring-line/70">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-mist-2 text-ink-2"><I size={20} /></span>
          <div className="min-w-0 flex-1">
            <Link href={href} className="block truncate font-semibold">{r.title}</Link>
            <p className="text-[13.5px] text-muted">{r.detail}</p>
            {r.note && <p className="text-[13.5px] text-laterite-700">{r.note}</p>}
          </div>
          <Pill tone={requestTone(r.status)}>{r.kind === "Bid" && r.status === "confirmed" ? "Leading" : REQUEST_LABEL[r.status]}</Pill>
        </div>
        <div className="mt-2 flex items-center justify-between text-[13px] text-muted">
          <span className="font-mono">{r.id} · {fmtShort(r.at)}</span>
          {canCancel && <button onClick={() => cancel(r)} disabled={busy === r.id} className="font-semibold text-laterite-700 disabled:opacity-50">Cancel</button>}
        </div>
      </li>
    );
  };

  return (
    <>
      <FormError>{err}</FormError>
      <H count={open.length}>Active</H>
      {open.length ? <ul className="space-y-2.5">{open.map(row)}</ul> : <Empty icon={CalendarDays} text="No classes, events or orders booked." href="/classes" cta="Browse classes" />}
      {closed.length > 0 && (<><H count={closed.length}>Past</H><ul className="space-y-2.5 opacity-80">{closed.map(row)}</ul></>)}
      {toast.node}
    </>
  );
}

/* ───────── Card ───────── */

function CardTab({ u }: { u: User }) {
  return (
    <div className="mx-auto max-w-md">
      <LibraryCard name={u.name} cardNo={u.card} since={u.since} />
      <p className="mt-3 text-center text-[14px] text-muted">Show this at the desk to borrow books. ലൈബ്രറി കാർഡ്</p>
      <dl className="mt-6 divide-y divide-line overflow-hidden rounded-3xl bg-card ring-1 ring-line/70">
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
