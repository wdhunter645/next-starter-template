---
Doc Type: Operations
Audience: Human + AI
Authority Level: Canonical PMO Authority
Owns: LGFC PMO v2 portfolio model, rotating program lanes, Program 5 ideas/project-draft intake, launch gates, promotion rules, agent authority boundaries, and top-down PMO documentation replacement intent
Does Not Own: Product-specific design, runtime implementation, workflow YAML, production configuration, secrets, or unauthorized GitHub issue mutation
Canonical Reference: /docs/ops/pmo/PMO-V2-OPERATING-MODEL.md
Related Issues: #1411, #1417, #1418, #1419, #1420, #1421, #1422, #1423, #1424, #1379, #1255
Last Reviewed: 2026-06-09
---

# PMO V2 Operating Model

## Purpose

This document is the top-level LGFC PMO v2 authority. It is intended to replace the prior fragmented PMO model spread across registry, portfolio, queue, workflow-automation, and agent-contract documents.

The PMO v2 goal is one aligned operating model from portfolio intake through program execution, issue creation, pull request review, verification, closeout, and promotion of future work.

## Replacement intent

This document becomes the controlling PMO authority for new planning and implementation decisions.

Existing PMO documents remain available as subordinate references until individually retired, rewritten, or reduced to implementation-specific appendices. Where an older PMO document conflicts with this file, this file controls.

## Core vocabulary

| Term | PMO v2 meaning |
| --- | --- |
| Portfolio | The prioritized execution portfolio represented by Programs 1-4. |
| Programs 1-4 | Rotating planning/execution lanes used to implement approved groups of prioritized portfolio projects. |
| Program 5 | Ideas and project drafts that are not yet portfolio-ready. |
| project | A bounded body of work inside a Program 1-4 execution portfolio lane. |
| Task | A single executable unit under a project, normally one source issue and one PR. |
| issue | GitHub source contract for a bounded task or controlled project decision. |
| PR | One scoped change set tied to exactly one source issue unless an approved exception says otherwise. |
| Launch gate | Explicit Atlas/Bill decision that a planned program or task sequence is allowed to execute. |
| Promotion | Movement of a Program 5 idea/draft into the Programs 1-4 prioritized execution portfolio. |

## Portfolio model

The LGFC portfolio is implemented by Programs 1-4.

Programs 1-4 are not permanent subject domains. They are rotating containers used to plan and execute approved project groups in portfolio priority order. A program number can later be reused for a different project group after the earlier cycle is closed and retained as historical evidence.

Program 5 is not the portfolio. Program 5 is the idea and project-draft intake lane.

## Five-program model

| Program | PMO v2 role | Current meaning |
| --- | --- | --- |
| Program 1 | Rotating portfolio execution/planning lane | PMO Automation and Agent Workflow Control staged cycle. |
| Program 2 | Rotating portfolio execution/planning lane | Website Implementation and Content Operations active cycle. |
| Program 3 | Rotating portfolio execution/planning lane | Available for the next prioritized project group when selected. |
| Program 4 | Rotating portfolio execution/planning lane | Available for a later prioritized project group when selected. |
| Program 5 | Ideas and project drafts | Intake for concepts not yet ready for portfolio admission or prioritization. |

## Program 5 definition

Program 5 contains ideas and project drafts. A Program 5 item is not yet ready to be executed as part of Programs 1-4.

Program 5 items may include:

- early ideas;
- draft project concepts;
- deferred work without current priority;
- future opportunities;
- design fragments not yet converted into repo authority;
- work that needs readiness review before prioritization.

Program 5 does not authorize implementation. It does not function as an issue queue. It is the holding and preparation area before portfolio admission.

## Promotion from Program 5 into Programs 1-4

A Program 5 item may move into the portfolio only after these gates are satisfied:

1. Bill or the owner approves the idea for promotion review.
2. The idea is documented as a project candidate.
3. Missing design, scope, constraints, and expected outcomes are clarified.
4. Repository documentation becomes the source of truth.
5. The project is added to the portfolio priority discussion.
6. Atlas/Bill decide whether it belongs in Program 1, 2, 3, or 4.
7. The project is decomposed into bounded tasks and source issues.
8. A launch gate authorizes execution.

Until those gates are complete, the item remains Program 5 material.

