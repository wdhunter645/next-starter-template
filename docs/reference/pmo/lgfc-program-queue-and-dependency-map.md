---
Doc Type: Reference
Audience: Human + AI
Authority Level: Operational Authority
Owns: Launched-program queue mode, dependency-map requirements, execution-mode selection, continue/halt decision rules, and dispatcher requirements for PMO-governed programs
Does Not Own: Workflow YAML implementation, GitHub merge authority, issue mutation authority, ChatGPT account-level scheduled automation, or uncontrolled orchestrator label automation
Canonical Reference: /docs/reference/pmo/lgfc-program-portfolio-model.md
Related Issues: #2391, #2386, #2360, #2361, #2363, #2364, #1449, #1448, #1411, #1255, #1256, #1258, #1259, #1501, #1500, #1719, #1720, #1721, #1725
Last Reviewed: 2026-07-16
---

# LGFC Program Queue and Dependency Map

## Purpose

Define how LGFC program issues advance through prepared task queues when an approved dependency map exists, and how that model differs from one-task handoff mode for one-off work or programs without approved dependency maps.

## Scope

This document owns:

- launched-program queue mode definition;
- one-task handoff mode definition;
- dependency-map structure and approval requirements;
- continue/halt decision rules Cursor may apply from documentation;
- dispatcher/watch requirements for keeping a launched queue moving;
- authority boundaries for Bill (merge) and Atlas/ChatGPT (batch verification/rebaseline).

This document does not own:

- workflow YAML or orchestrator script implementation;
- GitHub issue closure, relabeling, or queue mutation;
- ChatGPT product automation configuration;
- production configuration or secrets;
- merge, approval, closeout, or destructive-action authority.

## Current Known Truth

- Program #1411 and Program #1255 use the PMO execution chain:
  `program issue → child project → task issue → PR → verification → closeout`.
- Program #1255 is the active umbrella program issue.
- Child project `#1256` (Content Strategy / Editorial Inventory) is **closed
  complete** (Tasks 001–009 merged and verified).
- Child project `#1258` (Website Operations Admin) is **closed complete** (terminal
  PR `#1652`).
- Child project `#1259` (Website QA / Production Validation) is **open** — Phase 4 Tasks
  001–009 **complete on `main`** (Task 008 PR `#1753` / `678699e`; Task 009 PR `#1751` /
  `fd17af2`). Child project `#1259` must remain open pending Program `#1255` terminal
  closeout (operator-approved reopen 2026-06-17; umbrella closeout fix PR `#1699`).
  Implementation plan: `docs/ops/implementation-plans/website-qa-production-validation.md`.
