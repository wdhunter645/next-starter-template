---
Doc Type: Implementation Plan
Audience: Human + AI
Authority Level: Operational Authority
Owns: Program #1411 PMO Automation and Agent Workflow Control orchestration plan, task boundaries, child issue readiness, validation, and Atlas/Bill walkthrough gate
Does Not Own: Program #1255 website implementation, workflow YAML changes, runtime application behavior, D1 migrations, production configuration, GitHub issue mutation, or merge authority
Status: staged-blocked-pending-v3-alignment
Project: program-1-pmo-automation-agent-workflow-control
Owner: Atlas
Execution Mode: orchestrated
Source Issue: 1411
Related Program Issue: 1411
Canonical Reference: /docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
Related Issues: #1411, #1417, #1418, #1419, #1420, #1421, #1422, #1423, #1424, #1379, #1255, #1335, #1501
Last Reviewed: 2026-06-10
---

# Program #1411 — PMO Automation and Agent Workflow Control

| Field | Value |
| --- | --- |
| Historical label | Program 1 |
| Status | Completed planning/control artifact (issue `#1411` closed, `status:complete`) |
| Launch rule | issue #1411 is not an open blocked program. New execution requires a current open source issue. PMO automation execution remains blocked until Program #1255 is completed and signed off and Atlas/Bill explicitly launch the next cycle. |

## Launch-state control statement

This program is BLOCKED from execution until Program #1255 is completed and signed off, and until Atlas/Bill explicitly launch it. Planning, review, and documentation discussion may continue, but Cursor may not execute implementation work from this program until those gates are satisfied and Bill/Atlas explicitly launch it.

This is not an active executable Program 1 plan. It is staged/blocked PMO Automation and Agent Workflow Control planning evidence, superseded in part by PMO v3 authority.

## Purpose

Define the Program #1411 body of work under the PMO v3 model.

This Program #1411 cycle converts promoted PMO Automation and Agent Workflow Control work into repository-owned documentation, governance, task boundaries, and launch readiness. It is primarily documentation/governance work, with validation and limited testing where existing scripts or policy checks are touched.

## PMO v3 alignment

PMO v3 changes the governing model:

- A program is a GitHub program issue identified by issue number.
- Program issue numbers are durable identifiers; there is no fixed Program 1–5 cap.
- PMO Backlog = ideas, project drafts, and implementation-ready projects (documentation-owned).
- PMO Backlog items require documentation, readiness review, prioritization, and promotion before becoming executable program or task issues.
- Former Program 5 is now PMO Backlog (`/docs/ops/pmo/pmo-backlog.md`).

Legacy references that treated Program 3 as intake, Program 5 as a program lane, or Programs 1–4 as a fixed five-lane cap are superseded by `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`.

## Scope

This plan owns:

- PMO v3 authority alignment;
- Workflow Automation design migration from PMO Backlog material into GitHub documentation authority;
- Cursor continuation and queue contract;
- PR readiness and batch-review control;
- merge and issue mutation policy;
- queue/wave model and label planning;
- post-merge closeout evidence stabilization;
- PMO Backlog promotion process;
- Program #1411 launch gate readiness.

This plan does not own:

- Program #1255 website/content implementation;
- workflow YAML changes;
- orchestrator script changes;
- application/runtime changes;
- D1 migrations;
- production configuration or secrets;
- issue closure, relabeling, queue mutation, or child issue creation unless separately authorized;
- merge authority or PR readiness mutation by Cursor.

## Current Known Truth

- issue `#1411` is the Program #1411 source issue for this cycle and is already closed complete from the first planning pass.
- task issues `#1417` through `#1424` exist but contain stale PMO v2 terminology and must be reviewed/aligned before Program #1411 launch.
- issue `#1379` is historical ideas/future-projects source evidence, superseded by PMO Backlog documentation.
- issue `#1255` is the active Program #1255 Website Implementation and Content Operations execution program (historical label: Program 2).
- issue `#1335` is the completed prior Program 1 Phase 1 Wrap-Up cycle and is historical evidence only.
- Program #1411 is not next automatically. It is blocked until Program #1255 completes and is signed off.

## Intended Final State

