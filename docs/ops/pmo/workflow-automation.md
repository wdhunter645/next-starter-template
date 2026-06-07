---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: PMO workflow automation planning authority, Cursor queue-control boundaries, PR readiness rules, wave/run control concepts, and Program 3 promotion handoff for workflow automation
Does Not Own: Workflow YAML implementation, runtime application behavior, D1 migrations, production secrets, GitHub issue mutation, or merge authority
Canonical Reference: /docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md
Related Issues: #1411, #1409, #1379, #1255, #1335
Last Reviewed: 2026-06-07
---

# PMO Workflow Automation

## Purpose

Represent the LGFC Workflow Automation design in GitHub documentation authority
for the new Program 1 cycle: **PMO Automation and Agent Workflow Control**.

This document converts the Program 3 Workflow Automation candidate and the
Drive-draft summary preserved in GitHub issues into a bounded repository-owned
planning source. It defines what the automation program may design before any
workflow code, label mutation, issue mutation, or runtime implementation begins.

## Scope

This document owns:

- workflow automation planning boundaries for Program 1 issue `#1411`;
- Cursor continuation, stop, and queue-control rules;
- PR readiness and batch-review control requirements;
- merge, close, relabel, and issue-mutation prohibitions for Cursor;
- wave labels and run identifiers as planning/control concepts;
- post-merge closeout evidence stabilization requirements;
- Program 3 promotion requirements for workflow automation candidates.

This document does not own:

- workflow YAML changes;
- orchestrator script implementation;
- website/runtime feature work;
- D1 migrations;
- production configuration or secrets;
- GitHub issue closure, relabeling, or queue mutation;
- creation of implementation child issues before Atlas/Bill walkthrough.

## Current Known Truth

- issue `#1411` promotes Workflow Automation from Program 3 into a new Program 1
  planning cycle.
- issue `#1379` captured Workflow Automation as a Program 3 future candidate and
  listed the available Drive-draft concepts.
- The Google Drive draft is not directly readable from this environment without
  sign-in; the accessible authority for this PR is the text preserved in
  `#1379`, `#1409`, and `#1411`.
- Program 2 under `#1255` remains active and must not be blocked, relabeled,
  closed, or otherwise mutated by this Program 1 planning work.
- Completed Program 1 cycle `#1335` remains historical evidence only. It is not
  the parent issue for this new Program 1 cycle.
- Cursor may prepare docs-only PRs and run validation when authorized, but may
  not merge PRs, close issues, relabel issues, mutate queue state, or create
  implementation child issues unless the source issue explicitly authorizes that
  action.

## Intended Final State

- GitHub documentation, not Google Drive or chat, is the canonical design source
  for PMO Workflow Automation.
- Program 1 produces production-ready child task definitions for later issue
  creation after Atlas/Bill walkthrough.
- Wave labels, run identifiers, merge policy labels, and queue-control behavior
  are specified before workflow code changes begin.
- Cursor can continue safely when a PR is ready for review by stopping at the
  correct handoff point, reporting validation, and preserving Atlas/Bill review
  and merge authority.
- Program 3 remains the portfolio intake lane for ideas not yet promoted into a
  Program 1 or Program 2 execution lane.

## Program 1 Project Areas

| Area | Program 1 design output | Implementation boundary |
| --- | --- | --- |
| PMO perpetual cycle authority | Durable language that Program 1 and Program 2 are alternating execution lanes, while Program 3 is portfolio intake | No issue or label mutation |
| Workflow Automation design migration | This GitHub authority page replaces Drive-only planning for workflow automation | No workflow YAML edits |
| Cursor continuation and queue contract | Rules for when Cursor continues, stops, reports, and waits | No automated queue advancement in this PR |
| PR readiness and batch review control | Ready-for-review rules that preserve Atlas/Bill review | No PR merge or review-state mutation by Cursor |
| Merge and issue mutation policy | Explicit prohibition on Cursor merge, close, relabel, and issue-state changes without authorization | No destructive issue action |
| Queue/wave model and labels | Planning definitions for wave/run identifiers and stop/continue gates | No label creation or relabeling |
| Post-merge closeout evidence stabilization | Evidence requirements before issue closeout or queue advancement | No closeout automation change |
| Program 3 promotion process | Criteria for moving portfolio ideas into Program 1/2 work | No child implementation issues from this PR |

