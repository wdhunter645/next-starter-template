---
Doc Type: Reference
Audience: Human + AI
Authority Level: Operational Authority
Owns: Cursor execution permissions, continuation rules, PR handoff behavior, and issue-mutation boundaries for LGFC program tasks
Does Not Own: Cursor product configuration, local developer environment, workflow implementation, GitHub merge authority, or GitHub issue mutation authority
Canonical Reference: /docs/reference/pmo/lgfc-program-portfolio-model.md
Related Issues: #1449, #1448, #1411, #1409, #1379, #1255, #1335, #1501
Last Reviewed: 2026-06-09
---

# LGFC Cursor Execution Contract

## Purpose

Define what Cursor may do by default when implementing or documenting LGFC
program tasks, and define where Cursor must stop for Atlas/Bill review.

## Scope

This document owns:

- default Cursor permissions and prohibitions;
- continuation rules when a PR becomes ready for review;
- issue-comment bridge boundaries;
- merge, close, relabel, queue, and issue-mutation limits;
- required Cursor output for PMO-governed tasks.

This document does not own:

- branch protection settings;
- workflow YAML implementation;
- production configuration or secrets;
- human merge, closeout, launch-gate, or destructive-action authority.

## Current Known Truth

- Program #1411 authorizes docs-only planning for PMO Automation and
  Agent Workflow Control. It is staged / blocked and may not launch until
  Program #1255 is completed and signed off.
- Program #1255 remains active and must not be blocked, closed, relabeled,
  or otherwise mutated by Program #1411 planning work.
- Completed Program 1 cycle `#1335` is historical evidence only and is not a
  parent issue for Program #1411.
- Cursor may execute bounded repository work only through an active source issue,
  file allowlist, validation requirement, and PR handoff.
- Cursor may not merge PRs, close issues, relabel issues, create child issues,
  advance queues, or mutate issue state unless the active source issue explicitly
  authorizes that action.
- Program issue number and source issue body control execution authority.
- Labels, merge state, closed predecessor issues, queue order, open PR order, or
  branch availability alone do not authorize execution.

## Intended Final State

- Cursor can safely move work forward through implementation, validation,
  PR-body evidence, commit, push, and PR update.
- Cursor stops at the authorized review handoff when a PR is ready for review.
- Atlas and Bill retain review, merge, launch-gate, queue-control, and
  destructive-action authority.
- Workflow automation can later encode these rules without changing the human
  authority model.

## Default Permissions

Cursor may:

- read repository docs and source issues;
- edit files inside the active task allowlist;
- run validation commands;
- commit and push scoped changes when authorized by the task;
- open or update a PR for the active task when the source issue or an explicit
  workflow instruction authorizes it;
- report validation results and unresolved blockers in the PR body or handoff
  response.

Cursor may not, by default:

- merge PRs;
- close issues;
- relabel issues;
- create implementation child issues;
- mark or mutate issue state;
- advance queues;
- mutate Program #1255 issues while Program #1411 planning is active;
- modify workflow YAML, application/runtime code, D1 migrations, production
  configuration, or secrets outside the task scope;
- combine multiple source issues into one PR;
- make broad cleanup changes because they are nearby.

## Execution Modes

LGFC uses two execution modes defined in
`/docs/reference/pmo/lgfc-program-queue-and-dependency-map.md`:

| Mode | When | Next-task authority |
| --- | --- | --- |
| One-task handoff | One-off tasks; programs without an approved dependency map | Explicit `@cursor` comment or new source issue per task |
| Launched-program queue | Launched program with an approved dependency map | Approved map + issue predecessor/successor fields + halt/resume conditions |

In both modes, one source issue maps to one PR. Queue mode governs which task is
authorized next, not whether multiple tasks share one PR.

Cursor must not apply universal one-task-only rules in a way that blocks
launched prepared program queues. Cursor must not treat launched-program queue
mode as permission to merge, close, relabel, or advance queues without explicit
authorization.

## Continuation Rule

