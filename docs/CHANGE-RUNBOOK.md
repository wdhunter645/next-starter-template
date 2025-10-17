# Change Runbook (Copy for Each PR)
> One page. Prove the change is safe, verified, and documented.

## 1) Summary
- **Change title:** 
- **Scope (code/docs/config):** 
- **Risk level (Low/Med/High):** 
- **Why now:** 

## 2) Preconditions (A)
- [ ] Repo clean
- [ ] Required env names exist in CF Pages (no values in git)
- [ ] Secrets NOT logged or committed
- [ ] Affected services/components listed

## 3) Implementation (B)
- What changed (files/paths):
- Feature flags/toggles:
- Data/schema impact:

## 4) Health Checks (C)
Run locally or CI proves the same:
```bash
npm ci
npm run build
npm run typecheck
npm run lint
```
- [ ] Build passes
- [ ] Type check passes
- [ ] Lint passes
- [ ] No console errors in browser (if UI change)

## 5) Rollout & Verification (D)
- Deployment method (CF Pages/manual):
- Preview URL checked:
- Production smoke test:
- [ ] Preview deployed and tested
- [ ] Production deployment planned/completed

## 6) Monitoring & Rollback (E)
- Metrics/logs to watch:
- Rollback plan:
- [ ] Monitoring in place
- [ ] Rollback procedure documented

## 7) Documentation (F)
- [ ] README updated (if needed)
- [ ] API docs updated (if needed)
- [ ] Config/env docs updated (if needed)
- [ ] Inline comments added for complex logic

## 8) Sign-Off (G)
- [ ] Change tested in preview environment
- [ ] No secrets in code or logs
- [ ] Team notified (if high-risk)
- [ ] Runbook completed
- **Approved by:** 
- **Date:** 

---

## Tips for Completing This Runbook

### Risk Levels
- **Low:** Docs, comments, minor UI tweaks
- **Med:** New features, refactoring, config changes
- **High:** Schema changes, auth changes, breaking changes

### Health Check Scripts
If `typecheck` script doesn't exist, add it to package.json:
```json
"scripts": {
  "typecheck": "tsc --noEmit"
}
```

### Common Pitfalls
- Forgetting to test in preview environment
- Not documenting rollback steps
- Logging sensitive data
- Committing secrets or API keys
- Not updating docs when changing behavior

### Example: Low-Risk Change
```
Summary:
- Change title: Fix typo in README
- Scope: docs
- Risk level: Low
- Why now: Noticed during review

Preconditions (A):
- [x] Repo clean
- [x] No secrets
- [x] Affects: README.md only

Implementation (B):
- What changed: Fixed typo in installation section
- Feature flags: None
- Data impact: None

Health Checks (C):
- [x] Build passes (N/A for docs)
- [x] Lint passes

Documentation (F):
- [x] README updated (this is the change)

Sign-Off (G):
- [x] Tested
- [x] No secrets
- Approved by: @reviewer
- Date: 2025-10-17
```

### Example: Medium-Risk Change
```
Summary:
- Change title: Add user profile API endpoint
- Scope: code
- Risk level: Med
- Why now: Required for user settings feature

Preconditions (A):
- [x] Repo clean
- [x] SUPABASE_URL in CF Pages (not in git)
- [x] No secrets logged
- [x] Affects: API routes, user service

Implementation (B):
- What changed: 
  - src/app/api/user/profile/route.ts (new)
  - src/lib/user-service.ts (modified)
- Feature flags: None
- Data impact: Reads from users table

Health Checks (C):
- [x] Build passes
- [x] Type check passes
- [x] Lint passes
- [x] Tested API with curl

Rollout (D):
- Deployment: CF Pages auto-deploy
- Preview: https://abc123.next-starter.pages.dev
- Smoke test: curl /api/user/profile returns 200

Monitoring (E):
- Metrics: CF Analytics for /api/user/profile
- Rollback: Revert commit, redeploy
- [x] Set up alert for 5xx errors

Documentation (F):
- [x] API docs updated with new endpoint

Sign-Off (G):
- [x] Tested in preview
- [x] No secrets
- [x] Team notified
- Approved by: @lead
- Date: 2025-10-17
```

---

## Quick Checklist (Paste into PR)
```markdown
**Change Runbook Completed:**
- [ ] Summary filled
- [ ] Preconditions checked (A)
- [ ] Implementation documented (B)
- [ ] Health checks pass (C)
- [ ] Rollout planned (D)
- [ ] Monitoring setup (E)
- [ ] Documentation updated (F)
- [ ] Sign-off complete (G)
```
