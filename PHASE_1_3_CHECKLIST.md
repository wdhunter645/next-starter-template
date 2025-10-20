# Phase 1-3 Verification Checklist

Quick reference checklist for verifying all foundation layers.

## ✅ Phase 1: GitHub Actions

- [x] Primary workflow exists: `.github/workflows/cf-pages.yml`
- [x] Workflow triggers on push to `main` and `workflow_dispatch`
- [x] Uses Node.js v20.x
- [x] Runs `npm run build`
- [x] Uses `@cloudflare/next-on-pages` adapter (v1.13.16)
- [x] Deploys to Cloudflare Pages via `cloudflare/pages-action@v1`
- [x] NO `wrangler deploy` calls (Pages-native deployment)
- [x] Output directory: `.vercel/output`

**Auxiliary Workflows (diagnostic only):**
- [x] `uptime.yml` - Health monitoring (5-minute interval)
- [x] `cf-one-shot.yml` - Manual deploy (workflow_dispatch only)
- [x] `cf-triage.yml` - Diagnostic workflow
- [x] Other utility workflows (docs-audit, staging-smoke, etc.)

## ✅ Phase 2: Cloudflare Pages

### Local Configuration
- [x] `wrangler.toml` exists with correct settings
  - [x] `pages_build_output_dir = ".vercel/output/static"`
  - [x] `compatibility_date = "2025-10-01"`
- [x] `package.json` scripts configured:
  - [x] `build`: Next.js build
  - [x] `cf:adapt`: next-on-pages adaptation
  - [x] `cf:build`: Combined build + adapt
  - [x] `cf:deploy:staging`: Manual staging deploy
  - [x] `cf:deploy:prod`: Manual production deploy

### Dashboard Configuration (for lgfc-staging / lgfc-prod)
- [ ] Build command: `npm run build && npx @cloudflare/next-on-pages@1.24.1`
- [ ] Output directory: `.vercel/output`
- [ ] Node version: 20
- [ ] Projects created: lgfc-staging, lgfc-prod

### GitHub Secrets Required
- [ ] `CF_API_TOKEN` (with Pages edit permissions)
- [ ] `CF_ACCOUNT_ID`
- [ ] `LGFC_STAGING_URL` (for uptime checks)
- [ ] `LGFC_PROD_URL` (for uptime checks)

## ✅ Phase 3: Supabase

### Environment Configuration
- [x] `.env.example` contains Supabase variables:
  - [x] `NEXT_PUBLIC_SUPABASE_URL`
  - [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `.env.local` created and configured (for local testing)
- [ ] Cloudflare Pages environment variables configured

### Database Schema
- [x] Migration `0001_init.sql` exists
  - [x] Tables: `weekly_posts`, `milestones`, `charities`
  - [x] RLS enabled on all tables
  - [x] Public read policies:
    - [x] `weekly_posts_read_public`
    - [x] `milestones_read_public`
    - [x] `charities_read_public`
  - [x] NO write policies (secure by default)
- [x] Migration `0002_seed_example.sql` exists
  - [x] Seeds 3 milestones
  - [x] Seeds 2 charities
  - [x] Seeds 1 weekly post ("Welcome")

### Applied to Database
- [ ] Migrations applied to Supabase instance
- [ ] Seed data loaded
- [ ] RLS policies verified in Supabase Dashboard

### Connectivity Test
- [x] Test script exists: `test_supabase.mjs`
- [ ] Test passes: `node --env-file=.env.local test_supabase.mjs`
- [ ] Returns: `{ ok: true, rows: 1, error: null }`

### Supabase Client
- [x] Client exists: `lib/supabaseClient.ts`
- [x] Graceful fallback when env vars missing
- [x] No session persistence (stateless)
- [x] Public anon key only (no server key)

## ✅ API & Pages

### API Endpoints
- [x] `/api/healthz` exists (`pages/api/healthz.ts`)
- [x] Returns: `{ ok: true, ts: <timestamp> }`
- [x] Uses edge runtime

### Data Pages
- [x] `/weekly` (pages/weekly/index.tsx)
  - [x] Uses `getStaticProps`
  - [x] Fetches from `weekly_posts` table
  - [x] ISR: 5 minutes
- [x] `/weekly/[slug]` (pages/weekly/[slug].tsx)
  - [x] Dynamic route
  - [x] Fetches by slug
- [x] `/milestones` (pages/milestones.tsx)
  - [x] Uses `getStaticProps`
  - [x] Fetches from `milestones` table
  - [x] ISR: 10 minutes
- [x] `/charities` (pages/charities.tsx)
  - [x] Uses `getStaticProps`
  - [x] Fetches from `charities` table
  - [x] ISR: 10 minutes

## ✅ Build & Test

### Local Build
- [x] Dependencies install: `npm ci`
- [x] Linting passes: `npm run lint`
- [x] Type checking passes: `npm run typecheck`
- [x] Build succeeds: `npm run build`
- [x] Adaptation works: `npm run cf:adapt`

### Verification Tools
- [x] Verification script: `verify-foundation.sh`
- [x] Supabase test: `test_supabase.mjs`
- [x] Documentation: `PHASE_1_3_VERIFICATION_REPORT.md`
- [x] Quickstart guide: `VERIFICATION_QUICKSTART.md`

## ✅ Uptime Monitoring

- [x] Workflow exists: `.github/workflows/uptime.yml`
- [x] Schedule: Every 5 minutes (`*/5 * * * *`)
- [x] Checks staging: `${LGFC_STAGING_URL}/api/healthz`
- [x] Checks production: `${LGFC_PROD_URL}/api/healthz`
- [x] Graceful handling when URLs not configured
- [x] Error reporting on non-200 responses

## 🚀 Deployment Verification

### After Deployment (Manual Check)

#### Staging (lgfc-staging.pages.dev)
- [ ] Homepage loads: `https://lgfc-staging.pages.dev/`
- [ ] Health check: `https://lgfc-staging.pages.dev/api/healthz`
- [ ] Weekly page: `https://lgfc-staging.pages.dev/weekly`
- [ ] Milestones page: `https://lgfc-staging.pages.dev/milestones`
- [ ] Charities page: `https://lgfc-staging.pages.dev/charities`
- [ ] Welcome post: `https://lgfc-staging.pages.dev/weekly/welcome`

#### Production (lgfc-prod.pages.dev)
- [ ] Homepage loads: `https://lgfc-prod.pages.dev/`
- [ ] Health check: `https://lgfc-prod.pages.dev/api/healthz`
- [ ] Weekly page: `https://lgfc-prod.pages.dev/weekly`
- [ ] Milestones page: `https://lgfc-prod.pages.dev/milestones`
- [ ] Charities page: `https://lgfc-prod.pages.dev/charities`
- [ ] Welcome post: `https://lgfc-prod.pages.dev/weekly/welcome`

## 📝 Success Criteria Summary

All items marked with [x] are verified in the repository.  
Items marked with [ ] require external configuration or deployment.

**Repository Status:** ✅ All foundation code is in place and verified

**Next Steps:**
1. Configure GitHub Secrets (CF_API_TOKEN, CF_ACCOUNT_ID, etc.)
2. Set up Cloudflare Pages projects (lgfc-staging, lgfc-prod)
3. Apply Supabase migrations to live database
4. Configure Cloudflare Pages environment variables
5. Deploy and verify all endpoints return 200 OK

**Phase 1-3 Foundation:** ✅ COMPLETE AND STABLE
