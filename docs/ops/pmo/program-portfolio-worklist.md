---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Portfolio-level worklist for active and blocked LGFC program work
Does Not Own: Individual issue bodies, PR content, or launch-gate authorization
Canonical Reference: /docs/reference/pmo/lgfc-program-portfolio-model.md
Related Issues: #1335, #1351
Last Reviewed: 2026-06-05
---

# Program Portfolio Worklist

## Purpose

Provide a compact worklist for Cursor and Atlas so each task can reference durable portfolio guidance instead of receiving a large prompt.

## Current State Note

As of PR #1372 merge (2026-06-05), Program 1 Tasks 002–005 are **complete**.
`#1058` remains open as the Program 2 CI maintenance umbrella. Task 006
(`#1344`) is the active synthesis task once queue labels reconcile.

## Active Program 1 Sequence

| Task ID | issue | Task | Agent | Status rule |
|---|---|---|---|---|
| Task 001 | #1339 | PMO registry and critical path | Atlas | complete |
| Task 002 | #1340 | CI as-built closeout | Cursor | complete |
| Task 003 | #1341 | Website as-built reconciliation | Cursor | complete |
| Task 004 | #1342 | Docs/DIATAXIS transition status | Cursor | complete |
| Task 005 | #1343 | OPS monitoring snapshot | Cursor | complete |
| Task 006 | #1344 | Operational health review | Atlas | active — `#1340`–`#1343` complete |
| Task 007 | #1345 | Automation backlog classification | Atlas | blocked until #1344 closes |
| Task 008 | #1346 | Program 2 launch gate | Atlas | final Program 1 gate |

Task 005 closeout completed via PR #1372; `#1343` is closed. Task 006 (`#1344`) is
the next eligible task for queue promotion after label reconciliation on `#1344`.

## Read-Only Parallel Work

Read-only research may support upcoming tasks after Task 001, but implementation PRs remain serial.

## Program 2 Holding Area

Program 2 candidates remain blocked until Task 008:

- CI maintenance under `#1058`;
- website follow-up under `#1255`;
- selected OPS improvements;
- selected automation items from Task 007.

## Program 3 Holding Area

Program 3 candidates include broader documentation remediation and non-critical cleanup that does not block Program 2 launch.
