<div align="center">
  <img src="public/brand/onv-icon.png" alt="ONV Grameena Grandhashala icon" width="96" />
  <h1>ONV Grameena Grandhashala, Puthanambalam</h1>
  <p><strong>ഒ.എൻ.വി ഗ്രാമീണ ഗ്രന്ഥശാല, പുത്തനമ്പലം</strong></p>
  <p><em>Read. Learn. Gather. Grow. · വായിച്ചു വളരുക, ചിന്തിച്ചു വിവേകം നേടുക</em></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#demo-logins--mock-backend">Demo Logins</a> •
    <a href="#project-structure">Project Structure</a> •
    <a href="PLAN.md">Architecture Plan</a>
  </p>
</div>

---

A bilingual (**Malayalam + English**), mobile-first web and community platform for the village public library — covering reading, learning, community events, and the **ONV Naattu Vipani** local marketplace.

See [PLAN.md](PLAN.md) for the full architecture, module breakdown, and roadmap.

## Features

| Route | Area | What it does |
|---|---|---|
| `/` | **Home** | Library overview, featured sections, quotes, and quick access |
| `/catalogue` | **Book Catalogue (OPAC)** | Search and browse books, check availability, and reserve titles |
| `/classes` | **Classes** | Explore and enrol in library-run classes (arts, music, yoga, coaching, etc.) |
| `/events` | **Events & Camps** | View upcoming community events, literary meetings, and camps, and register |
| `/vipani` | **ONV Naattu Vipani** | Local marketplace and auctions for community producers, farmers, and Kudumbashree units |
| `/me` & `/join` | **Member Portal** | Digital library card (`/me/card`), active loans, profile (`/me/profile`), UPI payment submissions (`/me/payments`), and onboarding (`/join`) |
| `/admin` | **Admin Console** | Staff dashboard for books, events, classes, loans, auctions, content, library details, and verifying UPI payments |
| `/brand` | **Brand Kit** | Brand identity, logo/icon assets, and visual guidelines |
| `/offline` | **PWA & Offline** | Installable web app with offline fallback (`public/sw.js`) |

## Getting Started

```bash
npm install
npm run dev      # Start development server at http://localhost:3000
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Demo Logins & Mock Backend

Until the Supabase backend is connected, the app runs against mock API routes in `src/app/api/` seeded from `src/mock/db.json`. Runtime changes are saved to `.mock-data/db.json` (git-ignored) — delete `.mock-data/` to reset to the initial seed.

| Role | Library ID | PIN |
|---|---|---|
| **Admin** (library staff) | `0000` | `0000` |
| **Member** | `1111` | `1111` |

- **SMS OTPs** are mocked: any 6-digit code is accepted.
- **UPI Payments** are mocked: members submit a UTR number, and staff confirm it under **Admin → Payments**.

## Configuration

Library facts live in `src/lib/site.ts` (including registration number `02KNT9008`, bilingual names, and address). Values marked `PLACEHOLDER` (phone, WhatsApp, email, timings, and summary stats) should be updated with real library details before deployment.

## Project Structure

```text
├── public/
│   ├── brand/          # Logo & icon assets (onv-icon.png, onv-logo.png, SVG & white variants)
│   ├── icons/          # PWA icons (192x192, 512x512, maskable, apple-touch-icon)
│   └── img/            # Author portraits & library imagery
├── scripts/            # Asset generation helpers (brand-cut.cjs, logo-svg.cjs, pwa-icons.cjs)
├── src/
│   ├── app/            # Next.js App Router pages & API routes (src/app/api/)
│   ├── components/     # Shared UI, layout, member flows & admin console (src/components/admin/)
│   ├── lib/            # Site config, data helpers, schemas, session & types
│   ├── mock/           # Seed database (db.json)
│   └── server/         # Server-side mock store & HTTP helpers
└── PLAN.md             # Full platform plan & roadmap
```

## Tech Stack

- **Framework:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript 5
- **Styling & Icons:** Tailwind CSS 4 · Lucide React
- **Backend & Hosting:** Mock JSON store (current) · Supabase (planned) · Vercel CDN
