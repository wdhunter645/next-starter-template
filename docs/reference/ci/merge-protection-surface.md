---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: LGFC merge-protection required check surface, consolidated deterministic blockers, branch-protection naming alignment
Does Not Own: GitHub branch protection settings UI, reviewer lifecycle gates, PR hygiene advisories, OPS runtime workflows
Canonical Reference: /docs/explanation/ci/lgfc-ci-production-design.md
Related Issues: #2175, #2184
Last Reviewed: 2026-07-04
---

# LGFC Merge Protection Surface

## Purpose

This reference documents the required status-check surface for `main` during the PR Process Redesign. The current priority is deterministic merge safety with low false-positive risk.

## Required Checks During PR-Process Repair

Use these required job ids for `main` branch protection:

- `quality` (`GATE — Quality Checks`)
- `gitleaks` (`GATE — Secret Scan`)
- `pr-issue-accounting` (`GATE — PR Issue Accounting`)

## Advisory Checks During Transition

These checks may run but should remain advisory until a follow-up Ops issue promotes them:

| Workflow file | Display name | Job id | Status |
|---|---|---|---|
| `gate-diff-scope.yml` | `GATE — Diff Scope` | `diff-scope` | Advisory |
| `reviewer-response-completion.yml` | `GATE — Reviewer Response Completion` | `reviewer-response-completion` | Advisory |
| `gate-drift.yml` | `GATE — Drift Control` | `drift` | Advisory |

## Retired Or Non-Blocking During Repair

Remove these from required status checks if present:

- `check-no-zip-files`
- `post-merge-readiness`
- `reviewer-response-completion`
- `drift`

OPS runtime and post-merge workflows are not merge-protection checks.

## Rationale

The repository had too many overlapping status surfaces. During the redesign, required checks should answer only deterministic merge-safety questions. Review lifecycle state belongs in GitHub reviews and review threads. Diff-scope and reviewer lifecycle can be promoted later after observation.

## Validation

The validator lives at `scripts/ci/merge_protection_surface.mjs`.

## Rollback

Rollback this reference and `scripts/ci/merge_protection_surface.mjs` to the prior required-check list only through a specific Ops issue.