Cursor may continue forward while all of the following are true:

1. The work remains inside the active source issue.
2. The changed files match the active allowlist.
3. No explicit stop condition has been reached.
4. Validation can be run or a concrete external blocker can be documented.
5. No merge, close, relabel, queue, or issue-state mutation is required.
6. For launched-program queue mode: the dependency map and active issue
   predecessor, stage-before-merge, and halt/resume fields permit continuation.

When a PR is ready for review, Cursor continues only far enough to:

1. run required validation;
2. inspect the final diff and file allowlist;
3. update or create the PR body with exact evidence, including queue reporting
   fields when the program uses launched-program queue mode;
4. commit and push any final documentation-only fixes;
5. set the PR handoff status to `READY FOR REVIEW`;
6. stop for Atlas/Bill walkthrough.

PR readiness is not merge authority.

## Active Program Issue Child-Task Continuation

### Program #1255 (current active program)

For active Program #1255, Cursor may continue from one child task to another only
when the next child issue contains the latest valid Atlas, Bill, or controller
`@cursor` continuation authorization comment.

Cursor must not treat labels, merge state, closed or completed prior issue
state, queue order, open PR order, or branch availability as executable
authority by themselves. Those signals may inform human/controller status
review, but they do not authorize Cursor to start the next Program #1255 child task.

The continuation authorization must name exactly one next child issue. Cursor may
execute only that named issue, must use the PR source issue line required by that
authorization, and must stop at GitHub `READY FOR REVIEW` unless the active
source issue explicitly says otherwise.

Every executable Program #1255 child issue must include or be paired with parent
program reference `#1255`, parent project reference when applicable, dependency
or prior-task criteria, blocking criteria, required source documents, exact
scope, hard out-of-scope boundaries, expected file areas or a file-touch
allowlist, validation expectations, exact PR source issue line requirement, no
merge authority, and no issue close or relabel authority unless explicitly
granted.

### Future active program issues

Future active program issues may use the same child-task continuation pattern when
their program issue and dependency map authorize it. Program issue number and
source issue body control whether continuation is permitted.

For launched-program queue mode, every executable task issue must also include
these dependency fields in the issue body:

| Field | Requirement |
| --- | --- |
| Predecessor | Prior issue or task ID, or `none` |
| Successor | Next issue or task ID, or `terminal` |
| Stage-before-merge | `yes` or `no` |
| Halt/resume condition | What blocks or permits continuation |

Dependency or prior-task criteria alone do not replace these named fields.

Cursor must pause and report findings instead of implementing when blockers are
unclear or when the next task would require creating child issues, mutating
`#1255`, mutating `#1256`, touching Program #1411, changing workflow YAML,
closing issues, relabeling issues, or merging without explicit authorization.

When Cursor's GitHub token cannot reliably remove labels or post issue cleanup
comments, Atlas or the GitHub connector handles that issue cleanup path. That
token boundary does not authorize Cursor to infer continuation from issue state
or queue signals.

## Stop Conditions

Cursor must stop and report when:

- the requested change would touch files outside the allowlist;
- the task requires workflow YAML, runtime, D1, production configuration, or
  secret changes not explicitly authorized;
- issue closure, relabeling, queue advancement, child issue creation, or merge is
  needed;
- Program #1255 state would be mutated by Program #1411 planning work;
- validation fails and the root cause is outside the authorized scope;
- more than one source issue would be needed for the PR body.

## PR Readiness and Batch Review

For each PR, Cursor owns:

- one accepted source issue line;
- file-touch allowlist evidence;
- docs-only or implementation-scope assertion;
- exact validation commands and outcomes;
- reviewer and bot disposition when present, including `review-comment:<id>` lines for every actionable trusted reviewer comment and explicit outdated-thread disposition;
- clear blocker reporting.

Atlas owns governance review, source-issue accounting, queue conformance, and
review-thread disposition. Bill owns protected merges, launch gates, destructive
issue actions, production-sensitive decisions, and strategy exceptions.

