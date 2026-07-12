---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Current CI workflow classification by lifecycle domain and retirement status
Does Not Own: Workflow implementation details or branch protection settings
Canonical Reference: /docs/governance/PR_PROCESS.md
Related Issues: #1058, #2175, #2208, #2469
Last Reviewed: 2026-07-12
---

# LGFC Workflow Classification Matrix

## Required merge protection

| Workflow | Classification | Current role |
| --- | --- | --- |
| `gate-quality.yml` | Keep | Deterministic class-aware quality blocker |
| `gitleaks.yml` | Keep | Secret exposure blocker |

## Active advisory PR checks

| Workflow | Classification | Current role |
| --- | --- | --- |
| `gate-pr-hygiene.yml` | Keep advisory | Stable PR-body hygiene |
| `gate-diff-scope.yml` | Keep advisory | Allowed-path diff assessment |
| `reviewer-response-completion.yml` | Keep advisory | GitHub-native reviewer and thread assessment |

## Manual-only / paused

| Workflow | Classification | Current role |
| --- | --- | --- |
| `gate-intent-labeler.yml` | Rebuild only if justified | Manual-only |
| `ops-pr-issue-accounting.yml` | Rebuild only if justified | Manual-only |
| `gate-drift.yml` | Rebuild only if justified | Manual-only |
| `gate-branch-freshness.yml` | Rebuild only if justified | Manual-only |
| `docs-guardrails.yml` | Rebuild only if justified | Manual-only |
| `design-compliance-warn.yml` | Rebuild only if justified | Manual-only |
| `gate-post-merge-readiness.yml` | Retired automatic role | Manual backfill only |

## Post-merge and operations

| Workflow | Classification | Current role |
| --- | --- | --- |
| `post-merge-closeout.yml` | Keep | Single automatic source-issue closeout owner |
| `post-merge-pr-body-closeout.yml` | Keep bounded | Manual/backfill closeout |
| `post-merge-remediation.yml` | Keep bounded | Failure remediation support |
| `ops-post-merge-self-healing.yml` | Keep bounded | Scheduled/manual exception hygiene |
| `diataxis-post-merge-validate.yml` | Keep support | Documentation evidence |
| `ops-assess.yml` | Keep OPS | Site assessment |
| `production-audit.yml` | Keep OPS | Production invariant audit |
| `snapshot.yml` | Keep OPS | Snapshot and rollback evidence |
| `b2-s3-smoke-test.yml` | Keep OPS | B2 smoke testing |
| `b2-d1-daily-sync.yml` | Keep OPS | B2/D1 synchronization |
| `post-merge-intent-verification.yml` | Compatibility marker | Manual-only, read-only, no mutation |

## Retired by #2469

- `ci-orchestration-engine.yml`
- `gate-reviewer-response.yml`
- `gate-close-work-issue.yml`
- parked legacy `ci.yml`, `deploy*.yml`, `lgfc-validate.yml`, `test.yml`, and `test-homepage.yml`
- fixed #1075 state and phase-generation scripts
- hardcoded maintainer-body logic formerly in `post-merge-intent-verification.yml`

## Architectural rule

Current CI separates deterministic merge safety, advisory branch hygiene, single-owner post-merge closeout, and production operations. Retired #1075 assets must not be restored through historical plans or stale issue state.
