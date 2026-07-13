---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: As-built component child auto-integration evaluator, workflow behavior, and GitHub-native state surfaces
Does Not Own: Delivery policy boundaries, approval authority, or branch protection configuration
Canonical Reference: /docs/governance/DELIVERY-AND-RELEASE.md
Related Issues: #2498
Last Reviewed: 2026-07-13
---

# Component Auto-Integration As-Built

## Purpose

This reference documents the deterministic Model B child auto-integration evaluator and the GitHub workflow that enables squash auto-merge only after eligibility succeeds.

Policy boundaries live in `docs/governance/DELIVERY-AND-RELEASE.md` and `docs/governance/OPERATIONS-AND-RECOVERY.md`.

## Evaluator contract

`scripts/ci/component_integration_eligibility.mjs` exports:

```text
evaluateComponentIntegration({
  profile,
  checks,
  reviews,
  componentState,
  labels,
  changedFiles,
})
```

Return shape:

| Field | Meaning |
| --- | --- |
| `eligible` | `true` only when every negative rule passes |
| `blockedReasons` | Ordered list of `{ code, message, ...details }` |
| `requiresChatReview` | `true` when protected-change review is required before integration |

Supporting constants:

- `HOLD_LABELS = ['component-integration-hold', 'hold:component-integration']`
- `COMPONENT_STATES = ['green', 'red', 'hold']`

## Negative rules

The evaluator blocks auto-integration when any of the following are true:

| Code | Trigger |
| --- | --- |
| `failed_check` | Any required check reports a terminal failure |
| `pending_check` | Any required check is still running or queued |
| `non_component_base` | PR base is not `component/**` |
| `protected_change` | Protected paths changed or approval profile is `protected-change-review` |
| `component_hold` | Component state is `hold` or a hold label is present |
| `component_red_state` | Component branch integration state is `red` |
| `branch_mismatch` | `Component branch` metadata does not match PR base ref |
| `missing_component_master` | `Component master` metadata is missing |
| `stale_base` | PR base SHA is behind the current component branch head |
| `invalid_delivery_model` | Delivery model is not `B-child` |
| `changes_requested` | A reviewer requested changes on the current head |

Protected changes set `requiresChatReview: true` but remain blocked until Chat review completes.

## Positive rule

A clean Model B child with:

- delivery model `B-child`
- gate profile `component-child`
- approval profile `component-auto-integration`
- matching `component/**` base and metadata
- green technical checks
- component state `green`
- no hold labels
- fresh base

returns `eligible: true` and `requiresChatReview: false`.

## Workflow behavior

`.github/workflows/component-child-integration.yml`:

1. Triggers on non-draft pull requests targeting `component/**`.
2. Collects PR body, changed files, reviews, labels, and head check runs through GitHub APIs.
3. Derives component branch freshness and branch status (`green`, `red`, or `hold`).
4. Runs `component_integration_eligibility.mjs`.
5. Publishes a completed check run named `Component Integration Eligibility`.
6. Enables squash auto-merge only when `eligible=true`.

Component integration state is recorded through the check run conclusion and branch commit status — not PR-body lifecycle prose.

## Local verification

```bash
npx vitest run --config tests/vitest.node.config.ts tests/component-integration-eligibility.test.mjs
```

## Pilot status

Automation is implemented but not yet proven on a live Program #2477 child PR. Treat pilot evidence as required before declaring production-ready child auto-integration.

## Canonical references

| Topic | Owner |
| --- | --- |
| Delivery policy | `docs/governance/DELIVERY-AND-RELEASE.md` |
| Component integration procedure | `docs/how-to/delivery/manage-component-integration.md` |
| Delivery metadata contract | `docs/reference/ci/delivery-profile-contract.md` |
| Component state facts | `docs/reference/delivery/delivery-and-rollback-profiles.md` |
