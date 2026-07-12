---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Current closeout-related workflow inventory excerpt and retirement disposition
Does Not Own: Complete repository workflow inventory, branch protection settings, or CI policy rationale
Canonical Reference: /docs/governance/PR_PROCESS.md
Related Issues: #1500, #2175, #2208, #2469
Last Reviewed: 2026-07-12
---

# GitHub Actions Closeout Workflow Inventory Excerpt

## Current closeout surface

| Workflow | Classification | Current role |
| --- | --- | --- |
| `post-merge-closeout.yml` | Operational | Single automatic source-issue validation and closeout owner |
| `post-merge-pr-body-closeout.yml` | Operational | Manual/backfill and active-manifest closeout |
| `post-merge-remediation.yml` | Operational | Failure remediation support |
| `ops-post-merge-self-healing.yml` | Operational | Scheduled/manual exception hygiene |
| `ops-pr-process-metrics.yml` | Operational | PR-process metrics |
| `ops-pr-issue-accounting.yml` | Manual-only | Pre-merge source-issue accounting while paused |
| `post-merge-intent-verification.yml` | Compatibility marker | Manual-only, read-only, no validation or mutation |

## Retired by #2469

- `ci-orchestration-engine.yml`
- `gate-close-work-issue.yml`
- `gate-reviewer-response.yml`
- parked legacy `ci.yml`, `deploy*.yml`, `lgfc-validate.yml`, `test.yml`, and `test-homepage.yml`
- the hardcoded legacy implementation formerly stored in `post-merge-intent-verification.yml`

The #1075 state file and phase-generation scripts are also retired. No current inventory may treat them as effective workflows or queue owners.

## Ownership rule

`.github/workflows/post-merge-closeout.yml` is the only automatic source-issue closeout owner. Supporting workflows may provide manual backfill, remediation, evidence, metrics, or scheduled cleanup, but must not race the same automatic mutation boundary.

## Required-check boundary

The current required PR checks are maintained in `/docs/reference/ci/merge-protection-surface.md`. Closeout and OPS workflows are not merge-protection checks.

## Exception boundary

Existing exception issues are handled incrementally through routine housekeeping. The #2469 retirement removes obsolete exception generation without disabling legitimate failure reporting.
