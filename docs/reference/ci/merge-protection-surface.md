---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: LGFC merge-protection required check surface, consolidated deterministic blockers, branch-protection naming alignment
Does Not Own: GitHub branch protection settings UI, reviewer lifecycle policy, PR hygiene policy, OPS runtime workflows
Canonical Reference: /docs/governance/PR_PROCESS.md
Related issues: #2175, #2184, #2208, #2228
Last Reviewed: 2026-07-04
---

# LGFC Merge Protection Surface

This controlled reference supports `/docs/governance/PR_PROCESS.md` by documenting the expected required-check surface for `main` after #2228 closeout.

## Required checks

Configure branch protection for `main` with these deterministic checks only:

| Job id | Workflow | Notes |
|---|---|---|
| `quality` | `GATE — Quality Checks` | Class-aware structure, ZIP, backend-ref guard, typecheck, lint, targeted tests, conditional build |
| `gitleaks` | `GATE — Secret Scan` | Secret exposure blocker |

## Advisory checks (active, non-blocking)

| Job id | Workflow | Notes |
|---|---|---|
| `pr-hygiene` | `GATE — PR Hygiene` | Stable PR-body validation; artifact + upsert comment |
| `diff-scope` | `GATE — Diff Scope` | Allowed-path diff validation; artifact + upsert comment |
| `reviewer-response-completion` | `GATE — Reviewer Response Completion` | GitHub-native reviewer lifecycle; artifact |

## Manual-only / paused (not merge blockers)

| Workflow | Disposition |
|---|---|
| `GATE — Intent Labeler` | Manual-only until rebuilt advisory-first |
| `GATE — PR Issue Accounting` | Manual-only while paused |
| `GATE — Drift Control` | Manual-only; rebuild later if needed |
| `GATE — Branch Freshness` | Manual-only; rebuild later if needed |
| `Docs Guardrails` | Manual-only; rebuild later if needed |
| `Design Compliance (Warn)` | Manual-only; rebuild later if needed |
| `GATE — Post-Merge Readiness` | Manual-only backfill; retired pre-merge auto-trigger |

## Retired from required checks

Remove these from branch protection if still listed:

- `check-no-zip-files`
- `post-merge-readiness`
- `pr-issue-accounting` (while manual-only)
- `drift` / `drift-gate`
- `branch-freshness`
- `docs_guardrails`
- `design_compliance_warn`
- `diff-scope` (until promoted after advisory evidence)
- `reviewer-response-completion` (until promoted after advisory evidence)
- `pr-hygiene` (until promoted after advisory evidence)

OPS runtime, post-merge closeout, and metrics workflows are not merge-protection checks.

## Live GitHub verification (operator)

Bill/Atlas must confirm live branch protection on `main` matches this reference. Repo-owned docs cannot mutate GitHub settings.

Operator steps:

1. Open repository **Settings → Branches → Branch protection rules** for `main`.
2. Under **Require status checks to pass**, confirm only `quality` and `gitleaks` are required.
3. Remove any retired checks listed above if still present.
4. Record confirmation in #2175 and #2208 before closing those issues.

## Validation

The validator lives at `scripts/ci/merge_protection_surface.mjs`.

## Rollback

Rollback through a specific Ops issue only after confirming replacement checks are active, deterministic, and low-noise.
