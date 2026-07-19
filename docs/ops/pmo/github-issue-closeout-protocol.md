---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: GitHub issue closeout protocol, post-merge evidence requirements, bounded batch closeout, issue-mutation separation, atomic source-issue closeout, successor queue advancement, and closeout-exception housekeeping for LGFC work
Does Not Own: Merge authority, branch protection, workflow implementation, project objectives, or issue mutation outside approved administrative scope
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #1411, #1409, #1379, #1255, #1335, #1548, #2359, #2360, #2376, #2380, #2641
Last Reviewed: 2026-07-19
---

# GitHub Issue Closeout Protocol

## Purpose

Define how LGFC issue closeout evidence, comments, state changes, administrative exceptions, and queue handoffs are handled after a task PR merges or when an authorized non-merge disposition requires final housekeeping.

This procedure implements the administrative control lane policy in `docs/governance/OPERATIONS-AND-RECOVERY.md` and the stable mutation contract in `docs/reference/operations/administrative-control-lane-contract.md`.

## Scope

This document owns:

- required post-merge closeout evidence;
- separation between evidence preparation and issue mutation;
- bounded batch closeout authorization;
- terminal completed-issue label reconciliation;
- atomic source-issue closeout and successor queue advancement;
- closeout-exception clarification, remediation, verification, and housekeeping;
- non-merge administrative disposition closeout;
- umbrella issue closeout exclusion policy;
- Program 2 non-interference during Program 1 planning;
- Cursor closeout recommendations and stop points.

This document does not own:

- PR merge authority;
- workflow YAML or closeout automation implementation;
- project objective, acceptance, design, delivery-model, validation, approval, priority, dependency, or successor-authority changes;
- issue closure, relabeling, or queue mutation without existing policy or explicit authorization;
- production configuration, D1 state, or runtime behavior.

## Current Known Truth

- Cursor may document closeout recommendations, but may not close issues,
  relabel issues, advance queues, or mutate issue state unless the active source
  issue explicitly authorizes that action.
- Source-issue closure must not be separated from terminal label reconciliation
  or required successor queue disposition. If successor state cannot be verified
  or updated, the source issue remains in closeout verification and the blocker
  is recorded.
- Successful post-merge closeout CI is the primary merge-triggered administrative
  actor. Manual or scheduled administrative control must verify its result and
  must not duplicate a successful transaction.
- The administrative control lane owns failed, partial, missing, contradictory,
  non-merge, and later-discovered closeout exceptions through final housekeeping.
- Administrative closeout may reconcile state to existing authority but must not
  create new execution authority or change project objectives.
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

- Every post-merge and authorized non-merge closeout action is supported by stable evidence.
- Automation consumes a clear closeout packet without guessing at merge, issue, queue, parent, or exception state.
- Completed source issues do not retain stale active or failure workflow labels.
- A completed predecessor issue unblocks or explicitly halts its successor in the same authorized closeout pass.
- Actively governed parent, project, program, dashboard, and reporting surfaces reflect the completed transition.
- Failed or partial closeout produces one bounded administrative exception that is clarified or remediated through final resolution.
- Batch closeout remains bounded by explicit Atlas/Bill authorization.
- Cursor stops at evidence and recommendation unless mutation is separately authorized.
- Umbrella and program issues remain open until their own explicit closeout authority exists.
- Administrative housekeeping does not become a repository-wide execution lock; only the affected invariant or lane halts.

## Default Rule

Implementation PRs do not close or relabel related GitHub issues directly. They
may add documentation that recommends disposition and records the evidence needed
for an authorized human or automation path.

Merge is not sufficient closeout evidence by itself.

Source-issue closure is an atomic closeout action. A source issue must not be
closed as complete unless the same authorized closeout pass also records terminal
label reconciliation, parent or umbrella disposition, successor or queue
disposition, and any remediation, exception, or tracker follow-up.

A successful closeout pass must not be duplicated. A later actor may correct newly discovered deterministic drift but must preserve the original closeout evidence and record the correction.

## Required Closeout Evidence

A closeout packet must identify:

