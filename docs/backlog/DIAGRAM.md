# Operational Backlog Structure Diagram

## Issue Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  Parent Issue: Operational Backlog from After-Action Reports│
│                                                               │
│  Labels: ops, backlog, automation                            │
│  Status: Tracks 8 sub-issues                                 │
│  Location: docs/backlog/PARENT_ISSUE.md                      │
└───────────────────────────────┬─────────────────────────────┘
                                │
                ┌───────────────┴──────────────┐
                │                              │
                ▼                              ▼
    ┌──────────────────────┐      ┌──────────────────────┐
    │  Sub-Issue #1        │      │  Sub-Issue #2        │
    │  Consolidate Docs    │      │  Archive Reports     │
    │                      │      │                      │
    │  Priority: High      │      │  Priority: Medium    │
    │  Time: 2-3h          │      │  Time: 30m           │
    │  Labels: docs,       │      │  Labels: cleanup,    │
    │          cleanup     │      │          ops         │
    └──────────────────────┘      └──────────────────────┘
                │                              │
                ▼                              ▼
    ┌──────────────────────┐      ┌──────────────────────┐
    │  Sub-Issue #3 ⚠️     │      │  Sub-Issue #4        │
    │  Rotate Secrets      │      │  OAuth Tests         │
    │                      │      │                      │
    │  Priority: CRITICAL  │      │  Priority: High      │
    │  Time: 2-3h          │      │  Time: 3-4h          │
    │  Labels: security,   │      │  Labels: testing,    │
    │          critical    │      │          oauth       │
    └──────────────────────┘      └──────────────────────┘
                │                              │
                ▼                              ▼
    ┌──────────────────────┐      ┌──────────────────────┐
    │  Sub-Issue #5        │      │  Sub-Issue #6        │
    │  Deploy Automation   │      │  Monitoring/Logging  │
    │                      │      │                      │
    │  Priority: Medium    │      │  Priority: Medium    │
    │  Time: 4-5h          │      │  Time: 3-4h          │
    │  Labels: ci-cd,      │      │  Labels: security,   │
    │          automation  │      │          observability│
    └──────────────────────┘      └──────────────────────┘
                │                              │
                ▼                              ▼
    ┌──────────────────────┐      ┌──────────────────────┐
    │  Sub-Issue #7        │      │  Sub-Issue #8        │
    │  Token Refresh Docs  │      │  Onboarding Guide    │
    │                      │      │                      │
    │  Priority: Low       │      │  Priority: High      │
    │  Time: 2-3h          │      │  Time: 3-4h          │
    │  Labels: docs,       │      │  Labels: docs,       │
    │          oauth       │      │          onboarding  │
    └──────────────────────┘      └──────────────────────┘
```

## Work Phases

```
Phase 1 (Week 1) - Critical & Quick Wins
├─► Issue #3: Rotate Secrets (CRITICAL) ⚠️
├─► Issue #2: Archive Reports (Quick win)
└─► Issue #1: Consolidate Docs (High value)

Phase 2 (Week 2-3) - Testing & Improvement
├─► Issue #4: OAuth Tests
├─► Issue #8: Onboarding Guide
└─► Issue #5: Deploy Automation

Phase 3 (Future) - Enhancement
├─► Issue #6: Monitoring/Logging
└─► Issue #7: Token Refresh Docs
```

## Priority Matrix

```
High Priority + Low Effort         High Priority + High Effort
┌────────────────────────┐        ┌────────────────────────┐
│ #2 Archive Reports     │        │ #1 Consolidate Docs    │
│ #3 Rotate Secrets ⚠️   │        │ #4 OAuth Tests         │
│                        │        │ #8 Onboarding Guide    │
└────────────────────────┘        └────────────────────────┘
           ▲                                 ▲
           │                                 │
           │      START HERE                 │
           │                                 │
