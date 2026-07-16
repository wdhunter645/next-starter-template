---
Doc Type: Operations
Audience: Human + AI
Authority Level: Project Implementation Plan
Owns: Execution sequence, task scope, dependencies, branch model, validation, rollback, portfolio migration, and closeout for Project #2546
Does Not Own: Product-specific PMO priorities, unrelated project launch decisions, production merge approval, secrets, credentials, or external-service authorization
Canonical Reference: /docs/ops/implementation-plans/pmo-project-autonomous-delivery/implementation-plan.md
Related Issues: #2546, #2547, #2549, #2550, #2551, #2552, #2553, #2554
Last Reviewed: 2026-07-16
---

# PMO Project-to-Cursor Autonomous Delivery — Implementation Plan

## Project identity

| Field | Value |
| --- | --- |
| Project issue | #2546 |
| Parent program | #1719 |
| Delivery dependency | #2477 |
| Project branch | `component/pmo-project-autonomous-delivery` |
| Upstream branch | `component/delivery-system-v1` |
| PMO preparation owner | ChatGPT / Atlas |
| Execution agent | Cursor Local |
| Operations owner | Bill + Cursor Local |
| Tier 2 escalation | ChatGPT / Atlas |
| Final production boundary | Promotion PR to `main`, Bill/ChatGPT approval required |

## Overall objective

Create one durable repository mechanism that allows ChatGPT to prepare a complete PMO project package and allows Cursor Local to execute its linked task graph continuously on a non-production project branch, while retaining technically necessary integration checks and a mandatory human approval boundary before production use.

## Completed-project deliverable

A validated and operational PMO project-delivery system with:

- canonical role and delivery authority;
- machine-readable manifests;
- deterministic task issue materialization;
- safe CI dispatch;
- project/task templates;
- migrated active and pipeline PMO portfolio records;
- verified non-main integration and `main` approval boundaries;
- operator handoff and rollback procedures.

## Design and contract sources

- `docs/explanation/projects/pmo-project-autonomous-delivery-design.md`
- `docs/reference/pmo/project-delivery-manifest-contract.md`
- `docs/ops/implementation-plans/pmo-project-autonomous-delivery/project-manifest.json`
- Project #2546

## Execution model

- One project branch contains the integrated deliverable.
- Each task remains a distinct source issue and PR/evidence unit.
- Cursor may continue through linked tasks after predecessor integration without another routine launch prompt.
- Project-branch PRs may auto-integrate after technically necessary validation.
- Cursor cannot approve or merge its own work.
- No PR targeting `main` may auto-merge.
- Tasks 004–006 may run in parallel only after Task 003 and only when issue-mutation/file sets are proven non-colliding.
- Task 007 joins the migration lanes and produces the final acceptance package.

## Bootstrap task graph

| Order | Issue | Task | Predecessor | Successor | Primary output |
| ---: | ---: | --- | --- | --- | --- |
| 001 | #2547 | Manifest validator and issue materializer | Project package committed | #2549 | Script, schema, tests, dry-run/apply commands |
| 002 | #2549 | CI task-materialization workflow | #2547 integrated | #2550 | Least-privilege workflow and operator runbook |
| 003 | #2550 | Canonical PMO and delivery authority reconciliation | #2547 and #2549 integrated | #2551, #2552, #2553 | Authority/templates aligned to project-level autonomy |
| 004 | #2551 | Active PMO project migration | #2550 integrated | #2554 | Active portfolio migration + audit report |
| 005 | #2552 | Prepared/planning PMO project migration | #2550 integrated | #2554 | Prepared/planning migration + gap register |
| 006 | #2553 | Strategy/candidate normalization | #2550 integrated | #2554 | Strategy/candidate role normalization + prep queue |
| 007 | #2554 | Integrated validation and operator handoff | #2551, #2552, #2553 integrated | terminal | Final audit, boundary proof, rollback, promotion package |

## Task 001 — Manifest validator and issue materializer

### Objective

