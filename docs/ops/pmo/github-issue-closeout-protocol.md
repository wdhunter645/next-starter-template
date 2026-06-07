---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: GitHub issue closeout protocol, post-merge evidence requirements, bounded batch closeout, and issue-mutation separation for LGFC program tasks
Does Not Own: Merge authority, branch protection, workflow implementation, or issue mutation outside approved scope
Canonical Reference: /docs/reference/pmo/lgfc-cursor-execution-contract.md
Related Issues: #1411, #1409, #1379, #1255, #1335
Last Reviewed: 2026-06-07
---

# GitHub Issue Closeout Protocol

## Purpose

Define how LGFC issue closeout evidence, comments, state changes, and queue
handoffs are handled after a task PR merges.

## Scope

This document owns:

- required post-merge closeout evidence;
- separation between evidence preparation and issue mutation;
- bounded batch closeout authorization;
- Program 2 non-interference during Program 1 planning;
- Cursor closeout recommendations and stop points.

This document does not own:

- PR merge authority;
- workflow YAML or closeout automation implementation;
- issue closure, relabeling, or queue mutation without explicit authorization;
- production configuration, D1 state, or runtime behavior.

## Current Known Truth

- Cursor may document closeout recommendations, but may not close issues,
  relabel issues, advance queues, or mutate issue state unless the active source
  issue explicitly authorizes that action.
- Program 1 `#1411` planning must not mutate active Program 2 `#1255` issues.
- Completed Program 1 `#1335` is historical evidence only and is not the closeout
  parent for the new Program 1 cycle.
- Workflow Automation planning may define closeout evidence requirements before
  any workflow implementation begins.

## Intended Final State

- Every post-merge closeout action is supported by stable evidence.
- Automation can later consume a clear closeout packet without guessing at merge,
  issue, or queue state.
- Batch closeout remains bounded by explicit Atlas/Bill authorization.
- Cursor stops at evidence and recommendation unless mutation is separately
  authorized.

## Default Rule

Implementation PRs do not close or relabel related GitHub issues directly. They
may add documentation that recommends disposition and records the evidence needed
for an authorized human or automation path.

Merge is not sufficient closeout evidence by itself.

## Required Closeout Evidence

A closeout packet must identify:

- source issue;
- merged PR;
- merge commit;
- validation commands and results;
- changed-file scope;
- reviewer, bot, and gate disposition status;
- authorized issue action, if any;
- queue advancement decision, if any;
- unresolved blockers or follow-up items;
- rollback or remediation path when applicable.

If any required evidence is missing, closeout must stop at evidence collection or
blocker reporting.

## Post-Merge Sequence

1. Verify the PR merged.
2. Record the merge commit.
3. Verify required checks and post-merge validation status.
4. Verify the source issue and active authorization.
5. Prepare the closeout evidence packet.
6. Apply issue comments, closure, relabeling, or queue advancement only when the
   active source issue and Atlas/Bill path explicitly authorize those actions.
7. Keep umbrella or program issues open when the task says they remain active.
8. Advance the next task only after source task closeout is clean and queue
   authority is clear.

## Cursor Closeout Boundary

Cursor may:

- report closeout evidence;
- recommend post-merge issue actions;
- update documentation with closeout requirements;
- identify blockers or missing evidence.

Cursor may not:

- close issues;
- relabel issues;
- change issue state labels;
- advance queues;
- mutate Program 2 issues from Program 1 planning;
- create child issues;
- merge PRs.

Recommendations are not authorization.

## Comment Content

Each authorized closeout comment should include:

- action reason;
- source issue;
- evidence document path or PR body section;
- merged PR reference;
- merge commit;
- validation summary;
- superseded-by or deferred-to reference when relevant;
- statement of whether the issue remains open or is closed;
- queue advancement result or explicit "no queue action" statement.

## Batch Authorization

Bill may authorize a bounded batch such as:

```text
After PR <number> merges, apply the documented comments and close only <issue list>.
Add comment-only handoffs to <issue list>.
Do not touch any other issues.
```

Atlas may then act within that exact scope. Cursor may prepare evidence for the
batch, but may not execute issue mutation unless the active source issue
explicitly grants that authority.

## Program 2 Non-Interference

Program 1 `#1411` planning must not close, relabel, queue, or otherwise mutate
Program 2 `#1255` issues. Any future Program 2 closeout must be authorized by an
active Program 2 source issue or by a separate Atlas/Bill closeout instruction.

## Workflow Automation Design Hook

Future workflow automation may use this protocol as the design target for:

- closeout evidence packet schemas;
- post-merge verification gates;
- batch closeout safety checks;
- queue advancement preconditions;
- issue mutation allowlists.

No workflow implementation is authorized by this protocol update alone.
