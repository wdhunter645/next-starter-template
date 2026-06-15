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

This inventory records the current GitHub Actions workflow surface for Issue #1058 Phase 1. It is an as-observed reference used to plan later narrow PRs for naming alignment, reviewer-gate redesign, consolidation, and blocker/advisory normalization.

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
- Task 002 merged (post-merge closeout consolidation, PR #1567 / #1545)
- Task 003 merged (post-merge closeout metadata/check hardening)
- Task 004 merged and closed out (manifest pruning / batch closeout stabilization)
- Task 005 active under #1548 (CI/orchestration documentation reconciliation)

Use the as-built reconciliation doc and domain surface references for
current merged truth:

- `docs/reference/ci/merge-protection-surface.md`
- `docs/reference/ci/pr-hygiene-foundation.md`
- `docs/reference/ci/reviewer-lifecycle-surface.md`
- `docs/reference/ci/post-merge-validation-surface.md`
- `docs/reference/ci/ops-runtime-surface.md`

Rows that remain materially stale until a full inventory rewrite include
`gate-zip-safety.yml` (retired) and several historical OPS workflow descriptions
in the table below. Post-merge closeout ownership rows were refreshed on
2026-06-15 for Program #1500 Task 005. The full workflow count and remaining rows
remain deferred to the broader inventory rewrite.

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
| `gate-close-work-issue.yml` | gate-close-work-issue | Parked no-op legacy issue closer; performs no issue mutation. | `pull_request_target` closed | Parked | None | none | No | Low | Replaced by `post-merge-closeout.yml` for post-merge source issue closeout and by `ops-pr-issue-accounting.yml` for pre-merge issue accounting. | Yes |
| `post-merge-closeout.yml` | Post-Merge Detection | Sole automatic post-merge source-issue closeout owner for merged PRs to `main`: validate, single sync path, remediation handoff, and close source issue only when authorized evidence passes. | `pull_request_target` closed (merged to `main`) | Operational | Post-merge closeout | checkout, Node, `run_post_merge_closeout.mjs`, gh, `post_merge_reviewer_audit.mjs` | Yes, via closed PR event | Medium | Owns automatic source issue closeout; must not race parked legacy closeout gates. | No |
| `ops-pr-issue-accounting.yml` | OPS - PR Issue Accounting | Normalize and verify one source Issue per PR before merge. | `pull_request_target` | Blocking | Issue-first PR accounting | GitHub Script | Yes | Medium | Owns pre-merge issue accounting only; does not close source issues. | Redesign candidate |

## Inventory Rewrite Boundary

This Task 005 reconciliation intentionally narrows the table to closeout-related
rows needed to remove effective/ineffective conflicts. A full mechanical workflow
inventory rewrite remains separate work and must not be inferred from this
narrow closeout ownership reconciliation.
