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

## Active Program 1 Sequence

| Order | Issue | Task | Agent | Status rule |
|---:|---|---|---|---|
| 1 | #1339 | PMO registry and critical path | Atlas | complete |
| 2 | #1340 | CI as-built closeout | Cursor | active |
| 3 | #1341 | Website as-built reconciliation | Cursor | blocked until #1340 closes |
| 4 | #1342 | Docs/DIATAXIS transition status | Cursor | blocked until #1341 closes |
| 5 | #1343 | OPS monitoring snapshot | Cursor | blocked until #1342 closes |
| 6 | #1344 | Operational health review | Atlas | blocked until #1340-#1343 complete |
| 7 | #1345 | Automation backlog classification | Cursor | blocked until #1344 closes |
| 8 | #1346 | Program 2 launch gate | Atlas | final Program 1 gate |

## Read-Only Parallel Work

Read-only research may support upcoming tasks after Task 001, but implementation PRs remain serial.

## Program 2 Holding Area

Program 2 candidates remain blocked until Task 008:

- CI maintenance under #1058;
- website follow-up under #1255;
- selected OPS improvements;
- selected automation items from Task 007.

## Program 3 Holding Area

Program 3 candidates include broader documentation remediation and non-critical cleanup that does not block Program 2 launch.
