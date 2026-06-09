---
Doc Type: Reference
Audience: Human + AI
Authority Level: Operational Authority
Owns: LGFC PMO v2 portfolio structure, Programs 1-4 rotating execution portfolio model, Program 5 ideas/project-draft intake model, and execution-chain reference
Does Not Own: Product design, workflow implementation, runtime behavior, GitHub issue mutation, or merge authority
Canonical Reference: /docs/ops/pmo/PMO-V2-OPERATING-MODEL.md
Related Issues: #1411, #1417, #1418, #1419, #1420, #1421, #1422, #1423, #1424, #1379, #1255
Last Reviewed: 2026-06-09
---

# LGFC Program Portfolio Model

## Purpose

Define the PMO v2 portfolio model used to coordinate LGFC work across planning, execution, review, verification, and closeout without overloading agents with unbounded prompts or creating competing issue trees.

This document is subordinate to `/docs/ops/pmo/PMO-V2-OPERATING-MODEL.md`. It explains the portfolio mechanics; PMO v2 controls if there is a conflict.

## Scope

This document owns:

- Programs 1-4 as the prioritized execution portfolio;
- Program 5 as ideas and project drafts;
- promotion from Program 5 into Programs 1-4;
- portfolio-level operating invariants for human and AI contributors;
- the read order for agents entering PMO-governed work.

This document does not own:

- task-level implementation plans;
- workflow YAML or runtime implementation;
- GitHub issue closure, relabeling, queue advancement, or merge actions;
- product design or website feature scope.

## Current Known Truth

- Programs 1-4 collectively represent the prioritized execution portfolio.
- Programs 1-4 are rotating planning/execution lanes, not permanent subject domains.
- Program 5 is the ideas and project-drafts lane for work not yet portfolio-ready.
- The active Program 1 planning cycle is `#1411`, PMO Automation and Agent Workflow Control.
- The active Program 2 execution cycle is `#1255`, Website Implementation and Content Operations.
- Program 3 and Program 4 are available future portfolio lanes.
- Legacy `#1379` currently represents Program 5 idea/draft intake until a dedicated Program 5 issue is created.
- The prior Program 1 cycle `#1335` is closed historical evidence only and is not a parent for the current Program 1 cycle.
- Workflow Automation has been promoted from Program 5 idea/draft material into the active Program 1 planning cycle.

## Intended Final State

- Every active work item has exactly one current authority path:
  Program → child project → task → issue → PR → verification → closeout.
- Programs 1-4 execute approved and prioritized portfolio project groups.
- Program 5 items become executable only after owner promotion, repository authority placement, task decomposition, and bounded issue/PR handoff.
- Program planning and execution can proceed concurrently only when their scopes do not mutate or block one another.
- Completed program cycles remain evidence, not implicit parents for later cycles.

## Portfolio Chain

Programs 1-4 use this execution chain:

```text
Program 1-4 portfolio lane → child project → task → issue → PR → verification → closeout
```

Program 5 uses this intake chain:

```text
Program 5 idea / project draft → documentation and readiness review → portfolio prioritization → promotion into Program 1-4
```

## Program Lane Model

Program numbers identify PMO cycle position, not permanent subject domains.

| Lane | Role in PMO v2 cycle | Current example |
| --- | --- | --- |
| Program 1 | Rotating portfolio execution/planning lane | `#1411` PMO Automation and Agent Workflow Control |
| Program 2 | Rotating portfolio execution/planning lane | `#1255` Website Implementation and Content Operations |
| Program 3 | Rotating portfolio execution/planning lane | Available future lane |
| Program 4 | Rotating portfolio execution/planning lane | Available future lane |
| Program 5 | Ideas and project drafts | Legacy `#1379` until dedicated Program 5 authority exists |

The lane sequence repeats. A later Program 1 cycle is not a child of an earlier Program 1 cycle unless the current source issue explicitly creates that relationship.

## Program 5 Promotion Rule

A Program 5 item may move toward Programs 1-4 only after:

1. Bill/owner approves promotion review.
2. The idea is converted into a documented project candidate.
3. The design source of truth is saved into the GitHub repository.
4. Readiness gaps are identified and resolved or accepted.
5. The item is added to the portfolio priority discussion.
6. Scope is decomposed into one or more bounded projects/tasks.
7. Cursor or another agent receives a specific issue, file allowlist, validation requirement, and stop condition.
8. Atlas/Bill explicitly authorize launch into a Program 1-4 lane.

Workflow Automation follows this path: it was captured as idea/draft material, then promoted into Program 1 through `#1411` for documentation authority and later child issue preparation.

## Operating Invariants

- One primary source issue controls each PR.
- Cursor edits files inside the active task allowlist and records validation.
- Cursor may not merge PRs, close issues, relabel issues, mutate queue state, or create child issues unless the active source issue explicitly authorizes it.
- Atlas reviews governance, source-issue accounting, queue conformance, and documentation authority.
- Bill retains merge authority, protected action authority, launch-gate approval, destructive issue-action authority, and strategy decision authority.
- GitHub is the shared audit trail after planning content is promoted out of chat or Drive.

## Cursor Read Order

For PMO-governed tasks, Cursor should read:

1. The active source issue.
2. `/docs/ops/pmo/PMO-V2-OPERATING-MODEL.md`.
3. `/docs/ops/pmo/program-registry.md`.
4. `/docs/reference/pmo/lgfc-program-queue-and-dependency-map.md` when the program uses launched-program queue mode.
5. `/docs/reference/pmo/lgfc-cursor-execution-contract.md`.
6. `/docs/ops/pmo/workflow-automation.md` when workflow automation, queue control, PR readiness, or Program 5 promotion is involved.
7. The task-specific implementation plan and authority documents named in the source issue.

Cursor should not reread unrelated historical program packages unless the active source issue names them as context.
