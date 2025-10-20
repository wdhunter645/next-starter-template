# Phase 1-3 Verification Quickstart

This guide helps you quickly verify that all foundation layers (GitHub Actions, Cloudflare Pages, and Supabase) are properly configured.

## Quick Verification

Run the automated verification script:

```bash
./verify-foundation.sh
```

This checks:
- ✅ Environment (Node.js, npm, git)
- ✅ GitHub workflows configuration
- ✅ Cloudflare Pages setup
- ✅ Supabase schema and RLS policies
- ✅ API endpoints
- ✅ Uptime monitoring

## Expected Output

You should see:

```
✅ Node.js v20.x
✅ npm 10+
✅ One active CF workflow (cf-pages.yml)
✅ Build uses npm build → next-on-pages
✅ No wrangler deploy in cf-pages.yml
✅ Supabase env vars in .env.example
✅ RLS policies: public read defined
✅ /api/healthz endpoint exists
✅ Uptime workflow configured
✅ Page routes for data display exist
```

## Test Supabase Connectivity

1. Create `.env.local` from the template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Run the Supabase test:
   ```bash
   node --env-file=.env.local test_supabase.mjs
   ```

4. Expected output:
   ```json
   { ok: true, rows: 1, error: null }
   ```

## Build and Deploy

### Local Build

```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Adapt for Cloudflare Pages
npm run cf:adapt

# Preview locally
npm run cf:preview
```

### Deploy to Cloudflare Pages

#### Automatic (via GitHub Actions)
Push to `main` branch triggers automatic deployment via `cf-pages.yml` workflow.

#### Manual Deploy
```bash
# Deploy to staging
npm run cf:deploy:staging

# Deploy to production
npm run cf:deploy:prod
```

## Verify Deployment

After deployment, check these URLs:

### Staging
- https://lgfc-staging.pages.dev/ (should return 200)
- https://lgfc-staging.pages.dev/api/healthz (should return `{ ok: true, ts: ... }`)
- https://lgfc-staging.pages.dev/weekly
- https://lgfc-staging.pages.dev/milestones
- https://lgfc-staging.pages.dev/charities

### Production
- https://lgfc-prod.pages.dev/ (should return 200)
- https://lgfc-prod.pages.dev/api/healthz (should return `{ ok: true, ts: ... }`)
- https://lgfc-prod.pages.dev/weekly
- https://lgfc-prod.pages.dev/milestones
- https://lgfc-prod.pages.dev/charities

## Troubleshooting

### Build Fails

```bash
# Check linting
npm run lint

# Check types
npm run typecheck

# Clean and rebuild
rm -rf .next
npm run build
```

### Supabase Connection Fails

1. Verify credentials in `.env.local`
2. Check that database migrations have been applied
3. Verify RLS policies in Supabase Dashboard
4. Test with: `node --env-file=.env.local test_supabase.mjs`

### Deployment Issues

1. Check GitHub Secrets are configured:
   - `CF_API_TOKEN`
   - `CF_ACCOUNT_ID`

2. Check Cloudflare Pages projects exist:
   - `lgfc-staging`
   - `lgfc-prod`

3. View workflow logs in GitHub Actions tab

## More Information

For detailed verification results, see:
- [PHASE_1_3_VERIFICATION_REPORT.md](./PHASE_1_3_VERIFICATION_REPORT.md) - Complete verification report
- [.github/workflows/cf-pages.yml](./.github/workflows/cf-pages.yml) - Primary deployment workflow
- [supabase/migrations/](./supabase/migrations/) - Database schema and seed data

## Success Criteria

All Phase 1-3 requirements met:
- [x] GitHub Actions configured with single CF Pages workflow
- [x] Cloudflare Pages build pipeline uses next-on-pages adapter
- [x] Supabase schema with RLS policies for public read access
- [x] API healthz endpoint for uptime monitoring
- [x] Automated uptime checks every 5 minutes
- [x] Data pages (weekly, milestones, charities) ready

**Status:** ✅ Foundation verified and stable. Ready for Phase 4.
