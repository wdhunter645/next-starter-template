---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: GitHub issue closeout protocol, post-merge evidence requirements, bounded batch closeout, and issue-mutation separation for LGFC program tasks
Does Not Own: Merge authority, branch protection, workflow implementation, or issue mutation outside approved scope
Canonical Reference: /docs/reference/pmo/lgfc-cursor-execution-contract.md
Related Issues: #1411, #1409, #1379, #1255, #1335, #1548
Last Reviewed: 2026-06-15
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
- terminal completed-issue label reconciliation;
- umbrella issue closeout exclusion policy;
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
- Program, umbrella, master, and tracking issues are not closed by child task PR
  closeout unless the PR source issue and operator instruction explicitly name
  that umbrella issue for closure.
- `gate-close-work-issue.yml` is a parked no-op workflow. It is not an effective
  source-issue closeout owner.
- Automatic post-merge source issue closeout is owned by
  `.github/workflows/post-merge-closeout.yml` and the closeout scripts it invokes.
- Pre-merge PR-to-issue accounting is owned by
  `.github/workflows/ops-pr-issue-accounting.yml`.

## Intended Final State

- Every post-merge closeout action is supported by stable evidence.
- Automation can later consume a clear closeout packet without guessing at merge,
  issue, or queue state.
- Completed source issues do not retain stale active or failure workflow labels.
- Batch closeout remains bounded by explicit Atlas/Bill authorization.
- Cursor stops at evidence and recommendation unless mutation is separately
  authorized.
- Umbrella and program issues remain open until their own explicit closeout
  authority exists.

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
- terminal label reconciliation decision, if any;
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
6. Reconcile terminal source-issue labels as part of the same authorized
   closeout action when the source issue will be closed as completed.
7. Apply issue comments, closure, relabeling, or queue advancement only when the
   active source issue and Atlas/Bill path explicitly authorize those actions.
8. Keep umbrella or program issues open when the task says they remain active.
9. Advance the next task only after source task closeout is clean and queue
   authority is clear.

## Umbrella issue closeout exclusion policy

Umbrella, master, program, parent, and tracking issues are excluded from automatic
child task closeout. A task PR may close only its single source issue unless the
operator explicitly authorizes a bounded batch or umbrella closeout action.

The exclusion applies even when a PR body references an umbrella issue for
context. References such as `Related Issues`, `Program`, `Parent`, `Umbrella`,
`Part of`, or narrative links are not closeout authority.

Automation and agents must treat these as non-closeout references by default:

- Program umbrella issues, including Program #1500 parent tracking issues;
- master planning issues;
- queue or roadmap issues;
- issues that remain active after a child task completes;
- remediation issues unless duplicate-remediation cleanup is explicitly in scope.

An umbrella issue may be closed only when all of the following are true:

1. the closeout packet names the umbrella issue as a closure target;
2. all child tasks are complete or intentionally canceled;
3. the operator authorizes umbrella closure in the active instruction path;
4. the closeout comment states that no active child or queue item remains;
5. terminal label reconciliation is applied in the same closeout action.

If any condition is missing, the umbrella issue remains open and the child task
closeout proceeds only for the child source issue.

## Terminal Completed-Issue Label Policy

LGFC uses a `status:complete` terminal label for completed source issues. A
closed source issue with `state_reason: completed` must retain only stable
non-status labels plus `status:complete`.

A completed source issue must not retain active or failure-state labels,
including:

- `status:queued`
- `status:assigned`
- `status:pr-draft`
- `status:implementation`
- `status:review`
- `status:post-merge-verify`
- `status:failed`

The controller or authorized Atlas closeout step applies this reconciliation
after merge verification and before queue advancement. The closeout action must:

1. read the source issue state and labels;
2. compute the terminal label set as existing stable non-status labels plus
   `status:complete`;
3. remove all non-terminal workflow status labels listed above;
4. close the source issue with `state_reason: completed` when closure is
   authorized;
5. verify the final issue state and label set before reporting closeout clean.

Closure and terminal label cleanup must not be split into separate follow-up
tasks. If the controller or Atlas closeout step cannot complete the label
reconciliation, the source issue remains in closeout verification and the
blocker is recorded instead of advancing the queue.

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
- terminal label reconciliation result when the issue is closed as completed;
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
- terminal completed-issue label reconciliation;
- batch closeout safety checks;
- queue advancement preconditions;
- umbrella issue exclusion checks;
- issue mutation allowlists.

No workflow implementation is authorized by this protocol update alone.
