---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: LGFC queue watch, canonical handoff dispatch, local Cursor wake routing, administrative-control execution, final clarification routing, silent-stall detection, lane-aware continuation, and process-remediation routing
Does Not Own: ChatGPT product automation configuration, GitHub workflow implementation, merge authority, production configuration, branch deletion, project objectives, or uncontrolled issue mutation
Canonical Reference: /docs/governance/OPERATIONS-AND-RECOVERY.md
Related Issues: #2396, #2391, #2386, #2360, #2361, #2363, #2364, #2359, #2376, #2380, #2492, #2641
Last Reviewed: 2026-07-19
---

# Queue Watch and Dispatch Protocol

## Purpose

Keep every approved LGFC execution lane moving by converting GitHub state into one deterministic next action without disrupting the local Cursor poll-wake loop, while maintaining the repository-wide administrative control lane for metadata reconciliation, final clarifications, closeout exceptions, reporting, and housekeeping.

Handoff markers are inert until a manual, scheduled, or repo-native dispatcher consumes them. Labels and comments make work detectable; they do not prove agent pickup or execution.

The administrative control lane follows all approved lanes. It must not become a repository-wide execution lock or create new project authority.

## Current operating truths

- GitHub Issues are executable task authority.
- Local Cursor is the default runtime.
- Never use `@cursor` for local work.
- The local poller detects qualifying issue/PR activity after its saved watermark.
- The primary issue watch path requires an open issue with both `agent:cursor` and `handoff:ready`.
- Assignment to `wdhunter645` provides an independent issue/PR detection path.
- Parallel Model B lanes are authorized; maintain one eligible active local Cursor task per approved lane rather than one task for the entire repository.
- A valid dispatch uses exactly one `CHATGPT RESPONSE` or `CHATGPT CLOSEOUT`, followed by exactly one separate `LOCAL CURSOR RESUME`.
- A source issue cannot close before verified integration evidence and canonical closeout.
- The administrative control lane may reconcile deterministic non-code repository state to existing authority.
- Administrative reconciliation is non-blocking unless an explicit source-Issue, authority, dependency, validation, approval, closeout, collision, production, or safety invariant is missing, contradictory, or failed.
- Successful post-merge closeout CI is the primary merge-triggered administrative actor; dispatchers handle exceptions and non-merge administrative work.

## Canonical dispatch transaction

When ChatGPT expects local Cursor action:

```text
1. Confirm the source issue is open.
2. Confirm the issue has agent:cursor + handoff:ready.
3. Assign the source issue to wdhunter645.
4. If PR revision is involved, assign the open PR to wdhunter645.
5. Post exactly one CHATGPT RESPONSE or CHATGPT CLOSEOUT on the source issue.
6. Post exactly one separate LOCAL CURSOR RESUME referencing that exact response.
7. Resume contains exactly one bounded next action.
8. Do not claim pickup until Cursor comments canonically or pushes a new commit.
```

Do not post duplicate response/resume pairs for the same decision. A replacement is allowed only when it explicitly says it supersedes the prior instruction and references it.

Full marker formats are owned by `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`.

## Trigger classes

| Trigger | Evidence | Dispatcher or administrative action |
| --- | --- | --- |
| Cursor handoff | Canonical `CHATGPT HANDOFF` on source issue | Review, decide, and record one canonical response |
| Cursor revision required | PR review or failing gate | Mirror the decision on source issue; assign issue/PR; post one response/resume pair |
| Cursor task wake | Eligible task selected in an approved lane | Verify labels, assignments, branch, runtime, and one action |
| PR review queue | Open PR tied to active source issue | Review scope, checks, threads, rollback, and target branch |
| Issue or PR metadata drift | Current state contradicts an authoritative value | Correct the deterministic metadata or request final clarification |
| Validation state changes | Current required check evidence | Reconcile pass/fail/pending state without changing the requirement |
| Review or approval changes | Current review and approval evidence | Reconcile review status and route unresolved findings |
| Post-integration closeout | Verified merged PR and source issue | Allow closeout CI to run; verify or complete the administrative transaction without duplication |
| Closeout exception | Failed, partial, missing, or contradictory closeout evidence | Create/update one bounded exception; clarify, remediate, verify, and resolve housekeeping |
| Non-merge disposition | Explicit cancellation, duplicate, supersession, not-planned, or administrative-only completion authority | Apply the authorized state, labels, links, comments, and queue effect |
| Successor unblock | Completed predecessor and eligible successor | Activate one task in the same lane or record halt |
| Final clarification | Administrative conflict that does not change objectives | Record the authoritative answer, apply only the resulting administrative mutations, and verify |
| Silent stall | Valid work exists but no active eligible task or no pickup evidence | Correct transaction, inspect loop health, or create remediation |
| Poll failure | Local loop reports failure | Inspect persistent error log; do not treat as idle success |
| Launch-halting defect | Process failure prevents progress | Create/update bounded Ops remediation issue |
| Reporting drift | Dashboard, PMO, parent, or audit state lags live authority | Correct when deterministic; do not block execution for cosmetic or optional reporting lag |

