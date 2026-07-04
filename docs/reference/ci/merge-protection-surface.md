---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: LGFC merge-protection required check surface, consolidated deterministic blockers, branch-protection naming alignment
Does Not Own: GitHub branch protection settings UI, reviewer lifecycle policy, PR hygiene policy, OPS runtime workflows
Canonical Reference: /docs/governance/PR_PROCESS.md
Related issues: #2175, #2184, #2208
Last Reviewed: 2026-07-04
---

# LGFC Merge Protection Surface

This controlled reference supports `/docs/governance/PR_PROCESS.md` by documenting the expected required-check surface for `main` during the PR-process redesign.

## Purpose

This reference documents the required status-check surface for `main` during the PR Process Redesign. The current priority is deterministic merge safety with low false-positive risk.

## Required checks during PR-process repair

Use deterministic required checks only. The current reduced reference surface is:

- `quality` (`GATE — Quality Checks`)
- `gitleaks` (`GATE — Secret Scan`)

`GATE — PR Issue Accounting` has been paused/manual-only during #2208 and should not be required while it is manual-only.

## Advisory or safe-mode checks during transition

These checks may run but should remain advisory, marker-only, or manual-only until a follow-up issue promotes them after validation:

| Workflow file | Display name | Job id | Current transition status |
|---|---|---|---|
| `gate-diff-scope.yml` | `GATE — Diff Scope` | `diff-scope` | Manual-only |
| `gate-intent-labeler.yml` | `GATE — Intent Labeler` | `label-intent` | Manual-only |
| `ops-pr-issue-accounting.yml` | `GATE — PR Issue Accounting` | `pr-issue-accounting` | Manual-only |
| `reviewer-response-completion.yml` | `GATE — Reviewer Response Completion` | `reviewer-response-completion` | Marker/safe-mode |
| `gate-drift.yml` | `GATE — Drift Control` | `drift` | Marker/safe-mode |
| `gate-branch-freshness.yml` | `GATE — Branch Freshness` | `branch-freshness` | Marker/safe-mode |
| `docs-guardrails.yml` | `Docs Guardrails` | varies | Marker/safe-mode |
| `design-compliance-warn.yml` | `Design Compliance (Warn)` | varies | Marker/safe-mode |

## Retired or non-blocking during repair

Remove these from required status checks if present:

- `check-no-zip-files`
- `post-merge-readiness`
- `reviewer-response-completion`
- `drift`
- `diff-scope`
- `label-intent`
- `pr-issue-accounting` while manual-only

OPS runtime and post-merge workflows are not merge-protection checks.

## Rationale

The repository had too many overlapping status surfaces. During the redesign, required checks should answer only deterministic merge-safety questions. Review lifecycle state belongs in GitHub reviews and review threads. Diff-scope, reviewer lifecycle, issue accounting, and PR hygiene can be promoted later after advisory observation.

## Validation

The validator lives at `scripts/ci/merge_protection_surface.mjs`.

## Rollback

Rollback this reference and `scripts/ci/merge_protection_surface.mjs` to a broader required-check list only through a specific Ops issue and after confirming the checks are active, deterministic, and low-noise.
