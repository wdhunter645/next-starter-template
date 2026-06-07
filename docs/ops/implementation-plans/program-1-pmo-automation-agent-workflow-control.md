---
Doc Type: Implementation Plan
Audience: Human + AI
Authority Level: Operational Authority
Owns: Program 1 PMO Automation and Agent Workflow Control orchestration plan, task boundaries, child issue readiness, validation, and Atlas/Bill walkthrough gate
Does Not Own: Program 2 website implementation, workflow YAML changes, runtime application behavior, D1 migrations, production configuration, GitHub issue mutation, or merge authority
Status: production-ready
Project: program-1-pmo-automation-agent-workflow-control
Owner: Atlas
Execution Mode: orchestrated
Source Issue: 1411
Related Program Issue: 1411
Canonical Reference: /docs/ops/implementation-plans/README.md
Related Issues: #1411, #1409, #1379, #1255, #1335
Last Reviewed: 2026-06-07
---

# Program 1 — PMO Automation and Agent Workflow Control

## Purpose

Define the next Program 1 body of work in the perpetual LGFC PMO cycle.

This plan converts the promoted Workflow Automation concept and PMO
perpetual-cycle correction into orchestrator-ready documentation and governance
tasks. It prepares the repository for later child issue creation after
Atlas/Bill walkthrough without changing runtime code, workflow YAML, D1 state,
production configuration, or GitHub issue state in this PR.

## Scope

This plan owns:

- PMO perpetual cycle authority;
- Workflow Automation design migration from Program 3 / Drive context into
  GitHub documentation authority;
- Cursor continuation and queue contract;
- PR readiness and batch-review control;
- merge and issue mutation policy;
- queue/wave model and label planning;
- post-merge closeout evidence stabilization;
- Program 3 promotion process.

This plan does not own:

- Program 2 website/content implementation under `#1255`;
- workflow YAML changes;
- orchestrator script changes;
- application/runtime changes;
- D1 migrations;
- production configuration or secrets;
- issue closure, relabeling, queue mutation, or child issue creation from this
  PR;
- merge authority or PR readiness mutation by Cursor.

## Current Known Truth

- Issue `#1411` is the active Program 1 source issue for this cycle.
- Issue `#1409` corrected the PMO model: Program 1 and Program 2 are
  alternating execution lanes, not permanent subject domains.
- Issue `#1379` is the Program 3 Ideas & Future Projects Portfolio and captured
  Workflow Automation as a promoted candidate.
- Issue `#1255` is the active Program 2 Website Implementation and Content
  Operations execution lane and must not be blocked or modified by this planning
  PR.
- Issue `#1335` is the completed prior Program 1 Phase 1 Wrap-Up cycle. It is
  historical evidence only and is not the parent of this Program 1 cycle.
- The Google Drive draft for LGFC Workflow Automation is represented here only
  through the accessible design summary preserved in `#1379` and `#1411`.

## Intended Final State

- Program 1 and Program 2 lane alternation is durable across PMO docs.
- Program 3 promotion into Program 1/2 work is explicit and auditable.
- Workflow Automation design authority lives in GitHub documentation before
  implementation.
- Cursor can safely continue through validation and PR body updates, then stop at
  `READY FOR REVIEW` for Atlas/Bill walkthrough.
- PR readiness, batch review, merge authority, and issue mutation remain under
  Atlas/Bill control.
- Wave labels and run identifiers are defined as planning/control concepts before
  workflow implementation.
- Closeout evidence requirements are stable enough to support later automation
  without premature issue mutation.

## Operating Rule

This plan is production-ready for later issue creation only after Atlas/Bill
walkthrough. The PR that introduces this plan must remain docs-only and must not
create implementation child issues, mutate Program 2 issues, or alter workflow
code.

When child issues are later created, each task must preserve one source issue,
one bounded allowlist, exact validation, and a stop point that protects human
review and merge authority.

---

## Task 001 — PMO Perpetual Cycle Authority

Type: governance
Agent: atlas
Priority: 1
Depends On: none
Allowed Files:
- `docs/ops/pmo/program-registry.md`
- `docs/reference/pmo/lgfc-program-portfolio-model.md`
- `docs/ops/pmo/critical-path.md`
Acceptance Criteria:
- Program 1 and Program 2 are defined as alternating execution lanes in a
  perpetual PMO cycle.
- Program 3 is defined as portfolio intake and prioritization, not
  implementation execution.
- Completed Program 1 cycles are historical evidence only and are not parent
  issues for later Program 1 cycles.
