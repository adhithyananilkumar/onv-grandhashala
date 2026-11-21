import type { Loan, PaymentStatus, RequestStatus } from "./types";

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
export const fmtShort = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
export const fmtTime = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

const DAY = 86_400_000;
/** Whole days until the due date (negative when late). */
export const daysLeft = (iso: string, now = Date.now()) => Math.ceil((new Date(iso).getTime() - now) / DAY);

export function fine(l: Loan, perDay: number, now = Date.now()) {
  const end = l.returnedAt ? new Date(l.returnedAt).getTime() : now;
  const late = Math.floor((end - new Date(l.dueAt).getTime()) / DAY);
  return late > 0 ? late * perDay : 0;
}

export function dueLabel(l: Loan) {
  if (l.returnedAt) return `Returned ${fmtShort(l.returnedAt)}`;
  const d = daysLeft(l.dueAt);
  if (d < 0) return `${-d} ${d === -1 ? "day" : "days"} late`;
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return `Due in ${d} days · ${fmtShort(l.dueAt)}`;
}

export const loanTone = (l: Loan) => (l.returnedAt ? "muted" : daysLeft(l.dueAt) < 0 ? "bad" : daysLeft(l.dueAt) <= 3 ? "warn" : "good");

export const REQUEST_LABEL: Record<RequestStatus, string> = {
  pending: "Waiting", confirmed: "Confirmed", ready: "Ready to collect", done: "Completed", cancelled: "Cancelled", declined: "Declined",
};
export const PAYMENT_LABEL: Record<PaymentStatus, string> = { due: "To pay", verifying: "Checking", paid: "Paid", waived: "Waived" };

export const TONE: Record<string, string> = {
  good: "bg-teal-50 text-teal-700",
  warn: "bg-kani-50 text-kani-700",
  bad: "bg-laterite-50 text-laterite-700",
  info: "bg-royal-50 text-royal",
  muted: "bg-mist-2 text-muted",
};

export const requestTone = (s: RequestStatus) => (s === "ready" ? "warn" : s === "confirmed" || s === "done" ? "good" : s === "pending" ? "info" : "muted");
export const paymentTone = (s: PaymentStatus) => (s === "due" ? "bad" : s === "verifying" ? "warn" : s === "paid" ? "good" : "muted");

export function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold ${TONE[tone] ?? TONE.muted}`}>{children}</span>;
}