Build the deterministic tool that validates a project manifest and creates or reconciles linked task issues.

### Scope

- `scripts/pmo-projects/**`
- focused tests/fixtures
- `package.json` bounded command additions
- manifest contract examples when needed

### Required behavior

- strict validation;
- stable project/task markers;
- DAG validation;
- dry-run/apply modes;
- create/update/no-change/blocked/adoption-candidate output;
- idempotency;
- preservation of human-authored issue content;
- fail-closed production-auto-merge rule.

### Validation

- valid fixture;
- missing required fields;
- duplicate task IDs;
- unresolved predecessor/successor;
- dependency cycle;
- repeated apply idempotency;
- changed generated block update;
- marker collision;
- project branch equal to `main` rejection;
- `autoMergeProduction=true` rejection.

## Task 002 — CI issue materialization

### Objective

Add trusted, least-privilege CI/manual dispatch around the Task 001 tool.

### Scope

- `.github/workflows/pmo-project-task-materializer.yml`
- `scripts/pmo-projects/**`
- focused workflow fixtures/tests
- `docs/how-to/pmo/**`

### Required behavior

- manual manifest path input;
- explicit dry-run/apply input;
- read-only validation for untrusted PR contexts;
- no apply from forks or arbitrary comments;
- `contents:read` and `issues:write` only for apply;
- job summary/artifact;
- rollback/disable documentation.

## Task 003 — Canonical authority reconciliation

### Objective

Make the project-level operating model internally consistent across PMO, Cursor, PR, issue, and delivery authority.

### Required policy outcomes

- ChatGPT prepares project packages.
- Cursor Local executes and operates prepared projects.
- A launched manifest/task graph authorizes continuous linked task execution.
- Non-main integration uses technically necessary checks only.
- Process-only advisory signals do not block non-production integration.
- Cursor cannot self-approve or self-merge.
- `main` requires Bill/ChatGPT approval.
- Operations is Bill + Cursor Local first line; ChatGPT is Tier 2.

### Likely authority surfaces

- `docs/ops/pmo/PMO-JULY-2026-OPERATING-MODEL.md`
- `docs/governance/PMO-PORTFOLIO.md`
- `docs/governance/DELIVERY-AND-RELEASE.md`
- `docs/reference/pmo/lgfc-cursor-execution-contract.md`
- `docs/how-to/delivery/run-model-b-component-release.md`
- `.github/ISSUE_TEMPLATE/**`
- `.github/pull_request_template.md`
- `docs/templates/**`

### Migration rule

Update authoritative documents top-down. Do not leave an older universal per-task human stop rule active beside the new project-level rule.

## Task 004 — Active portfolio migration

### Objective

Align every open Active portfolio parent record.

### Required fields on active projects

- overall objective;
- completed-project deliverable;
- PMO Preparation Owner;
- Execution Agent;
- Operations Owner;
- Tier 2 escalation;
- project branch;
- production boundary;
- design/plan/manifest links;
- complete task graph;
- current executable task;
- continuous execution rule;
- stop/escalation conditions.

### Routing invariant

Only currently executable task issues carry `handoff:ready`. Project masters and future tasks do not.

## Task 005 — Prepared/planning portfolio migration

### Objective

Align Pipeline portfolio records whose stage is planning, preparation, or ready for launch.

### Required behavior

- preserve Pipeline lifecycle;
- name ChatGPT preparation and Cursor future execution roles;
- state objective and completed-project deliverable;
- identify intended branch and production boundary;
- link existing tasks/plan/manifest;
- replace repeated per-task launch decisions with one project-level launch decision when the package is complete;
- record exact preparation gaps where the package is incomplete;
- never wake or launch the project during migration.

## Task 006 — Strategy/candidate normalization

### Objective

Normalize outcome-level PMO records without inventing implementation scope.

### Required role block