## Lane-aware dispatcher checklist

For every approved lane:

1. Identify the component/program/project master and current child.
2. Check open source issues, PRs, CI, review threads, handoffs, predecessors, successors, component-branch drift, and administrative exceptions.
3. Confirm no more than one active local Cursor task exists in that lane unless the lane authority explicitly permits internal parallelism.
4. Confirm the active source issue is open, assigned to `wdhunter645`, and has `agent:cursor` + `handoff:ready` when local execution is expected.
5. If PR work is active, assign the PR to `wdhunter645`.
6. Ensure the latest Chat-directed action is one canonical response/resume pair on the source issue.
7. Confirm the resume has one bounded action and current branch/PR references.
8. Reconcile deterministic status, routing, handoff, assignment, parent/child, PMO, reporting, and closeout metadata to existing authority.
9. Do not report Cursor active until a later comment, commit, or PR update proves pickup.
10. Do not halt an independent approved lane because another lane is blocked or has administrative debt.
11. If no action is eligible, record the halt reason.
12. If the lane is blocked by a process defect, create/update remediation.

## Administrative control procedure

Administrative work uses the stable contract in `docs/reference/operations/administrative-control-lane-contract.md`.

Before mutation:

1. Identify the exact administrative fact to reconcile.
2. Identify the canonical policy, source Issue, PR, validation, review, closeout, dependency, or clarification evidence that establishes the correct state.
3. Confirm the action does not alter project objectives, acceptance criteria, technical design, delivery model, validation, approval, priority, or implementation scope.
4. Confirm the action affects only administrative state and the intended Issue, PR, parent, successor, dashboard, or exception record.
5. Re-read current live state immediately before mutation.
6. Suppress the action when the intended state already exists or a newer event supersedes it.

After mutation:

1. Re-read the changed surface.
2. Confirm labels, state, assignment, links, comments, and queue effects match the intended result.
3. Record evidence, successor, or exact halt reason.
4. Resolve or supersede any bounded exception record when all housekeeping is complete.

## Allowed administrative actions

When mechanically provable and authorized, dispatchers may:

- comment on Issues and PRs;
- restore, remove, or replace lifecycle, routing, handoff, PMO, and reporting labels;
- assign or unassign the source Issue and active PR;
- correct parent/child, predecessor/successor, project/program, and closeout references;
- post canonical response/resume markers;
- clear stale predecessor metadata;
- correct terminal labels and issue state under an authorized closeout or disposition rule;
- create or update Ops remediation and closeout-exception Issues;
- route the next eligible task in an already approved lane;
- update actively governed dashboard or reporting metadata;
- record and apply final administrative clarifications;
- complete housekeeping after CI or human review has established the technical result.

## Prohibited administrative actions

Dispatchers must not:

- invoke Cursor Cloud without explicit runtime authority;
- remove active wake labels from work still assigned to Cursor without a valid transition;
- merge PRs without bounded authority;
- close source or parent issues before verified integration and canonical closeout, except an explicitly authorized non-merge disposition;
- alter CI gates, validation requirements, or approval requirements;
- change project objectives, acceptance criteria, design, file allowlists, delivery model, priority, dependency order, or successor order without the owning authority;
- delete branches or tags;
- modify production configuration, secrets, credentials, code, workflows, or external infrastructure as an administrative action;
- start an unapproved lane;
- treat reporting lag as an execution blocker when no mandatory invariant is affected;
- guess through ambiguity.

## Cursor-to-Chat requirement

Cursor must use canonical `CHATGPT HANDOFF` when stopping for:

- review;
- requested decision;
- blocker;
- PR opened;
- remediation pushed;
- PR ready;
- completion or closeout request.

Noncanonical status prose is informational only. It does not authorize review completion, integration, closeout, queue advancement, or final administrative resolution.

## Chat-to-Cursor requirement

A PR review alone is insufficient when the PR is unassigned or the source issue is the primary poller surface. Every Cursor-directed decision must be mirrored on the source issue through the canonical response/resume transaction.

One decision means:

```text
one CHATGPT RESPONSE
one LOCAL CURSOR RESUME
one bounded action
```

Do not issue multiple rapid comment pairs for the same decision.

## Final clarification procedure

The administrative lane owns final clarification management only for questions whose answers select among already-authorized administrative outcomes.

