---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: Reviewer lifecycle gate behavior, protected-scope blocking rules, post-merge reviewer audit handoff
Does Not Own: Branch protection settings UI, merge protection consolidation, website runtime behavior
Canonical Reference: /docs/explanation/ci/lgfc-reviewer-lifecycle-redesign.md
Related Issues: #1452, #1196, #1075, #1058
Last Reviewed: 2026-06-08
---

# LGFC Reviewer Lifecycle Surface

## Purpose

This reference documents reviewer lifecycle enforcement for LGFC PRs. Every
actionable trusted reviewer comment must be resolved, explicitly dispositioned in
the PR body, or linked to a bounded follow-up issue. Outdated review threads do
not satisfy enforcement by themselves.

## Pre-Merge Workflow

| Workflow file | Display name | Enforcement |
|---|---|---|
| `reviewer-response-completion.yml` | `GATE — Reviewer Response Completion` | Blocking on `pull_request_target` when any actionable trusted reviewer comment lacks PR-body disposition, when outdated threads lack explicit disposition, when late pre-merge comments remain undispositioned, or when protected CI scope has unresolved protected review threads or lacks a current-head trusted review artifact on the enforced head SHA |
| `gate-reviewer-response.yml` | `GATE — Reviewer Response` | Retired manual-only stub; superseded by Task 003 redesign |

## Protected Scope

Hard reviewer enforcement applies only when changed files include:

- `.github/workflows/**`
- `scripts/ci/**`

Reviewer disposition enforcement applies to all scopes. Protected CI scope adds
current-head trusted review artifact requirements on top of disposition rules.

Current-head protected review enforcement requires a trusted review or review
comment whose `commit_id` exactly matches the current PR head SHA. Trusted reviews
on earlier commits do not satisfy protected workflow/config scope.

Unresolved protected threads are evaluated by review thread and latest trusted
review state, not only by `commit_id` matching. A new commit cannot clear
unresolved protected inline threads or stale `CHANGES_REQUESTED` reviews without
an explicit resolution reply or a later approving review on the current head.

### Break-glass override

Emergency protected-scope merges may use a narrow break-glass path only when:

- the PR has the `recovery` intent label, and
- the PR body includes `<!-- reviewer-lifecycle-break-glass -->`.

The reviewer lifecycle gate records break-glass use in its PR comment. Post-merge
reviewer audit output also records break-glass when that workflow runs.

## Post-Merge Workflow

| Workflow file | Responsibility |
|---|---|
| `post-merge-intent-verification.yml` | Runs `post_merge_validator.mjs` and fails on undispositioned reviewer comments, late reviewer findings, or required workflow failures; runs `post_merge_reviewer_audit.mjs` to open follow-up issues when validation fails |

Undispositioned reviewer findings and late post-merge comments pause orchestration,
block source issue closeout, and stop queue advancement until a post-merge
exception issue is resolved.

## Shared Scripts

| Script | Role |
|---|---|
| `scripts/ci/reviewer-gate-simulation.mjs` | Deterministic governance simulation and protected-scope classification |
| `scripts/ci/reviewer_comment_disposition.mjs` | Parses PR-body dispositions and evaluates trusted reviewer comment completeness |
| `scripts/ci/reviewer-response-gate.mjs` | Shared reviewer response gate assessment for pre-merge and post-merge phases |
| `scripts/ci/reviewer_lifecycle_gate.mjs` | Live reviewer lifecycle assessment used by the pre-merge workflow |
| `scripts/ci/post_merge_reviewer_audit.mjs` | Post-merge late-finding issue generation |

## Disposition Evidence (Required)

Every actionable trusted reviewer comment must end in one of these states:

1. resolved by code/doc change and thread marked resolved;
2. outdated with explicit PR-body disposition using `review-comment:<id>` and `thread state: outdated`;
3. rejected / not applicable with rationale;
4. linked to a bounded follow-up issue via `follow-up-issue:#<number>`.

`is_outdated: true` without PR-body disposition is a failure. `is_resolved: false`
with no disposition is a failure.

## Rollback

Revert reviewer workflow/script changes and this reference documentation only.
