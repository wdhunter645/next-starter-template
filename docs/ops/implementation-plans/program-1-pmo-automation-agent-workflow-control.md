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

- issue `#1411` is the active Program 1 source issue for this cycle.
- issue `#1409` corrected the PMO model: Program 1 and Program 2 are
  alternating execution lanes, not permanent subject domains.
- issue `#1379` is the Program 3 Ideas & Future Projects Portfolio and captured
  Workflow Automation as a promoted candidate.
- issue `#1255` is the active Program 2 Website Implementation and Content
  Operations execution lane and must not be blocked or modified by this planning
  PR.
- issue `#1335` is the completed prior Program 1 Phase 1 Wrap-Up cycle. It is
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
  without premature issue mutation, including terminal completed-issue label
  reconciliation.

## Operating Rule

This plan is production-ready for later issue creation only after Atlas/Bill
walkthrough. The PR that introduces this plan must remain docs-only and must not
create implementation child issues, mutate Program 2 issues, or alter workflow
code.

When child issues are later created, each task must preserve one source issue,
one bounded allowlist, exact validation, and a stop point that protects human
review and merge authority.

## Atlas / Cursor Planning Boundary

Atlas owns the Program 1 planning documentation for:

- who owns each project area;
- what the project area covers;
- where the authoritative documentation must live;
- suggested sequencing and readiness gates.

Cursor owns later execution planning for:

- how the approved work is implemented;
- exact technical approach;
- implementation order within an authorized source issue;
- validation details beyond the documented minimum;
- safe stop/continue decisions inside the bounded task scope.

Atlas documentation may suggest sequence and timing, but Cursor must convert that
into implementation mechanics only after Bill/Atlas approves the relevant source
issue and allowlist.

---

## Program 1 Project Documentation Set

This section defines the production documentation target for each Program 1
project area. Each project area must be understandable before implementation
issue creation. The descriptions below are not implementation instructions;
they define ownership, scope, authority location, and suggested sequencing.

### Project 001 — PMO Perpetual Cycle Authority

Who:
- Owner: Atlas.
- Decision authority: Bill.
- Implementer after approval: Cursor only if a later docs issue authorizes edits.

What:
- Defines Program 1 and Program 2 as alternating execution lanes.
- Defines Program 3 as portfolio intake, prioritization, and promotion staging.
- Removes any implication that Program 1 or Program 2 are permanent subject
  domains.
- States that completed Program 1 cycles are historical evidence only, not parent
  issues for later Program 1 cycles.

Where:
- `docs/ops/pmo/program-registry.md`
- `docs/reference/pmo/lgfc-program-portfolio-model.md`
- `docs/ops/pmo/critical-path.md`

Suggested when:
- First Program 1 project area to finalize.
- Must be complete before any automation, queue, label, or promotion work is
  implemented.

Implementation-readiness criteria:
- PMO lane definitions are explicit.
- Historical vs active cycle linkage is unambiguous.
- Active Program 2 non-interference is documented.

### Project 002 — Workflow Automation Design Migration

Who:
- Owner: Atlas.
- Source authority approver: Bill.
- Implementer after approval: Cursor for docs migration only unless later code
  issues are created.

What:
- Converts the Google Drive Workflow Automation concept into GitHub authority.
- Preserves the purpose: controlled continuous implementation where Cursor can
  work a sequenced queue while GitHub CI, repo policy, Atlas, and Bill preserve
  readiness, merge, stop, and review control.
- Explicitly states Drive and chat are planning surfaces, not implementation
  authority until captured in repo docs.

Where:
- `docs/ops/pmo/workflow-automation.md`
- `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md`
- `docs/ops/pmo/program-registry.md`

Suggested when:
- Second Program 1 project area.
- Should follow PMO cycle authority so the migrated design lands in the correct
  Program 1/2/3 model.

Implementation-readiness criteria:
- GitHub authority exists for the design.
- Protected domains and non-interference rules are explicit.
- No runtime or workflow YAML work is implied by documentation migration.

### Project 003 — Cursor Continuation and Queue Contract

