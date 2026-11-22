"use client";

import { useState } from "react";
import Link from "next/link";
import { Gavel, ShieldCheck } from "lucide-react";
import type { Book, ClassItem, EventItem, LibRequest, Payment, Product } from "@/lib/types";
import { api, ApiError, refreshContent } from "@/lib/api";
import { useSession } from "@/lib/session";
import { Choice, Done, Field, FormError, Stepper, Submit, TextInput } from "./forms";

/** The signed-in member, or null. */
export function useMember() {
  return useSession().user;
}

const ghost = "inline-flex items-center justify-center rounded-full border-2 border-royal px-5 py-3 text-[15.5px] font-semibold transition-colors hover:bg-royal hover:text-mist";
const solid = "inline-flex items-center justify-center rounded-full bg-royal px-5 py-3 text-[15.5px] font-semibold text-mist transition-colors hover:bg-royal-700";

function AfterLinks({ back, label, mine = "/classes", mineLabel = "Your classes" }: { back: string; label: string; mine?: string; mineLabel?: string }) {
  return (
    <>
      <Link href={back} className={ghost}>{label}</Link>
      <Link href={mine} className={solid}>{mineLabel}</Link>
    </>
  );
}

/** Who is booking: the signed-in member, no typing needed. */
function Booker() {
  const m = useMember();
  if (!m) return null;
  return (
    <p className="flex items-center gap-2 rounded-2xl bg-teal-50 px-3.5 py-2.5 text-[14.5px] text-teal-700">
      <ShieldCheck size={17} className="shrink-0" /> Booking as <b className="font-semibold">{m.name}</b> · {m.card}
    </p>
  );
}

type Result = { request: LibRequest; payment?: Payment };

/** POST an action to /api/requests and track busy / error / done. */
function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [done, setDone] = useState<Result | null>(null);
  const send = async (body: Record<string, unknown>) => {
    setBusy(true); setError(undefined);
    try {
      const r = await api<Result>("/api/requests", { body });
      setDone(r);
      refreshContent();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, setError, done, send };
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/* ───────── Reserve a book ───────── */

export function ReserveForm({ book }: { book: Book }) {
  const a = useAction();
  const [pickup, setPickup] = useState("Tomorrow");
  const queue = book.available === 0;
  if (a.done) {
    return (
      <Done title={queue ? "You're in the queue" : "Reservation sent"} reference={a.done.request.id}
        text={queue ? `We'll message you when a copy of ${book.title} comes back.` : `The desk will set ${book.title} aside and tell you when it's ready. Shelf ${book.shelf}.`}>
        <AfterLinks back="/catalogue" label="Find another book" mine="/catalogue" mineLabel="Your books" />
      </Done>
    );
  }
  return (
    <form noValidate className="space-y-4" onSubmit={(e) => { e.preventDefault(); a.send({ kind: "Reserve", itemId: book.id, pickup }); }}>
      <Booker />
      {!queue && (
        <Field label="When will you collect it?">{() => <Choice options={["Today", "Tomorrow", "This weekend"]} value={pickup} onChange={setPickup} />}</Field>
      )}
      <FormError>{a.error}</FormError>
      <Submit busy={a.busy}>{queue ? "Join the queue" : "Reserve this book"}</Submit>
    </form>
  );
}

/* ───────── Enrol in a class ───────── */

export function EnrolForm({ c: item }: { c: ClassItem }) {
  const a = useAction();
  const [who, setWho] = useState("Myself");
  const [student, setStudent] = useState("");
  const [age, setAge] = useState("");
  if (a.done) {
    return (
      <Done title="Seat booked" reference={a.done.request.id} text={`${who === "Myself" ? "You're" : `${student} is`} enrolled in ${item.title}. First class: ${item.schedule}, with ${item.teacher}.${a.done.payment ? ` Fee ${inr(a.done.payment.amount)} is in your payments.` : ""}`}>
        <AfterLinks back="/classes" label="See other classes" mine={a.done.payment ? "/me/payments" : "/classes"} mineLabel={a.done.payment ? "Pay the fee" : "Your classes"} />
      </Done>
    );
  }
  if (item.seatsLeft === 0) {
    return <p className="rounded-2xl bg-laterite-50 p-4 text-[15.5px] text-laterite-700">This class is full. Ask at the desk to join the waiting list.</p>;
  }
  return (
    <form noValidate className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      if (who === "My child" && (student.trim().length < 2 || !age)) return a.setError("Add the student's name and age.");
      a.send({ kind: "Enrol", itemId: item.id, who, student, age });
    }}>
      <Booker />
      <Field label="Who is joining?">{() => <Choice options={["Myself", "My child"]} value={who} onChange={setWho} />}</Field>
      {who === "My child" && (
        <div className="grid grid-cols-[1fr_96px] gap-3">
          <Field label="Student's name">{(id) => <TextInput id={id} value={student} onChange={(e) => setStudent(e.target.value)} placeholder="Child's name" />}</Field>
          <Field label="Age">{(id) => <TextInput id={id} value={age} inputMode="numeric" onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 2))} placeholder="Age" />}</Field>
        </div>
      )}
      <div className="flex items-center justify-between rounded-2xl bg-mist-2 px-4 py-3 text-[15px]">
        <span className="text-ink-2">Fee</span>
        <span className="font-semibold">{item.fee === "Free" ? "Free" : `${item.fee}, pay by UPI or at the desk`}</span>
      </div>
      <FormError>{a.error}</FormError>
      <Submit busy={a.busy}>Book my seat</Submit>
    </form>
  );
}

/* ───────── Register for an event ───────── */

