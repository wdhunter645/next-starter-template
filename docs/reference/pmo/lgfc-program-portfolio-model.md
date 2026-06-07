---
Doc Type: Reference
Audience: Human + AI
Authority Level: Operational Authority
Owns: LGFC program portfolio structure, perpetual Program 1/2 lane model, Program 3 intake model, and execution-chain reference
Does Not Own: Product design, workflow implementation, runtime behavior, GitHub issue mutation, or merge authority
Canonical Reference: /docs/ops/pmo/program-registry.md
Related Issues: #1411, #1409, #1379, #1255, #1335
Last Reviewed: 2026-06-07
---

# LGFC Program Portfolio Model

## Purpose

Define the portfolio model used to coordinate LGFC work across planning,
execution, review, verification, and closeout without overloading agents with
unbounded prompts or creating competing issue trees.

This document is the portfolio-level reference. Active execution remains
controlled by the current source issue, implementation plan, pull request, and
PMO registry.

## Scope

This document owns:

- the Program 1 / Program 2 alternating lane model;
- Program 3 intake and promotion rules;
- portfolio-level operating invariants for human and AI contributors;
- the read order for agents entering PMO-governed work.

This document does not own:

- task-level implementation plans;
- workflow YAML or runtime implementation;
- GitHub issue closure, relabeling, queue advancement, or merge actions;
- product design or website feature scope.

## Current Known Truth

- Program 1 and Program 2 are alternating execution lanes in a perpetual PMO
  cycle. They are not permanent subject domains.
- Program 3 is portfolio intake and prioritization. It collects ideas, deferred
  work, candidate projects, and future opportunities; it does not execute
  implementation work directly.
- The active Program 1 planning cycle is `#1411`, PMO Automation and Agent
  Workflow Control.
- The active Program 2 execution cycle is `#1255`, Website Implementation and
  Content Operations.
- The prior Program 1 cycle `#1335` is closed historical evidence only and is
  not a parent for the new Program 1 cycle.
- Workflow Automation has been promoted from Program 3 (`#1379`) into the active
  Program 1 planning cycle.

## Intended Final State

- Every active work item has exactly one current authority path:
  Program → child project → task → issue → PR → verification → closeout.
- Program 3 items become executable only after owner promotion, repository
  authority placement, task decomposition, and bounded issue/PR handoff.
- Program 1 planning and Program 2 execution can proceed concurrently only when
  their scopes do not mutate or block one another.
- Completed program cycles remain evidence, not implicit parents for later
  cycles.

## Portfolio Chain

```text
Program → child project → task → issue → PR → verification → closeout
```

| Level | Owns | Example in current cycle |
| --- | --- | --- |
| Program | Time-bounded body of planning or execution work | Program 1 `#1411`, Program 2 `#1255` |
| child project | Bounded workstream under the active program | Workflow Automation design migration |
| task | Single executable unit in an implementation plan | Task 002 — Workflow Automation Design Migration |
| issue | GitHub source contract | One source issue per generated task |
| PR | File changes and evidence | One PR per task issue |
| verification | Checks, gate evidence, and reviewer disposition | Docs header/canonical checks |
| closeout | Authorized issue reconciliation and queue handoff | Post-merge evidence packet |

## Program Lane Model

Program numbers identify PMO cycle position, not permanent subject domains.

| Lane | Role in perpetual cycle | Current example |
| --- | --- | --- |
| Program 1 | Defines, governs, or executes the next body of work while preserving explicit launch gates | `#1411` PMO Automation and Agent Workflow Control |
| Program 2 | Executes an authorized body of work while Program 1 may define the next cycle | `#1255` Website Implementation and Content Operations |
| Program 3 | Collects and prioritizes future ideas, deferred work, and candidate projects | `#1379` Ideas & Future Projects Portfolio |

The lane sequence repeats. A later Program 1 cycle is not a child of an earlier
Program 1 cycle unless the current source issue explicitly creates that
relationship.

## Program 3 Promotion Rule

A Program 3 item may move toward implementation only after:

1. Bill/owner approves promotion.
2. The idea is converted into a finalized design or plan.
3. The design source of truth is saved into the GitHub repository.
4. The item is added to the appropriate registry, portfolio, or implementation
   plan.
5. Scope is decomposed into one or more bounded GitHub issues.
6. Cursor or another agent receives a specific issue, file allowlist, validation
   requirement, and stop condition.

Workflow Automation follows this path: it was captured in Program 3, then
promoted into Program 1 through `#1411` for documentation authority and later
child issue preparation.

## Operating Invariants

- One primary source issue controls each PR.
- Cursor edits files inside the active task allowlist and records validation.
- Cursor may not merge PRs, close issues, relabel issues, mutate queue state, or
  create child issues unless the active source issue explicitly authorizes it.
- Atlas reviews governance, source-issue accounting, queue conformance, and
  documentation authority.
- Bill retains merge authority, protected action authority, launch-gate approval,
  destructive issue-action authority, and strategy decision authority.
- Program 2 `#1255` remains active and is non-interference context for Program 1
  `#1411`.
- GitHub is the shared audit trail after planning content is promoted out of
  chat or Drive.

## Cursor Read Order

For PMO-governed tasks, Cursor should read:

1. The active source issue.
2. `/docs/ops/pmo/program-registry.md`.
3. `/docs/reference/pmo/lgfc-cursor-execution-contract.md`.
4. `/docs/ops/pmo/workflow-automation.md` when workflow automation, queue
   control, PR readiness, or Program 3 promotion is involved.
5. The task-specific implementation plan and authority documents named in the
   source issue.

Cursor should not reread unrelated historical program packages unless the active
source issue names them as context.
