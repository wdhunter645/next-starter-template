---
Doc Type: Explanation
Audience: Human + AI
Authority Level: Project Design Authority
Owns: PMO project preparation-to-execution design, project-level Cursor autonomy, project branch integration model, task manifest design, portfolio migration intent, and operations escalation model
Does Not Own: GitHub workflow implementation, repository settings, product-specific requirements, production approval, secrets, credentials, or external-service authorization
Canonical Reference: /docs/explanation/projects/pmo-project-autonomous-delivery-design.md
Related Issues: #2546, #2477, #1719
Last Reviewed: 2026-07-16
---

# PMO Project-to-Cursor Autonomous Delivery Design

## Purpose

Define the LGFC operating model for preparing a complete project once, assigning the project to Cursor Local, allowing Cursor to execute the linked task graph without routine interruption, integrating technically clean work on a non-production project branch, and retaining one human approval boundary before production use.

The design resolves a recurring delivery problem: the repository has historically decomposed projects into well-scoped child issues, but each child often required a new handoff, review transition, or launch decision even when the complete project objective and task order were already approved. That behavior creates avoidable idle time and makes continuous local-agent work difficult.

## Approved outcome

Every PMO project ultimately has:

- one overall objective;
- one completed-project deliverable;
- one ChatGPT-prepared project package;
- one non-production project branch for Model B work;
- one machine-readable manifest;
- one linked task graph;
- Cursor Local as execution agent;
- technically necessary validation at child-integration boundaries;
- no routine human approval between linked project tasks;
- one Bill/ChatGPT approval boundary before merge to `main`;
- Bill and Cursor Local as the normal Operations team after deployment;
- ChatGPT as Tier 2 escalation for unresolved technical, authority, production-safety, and cross-project issues.

## Role model

### ChatGPT / Atlas — PMO preparation and solution design

ChatGPT owns preparation before project launch:

1. define the problem, objective, and completed-project deliverable;
2. reconcile repository authority and current implementation evidence;
3. prepare design and reference documentation;
4. prepare the implementation plan and project manifest;
5. define tasks, dependencies, acceptance criteria, likely file scope, validation, rollback, and operations handoff;
6. create or materialize the linked GitHub task graph;
7. identify material decisions that still require Bill;
8. record project readiness and the production boundary.

ChatGPT does not remain a routine child-task gate after a prepared project launches.

### Cursor Local — implementation and operations execution

Cursor Local owns execution after project launch:

1. read the project manifest and active linked task;
2. implement only the prepared project scope;
3. run applicable validation;
4. remediate correctable defects and review findings within scope;
5. commit, push, and prepare child PRs against the project branch;
6. continue to successor tasks when predecessor integration and dependency conditions are satisfied;
7. prepare as-built and Operations evidence;
8. support production operation and bounded remediation after deployment.

Cursor does not approve or merge its own PRs and cannot merge to `main`.

### Bill — product authority and production approval

Bill remains:

- final product and business authority;
- final priority authority;
- authorized production approver;
- owner of material cost, credential, vendor, legal, privacy, and mission decisions;
- final completed-product reviewer when desired.

Bill is not a routine task-transition gate inside an already approved project.

### ChatGPT Tier 2 escalation

After project launch and during Operations, ChatGPT is engaged when:

- repository authority conflicts;
- a cross-project design decision is required;
- a defect exceeds the active project scope;
- release evidence is ambiguous;
- production safety is uncertain;
- rollback or remediation requires coordinated repository decisions;
- Bill requests independent verification or review.

## Project lifecycle

```text
PMO intake
→ ChatGPT discovery/design
→ implementation plan + manifest
→ linked task issues materialized
→ project Go/No-Go
→ project branch created
→ Cursor executes linked task graph
→ child PRs integrate into project branch
→ integrated project validation
→ Bill/ChatGPT completed-product review
→ promotion PR to main
→ production verification
→ Bill + Cursor Operations
→ ChatGPT Tier 2 escalation when needed
```

## Pipeline versus Active behavior

### Pipeline

A pipeline record may name Cursor Local as the future execution agent, but it is not executable until the preparation packet is complete and the project is launched.

Pipeline records must distinguish:

- **PMO Preparation Owner:** ChatGPT / Atlas;
- **Future Execution Agent:** Cursor Local;
- **Operations Owner:** Bill + Cursor Local;
- **Tier 2 Escalation:** ChatGPT;
- **Launch state:** not executable until the project package is complete and approved.

Pipeline masters and future tasks must not carry `handoff:ready`.

### Active

An active project has:

- an approved project objective and completed-project deliverable;
- a project branch;
- a validated manifest;
- a linked task graph;
- one or more executable tasks according to dependency rules;
- Cursor Local assigned for execution;
- an explicit final production approval boundary.

Only currently executable tasks should carry the Cursor wake signal.

## Delivery boundary

### Project-branch integration