1. Record the exact contradictory or missing administrative fact.
2. Identify the owning authority and evidence already available.
3. Ask one bounded clarification when evidence is insufficient.
4. Route to Chat for routine administrative judgment.
5. Route to Bill only when the answer changes product intent, priority, cost, credentials, business authority, destructive or production posture, or resolves an irreconcilable authority conflict.
6. Persist the answer on the authoritative Issue, PR, or canonical document.
7. Apply only the administrative mutations directly resulting from that answer.
8. Verify and close the clarification or exception record.

Do not use an administrative clarification to change objectives, design, acceptance criteria, delivery model, validation, approval, or implementation scope.

## Scheduled repository watches

Scheduled ChatGPT watches are repository-wide dispatcher cycles, not session-, project-, Issue-, or alert-bound assistants.

Every scheduled run must initialize the GitHub connector, load current repository authority, inspect the complete approved queue and PR state, consider alerts as hints rather than scope, and select the highest-priority safe action across all lanes.

They may, when authorized:

- perform the allowed administrative actions above;
- answer routine handoffs and final clarifications;
- inspect and disposition review and validation blockers;
- reconcile incomplete closeout transactions;
- activate successors in approved lanes;
- preserve independent parallel execution.

They must use idempotency and re-check expected state immediately before mutation. Multiple watchers may inspect the repository, but only one may claim the same action revision.

## Closeout rule

A source issue that delivered a PR may close only after all of the following:

1. PR merge/integration is verified by GitHub state and merge SHA.
2. Required post-integration checks or component validation are dispositioned.
3. ChatGPT, Bill, or authorized deterministic closeout CI records the closeout transaction.
4. Cursor wake labels are removed or replaced with the next authorized routing state.
5. Successor or halt disposition is recorded.
6. Actively governed parent, project, program, dashboard, and exception state is reconciled or explicitly marked not applicable.

Green checks, approval, mergeability, or “ready for review” do not constitute integration.

Successful closeout CI is the primary merge-triggered administrative actor. The dispatcher verifies the result and intervenes only for missing, failed, partial, contradictory, non-merge, or later-detected housekeeping work.

## Poller alignment

The local poller documentation and prompt must recognize:

- `CHATGPT HANDOFF`;
- `CHATGPT RESPONSE`;
- `CHATGPT CLOSEOUT`;
- `LOCAL CURSOR RESUME`.

Legacy `### AGENT HANDOFF` may be a temporary alias but cannot remain the sole prompt marker.

Poll errors must be persisted locally rather than discarded. A failed poll is not equivalent to `fresh: 0`.

## Recovery from a missed wake

Before changing labels:

1. Verify issue is open and assigned.
2. Verify both wake labels.
3. Verify one current canonical response/resume pair.
4. Verify loop process and authentication.
5. Inspect the poll error log and saved watermark.

Only then may an authorized operator pulse `handoff:ready` by removing and re-adding it. Record why the pulse was necessary. Label pulsing is recovery, not normal dispatch.

## Mutation authority

Allowed when Bill directly authorizes active repository dispatch or when current policy and source-Issue evidence mechanically authorize the administrative action:

- comments;
- issue/PR assignment;
- routing, lifecycle, PMO, reporting, and closeout labels;
- deterministic parent/child and predecessor/successor reconciliation;
- clearing stale blockers and handoff state;
- opening/updating remediation and closeout-exception Issues;
- authorized non-merge disposition and final housekeeping;
- closing duplicate or superseded PRs after review.

Requires separate bounded authority:

- merge;
- source/parent issue closure outside deterministic closeout or explicit non-merge disposition;
- branch/tag deletion;
- CI gate or validation changes;
- production configuration changes;
- priority, objective, design, acceptance, delivery-model, dependency, or successor changes;
- unapproved parallel execution.

## Regression cases

The protocol must prevent recurrence of:

- completed predecessor with blocked successor;
- eligible task missing wake labels;
- prose-only Cursor direction;
- `LOCAL CURSOR RESUME` used as the decision itself;
- multiple actions in one resume;
- duplicate response/resume bursts;
- PR-only review that does not reach the source issue;
- issue closed before PR integration;
- poll failure interpreted as no activity;
- local Cursor idle until Bill manually says “there is work in the repo”;
- administrative reporting becoming a repository-wide execution lock;
- closeout CI succeeding while a second actor duplicates the same transaction;
- failed closeout exceptions remaining unresolved indefinitely;
- administrative authority being used to change project objectives or technical scope;
- one blocked lane idling independent approved lanes;
- session-bound watchers missing repository-wide work.

## Related authorities

- `docs/governance/OPERATIONS-AND-RECOVERY.md`
- `docs/reference/operations/administrative-control-lane-contract.md`
- `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- `docs/how-to/cursor/github-poll-wake-loop.md`
- `docs/ops/pmo/github-issue-closeout-protocol.md`
- `docs/governance/AGENT-TEAM.md`
