# START HERE — LGFC-Lite

This repo is the **LGFC-Lite** website running on **Cloudflare Pages + Pages Functions + D1**.

## What matters right now
- **Prod URL**: https://next-starter-template-6yr.pages.dev
- **Database**: Cloudflare D1 database name: `lgfc_lite` (binding: `DB`)
- **Migrations**: `migrations/**` (auto-applied via GitHub Action on `main`)
- **Pages Functions API**: `functions/api/**`
  - Public endpoints: `/api/join`, `/api/login`, `/api/library/submit`, `/api/library/list`, `/api/photos/list`, `/api/photos/get`, `/api/health`
  - Admin endpoints (Phase 6): `/api/admin/stats`, `/api/admin/export` (protected by `ADMIN_TOKEN`)
- **Local dev**: `npm ci && npm run dev`
  - Pages Functions do **not** run in `next dev`.
  - The Next.js routes `src/app/api/join/route.ts` and `src/app/api/login/route.ts` proxy to the deployed Pages site using `PAGES_SITE_URL` (see `.env.example`).

## Required Cloudflare configuration
Set these in Cloudflare Pages project environment variables (NOT in the repo):
- `ADMIN_TOKEN` (for `/api/admin/*`)
- Optional email:
  - `MAILCHANNELS_ENABLED=1`
  - `MAIL_FROM`, `MAIL_REPLY_TO`
  - `NEXT_PUBLIC_SITE_URL`

## Repo guardrails
- Never commit secrets. Use `.env.example` as the template and keep `.env` ignored.
- GitHub Action `Quality Checks (LGFC-Lite)` runs on PRs and pushes to `main`.

## JOIN and LOGIN functionality (ZIP 3 baseline)
- **JOIN page** (`/join`): New member registration form
  - Validates email format and checks for duplicates
  - Stores registration in D1 `join_requests` table
  - Sends welcome email (if email is configured)
- **LOGIN page** (`/login`): Member authentication form
  - Validates email exists in D1 `join_requests` table
  - Returns session information for authenticated members
- Both pages are accessible to visitors (non-authenticated users)
- JOIN and LOGIN buttons appear in the visitor header (desktop/tablet)
