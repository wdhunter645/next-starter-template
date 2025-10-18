# Staging Mirror: test.lougehrigfanclub.com

## Overview

This document describes the staging mirror environment that provides an exact copy of production, safe for testing and experimentation.

**Branch Model:**
- `main` → Production deployment
- `staging` → Test/staging deployment (test.lougehrigfanclub.com)

**Deploy Model:**
- **Cloudflare Pages** deployment via GitHub Actions
- Automatic preview deploys for all pull requests
- Branch deploy for `staging` branch (requires manual Cloudflare setup)

## Cloudflare Configuration

### Deployment Target: Cloudflare Pages

This project deploys to **Cloudflare Pages** (not Workers) using GitHub Actions.

**Authoritative Build Settings:**
- **Framework**: Next.js (with OpenNext adapter)
- **Build command**: `npx opennextjs-cloudflare build`
- **Output directory**: `.open-next/`
- **Node version**: `20` (specified in `.nvmrc`)
- **Deployment method**: GitHub Actions (`.github/workflows/deploy.yml`)

### GitHub Integration Setup

**⚠️ Important:** Ensure the Cloudflare GitHub App is configured for **Pages** mode, not Workers mode.

#### Correct Configuration (Pages)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Pages**
2. Locate or create project: `next-starter-template`
3. If integrating with GitHub auto-deploy:
   - **Framework preset**: Next.js
   - **Build command**: `npx opennextjs-cloudflare build`
   - **Output directory**: `.open-next/`
   - **Node version**: `20`
   - **Environment variables**: Set in Cloudflare dashboard (see below)

#### What NOT to Use (Workers)

❌ Do not configure as a **Workers** service
- Workers deployment requires different configuration
- The Cloudflare GitHub App bot showing "Deploying with Cloudflare Workers" indicates misconfiguration
- If you see Workers deployment attempts, disable or delete the Workers project

#### Recommended Approach

**Use GitHub Actions for deployment** (current setup):
- Automated via `.github/workflows/deploy.yml`
- Builds with `npx opennextjs-cloudflare build`
- Deploys with `wrangler pages deploy .open-next/`
- Supports production (`main` branch) and preview deployments
- **Benefit**: Full control over build and deployment process

## Enable Branch Deploys

### Configure Staging Branch

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Pages**
3. Select your project (e.g., `next-starter-template`)
4. Go to **Settings** → **Builds & deployments**
5. Under **Branch deployments**, enable the `staging` branch:
   - Click **Configure branch deployments**
   - Add `staging` to the list of branches to deploy
   - Save changes

Each push to the `staging` branch will now trigger an automatic deployment.

### Configure Custom Domain (test.lougehrigfanclub.com)

1. In Cloudflare Dashboard, go to **Workers & Pages** → **Pages**
2. Select your project
3. Go to **Custom domains** tab
4. Click **Set up a custom domain**
5. Enter: `test.lougehrigfanclub.com`
6. Cloudflare will provide DNS records to add:
   - If domain is on Cloudflare: Records added automatically
   - If external DNS: Add CNAME record pointing to `<project>.pages.dev`
7. Wait for DNS propagation (usually 5-15 minutes)
8. Verify SSL certificate is provisioned automatically

**Expected Result:** `test.lougehrigfanclub.com` → staging branch deployment

## Environment Variables

Set environment variables in Cloudflare Pages for the **Preview** environment to apply to staging branch deployments.

**Required Variables (names only - set values in Cloudflare Dashboard):**

Core configuration:
- `NEXT_PUBLIC_SITE_URL` - Set to `https://test.lougehrigfanclub.com`
- `ADMIN_EMAILS` - Comma-separated admin email addresses

Optional Supabase integration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional B2/S3 storage:
- `B2_KEY_ID`
- `B2_APP_KEY`
- `B2_BUCKET`
- `B2_ENDPOINT`
- `PUBLIC_B2_BASE_URL`

OAuth (GitHub App):
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` - Set to `https://test.lougehrigfanclub.com`

**⚠️ Security Note:** NEVER commit environment variable values to git. Only document variable names.

## Refresh Staging from Production

To sync the staging branch with the latest production code:

```bash
# Checkout staging branch
git checkout staging

# Fetch latest from remote
git fetch origin

# Fast-forward staging to match main
git reset --hard origin/main

# Push updated staging (force push required)
git push origin staging --force
```

**Environment Sync:**
- Environment variables must be manually synced via Cloudflare Dashboard
- Review and update variables in **Settings → Environment variables**
- Compare Production vs Preview environments
- Redeploy staging branch after env changes

## Verification

### Smoke Test Endpoints

After deploying to staging, verify these routes return 200 OK:

**Public Pages:**
- `/` - Home page
- `/weekly` - Weekly content
- `/milestones` - Milestones page
- `/news` - News page
- `/calendar` - Calendar page

**API Endpoints:**
- `/api/supabase/status` - Supabase connection check
- `/api/env/check` - Environment variable check
- `/api/phase2/status` - Phase 2 feature status

