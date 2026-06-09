---
Doc Type: Operations
Audience: Human + AI
Authority Level: Canonical PMO Authority
Owns: LGFC PMO v3 program issue model, PMO meeting issue model, PMO Backlog rules, launch gates, promotion rules, agent authority boundaries, and top-down PMO documentation replacement intent
Does Not Own: Product-specific design, runtime implementation, workflow YAML, production configuration, secrets, or unauthorized GitHub issue mutation
Canonical Reference: /docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
Related Issues: #1411, #1417, #1418, #1419, #1420, #1421, #1422, #1423, #1424, #1379, #1255, #1501
Last Reviewed: 2026-06-09
---

# PMO V3 Operating Model

## Purpose

This document is the top-level LGFC PMO v3 authority. It supersedes the PMO v2 five-program lane model for future PMO operation.

PMO v3 is issue-number based. A program is a GitHub program issue. Program issue numbers are the durable program identifiers. Programs are unlimited. Programs are not represented by fixed Program 1–5 lane names.

The PMO v3 goal is one aligned operating model from PMO meeting review through backlog intake, program execution, issue creation, pull request review, verification, closeout, and promotion of future work.

## Replacement intent

This document becomes the controlling PMO authority for new planning and implementation decisions.

`/docs/ops/pmo/PMO-V2-OPERATING-MODEL.md` is historical and superseded. Where older PMO documents conflict with this file, this file controls.

## Core model

- PMO v3 is issue-number based.
- A program is a GitHub program issue.
- Program issue numbers are the durable program identifiers.
- Programs are unlimited.
- A program issue defines one approved, active, staged, blocked, completed, historical, or proposed body of work.
- Programs are not represented by fixed Program 1–5 lane names.
- Historical Program 1 and Program 2 labels may remain where needed for continuity, but they are not PMO v3 operating identifiers.
- Future program identifiers must use issue-number format: `Program #<issue-number> — <program name>`.

## Current program issues

### Program #1255 — Website Implementation and Content Operations

| Field | Value |
| --- | --- |
| Historical label | Program 2 |
| Status | Active |
| Rule | Do not rename or disrupt in PMO v3 migration work. |

### Program #1411 — PMO Automation and Agent Workflow Control

| Field | Value |
| --- | --- |
| Historical label | Program 1 |
| Status | Staged / blocked |
| Launch rule | Blocked until Program #1255 is completed and signed off. |

### Legacy #1379

| Field | Value |
| --- | --- |
| Role | Historical future-project / ideas source only |
| Status | Superseded by PMO Backlog documentation |
| Rule | No standing PMO Backlog issue is required |

## Terminology

| Term | PMO v3 meaning |
| --- | --- |
| PMO meeting issue | A GitHub issue used to capture PMO meeting agenda, minutes, decisions, backlog updates, new issues created, and PRs resulting from the meeting. |
| Program issue | A GitHub issue defining one approved, active, staged, blocked, completed, historical, or proposed body of work. |
| Program issue number | The durable program identifier. |
| PMO Backlog | Ideas, project drafts, and implementation-ready projects. |
| Project | A bounded workstream under a program. |
| Task issue | A single executable unit under a project/program, normally one source issue and one PR. |
| PR | One scoped change set tied to exactly one source issue unless an approved exception says otherwise. |
| Launch gate | Explicit Bill/Atlas/controller authorization that a program or task sequence may execute. |
| Closeout | Post-merge verification and authorized source issue disposition. |

## PMO v3 hierarchy

```text
PMO meeting issue
→ PMO Backlog review/update
→ program issue
→ project / task issue
→ PR
→ validation
→ closeout
```

## Program issue rules

- Program issue number is the program identifier.
- Program issue title should begin with `Program:` when possible.
- A program issue must define:
  - Purpose
  - Scope
  - Status
  - Owner/authority
  - Related docs
  - Child project/task issues
  - Launch state
  - Blocked-by / dependencies
  - Acceptance criteria
  - Closeout criteria
- A program issue does not authorize execution unless launch state explicitly says active/launched.
- Program issues may be active, staged, blocked, completed, historical, or proposed.
- Labels, queue order, prior merge state, and closed predecessor issues alone do not authorize execution.

## PMO meeting issue rules