Low Priority + Low Effort          Low Priority + High Effort
┌────────────────────────┐        ┌────────────────────────┐
│ #7 Token Refresh Docs  │        │ #5 Deploy Automation   │
│                        │        │ #6 Monitoring/Logging  │
│                        │        │                        │
└────────────────────────┘        └────────────────────────┘
```

## PR Linking Structure

```
PR #79 (This PR)
  │
  ├─► Creates: docs/backlog/* (all specifications)
  ├─► Creates: create-backlog-issues.sh (automation)
  │
  └─► Links to Parent Issue
        │
        ├─► Parent Issue references PR #79
        └─► Each Sub-Issue references Parent Issue
              │
              └─► Future PRs close individual Sub-Issues
```

## Dependency Graph

```
No Dependencies (Can start immediately):
├─ Issue #2: Archive Reports
├─ Issue #3: Rotate Secrets ⚠️
├─ Issue #7: Token Refresh Docs
└─ Issue #8: Onboarding Guide

Depends on #1 (Consolidate Docs):
└─ Issue #8: Onboarding Guide (soft dependency)

Depends on OAuth implementation:
└─ Issue #4: OAuth Tests

Depends on deployment workflow:
└─ Issue #5: Deploy Automation

Depends on implementation completion:
└─ Issue #6: Monitoring/Logging
```

## A→G Acceptance Loop (All Sub-Issues)

```
┌─────────────────────────────────────────────┐
│ A) Preconditions Verified                   │
│    - Environment ready                      │
│    - Dependencies available                 │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ B) Implementation Steps Executed            │
│    - Code changes made                      │
│    - Documentation updated                  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ C) Repo Health Checks Pass                  │
│    - npm run lint ✓                         │
│    - npm run build ✓                        │
│    - npm run test ✓                         │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ D) Minimal E2E Verification                 │
│    - Exact commands documented              │
│    - URLs tested                            │
│    - Output verified                        │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ E) Artifacts Updated                        │
│    - README/CHANGELOG updated               │
│    - Screenshots if UI changes              │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ F) Link PR(s) and Reference Parent          │
│    - PR references sub-issue                │
│    - Sub-issue references parent            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ G) Close with Post-Implementation Note      │
│    - Summary of changes                     │
│    - Rollback instructions                  │
│    - Verification results                   │
└─────────────────────────────────────────────┘
```

## File Organization

```
/home/runner/work/next-starter-template/next-starter-template/
│
├── create-backlog-issues.sh        ← Automation script
│
└── docs/
    └── backlog/
        ├── README.md               ← Overview and index
        ├── COMPLETION_SUMMARY.md   ← This PR summary
        ├── SETUP_INSTRUCTIONS.md   ← Step-by-step guide
        ├── DIAGRAM.md              ← This file
        │
        ├── PARENT_ISSUE.md         ← Parent issue specification
        │
        └── Sub-issue specifications:
            ├── SUB_ISSUE_01_CONSOLIDATE_DOCS.md
            ├── SUB_ISSUE_02_ARCHIVE_REPORTS.md
            ├── SUB_ISSUE_03_ROTATE_SECRETS.md      ⚠️ CRITICAL
            ├── SUB_ISSUE_04_OAUTH_TESTS.md
            ├── SUB_ISSUE_05_DEPLOY_AUTOMATION.md
            ├── SUB_ISSUE_06_MONITORING.md
            ├── SUB_ISSUE_07_TOKEN_REFRESH_DOCS.md
            └── SUB_ISSUE_08_ONBOARDING_GUIDE.md
```

## Legend

```
⚠️  = Critical priority
├── = Has sub-items
└── = Last sub-item
│   = Continuation
▼   = Flows into
►   = Action item
✓   = Completed/verified
```

## Summary Statistics

- **Total Issues:** 9 (1 parent + 8 sub-issues)
- **Total Effort:** 20-27 hours
- **Critical Items:** 1 (Issue #3)
- **High Priority:** 3 (Issues #1, #4, #8)
- **Medium Priority:** 3 (Issues #2, #5, #6)
- **Low Priority:** 1 (Issue #7)
- **Documentation Lines:** ~40,000 characters
- **Files Created:** 13
