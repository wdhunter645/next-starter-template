---
Doc Type: Implementation Plan
Audience: Human + AI
Authority Level: Operational Authority
Owns: Program 1 PMO Automation and Agent Workflow Control orchestration plan, task boundaries, child issue readiness, validation, and Atlas/Bill walkthrough gate
Does Not Own: Program 2 website implementation, workflow YAML changes, runtime application behavior, D1 migrations, production configuration, GitHub issue mutation, or merge authority
Status: staged-pending-v2-issue-alignment
Project: program-1-pmo-automation-agent-workflow-control
Owner: Atlas
Execution Mode: orchestrated
Source Issue: 1411
Related Program Issue: 1411
Canonical Reference: /docs/ops/pmo/PMO-V2-OPERATING-MODEL.md
Related Issues: #1411, #1417, #1418, #1419, #1420, #1421, #1422, #1423, #1424, #1379, #1255, #1335
Last Reviewed: 2026-06-09
---

# Program 1 — PMO Automation and Agent Workflow Control

## Launch-state control statement

This program is BLOCKED from execution until Atlas/Bill explicitly launch it. Planning, review, and documentation discussion may continue, but Cursor may not execute implementation work from this program until Bill/Atlas explicitly launch it.

## Purpose

Define the next Program 1 body of work under the PMO v2 model.

This Program 1 cycle converts promoted PMO Automation and Agent Workflow Control work into repository-owned documentation, governance, task boundaries, and launch readiness. It is primarily documentation/governance work, with validation and limited testing where existing scripts or policy checks are touched.

## PMO v2 alignment

PMO v2 changes the governing model:

- Portfolio = Programs 1-4.
- Programs 1-4 are rotating portfolio planning/execution lanes.
- Program 5 = ideas and project drafts that are not yet portfolio-ready.
- Program 5 items require documentation, readiness review, prioritization, and promotion before entering Programs 1-4.

Legacy references that treated Program 3 as intake or Program 5 as the portfolio are superseded by `/docs/ops/pmo/PMO-V2-OPERATING-MODEL.md`.

## Scope

This plan owns:

- PMO v2 authority alignment;
- Workflow Automation design migration from Program 5 idea/draft material into GitHub documentation authority;
- Cursor continuation and queue contract;
- PR readiness and batch-review control;
- merge and issue mutation policy;
- queue/wave model and label planning;
- post-merge closeout evidence stabilization;
- Program 5 promotion process;
- Program 1 launch gate readiness.

This plan does not own:

- Program 2 website/content implementation under `#1255`;
- workflow YAML changes;
- orchestrator script changes;
- application/runtime changes;
- D1 migrations;
- production configuration or secrets;
- issue closure, relabeling, queue mutation, or child issue creation unless separately authorized;
- merge authority or PR readiness mutation by Cursor.

## Current Known Truth

- issue `#1411` is the Program 1 source issue for this cycle and is already closed complete from the first planning pass.
- task issues `#1417` through `#1424` exist but contain stale Program 3 intake language and must be reviewed/aligned before Program 1 launch.
- issue `#1379` currently functions as legacy Program 5 idea/project-draft intake until a dedicated Program 5 authority issue is created.
- issue `#1255` is the active Program 2 Website Implementation and Content Operations execution lane.
- issue `#1335` is the completed prior Program 1 Phase 1 Wrap-Up cycle and is historical evidence only.

## Intended Final State

- Program 1 conforms to PMO v2.
- Programs 1-4 are consistently treated as the execution portfolio.
- Program 5 is consistently treated as ideas and project drafts.
- Workflow Automation design authority lives in GitHub documentation before implementation.
- Cursor can safely continue through validation and PR body updates, then stop at `READY FOR REVIEW` for Atlas/Bill walkthrough.
- PR readiness, batch review, merge authority, and issue mutation remain under Atlas/Bill control.
- Closeout evidence requirements are stable enough to support later automation without premature issue mutation.

## Program 1 staged status review

| Item | Status | Required action |
| --- | --- | --- |
| Source issue `#1411` | Closed complete from prior planning pass | Treat as historical planning source unless reopened or superseded by new PMO v2 source issue |
| Task issues `#1417`-`#1424` | Created, blocked, stale terminology present | Update or supersede issue bodies before launch |
| Implementation plan | This document | Aligned to PMO v2 by this revision |
| PMO top-level authority | `/docs/ops/pmo/PMO-V2-OPERATING-MODEL.md` | New controlling authority |
| Program 1 launch status | Not launched | Launch only after Atlas/Bill confirm aligned task set |

