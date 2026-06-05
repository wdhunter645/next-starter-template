---
Doc Type: Reference
Audience: Human + AI
Authority Level: Operational Authority
Owns: LGFC program portfolio structure and execution model
Does Not Own: Product design, workflow implementation, runtime behavior, or GitHub issue mutation
Canonical Reference: /docs/ops/pmo/program-registry.md
Related Issues: #1335, #1351
Last Reviewed: 2026-06-05
---

# LGFC Program Portfolio Model

## Purpose

Define the program portfolio model used to coordinate LGFC work without overloading Cursor with large one-off prompts.

This document is the portfolio-level map. Individual implementation remains controlled by the active GitHub issue and its PR.

## Portfolio Chain

```text
Program → Child Project → Task → Issue → PR → Verification → Closeout
```

Every work item must fit this chain.

| Level | Owns | Example |
|---|---|---|
| Program | Outcome family and launch gates | Program 1 Phase 1 Wrap-Up |
| child project | Bounded workstream | CI closeout, website reconciliation, OPS snapshot |
| Task | Single executable unit | #1340 CI As-Built Closeout |
| issue | GitHub execution contract | one source issue per task |
| PR | File changes only | one implementation PR per task |
| Verification | Checks and review evidence | CI, docs checks, Atlas review |
| Closeout | Issue comments, closure, queue advancement | post-merge only |

## Active Programs

| Program | Status | Owns | Blocker |
|---|---|---|---|
| Program 1 | Active | Phase 1 closeout and evidence preservation | none |
| Program 2 | Blocked | Authorized implementation follow-up | Program 1 Task 008 |
| Program 3 | Backlog | Documentation remediation and lower-priority cleanup | Program 2 launch decision |

## Operating Invariants

- One active implementation task at a time by default.
- Cursor edits files and prepares PRs.
- Atlas reviews, gates, and controls GitHub state transitions.
- Bill authorizes merges, destructive issue actions, and scope exceptions.
- GitHub is the shared audit trail.
- Program 2 implementation issues are not created until Program 1 Task 008 authorizes them.

## Cursor Read Order

For any task, Cursor should read:

1. The source issue.
2. `/docs/reference/pmo/lgfc-cursor-execution-contract.md`.
3. `/docs/how-to/cursor/run-program-task.md`.
4. Any task-specific authority documents named in the source issue.

Cursor should not reread the full portfolio package for every task unless the task scope is ambiguous.
