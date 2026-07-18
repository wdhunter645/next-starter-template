---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: LGFC queue watch, canonical handoff dispatch, local Cursor wake routing, silent-stall detection, lane-aware continuation, and process-remediation routing
Does Not Own: ChatGPT product automation configuration, GitHub workflow implementation, merge authority, production configuration, branch deletion, or uncontrolled issue mutation
Canonical Reference: /docs/ops/pmo/github-issue-closeout-protocol.md
Related Issues: #2396, #2391, #2386, #2360, #2361, #2363, #2364, #2359, #2376, #2380, #2492, #2565, #2566, #1719, #2528
Last Reviewed: 2026-07-18
---

# Queue Watch and Dispatch Protocol

## Purpose

Keep every approved LGFC execution lane moving by converting GitHub state into one deterministic next action without disrupting the local Cursor poll-wake loop.

Handoff markers are inert until a manual, scheduled, or repo-native dispatcher consumes them. Labels and comments make work detectable; they do not prove agent pickup or execution.

## Communication and routing taxonomy

These namespaces are separate. No family substitutes for another.

| Namespace | Purpose | Primary markers | Who/what consumes | Causes |
| --- | --- | --- | --- | --- |
| **PMO portfolio metadata** | Dashboard placement and portfolio accounting | `pmo`; exactly one of `pmo:active` / `pmo:pipeline` / `pmo:closed`; exactly one `pmo:priority:*`; pipeline-stage when `pmo:pipeline`; `pmo:task` for child linkage | PMO dashboard / portfolio reports | Reporting and placement only — not execution wake |
| **PR classification** | How a PR is verified and labeled | Exactly one intent label (for example `docs-only`); PR class in the PR body | PR hygiene / intent labeler / reviewers | Verification depth and PR accounting — not PMO lifecycle and not Cursor wake |
| **ChatGPT review routing** | Genuine ChatGPT-owned next action | Label `agent:ChatGPT`; comment event `CHATGPT HANDOFF` (plus `CHATGPT RESPONSE` / `CHATGPT CLOSEOUT`) | Invoked dispatcher / scheduled watch / Bill | Review, decision, exception, or closeout only after a dispatcher/watch acts — not background notification alone |
| **Cursor execution routing** | Eligible local Cursor pickup | Labels `agent:cursor` **and** `handoff:ready` together; claim uses `handoff:in-progress` | Local Cursor poller / authorized dispatcher | Wake eligibility only when both labels are present with a valid assignment/response — prose naming Cursor as next does **not** wake or authorize execution |
| **Operational status** | Execution/verification bookkeeping | `status:*` (for example `status:in-progress`, `status:post-merge-verify`, `status:blocked`, `status:needs-human`, `status:complete`) | Operators, closeout automation, humans | Progress/reporting state — must not be conflated with PMO dashboard lifecycle (`pmo:active` / `pmo:pipeline` / `pmo:closed`) |

Non-substitution rules:

1. A PR intent label does not place work on the PMO dashboard.
2. `pmo:active` does not wake Cursor.
3. `agent:ChatGPT` without an invoked dispatcher/watch does not complete review.
4. `agent:cursor` alone, or narrative “Cursor should…”, does not authorize pickup.
5. `status:*` labels do not replace `pmo:*` lifecycle labels.

Canonical marker formats: `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`. Operator matrix: `docs/ops/reports/communication-routing-taxonomy-1719.md`.

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

| Trigger | Evidence | Dispatcher action |
| --- | --- | --- |
| Cursor handoff | Canonical `CHATGPT HANDOFF` on source issue | Review, decide, and record one canonical response |
| Cursor revision required | PR review or failing gate | Mirror the decision on source issue; assign issue/PR; post one response/resume pair |
| Cursor task wake | Eligible task selected in an approved lane | Verify labels, assignments, branch, runtime, and one action |
| PR review queue | Open PR tied to active source issue | Review scope, checks, threads, rollback, and target branch |
| Post-integration closeout | Verified merged PR and source issue | Post `CHATGPT CLOSEOUT`, remove wake state, then close completed issue |
| Successor unblock | Completed predecessor and eligible successor | Activate one task in the same lane or record halt |
| Silent stall | Valid work exists but no active eligible task or no pickup evidence | Correct transaction, inspect loop health, or create remediation |
| Poll failure | Local loop reports failure | Inspect persistent error log; do not treat as idle success |
| Launch-halting defect | Process failure prevents progress | Create/update bounded Ops remediation issue |

## Lane-aware dispatcher checklist

For every approved lane:

