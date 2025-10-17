# Staging & Day-2 Operations Runbook

This runbook provides operational procedures for verifying preview builds, setting up environment variables, testing APIs, and approving deployments on Cloudflare Pages.

## Overview

The application is deployed on Cloudflare Pages with automatic preview deployments for each pull request. This guide covers:

- Verifying preview builds
- Setting environment variables in Cloudflare dashboard
- Testing API endpoints
- Approval and merge checklists
- Troubleshooting common issues

## 1. Accessing Preview Builds

### Cloudflare Pages Dashboard

1. Navigate to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Go to **Workers & Pages** → **Pages**
4. Select your project (e.g., `next-starter-template`)
5. Click on the **Deployments** tab

### Preview URL Structure

Preview deployments are available at:
```
https://<commit-hash>.<project-name>.pages.dev
```

For pull requests:
```
https://<pr-number>.<project-name>.pages.dev
```

### Finding Your Preview

1. In the Deployments tab, find your branch or PR
2. Click on the deployment to see details
3. The URL is shown at the top: **Visit site** button
4. Each commit generates a unique deployment URL

## 2. Setting Environment Variables

### Cloudflare Pages Configuration

1. In your Cloudflare Pages project dashboard
2. Navigate to **Settings → Environment variables**
3. You can set variables for:
   - **Production** (main branch deploys)
   - **Preview** (PR and branch deploys)
   - **Both** (applies to all environments)

### Required Variables

See `docs/env-setup.md` for complete variable descriptions. At minimum, set:

**For All Environments:**
```
NEXT_PUBLIC_SITE_URL=https://your-site.pages.dev
```

**For Admin Features:**
```
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

**For Supabase (Optional):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**For B2 Storage (Optional):**
```
B2_KEY_ID=
B2_APP_KEY=
B2_BUCKET=
B2_ENDPOINT=
PUBLIC_B2_BASE_URL=
```

### Best Practices

- Use **Production** environment for sensitive production secrets
- Use **Preview** for testing with non-production credentials
- NEVER commit secrets to code (they're gitignored)
- After adding/changing variables, redeploy to apply them
- Document which variables are required vs. optional

## 3. Testing API Endpoints

### Health Check: Supabase Status

Test if Supabase is configured:

```bash
curl https://your-preview.pages.dev/api/supabase/status
```

Expected response:
```json
{
  "ok": true,
  "urlSet": true,    // or false if not configured
  "anonSet": true    // or false if not configured
}
```

### Admin API: B2 Presign (Admin-Only)

**Prerequisites:**
- Must be authenticated (currently uses `x-user-email` header for testing)
- Email must be in `ADMIN_EMAILS` list
- B2 environment variables must be set (or expect 503)

**Test without authentication:**
```bash
curl -X POST https://your-preview.pages.dev/api/admin/b2/presign \
  -H "Content-Type: application/json" \
  -d '{"key":"test.jpg"}'
```

Expected: `401 Not authenticated` or `503 Admin configuration missing`

**Test with non-admin user:**
```bash
curl -X POST https://your-preview.pages.dev/api/admin/b2/presign \
  -H "Content-Type: application/json" \
  -H "x-user-email: user@example.com" \
  -d '{"key":"test.jpg"}'
```

Expected: `403 Insufficient permissions`

**Test with admin but no B2 config:**
```bash
curl -X POST https://your-preview.pages.dev/api/admin/b2/presign \
  -H "Content-Type: application/json" \
  -H "x-user-email: admin@example.com" \
  -d '{"key":"test.jpg"}'
```

Expected (if B2 not configured):
```json
{
  "ok": false,
  "reason": "B2 not configured",
  "missing": {
    "keyId": true,
    "appKey": true,
    "bucket": true,
    "endpoint": true
  }
}
```

Expected (if B2 configured):
```json
{
  "ok": true,
  "url": "https://s3.us-west-000.backblazeb2.com/...",
  "method": "PUT",
  "headers": {},
  "expiresIn": 300
}
```

### Admin API: B2 Sync (Stub)

```bash
curl https://your-preview.pages.dev/api/admin/b2/sync \
  -H "x-user-email: admin@example.com"
