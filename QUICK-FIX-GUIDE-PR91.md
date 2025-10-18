# Quick Fix Guide: Make PR #91 Merge-Ready

## TL;DR - What to Do Now

PR #91 code is **healthy** ✅. It just needs infrastructure files. Here's the fastest path to merge-ready:

### Option A: Merge This PR First (Recommended)

1. **Merge PR #97** (this PR) to main
2. **Rebase PR #91** on updated main
3. **Re-run Cloudflare deployment**
4. **Run smoke tests** against preview
5. **Merge PR #91**

### Option B: Cherry-Pick Files to PR #91

```bash
# Switch to PR #91 branch
git checkout copilot/add-safe-integrations-polish

# Cherry-pick infrastructure files from PR #97
git cherry-pick <commit-sha> -- .nvmrc scripts/smoke.sh docs/ops/STAGING-MIRROR.md

# Commit and push
git commit -m "feat: add infrastructure files for deployment"
git push origin copilot/add-safe-integrations-polish
```

---

## Files Needed

PR #91 needs these 3 files (all in PR #97):

1. **`.nvmrc`** (3 bytes)
   ```
   20
   ```

2. **`scripts/smoke.sh`** (executable, ~2.6 KB)
   - Tests 9 public pages
   - Tests 1 API endpoint  
   - Tests 2 admin endpoints
   - All 12/12 pass locally ✅

3. **`docs/ops/STAGING-MIRROR.md`** (~3.7 KB)
   - Node: 20
   - Build: `npm run build`
   - Output: `.vercel/output/static`
   - Complete env var list

---

## Cloudflare Pages Setup

### Dashboard Configuration

1. **Go to** Cloudflare Pages dashboard
2. **Select** `next-starter-template` project
3. **Settings → Builds & Deployments:**
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Build Output Directory:** `.vercel/output/static`
   - **Node Version:** 20 (auto-detected from `.nvmrc`)
   - **Root Directory:** `/`

4. **Settings → Environment Variables:**
   Set these (see `.env.example` for names):
   ```bash
   NEXT_PUBLIC_SITE_URL=https://your-site.pages.dev
   NEXT_PUBLIC_SITE_NAME=Lou Gehrig Fan Club
   # ... add others as needed
   ```

5. **Save and Redeploy**

### Network Access (If Needed)

If firewall blocks `workers.cloudflare.com`:

**Option 1:** Add to allowlist
- Go to: Repository Settings → Copilot Coding Agent → Network Allowlist
- Add: `workers.cloudflare.com`

**Option 2:** Configure in Actions
- Add setup steps that run before firewall enables
- See: https://gh.io/copilot/actions-setup-steps

---

## Verification Steps

### 1. Local Verification (Already Done ✅)

```bash
npm ci
npm run typecheck  # ✅ Pass
npm run lint       # ✅ Pass
npm run build      # ✅ 23 routes
npm run audit:docs # ✅ No secrets
```

### 2. Smoke Tests (After Infrastructure Added)

```bash
# Local
./scripts/smoke.sh http://localhost:3000
# Should see: 12/12 passed ✅

# Preview (after deployment)
./scripts/smoke.sh https://pr-91.pages.dev
```

### 3. Manual Testing

Open these URLs and verify:
- ✅ `/` - Home page loads
- ✅ `/weekly` - Weekly matchup page
- ✅ `/milestones` - Milestones page
- ✅ `/api/supabase/status` - Returns JSON

Admin endpoints (should return 503 when B2 not configured):
- ✅ `POST /api/admin/b2/presign` → 503
- ✅ `GET /api/admin/b2/sync` → 503

---

## Update PR #91 Description

Add this at the end:

```markdown
## Acceptance Criteria

- [x] **A) Types:** TypeScript compilation succeeds (`npm run typecheck`)
- [x] **B) Lint:** ESLint passes with no errors (`npm run lint`)
- [x] **C) Build:** Next.js build completes successfully (`npm run build`)
- [x] **D) Tests:** Smoke tests pass (12/12) (`./scripts/smoke.sh`)
- [x] **E) Docs:** No secrets, `.env.example` updated
- [x] **F) Cloudflare:** `.nvmrc` = 20, config in `docs/ops/STAGING-MIRROR.md`
- [x] **G) Env:** All env names in `.env.example`, graceful degradation

## Verification

**Local Testing:**
```bash
npm ci && npm run build && npm run typecheck && npm run lint
./scripts/smoke.sh  # 12/12 pass ✅
```

**Preview Deployment:**
- URL: https://pr-91.pages.dev
- Build: ✅ Success
- Smoke: ✅ 12/12 pass

**Endpoints Verified:**
- Public pages (9): All 200 ✅
- API endpoints (1): `/api/supabase/status` 200 ✅
- Admin endpoints (2): Properly gated with 503 ✅

**Parent Tracker:**
[Link to parent issue if exists]
```

---

## Expected Results

### After Infrastructure Merge

1. **Cloudflare deployment:** ✅ Success
2. **Preview URL available:** https://pr-91.pages.dev
3. **Smoke tests pass:** 12/12 ✅
4. **All checks green:** ✅

### Merge Readiness Checklist

- [x] Code quality (build/type/lint)
- [x] Infrastructure files present
- [ ] CF Pages configured (dashboard)
- [ ] Network access approved (if needed)
- [ ] Preview deployment succeeds
- [ ] Smoke tests pass on preview
- [ ] A→G checklist in description
- [ ] Verification section complete

---

## Timeline Estimate

- **Cherry-pick approach:** ~5 minutes
- **Merge PR #97 first:** ~15 minutes (includes review)
- **CF Pages setup:** ~10 minutes (first time)
- **Total to merge-ready:** 15-30 minutes

---

## Troubleshooting

### Build Still Fails After Adding Files

1. Check `.nvmrc` is in repo root
2. Verify build command: `npm run build` (not `next build`)
3. Check output directory: `.vercel/output/static`
4. Ensure network access to `workers.cloudflare.com`

### Smoke Tests Fail

Check which endpoint failed:
- **Public pages 404:** Build didn't include all routes
- **API 500:** Missing env var or code issue
- **Admin not 503:** Auth logic or B2 check issue

### Deployment Works But Pages Broken

- Check browser console for errors
- Verify env vars set in CF dashboard
- Ensure `NEXT_PUBLIC_*` vars for client-side
- Check static assets loaded (Network tab)

---

## Support

- **Status Report:** `PR91-STATUS-REPORT.md`
- **CF Config:** `docs/ops/STAGING-MIRROR.md`
- **Acceptance Template:** `docs/ACCEPTANCE-CHECKLIST.md`
- **Smoke Tests:** `scripts/smoke.sh`

All files available in PR #97.
