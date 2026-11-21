// Field definitions for each kind of content. The API validates with them and the admin console builds its forms from them.

import type { Book, ClassItem, ContentType, EventItem, Product } from "./types";

export type FieldSpec = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "datetime" | "textarea" | "toggle";
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  hint?: string;
  /** Only shown when this toggle field is on. */
  when?: string;
  half?: boolean;
};

export const SCHEMA: Record<ContentType, { noun: string; plural: string; prefix: string; fields: FieldSpec[] }> = {
  books: {
    noun: "book", plural: "Books", prefix: "b",
    fields: [
      { key: "title", label: "Title (English)", type: "text", required: true },
      { key: "titleMl", label: "Title (Malayalam)", type: "text" },
      { key: "author", label: "Author", type: "text", required: true },
      { key: "language", label: "Language", type: "select", options: ["Malayalam", "English"], required: true, half: true },
      { key: "category", label: "Subject", type: "text", required: true, half: true, hint: "Novel, Poetry, Children…" },
      { key: "copies", label: "Copies owned", type: "number", min: 0, max: 999, required: true, half: true },
      { key: "available", label: "On the shelf now", type: "number", min: 0, max: 999, required: true, half: true },
      { key: "shelf", label: "Shelf", type: "text", required: true, half: true, hint: "e.g. N-04" },
      { key: "hue", label: "Cover colour (0–360)", type: "number", min: 0, max: 360, half: true },
    ],
  },
  classes: {
    noun: "class", plural: "Classes", prefix: "c",
    fields: [
      { key: "title", label: "Name (English)", type: "text", required: true },
      { key: "titleMl", label: "Name (Malayalam)", type: "text", required: true },
      { key: "teacher", label: "Teacher", type: "text", required: true },
      { key: "schedule", label: "When", type: "text", required: true, hint: "e.g. Sat & Sun · 4:00 PM" },
      { key: "ages", label: "Ages", type: "text", required: true, half: true },
      { key: "fee", label: "Fee", type: "text", required: true, half: true, hint: "Free, or ₹300 / month" },
      { key: "seatsLeft", label: "Seats left", type: "number", min: 0, max: 500, required: true, half: true },
      { key: "tone", label: "Colour", type: "select", options: ["green", "gold", "clay"], half: true },
    ],
  },
  events: {
    noun: "event", plural: "Events", prefix: "e",
    fields: [
      { key: "title", label: "Name (English)", type: "text", required: true },
      { key: "titleMl", label: "Name (Malayalam)", type: "text", required: true },
      { key: "date", label: "Date", type: "date", required: true, half: true },
      { key: "time", label: "Time", type: "text", required: true, half: true },
      { key: "place", label: "Place", type: "text", required: true, half: true },
      { key: "kind", label: "Type", type: "select", options: ["Health", "Camp", "Literary", "Culture"], required: true, half: true },
      { key: "blurb", label: "Description", type: "textarea", required: true },
    ],
  },
  products: {
    noun: "product", plural: "Vipani", prefix: "p",
    fields: [
      { key: "name", label: "Product (English)", type: "text", required: true },
      { key: "nameMl", label: "Product (Malayalam)", type: "text", required: true },
      { key: "seller", label: "Seller", type: "text", required: true },
      { key: "price", label: "Price (₹)", type: "number", min: 0, max: 1_000_000, required: true, half: true },
      { key: "unit", label: "Unit", type: "text", required: true, half: true, hint: "1 L, 250 g, piece" },
      { key: "emoji", label: "Emoji", type: "text", half: true },
      { key: "isAuction", label: "Sell by auction", type: "toggle" },
      { key: "auctionBid", label: "Starting / current bid (₹)", type: "number", min: 0, max: 1_000_000, when: "isAuction", half: true },
      { key: "auctionEnds", label: "Auction closes", type: "datetime", when: "isAuction", half: true },
    ],
  },
};

export const CONTENT_TYPES = Object.keys(SCHEMA) as ContentType[];
export const isContentType = (t: string): t is ContentType => t in SCHEMA;

/** An instant as a datetime-local value in Kerala time. */
const istLocal = (iso: string) => new Date(new Date(iso).getTime() + 5.5 * 3_600_000).toISOString().slice(0, 16);

/** Flatten an item into form values (products: auction fields). */
export function toForm(type: ContentType, item: Record<string, unknown> | null): Record<string, unknown> {
  if (!item) {
    const d: Record<string, unknown> = {};
    for (const f of SCHEMA[type].fields) d[f.key] = f.type === "number" ? 0 : f.type === "toggle" ? false : f.options?.[0] ?? "";
    if (type === "books") d.hue = Math.floor(Math.random() * 360);
    if (type === "products") d.emoji = "🛍️";
    return d;
  }
  if (type === "products") {
    const p = item as Product;
    return { ...p, isAuction: !!p.auction, auctionBid: p.auction?.currentBid ?? p.price, auctionEnds: p.auction ? istLocal(p.auction.endsAt) : "" };
  }
  return { ...item };
}

/** Check and clean incoming values. Returns the cleaned item or the first problem. */
export function clean(type: ContentType, input: Record<string, unknown>, prev?: Record<string, unknown>):
  { ok: true; value: Record<string, unknown> } | { ok: false; field: string; error: string } {
  const out: Record<string, unknown> = {};
  for (const f of SCHEMA[type].fields) {
    if (f.when && !input[f.when]) continue;
    const v = input[f.key];
    if (f.type === "toggle") { out[f.key] = !!v; continue; }
    if (f.type === "number") {
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n) || (f.min !== undefined && n < f.min) || (f.max !== undefined && n > f.max)) return { ok: false, field: f.key, error: `${f.label}: enter a number${f.min !== undefined ? ` from ${f.min}` : ""}${f.max !== undefined ? ` to ${f.max}` : ""}.` };
      out[f.key] = Math.round(n);
      continue;
    }
    const s = typeof v === "string" ? v.trim().slice(0, f.type === "textarea" ? 1000 : 160) : "";
    if (f.required && !s) return { ok: false, field: f.key, error: `${f.label} is needed.` };
    if (f.options && s && !f.options.includes(s)) return { ok: false, field: f.key, error: `${f.label}: pick one of the options.` };
    if (f.type === "date" && s && !/^\d{4}-\d{2}-\d{2}$/.test(s)) return { ok: false, field: f.key, error: `${f.label}: use a date.` };
    if (s || f.required) out[f.key] = s;
  }
  if (type === "books" && (out.available as number) > (out.copies as number)) return { ok: false, field: "available", error: "Can't have more on the shelf than copies owned." };
  if (type === "products") {
    const { isAuction, auctionBid, auctionEnds, ...rest } = out;
    if (isAuction) {
      if (!auctionEnds) return { ok: false, field: "auctionEnds", error: "Set when the auction closes." };
      const ends = new Date(`${auctionEnds}${String(auctionEnds).length === 16 ? ":00+05:30" : ""}`);
      if (Number.isNaN(ends.getTime())) return { ok: false, field: "auctionEnds", error: "Auction closes: use a date and time." };
      const before = (prev as Product | undefined)?.auction;
      rest.auction = { currentBid: (auctionBid as number) || (rest.price as number), bids: before?.bids ?? 0, endsAt: ends.toISOString() };
    }
    return { ok: true, value: rest };
  }
  return { ok: true, value: out };
}

export type AnyItem = Book | ClassItem | EventItem | Product;
export const itemTitle = (i: AnyItem) => ("title" in i ? i.title : i.name);
