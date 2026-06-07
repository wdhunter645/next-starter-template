---
Doc Type: Reference
Audience: Human + AI
Authority Level: Operational Authority
Owns: LGFC five-program portfolio structure, Program 1–4 execution/planning lane model, Program 5 intake model, and execution-chain reference
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

- the Program 1 / Program 2 / Program 3 / Program 4 execution and planning lane
  model;
- Program 5 intake and promotion rules;
- portfolio-level operating invariants for human and AI contributors;
- the read order for agents entering PMO-governed work.

This document does not own:

- task-level implementation plans;
- workflow YAML or runtime implementation;
- GitHub issue closure, relabeling, queue advancement, or merge actions;
- product design or website feature scope.

## Current Known Truth

- Program 1 through Program 4 are reusable execution/planning lanes. They are not
  permanent subject domains.
- Program 5 is portfolio intake and prioritization. It collects ideas, deferred
  work, candidate projects, and future opportunities; it does not execute
  implementation work directly.
- The current blocked Program 1 planning cycle is `#1411`, PMO Automation and
  Agent Workflow Control.
- The current active Program 2 execution cycle is `#1255`, Website Implementation
  and Content Operations.
- Program 3 and Program 4 are available future execution/planning lanes.
- The current portfolio source is legacy `#1379`, which should be treated as
  Program 5 portfolio authority until a dedicated Program 5 source issue exists.
- The prior Program 1 cycle `#1335` is closed historical evidence only and is not
  a parent for the new Program 1 cycle.
- Workflow Automation has been promoted from portfolio intake (`#1379`) into the
  blocked Program 1 planning cycle.

## Intended Final State

- Every active work item has exactly one current authority path:
  Program → child project → task → issue → PR → verification → closeout.
- Program 5 items become executable only after owner promotion, repository
  authority placement, task decomposition, and bounded issue/PR handoff into one
  of Program 1 through Program 4.
- A blocked planning lane and an active execution lane can proceed concurrently
  only when their scopes do not mutate or block one another.
- Completed program cycles remain evidence, not implicit parents for later
  cycles.
- A planning program starts blocked until Atlas/Bill explicitly launch it.

## Required Blocked Launch State

Every future Program 1–4 planning package must begin with this control statement:

> This program is BLOCKED from execution until the currently active program is
> closed or reaches an Atlas/Bill-approved transition gate. Planning, review, and
> documentation discussion may continue, but Cursor may not execute implementation
> work from this program until Bill/Atlas explicitly launch it.

This blocked state prevents planning issues and planning PRs from becoming active
execution by accident.

The following do not launch a program:

- creating a planning source issue;
- posting a planning handoff;
- opening a planning PR;
- marking a planning PR ready for review;
- merging a planning PR.

Launch requires an explicit Atlas/Bill launch comment or source issue update.

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

## Five-Program Lane Model

Program numbers identify reusable PMO slots, not permanent subject domains.

| Program | Role | Current example |
| --- | --- | --- |
| Program 1 | Execution/planning lane A | Blocked planning lane `#1411` |
| Program 2 | Execution/planning lane B | Active execution lane `#1255` |
| Program 3 | Execution/planning lane C | Available future lane |
| Program 4 | Execution/planning lane D | Available future lane |
| Program 5 | Future-project / ideas portfolio aggregator | Legacy portfolio issue `#1379` until dedicated Program 5 authority exists |

The purpose of Program 1–4 is nomenclature separation. At any given time, one
Program 1–4 lane may be active execution and a different Program 1–4 lane may be
blocked planning. Program 5 remains the portfolio aggregator.

A recently completed program number remains historical evidence and should not be
used as the active or blocked-planning number when another available Program 1–4
lane can avoid confusion.

## Program 5 Promotion Rule

A Program 5 item may move toward implementation only after:

1. Bill/owner approves promotion.
2. The idea is converted into a finalized design or plan.
3. The design source of truth is saved into the GitHub repository.
4. The item is added to the appropriate registry, portfolio, or implementation
   plan.
5. Scope is decomposed into one or more bounded GitHub issues.
6. Cursor or another agent receives a specific issue, file allowlist, validation
   requirement, and stop condition.
7. Atlas/Bill explicitly launch the target Program 1–4 lane.

Workflow Automation follows this path: it was captured in the portfolio, then
promoted into blocked Program 1 through `#1411` for documentation authority and
later child issue preparation.

## Operating Invariants

- One primary source issue controls each PR.
- Cursor edits files inside the active task allowlist and records validation.
- Cursor may not merge PRs, close issues, relabel issues, mutate queue state, or
  create child issues unless the active source issue explicitly authorizes it.
- Atlas reviews governance, source-issue accounting, queue conformance, and
  documentation authority.
- Bill retains merge authority, protected action authority, launch-gate approval,
  destructive issue-action authority, and strategy decision authority.
- Program 2 `#1255` remains active execution and is non-interference context for
  blocked Program 1 `#1411`.
- GitHub is the shared audit trail after planning content is promoted out of chat
  or Drive.

## Cursor Read Order

For PMO-governed tasks, Cursor should read:

1. The active source issue.
2. `/docs/ops/pmo/program-registry.md`.
3. `/docs/reference/pmo/lgfc-cursor-execution-contract.md`.
4. `/docs/ops/pmo/workflow-automation.md` when workflow automation, queue
   control, PR readiness, or Program 5 promotion is involved.
5. The task-specific implementation plan and authority documents named in the
   source issue.

Cursor should not reread unrelated historical program packages unless the active
source issue names them as context.