- source issue;
- merged PR or explicit non-merge disposition authority;
- merge commit when applicable;
- validation commands and results;
- changed-file scope when applicable;
- reviewer, bot, and gate disposition status;
- authorized issue action, if any;
- terminal label reconciliation decision, if any;
- queue advancement decision, if any;
- successor issue actions, including unblock, continue, halt, or not applicable;
- parent, project, program, dashboard, or tracker actions, if any;
- unresolved blockers, clarifications, exceptions, or follow-up items;
- rollback or remediation path when applicable.

If any required evidence is missing, closeout must stop at evidence collection,
final clarification, exception creation, or blocker reporting.

## Post-Merge Sequence

1. Verify the PR merged.
2. Record the merge commit.
3. Verify required checks and post-merge validation status.
4. Verify the source issue and active authorization.
5. Prepare the closeout evidence packet.
6. Reconcile terminal source-issue labels as part of the same authorized
   closeout action when the source issue will be closed as completed.
7. Apply issue comments, closure, relabeling, or queue advancement only when the
   active source issue and Atlas/Bill or deterministic CI path explicitly authorize those actions.
8. Keep umbrella or program issues open when the task says they remain active.
9. Update actively tracking parent, project, program, dashboard, and reporting state when the correct value is established.
10. Advance the next task only after source task closeout is clean and queue
    authority is clear.
11. Re-fetch and verify source-Issue state, terminal labels, parent/reporting state, successor state, and exception state before reporting closeout verified.

## Administrative closeout exception lifecycle

A closeout exception exists when the primary closeout transaction fails, partially completes, lacks required evidence, cannot determine an administrative result, or later evidence reveals contradictory state.

```text
DETECTED -> RECORDED -> CLARIFICATION OR REMEDIATION -> VERIFIED -> RESOLVED
```

The administrative control lane must:

1. create or update one bounded exception record rather than duplicate issues;
2. identify the exact failed or contradictory invariant;
3. preserve merge, validation, review, source-Issue, parent, successor, and current mutation evidence;
4. state whether implementation or only queue continuation is blocked;
5. request final clarification when existing authority does not determine the administrative result;
6. route technical remediation to Cursor only through a bounded source Issue;
7. apply only administrative corrections permitted by the stable contract;
8. verify the repaired closeout transaction;
9. remove stale failure or active labels;
10. resolve the exception and restore only the affected queue or lane.

Closeout housekeeping may not change project objectives, technical scope, acceptance criteria, delivery model, validation, approval, priority, dependency, or successor authority.

Reporting lag and cosmetic metadata do not block independent approved work. A failed source-Issue, authority, dependency, validation, approval, closeout, or collision invariant blocks only the affected transition or lane unless a shared dependency requires a broader halt.

## Final clarification during closeout

The administrative control lane owns final clarification for questions such as:

- whether an existing keep-open instruction applies;
- which contradictory terminal or failure label is current;
- whether a declared successor is now unblocked;
- whether existing evidence satisfies an already-defined closeout requirement;
- which actively governed parent or reporting surface must be updated;
- whether a stale handoff, assignment, or routing state should be cleared.

Chat / Atlas resolves routine administrative clarification. Bill is required only when the answer changes product intent, priority, cost, credentials, business authority, destructive or production posture, or resolves an irreconcilable authority conflict.

The clarification and its authority must be recorded on the relevant Issue, PR, or canonical document before mutation.

## Non-merge administrative closeout

Canceled, duplicate, superseded, not-planned, administrative-only, and other explicitly authorized non-merge dispositions may close without a merged PR when:

- the disposition authority is recorded on the source Issue or in higher policy;
- no implementation result is being falsely represented;
- required labels, comments, parent reporting, successor impact, and exception state can be determined;
- the administrative action does not change objectives or technical authority;
- the final state is re-fetched and verified.

Non-merge closeout must not bypass required implementation, validation, review, approval, promotion, or production boundaries.

## Merged PR with failed required pre-merge check

Merge authorization does not resolve a failed required pre-merge check that
remained on the PR head at merge time.

### Closeout rules

When a merged PR still carried a failed required pre-merge check:

1. Do not treat merge alone as closeout verified.
2. Inspect Post-Merge Detection output for the merge commit before claiming
   source-issue closeout or successor advancement.
