# ONV Grameena Grandhashala, Puthanambalam — Website & Platform Plan

> ഒ.എൻ.വി ഗ്രാമീണ ഗ്രന്ഥശാല, പുത്തനമ്പലം

A bilingual (Malayalam + English), mobile-first web platform for a village public library.
It covers **reading** (catalogue and reservations), **learning** (classes), **community**
(events and camps) and **local economy** (ONV Naattu Vipani marketplace and auctions).

---

## 1. Context & research notes

- Nothing about this specific library is published online yet (searched in English and
  Malayalam), so this site will be its first proper web presence. All library facts in
  the code (address, phone, timings, founding year, registration number) are
  **placeholders** and need replacing. See `src/lib/site.ts`.
- Kerala public libraries are affiliated to the **Kerala State Library Council**
  (Kerala Granthasala Sangham), under the Kerala Public Libraries Act, 1989. Libraries are
  graded (A–F) and receive grants based on membership, books, activities and reading-room
  hours. **The platform should make it easy to export the numbers the Council asks for**
  (members, issues per month, activity reports). That's a real admin win.
- Typical rural grandhashala activity: reading room and newspapers, children's library
  (Balavedi), women's forum (Vanitha Vedi), youth forum, Vayana Dinam (19 June, P.N.
  Panicker's death anniversary), Grandhashala Dinam (14 September), literary meetings,
  quiz, arts, music and yoga classes, medical and eye camps, career guidance, and PSC
  coaching.
- Named after poet **O. N. V. Kurup** (1931–2016, Jnanpith 2007, from Chavara, Kollam).
  The visual identity takes from his world: poetry, earth, and Kerala's green and gold.

## 2. Users

| Who | Needs |
|---|---|
| **Visitor** (anyone) | Library hours, events, classes, browse catalogue and Vipani, contact |
| **Member** (card holder) | Reserve books, see loans and due dates, enrol in classes, register for events, bid |
| **Seller** (local producer, Kudumbashree unit, farmer) | List products, run auctions, receive orders/enquiries |
| **Librarian / Staff** | Issue and return books, approve reservations, manage members, classes and events |
| **Committee / Admin** | Approve sellers, reports for the Library Council, site content, roles |

## 3. Modules

### 3.1 Public website (CDN-cached)
Home, About (history, ONV, committee), Gallery, News/Notices, Contact with map, Donate a
book, Become a member. Fully bilingual with a ML/EN toggle.

