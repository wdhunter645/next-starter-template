# PR Metadata Normalization Plan

This document describes the A→G acceptance checklists that should be added to PRs #89-91.

## Parent Issue Needed

**Title:** Website Buildout Plan (Phase: Stabilize → Ship)

**Body:**
```markdown
## Overview

This parent issue tracks the stabilization and ship readiness of the website buildout. All work is split into small, reversible PRs with A→G acceptance criteria.

## Goals

- Keep diffs tiny and CI green
- Make rollback trivial
- Ensure graceful degradation when services are not configured
- Document all verification steps

## Sub-PRs

- #89 - Staging mirror setup and documentation
- #90 - Ship minimal, reversible feature PRs
- #91 - Safe integrations with feature flags and admin gating

## Status

| PR | Title | CI | Smoke | Env-Absent | Blockers |
|----|-------|----|----|-----------|----------|
| #89 | Staging mirror setup | ⏳ | ⏳ | ⏳ | None |
| #90 | Feature PRs | ⏳ | ⏳ | ⏳ | None |
| #91 | Safe integrations | ⏳ | ⏳ | ⏳ | None |

Legend: ✅ = Pass, ❌ = Fail, ⏳ = Pending
```

---

## PR #89: Staging Mirror Setup

**Add to description:**

```markdown
---

## Verification

### Endpoints Added
- N/A (docs/infrastructure PR)

### Verification Steps
1. Review `scripts/smoke.sh` - validates all key endpoints
2. Review `docs/ops/SMOKE.md` - documents smoke test usage
3. Verify `npm run smoke` script is available

---

## Acceptance Checks (A→G)

### A) Preconditions verified
- [ ] Local dev env clean (git status clean)
- [ ] No .env changes required

### B) Implementation steps executed
- [ ] Created `scripts/smoke.sh` with endpoint tests
- [ ] Added `smoke` script to package.json
- [ ] Created `docs/ops/SMOKE.md` documentation
- [ ] Verified smoke test structure

### C) Repo health checks pass
- [ ] npm install - ✓
- [ ] npm run build - ✓ Compiled successfully
- [ ] npm run typecheck - ✓ No errors
- [ ] npm run lint - ✓ No errors

### D) Minimal e2e verification complete
- [ ] All existing routes still load
- [ ] Smoke script has executable permissions
- [ ] Documentation is comprehensive

### E) Artifacts updated
- [ ] scripts/smoke.sh - Endpoint verification script
- [ ] docs/ops/SMOKE.md - Smoke test documentation
- [ ] package.json - Added smoke script

### F) Link PR(s) and reference parent
- [ ] **Tracks**: #<PARENT_ISSUE_NUMBER>

### G) Post-implementation note

**Implemented:** Created smoke test infrastructure for validating all public pages and API endpoints. Script tests `/`, `/weekly`, `/milestones`, `/charities`, `/news`, `/calendar`, `/api/env/check`, and `/api/phase2/status`.

**Rollback:**
```bash
# Revert smoke test infrastructure
git revert <commit-sha>

# Or manually:
rm scripts/smoke.sh docs/ops/SMOKE.md
# Remove "smoke" script from package.json
```
```

---

## PR #90: Feature PRs

**Add to description:**

```markdown
---

## Verification

### Endpoints Added
- `/api/env/check` - Returns environment variable presence/absence (no values)
- `/api/phase2/status` - Returns service configuration health status

### URLs to Test
- `curl https://preview-url.pages.dev/api/env/check` - Should return JSON with env var booleans
- `curl https://preview-url.pages.dev/api/phase2/status` - Should return service health status

### Expected Behavior
- Both endpoints return 200 when accessed
- No secrets or values exposed in responses
- Only boolean presence/absence indicators

---

## Acceptance Checks (A→G)

### A) Preconditions verified
- [ ] Local dev env clean (git status clean)
- [ ] No .env changes required (endpoints work without envs)

### B) Implementation steps executed
- [ ] Created `/api/env/check` endpoint
- [ ] Created `/api/phase2/status` endpoint
- [ ] Updated `.env.example` with env names (if needed)
- [ ] Verified endpoints return 200

### C) Repo health checks pass
- [ ] npm install - ✓
- [ ] npm run build - ✓ Compiled successfully
- [ ] npm run typecheck - ✓ No errors
- [ ] npm run lint - ✓ No errors