## Program 1 project areas under PMO v2

| Task | Project area | PMO v2 correction |
| --- | --- | --- |
| Task 001 | PMO v2 authority | Replace Program 3 intake model with Programs 1-4 portfolio / Program 5 ideas-drafts model |
| Task 002 | Workflow Automation Design Migration | Treat Workflow Automation as promoted from Program 5 idea/draft material |
| Task 003 | Cursor Continuation and Queue Contract | Preserve source-issue and READY FOR REVIEW stop controls |
| Task 004 | PR Readiness and Batch Review Control | Preserve Bill/Atlas review and merge authority |
| Task 005 | Merge and Issue Mutation Policy | Separate evidence generation from mutation authority |
| Task 006 | Queue/Wave Model and Label Planning | Keep labels/run IDs as planning concepts until explicit implementation |
| Task 007 | Post-Merge Closeout Evidence Stabilization | Require stable evidence before source issue closeout or queue advancement |
| Task 008 | Program 5 Promotion and Program 1 Launch Gate | Replace Program 3 promotion with Program 5 promotion and launch gate readiness |

## Updated task definitions

## Task 001 — PMO V2 Authority

Type: governance
Agent: atlas
Priority: 1
Depends On: none
Allowed Files:

- `docs/ops/pmo/PMO-V2-OPERATING-MODEL.md`
- `docs/ops/pmo/program-registry.md`
- `docs/reference/pmo/lgfc-program-portfolio-model.md`
- `docs/ops/pmo/critical-path.md`

Acceptance Criteria:

- Portfolio is defined as Programs 1-4.
- Programs 1-4 are rotating planning/execution lanes, not permanent subject domains.
- Program 5 is defined as ideas and project drafts, not the portfolio and not an implementation queue.
- Completed program cycles are historical evidence only.
- Existing stale Program 3 intake references are removed or explicitly superseded.

Validation:

- `DOCS_HEADER_FILE_LIST=<task-allowed-files-list> ./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`

Rollback:

- Revert only PMO authority documentation updates.

---

## Task 002 — Workflow Automation Design Migration

Type: governance
Agent: cursor
Priority: 2
Depends On: Task 001
Allowed Files:

- `docs/ops/pmo/workflow-automation.md`
- `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md`
- `docs/ops/pmo/program-registry.md`

Acceptance Criteria:

- Workflow Automation is represented as promoted from Program 5 idea/draft material into Program 1 GitHub authority.
- Drive/chat content is not sufficient implementation authority until captured in repo docs.
- Runtime implementation, workflow YAML, D1 migrations, and production configuration remain out of scope.
- The plan remains ready for aligned child issue creation after Atlas/Bill walkthrough.

Validation:

- `DOCS_HEADER_FILE_LIST=<task-allowed-files-list> ./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`

Rollback:

- Revert Workflow Automation planning docs only.

---

## Task 003 — Cursor Continuation and Queue Contract

Type: governance
Agent: cursor
Priority: 3
Depends On: Task 002
Allowed Files:

- `docs/reference/pmo/lgfc-cursor-execution-contract.md`
- `docs/ops/pmo/parallel-agent-rules.md`
- `docs/ops/pmo/critical-path.md`

Acceptance Criteria:

- Cursor continuation rules define when Cursor may continue, report, and stop.
- A PR ready for review causes Cursor to complete validation and PR body evidence, then stop for Atlas/Bill walkthrough.
- Cursor is prohibited from merge, close, relabel, issue-state mutation, queue advancement, and cross-program mutation unless explicitly authorized.
- Queue continuation preserves one active source issue and one implementation PR per task unless a later approved wave model says otherwise.

Validation:

- `DOCS_HEADER_FILE_LIST=<task-allowed-files-list> ./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`

Rollback:

- Revert Cursor contract and PMO queue documentation updates.

---

## Task 004 — PR Readiness and Batch Review Control

Type: governance
Agent: cursor
Priority: 4
Depends On: Task 003
Allowed Files:

- `docs/ops/pmo/parallel-agent-rules.md`
- `docs/reference/pmo/lgfc-cursor-execution-contract.md`

Acceptance Criteria:

