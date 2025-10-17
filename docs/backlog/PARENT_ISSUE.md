# Parent Tracking Issue: Operational Backlog from After-Action Reports

**Title:** Operational Backlog from After-Action Reports

**Labels:** `ops`, `backlog`, `automation`

## Summary

This parent issue tracks operational follow-up work identified from analyzing after-action reports in the repository. These reports document completed implementations (devcontainer removal, OAuth setup, deployment fixes, etc.) and surface maintenance, cleanup, and enhancement opportunities.

### Key Findings

- **6 after-action reports** analyzed, documenting major implementations over the past weeks
- **Security issue identified**: .env file was briefly committed exposing 18 secrets (since remediated)
- **Documentation proliferation**: Multiple overlapping guides need consolidation
- **Testing gaps**: OAuth flow and deployment verification lack automated tests
- **Maintenance needs**: Report archival, secret rotation, monitoring enhancements

## Numbered Backlog

### 1. Consolidate Duplicate Documentation
**Priority:** High  
**Type:** Documentation cleanup  
Multiple authentication guides created during troubleshooting create confusion. Consolidate into clear hierarchy.

**Files affected:**
- START_HERE.md
- docs/TERMINAL_ONLY_AUTH.md
- docs/QUICK_FIX.md
- docs/GIT_AUTH_TROUBLESHOOTING.md
- docs/CODESPACES_TOKEN_SETUP.md

**Target:** Single onboarding guide + reference documentation

---

### 2. Archive Completed After-Action Reports
**Priority:** Medium  
**Type:** Repository cleanup  
Move completion reports to archived location to declutter root directory.

**Files to archive:**
- DEVCONTAINER_REMOVAL_COMPLETE.md
- IMPLEMENTATION_COMPLETE.md
- ISSUES_COMPLETE_REPORT.md
- SOLUTION_DELIVERED.md
- DEPLOYMENT_FIX.md
- DEPLOYMENT_VERIFICATION.md
- OAUTH_IMPLEMENTATION_SUMMARY.md
- ISSUE_31_COMPLETE.md
- ISSUE_34_COMPLETE.md
- QUICK_FIX_OAUTH.md

**Target location:** `docs/reports/YYYY-MM/`

---

### 3. Rotate Exposed Secrets
**Priority:** Critical  
**Type:** Security remediation  
Complete the security remediation for secrets briefly committed in .env file.

**Required actions:**
- Rotate all 18 exposed secrets (Supabase, Cloudflare, GitHub)
- Update repository secrets
- Verify .env.example is up to date
- Document rotation in security log

**Reference:** IMPLEMENTATION_COMPLETE.md (line 11-23)

---

### 4. Add Automated Tests for OAuth Flow
**Priority:** High  
**Type:** Testing infrastructure  
OAuth callback handler has no test coverage.

**Test requirements:**
- Unit tests for /api/auth/callback
- Mock GitHub OAuth responses
- Error handling tests
- Integration test for full flow

**Reference:** OAUTH_IMPLEMENTATION_SUMMARY.md (line 256-260)

---

### 5. Create Deployment Verification Automation
**Priority:** Medium  
**Type:** CI/CD enhancement  
Replace manual verification checklist with automated tests.

**Current:** Manual checklist in DEPLOYMENT_VERIFICATION.md  
**Target:** Automated E2E tests in CI workflow

**Tests needed:**
- Route accessibility (all public routes)
- HTTPS redirect
- robots.txt & sitemap.xml generation
- Footer version/SHA display
- Console error detection

**Reference:** DEPLOYMENT_VERIFICATION.md

---

### 6. Enhance Monitoring and Logging
**Priority:** Medium  
**Type:** Observability  
Add logging for security events and OAuth metrics.

**Requirements:**
- Security event logging (auth failures, token issues)
- OAuth flow metrics (success/failure rates)
- Deployment verification results
- Performance monitoring baseline

**Reference:** OAUTH_IMPLEMENTATION_SUMMARY.md (line 414)

---

### 7. Document Token Refresh Implementation
**Priority:** Low  
**Type:** Documentation + Future enhancement  
OAuth tokens expire but no refresh mechanism documented.

**Deliverables:**
- Design doc for token refresh flow
- Database schema for token storage
- Implementation guide
- Migration plan

**Reference:** OAUTH_IMPLEMENTATION_SUMMARY.md (line 391-395)

---

### 8. Create Unified Onboarding Guide
**Priority:** High  
**Type:** Documentation  
Synthesize all setup guides into single new developer onboarding doc.

**Target audience:** New developers/contributors  
**Scope:** First-time setup, common issues, where to get help

**Source materials:**
- START_HERE.md
- CONTRIBUTING.md
- Multiple docs/\*.md guides

**Target:** docs/ONBOARDING.md + updated README

---

## Working Agreement

- All sub-issues reference this parent issue
- Each sub-issue includes the A→G acceptance criteria loop
- Sub-issues close this parent via linked PRs
- Status updates posted as comments on this parent issue

## Related

- PR #79: Operationalize after-action reports (this PR)
- Reports analyzed: DEVCONTAINER_REMOVAL_COMPLETE.md, IMPLEMENTATION_COMPLETE.md, ISSUES_COMPLETE_REPORT.md, SOLUTION_DELIVERED.md, DEPLOYMENT_FIX.md, OAUTH_IMPLEMENTATION_SUMMARY.md