- Active Program 2 work under `#1255` is explicitly non-interference context.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
Rollback:
- Revert only the PMO cycle authority documentation updates.

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
- Workflow Automation is promoted from Program 3 / Drive context into GitHub
  documentation authority.
- The document states that Drive/chat content is not sufficient implementation
  authority until captured in repo docs.
- Runtime implementation, workflow YAML, D1 migrations, and production
  configuration remain out of scope.
- The plan remains ready for later child issue creation after Atlas/Bill
  walkthrough.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
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
- A PR ready for review causes Cursor to complete validation and PR body
  evidence, then stop for Atlas/Bill walkthrough.
- Cursor is prohibited from merge, close, relabel, issue-state mutation, queue
  advancement, and Program 2 issue mutation unless explicitly authorized.
- Queue continuation preserves one active source issue and one implementation PR
  per task.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
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
- The expected PR body evidence includes source issue, allowlist, validation,
  reviewer/bot disposition, and gate status.
- Cursor stop conditions are explicit when reviewer or gate action remains.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
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
- Cursor merge, close, relabel, issue-state mutation, queue mutation, and child
  issue creation prohibitions are explicit.
- Docs may recommend future issue structures but do not authorize mutation.
- Program 2 issue closure, relabeling, and queue changes are out of scope unless
  separately authorized by an active source issue.
- Human authority for protected merges and destructive actions is preserved.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
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
- Wave labels and run identifiers are defined as planning/control concepts before
  workflow code changes.
- A future implementation issue must define wave/run purpose, batch scope,
  stop/continue owner, evidence requirements, and rollback before label changes.
- No labels are created, removed, or applied by this task.
- Program 2 active work is not blocked by wave planning.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
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
- Closeout evidence requires merged PR, merge commit, source issue, validation
  results, authorized issue action, queue decision, and unresolved blocker state.
- Closeout protocol separates evidence preparation from issue mutation.
- Batch closeout authorization remains bounded by explicit Bill/Atlas approval.
- Post-merge closeout supports later automation without premature closure.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
Rollback:
- Revert closeout evidence documentation updates only.

---

## Task 008 — Program 3 Promotion and Program 1 Launch Gate

Type: governance
Agent: atlas
Priority: 8
Depends On: Task 007
Allowed Files:
- `docs/reference/pmo/lgfc-program-portfolio-model.md`
- `docs/ops/pmo/program-registry.md`
- `docs/ops/pmo/workflow-automation.md`
- `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md`
Acceptance Criteria:
- Program 3 promotion criteria are explicit: owner approval, repo authority,
  non-interference, task decomposition, authorized issue creation, and bounded
  Cursor handoff.
- Workflow Automation promotion from Program 3 into Program 1 is recorded.
- Future Program 1/2 transition gates are documented.
- The Program 1 plan can create child issues only after Atlas/Bill walkthrough
  and normal orchestration authority.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
Rollback:
- Revert Program 3 promotion and launch-gate documentation updates only.

---

## Orchestration Verification Expectations

When Atlas/Bill approve issue creation for this plan, the issue factory should:

1. Create issues only from this plan and only after normal Program 1 authority is
   confirmed.
2. Include stable task markers using the project slug
   `program-1-pmo-automation-agent-workflow-control`.
3. Preserve serial queue behavior unless a later owner-approved wave model
   explicitly authorizes a bounded exception.
4. Keep Program 2 `#1255` work independent and unmutated.
5. Stop Cursor-authored PRs at `READY FOR REVIEW` for Atlas/Bill walkthrough.

## Program 2 Non-Interference Map

| Active Program 2 surface | Program 1 rule |
| --- | --- |
| Website Implementation and Content Operations (`#1255`) | Context only; no closure, relabeling, queue mutation, or implementation changes |
| Content Strategy / Editorial Inventory | No Program 1 child task may edit website runtime or content implementation files unless separately authorized |
| Website Operations/Admin | No Program 1 automation planning may supersede child project authority |
| Website Final QA / Launch Validation | No Program 1 wave planning may block Program 2 validation work |

## Required PR Validation for This Planning PR

The PR introducing this plan must report:

```bash
./scripts/ci/docs_check_headers.sh .
./scripts/ci/docs_canonical_hashes_verify.sh .
git diff --name-only origin/main...HEAD
```

If repo-wide header validation fails because of a pre-existing out-of-scope
blocker, rerun scoped changed-file header validation and document both results.
