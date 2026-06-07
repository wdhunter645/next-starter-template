---
Doc Type: Reference
Audience: Human + AI
Authority Level: Operational Authority
Owns: Cursor execution permissions, continuation rules, PR handoff behavior, and issue-mutation boundaries for LGFC program tasks
Does Not Own: Cursor product configuration, local developer environment, workflow implementation, GitHub merge authority, or GitHub issue mutation authority
Canonical Reference: /docs/reference/pmo/lgfc-program-portfolio-model.md
Related Issues: #1411, #1409, #1379, #1255, #1335
Last Reviewed: 2026-06-07
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

- Program 1 `#1411` authorizes a docs-only planning PR for PMO Automation and
  Agent Workflow Control.
- Program 2 `#1255` remains active and must not be blocked, closed, relabeled,
  or otherwise mutated by Program 1 planning work.
- Completed Program 1 cycle `#1335` is historical evidence only and is not a
  parent issue for later Program 1 cycles.
- Cursor may execute bounded repository work only through an active source issue,
  file allowlist, validation requirement, and PR handoff.
- Cursor may not merge PRs, close issues, relabel issues, create child issues,
  advance queues, or mutate issue state unless the active source issue explicitly
  authorizes that action.

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
- mutate Program 2 issues while Program 1 planning is active;
- modify workflow YAML, application/runtime code, D1 migrations, production
  configuration, or secrets outside the task scope;
- combine multiple source issues into one PR;
- make broad cleanup changes because they are nearby.

## Continuation Rule

Cursor may continue forward while all of the following are true:

1. The work remains inside the active source issue.
2. The changed files match the active allowlist.
3. No explicit stop condition has been reached.
4. Validation can be run or a concrete external blocker can be documented.
5. No merge, close, relabel, queue, or issue-state mutation is required.

When a PR is ready for review, Cursor continues only far enough to:

1. run required validation;
2. inspect the final diff and file allowlist;
3. update or create the PR body with exact evidence;
4. commit and push any final documentation-only fixes;
5. set the PR handoff status to `READY FOR REVIEW`;
6. stop for Atlas/Bill walkthrough.

PR readiness is not merge authority.

## Program 2 Child-Task Continuation Rule

For Program 2 `#1255` child-task execution, Cursor may begin the next child issue
only after Atlas, Bill, or the controller posts an explicit `@cursor`
continuation authorization comment on that child issue.

Cursor must not infer executable authority from labels, merge state,
closed/completed prior issue state, queue order, or an active parent/project
issue alone. Cursor may execute only the issue explicitly named in the latest
valid continuation comment, must stop at GitHub `READY FOR REVIEW` unless the
comment says otherwise, and must not create child issues, close issues, relabel
issues, mutate parent Program 2 issue `#1255`, mutate child project issue
`#1256`, advance Program 1 / `#1411`, or mutate unrelated issues unless the
active source issue explicitly grants that authority.

If blockers are unclear, Cursor pauses and reports findings instead of
implementing.

Program 2 continuation comments should use this reusable authorization template:

```text
@cursor
Program 2 continuation authorization.

Prior task complete:
- <prior issue> is closed completed or otherwise explicitly accepted.
- <prior PR> is merged.
- Superseded PRs, if any, are closed unmerged.
- Post-merge verification / label cleanup is complete or explicitly delegated.

Blocking criteria cleared:
- <dependency> is complete.
- <parent project> remains active.
- <parent program> remains active.
- Program 1 / #1411 must not advance.

Next authorized task:
- <next issue> - <title>

Proceed with <next issue> only.

Use exactly one PR source issue line:
- **Issue:** <next issue>

Hard boundaries:
- Do not touch Program 1 / #1411.
- Do not mutate #1255 or #1256 state unless explicitly authorized.
- Do not close or relabel issues unless explicitly authorized.
- Do not create additional child issues.
- Do not change workflow YAML unless explicitly authorized.
- Do not merge.

Validation:
- Run and report exact commands/results in the PR body.

Stop condition:
- Stop at GitHub READY FOR REVIEW.
```

Program 2 blocked-continuation comments should use this reusable pause template:

```text
@cursor pause.
Program 2 continuation is blocked.

Do not implement the next child task.

Blocking criteria not cleared:
- <blocker list>

Allowed action:
- Investigate and report only, if explicitly requested.

Stop after posting findings.
```

## Stop Conditions

Cursor must stop and report when:

- the requested change would touch files outside the allowlist;
- the task requires workflow YAML, runtime, D1, production configuration, or
  secret changes not explicitly authorized;
- issue closure, relabeling, queue advancement, child issue creation, or merge is
  needed;
- Program 2 state would be mutated by Program 1 planning work;
- validation fails and the root cause is outside the authorized scope;
- more than one source issue would be needed for the PR body.

## PR Readiness and Batch Review

For each PR, Cursor owns:

- one accepted source issue line;
- file-touch allowlist evidence;
- docs-only or implementation-scope assertion;
- exact validation commands and outcomes;
- reviewer and bot disposition when present;
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
