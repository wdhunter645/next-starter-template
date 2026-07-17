---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: LGFC queue watch, canonical handoff dispatch, local Cursor wake routing, silent-stall detection, lane-aware continuation, and process-remediation routing
Does Not Own: ChatGPT product automation configuration, GitHub workflow implementation, merge authority, production configuration, branch deletion, or uncontrolled issue mutation
Canonical Reference: /docs/ops/pmo/github-issue-closeout-protocol.md
Related Issues: #2396, #2391, #2386, #2360, #2361, #2363, #2364, #2359, #2376, #2380, #2492
Last Reviewed: 2026-07-13
---

# Queue Watch and Dispatch Protocol

## Purpose

Keep every approved LGFC execution lane moving by converting GitHub state into one deterministic next action without disrupting the local Cursor poll-wake loop.

Handoff markers are inert until a manual, scheduled, or repo-native dispatcher consumes them. Labels and comments make work detectable; they do not prove agent pickup or execution.

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

## Scheduled repository watches

Scheduled ChatGPT watches may scan the repository broadly, but intervention must follow this protocol.

They may, when authorized:

- comment on issues and PRs;
- restore `agent:cursor` and `handoff:ready`;
- assign the source issue and active PR to `wdhunter645`;
- post canonical response/resume markers;
- clear stale predecessor metadata;
- create/update Ops remediation issues;
- route the next eligible task in an already approved lane.

They must not:

- invoke Cursor Cloud;
- remove active wake labels from work still assigned to Cursor;
- merge PRs without bounded authority;
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

## Mutation authority

Allowed when Bill directly authorizes active repository dispatch:

- comments;
- issue/PR assignment;
- routing labels;
- clearing stale predecessor blockers;
- opening/updating remediation issues;
- closing duplicate or superseded PRs after review.

Requires separate bounded authority:

- merge;
- source/parent issue closure;
- branch/tag deletion;
- CI gate changes;
- production configuration changes;
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
- local Cursor idle until Bill manually says “there is work in the repo.”

## Related authorities

- `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- `docs/how-to/cursor/github-poll-wake-loop.md`
- `docs/ops/pmo/github-issue-closeout-protocol.md`
- `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md`
