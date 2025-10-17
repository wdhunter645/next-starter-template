# Cloudflare Pages Configuration

## Overview

This document provides the authoritative Cloudflare Pages configuration for deploying this Next.js application.

## Framework Settings

**Framework Preset:** Next.js (Pages Router / App Router)

## Build Configuration

### Node Version
- **File:** `.nvmrc`
- **Version:** `20`
- **Note:** Cloudflare Pages automatically detects and uses the Node version specified in `.nvmrc`

### Build Command
```bash
npm run build
```

**Alternative (if memory issues occur):**
```bash
npm run build:cf
```

### Output Directory

For Next.js with `@opennextjs/cloudflare`:
```
.vercel/output/static
```

**Alternative (only if using `next export`):**
```
out
```

**Note:** The standard Next.js build output directory (`.next`) is NOT directly deployable to Cloudflare Pages. Use one of the above options.

## Environment Variables

Set these in Cloudflare Pages dashboard under:
**Settings → Environment Variables**

### Required Variables

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-site.pages.dev
NEXT_PUBLIC_SITE_NAME=Lou Gehrig Fan Club

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Admin Configuration
ADMIN_EMAILS=admin@example.com

# Backblaze B2 (if using)
B2_KEY_ID=
B2_APP_KEY=
B2_BUCKET=
B2_ENDPOINT=
PUBLIC_B2_BASE_URL=

# GitHub OAuth (if using)
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_APP_ID=
GITHUB_APP_INSTALLATION_ID=
```

## Build Settings Checklist

- [x] **Production Branch:** `main`
- [x] **Build Command:** `npm run build`
- [x] **Build Output Directory:** `.vercel/output/static`
- [x] **Node Version:** `20` (via `.nvmrc`)
- [x] **Root Directory:** `/` (project root)
- [x] **Environment Variables:** Set in dashboard (see above)

## Deployment Verification

### Automatic Verification

After deployment, the GitHub Actions workflow will:
1. Fetch the deployed commit SHA from Cloudflare API
2. Compare with the main branch HEAD SHA
3. Post a PR comment with the comparison result

### Manual Verification

1. **Check Deployment Status:**
   - Navigate to Cloudflare Pages dashboard
   - View "Deployments" tab
   - Verify latest deployment is "Active"

2. **Run Smoke Tests:**
   ```bash
   ./scripts/smoke.sh https://your-site.pages.dev
   ```

3. **Verify Build Output:**
   - Check that commit SHA matches expected deployment
   - Verify all environment variables are set correctly
   - Test key endpoints manually

## Troubleshooting

### Build Failures

**Out of Memory:**
- Add `npm run build:cf` script with memory optimizations:
  ```json
  "build:cf": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  ```

**Module Not Found:**
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Run `npm ci` locally to verify `package-lock.json` is up to date

**TypeScript Errors:**
- Run `npm run typecheck` locally first
- Fix all type errors before deploying

### Runtime Errors

**Environment Variables Not Available:**
- Verify variables are set in Cloudflare Pages dashboard
- Remember: only `NEXT_PUBLIC_*` variables are available in browser
- Server-side variables must be accessed in API routes or Server Components

**404 on API Routes:**
- Verify output directory includes API routes
- Check `next.config.ts` for any custom rewrites/redirects

## Cache Configuration

See [CACHE-RULES.md](./CACHE-RULES.md) for Cloudflare cache rule configuration.

## References

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [@opennextjs/cloudflare](https://opennext.js.org/cloudflare)
