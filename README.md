# ONV Grameena Grandhashala, Puthanambalam

Website and community platform for the library: book catalogue and reservations, classes,
events and camps, and the ONV Naattu Vipani marketplace.

- **Plan, architecture and roadmap:** [PLAN.md](PLAN.md)
- **Library details to fill in:** `src/lib/site.ts` (values marked PLACEHOLDER)
- **Mock API + data (until the backend is connected):** routes in `src/app/api`, seed in `src/mock/db.json`.
  Changes are saved to `.mock-data/db.json` (git-ignored); delete that folder to reset.

### Demo logins (mock data only)

| Who | Library ID | PIN |
|---|---|---|
| Admin (library staff) | 0000 | 0000 |
| Member | 1111 | 1111 |

SMS codes are mocked: any 6 digits work. UPI payments are mocked: members submit a UTR, staff confirm it in Admin → Payments.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

Stack: Next.js 16 (App Router, Cache Components) · Tailwind CSS 4 · Supabase (planned) · Vercel CDN.
