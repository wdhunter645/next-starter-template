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

This controlled reference supports `/docs/governance/PR_PROCESS.md` by documenting the expected required-check surface for `main` after the PR-process rebuild (tasks 4–10).

## Required checks

Configure branch protection for `main` with these deterministic checks only:

| Job id | Workflow | Notes |
|---|---|---|
| `quality` | `GATE — Quality Checks` | Class-aware structure, ZIP, typecheck, lint, targeted tests, conditional build |
| `gitleaks` | `GATE — Secret Scan` | Secret exposure blocker |

`GATE — PR Issue Accounting` remains **manual-only** during #2208 and must not be required while paused.

## Advisory checks (active, non-blocking)

| Job id | Workflow | Notes |
|---|---|---|
| `pr-hygiene` | `GATE — PR Hygiene` | Stable PR-body validation; artifact + upsert comment |
| `diff-scope` | `GATE — Diff Scope` | Allowed-path diff validation; artifact + upsert comment |
| `reviewer-response-completion` | `GATE — Reviewer Response Completion` | GitHub-native reviewer lifecycle; artifact + upsert comment |

## Marker / paused checks (not final design)

| Workflow | Status |
|---|---|
| `GATE — Drift Control` | Marker no-op |
| `GATE — Branch Freshness` | Marker no-op |
| `Docs Guardrails` | Marker no-op |
| `Design Compliance (Warn)` | Marker no-op |
| `GATE — Intent Labeler` | Manual-only |
| `GATE — PR Issue Accounting` | Manual-only |

## Retired from required checks

Remove these from branch protection if still listed:

- `check-no-zip-files`
- `post-merge-readiness`
- `pr-issue-accounting` (while manual-only)
- `drift`
- `diff-scope` (until promoted after advisory evidence)
- `reviewer-response-completion` (until promoted after advisory evidence)
- `pr-hygiene` (until promoted after advisory evidence)

OPS runtime, post-merge closeout, and metrics workflows are not merge-protection checks.

## Live GitHub verification (operator)

Bill/Atlas must confirm live branch protection on `main` matches this reference. Repo-owned docs cannot mutate GitHub settings.

## Validation

The validator lives at `scripts/ci/merge_protection_surface.mjs`.

## Rollback

Rollback through a specific Ops issue only after confirming replacement checks are active, deterministic, and low-noise.