```text
PMO Preparation and Solution Design: ChatGPT / Atlas
Future Execution Agent: Cursor Local
Operations: Bill + Cursor Local
Tier 2 Escalation: ChatGPT / Atlas
Launch State: not executable until design, implementation plan, manifest, task graph, branch, validation, rollback, operations handoff, and project Go/No-Go are complete
```

### Required preparation checklist

- product/outcome decision;
- design authority;
- dependencies and sequencing;
- costs/vendors/credentials;
- rights/privacy/legal boundaries;
- implementation plan;
- project branch;
- task graph/manifest;
- validation and rollback;
- operations handoff;
- explicit launch decision.

## Task 007 — Integrated validation and closeout

### Objective

Prove the system and prepare final review.

### Required evidence

1. Complete live inventory of open PMO portfolio records.
2. Active migration coverage.
3. Prepared/planning migration coverage.
4. Strategy/candidate normalization coverage.
5. Manifest validation and idempotency test results.
6. Wake-state correctness.
7. Project-branch integration evidence.
8. Explicit rejection/prohibition of automatic `main` merge.
9. Final Bill/ChatGPT production review boundary.
10. Exceptions and deferred preparation queue.
11. Rollback/disable procedure.
12. Operations handoff.

## Portfolio audit queries

Use live GitHub state; do not rely on a static list alone.

Representative queries:

```text
repo:wdhunter645/next-starter-template is:issue is:open label:pmo label:pmo:active
repo:wdhunter645/next-starter-template is:issue is:open label:pmo label:pmo:pipeline
repo:wdhunter645/next-starter-template is:issue is:open label:pmo in:title "PROGRAM:"
repo:wdhunter645/next-starter-template is:issue is:open label:pmo in:title "PROJECT:"
repo:wdhunter645/next-starter-template is:issue is:open label:pmo in:title "PROGRAM CANDIDATE:"
repo:wdhunter645/next-starter-template is:issue is:open label:pmo in:title "STRATEGY:"
repo:wdhunter645/next-starter-template is:issue is:open label:pmo in:title "STRATEGY REVIEW:"
```

Task rows must be excluded from standalone portfolio migration counts but included when validating parent task linkage.

## Validation profiles

### Documentation and manifest

- documentation frontmatter/header validation;
- canonical-reference validation;
- JSON parse/schema validation;
- dependency graph validation;
- `git diff --check`;
- no tracked ZIP.

### Node/tooling

- focused unit tests;
- lint/typecheck where applicable;
- package script execution;
- dry-run against fixtures;
- apply against test/stub API boundary where feasible;
- repeated-run idempotency proof.

### Workflow

- event matrix validation;
- least-privilege permissions review;
- fork/untrusted-event apply prevention;
- manifest failure behavior;
- job-summary output;
- disabled/rollback behavior.

### Integrated project

- full project-focused test set;
- repository-required technical checks;
- portfolio audit completeness;
- no automatic `main` merge path;
- promotion PR remains human-controlled.

## Integration and approval

### Child integration

Child PRs target `component/pmo-project-autonomous-delivery` and may auto-integrate after technically necessary checks pass and no real safety/scope defect remains.

### Production promotion

The final project branch promotion targets `main`. It must not auto-merge. Bill or ChatGPT reviews the completed integrated deliverable, validation evidence, exceptions, rollback, and operations handoff before approval.

## Rollback

If the system is unsafe or ineffective:

1. disable the materialization workflow;
2. retain dry-run validation only;
3. remove wake state from generated tasks;
4. stop automatic project-branch integration;
5. revert authority/template changes;
6. preserve manifests/issues for audit;
7. return to manual task creation and explicit handoff;
8. leave the `main` human approval rule unchanged.

## Stop conditions

Stop project execution only for:

- unresolved material product/design decision;
- authority conflict without deterministic precedence;
- unsafe issue mutation;
- credential, vendor, expense, legal, or privacy decision;
- secret exposure;
- destructive/irreversible action;
- production mutation outside approved promotion;
- technical failure that cannot be corrected within project scope.

Do not stop for routine task transitions, advisory process output, documentation placement, or correctable validation failures.