### Automated Smoke Tests

Run automated smoke tests:

```bash
# Install dependencies
npm ci

# Run smoke tests against staging
SMOKE_URL=https://test.lougehrigfanclub.com npm run smoke:preview
```

See `scripts/smoke.sh` for endpoint definitions.

### Manual Verification Checklist

- [ ] Staging URL resolves: https://test.lougehrigfanclub.com
- [ ] SSL certificate is valid
- [ ] Home page loads without errors
- [ ] All main navigation links work
- [ ] API health checks return 200
- [ ] Console shows no JavaScript errors
- [ ] Environment variables are set correctly
- [ ] Admin features work (if authenticated)

## Troubleshooting

### Cloudflare Workers Bot Showing Deployment Failed

**Problem:** PR comment shows "Deploying with Cloudflare Workers → Deployment failed"

**Root Cause:** Cloudflare GitHub App is configured for Workers mode instead of Pages mode

**Solution:**
1. Go to Cloudflare Dashboard → Workers & Pages
2. If you see a **Workers** service named `next-starter-template`:
   - Click Settings → Delete project (or disable GitHub integration)
3. Verify GitHub Actions deployment still works (it should - it's independent)
4. Optionally: Set up proper **Pages** GitHub integration with correct build settings

**Why this happens:** 
- Project was initially set up for Workers deployment
- Now using Pages deployment via GitHub Actions
- The old Workers integration continues attempting (and failing) to deploy
- GitHub Actions Pages deployment works correctly regardless

### Staging Branch Not Deploying

**Problem:** Push to staging branch doesn't trigger deployment

**Solutions:**
1. Verify branch deployments are enabled in Cloudflare Pages settings
2. Check build logs in Cloudflare Dashboard for errors
3. Ensure branch name is exactly `staging` (case-sensitive)
4. Verify GitHub Actions workflow runs successfully
5. Check Cloudflare API token has correct permissions (in repository secrets)

### Custom Domain Not Working

**Problem:** test.lougehrigfanclub.com returns 404 or connection error

**Solutions:**
1. Check DNS records are configured correctly
2. Wait 15-30 minutes for DNS propagation
3. Verify CNAME points to correct pages.dev domain
4. Check SSL certificate provisioning status
5. Clear browser cache and try incognito mode

### Environment Variables Not Applied

**Problem:** App shows "not configured" errors

**Solutions:**
1. Verify variables are set for **Preview** environment (not just Production)
2. Trigger a new deployment after adding variables
3. Check variable names match exactly (case-sensitive)
4. Ensure no trailing spaces in variable names or values
5. Check function logs for variable values (don't log secrets!)

### Build Failures

**Problem:** Deployment fails with build error

**Solutions:**
1. Check build logs in Cloudflare Dashboard or GitHub Actions
2. Test build locally: `npm run build`
3. Verify all dependencies are in package.json
4. Check Node.js version matches (should be 20 - see `.nvmrc`)
5. Review recent commits for breaking changes
6. Try: `npm ci && npx opennextjs-cloudflare build`

## Reference Links

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
- [Branch Deployments Guide](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)
- [Custom Domains Setup](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Environment Variables](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables)

## Manual Setup Checklist

These actions require manual intervention in the Cloudflare dashboard:

- [ ] **Verify Pages deployment mode**
  - Dashboard → Workers & Pages → Pages (not Workers)
  - Project: `next-starter-template`
  - If Workers project exists, delete it or disable GitHub integration

- [ ] **Enable staging branch deployments**
  - Dashboard → Workers & Pages → [Project] → Settings → Builds & deployments
  - Add `staging` to branch deployment list

- [ ] **Configure custom domain**
  - Dashboard → Workers & Pages → [Project] → Custom domains
  - Add: `test.lougehrigfanclub.com`
  - Verify DNS: CNAME → `<project>.pages.dev`

- [ ] **Set Preview environment variables**
  - Dashboard → Workers & Pages → [Project] → Settings → Environment variables
  - Copy variable names from Production environment
  - Update values appropriate for staging (URLs, non-prod credentials)
  - Key variables:
    - `NEXT_PUBLIC_SITE_URL=https://test.lougehrigfanclub.com`
    - `ADMIN_EMAILS=<your-staging-admin-emails>`
    - Additional optional variables as needed

- [ ] **Initial staging branch deployment**
  - After enabling branch deployments, push to staging:
    ```bash
    git checkout -b staging origin/main
    git push origin staging
    ```

- [ ] **Verify deployment**
  - Check deployment status in Cloudflare Dashboard
  - Visit: `https://staging.<project>.pages.dev`
  - After DNS: Visit `https://test.lougehrigfanclub.com`
  - Run smoke tests: `SMOKE_URL=https://test.lougehrigfanclub.com npm run smoke:preview`

---

**Last Updated:** 2025-10-17  
**Maintained By:** Development Team  
**Node.js Version:** 20 (see `.nvmrc`)
**Deployment Method:** Cloudflare Pages via GitHub Actions