- issue `#1500` (CI Post-Merge Closeout Reliability) is **closed complete** (Tasks
  001–005). Originally queued after Program #1255; executed in parallel when
  ChatGPT became capable of implementation. **Do not reopen #1500.** Reconciliation
  evidence for Priority #3 queue/wave and closeout planning is recorded in
  `docs/ops/reports/program-1500-queue-wave-reconciliation.md` (Task #1725).
- Priority #3 program #1719 (PMO Governance / Workflow Automation Completion) is
  **Implementation Active** under continuous reduced-gate serial authorization
  (2026-07-16). Project branch: `component/pmo-governance-workflow-automation`
  (Model B / `component-auto-integration`). Task #1720 complete (PR #2543). Task
  #1721 owns workflow-automation design migration / gap inventory. Task #1725 is
  closed complete and must not be rerun. Remaining work belongs to #1719 children,
  not to Program #1500.
- `#1448` rebaseline is **closed complete**.
- issue `#1411` is a **completed planning/control artifact** (completed,
  status:complete). It is not an open blocked program. Future execution work
  from that planning body requires a current open source issue and explicit
  launch authorization.
- Historical `#1411` planning does **not** block Program `#1719` execution after
  the 2026-07-16 continuous authorization.
- Queue markers such as labels, blocked-status text, dependency-map rows, and
  `CHATGPT HANDOFF` comments do not advance work by themselves. A launched queue
  requires a manual dispatcher, scheduled ChatGPT watch, or repo-native automation
  path defined in `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`.
- Bill owns merge authority to `main`, launch gates, and destructive issue actions.
- Atlas/ChatGPT owns governance review, queue conformance, batch verification,
  rebaseline authority, and Atlas-controlled component integration for Model B.
- Cursor may not merge to `main`, approve, close, relabel, advance queues, or mutate
  issue state unless the active source issue explicitly authorizes that action.
  Non-`main` component integration may proceed under source-issue
  `component-auto-integration` rules when technically necessary checks pass.

## Intended Final State

- Launched program issues with approved dependency maps follow a documented queue where
  Cursor can determine continue vs halt from the map and active issue fields.
- One-off tasks and programs without approved dependency maps remain on
  one-task handoff mode.
- No conflicting universal one-task-only rule blocks launched prepared program
  queues.
- Implementation plans require dependency maps before launch.
- Task issues and PR bodies report queue position and continue/halt decisions.
- Every launched queue has a documented dispatcher/watch path so a completed
  predecessor cannot leave eligible successor work silently blocked.

## Execution Modes

LGFC recognizes two execution modes. Select the mode from program issue state and dependency-map approval, not from agent preference.

### Mode A — One-Task Handoff

Use when any of the following is true:

- the work is a one-off task outside a launched program queue;
- the program issue has no approved dependency map;
- the program issue is in planning or review-ready state only;
- the active source issue does not reference an approved dependency map.

Rules:

```text
one source issue → one PR → READY FOR REVIEW → human review → closeout → next authorization
```

- Cursor executes exactly one source issue per PR.
- The next task requires a new explicit authorization (Atlas/Bill/controller
  `@cursor` comment or a new source issue assignment).
- Cursor must not infer the next task from queue order, labels, or merge state.
- The operator must still create an Ops remediation issue if a process failure
  leaves launch work halted without an active next task.

### Mode B — Launched-Program Queue

Use when all of the following are true:

- the program issue is launched and actively executing;
- an approved dependency map exists in repository documentation attached to or referenced by the program issue;
- the active source issue references the approved map and its queue position;
- no rebaseline pause or halt checkpoint blocks the active task.

Rules:

```text
approved dependency map → active task issue → one PR → READY FOR REVIEW → verify → closeout → next map item
```

- Cursor still executes exactly one source issue per PR. Queue mode governs
  **which task is authorized next**, not whether multiple tasks share one PR.
- Cursor may continue to the next queue item only when the dependency map,
  predecessor completion, halt/resume conditions, and explicit continuation
  authorization all permit it.
- Cursor must halt when a rebaseline pause, open halt checkpoint, or unresolved
  blocker is documented in the map or active issue.
- A launched-program queue must have a dispatcher/watch path under
  `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`. Without that path, queue
  markers are manual-only metadata and must not be described as active watches.

Launched-program queue mode does not grant Cursor merge, close, relabel, queue mutation, or issue-state authority.

## Queue watch and dispatcher requirement

For launched or launch-control work, closeout is not complete until queue continuation has been checked.

The responsible Atlas/ChatGPT/operator path must verify:

1. the predecessor issue state and terminal labels;
2. the successor or dependent issues named by the issue body, parent issue, PR body, or dependency map;
3. whether each successor is unblocked, queued, still blocked, or explicitly halted;
4. whether Cursor has exactly one next active source issue unless parallel work is authorized;
5. whether an Ops remediation issue exists for any silent-stall or dispatcher failure.

If a predecessor closes and any successor still says blocked by that predecessor, the dispatcher must correct the successor state or create/update a remediation issue. Do not treat stale blocked text as harmless documentation drift.

Regression case for this requirement:

```text
#2360 closed completed.
#2361, #2363, and #2364 still said Blocked Pending #2360.
Cursor had no next active Phase 0 task.
Expected correction: #2361 active for Cursor; #2363/#2364 unblocked but queued; remediation issue opened for watch/dispatcher gap.
```

## Dependency Map Requirements

### Plan-Level Map (Required Before Launch)

Every implementation plan for a launched program issue must include a **Dependency Map** section before the plan may move to `production-ready` or authorize issue creation.

Required map fields per task or checkpoint:

| Field | Requirement |
| --- | --- |
| Task ID | Stable identifier (`Task 001`, checkpoint slug, or issue number) |
| Predecessor | Prior task, checkpoint, or `none` |
| Successor | Next task, checkpoint, or `terminal` |
| Stage-before-merge | `yes` or `no` — whether upstream stage gate must pass before this task's PR may merge |
| Halt condition | What blocks execution or continuation |
| Resume condition | What must be true before the next item may start |

Approval:

- Atlas prepares the map in the implementation plan.
- Bill approves the map before launch or issue creation.
- Until approved, the program issue remains in one-task handoff mode.

### Project-Level Maps (Program #1255)

| Child project | Plan path | Status |
| --- | --- | --- |
| `#1256` Content Strategy / Editorial Inventory | `docs/ops/implementation-plans/website-content-strategy-editorial-inventory.md` | Closed complete |
| `#1258` Website Operations Admin | `docs/ops/implementation-plans/website-operations-admin.md` | Closed complete |
| `#1259` Website QA / Production Validation | `docs/ops/implementation-plans/website-qa-production-validation.md` | Phase 4 complete — Tasks 001–009 merged; `#1259` open |

### Project-Level Maps (Priority #3 — Program #1719)

| Child task | Plan path | Status |
| --- | --- | --- |
| Task 001 `#1720` | `docs/ops/implementation-plans/pmo-governance-workflow-automation-completion.md`; report `docs/ops/reports/pmo-july-2026-authority-reconciliation-1720.md` | Complete — merged to `main` via PR #2543 |
| Task 002 `#1721` | Same plan; report `docs/ops/reports/workflow-automation-design-gap-inventory-1721.md` | Complete — PR #2545 on component branch |
| Task 003 `#1722` | Same plan; report `docs/ops/reports/cursor-continuation-contract-matrix-1722.md` | Active — contract matrix hardening |
| Tasks 004–005 `#1723`–`#1724` | Same plan | Authorized after predecessors; protected governance review on promotion path |
| Task 006 `#1725` | Same plan; reconciliation report `docs/ops/reports/program-1500-queue-wave-reconciliation.md` | Complete — do not rerun |
| Tasks 007–008 `#1726`–`#1727` | Same plan | Authorized after #1724; #1725 remains complete evidence; #1727 terminal |

Program #1500 closeout is **not** an active queue lane. It is closed complete historical evidence consumed by Task #1725. Cursor must not rebuild #1500 workflow or closeout work without a new CI source issue.

### Issue-Level Fields (Required for Queue Tasks)

Every executable task issue in launched-program queue mode must state:

| Field | Example |
| --- | --- |
| Predecessor | `#1401` or `Task 003` |
| Successor | `#1403` or `Task 005` |
| Stage-before-merge | `yes` / `no` |
| Halt/resume condition | Rebaseline complete; `#1448` closed; predecessor PR merged |
| Dispatcher path | manual / scheduled ChatGPT watch / repo-native automation / not configured |

Partial overlap with dependency/blocking criteria is not sufficient. Use the field names above in the issue body.

### PR-Level Reporting (Required for Queue Tasks)

Every PR for a launched-program queue task must report:

| Field | Values |
| --- | --- |
| Dependency-map result | `pass` / `fail` / `not-applicable` |
| Next queue item | issue number and title, `halt — <reason>`, or `not-applicable` |
| Continue/halt decision | `continue` / `halt` / `not-applicable` with one-sentence rationale |
| Dispatcher/remediation result | active dispatcher checked / remediation issue created / not-applicable |

See `/.github/pull_request_template.md` and `/docs/how-to/cursor/open-task-pr.md`.

## Continue vs Halt Decision Rules

Cursor may **continue** (prepare or update the current task PR) when:

1. the active source issue is the authorized queue item;
2. predecessor and stage-before-merge requirements in the map are satisfied and
   verifiable from available evidence;
3. changed files match the allowlist;
4. no documented halt checkpoint applies;
5. validation can run or a concrete blocker can be reported;
6. explicit continuation authorization permits the next child task when required.

Cursor must **halt** (stop at `READY FOR REVIEW` or report without implementing) when:

1. a rebaseline pause is active (for example `#1448` while open);
2. the dependency map marks the next item blocked;
3. predecessor, stage-before-merge, or halt/resume conditions are unmet or unclear;
4. the task would require merge, close, relabel, queue advancement, or child
   issue creation without explicit authorization;
5. more than one source issue would be needed for the PR body.

When halted, Cursor reports the blocking checkpoint, the next queue item if known, and the continue/halt decision. Cursor does not infer authorization from labels, merge state, or queue order alone.

If the halt is caused by missing dispatcher/watch behavior, stale blocked successor state, or launch-halting process failure, Atlas/ChatGPT must create or update an Ops remediation issue under `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`.

## Authority Model

| Role | Authority |
| --- | --- |
| Bill | Merge, launch gates, destructive issue actions, strategy exceptions |
| Atlas/ChatGPT | Governance review, queue conformance, batch verification, rebaseline, dispatcher/remediation routing when authorized |
| Cursor | Bounded implementation, validation, PR-body evidence, `READY FOR REVIEW` handoff |

Cursor does not own merge, approval, closeout, relabel, production, or secret authority in either execution mode.

## Related References

- Queue watch / dispatcher protocol: `/docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
- Cursor execution contract: `/docs/reference/pmo/lgfc-cursor-execution-contract.md`
- PMO critical path: `/docs/ops/pmo/critical-path.md`
- Implementation plan format: `/docs/ops/implementation-plans/README.md`
- Program #1255 `#1256` plan and map: `/docs/ops/implementation-plans/website-content-strategy-editorial-inventory.md`
- CI dependency matrix pattern: `/docs/reference/ci/lgfc-ci-implementation-dependency-matrix.md`