- Program #1411 conforms to PMO v3 when launched.
- Program issue numbers consistently identify programs.
- PMO Backlog is consistently treated as ideas, project drafts, and implementation-ready projects.
- Workflow Automation design authority lives in GitHub documentation before implementation.
- Cursor can safely continue through validation and PR body updates, then stop at `READY FOR REVIEW` for Atlas/Bill walkthrough.
- PR readiness, batch review, merge authority, and issue mutation remain under Atlas/Bill control.
- Closeout evidence requirements are stable enough to support later automation without premature issue mutation.

## Program #1411 staged status review

| Item | Status | Required action |
| --- | --- | --- |
| Source issue `#1411` | Closed complete from prior planning pass | Treat as historical planning source unless reopened or superseded by new PMO v3 source issue |
| Task issues `#1417`-`#1424` | Created, blocked, stale terminology present | Update or supersede issue bodies before launch |
| Implementation plan | This document | Aligned to PMO v3 by this revision |
| PMO top-level authority | `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md` | Controlling authority |
| Program #1411 launch status | Staged / blocked | Launch only after Program #1255 completion/signoff and Atlas/Bill confirm aligned task set |

## Program #1411 project areas under PMO v3

| Task | Project area | PMO v3 correction |
| --- | --- | --- |
| Task 001 | PMO v3 authority | Replace five-program lane model with program issue numbers and PMO Backlog |
| Task 002 | Workflow Automation Design Migration | Treat Workflow Automation as promoted from PMO Backlog material |
| Task 003 | Cursor Continuation and Queue Contract | Preserve source-issue and READY FOR REVIEW stop controls |
| Task 004 | PR Readiness and Batch Review Control | Preserve Bill/Atlas review and merge authority |
| Task 005 | Merge and Issue Mutation Policy | Separate evidence generation from mutation authority |
| Task 006 | Queue/Wave Model and Label Planning | Keep labels/run IDs as planning concepts until explicit implementation |
| Task 007 | Post-Merge Closeout Evidence Stabilization | Require stable evidence before source issue closeout or queue advancement |
| Task 008 | PMO Backlog Promotion and Program #1411 Launch Gate | Replace Program 5 promotion with PMO Backlog promotion and launch gate readiness |

## Updated task definitions

## Task 001 — PMO V3 Authority

Type: governance
Agent: atlas
Priority: 1
Depends On: none
Allowed Files:

- `docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`
- `docs/ops/pmo/program-registry.md`
- `docs/reference/pmo/lgfc-program-portfolio-model.md`
- `docs/ops/pmo/critical-path.md`

Acceptance Criteria:

- Program issue numbers identify programs.
- PMO Backlog is defined as ideas, project drafts, and implementation-ready projects.
- Fixed Program 1–5 nomenclature is retired for future PMO operation.
- Completed program cycles are historical evidence only.
- Existing stale five-program lane references are removed or explicitly superseded.

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

- Workflow Automation is represented as promoted from PMO Backlog material into Program #1411 GitHub authority.
- Drive/chat content is not sufficient implementation authority until captured in repo docs.
- Runtime implementation, workflow YAML, D1 migrations, and production configuration remain out of scope.
- The plan remains ready for aligned child issue creation after Atlas/Bill walkthrough and launch authorization.

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

## Task 008 — PMO Backlog Promotion and Program #1411 Launch Gate

Type: governance
Agent: atlas
Priority: 8
Depends On: Task 007
Allowed Files:

- `docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`
- `docs/reference/pmo/lgfc-program-portfolio-model.md`
- `docs/ops/pmo/program-registry.md`
- `docs/ops/pmo/workflow-automation.md`
- `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md`
- `docs/ops/pmo/pmo-backlog.md`

Acceptance Criteria:

- PMO Backlog promotion criteria are auditable.
- Program #1411 launch gate is explicit and blocked until Program #1255 completion/signoff.
- Child issue creation remains blocked until Atlas/Bill walkthrough approval and launch authorization.
- PMO Backlog inventory is available for Bill review.

Validation:

- `DOCS_HEADER_FILE_LIST=<task-allowed-files-list> ./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`

Rollback:

- Revert promotion/launch-gate documentation updates only.

## Program #1411 launch readiness conclusion

Program #1411 is not yet formally launch-ready under PMO v3. It is staged / blocked until:

1. Program #1255 is completed and signed off.
2. Task issues `#1417`-`#1424` are either updated or superseded to match this plan.
3. Atlas/Bill explicitly authorize launch.

No new design gap is known. The remaining readiness work is Program #1255 completion, alignment of issue/task language, and explicit Atlas/Bill launch authorization.