For a launched Model B project, child PRs target `component/<project>` or another explicitly approved non-`main` project branch.

A child PR is eligible for automated project-branch integration when:

- the source task belongs to the project manifest;
- dependencies are satisfied;
- the base is the approved project branch;
- the diff is inside task scope;
- applicable technical checks pass;
- the PR is current and mergeable;
- no unresolved defect involves secrets, unsafe migration, production mutation, destructive external action, material scope drift, or unresolvable authority conflict.

The following are not standalone blockers at a non-production integration boundary:

- advisory-only review output;
- lifecycle wording;
- unchecked narrative checklists that do not represent a real defect;
- routine human approval;
- documentation-process findings that do not affect actual authority, safety, or correctness.

### Production promotion

A PR whose base is `main` is a production promotion boundary.

Rules:

- automatic merge to `main` is prohibited;
- Bill or ChatGPT approval is required;
- integrated project tests and release evidence must be reviewed;
- rollback and production-verification plans must be complete;
- Cursor cannot approve or merge its own promotion.

## Project manifest

The project manifest is the machine-readable execution contract. It supplements the human-readable design and implementation plan; it does not replace them.

The manifest records:

- project identity and parent PMO references;
- objective and completed-project deliverables;
- role assignments;
- lifecycle and launch state;
- project branch and production base;
- automatic integration policy;
- dependencies and external decisions;
- task IDs, issue numbers, order, predecessors, successors, scope, acceptance criteria, validation, and stop conditions;
- final review and promotion requirements.

The canonical field and validation contract is `docs/reference/pmo/project-delivery-manifest-contract.md`.

## Task issue materialization

A repository tool reads a validated manifest and creates or reconciles task issues.

Required properties:

- deterministic;
- idempotent;
- stable hidden markers for project/task identity;
- no duplicate issues after repeated runs;
- preservation of human discussion;
- dry-run and apply modes;
- explicit create/update/no-change reporting;
- fail-closed validation;
- least-privilege GitHub permissions;
- no ability to authorize automatic merge to `main`.

The tool may update a bounded generated block in an issue body. It must not overwrite unrelated human-authored content or comments.

## Dependency and continuation model

The task graph is a directed acyclic graph.

A successor becomes executable when:

- every required predecessor is integrated or explicitly dispositioned;
- project-branch state is technically clean;
- the successor package remains valid;
- no stop condition exists.

A new Bill/ChatGPT launch prompt is not required between linked tasks after project launch.

Parallel tasks are permitted when the manifest explicitly declares them independent and their file/issue mutation sets do not collide.

## Gates and validation

LGFC uses the minimum controls necessary for correctness and production safety.

### Required

- manifest validation;
- dependency validation;
- scope/allowlist validation where defined;
- technically applicable lint, tests, typecheck, build, migration, or documentation validation;
- secret and credential safety;
- destructive/irreversible action controls;
- final human approval to `main`.

### Not required by default

- a new human launch decision between linked tasks;
- a separate product review for each child PR;
- custom workflow gates that duplicate existing tests;
- advisory process checks with no correctness or safety effect;
- per-task production closeout prediction when the task cannot reach production independently.

## Portfolio migration

Open PMO records are migrated in three groups:

1. **Active projects:** complete execution metadata, branch, manifest/task linkage, current task routing, and production boundary.
2. **Planning/prepared projects:** ChatGPT preparation ownership, Cursor future execution assignment, objective/deliverable, intended branch, task graph or exact preparation gaps, and one project Go/No-Go.
3. **Strategies/candidates:** outcome-level deliverable, ChatGPT preparation checklist, Cursor future execution role, and explicit non-executable state.

Migration does not change product priority or launch a pipeline project.

## Operations model

After production deployment:

- Bill and Cursor Local handle routine operation, monitoring, and bounded remediation;
- production defects become Ops issues with explicit scope;
- Cursor handles implementation and operational corrections;
- ChatGPT joins as Tier 2 when the issue is cross-project, authority-sensitive, release-sensitive, unsafe, ambiguous, or not bounded by current Operations authority.

## Failure and rollback

The project delivery system must be disableable without losing project authority.

Rollback options include:

1. disable the task-materialization workflow;
2. use dry-run only;
3. remove wake state from executable tasks;
4. stop component integration while preserving branches and issues;
5. revert policy/template changes;
6. retain manifests and issues as audit evidence;
7. restore manual task creation and explicit task handoff without changing production approval rules.

## Success criteria

The design succeeds when:

- every project can be described as one objective, one deliverable, one branch, and one linked task graph;
- ChatGPT can prepare projects without remaining a routine execution gate;
- Cursor can work continuously from launch through integrated completion;
- task issues can be generated and reconciled from a manifest;
- project-branch integration is low-friction and technically controlled;
- no automation can merge to `main`;
- Bill/ChatGPT review the completed product before production use;
- Operations has a clear Bill/Cursor first-line model and ChatGPT Tier 2 escalation path.
