# Cloudflare Dashboard Fix Checklist

## Issue
PR #89 shows "Deploying with Cloudflare Workers → Deployment failed"

## Root Cause
Repository has Cloudflare GitHub App configured for **Workers** mode, but project deploys to **Pages**.

## Quick Fix (5 minutes)

### Option A: Disable Workers Integration (Recommended)

**Why:** Simplest fix. GitHub Actions already handles deployment correctly.

#### Steps:
1. [ ] Go to https://dash.cloudflare.com
2. [ ] Click **Workers & Pages** in left sidebar
3. [ ] Find **Workers** service named `next-starter-template`
4. [ ] Click on the service name
5. [ ] Go to **Settings** tab
6. [ ] Scroll down to **Danger Zone**
7. [ ] Click **Delete Project** or disable GitHub integration
8. [ ] Confirm deletion

#### Verify:
1. [ ] GitHub Actions deployment still works (check `.github/workflows/deploy.yml`)
2. [ ] Preview URLs still accessible: `https://<pr>.next-starter-template.pages.dev`
3. [ ] No more "Deploying with Cloudflare Workers" bot comments on PRs
4. [ ] Main branch deployments continue to work

---

### Option B: Reconfigure as Pages Integration (Alternative)

**Why:** Use Cloudflare's native auto-deploy for Pages.

#### Steps:
1. [ ] Complete Option A steps above (delete Workers integration)
2. [ ] Go to https://dash.cloudflare.com
3. [ ] Click **Workers & Pages** → **Pages**
4. [ ] Click **Create application**
5. [ ] Select **Connect to Git**
6. [ ] Choose GitHub → Select repository `wdhunter645/next-starter-template`
7. [ ] Configure build settings:
   - **Project name**: `next-starter-template`
   - **Production branch**: `main`
   - **Framework preset**: Next.js
   - **Build command**: `npx opennextjs-cloudflare build`
   - **Build output directory**: `.open-next/`
8. [ ] Click **Environment variables** → **Add variable**:
   - Copy all variables from Production environment
   - Or manually set required vars (see below)
9. [ ] Click **Save and Deploy**

#### Required Environment Variables:
```
NEXT_PUBLIC_SITE_URL=https://lougehrigfanclub.com
ADMIN_EMAILS=<your-admin-emails>
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
B2_KEY_ID=<your-b2-key-id>
B2_APP_KEY=<your-b2-app-key>
B2_BUCKET=<your-b2-bucket>
B2_ENDPOINT=<your-b2-endpoint>
PUBLIC_B2_BASE_URL=<your-b2-url>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
NEXTAUTH_SECRET=<your-nextauth-secret>
NEXTAUTH_URL=https://lougehrigfanclub.com
```

#### Verify:
1. [ ] Initial deployment completes successfully
2. [ ] Site accessible at production URL
3. [ ] Cloudflare bot comments show "Pages" deployment (not "Workers")
4. [ ] Preview URLs work for PRs
5. [ ] Consider disabling GitHub Actions deployment to avoid duplication

---

## After Fix

### Test Deployment:
```bash
# Push empty commit to PR #89
git checkout <pr-89-branch>
git commit --allow-empty -m "test: verify Cloudflare deployment fix"
git push
```

### Check Bot Comment:
- ✅ Option A: No Cloudflare bot comment (GitHub Actions only)
- ✅ Option B: Comment shows "Deploying with Cloudflare Pages" (not Workers)
- ❌ Should NOT see: "Deploying with Cloudflare Workers → Deployment failed"

### Update Documentation:
- [x] `.nvmrc` added (Node 20)
- [x] `docs/ops/STAGING-MIRROR.md` documents correct configuration
- [x] `docs/ops/CLOUDFLARE-WORKERS-FIX.md` explains root cause
- [ ] Update main README if needed

---

## Reference

**Supporting Files:**
- `.nvmrc` - Specifies Node.js 20
- `docs/ops/STAGING-MIRROR.md` - Complete staging setup guide
- `docs/ops/CLOUDFLARE-WORKERS-FIX.md` - Detailed root cause analysis

**Current Working Deployment:**
- GitHub Actions: `.github/workflows/deploy.yml`
- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `wrangler pages deploy .open-next/`
- Preview URLs: `https://<pr>.next-starter-template.pages.dev`

**Why This Happened:**
- Project has `wrangler.jsonc` and OpenNext config (Workers-compatible)
- Cloudflare GitHub App was set up for Workers mode
- But actual deployment uses Pages via GitHub Actions
- Result: GitHub App tries to deploy as Workers (fails), while GitHub Actions successfully deploys as Pages

---

**Estimated Time:** 2-5 minutes for Option A, 10-15 minutes for Option B  
**Complexity:** Low (dashboard changes only)  
**Risk:** None (GitHub Actions deployment unaffected)
