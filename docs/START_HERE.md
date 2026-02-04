# START HERE — LGFC-Lite

This repo is the **LGFC-Lite** website running on **Cloudflare Pages + Pages Functions + D1**.

## What matters right now
- **Prod URL**: https://next-starter-template-6yr.pages.dev
- **Database**: Cloudflare D1 database name: `lgfc_lite` (binding: `DB`)
- **Migrations**: `migrations/**` (auto-applied via GitHub Action on `main`)
- **Pages Functions API**: `functions/api/**`
  - Public endpoints: `/api/join`, `/api/login`, `/api/library/submit`, `/api/library/list`, `/api/photos/list`, `/api/photos/get`, `/api/health`
  - Admin endpoints: `/api/admin/**` (protected by `ADMIN_TOKEN` header; see `/docs/admin/access-model.md`)
  - D1 diagnostic: `/api/admin/d1-inspect` (token-gated; used by `/admin/d1-test` page)
- **Local dev**: `npm ci && npm run dev`
  - Pages Functions do **not** run in `next dev`.
  - The Next.js routes `src/app/api/join/route.ts` and `src/app/api/login/route.ts` proxy to the deployed Pages site using `PAGES_SITE_URL` (see `.env.example`).

## Required Cloudflare configuration
Set these in Cloudflare Pages project environment variables (NOT in the repo):
- `ADMIN_TOKEN` (for `/api/admin/**` endpoints; see `/docs/admin/access-model.md`)
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


## FINAL AUTHORITATIVE DOCUMENT SET (DAY 1)

Day 1 is considered complete only when the documents below are present, fully written, and consistent with implementation.

### Entry & Authority
- `docs/START_HERE.md`
- `docs/ProjectPlan.md`

### Architecture & Design
- `docs/ARCHITECTURE_OVERVIEW.md`
- `docs/LGFC-Production-Design-and-Standards.md`
- `docs/NAVIGATION-INVARIANTS.md`

### Governance & Workflow
- `docs/website.md`
- `docs/website-process.md`
- `docs/website-PR-governance.md`
- `docs/PR-DRAFT-TEMPLATE.md`
- `Agent.md`

### Operations & Reliability
- `docs/OPERATING_MANUAL.md`
- `docs/backup.md`
- `docs/RECOVERY.md`
- `docs/TROUBLESHOOTING.md`
- `docs/ci-inventory.md`

### Content (Day 1 Launch)
- `docs/CONTENT_COLLECTION.md`
- `docs/CONTENT_USAGE_GUIDE.md`

### Day 1 Required Feature Docs
- `docs/phase-6-email.md`
- `docs/phase-7-guardrails.md`
- `docs/b2-d1-sync-pipeline.md`

### Roadmaps (Future Work)
- `docs/Day2.md`
- `docs/Day3.md`


## Documentation Hierarchy Strategy (Post Day 1)

After Day 1 is stable in production, documentation will transition from project-oriented naming to ops-oriented naming and hierarchy. No files are deleted during transition; consolidation is performed by moving authoritative content into the ops hierarchy and retaining historical materials under `docs/archive/`.

Planned evolution:
- Roadmaps consolidate into `Roadmap.md`
- Active priorities consolidate into `ActiveTasklist.md`
- Operational procedures consolidate into `Operations.md`
- Continuous improvement log consolidates into `Improvements.md`
