---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: CI Stage 0 tooling boundary inventory for CI-001 and CI-002 implementation
Does Not Own: Live script behavior, workflow branch protection, or merge authorization
Canonical Reference: /docs/ops/reports/ci-stage-0-current-state-gap-analysis.md
Related Issues: #2435, #2436, #2437, #2431
Last Reviewed: 2026-07-21
---

# CI Stage 0 Tooling Boundary Inventory

## Purpose

Provide a durable reference for CI-001 and CI-002 implementers defining what exists, what is missing, and what must not be modified.

## Scope

Pre-merge PR hygiene/preclearance and post-merge administrative closeout surfaces only. Full workflow inventory remains in `pr-workflow-ci-inventory.md` and `workflow-inventory.md`.

## Current known truth

CI Stage 0 gap analysis (#2435) confirmed:

- PR body **generation** and **pre-open preclearance** do not exist; post-open audit and repair do.
- Post-merge **classification contract** exists; administrative **apply-mode auto-repair** does not.
- `post-merge-closeout.yml` remains the sole automatic closeout owner.

## Intended final state

CI-001 and CI-002 fill documented gaps without replacing existing owners. Shared validation rules stay centralized to prevent drift.

## Pre-merge surface

| Path | Exists | Role | CI-001 |
| --- | --- | --- | --- |
| `scripts/ci/pr_hygiene_audit.mjs` | Yes | Post-open advisory audit | Extend shared validators |
| `scripts/ci/pr_body_auto_repair.mjs` | Yes | Post-open body repair | Do not touch |
| `scripts/ci/run_pr_body_auto_repair.mjs` | Yes | GitHub API repair runner | Do not touch |
| `scripts/ci/pr_preflight.mjs` | Yes | Local unified preflight | Complement only |
| `scripts/ci/issue_accounting.mjs` | Yes | Source issue parsing | Reuse rules |
| `scripts/ci/pr_body_generator.mjs` | No | Pre-open body generator | Create (#2436) |
| `scripts/ci/validate_pr_body.mjs` | No | Pre-open preclearance | Create (#2436) |
| `docs/reference/ci/pr-body-generator-contract.md` | No | Generator contract | Create (#2436) |

## Post-merge surface

| Path | Exists | Role | CI-002 |
| --- | --- | --- | --- |
| `scripts/ci/run_post_merge_closeout.mjs` | Yes | Closeout orchestrator | Do not replace |
| `scripts/ci/post_merge_validator.mjs` | Yes | Validation contract | Consume output |
| `scripts/ci/post_merge_source_issue_closeout.mjs` | Yes | Issue closeout | Do not replace |
| `scripts/ci/post_merge_remediation_issue.mjs` | Yes | Remediation issues | Complement |
| `scripts/ci/post_merge_self_heal_classify.mjs` | Yes | Classification only | Extend/wrap |
| `scripts/ci/closeout_classifier.mjs` | No | Admin classifier | Create (#2437) |
| `scripts/ci/admin_closeout_auto_repair.mjs` | No | Apply-mode repair | Create (#2437) |
| `docs/reference/ci/admin-closeout-auto-repair-contract.md` | No | Repair contract | Create (#2437) |

## Workflow hot zones

| Workflow | Owner / role | CI-001 | CI-002 |
| --- | --- | --- | --- |
| `gate-pr-hygiene.yml` | Advisory pre-merge hygiene | No touch | No touch |
| `post-merge-closeout.yml` | Automatic closeout owner | No touch | No race |
| `ops-post-merge-self-healing.yml` | Scheduled hygiene | No touch | Integrate after dry-run |
| `post-merge-remediation.yml` | Failure support | No touch | Complement |
| `reviewer-response-completion.yml` | Reviewer advisory + auto-repair trigger | No touch | No touch |

## Sequencing

1. Merge #2435 gap analysis.
2. Implement CI-001 (#2436) — separate PR.
3. Implement CI-002 (#2437) — separate PR after #2436.

Do not combine CI-001 and CI-002 in one PR.

## Canonical evidence

Full inventory and rationale: `docs/ops/reports/ci-stage-0-current-state-gap-analysis.md`.
