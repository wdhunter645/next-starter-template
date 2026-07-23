---
Doc Type: Operations
Audience: Bill, ChatGPT, Cursor, LGFC operators, and reviewers
Authority Level: Operational Evidence
Owns: Task 003 checklist proving leaderboard/winner rules coverage and Task 004 handoff readiness
Does Not Own: Live campaign scoring execution, vendor configuration, or merge authority
Canonical Reference: /docs/reference/website/fundraiser-leaderboard-winner-rules.md
Related Issues: #1700, #1703, #1702
Last Reviewed: 2026-07-23
---

# Fundraiser Task 003 — Leaderboard Checklist

## Purpose

Prove Task 003 acceptance: scoring, snapshot cadence, winner calculation,
tiebreakers, and privacy-safe publication controls are documented so Task 004 can
design campaign surfaces with known boundaries.

## Scope

In scope:

- #1703 acceptance evidence;
- cross-check against Task 002 no-live-donor-feed boundary;
- Task 004 handoff constraints.

Out of scope:

- running a live campaign calculation in this task;
- runtime implementation.

## Current known truth

- Predecessors #1701 and #1702 are integrated on
  `component/fundraiser-charity-campaign-operations`.
- Rules live in `docs/reference/website/fundraiser-leaderboard-winner-rules.md`.
- Operator procedure lives in
  `docs/how-to/website/fundraiser-leaderboard-winner-operations.md`.

## Intended final state

Reviewers can verify #1703 from this checklist, and Task 004 can assume
fail-closed leaderboard/winner modules without live vendor feed dependency.

## Deliverable map

| Artifact | Path |
| --- | --- |
| Rules reference | `docs/reference/website/fundraiser-leaderboard-winner-rules.md` |
| Operator how-to | `docs/how-to/website/fundraiser-leaderboard-winner-operations.md` |
| This checklist | `docs/ops/reports/fundraiser-task-003-leaderboard-checklist.md` |

## Rules coverage

| Required topic | Covered |
| --- | --- |
| Scoring rules | YES |
| Snapshot cadence / authority | YES |
| Deterministic winner calculation | YES |
| Ordered tiebreakers | YES |
| Operator approval for winner publication | YES |
| Privacy-safe display labels | YES |
| Manual override + evidence | YES |
| Raw live donor data not public SoT | YES |

## Task 002 boundary cross-check

| Constraint | Result |
| --- | --- |
| Snapshot/import model only | PASS |
| No live Givebutter donor feed as website truth | PASS |
| No public raw exports | PASS |

## Acceptance criteria trace (#1703)

| Criterion | Result |
| --- | --- |
| Scoring, snapshot cadence, winner calculation, tiebreakers documented | PASS |
| Winner publication requires operator approval and privacy-safe labels | PASS |
| Raw live donor data not public source of truth | PASS |
| Task 004 can design surfaces with known leaderboard/winner boundaries | PASS |

## Residual / deferred

| Item | Owner |
| --- | --- |
| Campaign surface layout | #1704 |
| Final recognition privacy fields | #1705 |
| Runtime display implementation | #1706 |
| Pre-launch test package | #1707 |