## Program 1 current status under PMO v2

Program 1 remains the staged PMO Automation and Agent Workflow Control cycle. It is documentation-heavy and governance-heavy, with limited testing and minimal configuration.

Program 1 is aligned with PMO v2 only after all references to legacy "Program 3 intake" are replaced with the correct Program 5 idea/draft intake model.

Program 1 should produce enforceable rules, not broad essays. Its success condition is a clean operating model for agent handoff, Cursor continuation, PR readiness, merge authority, issue mutation authority, queue/wave planning, and post-merge closeout evidence.

## Program 2 current status under PMO v2

Program 2 remains the active Website Implementation and Content Operations cycle. PMO v2 does not reinterpret its website design scope or runtime implementation scope.

PMO v2 only clarifies how Program 2 fits into the rotating portfolio lane model.

## Program 3 proposed role

Program 3 is available as the next rotating portfolio execution/planning lane when Atlas/Bill select a prioritized project group for that lane.

Program 3 should not be used as an intake bucket. Intake belongs to Program 5.

A proposed Program 3 project list should be built from approved and prioritized portfolio candidates, not raw ideas.

## Program 4 proposed role

Program 4 is another available rotating portfolio execution/planning lane. It may be used for a later prioritized project group when Program 3 is occupied or when separation from an active/historical program number is needed.

## Execution chain

PMO v2 preserves this chain:

```text
Program 1-4 portfolio lane
→ project
→ task
→ source issue
→ pull request
→ verification
→ closeout
```

Program 5 precedes this chain:

```text
Program 5 idea / project draft
→ documentation and readiness review
→ portfolio prioritization
→ promotion into Program 1-4
```

## Authority boundaries

| Actor | May do | May not do without explicit authorization |
| --- | --- | --- |
| Bill | Approve strategy, launch gates, merges, protected actions, destructive issue actions, prioritization. | N/A. |
| Atlas | Define PMO authority, review governance, prepare issue/PR instructions, perform explicitly authorized issue closeout. | Mutate issues or repo state when the user asked only for a prompt or analysis. |
| Cursor | Implement bounded tasks, update PR bodies, run validation, stop at READY FOR REVIEW. | Merge, close issues, relabel, advance queues, create child issues, mutate issue state, or expand scope. |
| Controller / automation | Run explicitly defined checks and authorized closeout steps. | Infer authority from merge state, labels, queue order, or prior discussion. |

## Source-of-truth hierarchy

1. PMO v2 operating model: this file.
2. Current active program source issue.
3. Current program implementation plan.
4. Task/source issue body.
5. PR body, validation evidence, and review disposition.
6. Subordinate PMO reference documents.
7. Historical issues, prior programs, chat, and Drive drafts.

## Documentation replacement rule

Future PMO documentation changes must be top-down:

1. Update this PMO v2 operating model first.
2. Update subordinate PMO docs to conform.
3. Update program implementation plans.
4. Update task/source issues only after the governing docs are aligned.
5. Do not perform disjointed PMO edits that change one document while leaving the overall model inconsistent.

## Program launch readiness rule

A Program 1-4 lane is launch-ready only when:

- its purpose and project group are defined;
- its implementation plan exists;
- project/task boundaries are clear;
- issue creation rules are defined;
- authority boundaries are explicit;
- validation and closeout expectations are defined;
- Program 5 dependencies, if any, have been promoted into portfolio authority;
- Atlas/Bill explicitly authorize launch.

## PMO v2 immediate transition plan

1. Add this PMO v2 operating model.
2. Replace or subordinate conflicting PMO docs.
3. Align Program 1 terminology with PMO v2.
4. Review staged Program 1 task issues for stale Program 3/Program 5 language.
5. Produce a proposed Program 3 project list.
6. Produce a Program 5 ideas/project-draft list for Bill discussion.

## Known required alignment updates

The following legacy assumptions must be removed from PMO docs and Program 1 task definitions:

- Program 3 is the idea/project intake lane.
- Program 3 is the portfolio aggregator.
- Program 5 is the portfolio.
- Workflow Automation moved from Program 3 intake.

The correct language is:

- Portfolio = Programs 1-4.
- Program 5 = ideas and project drafts.
- Program 5 items are promoted into Programs 1-4 only after readiness review and prioritization.