export function RegisterForm({ e: ev }: { e: EventItem }) {
  const a = useAction();
  const [people, setPeople] = useState(1);
  const [slot, setSlot] = useState("Morning");
  const health = ev.kind === "Health";
  if (a.done) {
    return (
      <Done title="You're registered" reference={a.done.request.id} text={`${people} ${people === 1 ? "place" : "places"} for ${ev.title}${health ? `, ${slot.toLowerCase()} token` : ""}. ${ev.place}, ${ev.time}.`}>
        <AfterLinks back="/events" label="See other events" mine="/events" mineLabel="Your events" />
      </Done>
    );
  }
  return (
    <form noValidate className="space-y-4" onSubmit={(e) => { e.preventDefault(); a.send({ kind: "Register", itemId: ev.id, people, slot }); }}>
      <Booker />
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-semibold">How many people?</p>
          <p className="text-[13.5px] text-muted">Including you</p>
        </div>
        <Stepper value={people} onChange={setPeople} max={6} />
      </div>
      {health && <Field label="Preferred token slot">{() => <Choice options={["Morning", "Late morning", "Noon"]} value={slot} onChange={setSlot} />}</Field>}
      <FormError>{a.error}</FormError>
      <Submit busy={a.busy}>Register</Submit>
    </form>
  );
}

/* ───────── Order a product ───────── */

export function OrderForm({ p }: { p: Product }) {
  const a = useAction();
  const [qty, setQty] = useState(1);
  const [pickup, setPickup] = useState("Market day (Saturday)");
  if (a.done) {
    return (
      <Done title="Order placed" reference={a.done.request.id} text={`${qty} × ${p.name}, ${inr(qty * p.price)}. Collect at the library: ${pickup.toLowerCase()}. Pay now by UPI, or when you collect.`}>
        <AfterLinks back="/vipani" label="Back to the market" mine="/me/payments" mineLabel="Pay now" />
      </Done>
    );
  }
  return (
    <form noValidate className="space-y-4" onSubmit={(e) => { e.preventDefault(); a.send({ kind: "Order", itemId: p.id, qty, pickup }); }}>
      <Booker />
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-semibold">Quantity</p>
          <p className="text-[13.5px] text-muted">₹{p.price} per {p.unit}</p>
        </div>
        <Stepper value={qty} onChange={setQty} max={10} />
      </div>
      <Field label="Pickup">{() => <Choice options={["Market day (Saturday)", "Any weekday evening"]} value={pickup} onChange={setPickup} />}</Field>
      <div className="flex items-center justify-between rounded-2xl bg-mist-2 px-4 py-3">
        <span className="text-[15px] text-ink-2">Total</span>
        <span className="font-display text-2xl font-extrabold tabular-nums">{inr(qty * p.price)}</span>
      </div>
      <FormError>{a.error}</FormError>
      <Submit busy={a.busy}>Place order</Submit>
    </form>
  );
}

/* ───────── Bid in an auction ───────── */

export function BidForm({ p }: { p: Product }) {
  const a = useAction();
  const auc = p.auction!;
  const step = auc.currentBid >= 1000 ? 50 : 10;
  const current = auc.currentBid;
  const [amount, setAmount] = useState(String(current + step));
  const min = current + step;
  const closed = !!auc.closedAt;
  if (closed) {
    return (
      <div className="rounded-2xl bg-mist-2 p-4 text-center">
        <p className="font-display text-xl font-bold">{auc.winner ? "Sold" : "Bidding has closed"}</p>
        <p className="mt-1 text-[15px] text-ink-2">{auc.winner ? `Final price ${inr(auc.currentBid)}.` : "This auction is over."}</p>
      </div>
    );
  }
  if (a.done) {
    return (
      <Done title="Your bid is in" reference={a.done.request.id} text={`You're the highest bidder at ${inr(a.done.request.amount ?? Number(amount))}. We'll message you if someone outbids you, and when the auction closes.`}>
        <AfterLinks back="/vipani" label="Back to the market" mine="/vipani" mineLabel="Your orders" />
      </Done>
    );
  }
  return (
    <form noValidate className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      const v = Number(amount);
      if (!v || v < min) return a.setError(`Bid at least ${inr(min)}.`);
      a.send({ kind: "Bid", itemId: p.id, amount: v });
    }}>
      <Booker />
      {auc.live && <p className="flex items-center gap-2 rounded-2xl bg-teal-50 px-4 py-2.5 text-[14px] font-semibold text-teal-700"><span className="size-2 animate-pulse rounded-full bg-teal" /> Live in the hall now. Bids called there show up here.</p>}
      <div className="rounded-2xl bg-royal-50 p-4">
        <p className="text-[14px] text-ink-2">Highest bid now</p>
        <p className="font-display text-3xl font-extrabold tabular-nums">{inr(current)}</p>
      </div>
      <Field label="Your bid" hint={`At least ${inr(min)}, in steps of ₹${step}.`}>
        {(id) => (
          <div className="flex items-center rounded-2xl border-2 border-line bg-card transition-colors focus-within:border-royal">
            <span className="pl-4 text-[18px] font-semibold text-ink-2">₹</span>
            <input id={id} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-12 min-w-0 flex-1 bg-transparent px-2 text-[18px] font-semibold tabular-nums focus:outline-none" />
          </div>
        )}
      </Field>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 5].map((k) => (
          <button key={k} type="button" onClick={() => setAmount(String(current + step * k))}
            className="rounded-full border-2 border-line bg-card px-4 py-2 text-[15px] font-semibold tabular-nums hover:border-royal">
            {inr(current + step * k)}
          </button>
        ))}
      </div>
      <FormError>{a.error}</FormError>
      <Submit busy={a.busy}><span className="inline-flex items-center gap-2"><Gavel size={18} /> Place bid</span></Submit>
    </form>
  );
}
