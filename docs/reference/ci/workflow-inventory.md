---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Program #1500 closeout workflow inventory excerpt, classification, overlap notes, deprecation candidates
Does Not Own: Complete workflow inventory, workflow implementation, branch protection settings, CI architecture rationale
Canonical Reference: /docs/reference/ci/github-actions_MASTER.md
Related Issues: #1199, #1058, #1545, #1548
Last Reviewed: 2026-06-15
---

# GitHub Actions Closeout Workflow Inventory Excerpt

## Purpose

This reference records the closeout-related GitHub Actions workflow surface for
Program #1500 Task 005. It is a closeout ownership excerpt, not the complete
repository workflow inventory.

## Scope

This excerpt covers closeout-related workflows under `.github/workflows/`. It
does not claim to enumerate every workflow file in the repository, change
workflow behavior, or define branch protection requirements.

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
| `gate-post-merge-readiness.yml` | GATE — Post-Merge Readiness | Pre-merge readiness check for PR metadata, allowlist evidence, and reviewer disposition. | `pull_request_target` | Blocking | pre-merge readiness | checkout, Node, readiness gate | Yes | Medium | Mirrors the post-merge metadata subset before merge. | No |
| `post-merge-closeout.yml` | Post-Merge Detection | Primary automatic post-merge reconciliation workflow for merged PRs to `main`. | `pull_request_target` closed (merged to `main`) | Operational | post-merge reconciliation | checkout, Node, reconciliation runner, gh, reviewer audit helper | Yes | Medium | Owns the automatic post-merge reconciliation path. | No |
| `post-merge-pr-body-closeout.yml` | Post-Merge PR Body Closeout | Manual and backfill reconciliation. | workflow dispatch / push backfill | Operational | manual/backfill reconciliation | Node, batch manifest, helper scripts | Yes | Medium | Supports manual and batch reconciliation only. | No |
| `post-merge-intent-verification.yml` | Post-Merge Maintainer Body Apply | Targeted automatic and dispatch maintainer support path. | targeted PR synchronize / workflow dispatch | Support | targeted maintainer support | Node, validator helper | Yes | Medium | Targeted legacy support path; not broad ownership. | Redesign candidate |
| `post-merge-remediation.yml` | Post-Merge Remediation | Remediation workflow after failed post-merge validation. | post-merge detection handoff | Operational | remediation | Node, remediation helper | Yes | Medium | Runs after failed validation only. | No |
| `gate-close-work-issue.yml` | gate-close-work-issue | Parked no-op legacy workflow. | `pull_request_target` closed | Parked | None | none | No | Low | Replaced by the current post-merge and pre-merge accounting surfaces. | Yes |
| `ops-pr-issue-accounting.yml` | OPS - PR Issue Accounting | Normalize and verify one linked ticket per PR before merge. | `pull_request_target` | Blocking | ticket-first PR accounting | GitHub Script | Yes | Medium | Owns pre-merge accounting only. | Redesign candidate |

## Inventory Rewrite Boundary

This Task 005 reconciliation updates the closeout-related rows needed to remove
effective/ineffective conflicts. A full mechanical workflow inventory rewrite
remains separate work and must not be inferred from this closeout ownership
excerpt.