### 3.2 Catalogue & reservations (OPAC)
- Search by title, author, subject, ISBN, language (Malayalam / English / others), category
  (novel, poetry, children's, reference, PSC).
- Book page: cover, availability (copies in / out), shelf location, *Reserve* button.
- **Reservation flow:** member reserves → book is held → librarian marks *ready for
  pickup* → member gets a WhatsApp/SMS message → collect within 3 days or the hold expires
  → the queue moves on.
- Loans: issue/return at the desk (barcode or QR scan on the librarian's phone), due dates,
  renewals, reminders, fines (optional).
- Bulk import of the existing register from Excel/CSV. ISBN lookup via the Open Library API
  for covers and metadata. Malayalam titles are typed manually.
- Wishlist and "suggest a book to buy".

### 3.3 Classes (arts, music, dance, yoga, PSC coaching, computer literacy)
- Class listing with teacher, schedule, age group, fee (or free), seats left.
- Online enrolment and waitlist; attendance taken on the teacher's phone; certificates (PDF).

### 3.4 Events & camps (medical camp, eye camp, summer camp, literary meet, Vayana Dinam)
- Calendar and list views, with registration and time-slot booking (for example, health
  check-up tokens).
- Add to calendar, share to WhatsApp, photo gallery after the event.

### 3.5 ONV Naattu Vipani (local marketplace + auctions)
- Seller profiles: farmers, home bakers, handicrafts, Kudumbashree units.
- **Fixed-price listings:** pay or order through the site, or contact the seller on WhatsApp.
- **Auctions:** start price, minimum increment, end time, live bid updates (realtime),
  anti-sniping (a bid in the last 2 minutes extends the auction by 2 minutes), and a
  winner notification.
- Seller verification by the committee, a commission or flat fee (optional), and
  pickup at the library on market day.
- Payments: UPI via Razorpay (phase 2). Phase 1 can be "pay at pickup" to stay simple.

### 3.6 Membership
- Sign in with phone number + OTP (most villagers don't use email).
- Digital member card with a QR code, renewal, and a family membership option.

### 3.7 Admin dashboard
Books, members, loans, reservations, classes, events, Vipani approvals, notices, and
reports (CSV/PDF for the Library Council).

## 4. Architecture

```
            ┌─────────────────────────────┐
 Browser ──►│  Vercel Edge CDN            │  static + ISR pages (home, catalogue,
 (mobile)   │  Next.js 16 (App Router)    │  events, Vipani listings) cached globally
            │  Server Components/Actions  │
            └──────────────┬──────────────┘
                           │
            ┌──────────────▼──────────────┐
            │  Supabase                   │
            │  • Postgres (+ Row Level    │  books, copies, loans, reservations,
            │    Security per role)       │  classes, events, products, bids
            │  • Auth (phone OTP)         │
            │  • Realtime (live bids)     │
            │  • Storage (covers, photos) │
            │  • Edge Functions / cron    │  hold expiry, auction close, reminders
            └─────────────────────────────┘
   Notifications: WhatsApp Cloud API / MSG91 SMS      Payments: Razorpay UPI (phase 2)
```

**Why this stack**
- **Next.js on Vercel**: public pages are pre-rendered and served from the CDN, so they
  load fast on a 3G/4G village connection. Dynamic parts (reservations, bids) run as server
  actions. Cache Components let one page mix static and live parts.
- **Supabase**: one free-tier service gives a database, auth, realtime and storage, with
  no server to maintain. That matters for a volunteer-run library. Row Level Security keeps
  rules such as "members can only see their own loans" in the database.
- **Cost**: both are free at this scale. Only a domain (~₹800/yr) and SMS/WhatsApp
  messages cost money.
- **Alternative**: Firebase. It's also fine, but Postgres suits relational library data
  (books, copies, loans) better.

### Data model (core tables)
`profiles(role)` · `members` · `books` · `book_copies` · `loans` · `reservations` ·
`classes` · `class_sessions` · `enrolments` · `events` · `event_registrations` ·
`sellers` · `products` · `auctions` · `bids` · `orders` · `notices` · `gallery`

## 5. Design direction

- **Feel**: calm, literary, Kerala. The off-white of book paper, deep *kerala green*,
  *kasavu gold* accents and *chenkal* (laterite) terracotta.
- **Type**: Fraunces (English display), Inter (UI), Noto Serif Malayalam (Malayalam
  headings), Manjari (Malayalam body).
- **Mobile-first**: bottom tab bar on phones (Home · Books · Classes · Events · Vipani),
  48px touch targets, one-hand reach, light pages (< 150 KB JS on content pages).
- **Accessibility**: WCAG AA contrast, large-text option for elderly readers, works without
  JavaScript for reading content. Also a PWA, so the site can be installed and shows the
  last viewed pages when offline.

## 6. Roadmap

| Phase | Scope | Rough effort |
|---|---|---|
| **0 — Foundation** ✅ *(this commit)* | Next.js scaffold, design system, home page, catalogue UI with sample data, mobile nav | done |
| **1 — Public site** | About, Contact, Notices, Gallery, Events & Classes listings, ML/EN i18n, CMS-like admin for notices | 1–2 weeks |
| **2 — Catalogue** | Supabase setup, book import from Excel, OPAC search, phone-OTP login, reservations, librarian desk (issue/return via QR) | 2–3 weeks |
| **3 — Classes & Events** | Enrolment, registrations, slot booking, WhatsApp/SMS reminders | 1–2 weeks |
| **4 — Naattu Vipani** | Sellers, listings, live auctions, order/pickup flow, Razorpay | 2–3 weeks |
| **5 — Admin & reports** | Dashboard, Library Council reports, PWA/offline, analytics | 1–2 weeks |

## 7. Information needed from the library

1. Exact address, Google Maps pin, phone/WhatsApp, email, opening hours
2. History: founding year, Library Council registration number and grade, committee members
3. Logo (if any) and good photos of the building, reading room and past events
4. The book register (Excel/paper) and approximate book count
5. Current classes, teachers and fees, and the upcoming events
6. Vipani: how it runs today (weekly market? who the sellers are? how payment works?)
7. Domain preference, e.g. `onvgrandhashala.org` or `onvlibrary.in`
