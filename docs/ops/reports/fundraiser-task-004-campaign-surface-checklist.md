---
Doc Type: Operations
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Operational Evidence
Owns: Task 004 acceptance checklist, read-only implementation inventory evidence, and Task 005 handoff readiness
Does Not Own: Runtime changes, campaign launch, or merge authority
Canonical Reference: /docs/reference/website/fundraiser-campaign-surface-design.md
Related Issues: #1700, #1704, #1701, #1702, #1703
Last Reviewed: 2026-07-24
---

# Fundraiser Task 004 — Campaign Surface Checklist

## Purpose

Prove Task 004 acceptance: homepage campaign spotlight behavior is reconciled
with production design, statuses/gates and fail-closed rules are documented, and
existing implementation was inspected read-only.

## Scope

In scope:

- #1704 acceptance evidence;
- inventory of inspected `src/**` and `tests/**` paths;
- handoff notes for Task 005.

Out of scope:

- modifying runtime files;
- enabling a live campaign.

## Current known truth

- Component tip includes Tasks #1701–#1703 docs.
- Public fail-closed slot behavior is already implemented in
  `CampaignSpotlightSlot`.
- This task documents design reconciliation only.

## Intended final state

Reviewers can verify #1704 without opening a runtime diff, and Task 005 can add
privacy rules knowing which surfaces may eventually display recognition fields.

## Deliverable map

| Artifact | Path |
| --- | --- |
| Website surface contract | `docs/reference/website/fundraiser-campaign-surface-design.md` |
| Design authority crosswalk | `docs/reference/design/fundraiser-homepage-spotlight-reconciliation.md` |
| This checklist | `docs/ops/reports/fundraiser-task-004-campaign-surface-checklist.md` |

## Acceptance criteria trace (#1704)

| Criterion | Result |
| --- | --- |
| Homepage campaign spotlight reconciled with production design authority | PASS — crosswalk + section-order mapping |
| Campaign statuses and preview/review gates documented | PASS — status table + gate list |
| Fail-closed behavior specified for missing/disabled/invalid/stale/unpublished | PASS — fail-closed table |
| Existing `src/**` and `tests/**` inspection documented as read-only evidence | PASS — inventory tables |

## Read-only inspection attestation

- [x] Inspected campaign spotlight source files listed in the website reference
- [x] Inspected related tests (`campaignSpotlight`, admin fundraiser preview, fundraiser)
- [x] No `src/**` or `tests/**` files modified in this task

## Design reference cross-check

| Reference | Used for |
| --- | --- |
| `docs/reference/design/LGFC-Production-Design-and-Standards.md` | Homepage section order; spotlight hidden by default |
| Task 001 launch-state model | Status mapping |
| Task 002 Givebutter boundary | Link-first / no admin URLs |
| Task 003 leaderboard rules | Snapshot-only leaderboard expectation |

## Residual / deferred

| Item | Owner |
| --- | --- |
| Recognition privacy fields on surfaces | #1705 |
| Runtime status/display deltas | #1706 |
| Pre-launch surface verification package | #1707 |