### D) Minimal e2e verification complete
- [ ] `/api/env/check` returns JSON with env var status
- [ ] `/api/phase2/status` returns service health JSON
- [ ] No secrets exposed in responses
- [ ] Endpoints work without env vars configured

### E) Artifacts updated
- [ ] src/app/api/env/check/route.ts - Env status endpoint
- [ ] src/app/api/phase2/status/route.ts - Service health endpoint
- [ ] .env.example - Updated with new env names (if any)

### F) Link PR(s) and reference parent
- [ ] **Tracks**: #<PARENT_ISSUE_NUMBER>

### G) Post-implementation note

**Implemented:** Created health check API endpoints for environment and service status verification. Both endpoints work without configuration and never expose secrets.

**Env-Absent Behavior:**
- `/api/env/check` - Returns false for missing vars (graceful)
- `/api/phase2/status` - Returns "not configured" status for missing services

**Rollback:**
```bash
# Revert API endpoints
git revert <commit-sha>

# Or manually:
rm -rf src/app/api/env src/app/api/phase2
```
```

---

## PR #91: Safe Integrations

**Add to description:**

```markdown
---

## Verification

### Endpoints Verified
- `/api/admin/b2/presign` - Returns 503 when B2 not configured
- `/api/admin/b2/sync` - Returns 503 when B2 not configured
- `/api/supabase/status` - Returns configuration status

### Env-Absent Behavior Verified
- ✅ B2 endpoints return 503 with `{reason: "B2 not configured"}` when envs missing
- ✅ Admin endpoints return 401/403 when not authenticated (never 500)
- ✅ Supabase status returns graceful boolean status

### URLs to Test
```bash
# B2 presign (requires auth)
curl -X POST https://preview-url.pages.dev/api/admin/b2/presign

# B2 sync (requires auth)
curl https://preview-url.pages.dev/api/admin/b2/sync

# Supabase status (public)
curl https://preview-url.pages.dev/api/supabase/status
```

---

## Acceptance Checks (A→G)

### A) Preconditions verified
- [ ] Local dev env clean (git status clean)
- [ ] No .env changes required (graceful degradation works)

### B) Implementation steps executed
- [ ] Verified B2 endpoints return 503 when not configured
- [ ] Verified admin endpoints return 401/403 without auth
- [ ] Confirmed no 500 errors for missing envs
- [ ] Updated .env.example with all env names

### C) Repo health checks pass
- [ ] npm install - ✓
- [ ] npm run build - ✓ Compiled successfully
- [ ] npm run typecheck - ✓ No errors
- [ ] npm run lint - ✓ No errors

### D) Minimal e2e verification complete
- [ ] B2 presign returns 503 without B2 envs
- [ ] B2 sync returns 503 without B2 envs
- [ ] Admin APIs return 401/403 without auth
- [ ] Supabase status returns graceful boolean status
- [ ] No secrets exposed in error messages

### E) Artifacts updated
- [ ] src/app/api/admin/b2/presign/route.ts - Returns 503 when not configured
- [ ] src/app/api/admin/b2/sync/route.ts - Returns 503 when not configured
- [ ] src/app/api/supabase/status/route.ts - Returns boolean status
- [ ] .env.example - All env names present

### F) Link PR(s) and reference parent
- [ ] **Tracks**: #<PARENT_ISSUE_NUMBER>

### G) Post-implementation note

**Implemented:** Verified all integration endpoints handle missing environment variables gracefully. B2 endpoints return 503 when not configured, admin endpoints return 401/403 without auth, and no 500 errors occur.

**Env-Absent Behavior:**
- B2 endpoints: 503 with `{reason: "B2 not configured", missing: {...}}`
- Admin endpoints: 401/403 without ADMIN_EMAILS or valid session
- Supabase: Returns `{ok: true, urlSet: false, anonSet: false}`

**Rollback:**
```bash
# No new code added - verification PR only
# If changes were made, revert:
git revert <commit-sha>
```
```

---

## Notes

Since I cannot directly update PR descriptions via GitHub API, these checklists should be manually added to each PR description by appending them to the existing text.

The parent issue should also be created manually and PRs #89-91 should be linked to it by updating their descriptions to include:

```markdown
**Tracks**: #<PARENT_ISSUE_NUMBER>
```

Where <PARENT_ISSUE_NUMBER> is the issue number of the parent issue created.
