---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: LGFC merge-protection required check surface, consolidated deterministic blockers, branch-protection naming alignment
Does Not Own: GitHub branch protection settings UI, reviewer lifecycle gates, PR hygiene advisories, OPS runtime workflows
Canonical Reference: /docs/explanation/ci/lgfc-ci-production-design.md
Related Issues: #1226, #1195, #1075, #1058
Last Reviewed: 2026-06-11
---

# LGFC Merge Protection Surface

## Purpose

This reference documents the deterministic pre-merge blockers consolidated in
CI Task 002, with Program #1500 Task 001 adding the pre-merge
post-merge-readiness blocker. Merge protection should block only
machine-provable merge-safety failures that are locally attributable to the
pull request.

## Consolidated Workflows

| Workflow file | Display name | Job id | Responsibility |
|---|---|---|---|
| `gate-quality.yml` | `GATE — Quality Checks` | `quality` | Structure guard, backend guard, tracked-ZIP block, PR-range ZIP taint block, typecheck, lint, unit tests, production build |
| `gitleaks.yml` | `GATE — Secret Scan` | `gitleaks` | Secret exposure scan |
| `ops-pr-issue-accounting.yml` | `GATE — PR Issue Accounting` | `pr-issue-accounting` | Exactly one same-repository source Issue |
| `gate-post-merge-readiness.yml` | `GATE — Post-Merge Readiness` | `post-merge-readiness` | PR body sections, declared allowlist, forbidden placeholders, and trusted-reviewer dispositions required for post-merge closeout; executes trusted base-ref gate code on `pull_request_target` |

## Retired Duplicate Blockers

| Retired workflow | Reason |
|---|---|
| `gate-zip-safety.yml` (`check-no-zip-files`) | Tracked-ZIP enforcement assimilated into `gate-quality.yml` |

ZIP enforcement remains deterministic, but the duplicate standalone workflow is
removed so branch protection has one quality surface instead of overlapping ZIP
and quality jobs.

`gate-drift.yml` still contains legacy ZIP checks today. Those remain outside
Task 002 scope and are scheduled for drift-gate rebuild in later CI phases.
Task 002 removes the standalone duplicate blocker without waiting for drift
rebuild.

## Branch Protection Checklist

Configure `main` branch protection required status checks using these job ids:

- `quality`
- `gitleaks`
- `pr-issue-accounting`
- `post-merge-readiness`

Remove retired checks if they are still listed:

- `check-no-zip-files`

Do not add OPS runtime, PR hygiene advisory, or reviewer lifecycle workflows to
required status checks unless they are explicitly reclassified. Operator action
required after Program #1500 Task 001 merge: add `post-merge-readiness` to the
`main` branch-protection required status checks.

## Validation

The repository inventory validator lives at
`scripts/ci/merge_protection_surface.mjs`. Run it from the repository root
during CI Task 002 verification and post-merge closeout.

## Rollback

Restore the previous merge-protection workflow files and this reference
documentation only. Re-enable `gate-zip-safety.yml` and revert `gate-quality.yml`
ZIP/build consolidation if rollback is required.