## Workflow Automation Design Decisions

### Program lanes

Program 1 and Program 2 are alternating execution lanes in the LGFC perpetual PMO
cycle. They are not permanent subject domains. A Program 1 cycle may define a
body of work while Program 2 executes a previously authorized body of work; when
the active execution cycle completes, the lanes can alternate again.

Program 3 is not an implementation lane. It is portfolio intake and
prioritization for ideas, deferred work, candidate projects, and future
opportunities. Program 3 items become executable only after owner promotion,
GitHub authority placement, decomposition into scoped issues, and bounded
Cursor/agent handoff.

### Cursor continuation contract

Cursor may continue forward only inside the active source issue and changed-file
allowlist. When a PR is ready for review, Cursor must:

1. finish the requested local validation;
2. update the PR body with exact validation results;
3. preserve exactly one source issue line;
4. stop at `READY FOR REVIEW` for Atlas/Bill walkthrough;
5. avoid merge, close, relabel, queue, or issue-mutation actions unless the
   active issue explicitly authorizes them.

Cursor continuation must support safe progress without converting readiness into
merge authority.

### PR readiness and batch review

PR readiness means the implementation or documentation PR is complete enough for
human review. It does not transfer merge authority to Cursor.

Batch review must preserve:

- Bill authority for merges, protected actions, launch gates, destructive
  actions, production-sensitive work, and strategy decisions;
- Atlas authority for governance review, source-issue accounting, queue
  conformance, and review disposition;
- Cursor responsibility for scoped implementation, validation, PR-body evidence,
  and stopping at the authorized handoff point.

### Merge and issue mutation policy

Cursor may not merge PRs, close issues, relabel issues, mark issue state,
advance queues, create child issues, or mutate Program 2 work unless the active
source issue explicitly authorizes that action.

Docs may recommend future issue structure or label concepts. Recommendations are
not permission to mutate GitHub state.

### Queue/wave model and labels

Wave labels and run identifiers are planning/control concepts until a later
implementation issue authorizes workflow or label changes.

Required design fields before implementation:

- wave/run identifier purpose;
- stop/continue decision owner;
- batch scope and allowed issue/PR set;
- PR readiness rule;
- issue mutation permission boundary;
- evidence required before queue advancement;
- rollback path for a bad wave decision.

### Post-merge closeout evidence

Closeout automation must not treat merge as sufficient evidence by itself.
Future implementation must require a stable closeout packet that identifies:

- merged PR and merge commit;
- source issue;
- validation results;
- exact issue-state action authorized;
- queue advancement decision;
- unresolved reviewer, gate, or post-merge blockers.

## Program 3 Promotion Process

A Program 3 item may feed a future Program 1 or Program 2 cycle only when:

1. Bill/owner approves promotion.
2. The idea is converted into a finalized design or implementation plan.
3. Repository documentation becomes the design source of truth.
4. Non-interference with active Program 1/2 work is documented.
5. Scope is decomposed into tasks with allowlisted files and validation.
6. Issue creation is authorized after Atlas/Bill walkthrough.
7. Cursor receives a bounded source issue and PR scope.

Workflow Automation satisfies steps 1-3 for planning through `#1411`; it does
not yet authorize workflow implementation, label mutation, or child issue
creation from this PR.

## Related References

- Program 1 PMO Automation plan:
  `/docs/ops/implementation-plans/program-1-pmo-automation-agent-workflow-control.md`
- PMO program registry: `/docs/ops/pmo/program-registry.md`
- Program portfolio model:
  `/docs/reference/pmo/lgfc-program-portfolio-model.md`
- Cursor execution contract:
  `/docs/reference/pmo/lgfc-cursor-execution-contract.md`
- PMO critical path: `/docs/ops/pmo/critical-path.md`
- GitHub issue closeout protocol:
  `/docs/ops/pmo/github-issue-closeout-protocol.md`
