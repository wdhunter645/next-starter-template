# Operational Backlog from After-Action Reports

This directory contains the complete operational backlog derived from analyzing after-action reports in this repository.

## Quick Links

- **Parent Issue Specification:** [PARENT_ISSUE.md](PARENT_ISSUE.md)
- **Sub-Issues:** 8 items (see below)
- **Related PR:** #79

## Background

PR #79 was opened to operationalize after-action reports. This directory contains structured specifications for:
1. One parent tracking issue
2. Eight sub-issues (each with A→G acceptance criteria)
3. Instructions for creating these issues in GitHub

## How to Use This

### Option 1: Create Issues Manually

Copy the content from each file and create GitHub issues:

1. Create parent issue from `PARENT_ISSUE.md`
2. Create 8 sub-issues from `SUB_ISSUE_*.md` files
3. Link them as specified
4. Update PR #79 with the issue numbers

### Option 2: Use GitHub CLI (If Authenticated)

```bash
# Create parent issue
gh issue create --title "Operational Backlog from After-Action Reports" \
  --body-file docs/backlog/PARENT_ISSUE.md \
  --label "ops,backlog,automation"

# Create sub-issues (repeat for each)
gh issue create --title "[Title from file]" \
  --body-file docs/backlog/SUB_ISSUE_01_CONSOLIDATE_DOCS.md \
  --label "docs,cleanup,ops"
```

### Option 3: Automated Script (To Be Created)

A script could be added to automate issue creation.

## Sub-Issue Index

| # | Title | Priority | Complexity | Est. Time |
|---|-------|----------|------------|-----------|
| 1 | Consolidate Duplicate Documentation | High | Medium | 2-3h |
| 2 | Archive Completed After-Action Reports | Medium | Low | 30m |
| 3 | Rotate Exposed Secrets | **Critical** | Medium | 2-3h |
| 4 | Add Automated Tests for OAuth Flow | High | Medium | 3-4h |
| 5 | Create Deployment Verification Automation | Medium | Medium-High | 4-5h |
| 6 | Enhance Monitoring and Logging | Medium | Medium | 3-4h |
| 7 | Document Token Refresh Implementation | Low | Low | 2-3h |
| 8 | Create Unified Onboarding Guide | High | Medium | 3-4h |

**Total estimated effort:** 20-27 hours

## Issue Linking Structure

```
Parent Issue: "Operational Backlog from After-Action Reports"
  ├── Sub-Issue #1: Consolidate Duplicate Documentation
  ├── Sub-Issue #2: Archive Completed After-Action Reports
  ├── Sub-Issue #3: Rotate Exposed Secrets ⚠️ CRITICAL
  ├── Sub-Issue #4: Add Automated Tests for OAuth Flow
  ├── Sub-Issue #5: Create Deployment Verification Automation
  ├── Sub-Issue #6: Enhance Monitoring and Logging
  ├── Sub-Issue #7: Document Token Refresh Implementation
  └── Sub-Issue #8: Create Unified Onboarding Guide

PR #79 ──→ Links to parent issue
         └─→ Links to appropriate sub-issue(s)
```

## Labels to Create

Ensure these labels exist in your repository:

- `ops` - Operational work
- `backlog` - Backlog items
- `automation` - Automation tasks
- `docs` - Documentation
- `cleanup` - Code/repo cleanup
- `security` - Security-related
- `critical` - High priority security/blocking issues
- `testing` - Test infrastructure
- `ci-cd` - CI/CD pipeline
- `observability` - Monitoring/logging
- `oauth` - OAuth-related
- `onboarding` - Onboarding/DX improvements

## Status Comment Template

Use this template for the parent issue status comment:

```markdown
# Status Update: Operational Backlog

## What I Found

Analyzed 6 after-action reports documenting recent work:
- DEVCONTAINER_REMOVAL_COMPLETE.md
- IMPLEMENTATION_COMPLETE.md
- ISSUES_COMPLETE_REPORT.md
- SOLUTION_DELIVERED.md
- DEPLOYMENT_FIX.md
- OAUTH_IMPLEMENTATION_SUMMARY.md

**Key findings:**
- 🔴 Security issue: 18 secrets briefly exposed (needs rotation)
- 📚 Documentation proliferation: 5+ auth guides need consolidation
- ✅ Major implementations complete but lack automated tests
- 🔧 Maintenance opportunities: archival, monitoring, onboarding

## Backlog Created

Created 8 prioritized sub-issues:

1. **#[N]** - Consolidate duplicate documentation (High)
2. **#[N]** - Archive after-action reports (Medium)
3. **#[N]** - Rotate exposed secrets ⚠️ (CRITICAL)
4. **#[N]** - Add OAuth automated tests (High)
5. **#[N]** - Automate deployment verification (Medium)
6. **#[N]** - Enhance monitoring and logging (Medium)
7. **#[N]** - Document token refresh (Low)
8. **#[N]** - Create unified onboarding guide (High)

Each sub-issue includes:
- Clear problem statement
- Definition of Done
- Risks & assumptions
- Complete A→G acceptance criteria loop

## First PRs

PR #79 (this PR) establishes the backlog structure. Two immediate follow-up PRs recommended:

1. **PR for Issue #3** (Critical): Rotate exposed secrets
   - Highest priority security remediation
   - Should be started immediately

2. **PR for Issue #2** (Quick win): Archive reports
   - Low complexity, immediate value
   - Cleans up repository root

## Next Up

**Recommended sequence:**

**Phase 1 (Week 1):**
- Issue #3: Rotate secrets (CRITICAL) ← Start now
- Issue #2: Archive reports (quick win)
- Issue #1: Consolidate docs (high value)

**Phase 2 (Week 2-3):**
- Issue #4: OAuth tests
- Issue #8: Onboarding guide
- Issue #5: Deployment automation

**Phase 3 (Future):**
- Issue #6: Monitoring/logging
- Issue #7: Token refresh docs (when ready to implement)

**Total effort:** ~20-27 hours over 2-3 weeks
```

## A→G Acceptance Criteria

All sub-issues follow the repeatable A→G acceptance loop:

- **A)** Preconditions verified
- **B)** Implementation steps executed
- **C)** Build/lint/typecheck pass
- **D)** Minimal e2e verification (exact cmds/URLs)
- **E)** Artifacts updated (README/CHANGELOG/etc)
- **F)** Link PR(s) + reference parent
- **G)** Close with brief post-implementation note + rollback

## Notes

- All issue specifications are complete and ready to create
- Each sub-issue is independently executable
- Sub-issues can be worked in parallel (except #3 should go first)
- PR #79 description should be updated with issue numbers once created

## Meta

- **Created:** 2025-10-17
- **Context:** PR #79 - Operationalize after-action reports
- **Reports analyzed:** 6
- **Backlog items identified:** 8
- **Total specifications:** ~40KB of structured issue documentation
