---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO workflow automation planning authority, Cursor queue-control boundaries, PR readiness rules, wave/run control concepts, and PMO Backlog promotion handoff for workflow automation
Does Not Own: Workflow YAML implementation, runtime application behavior, D1 migrations, production secrets, GitHub issue mutation, or merge authority
Canonical Reference: /docs/ops/pmo/PMO-V3-OPERATING-MODEL.md
Related Issues: #1411, #1417, #1418, #1419, #1420, #1421, #1422, #1423, #1424, #1379, #1255, #1501
Last Reviewed: 2026-06-09
---

# PMO Workflow Automation

## Purpose

Represent the LGFC Workflow Automation design in GitHub documentation authority for Program #1411 — PMO Automation and Agent Workflow Control.

This document converts Workflow Automation from PMO Backlog material into bounded repository-owned planning authority. It defines what the automation program may design before any workflow code, label mutation, issue mutation, or runtime implementation begins.

This document is subordinate to `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`.

## Scope

This document owns:

- workflow automation planning boundaries for Program #1411;
- Cursor continuation, stop, and queue-control rules;
- PR readiness and batch-review control requirements;
- merge, close, relabel, and issue-mutation prohibitions for Cursor;
- wave labels and run identifiers as planning/control concepts;
- post-merge closeout evidence stabilization requirements;
- terminal completed-issue label reconciliation requirements;
- PMO Backlog promotion requirements for workflow automation candidates.

This document does not own:

- workflow YAML changes;
- orchestrator script implementation;
- website/runtime feature work;
- D1 migrations;
- production configuration or secrets;
- GitHub issue closure, relabeling, or queue mutation;
- creation of implementation child issues before Atlas/Bill launch approval.

## Current Known Truth

- issue `#1411` promotes Workflow Automation from PMO Backlog material into Program #1411 planning.
- Program #1411 is staged / blocked and may not launch until Program #1255 is completed and signed off.
- legacy issue `#1379` captured Workflow Automation as future candidate material and listed available draft concepts.
- Program #1255 remains active and must not be blocked, relabeled, closed, or otherwise mutated by Program #1411 planning work.
- Completed Program 1 cycle `#1335` remains historical evidence only. It is not the parent issue for Program #1411.
- Cursor may prepare docs-only PRs and run validation when authorized, but may not merge PRs, close issues, relabel issues, mutate queue state, or create implementation child issues unless the source issue explicitly authorizes that action.

## Intended Final State

- GitHub documentation, not Google Drive or chat, is the canonical design source for PMO Workflow Automation.
- Program #1411 produces production-ready task definitions for later issue alignment after Atlas/Bill walkthrough and launch authorization.
- Wave labels, run identifiers, merge policy labels, and queue-control behavior are specified before workflow code changes begin.
- Cursor can continue safely when a PR is ready for review by stopping at the correct handoff point, reporting validation, and preserving Atlas/Bill review and merge authority.
- Completed source issues have reconciled terminal labels: stable non-status labels plus `status:complete`, with stale active or failure status labels removed during closeout.
- PMO Backlog remains the documented inventory for work not yet promoted into program issues.

## Program #1411 Project Areas

| Area | Program #1411 design output | Implementation boundary |
| --- | --- | --- |
| PMO v3 authority | Durable language that program issue numbers identify programs and PMO Backlog holds ideas/project drafts | No issue or label mutation |
| Workflow Automation design migration | This GitHub authority page replaces Drive/chat-only planning for workflow automation | No workflow YAML edits |
| Cursor continuation and queue contract | Rules for when Cursor continues, stops, reports, and waits | No automated queue advancement in this PR |
| PR readiness and batch review control | Ready-for-review rules that preserve Atlas/Bill review | No PR merge or review-state mutation by Cursor |
| Merge and issue mutation policy | Explicit prohibition on Cursor merge, close, relabel, and issue-state changes without authorization | No destructive issue action |
| Queue/wave model and labels | Planning definitions for wave/run identifiers and stop/continue gates | No label creation or relabeling |
| Post-merge closeout evidence stabilization | Evidence and terminal-label reconciliation requirements before issue closeout or queue advancement | No closeout automation change |
| PMO Backlog promotion process | Criteria for moving backlog items into program issues | No child implementation issues from this PR |

## Workflow Automation Design Decisions

### Program issue model

Under PMO v3, programs are GitHub program issues identified by issue number. Program #1411 is the staged/blocked program for PMO Automation and Agent Workflow Control. PMO Backlog is not a program; it is a documentation-owned inventory for ideas, project drafts, and implementation-ready projects.

### Execution modes and queue control