3. When post-merge validation fails, the source issue remains in closeout
   verification or receives failure disposition; do not close it as completed
   unless Bill/ChatGPT records an accepted exception with authority citation.
4. Record failed gate name, workflow run, job, and step evidence in the
   closeout packet when available.
5. Link the canonical remediation issue, administrative exception, and any root-cause ops issue as separate bounded tracks when needed.
6. Halt queue advancement until remediation posture is dispositioned or an
   accepted exception is recorded on the parent program or source issue.
7. Do not halt independent approved lanes that do not share the failed invariant.

### Operator procedure

Follow `docs/how-to/ci/merged-pr-failed-pre-gate-followup.md` for verification
checklist and manual fallback when automation does not create or update the
expected remediation issue.

Validation surface reference: `docs/reference/ci/post-merge-validation-surface.md`
(merged PR with failed required pre-merge check).

## Atomic source-issue closeout and successor advancement

A completed source issue may be closed only inside an atomic closeout pass. The
same pass must decide and record the successor state before reporting closeout as
clean.

### Required atomic actions

When closing a source issue as completed, the authorized closeout actor must:

1. read the source issue state, labels, body, and latest closeout-relevant
   comments;
2. confirm the merged PR or authorized non-merge disposition, validation status, and accepted exceptions;
3. compute and apply terminal source-issue labels in the same mutation path as
   closure;
4. identify successor, dependent, parent, project, program, dashboard, tracker, and
   remediation or exception issues named by the source issue, PR body, parent issue, or queue map;
5. decide for each successor whether it is unblocked, still blocked, explicitly
   deferred, or not applicable;
6. update or comment on the successor issue when it is unblocked or remains
   blocked for a documented reason;
7. comment on the parent, project, or program issue when the parent actively
   tracks child status or queue progression;
8. reconcile governed dashboard or reporting state when explicitly owned;
9. record tracker or status-index follow-up only when the source issue or PR
   explicitly owns that tracker/status surface;
10. leave umbrella, master, project, and program issues open unless the bounded
    closeout instruction explicitly names them for terminal closure;
11. verify the final source issue state, terminal labels, parent/reporting state, successor state, exception state, and
    queue continuation result before reporting closeout verified.

### Successor advancement rule

If the closed issue is a predecessor in a serial or partially serial queue, the
next eligible issue must be advanced in the same closeout pass unless Bill or the
source issue explicitly authorizes a halt or parallel execution exception.

Advancement means one of the following, depending on the issue's existing label
model and body vocabulary:

- remove or supersede blocked-pending-predecessor state;
- add or retain the appropriate active, assigned, implementation-ready, or
  `agent:ChatGPT` routing state;
- post a closeout/continuation comment naming the cleared predecessor and the
  next allowed action;
- record that the successor remains blocked and why.

Do not close the predecessor as complete if the successor cannot be identified,
its block state cannot be reconciled, or queue authority is unclear. Instead,
leave the predecessor in closeout verification, create or update the administrative exception, and record the blocker.

### Closeout packet template

Authorized closeout comments should use this minimum structure when a source
issue is closed or intentionally left open after merge:

```text
CLOSEOUT VERIFIED
Source issue: #____
Merged PR: #____ / not applicable
Merge commit: ______ / not applicable
Validation: pass / accepted exception / failed / not applicable
Accepted exceptions: none / <exception and authority>
Terminal labels reconciled: yes / no / not applicable
Issue state: closed completed / remains open / blocked / non-merge disposition
Successor issue action: unblocked #____ / remains blocked #____ / no queue action / halted
Parent/project/program action: updated #____ / no parent action
Dashboard/reporting action: updated <surface> / no reporting action
Tracker/status-index action: updated <path-or-issue> / no tracker action
Remediation or administrative exception: none / created #____ / resolved #____ / remains open #____
Final clarification: none / <decision and authority>
Queue continuation: continue / halt / not applicable
```

A closeout report that does not include successor or queue disposition and administrative exception state is not
closeout verified.

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
- remediation and administrative exception issues unless their own resolution is explicitly in scope;
- `PROJECT:` and `PROGRAM:` titled source issues linked by task PRs, unless
  `## POST-MERGE ISSUE DISPOSITION` explicitly authorizes terminal close.