- A PMO meeting issue is a meeting record, not a program.
- A PMO meeting issue should include:
  1. Review current program status.
  2. Review PMO Backlog.
  3. Discuss project priorities.
  4. Define projects for the next program.
  5. Discuss ideas and needs.
  6. Update PMO Backlog.
  7. Record decisions, new issues, required documentation updates, and resulting PRs.
- PRs may use a PMO meeting issue as source when the PR updates documentation based on meeting decisions.
- The meeting issue should list:
  - decisions made;
  - program issues discussed;
  - program issues created;
  - project/task issues created;
  - PMO Backlog sections changed;
  - documentation PRs opened or required.

## PMO Backlog rules

- PMO Backlog = ideas, project drafts, and implementation-ready projects.
- PMO Backlog is a repo document, not a standing GitHub issue. See `/docs/ops/pmo/pmo-backlog.md`.
- PMO Backlog is reviewed in every PMO meeting.
- PMO Backlog tracks:
  - ideas;
  - project drafts;
  - implementation-ready projects;
  - documentation locations for drafts/projects;
  - suggested next action;
  - promotion history;
  - archived/not-planned items.
- PMO Backlog does not authorize implementation.
- Backlog placement does not authorize Cursor work.
- Work becomes executable only through a program issue or task source issue with explicit authorization.

## Promotion from PMO Backlog

A PMO Backlog item may move toward executable work only after these gates are satisfied:

1. Bill or the owner approves the item for promotion review during a PMO meeting or explicit Bill/Atlas review.
2. The item is documented as a project candidate.
3. Missing design, scope, constraints, and expected outcomes are clarified.
4. Repository documentation becomes the source of truth.
5. The item is prioritized against current program work.
6. A program issue is created or updated if the work becomes a program.
7. Project/task issues are created if the work is executable.
8. A launch gate authorizes execution.

Until those gates are complete, the item remains PMO Backlog material.

## Workflow record model

Issues and pull requests are workflow records. They capture a bounded moment in time: the authorization, scope, review evidence, validation evidence, and closeout state for one planning or implementation pass.

Repository documentation is the durable authority. Planning conversations may evolve into production-ready documentation through one or more workflow records, but the final source of truth is the merged documentation, not the historical issue or PR.

Agents must not treat a closed historical planning issue as active durable authority. They may use it as workflow evidence only.

## Authority boundaries

| Actor | May do | May not do without explicit authorization |
| --- | --- | --- |
| Bill | Approve strategy, launch gates, merges, protected actions, destructive issue actions, prioritization. | N/A. |
| Atlas | Define PMO authority, review governance, prepare issue/PR instructions, perform explicitly authorized issue closeout. | Mutate issues or repo state when the user asked only for a prompt or analysis. |
| Cursor | Implement bounded tasks, update PR bodies, run validation, stop at READY FOR REVIEW. | Merge, close issues, relabel, advance queues, create child issues, mutate issue state, or expand scope. |
| Controller / automation | Run explicitly defined checks and authorized closeout steps. | Infer authority from merge state, labels, queue order, or prior discussion. |

## Source-of-truth hierarchy

1. PMO v3 operating model: this file.
2. Current active repository documentation governing the subject.
3. Current program implementation plan.
4. Task/source issue body.
5. PR body, validation evidence, and review disposition.
6. Subordinate PMO reference documents.
7. Historical issues, prior programs, chat, and Drive drafts.

## Documentation replacement rule

Future PMO documentation changes must be top-down:

1. Update this PMO v3 operating model first.
2. Update subordinate PMO docs to conform.
3. Update program implementation plans.
4. Update task/source issues only after the governing docs are aligned.
5. Do not perform disjointed PMO edits that change one document while leaving the overall model inconsistent.

## Program launch readiness rule

A program issue is launch-ready only when:

- its purpose and project group are defined;
- its implementation plan exists;
- project/task boundaries are clear;
- issue creation rules are defined;
- authority boundaries are explicit;
- validation and closeout expectations are defined;
- PMO Backlog dependencies, if any, have been promoted into program authority;
- Atlas/Bill explicitly authorize launch.

## Historical PMO v2 transition note

PMO v2 used a five-program lane model (Programs 1–5). That model is retired for future PMO operation. Historical Program 1 and Program 2 references remain in evidence where needed for continuity. Do not introduce Program 3, Program 4, or Program 5 as PMO v3 operating labels.