Batch review may group related PRs for human efficiency, but it must not convert
Cursor into the merge authority or allow Cursor to mutate issue state.

## PMO Issue-Comment Bridge

GitHub issue comments may be used as a controlled operational bridge between
Atlas and Cursor for PMO, program, project, and task execution.

The bridge is not a general chat surface. It exists only for
repository-governed work that has been defined by an approved PMO, program,
project, or task issue.

Bridge comments are allowed when all of the following are true:

- the issue is the active source issue, parent program issue, child project
  issue, or an explicitly named coordination issue;
- the work item is PMO-defined and approved for queue movement, implementation,
  review, or closeout;
- the comment contains bounded operational instruction or bounded execution
  status;
- the comment supports progress toward a PR, PR review, gate completion, or
  explicitly authorized post-merge closeout;
- the comment does not bypass PR review, required checks, merge authority, or
  issue closeout rules.

## Issue-Comment Bridge Limits

Do not use issue comments for:

- work not defined by an approved PMO, program, project, or task issue;
- long reconciliation drafts;
- speculative design debate;
- unbounded planning;
- broad implementation summaries better suited to a PR body;
- issue closure, relabeling, queue advancement, or state mutation unless
  separately authorized.

Before a PR exists, full review packets normally stay in chat unless Atlas or
Bill explicitly routes the packet to the issue. After a PR exists, detailed
review material belongs in the PR body, PR comments, or PR review threads.

## Bridge Reply Path Rule

The default reply path for Atlas/Cursor handoffs is the same surface where the
handoff was delivered.

- If Atlas/Bill sends the Cursor prompt in chat, Cursor replies in chat.
- If Atlas posts a bounded bridge handoff on a GitHub issue, Cursor replies on
  that issue using the required bridge reply format.
- If the handoff occurs on a PR, Cursor replies on the PR.

Cursor must not move a response to a different surface unless Atlas/Bill
explicitly requests it.

## Required Bridge Comment Format

Atlas bridge comments should use this shape:

```text
Atlas handoff — Cursor action requested

Task / program / project:
<issue or work item>

Instruction:
<short actionable instruction>

Scope:
<allowed branch/files/actions>

Prohibited:
<merge/close/relabel/etc.>

Expected reply:
<what Cursor should report back>
```

Cursor bridge replies should use this shape:

```text
Cursor status — Atlas handoff response

Task / program / project:
<issue or work item>

Result:
<short status>

Branch/PR:
<branch or PR if applicable>

Stop condition:
<none or reason>

Gate status:
<not run / running / passing / failing>

Next required Atlas action:
<approval/review/merge/etc.>
```

## Required Cursor Output

For each implementation pass, Cursor reports:

```text
Task:
Source issue:
Changed files:
Validation:
Out-of-scope files touched: yes/no
PR opened: yes/no
Recommended post-merge issue actions:
```

For launched-program queue mode, the PR body must also include:

```text
Dependency-map result: pass / fail / not-applicable
Next queue item: <issue # and title> / halt — <reason> / not-applicable
Continue/halt decision: continue / halt / not-applicable — <one-sentence rationale>
```

Recommended post-merge issue actions are recommendations only. They do not grant
Cursor permission to mutate issue state.

## File Authority

If a task issue allowlist conflicts with a broad repo cleanup impulse, the issue
allowlist wins.

If Cursor finds necessary work outside the allowlist, it reports the finding and
stops before editing that path.

## PR Rule

One task issue maps to one PR unless Atlas explicitly authorizes a split.

## Closeout Rule

GitHub issue state changes happen after PR merge and post-merge verification,
and only when explicitly authorized by the active source issue and Atlas/Bill
review path.

For completed source issues, the authorized closeout path must reconcile labels
before queue advancement: stable non-status labels plus `status:complete` are
retained, and active or failure workflow status labels are removed. Cursor may
report this requirement or identify a mismatch, but may not apply the label
changes unless the active source issue explicitly grants that mutation authority.
