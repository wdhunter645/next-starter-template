# CI Guardrails Map

**Status:** AUTHORITATIVE  
**Effective Date:** 2026-06-15  
**Purpose:** Reference for current CI/CD guardrails, closeout ownership, and validation surfaces

---

## Overview

This document maps the CI/CD guardrails relevant to Program #1500 Task 005
closeout reconciliation. It records effective, parked, manual, targeted, and
backfill workflow roles for the closeout surface.

As-built reconciliation for the `#1075` CI redesign is maintained in
`docs/reference/ci/lgfc-ci-as-built-reconciliation.md`. Domain surface references:

- `docs/reference/ci/merge-protection-surface.md`
- `docs/reference/ci/reviewer-lifecycle-surface.md`
- `docs/reference/ci/post-merge-validation-surface.md`
- `docs/reference/ci/ops-runtime-surface.md`

**Last reconciliation review:** 2026-06-22 (Programs #1847/#1914 self-healing activation and `ops-pr-escalation` handoff)

## Action Workflow Inventory — Closeout Surface

| Workflow file | Workflow name | Effectiveness | Primary use |
|---|---|---|---|
| `gate-post-merge-readiness.yml` | GATE — Post-Merge Readiness | Effective | Pre-merge readiness check for PR metadata, allowlist evidence, and reviewer disposition. |
| `post-merge-closeout.yml` | Post-Merge Detection | Effective | Primary automatic post-merge reconciliation workflow for merged PRs to `main`. |
| `post-merge-pr-body-closeout.yml` | Post-Merge PR Body Closeout | Effective (Manual / Backfill) | Manual single-PR reconciliation, batch manifests, and push-triggered backfill. |
| `post-merge-intent-verification.yml` | Post-Merge Maintainer Body Apply | Effective (Targeted automatic / dispatch) | Maintainer PR-body updates for explicitly targeted PR synchronize events and maintainer-dispatched legacy PRs. |
| `post-merge-remediation.yml` | Post-Merge Remediation | Effective | Remediation workflow for failed post-merge validation; runs self-healing before opening exception issues. |
| `ops-post-merge-self-healing.yml` | OPS — Post-Merge Self-Healing | Effective | Post-merge backlog burn-down, safe auto-fix apply, and `ops-pr-escalation` Ops handoff on the same exception issue. |
| `ops-pr-issue-accounting.yml` | GATE — PR Issue Accounting | Effective | Pre-merge PR-to-ticket accounting audit. |
| `gate-close-work-issue.yml` | gate-close-work-issue | Ineffective (Parked no-op) | Legacy parked workflow retained for traceability only. |

## Closeout Ownership Rule

Automatic post-merge reconciliation has one effective owner:
`.github/workflows/post-merge-closeout.yml`.

`gate-close-work-issue.yml` is parked and must not be listed or treated as an
effective workflow. Any status report, workflow inventory, or queue decision that
identifies it as active is stale.

Pre-merge accounting remains separate and is owned by
`.github/workflows/ops-pr-issue-accounting.yml`.

## Umbrella issue rule

Program, umbrella, master, parent, roadmap, queue, and tracking boundaries are
operator and PR-body governance policy for selecting the accepted source ticket.
Runtime classification remains a deferred implementation item unless a later task
adds that explicit check.

## Gate Enforcement Policy

- Pre-merge gates validate PR scope, accounting, metadata, reviewer disposition,
  and readiness evidence.
- Post-merge detection verifies the merged PR and handles reconciliation only
  after successful validation.
- Parked workflows are traceability artifacts, not enforcement paths.
- Documentation-only reconciliation PRs must not change workflow runtime logic.

## Related References

| Reference | Role |
|---|---|
| `docs/reference/ci/post-merge-validation-surface.md` | Authoritative post-merge validation and closeout ownership surface |
| `docs/reference/ci/workflow-inventory.md` | Closeout-related workflow inventory rows and broader inventory boundary |
| `docs/reference/ci/lgfc-ci-as-built-reconciliation.md` | As-built reconciliation and deferred-item tracking |
| `docs/ops/pmo/github-issue-closeout-protocol.md` | issue closeout protocol, terminal label reconciliation, and umbrella exclusion policy |
