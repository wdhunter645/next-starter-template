---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Portfolio-level worklist for active and blocked LGFC program work
Does Not Own: Individual issue bodies, PR content, or launch-gate authorization
Canonical Reference: /docs/reference/pmo/lgfc-program-portfolio-model.md
Related Issues: #1335, #1346, #1351
Last Reviewed: 2026-06-06
---

# Program Portfolio Worklist

## Purpose

Provide a compact worklist for Cursor and Atlas so each task can reference durable portfolio guidance instead of receiving a large prompt.

## Current State Note

As of Task 008 implementation (2026-06-06), Program 1 Tasks 001–007 are **complete**.
Task 008 (`#1346`) launch gate documentation is in progress on branch
`docs/task-008-program-2-launch-gate`. PR `#1382` previously closed `#1346` after
worklist-only hygiene; `#1346` was **reopened** for the full launch gate deliverable.

| Task | Merge PR | Primary deliverable |
|---|---|---|
| 006 | `#1374` | `docs/ops/reports/program-1-operational-health-review.md` |
| 007 | `#1375` | `docs/ops/reports/program-1-automation-backlog.md` |
| 008 | (pending) | `docs/ops/reports/program-2-launch-gate.md` |

## Active Program 1 Sequence

| Task ID | issue | Task | Agent | Status rule |
|---|---|---|---|---|
| Task 001 | #1339 | PMO registry and critical path | Atlas | complete |
| Task 002 | #1340 | CI as-built closeout | Cursor | complete |
| Task 003 | #1341 | Website as-built reconciliation | Cursor | complete |
| Task 004 | #1342 | Docs/DIATAXIS transition status | Cursor | complete |
| Task 005 | #1343 | OPS monitoring snapshot | Cursor | complete |
| Task 006 | #1344 | Operational health review | Cursor (impl) / Atlas (review) | complete — PR `#1374` |
| Task 007 | #1345 | Automation backlog classification | Cursor (impl) / Atlas (review) | complete — PR `#1375` |
| Task 008 | #1346 | Program 2 launch gate | Atlas (sign-off) | in progress — launch gate doc; human sign-off pending |

Task 007 closeout completed via PR #1375; `#1345` is closed. Task 008 (`#1346`) was
reopened after erroneous closeout from PR `#1382`; launch gate deliverable:
`docs/ops/reports/program-2-launch-gate.md`. Human sign-off remains pending in that
document before Program 2 activation is effective.

## Read-Only Parallel Work

Read-only research may support upcoming tasks after Task 001, but implementation PRs remain serial.

## Program 2 Holding Area

Program 2 candidates remain blocked until Task 008 sign-off:

- CI maintenance under `#1058`;
- website follow-up under `#1255`;
- selected OPS improvements;
- automation items classified in `docs/ops/reports/program-1-automation-backlog.md`.

## Program 3 Holding Area

Program 3 candidates include broader documentation remediation and non-critical cleanup that does not block Program 2 launch.