Post-merge closeout automation enforces this structurally:

1. `PROJECT:` / `PROGRAM:` source issues remain open after task PR merge unless
   disposition explicitly authorizes terminal close.
2. Keep-open language in `## POST-MERGE ISSUE DISPOSITION` or
   `## POST-MERGE CLOSEOUT CHECKLIST` prevents automatic source-issue closure.
3. Incorrect umbrella closure on a prior merge is auto-reopened on the next
   successful closeout sync when the umbrella guard applies.

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
- `status:in-progress`
- active handoff labels that no longer represent executable work.

The controller, post-merge closeout CI, or authorized Atlas administrative step applies this reconciliation
after merge verification or authorized non-merge disposition and before queue advancement. The closeout action must:

1. read the source issue state and labels;
2. compute the terminal label set as existing stable non-status labels plus
   `status:complete`;
3. remove all non-terminal workflow status and stale handoff labels;
4. close the source issue with `state_reason: completed` when closure is
   authorized;
5. verify the final issue state and label set before reporting closeout clean.

Closure and terminal label cleanup must not be split into separate follow-up
tasks. If the controller, closeout CI, or Atlas administrative step cannot complete the label
reconciliation, the source issue remains in closeout verification, an administrative exception is recorded, and the
blocker is preserved instead of advancing the affected queue.

Terminal label cleanup, source issue closure, and required successor queue
disposition must not be split into separate follow-up tasks. If any one of those
steps cannot be completed, closeout remains blocked and queue advancement halts
unless Bill explicitly authorizes a recorded exception. Independent approved lanes continue when they do not share the failed invariant.

## Cursor Closeout Boundary

Cursor may:

- report closeout evidence;
- recommend post-merge issue actions;
- update documentation with closeout requirements when assigned;
- identify blockers, clarification needs, missing evidence, or administrative exceptions;
- perform a bounded administrative mutation only when the source Issue explicitly authorizes that exact action.

Cursor may not:

- close issues as routine closeout owner;
- relabel issues as routine closeout owner;
- change issue state labels without explicit bounded authority;
- advance queues without explicit bounded authority;
- mutate Program 2 issues from Program 1 planning;
- create child issues without Chat authority;
- merge PRs;
- resolve final administrative clarification on its own work;
- use housekeeping to change objectives or technical scope.

Recommendations are not authorization.

## Comment Content

Each authorized closeout comment should include:

- action reason;
- source issue;
- evidence document path or PR body section;
- merged PR reference or non-merge disposition authority;
- merge commit when applicable;
- validation summary;
- terminal label reconciliation result when the issue is closed as completed;
- successor issue action or explicit no-queue-action statement;
- parent, project, program, dashboard, tracker, or status-index action when relevant;
- administrative exception and final clarification state;
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

Atlas may then act within that exact scope. Deterministic CI may execute only the subset explicitly implemented and mechanically provable. Cursor may prepare evidence for the
batch, but may not execute issue mutation unless the active source issue
explicitly grants that authority.

## Program 2 Non-Interference

Program 1 `#1411` planning must not close, relabel, queue, or otherwise mutate
Program 2 `#1255` issues. Any future Program 2 closeout must be authorized by an
active Program 2 source issue or by a separate Atlas/Bill closeout instruction.

## Workflow Automation Design Hook

Workflow automation may use this protocol as the design target for:

- closeout evidence packet schemas;
- post-merge verification gates;
- terminal completed-issue label reconciliation;
- atomic successor advancement checks;
- parent/project/program progress comment routing;
- dashboard/reporting reconciliation;
- bounded administrative exception creation and resolution;
- batch closeout safety checks;
- queue advancement preconditions;
- umbrella issue exclusion checks;
- issue mutation allowlists;
- idempotency, stale-event suppression, and final-state verification.

No workflow implementation is authorized by this protocol update alone.

## Related authorities

- `docs/governance/OPERATIONS-AND-RECOVERY.md`
- `docs/reference/operations/administrative-control-lane-contract.md`
- `docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`
- `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