Who:
- Owner: Atlas.
- Operational reviewer: Bill.
- Implementer after approval: Cursor for PR/issue behavior inside authorized
  source issues; later controller automation only by separate issue.

What:
- Defines when Cursor may continue, when it must stop, and what evidence it must
  leave.
- Distinguishes PR implementation work from GitHub issue mutation.
- Prevents Cursor from stealing the active lane when another program is only in
  planning review.
- Requires one active source issue and one bounded PR per task unless a later
  wave model explicitly authorizes a bounded exception.

Where:
- `docs/reference/pmo/lgfc-cursor-execution-contract.md`
- `docs/ops/pmo/parallel-agent-rules.md`
- `docs/ops/pmo/critical-path.md`

Suggested when:
- Third Program 1 project area.
- Should be completed before batch review or wave planning is allowed.

Implementation-readiness criteria:
- Continue/stop conditions are testable.
- Cursor prohibitions are explicit.
- Atlas/Bill review handoff is preserved.

### Project 004 — PR Readiness and Batch Review Control

Who:
- Owner: Atlas.
- Merge authority: Bill.
- Reviewer/verification authority: Atlas and Bill.
- Implementer after approval: Cursor may prepare PRs but not merge or declare
  final closeout.

What:
- Defines `READY FOR REVIEW` as a handoff state, not merge authority.
- Defines how multiple PRs may queue for review without unsafe dependency stacks.
- Requires PR body evidence: source issue, allowlist, validation, bot/reviewer
  disposition, status checks, and unresolved blockers.
- Separates independent batch review from dependent stacked work.

Where:
- `docs/ops/pmo/parallel-agent-rules.md`
- `docs/reference/pmo/lgfc-cursor-execution-contract.md`

Suggested when:
- Fourth Program 1 project area.
- Should follow the Cursor continuation contract and precede any queue/wave label
  design.

Implementation-readiness criteria:
- Independent vs dependent PR handling is clear.
- Human merge authority is preserved.
- Review evidence requirements are explicit.

### Project 005 — Merge and Issue Mutation Policy

Who:
- Owner: Atlas.
- Final authority: Bill for protected merges and destructive operations.
- Implementation actor: Atlas or a later approved controller for issue-state
  mutation; Cursor only when explicitly authorized.

What:
- Defines who may merge, close issues, relabel, advance queues, create child
  issues, and mutate issue state.
- Establishes that Cursor may comment, implement, and prepare PRs, but may not
  mutate issue state unless a source issue explicitly authorizes it.
- Separates evidence generation from final repository-state mutation.

Where:
- `docs/reference/pmo/lgfc-cursor-execution-contract.md`
- `docs/ops/pmo/github-issue-closeout-protocol.md`
- `docs/ops/pmo/parallel-agent-rules.md`

Suggested when:
- Fifth Program 1 project area.
- Must precede terminal label automation or any controller issue-state changes.

Implementation-readiness criteria:
- Authority matrix is explicit.
- Issue mutation is separately authorized from PR implementation.
- Program 2 issue-state control remains protected.

### Project 006 — Queue / Wave Model and Label Planning

Who:
- Owner: Atlas.
- Approval authority: Bill.
- Implementer after approval: Cursor or controller only through a later issue that
  authorizes label taxonomy and workflow/controller changes.

What:
- Defines queue states, wave/run identifiers, active-task selection, and
  stop/continue ownership as planning concepts.
- Prevents premature label creation or application.
- Requires future implementation issues to define label purpose, allowed values,
  state transitions, rollback, and non-interference before any label mutation.

Where:
- `docs/ops/pmo/workflow-automation.md`
- `docs/ops/pmo/critical-path.md`
- `docs/reference/pmo/lgfc-cursor-execution-contract.md`

Suggested when:
- Sixth Program 1 project area.
- Should only proceed after merge/issue mutation policy is accepted.

Implementation-readiness criteria:
- Label taxonomy is proposed but not applied.
- State transitions are documented.
- Future controller/workflow implementation boundaries are explicit.

### Project 007 — Post-Merge Closeout Evidence Stabilization

Who:
- Owner: Atlas.
- Closeout authority: Atlas or a later approved controller.
- Human escalation authority: Bill.
- Cursor role: provide PR evidence and stop; do not assume issue-close authority.

