"use client";

// Detail pages: the item is fetched from the mock API (/api/catalog) by the id in the URL.

import Link from "next/link";
import { useParams } from "next/navigation";
import { Armchair, ArrowLeft, BookOpen, CalendarDays, Clock3, Gavel, Languages, Library, MapPin, Package, SearchX, Store, Tag, Ticket, Timer, UserRound, Users } from "lucide-react";
import { useCatalog } from "@/lib/api";
import { BidForm, EnrolForm, OrderForm, RegisterForm, ReserveForm } from "./Actions";
import { Comments } from "./Comments";
import { Countdown } from "./Countdown";
import { Availability, BookCover, CLASS_MOTIFS, DateBadge, DetailShell, EVENT_MOTIFS, kindLabel, PRODUCT_MOTIFS } from "./ui";

function useItem<K extends "books" | "classes" | "events" | "products">(list: K) {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useCatalog();
  const item = data?.[list].find((x) => x.id === id) as NonNullable<typeof data>[K][number] | undefined;
  return { item, loading, error };
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-5 sm:pt-6" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-32 animate-pulse rounded-full bg-mist-2" />
      <div className="mt-4 h-64 animate-pulse rounded-[32px] bg-mist-2 sm:h-72" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-3xl bg-mist-2" />)}</div>
    </div>
  );
}

function Missing({ back, label, error }: { back: string; label: string; error?: string }) {
  return (
    <div className="mx-auto grid max-w-md place-items-center px-5 py-24 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-mist-2 text-muted"><SearchX size={28} /></span>
      <h1 className="mt-4 font-display text-2xl font-bold">{error ? "Couldn't load this" : "Not found"}</h1>
      <p className="mt-1 text-muted">{error ?? "It may have been removed from the library's list."}</p>
      <Link href={back} className="mt-6 inline-flex items-center gap-2 rounded-full bg-royal px-5 py-3 font-semibold text-mist"><ArrowLeft size={17} /> {label}</Link>
    </div>
  );
}

export function BookDetail() {
  const { item: b, loading, error } = useItem("books");
  if (loading) return <DetailSkeleton />;
  if (!b) return <Missing back="/catalogue" label="All books" error={error?.message} />;
  const queue = b.available === 0;
  return (
    <DetailShell
      back="/catalogue" backLabel="All books" seed={`${b.id}-${b.title}`} motif="book"
      badge={<BookCover book={b} className="w-28 sm:w-36" />}
      eyebrow={b.category} title={b.title} ml={b.titleMl} sub={b.author}
      facts={[
        { icon: BookOpen, label: "Copies", value: <Availability book={b} /> },
        { icon: Library, label: "Shelf", value: b.shelf },
        { icon: Languages, label: "Language", value: b.language },
        { icon: Tag, label: "Author", value: b.author },
      ]}
      formTitle={queue ? "Join the queue" : "Reserve this book"}
      formNote={queue ? "All copies are out. We'll message you when one is returned." : "We hold it at the desk for 3 days."}
      form={<ReserveForm book={b} />}
      after={<Comments itemId={`book-${b.id}`} />}
    >
      <h2 className="font-display text-2xl font-bold text-ink">How it works</h2>
      <ol className="grid gap-3 sm:grid-cols-3">
        {[
          ["Reserve", queue ? "Add your name to the queue here." : "Pick a day and send the form."],
          ["We confirm", "You'll see it under My books when it's ready at the desk."],
          ["Collect", "Show your library card at the desk."],
        ].map(([t, d], i) => (
          <li key={t} className="rounded-2xl bg-card p-5 ring-1 ring-line/70">
            <span className="grid size-8 place-items-center rounded-full bg-royal text-[14px] font-bold text-mist">{i + 1}</span>
            <p className="mt-3 font-semibold text-ink">{t}</p>
            <p className="mt-1 text-[15px] leading-snug text-muted">{d}</p>
          </li>
        ))}
      </ol>
      <p>Books are lent for 14 days and can be renewed twice from My books, or at the desk.</p>
    </DetailShell>
  );
}

