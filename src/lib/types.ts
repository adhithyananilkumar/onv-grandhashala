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
};

export type Product = {
  id: string;
  name: string;
  nameMl: string;
  seller: string;
  price: number;
  unit: string;
  emoji: string;
  auction?: { currentBid: number; bids: number; endsAt: string };
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
};
