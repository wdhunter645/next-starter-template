---
Doc Type: Postmortem
Audience: Maintainers and AI agents
Authority Level: Operational record
Owns: Operational incident summary for reviewer gate troubleshooting
Does Not Own: Repository workflow implementation
Canonical Reference: .github/workflows/reviewer-response-completion.yml
Last Reviewed: 2026-05-11
---

# Reviewer Gate Incident Postmortem - 2026-05-11

## Affected PRs

- PR #1003
- PR #1006
- PR #1007
- PR #1010 follow-up verification PR

## Primary Failure

Troubleshooting initially targeted the wrong workflow.

Debugging focused on:

- GATE - Reviewer Response

Actual blocking workflow:

- GATE - Reviewer Response Completion

## Root Causes

### PR-body accounting parser

The completion workflow requires a REVIEWER RESPONSE ACCOUNTING section in the PR body when actionable inline reviewer comments exist.

Each actionable inline comment must be listed with a review-comment ID, a disposition, and a rationale.

The workflow accepts either ASCII hyphen or em dash as the separator around the disposition.

### Top-level reviewer comments

Top-level reviewer issue comments are valid reviewer artifacts for reviewer-presence and current-head checks when they do not have a commit ID.

Top-level maintainer acknowledgement comments do not replace the PR-body accounting requirement for actionable inline review comments.

### Latest-head artifact enforcement

New commits can make older commit-bound review artifacts stale because the workflow compares commit-bound artifacts to the current PR head SHA.

PR-body edits alone do not change the PR head SHA. They can retrigger the workflow, but they do not invalidate reviewer artifacts by themselves.

### Quiet-period behavior

The workflow applies a quiet period after relevant reviewer activity before the gate can pass.

Rapid review, comment, and edit activity can therefore produce temporary failures until the quiet period expires.

## Effective Merge Contract

1. required reviewer dispositions are present
2. reviewer artifacts are valid for the current PR state
3. the PR body contains the REVIEWER RESPONSE ACCOUNTING section
4. every actionable inline reviewer comment is accounted
5. the accounting syntax matches the parser contract
6. the quiet period has elapsed

## Correct Debugging Sequence

1. inspect the full PR checks panel
2. identify the exact failing workflow
3. identify the exact failing job
4. inspect the exact job log or gate comment output
5. inspect the workflow parser expectations
6. patch the workflow, PR body, or changed file based on the exact failed assertion

Commit workflow-run lists alone are insufficient.

## PR #1010 Verification Findings

The follow-up PR confirmed the current governance expectations:

- documentation files require the standard metadata header
- top-level reviewer comments and PR-body accounting serve different purposes
- PR-body edits do not change the PR head SHA
- parser separator documentation must avoid ambiguity

## Follow-up Recommendations

- add parser fixture validation tests
- expose parser expectations in reusable documentation
- improve workflow summaries and failure logging
- consider reducing quiet-period friction
- consider whether latest-head enforcement should apply only to commit-bound artifacts
