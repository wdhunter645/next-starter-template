# Reviewer Gate Incident Postmortem — 2026-05-11

## Affected PRs
- PR #1003
- PR #1006
- PR #1007

## Primary Failure

Troubleshooting initially targeted the wrong workflow.

Debugging focused on:
- `GATE — Reviewer Response`

Actual blocking workflow:
- `GATE — Reviewer Response Completion`

## Root Causes

### Exact PR-body parser contract

The workflow required:
- exact `## REVIEWER RESPONSE ACCOUNTING` section
- exact `review-comment:<id> — accepted|rejected|ignored — rationale` lines
- latest reviewer artifacts tied to latest head SHA

Top-level acknowledgement comments did not satisfy the parser.

### Latest-head artifact enforcement

New commits and PR-body edits invalidated older reviewer artifacts.

### Quiet-period race condition

`quietPeriodSeconds = 120`

Rapid review/comment/edit activity repeatedly retriggered temporary failures.

### Governance recursion

The governance PR itself became subject to evolving governance rules.

## Effective Merge Contract

1. reviewer dispositions present
2. reviewer artifacts tied to latest head
3. PR-body accounting section present
4. every actionable inline review comment accounted
5. exact parser syntax satisfied
6. quiet period elapsed

## Operational Corrections

### Required debugging sequence

1. inspect full PR checks panel
2. identify exact failing workflow
3. identify exact failing job
4. inspect exact job log
5. inspect parser expectations
6. patch workflow or PR-body contract

Commit workflow-run lists alone are insufficient.

## Follow-up Recommendations

- reduce or remove quiet-period enforcement
- decouple reviewer artifacts from latest head SHA
- add parser fixture validation tests
- expose parser expectations in reusable docs
- improve workflow summaries/logging