```

Expected (if B2 configured):
```json
{
  "ok": true,
  "todo": "implement listing/sync later",
  "configured": true
}
```

Expected (if B2 not configured):
```json
{
  "ok": false,
  "reason": "B2 not configured"
}
```

## 4. Pre-Approval Checklist

Before approving/merging a PR, verify:

### Build & CI
- [ ] ✅ Build completes successfully in Cloudflare Pages
- [ ] ✅ No build errors or warnings
- [ ] ✅ `npm run lint` passes (check in CI logs)
- [ ] ✅ Preview deployment is accessible

### Environment Configuration
- [ ] ✅ Required environment variables are set in Cloudflare dashboard
- [ ] ✅ No secrets committed to code (check git diff)
- [ ] ✅ `.env.example` contains names only, no values
- [ ] ✅ `.gitignore` excludes `.env` files

### API Testing
- [ ] ✅ `/api/supabase/status` returns expected JSON
- [ ] ✅ Admin endpoints properly guard access (401/403 for unauthorized)
- [ ] ✅ Admin endpoints degrade gracefully when services not configured (503)
- [ ] ✅ No secrets exposed in API responses

### Documentation
- [ ] ✅ `docs/env-setup.md` is accurate and up-to-date
- [ ] ✅ Changes are documented in PR description
- [ ] ✅ Acceptance criteria (A→G) included in PR

### UI/UX (if applicable)
- [ ] ✅ Admin page shows admin tool links
- [ ] ✅ Member page shows placeholder content
- [ ] ✅ Pages render without console errors
- [ ] ✅ Responsive design works on mobile

## 5. Merge Approval Process

### For Maintainers

1. **Review Code Changes**
   - Check the PR diff for minimal, surgical changes
   - Verify no secrets or sensitive data committed
   - Ensure code follows project conventions

2. **Test Preview Deployment**
   - Follow the testing checklist above
   - Verify all API endpoints respond correctly
   - Check admin/member pages render properly

3. **Verify Documentation**
   - Ensure docs are updated if needed
   - Check that acceptance criteria are met
   - Confirm rollback plan is clear

4. **Approve & Merge**
   - Approve the PR in GitHub
   - Enable auto-merge if branch protection allows
   - Or manually merge when checks pass

5. **Post-Merge Verification**
   - Wait for production deployment
   - Test production site
   - Monitor for errors in Cloudflare dashboard

### For Contributors

1. **Ensure CI passes**
   - All checks green in PR
   - Build succeeds
   - No linting errors

2. **Update PR description**
   - Include A→G acceptance checklist
   - Link to parent tracker if applicable
   - Document testing steps

3. **Request review**
   - Tag appropriate reviewers
   - Respond to feedback promptly
   - Push fixes as needed

## 6. Troubleshooting

### Build Fails in Cloudflare Pages

**Symptom:** Deployment fails with build error

**Solutions:**
1. Check build logs in Cloudflare dashboard
2. Verify `package.json` scripts are correct
3. Ensure all dependencies are in `package.json`
4. Test build locally: `npm run build`
5. Check Node.js version compatibility

### Environment Variables Not Working

**Symptom:** API returns 503 or "not configured"

**Solutions:**
1. Verify variables are set in correct environment (Production/Preview)
2. Redeploy after adding variables (they're not applied to existing deployments)
3. Check variable names match exactly (case-sensitive)
4. Ensure no extra spaces in variable names or values
5. Test with `console.log` in API route (check function logs)

### Admin Endpoints Always Return 401

**Symptom:** Can't access admin APIs even with correct email

**Solutions:**
1. Check `ADMIN_EMAILS` is set in environment variables
2. Verify email format is correct (comma-separated, no spaces)
3. Check authentication headers are sent correctly
4. Remember: current implementation uses `x-user-email` header (placeholder for real auth)
5. In production, integrate with actual auth provider

### B2 Presign Returns 503

**Symptom:** Admin can't generate upload URLs

**Solutions:**
1. Verify ALL B2 variables are set: `B2_KEY_ID`, `B2_APP_KEY`, `B2_BUCKET`, `B2_ENDPOINT`
2. Check B2 credentials are valid in Backblaze dashboard
3. Ensure B2 bucket exists and is configured for S3-compatible API
4. Test credentials with AWS CLI or S3 client
5. Check endpoint URL format: `https://s3.us-west-000.backblazeb2.com`

### Preview URLs Not Working

**Symptom:** Can't access preview deployment

**Solutions:**
1. Wait a few minutes for deployment to complete
2. Check deployment status in Cloudflare dashboard
3. Verify build completed successfully
4. Try the unique commit hash URL instead of PR URL
5. Check DNS/network issues

## 7. Day-2 Operations

### Monitoring

- **Cloudflare Dashboard:** Monitor function invocations, errors, and performance
- **Analytics:** Check traffic, status codes, and response times
- **Logs:** View function logs for errors and debugging

### Regular Maintenance

- **Weekly:**
  - Review error logs
  - Check for failed deployments
  - Update dependencies if needed

- **Monthly:**
  - Audit environment variables
  - Review and rotate credentials
  - Update documentation

- **Quarterly:**
  - Security audit
  - Performance optimization
  - Dependency updates

### Incident Response

1. **Detection:** Monitor alerts and error logs
2. **Assessment:** Identify severity and impact
3. **Mitigation:** Roll back deployment if needed
4. **Investigation:** Analyze logs and reproduce issue
5. **Resolution:** Deploy fix and verify
6. **Post-mortem:** Document and prevent recurrence

## 8. Useful Links

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Supabase Docs:** https://supabase.com/docs
- **Backblaze B2 S3 API:** https://www.backblaze.com/b2/docs/s3_compatible_api.html

## 9. Quick Reference

### Common Commands

```bash
# Build locally
npm run build

# Run linter
npm run lint

# Start dev server
npm run dev

# Test API endpoint
curl https://your-site.pages.dev/api/supabase/status

# Deploy (if using CLI)
npm run deploy
```

### Environment Variable Checklist

```
✅ NEXT_PUBLIC_SITE_URL
✅ ADMIN_EMAILS
⭕ NEXT_PUBLIC_SUPABASE_URL (optional)
⭕ NEXT_PUBLIC_SUPABASE_ANON_KEY (optional)
⭕ SUPABASE_SERVICE_ROLE_KEY (optional)
⭕ B2_KEY_ID (optional)
⭕ B2_APP_KEY (optional)
⭕ B2_BUCKET (optional)
⭕ B2_ENDPOINT (optional)
⭕ PUBLIC_B2_BASE_URL (optional)
```

✅ = Required | ⭕ = Optional

---

**Last Updated:** 2025-10-17  
**Maintained By:** Development Team  
**Questions?** See `docs/env-setup.md` or contact repository owner