1. Identify the component/program/project master and current child.
2. Check open source issues, PRs, CI, review threads, handoffs, predecessors, and component-branch drift.
3. Confirm no more than one active local Cursor task exists in that lane unless the lane authority explicitly permits internal parallelism.
4. Confirm the active source issue is open, assigned to `wdhunter645`, and has `agent:cursor` + `handoff:ready`.
5. If PR work is active, assign the PR to `wdhunter645`.
6. Ensure the latest Chat-directed action is one canonical response/resume pair on the source issue.
7. Confirm the resume has one bounded action and current branch/PR references.
8. Do not report Cursor active until a later comment, commit, or PR update proves pickup.
9. If no action is eligible, record the halt reason.
10. If the lane is blocked by a process defect, create/update remediation.

## Cursor-to-Chat requirement

Cursor must use canonical `CHATGPT HANDOFF` when stopping for:

- review;
- requested decision;
- blocker;
- PR opened;
- remediation pushed;
- PR ready;
- completion or closeout request.

Noncanonical status prose is informational only. It does not authorize review completion, integration, closeout, or queue advancement.

## Chat-to-Cursor requirement

A PR review alone is insufficient when the PR is unassigned or the source issue is the primary poller surface. Every Cursor-directed decision must be mirrored on the source issue through the canonical response/resume transaction.

One decision means:

```text
one CHATGPT RESPONSE
one LOCAL CURSOR RESUME
one bounded action
```

Do not issue multiple rapid comment pairs for the same decision.

## Watcher profiles and mutation authority

Scheduled and invoked repository watches must declare an explicit profile. Detection alone never grants mutation.

| Profile | Authority | Allowed outcomes |
| --- | --- | --- |
| **Advisory watcher** | Detect and notify only | Comment with findings, halt reasons, and recommended next human/dispatcher action; **no** GitHub mutation beyond the advisory comment itself when comments are authorized for notice-only use, or report-only with zero GitHub writes when the prompt forbids comments |
| **Dispatcher watcher** | Bounded repository actions listed below, and only when the scheduled prompt or controlling repository issue explicitly authorizes those mutation classes | Perform the authorized bounded mutations, then stop |

Generic prompt language such as “monitor,” “review,” “watch,” or “notify” is **not** mutation authority. Mutation authority must appear in the actual scheduled watcher prompt or controlling repository issue as an explicit profile plus an explicit mutation-class list.

### Advisory watcher (detect-only)

An advisory watcher may:

- scan issues, PRs, labels, comments, CI, and predecessor/successor state;
- detect `agent:ChatGPT`, `CHATGPT HANDOFF`, stale predecessor blockers, missing Cursor wake labels, silent stalls, and poll failures;
- post an advisory finding comment **only when** the prompt/issue explicitly allows notice comments;
- recommend that a dispatcher watcher, Bill, or ChatGPT take a named next action.

An advisory watcher must not:

- assign issues or PRs;
- add, remove, or pulse routing labels;
- post `CHATGPT RESPONSE`, `CHATGPT CLOSEOUT`, or `LOCAL CURSOR RESUME`;
- clear predecessor blockers;
- create or update remediation issues;
- merge, close, reopen, delete branches, alter CI gates, mutate production, or start unapproved lanes.

If the advisory watcher finds actionable work it cannot advance, it must report the finding and stop. It must not repeatedly claim the lane is blocked while implying it will fix the block.

### Dispatcher watcher (bounded mutation)

A dispatcher watcher may perform **only** these bounded mutations, and only when each class is explicitly authorized by the scheduled prompt or controlling issue:

1. Comment on issues and PRs (including canonical ChatGPT response/closeout markers when ChatGPT decision authority applies).
2. Consume ChatGPT handoffs by posting exactly one `CHATGPT RESPONSE` or `CHATGPT CLOSEOUT` for one decision.
3. Post exactly one separate `LOCAL CURSOR RESUME` that references that exact response/closeout.
4. Assign the source issue and, when PR revision is active, the open PR to `wdhunter645`.
5. Restore or apply approved Cursor wake labels `agent:cursor` and `handoff:ready` on an already authorized lane task.
6. Clear stale completed-predecessor blockers (comments/labels/metadata that incorrectly keep a successor blocked after verified predecessor integration and closeout).
7. Create or update bounded Ops remediation issues when a launch-halting process defect cannot be corrected directly.
8. Route the next eligible task in an already approved lane using the canonical dispatch transaction.

A dispatcher watcher must not perform protected or owner-only actions without separate explicit authority:

- merge any PR;
- close source, parent, program, or umbrella issues;
- delete branches or tags;
- alter CI gates or required checks;
- mutate production configuration or secrets;
- invoke Cursor Cloud (`@cursor`) for local work;
- remove active wake labels from work still assigned to Cursor;
- start an unapproved lane or unauthorized parallel execution.

### How a watcher consumes specific signals

