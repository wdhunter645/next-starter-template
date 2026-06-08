---
Doc Type: Reference
Audience: Human + AI
Authority Level: Operational Authority
Owns: Launched-program queue mode, dependency-map requirements, execution-mode selection, and continue/halt decision rules for PMO-governed programs
Does Not Own: Workflow YAML implementation, GitHub merge authority, issue mutation authority, or orchestrator label automation
Canonical Reference: /docs/reference/pmo/lgfc-program-portfolio-model.md
Related Issues: #1449, #1448, #1411, #1255, #1256
Last Reviewed: 2026-06-08
---

# LGFC Program Queue and Dependency Map

## Purpose

Define how LGFC programs advance through prepared task queues when an approved
dependency map exists, and how that model differs from one-task handoff mode for
one-off work or programs without approved dependency maps.

## Scope

This document owns:

- launched-program queue mode definition;
- one-task handoff mode definition;
- dependency-map structure and approval requirements;
- continue/halt decision rules Cursor may apply from documentation;
- authority boundaries for Bill (merge) and Atlas (batch verification/rebaseline).

This document does not own:

- workflow YAML or orchestrator script implementation;
- GitHub issue closure, relabeling, or queue mutation;
- production configuration or secrets;
- merge, approval, closeout, or destructive-action authority.

## Current Known Truth

- Program 1 `#1411` and Program 2 `#1255` use the PMO execution chain:
  `Program → Child Project → Task → Issue → PR → Verification → Closeout`.
- Program 2 `#1255` is an active launched program with a prepared task queue under
  child project `#1256`.
- Program 2 continuation is paused for rebaseline while `#1448` remains open.
  No Program 2 task beyond `#1402` may launch until `#1448` rebaseline is
  complete. Queue documentation from `#1449` must be merged before the
  rebaseline gate may close.
- Bill owns merge authority, launch gates, and destructive issue actions.
- Atlas owns governance review, queue conformance, batch verification, and
  rebaseline authority.
- Cursor may not merge, approve, close, relabel, advance queues, or mutate issue
  state unless the active source issue explicitly authorizes that action.

## Intended Final State

- Launched programs with approved dependency maps follow a documented queue where
  Cursor can determine continue vs halt from the map and active issue fields.
- One-off tasks and programs without approved dependency maps remain on
  one-task handoff mode.
- No conflicting universal one-task-only rule blocks launched prepared program
  queues.
- Implementation plans require dependency maps before launch.
- Task issues and PR bodies report queue position and continue/halt decisions.

## Execution Modes

LGFC recognizes two execution modes. Select the mode from program state and
dependency-map approval, not from agent preference.

### Mode A — One-Task Handoff

Use when any of the following is true:

- the work is a one-off task outside a launched program queue;
- the program has no approved dependency map;
- the program is in planning or review-ready state only;
- the active source issue does not reference an approved dependency map.

Rules:

```text
one source issue → one PR → READY FOR REVIEW → human review → closeout → next authorization
```

- Cursor executes exactly one source issue per PR.
- The next task requires a new explicit authorization (Atlas/Bill/controller
  `@cursor` comment or a new source issue assignment).
- Cursor must not infer the next task from queue order, labels, or merge state.

### Mode B — Launched-Program Queue

Use when all of the following are true:

- the program is launched and actively executing;
- an approved dependency map exists in repository documentation;
- the active source issue references the approved map and its queue position;
- no rebaseline pause or halt checkpoint blocks the active task.

Rules:

```text
approved dependency map → active task issue → one PR → READY FOR REVIEW → verify → closeout → next map item
```

- Cursor still executes exactly one source issue per PR. Queue mode governs
  **which task is authorized next**, not whether multiple tasks share one PR.
- Cursor may continue to the next queue item only when the dependency map,
  predecessor completion, and halt/resume conditions all permit it.
- Cursor must halt when a rebaseline pause, open halt checkpoint, or unresolved
  blocker is documented in the map or active issue.

Launched-program queue mode does not grant Cursor merge, close, relabel, queue
mutation, or issue-state authority.

## Dependency Map Requirements

### Plan-Level Map (Required Before Launch)

Every implementation plan for a launched program must include a **Dependency Map**
section before the plan may move to `production-ready` or authorize issue
creation.

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
- Until approved, the program remains in one-task handoff mode.

### Project-Level Map (Program 2 / `#1256`)

Child project `#1256` must maintain a project-level dependency map that records
checkpoints before tasks beyond `#1402` may resume. See
`/docs/ops/implementation-plans/website-content-strategy-editorial-inventory.md`
for the active Program 2 map and rebaseline pause.

### Issue-Level Fields (Required for Queue Tasks)

Every executable task issue in launched-program queue mode must state:

| Field | Example |
| --- | --- |
| Predecessor | `#1401` or `Task 003` |
| Successor | `#1403` or `Task 005` |
| Stage-before-merge | `yes` / `no` |
| Halt/resume condition | Rebaseline complete; `#1448` closed; predecessor PR merged |

Partial overlap with dependency/blocking criteria is not sufficient. Use the
field names above in the issue body.

### PR-Level Reporting (Required for Queue Tasks)

Every PR for a launched-program queue task must report:

| Field | Values |
| --- | --- |
| Dependency-map result | `pass` / `fail` / `not-applicable` |
| Next queue item | issue number and title, `halt — <reason>`, or `not-applicable` |
| Continue/halt decision | `continue` / `halt` / `not-applicable` with one-sentence rationale |

See `/.github/pull_request_template.md` and
`/docs/how-to/cursor/open-task-pr.md`.

## Continue vs Halt Decision Rules

Cursor may **continue** (prepare or update the current task PR) when:

1. the active source issue is the authorized queue item;
2. predecessor and stage-before-merge requirements in the map are satisfied and
   verifiable from available evidence;
3. changed files match the allowlist;
4. no documented halt checkpoint applies;
5. validation can run or a concrete blocker can be reported.

Cursor must **halt** (stop at `READY FOR REVIEW` or report without
implementing) when:

1. a rebaseline pause is active (for example `#1448` while open);
2. the dependency map marks the next item blocked;
3. predecessor, stage-before-merge, or halt/resume conditions are unmet or unclear;
4. the task would require merge, close, relabel, queue advancement, or child
   issue creation without explicit authorization;
5. more than one source issue would be needed for the PR body.

When halted, Cursor reports the blocking checkpoint, the next queue item if
known, and the continue/halt decision. Cursor does not infer authorization from
labels, merge state, or queue order alone.

## Authority Model

| Role | Authority |
| --- | --- |
| Bill | Merge, launch gates, destructive issue actions, strategy exceptions |
| Atlas | Governance review, queue conformance, batch verification, rebaseline, dependency-map approval preparation |
| Cursor | Bounded implementation, validation, PR-body evidence, `READY FOR REVIEW` handoff |

Cursor does not own merge, approval, closeout, relabel, production, or secret
authority in either execution mode.

## Related References

- Cursor execution contract: `/docs/reference/pmo/lgfc-cursor-execution-contract.md`
- PMO critical path: `/docs/ops/pmo/critical-path.md`
- Implementation plan format: `/docs/ops/implementation-plans/README.md`
- Program 2 `#1256` plan and map: `/docs/ops/implementation-plans/website-content-strategy-editorial-inventory.md`
- CI dependency matrix pattern: `/docs/reference/ci/lgfc-ci-implementation-dependency-matrix.md`
