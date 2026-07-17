---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: As-built component child auto-integration evaluator, workflow behavior, and GitHub-native state surfaces
Does Not Own: Delivery policy boundaries, approval authority, or branch protection configuration
Canonical Reference: /docs/governance/DELIVERY-AND-RELEASE.md
Related Issues: #2498, #2501, #2502
Last Reviewed: 2026-07-17
---

# Component Auto-Integration As-Built

## Purpose

This reference documents the deterministic Model B child auto-integration evaluator and the GitHub workflow that enables squash auto-merge only after eligibility succeeds.

Policy boundaries live in `docs/governance/DELIVERY-AND-RELEASE.md` and `docs/governance/OPERATIONS-AND-RECOVERY.md`.

## Evaluator contract

`scripts/ci/component_integration_eligibility.mjs` exports `evaluateComponentIntegration` with these inputs:

| Input | Meaning |
| --- | --- |
| `profile` | Parsed delivery-profile metadata |
| `checks` | Required check conclusions for the child PR head |
| `reviews` | Current review state |
| `componentState` | Derived component branch state |
| `labels` | Current PR and component routing labels |
| `changedFiles` | Changed-file paths used for protected-scope evaluation |

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

`.github/workflows/component-child-integration.yml` has the following as-built behavior:

| Stage | Behavior |
| --- | --- |
| Trigger | Runs for non-draft pull requests targeting `component/**` |
| Evidence collection | Reads PR body, changed files, reviews, labels, and head check runs through GitHub APIs |
| State derivation | Resolves component freshness and branch state as `green`, `red`, or `hold` |
| Evaluation | Runs `component_integration_eligibility.mjs` |
| Published result | Creates a completed check run named `Component Integration Eligibility` |
| Integration action | Enables squash auto-merge only when `eligible=true` and repository settings permit it |

Component integration state is recorded through the check run conclusion and branch commit status, not PR-body lifecycle prose.

## Validation coverage

Automated evaluator coverage is maintained in `tests/component-integration-eligibility.test.mjs`. Operator verification and recovery commands are owned by `docs/how-to/delivery/manage-component-integration.md`.

## Pilot status

A live Model B child pilot completed before Delivery System v1 promotion. The evaluator and workflow are present on `main`; ongoing eligibility remains subject to current repository settings, branch state, required checks, and delivery policy.

## Canonical references

| Topic | Owner |
| --- | --- |
| Delivery policy | `docs/governance/DELIVERY-AND-RELEASE.md` |
| Component integration procedure | `docs/how-to/delivery/manage-component-integration.md` |
| Delivery metadata contract | `docs/reference/ci/delivery-profile-contract.md` |
| Component state facts | `docs/reference/delivery/delivery-and-rollback-profiles.md` |
