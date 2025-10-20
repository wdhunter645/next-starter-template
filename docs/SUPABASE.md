# Supabase (Phase 3)
We use **public read** via the anon key for: /weekly, /milestones, /charities. Writes/admin come later (Phase 4+).

## 1) Create a Supabase project
- Copy the **Project URL** and **anon** key.

## 2) Add env vars
- GitHub → Settings → Secrets and variables → Actions:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
- Cloudflare Dashboard → Pages → (lgfc-staging + lgfc-prod) → Settings → Environment variables:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY

## 3) Apply schema (SQL)
- Supabase → SQL Editor → run files in `/supabase/migrations/` in order.

## 4) Verify
- Open /weekly, /milestones, /charities. If tables are empty, the UI shows graceful empty states.

## Notes
- Row Level Security (RLS) is **ON**; policies allow public read, no public writes.
- Admin writes will be done via server-side API with service key (Phase 4+).