What:
- Fixes the `#1399` / `#1410` class of failure.
- Defines required post-merge evidence: merged PR, merge commit, source issue,
  validation results, issue-state action, queue decision, label reconciliation,
  and unresolved blocker state.
- Requires terminal issue-state and label cleanup before queue advancement.
- Defines remediation issue handling when post-merge validation fails.

Where:
- `docs/ops/pmo/github-issue-closeout-protocol.md`
- `docs/reference/pmo/lgfc-cursor-execution-contract.md`
- `docs/ops/pmo/workflow-automation.md`

Suggested when:
- Seventh Program 1 project area.
- Should be completed before queue automation, wave automation, or any automatic
  next-task activation.

Implementation-readiness criteria:
- Terminal label policy is explicit.
- Closeout evidence and closeout mutation are separated.
- Queue advancement stops if terminal-state reconciliation fails.

### Project 008 — Program 3 Promotion and Program 1 Launch Gate

Who:
- Owner: Atlas.
- Promotion authority: Bill.
- Implementer after approval: Cursor only for bounded docs/issue work created
  after promotion is approved.

What:
- Defines how ideas move from Program 3 into future Program 1 or Program 2 cycles.
- Requires owner approval, repo authority, scope definition, non-interference
  review, implementation-plan readiness, and bounded issue creation before Cursor
  work starts.
- Defines when Program 1 is launch-ready and when child issues may be created.

Where:
- `docs/reference/pmo/lgfc-program-portfolio-model.md`
- `docs/ops/pmo/program-registry.md`
- `docs/ops/pmo/workflow-automation.md`
- `docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md`

Suggested when:
- Final Program 1 project area before launch decision.
- Should be reviewed after the other seven areas so promotion and launch gates
  reflect the finalized authority model.

Implementation-readiness criteria:
- Promotion criteria are auditable.
- Launch gate is explicit.
- Child issue creation remains blocked until Atlas/Bill walkthrough approval.

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
- `DOCS_HEADER_FILE_LIST=<task-allowed-files-list> ./scripts/ci/docs_check_headers.sh .`
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
- A PR ready for review causes Cursor to complete validation and PR body
  evidence, then stop for Atlas/Bill walkthrough.
- Cursor is prohibited from merge, close, relabel, issue-state mutation, queue
  advancement, and Program 2 issue mutation unless explicitly authorized.
- Queue continuation preserves one active source issue and one implementation PR
  per task.
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
- The expected PR body evidence includes source issue, allowlist, validation,
  reviewer/bot disposition, and gate status.
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
- Cursor merge, close, relabel, issue-state mutation, queue mutation, and child
  issue creation prohibitions are explicit.
- Docs may recommend future issue structures but do not authorize mutation.
- Program 2 issue closure, relabeling, and queue changes are out of scope unless
  separately authorized by an active source issue.
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
- Wave labels and run identifiers are defined as planning/control concepts before
  workflow code changes.
- A future implementation issue must define wave/run purpose, batch scope,
  stop/continue owner, evidence requirements, and rollback before label changes.
- No labels are created, removed, or applied by this task.
- Program 2 active work is not blocked by wave planning.
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
- Closeout evidence requires merged PR, merge commit, source issue, validation
  results, authorized issue action, queue decision, and unresolved blocker state.
- Closeout protocol separates evidence preparation from issue mutation.
- Closed completed source issues retain only stable non-status labels plus
  `status:complete`; active or failure-state workflow labels are removed during
  the same authorized closeout step that closes the issue.
- The controller or Atlas closeout step verifies final source-issue labels after
  merge verification and stops instead of advancing the queue if terminal label
  reconciliation fails.
- Batch closeout authorization remains bounded by explicit Bill/Atlas approval.
- Post-merge closeout supports later automation without premature closure.
Validation:
- `DOCS_HEADER_FILE_LIST=<task-allowed-files-list> ./scripts/ci/docs_check_headers.sh .`
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
- `DOCS_HEADER_FILE_LIST=<task-allowed-files-list> ./scripts/ci/docs_check_headers.sh .`
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
