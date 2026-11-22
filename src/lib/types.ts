// Shapes shared by the mock API (src/app/api) and the UI.

export type Book = {
  id: string;
  title: string;
  titleMl?: string;
  author: string;
  language: "Malayalam" | "English";
  category: string;
  available: number;
  copies: number;
  shelf: string;
  hue: number; // cover colour for the generated placeholder cover
};

export type ClassItem = {
  id: string;
  title: string;
  titleMl: string;
  teacher: string;
  /** A line or two on what the class covers. */
  about?: string;
  /** Short note on the teacher. */
  teacherNote?: string;
  schedule: string;
  ages: string;
  fee: string;
  seatsLeft: number;
  tone: "green" | "gold" | "clay";
};

export type EventItem = {
  id: string;
  title: string;
  titleMl: string;
  date: string; // ISO date
  time: string;
  place: string;
  kind: "Health" | "Camp" | "Literary" | "Culture";
  blurb: string;
  /** Most people the event can take (0 or missing = no limit). */
  capacity?: number;
  /** Entry fee in rupees (0 or missing = free). */
  fee?: number;
};

export type Product = {
  id: string;
  name: string;
  nameMl: string;
  seller: string;
  price: number;
  unit: string;
  emoji: string;
  auction?: {
    currentBid: number; bids: number; endsAt: string;
    /** Latest bids, newest first (bidder shown as first name + initial). `src` says where the bid came from. */
    history?: { by: string; amount: number; at: string; src?: "online" | "floor" }[];
    /** Staff are running this auction live in the hall right now; floor bids appear here as they are called. */
    live?: boolean;
    /** Set when staff close the auction (sold), whatever the timer says. */
    closedAt?: string;
    /** Who is ahead right now (full name, for staff only). */
    leader?: { name: string; card?: string };
    winner?: { name: string; card?: string; amount: number };
  };
};

export type Catalog = { books: Book[]; classes: ClassItem[]; events: EventItem[]; products: Product[] };
export type ContentType = keyof Catalog;

export type Role = "member" | "admin";

/** A member as the API returns it (never includes the PIN hash). */
export type User = {
  card: string; // "ONV 1234"
  name: string;
  phone: string;
  email?: string;
  ward?: string;
  interests?: string[];
  since: string;
  role: Role;
  blocked?: boolean;
  joinedAt: string;
};

export type Loan = {
  id: string;
  bookId: string;
  title: string;
  card: string;
  issuedAt: string;
  dueAt: string;
  returnedAt?: string;
  renewals: number;
};

export type RequestKind = "Reserve" | "Enrol" | "Register" | "Order" | "Bid";
export type RequestStatus = "pending" | "confirmed" | "ready" | "done" | "cancelled" | "declined";

export type LibRequest = {
  id: string; // reference shown to people, e.g. RSV-12345
  kind: RequestKind;
  card: string;
  name: string;
  itemId: string;
  title: string;
  detail?: string;
  amount?: number;
  at: string;
  status: RequestStatus;
  note?: string;
};

export type PaymentKind = "Fine" | "Class fee" | "Order" | "Membership" | "Other";
export type PaymentStatus = "due" | "verifying" | "paid" | "waived";

export type Payment = {
  id: string;
  card: string;
  name: string;
  title: string;
  kind: PaymentKind;
  amount: number;
  createdAt: string;
  status: PaymentStatus;
  method?: "UPI" | "Cash" | "Desk";
  utr?: string;
  paidAt?: string;
  ref?: string; // linked request or loan
};

export type Notice = { id: string; title: string; body: string; at: string; tone: "info" | "alert" };

export type Comment = { id: string; item: string; name: string; card?: string; text: string; rating: number; date: string };

/** Someone registered for an event at the desk, with or without a library card. */
export type GuestReg = {
  id: string;
  /** Whether this is an event registration or a class enrolment (events if missing). */
  kind?: "event" | "class";
  age?: string;
  eventId: string;
  eventTitle: string;
  name: string;
  phone?: string;
  people: number;
  at: string;
  attended?: boolean;
  note?: string;
};

export type LedgerType = "in" | "out";
export type PayMethod = "Cash" | "UPI" | "Bank";
/** One line in the day book. Member payments confirmed as paid are counted automatically on top of these. */
export type LedgerEntry = {
  id: string;
  /** ISO date-time of the transaction. */
  date: string;
  type: LedgerType;
  category: string;
  amount: number;
  method: PayMethod;
  note: string;
  party?: string;
};

/** Everything a signed-in member sees on their own pages. */
export type MemberSummary = { user: User; loans: Loan[]; requests: LibRequest[]; payments: Payment[]; notices: Notice[]; finePerDay: number; maxRenewals: number; upi: { id: string; name: string } };

export type Settings = { finePerDay: number; loanDays: number; maxRenewals: number; upiId: string; upiName: string };

/** Everything the admin console needs in one call. */
export type AdminOverview = Catalog & {
  members: User[];
  loans: Loan[];
  requests: LibRequest[];
  payments: Payment[];
  notices: Notice[];
  settings: Settings;
  guests: GuestReg[];
  ledger: LedgerEntry[];
  /** Reading-room head count per day (YYYY-MM-DD, Kerala time). */
  visits: Record<string, number>;
};