export function ClassDetail() {
  const { item: c, loading, error } = useItem("classes");
  if (loading) return <DetailSkeleton />;
  if (!c) return <Missing back="/classes" label="All classes" error={error?.message} />;
  return (
    <DetailShell
      back="/classes" backLabel="All classes" seed={c.id + c.title} motif={CLASS_MOTIFS[c.id] ?? "lotus"}
      tag={<span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${c.fee === "Free" ? "bg-teal text-mist" : "bg-card text-ink"}`}>{c.fee}</span>}
      eyebrow="Class" title={c.title} ml={c.titleMl}
      facts={[
        { icon: Clock3, label: "When", value: c.schedule },
        { icon: UserRound, label: "Teacher", value: c.teacher },
        { icon: Users, label: "Ages", value: c.ages },
        { icon: Armchair, label: "Seats", value: c.seatsLeft === 0 ? "Full" : `${c.seatsLeft} left` },
      ]}
      formTitle="Enrol" formNote="Book a seat for yourself or your child."
      form={<EnrolForm c={c} />}
    >
      <p>Classes run in the library hall. Come ten minutes early on the first day to meet the teacher and fill in a short form.</p>
      <p>If you need to miss a class, message the library on WhatsApp so someone on the waiting list can take your place.</p>
    </DetailShell>
  );
}

export function EventDetail() {
  const { item: e, loading, error } = useItem("events");
  if (loading) return <DetailSkeleton />;
  if (!e) return <Missing back="/events" label="All events" error={error?.message} />;
  const date = new Date(e.date + "T00:00:00+05:30").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
  return (
    <DetailShell
      back="/events" backLabel="All events" seed={e.id + e.title} motif={EVENT_MOTIFS[e.kind]}
      badge={<DateBadge date={e.date} highlight />}
      eyebrow={kindLabel(e.kind)} title={e.title} ml={e.titleMl}
      facts={[
        { icon: CalendarDays, label: "Date", value: date },
        { icon: Clock3, label: "Time", value: e.time },
        { icon: MapPin, label: "Place", value: e.place },
        { icon: Ticket, label: "Entry", value: "Free, registration needed" },
      ]}
      formTitle="Register" formNote="Save places for you and your family."
      form={<RegisterForm e={e} />}
    >
      <p>{e.blurb}</p>
      {e.kind === "Health" && <p>Bring any old prescriptions and your Aadhaar or ration card. Tokens are called in order of registration.</p>}
    </DetailShell>
  );
}

export function ProductDetail() {
  const { item: p, loading, error } = useItem("products");
  if (loading) return <DetailSkeleton />;
  if (!p) return <Missing back="/vipani" label="Naattu Vipani" error={error?.message} />;
  const a = p.auction;
  return (
    <DetailShell
      back="/vipani" backLabel="Naattu Vipani" seed={p.id + p.name} motif={PRODUCT_MOTIFS[p.id] ?? "palm"}
      tag={a ? <span className="inline-flex items-center gap-1.5 rounded-full bg-royal px-3 py-1 text-[13px] font-semibold text-mist"><Gavel size={14} strokeWidth={2.2} className="text-kani" /> Auction</span> : undefined}
      eyebrow={a ? "Auction" : "Fixed price"} title={p.name} ml={p.nameMl}
      facts={[
        { icon: Store, label: "Seller", value: p.seller },
        { icon: Package, label: "Unit", value: p.unit },
        a
          ? { icon: Gavel, label: "Highest bid", value: `₹${a.currentBid.toLocaleString("en-IN")} · ${a.bids} bids` }
          : { icon: Gavel, label: "Price", value: `₹${p.price}` },
        a ? { icon: Timer, label: "Closes", value: <Countdown to={a.endsAt} /> } : { icon: Timer, label: "Pickup", value: "Saturday market day" },
      ]}
      formTitle={a ? "Place a bid" : "Buy"} formNote={a ? "The highest bid when the timer ends wins." : "Order now, pay by UPI or when you collect."}
      form={a ? <BidForm p={p} /> : <OrderForm p={p} />}
    >
      <p>Everything at Naattu Vipani comes straight from people in and around Puthanambalam. The library takes no commission; a small table fee keeps the market running.</p>
    </DetailShell>
  );
}
