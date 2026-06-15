# CI Guardrails Map

**Status:** AUTHORITATIVE  
**Effective Date:** 2026-01-25  
**Purpose:** Comprehensive reference for current CI/CD guardrails, closeout ownership, and automated validation

---

## Overview

This document maps current LGFC CI/CD guardrails relevant to Program #1500 Task
005 closeout reconciliation. It records the current effective/parked state for
closeout-related workflows and points to the authoritative domain surfaces.

As-built reconciliation for the `#1075` CI redesign is maintained in
`docs/reference/ci/lgfc-ci-as-built-reconciliation.md`. Domain surface references:

- `docs/reference/ci/merge-protection-surface.md`
- `docs/reference/ci/reviewer-lifecycle-surface.md`
- `docs/reference/ci/post-merge-validation-surface.md`
- `docs/reference/ci/ops-runtime-surface.md`

This map remains the operational guardrails reference for closeout ownership.
When a broader workflow inventory rewrite is required, perform it under a
separate issue and PR.

**Last reconciliation review:** 2026-06-15 (Program #1500 Task 005 closeout ownership reconciliation)

## Action Workflow Inventory — Closeout Surface

| Workflow file | Workflow name | Effectiveness | Primary use |
|---|---|---|---|
| `gate-post-merge-readiness.yml` | GATE — Post-Merge Readiness | Effective | Blocks PRs whose current body/files/reviewer dispositions would fail post-merge closeout metadata checks. |
| `post-merge-closeout.yml` | Post-Merge Detection | Effective | Sole automatic post-merge source-issue closeout owner for merged PRs to `main`; validates, syncs once, comments, remediates on failure, and closes the source issue only when evidence passes. |
| `post-merge-pr-body-closeout.yml` | Post-Merge PR Body Closeout | Effective (Manual / Backfill) | Manual single-PR closeout, batch manifests, and push-triggered backfill only; not an automatic merge-triggered closeout owner. |
| `post-merge-intent-verification.yml` | Post-Merge Maintainer Body Apply | Effective (Dispatch-only) | Maintainer-dispatched PR body apply for legacy open PRs. |
| `post-merge-remediation.yml` | Post-Merge Remediation | Effective | Opens remediation issues only when Post-Merge Detection fails. |
| `ops-pr-issue-accounting.yml` | GATE — PR Issue Accounting | Effective | Pre-merge PR-to-issue accounting audit; does not close source issues. |
| `gate-close-work-issue.yml` | gate-close-work-issue | Ineffective (Parked no-op) | Legacy issue closer retained for traceability only; performs no issue mutation and is not a closeout owner. |

## Closeout Ownership Rule

Automatic source-issue closeout has one effective owner:
`.github/workflows/post-merge-closeout.yml`.

`gate-close-work-issue.yml` is parked and must not be listed or treated as an
effective closeout workflow. Any status report, workflow inventory, or queue
decision that identifies it as an active closer is stale.

Pre-merge issue accounting remains separate and is owned by
`.github/workflows/ops-pr-issue-accounting.yml`.

## Umbrella issue rule

Program, umbrella, master, parent, roadmap, queue, and tracking issues are not
closed by child task PR closeout. A child task PR may close only its single
source issue unless operator-approved bounded batch or umbrella closeout
authority explicitly names the umbrella issue.

## Gate Enforcement Policy

- Pre-merge gates validate PR scope, source issue accounting, metadata, reviewer
  disposition, and closeout-readiness evidence.
- Post-merge detection verifies the merged PR and handles source issue closeout
  only after successful validation.
- Parked workflows are traceability artifacts, not enforcement or mutation paths.
- Documentation-only reconciliation PRs must not change workflow runtime logic.

## Related References

| Reference | Role |
|---|---|
| `docs/reference/ci/post-merge-validation-surface.md` | Authoritative post-merge validation and closeout ownership surface |
| `docs/reference/ci/workflow-inventory.md` | Closeout-related workflow inventory rows and broader inventory boundary |
| `docs/reference/ci/lgfc-ci-as-built-reconciliation.md` | As-built reconciliation and deferred-item tracking |
| `docs/ops/pmo/github-issue-closeout-protocol.md` | issue closeout protocol, terminal label reconciliation, and umbrella exclusion policy |