| Signal | Advisory action | Dispatcher action (when authorized) |
| --- | --- | --- |
| `agent:ChatGPT` without an invoked watch | Report that review routing markers are present but idle | Do not invent review completion; only act if the watch is the invoked consumer |
| `CHATGPT HANDOFF` awaiting reply | Report handoff age, issue, and requested ChatGPT action | Post one canonical `CHATGPT RESPONSE` or `CHATGPT CLOSEOUT`, then one `LOCAL CURSOR RESUME` when Cursor must continue |
| Stale predecessor blocker after predecessor is integrated and closed | Report the stale blocker and successor issue | Clear the stale blocker metadata and activate or resume the successor under lane rules |
| Missing Cursor wake labels on an eligible assigned task | Report missing `agent:cursor` and/or `handoff:ready` | Restore the approved wake pair; do not pulse labels as normal dispatch |
| Silent stall / no pickup evidence | Report idle lane and evidence gap | Correct the response/resume transaction or create/update remediation; do not claim Cursor is active without pickup evidence |

### Reusable watcher prompt patterns

**Detect-only (advisory):**

```text
Watcher profile: advisory
Mutation classes authorized: none
Allowed writes: none | notice-comment-only
Scan: open issues/PRs in approved lanes; handoffs; wake labels; predecessor blockers; poll health
On actionable finding: report finding + recommended owner; do not mutate GitHub beyond allowed writes
Do not interpret monitor/review/notify as mutation authority
```

**Bounded-dispatch (dispatcher):**

```text
Watcher profile: dispatcher
Mutation classes authorized:
- comment
- chatgpt-response-or-closeout
- local-cursor-resume
- assign-wdhunter645
- restore-cursor-wake-labels
- clear-stale-predecessor-blockers
- create-or-update-ops-remediation
- route-next-eligible-lane-task
Protected actions: merge, source/program close, branch delete, CI-gate change, production mutation, secrets, @cursor cloud, unapproved parallel lanes — DENIED unless separately named
Authority source: this prompt + controlling issue #<n>
Execute at most one canonical response/resume decision per finding cluster
```

Evidence report: `docs/ops/reports/watcher-action-mutation-contract-1719.md`.
Issue-mutation defaults remain governed by `docs/ops/reports/issue-mutation-closeout-permission-1724.md`.

## Scheduled repository watches

Scheduled ChatGPT watches may scan the repository broadly. Whether they may intervene depends on the watcher profile and explicit mutation classes above.

A **dispatcher** scheduled watch may, when those classes are authorized:

- comment on issues and PRs;
- restore `agent:cursor` and `handoff:ready`;
- assign the source issue and active PR to `wdhunter645`;
- post canonical response/resume markers;
- clear stale predecessor metadata;
- create/update Ops remediation issues;
- route the next eligible task in an already approved lane.

An **advisory** scheduled watch must not perform those mutations.

Neither profile may:

- invoke Cursor Cloud;
- remove active wake labels from work still assigned to Cursor;
- merge PRs without separate bounded authority;
- close source or parent issues before verified integration and canonical closeout;
- alter CI gates;
- delete branches;
- modify production configuration;
- start an unapproved lane.

## Closeout rule

A source issue that delivered a PR may close only after all of the following:

1. PR merge/integration is verified by GitHub state and merge SHA.
2. Required post-integration checks or component validation are dispositioned.
3. ChatGPT or Bill posts canonical `CHATGPT CLOSEOUT` on the source issue.
4. Cursor wake labels are removed or replaced with the next authorized routing state.
5. Successor or halt disposition is recorded.

Green checks, approval, mergeability, or “ready for review” do not constitute integration.

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

## Mutation authority (summary)

Default: deny GitHub mutation.

Allowed only to a **dispatcher watcher** (or Bill/ChatGPT with owner authority) when the prompt or controlling issue explicitly authorizes the matching class:

- comments;
- issue/PR assignment to `wdhunter645`;
- approved Cursor wake / routing labels;
- clearing stale predecessor blockers;
- opening/updating bounded Ops remediation issues;
- canonical `CHATGPT RESPONSE` / `CHATGPT CLOSEOUT` + `LOCAL CURSOR RESUME`;
- closing duplicate or superseded PRs after review (requires explicit class authorization).

Requires separate bounded owner authority (never inferred from advisory language):

- merge;
- source/parent/program issue closure;
- branch/tag deletion;
- CI gate changes;
- production configuration changes;
- secrets;
- unapproved parallel execution;
- Cursor Cloud invocation for local work.

Aligned with `#1724` issue-mutation defaults: Cursor and watchers remain default-deny for close/reopen/relabel/state mutation unless the active source issue or watcher authority explicitly grants the exact class.

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
- local Cursor idle until Bill manually says “there is work in the repo.”;
- advisory watchers repeatedly reporting actionable work while lacking mutation authority to advance it;
- interpreting “monitor,” “review,” or “notify” as dispatcher mutation authority.

## Related authorities

- `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- `docs/how-to/cursor/github-poll-wake-loop.md`
- `docs/ops/pmo/github-issue-closeout-protocol.md`
- `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md`
- `docs/ops/reports/issue-mutation-closeout-permission-1724.md`
- `docs/ops/reports/watcher-action-mutation-contract-1719.md`