- PR readiness is defined as a handoff state, not merge authority.
- Batch review preserves Bill merge authority and Atlas governance review.
- The expected PR body evidence includes source issue, allowlist, validation, reviewer/bot disposition, and gate status.
- Cursor stop conditions are explicit when reviewer or gate action remains.

Validation:

- `DOCS_HEADER_FILE_LIST=<task-allowed-files-list> ./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`

Rollback:

- Revert PR readiness and batch-review documentation updates only.

---

## Task 005 — Merge and Issue Mutation Policy

Type: governance
Agent: cursor
Priority: 5
Depends On: Task 004
Allowed Files:

- `docs/reference/pmo/lgfc-cursor-execution-contract.md`
- `docs/ops/pmo/github-issue-closeout-protocol.md`
- `docs/ops/pmo/parallel-agent-rules.md`

Acceptance Criteria:

- Cursor merge, close, relabel, issue-state mutation, queue mutation, and child issue creation prohibitions are explicit.
- Docs may recommend future issue structures but do not authorize mutation.
- Issue closure, relabeling, and queue changes are out of scope unless separately authorized by an active source issue.
- Human authority for protected merges and destructive actions is preserved.

Validation:

- `DOCS_HEADER_FILE_LIST=<task-allowed-files-list> ./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`

Rollback:

- Revert mutation-policy documentation updates only.

---

## Task 006 — Queue/Wave Model and Label Planning

Type: governance
Agent: cursor
Priority: 6
Depends On: Task 005
Allowed Files:

- `docs/ops/pmo/workflow-automation.md`
- `docs/ops/pmo/critical-path.md`
- `docs/reference/pmo/lgfc-cursor-execution-contract.md`

Acceptance Criteria:

- Wave labels and run identifiers are defined as planning/control concepts before workflow code changes.
- A future implementation issue must define wave/run purpose, batch scope, stop/continue owner, evidence requirements, and rollback before label changes.
- No labels are created, removed, or applied by this task.

Validation:

- `DOCS_HEADER_FILE_LIST=<task-allowed-files-list> ./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`

Rollback:

- Revert queue/wave planning documentation updates only.

---

## Task 007 — Post-Merge Closeout Evidence Stabilization

Type: governance
Agent: cursor
Priority: 7
Depends On: Task 006
Allowed Files:

- `docs/ops/pmo/github-issue-closeout-protocol.md`
- `docs/reference/pmo/lgfc-cursor-execution-contract.md`
- `docs/ops/pmo/workflow-automation.md`

Acceptance Criteria:

- Closeout evidence requires merged PR, merge commit, source issue, validation, reviewer disposition, issue-state action, queue decision, and label reconciliation.
- Closeout evidence and closeout mutation are separated.
- Queue advancement stops if terminal-state reconciliation fails.
- Remediation issue handling is explicit.

Validation:

- `DOCS_HEADER_FILE_LIST=<task-allowed-files-list> ./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`

Rollback:

- Revert closeout evidence documentation updates only.

---

## Task 008 — Program 5 Promotion and Program 1 Launch Gate

Type: governance
Agent: atlas
Priority: 8
Depends On: Task 007
Allowed Files:

- `docs/ops/pmo/PMO-V2-OPERATING-MODEL.md`
- `docs/reference/pmo/lgfc-program-portfolio-model.md`
- `docs/ops/pmo/program-registry.md`
- `docs/ops/pmo/workflow-automation.md`
- `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md`
- `docs/ops/pmo/program-3-proposed-project-list.md`
- `docs/ops/pmo/program-5-ideas-and-project-drafts.md`

Acceptance Criteria:

- Program 5 promotion criteria are auditable.
- Program 3 is treated as an available Program 1-4 portfolio lane, not intake.
- Program 1 launch gate is explicit.
- Child issue creation remains blocked until Atlas/Bill walkthrough approval.
- Program 3 proposed project list and Program 5 discussion list are available for Bill review.

Validation:

- `DOCS_HEADER_FILE_LIST=<task-allowed-files-list> ./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`

Rollback:

- Revert promotion/launch-gate documentation updates only.

## Program 1 launch readiness conclusion

Program 1 is not yet formally launch-ready under PMO v2 until the already-created task issues `#1417`-`#1424` are either updated or superseded to match this plan.

No new design gap is known. The remaining readiness work is alignment of issue/task language and explicit Atlas/Bill launch authorization.
