---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Current workflow inventory, classification, overlap notes, deprecation candidates
Does Not Own: Workflow implementation, branch protection settings, CI architecture rationale
Canonical Reference: /docs/reference/ci/github-actions_MASTER.md
Related Issues: #1199, #1058, #1545, #1548
Last Reviewed: 2026-06-15
---

# GitHub Actions Workflow Inventory

## Purpose

This inventory records the current GitHub Actions workflow surface for issue #1058 Phase 1. It is an as-observed reference used to plan later narrow PRs for naming alignment, reviewer-gate redesign, consolidation, and blocker/advisory normalization.

## Scope

The inventory covers every `*.yml` workflow under `.github/workflows/` as of 2026-05-19. It does not change workflow behavior and does not define branch protection requirements.

## Current Known Truth

There are 54 workflow files on `main` as of 2026-06-03. The authoritative
as-built reconciliation for the `#1075` CI redesign is
`docs/reference/ci/lgfc-ci-as-built-reconciliation.md`.

Merged redesign phases on `main`:

- Task 001 PR hygiene advisories
- Task 002 merge protection consolidation (`gate-zip-safety.yml` retired)
- Task 003 reviewer lifecycle redesign (PR #1239)
- Task 004 post-merge validation expansion (PR #1240)
- Task 005 OPS runtime consolidation (PR #1242)

Task 005 merged before Task 004 without file conflicts because the domains are
disjoint.

Program #1500 closeout stabilization on `main`:

- Task 001 merged (pre-merge post-merge-readiness gate)
- Task 002 merged (post-merge consolidation, PR #1567 / #1545)
- Task 003 merged (metadata/check hardening)
- Task 004 merged and reconciled (manifest pruning / batch stabilization)
- Task 005 active under #1548 (CI/orchestration documentation reconciliation)

Use the as-built reconciliation doc and domain surface references for
current merged truth:

- `docs/reference/ci/merge-protection-surface.md`
- `docs/reference/ci/pr-hygiene-foundation.md`
- `docs/reference/ci/reviewer-lifecycle-surface.md`
- `docs/reference/ci/post-merge-validation-surface.md`
- `docs/reference/ci/ops-runtime-surface.md`

This Task 005 reconciliation refreshes selected closeout-related rows only. The
complete closeout surface table remains in
`docs/reference/ci/post-merge-validation-surface.md`; use that reference for
readiness, manual/backfill, body-apply, remediation, and parked legacy workflow
coverage.

## Intended Final State

Each workflow should have a clear owner, visible name, filename, trigger class, blocking/advisory status, protected scope, dependency list, and deprecation or consolidation recommendation. Future phases should reduce false positives, remove stale workflow surfaces, and make GitHub Checks panel names easy to map back to workflow files.

## Classification Legend

- `Blocking`: intended to fail PRs or protected integration when a concrete required condition fails.
- `Advisory`: reports warnings or guidance and should not block merge readiness.
- `Operational`: scheduled, manual, post-merge, deployment, audit, or maintenance workflow outside normal PR gating.
- `Support`: automation support for agents, orchestration, setup, or comments.
- `Parked`: legacy no-op workflow retained temporarily.

## Workflow Inventory

| YAML filename | Visible workflow name | Purpose | Triggers | Class | Protected scope | Dependencies | PR body parsing | False-positive risk | Overlap / redundancy | Deprecation candidate |
|---|---|---|---|---|---|---|---|---|---|---|
| `gate-close-work-issue.yml` | gate-close-work-issue | Parked no-op legacy workflow. | `pull_request_target` closed | Parked | None | none | No | Low | Replaced by the current post-merge and pre-merge accounting surfaces. | Yes |
| `post-merge-closeout.yml` | Post-Merge Detection | Primary automatic post-merge reconciliation workflow for merged PRs to `main`. | `pull_request_target` closed (merged to `main`) | Operational | Post-merge reconciliation | checkout, Node, closeout runner, gh, reviewer audit helper | Yes | Medium | Owns the automatic post-merge reconciliation path. | No |
| `ops-pr-issue-accounting.yml` | OPS - PR Issue Accounting | Normalize and verify one linked ticket per PR before merge. | `pull_request_target` | Blocking | ticket-first PR accounting | GitHub Script | Yes | Medium | Owns pre-merge accounting only. | Redesign candidate |

## Inventory Rewrite Boundary

This Task 005 reconciliation intentionally narrows the table to closeout-related
rows needed to remove effective/ineffective conflicts. A full mechanical workflow
inventory rewrite remains separate work and must not be inferred from this
narrow closeout ownership reconciliation.
