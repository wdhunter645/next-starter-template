# Sub-Issue #5: Create Deployment Verification Automation

**Title:** Automate deployment verification checklist

**Labels:** `ci-cd`, `automation`, `testing`

**Parent Issue:** #[PARENT_ISSUE_NUMBER]

## Problem Statement

Deployment verification is currently manual (DEPLOYMENT_VERIFICATION.md contains a 50+ item checklist). Manual verification is error-prone, time-consuming, and blocks fast deployment cycles.

**Current process:**
1. Deploy to production
2. Manually visit each route
3. Check console for errors
4. Verify HTTPS redirect
5. Test responsive layout
6. 15-20 minutes per deployment

**Reference:** DEPLOYMENT_VERIFICATION.md

## Definition of Done

### Acceptance Criteria

1. Automated E2E tests replace manual checklist
2. Tests verify all public routes accessible
3. Tests check HTTPS redirect
4. Tests validate robots.txt and sitemap.xml
5. Tests run automatically after deployment
6. Results posted to PR or issue
7. Tests complete in <5 minutes

## Risks & Assumptions

**Risks:**
- E2E tests may be flaky
- Tests slower than manual spot-checks
- False positives blocking valid deploys

**Assumptions:**
- Playwright or Cypress suitable
- Production URLs accessible from CI
- No auth required for public routes

**Mitigations:**
- Retry logic for flaky tests
- Run tests in parallel
- Option to bypass on urgent fixes

## Deliverables Checklist

- [ ] Choose E2E framework (Playwright recommended)
- [ ] Install E2E testing dependencies
- [ ] Create test file: tests/e2e/deployment.spec.ts
- [ ] Write tests for all 10 public routes
- [ ] Write test for HTTPS redirect
- [ ] Write tests for robots.txt and sitemap.xml
- [ ] Write test for console errors
- [ ] Add E2E test script to package.json
- [ ] Create GitHub Actions workflow for E2E tests
- [ ] Configure to run post-deployment

## A→G Acceptance Loop

### A) Preconditions Verified
- [ ] E2E framework selected (Playwright)
- [ ] Production URL known and accessible
- [ ] CI/CD can access production site
- [ ] Deployment workflow exists

### B) Implementation Steps Executed
- [ ] Installed Playwright dependencies
- [ ] Created E2E test suite
- [ ] Tests cover all checklist items
- [ ] Created post-deploy workflow
- [ ] All tests passing

### C) Repo Health Checks Pass
- [ ] `npm run test:e2e` - All tests pass
- [ ] `npm run lint` - No errors
- [ ] `npm run build` - Successful
- [ ] CI pipeline includes E2E tests

### D) Minimal E2E Verification
**Exact commands:**
```bash
# Run E2E tests locally
npm run test:e2e

# Run specific test
npx playwright test deployment

# Run in CI mode
CI=true npm run test:e2e

# Generate test report
npx playwright show-report
```

**Expected results:**
- All 10 routes return 200
- HTTPS redirect works
- robots.txt accessible
- sitemap.xml valid
- No console errors
- Tests complete in <5 min

### E) Artifacts Updated
- [ ] tests/e2e/deployment.spec.ts (created)
- [ ] playwright.config.ts (created)
- [ ] package.json (E2E scripts added)
- [ ] .github/workflows/e2e-tests.yml (created)
- [ ] DEPLOYMENT_VERIFICATION.md (updated with automation note)
- [ ] CHANGELOG.md: "ci: automate deployment verification"

### F) Link PR(s) and Reference Parent
- [ ] PR: "ci: automate deployment verification with E2E tests"
- [ ] Closes #[THIS_ISSUE], part of #[PARENT_ISSUE]
- [ ] Labels: `ci-cd`, `automation`, `testing`

### G) Close with Post-Implementation Note
```markdown
## ✅ Completed

**Automation implemented:**
- 15 E2E tests replace manual checklist
- Tests run automatically post-deployment
- Results posted to GitHub Actions
- Execution time: 3-4 minutes

**Manual checklist:** Still available at DEPLOYMENT_VERIFICATION.md for reference

**Rollback:** Disable E2E workflow, revert to manual checks
```

---

**Estimated effort:** 4-5 hours  
**Complexity:** Medium-High