LGFC program issues use one-task handoff mode or launched-program queue mode. See `/docs/reference/pmo/lgfc-program-queue-and-dependency-map.md`. Launched programs require an approved dependency map attached to or referenced by the program issue before issue creation. Queue mode governs which task is authorized next; it does not grant Cursor merge, close, relabel, or queue-mutation authority.

### Cursor continuation contract

Cursor may continue forward only inside the active source issue and changed-file allowlist. When a PR is ready for review, Cursor must:

1. finish the requested local validation;
2. update the PR body with exact validation results;
3. preserve exactly one source issue line;
4. stop at `READY FOR REVIEW` for Atlas/Bill walkthrough;
5. avoid merge, close, relabel, queue, or issue-mutation actions unless the active issue explicitly authorizes them.

Cursor continuation must support safe progress without converting readiness into merge authority.

### Reviewer disposition enforcement

Reviewer comments are not satisfied by PR-body claims alone. Every actionable trusted reviewer comment must be resolved, explicitly dispositioned in the PR body with `review-comment:<id>`, or linked to a bounded follow-up issue.

Outdated GitHub review threads still require explicit disposition evidence.

Post-merge closeout must verify reviewer disposition before closing the source issue. Undispositioned reviewer findings create or preserve post-merge exception issues and stop program queue advancement until disposition is complete.

### PR readiness and batch review

PR readiness means the implementation or documentation PR is complete enough for human review. It does not transfer merge authority to Cursor.

Batch review must preserve:

- Bill authority for merges, protected actions, launch gates, destructive actions, production-sensitive work, and strategy decisions;
- Atlas authority for governance review, source-issue accounting, queue conformance, and review disposition;
- Cursor responsibility for scoped implementation, validation, PR-body evidence, and stopping at the authorized handoff point.

### Merge and issue mutation policy

Cursor may not merge PRs, close issues, relabel issues, mark issue state, advance queues, create child issues, or mutate other program work unless the active source issue explicitly authorizes that action.

Docs may recommend future issue structure or label concepts. Recommendations are not permission to mutate GitHub state.

### Queue/wave model and labels

Wave labels and run identifiers are planning/control concepts until a later implementation issue authorizes workflow or label changes.

Required design fields before implementation:

- wave/run identifier purpose;
- stop/continue decision owner;
- batch scope and allowed issue/PR set;
- PR readiness rule;
- issue mutation permission boundary;
- evidence required before queue advancement;
- rollback path for a bad wave decision.

### Post-merge closeout evidence

Closeout automation must not treat merge as sufficient evidence by itself. Future implementation must require a stable closeout packet that identifies:

- merged PR and merge commit;
- source issue;
- validation results;
- exact issue-state action authorized;
- terminal label reconciliation result;
- queue advancement decision;
- unresolved reviewer, gate, or post-merge blockers.

The selected terminal behavior is: a closed completed source issue retains only stable non-status labels plus `status:complete`. The controller or authorized Atlas closeout step must remove active or failure-state labels such as `status:queued`, `status:assigned`, `status:pr-draft`, `status:implementation`, `status:review`, `status:post-merge-verify`, and `status:failed` as part of the same authorized closeout action that closes the issue with `state_reason: completed`. If that reconciliation cannot be verified, queue advancement stops and the blocker is reported.

## PMO Backlog Promotion Process

Backlog item promotion starts during PMO meeting review or explicit Bill/Atlas review.

Promotion creates or updates:

- project design documentation;
- a program issue if the work becomes a program;
- project/task issues if executable;
- PR(s) for documentation updates.

PMO Backlog does not launch work. PMO meeting issues may record promotion decisions and resulting issue/PR creation.

A PMO Backlog item may feed a future program issue only when:

1. Bill/owner approves promotion review.
2. The idea is converted into a finalized design or implementation plan.
3. Repository documentation becomes the design source of truth.
4. Non-interference with active program work is documented.
5. Scope is decomposed into tasks with allowlisted files and validation.
6. Authorized issue creation after Atlas/Bill walkthrough.
7. Cursor receives a bounded source issue and PR scope.

Workflow Automation satisfies early promotion requirements for planning through `#1411`; it does not yet authorize workflow implementation, label mutation, or child issue creation from this document.

## Related References

- PMO v3 operating model: `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`
- PMO Backlog: `/docs/ops/pmo/pmo-backlog.md`
- Program registry: `/docs/ops/pmo/program-registry.md`
- Program portfolio model: `/docs/reference/pmo/lgfc-program-portfolio-model.md`
- Cursor execution contract: `/docs/reference/pmo/lgfc-cursor-execution-contract.md`
