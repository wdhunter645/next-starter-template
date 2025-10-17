# Staging Mirror: test.lougehrigfanclub.com

## Overview

This document describes the staging mirror environment that provides an exact copy of production, safe for testing and experimentation.

**Branch Model:**
- `main` → Production deployment
- `staging` → Test/staging deployment (test.lougehrigfanclub.com)

**Deploy Model:**
- Cloudflare Pages previews for all pull requests
- Automatic branch deploy for `staging` branch
- Production deploy from `main` branch

## Cloudflare Pages Setup

### Enable Branch Deploys

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Pages**
3. Select your project (e.g., `next-starter-template`)
4. Go to **Settings** → **Builds & deployments**
5. Under **Branch deployments**, enable the `staging` branch:
   - Click **Configure branch deployments**
   - Add `staging` to the list of branches to deploy
   - Save changes

Each push to the `staging` branch will now trigger an automatic deployment.

### Configure CNAME for test.lougehrigfanclub.com

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

### Environment Variables

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

**Future: Database & Media Snapshot**
- Planned: Automated database snapshot with PII masking
- Planned: Media/asset sync from production B2 bucket
- See: Tracking issue for snapshot automation

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
- `/api/env/check` - Environment variable check (will be created)
- `/api/phase2/status` - Phase 2 feature status (will be created)

**Note:** Some API endpoints may need to be created if they don't exist yet.

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
- [ ] API health check returns 200
- [ ] Console shows no JavaScript errors
- [ ] Environment variables are set correctly
- [ ] Admin features work (if authenticated)

## Troubleshooting

### Staging Branch Not Deploying

**Problem:** Push to staging branch doesn't trigger deployment

**Solutions:**
1. Verify branch deployments are enabled in Cloudflare Pages settings
2. Check build logs in Cloudflare Dashboard for errors
3. Ensure branch name is exactly `staging` (case-sensitive)
4. Verify Cloudflare API token has correct permissions

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
1. Check build logs in Cloudflare Dashboard
2. Test build locally: `npm run build`
3. Verify all dependencies are in package.json
4. Check Node.js version compatibility
5. Review recent commits for breaking changes

## Reference Links

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Branch Deployments Guide](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)
- [Custom Domains Setup](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Environment Variables](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables)

## TODO Checklist for Manual Setup

These actions require manual intervention in the Cloudflare dashboard:

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
  - Variables to set:
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

**Exact Commands:**
```bash
# Create and push staging branch (one-time setup)
git fetch origin
git checkout -b staging origin/main
git push origin staging

# Future staging refreshes
git checkout staging
git fetch origin
git reset --hard origin/main
git push origin staging --force
```

---

**Last Updated:** 2025-10-17  
**Maintained By:** Development Team  
**Related:** See main [staging-runbook.md](../staging-runbook.md) for operational procedures
