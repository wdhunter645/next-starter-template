---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Reviewer lifecycle gate behavior, protected-scope blocking rules, post-merge reviewer audit handoff
Does Not Own: Branch protection settings UI, merge protection consolidation, website runtime behavior
Canonical Reference: /docs/explanation/ci/lgfc-reviewer-lifecycle-redesign.md
Related Issues: #1196, #1075, #1058
Last Reviewed: 2026-06-03
---

# LGFC Reviewer Lifecycle Surface

## Purpose

This reference documents the Task 003 reviewer lifecycle model. Reviewer timing,
quiet periods, and PR-body ritual parsing are no longer synchronous merge blockers
except for deterministic protected CI scope conditions.

## Pre-Merge Workflow

| Workflow file | Display name | Enforcement |
|---|---|---|
| `reviewer-response-completion.yml` | `GATE — Reviewer Response Completion` | Blocking only on `pull_request_target` when protected CI scope has unresolved protected review threads or lacks a current-head trusted review artifact |
| `gate-reviewer-response.yml` | `GATE — Reviewer Response` | Retired manual-only stub; superseded by Task 003 redesign |

## Protected Scope

Hard reviewer enforcement applies only when changed files include:

- `.github/workflows/**`
- `scripts/ci/**`

Docs-only, website-only, and other non-protected scopes remain advisory-first even
when trusted reviewers have not finished asynchronous processing.

Unresolved protected threads are evaluated by review thread and latest trusted
review state, not by matching `commit_id` to the current PR head. A new commit
cannot clear unresolved protected inline threads or stale `CHANGES_REQUESTED`
reviews without an explicit resolution reply or a later approving review.

## Post-Merge Workflow

| Workflow file | Responsibility |
|---|---|
| `post-merge-intent-verification.yml` | Runs `post_merge_validator.mjs` and fails on late reviewer findings or required workflow failures; runs `post_merge_reviewer_audit.mjs` to open follow-up issues when validation fails |

Late reviewer findings pause orchestration through the post-merge failure state
rather than blocking merge approval on reviewer timing alone.

## Shared Scripts

| Script | Role |
|---|---|
| `scripts/ci/reviewer-gate-simulation.mjs` | Deterministic governance simulation and protected-scope classification |
| `scripts/ci/reviewer_lifecycle_gate.mjs` | Live reviewer lifecycle assessment used by the pre-merge workflow |
| `scripts/ci/post_merge_reviewer_audit.mjs` | Post-merge late-finding issue generation |

## Rollback

Revert reviewer workflow/script changes and this reference documentation only.
