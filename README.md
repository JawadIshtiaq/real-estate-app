## Real Estate Marketplace

This project is a Next.js marketplace with a Supabase backend. It includes a marketing landing page and a live marketplace view backed by Supabase tables.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and run the SQL in:
   - `supabase/schema.sql`
   - `supabase/storage.sql`
   - `supabase/seed.sql` (optional)

3. Market data on the landing page is pulled live from BIS and Zameen.

3. Create `.env.local` from `.env.local.example` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000` for the landing page and `http://localhost:3000/marketplace` for live data.

## Notes

- Listings are readable publicly with RLS.
- Inserts for listings are limited to `seller` and `admin` roles.
- Favorites and inquiries are enabled in the schema.
- Auth pages: `/sign-up`, `/sign-in`, `/account`.
- Listing creation: `/listings/new` (requires signed-in seller/admin).
- Seller dashboard: `/listings`.
- Edit listing: `/listings/[id]/edit`.
