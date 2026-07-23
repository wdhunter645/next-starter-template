---
Doc Type: Operations
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Operational Evidence
Owns: Task 002 boundary checklist proving Givebutter vs LGFC ownership separation and Task 003 handoff readiness
Does Not Own: Vendor configuration, live campaign launch, Issue closeout, or merge authority
Canonical Reference: /docs/reference/website/givebutter-integration-boundary-model.md
Related Issues: #1700, #1702, #1701
Last Reviewed: 2026-07-23
---

# Fundraiser Task 002 — Boundary Checklist

## Purpose

Prove Task 002 acceptance: external Givebutter ownership is separated from LGFC
website/config/display ownership, public link/embed boundaries are explicit, and
Task 003 can proceed without assuming raw live donor data.

## Scope

In scope:

- acceptance evidence for #1702;
- readiness cross-check against the PMO ownership model;
- Task 003 assumption constraints.

Out of scope:

- Givebutter admin actions;
- runtime implementation;
- leaderboard formula definition.

## Current known truth

- Predecessor #1701 integrated via PR #2766 on
  `component/fundraiser-charity-campaign-operations`.
- Canonical boundary authority for this task:
  `docs/reference/website/givebutter-integration-boundary-model.md`
- Platform non-ownership statement:
  `docs/reference/platform/givebutter-external-platform-boundary.md`

## Intended final state

Reviewers can verify #1702 acceptance from this checklist, and Task 003 can
define snapshot-based leaderboard/winner rules without inventing vendor live-feed
assumptions.

## Deliverable map

| Artifact | Path |
| --- | --- |
| Website ownership boundary | `docs/reference/website/givebutter-integration-boundary-model.md` |
| Platform boundary pointer | `docs/reference/platform/givebutter-external-platform-boundary.md` |
| This checklist | `docs/ops/reports/fundraiser-task-002-boundary-checklist.md` |

## Boundary checklist

| Check | Result |
| --- | --- |
| External Givebutter campaign ownership separated from LGFC website/config/display ownership | PASS — ownership matrix |
| Approved public campaign link/embed boundaries documented | PASS — link-first + conditional embed rules |
| Private/admin/vendor URLs and raw campaign exports prohibited from public display | PASS — prohibited public material section |
| No vendor secrets/tokens allowed in repository or public client code | PASS — repository secret rule |
| Task 003 constrained to snapshot/import, not raw live donor data | PASS — Task 003 assumptions section |
| Platform stack not treated as Givebutter payment backend | PASS — platform boundary doc |

## Readiness document cross-check

| Readiness row | Task 002 disposition |
| --- | --- |
| Givebutter campaign setup external | Confirmed |
| Donations/payments external | Confirmed |
| Leaderboard snapshots LGFC after approved boundary | Confirmed; details deferred to #1703 |
| Winner announcement privacy-safe | Confirmed boundary; rules deferred to #1703/#1705 |
| Link-first default; embed only if approved | Confirmed |

## Acceptance criteria trace (#1702)

| Criterion | Result |
| --- | --- |
| External vs LGFC ownership separated | PASS |
| Approved public link/embed boundaries documented | PASS |
| Private/admin/vendor URLs and raw exports prohibited publicly | PASS |
| Task 003 can define rules without raw live donor data assumption | PASS |

## Residual / deferred

| Item | Owner task |
| --- | --- |
| Leaderboard/winner calculation | #1703 |
| Homepage spotlight design reconciliation | #1704 |
| Donor/sponsor privacy fields | #1705 |
| Website runtime display | #1706 |
