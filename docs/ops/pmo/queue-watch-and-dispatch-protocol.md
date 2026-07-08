---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: LGFC queue watch, handoff marker dispatch, Cursor wake-label routing, silent-stall detection, and launch-halting process remediation routing
Does Not Own: ChatGPT product automation configuration, GitHub workflow YAML implementation, merge authority, issue closure authority, branch deletion, or uncontrolled automatic issue mutation
Canonical Reference: /docs/ops/pmo/github-issue-closeout-protocol.md
Related Issues: #2396, #2391, #2386, #2360, #2361, #2363, #2364, #2359, #2376, #2380
Last Reviewed: 2026-07-08
---

# Queue Watch and Dispatch Protocol

## Purpose

Define the minimum operational procedure that keeps LGFC launched work moving when GitHub issue state, handoff comments, PRs, labels, or closeout evidence require ChatGPT, Bill, or Cursor action.

This protocol exists because handoff markers alone do not wake ChatGPT, assign Cursor, unblock successor issues, or create remediation work. A marker is only executable when an authorized dispatcher or configured watch actually checks it and acts within its authority.

## Current known truth

- GitHub Issues are the executable source of truth for LGFC work.
- `agent:ChatGPT` and `CHATGPT HANDOFF` are deterministic watch markers, not live notifications by themselves.
- Cursor can post handoff comments and request labels, but Cursor does not own merge, closeout, relabeling, queue advancement, or child-issue creation unless a source issue explicitly grants that authority.
- ChatGPT can review, synthesize, comment, route, and perform authorized GitHub mutations only when the current chat/task actually invokes the GitHub connector or an explicit scheduled watch runs.
- A completed predecessor issue with successors still marked blocked is a queue-stall defect, not a harmless stale label.
- A successor issue described in prose as the next Cursor task is not actually routed to the Cursor loop unless its wake labels are set.
- The current Cursor wake-label contract for an active next task is:

```text
agent:cursor
handoff:ready
```

- A launch-halting process defect must be captured in an Ops issue or a bounded PR, not left only in chat.

## Intended final state

- Every launched queue has a visible dispatcher path: manual, scheduled, repo-native automation, or explicitly not available.
- Closed predecessors cannot silently leave successor issues blocked.
- `agent:ChatGPT` and `CHATGPT HANDOFF` markers are consumed by an actual review path or explicitly treated as manual-only markers requiring an operator check.
- Next Cursor tasks have both issue-body/comment disposition and the required Cursor wake labels.
- Launch-halting process defects create or update an Ops remediation issue before the workstream stalls.
- Queue continuation, halt, or remediation is recorded in GitHub-controlled surfaces before Cursor is expected to act.

## Trigger classes

The dispatcher must check these trigger classes for launched or launch-control work:

| Trigger class | Source evidence | Required dispatcher action |
| --- | --- | --- |
| ChatGPT handoff | Issue or PR comment beginning `CHATGPT HANDOFF`; `agent:ChatGPT` label | Review and respond in the issue/PR or route to Bill; do not leave marker unacknowledged. |
| Cursor task wake | Successor issue selected as the next active Cursor task | Set or verify `agent:cursor` and `handoff:ready`; do not rely on prose/comments alone. |
| PR review/merge queue | Open PR tied to active source issue | Review readiness, close duplicate/superseded PRs, merge only when authorized and gates/exceptions are acceptable. |
| Post-merge closeout | Merged PR and source issue state | Apply the GitHub Issue Closeout Protocol or record why closeout is blocked. |
| Merged PR with failed required pre-gate | Merge completed while a required PR-head check remained failed | Verify Post-Merge Detection created or updated a `post-merge-failure` remediation issue; use `docs/how-to/ci/merged-pr-failed-pre-gate-followup.md` manual fallback if not; halt queue advancement until dispositioned. |
| Successor unblock | Closed completed predecessor and open successor still blocked by that predecessor | Unblock, queue, explicitly halt successor, or create remediation; if routed to Cursor, set wake labels. |
| Silent stall | No active Cursor task after predecessor close; successors remain blocked, unlabeled, or missing wake labels | Create/update remediation issue and route next eligible work with required labels. |
| Launch-halting process failure | Any process defect preventing launch queue movement | Create/update Ops issue, document owner, stop condition, and next action. |

## Dispatcher operating modes

### Mode 1 — Manual dispatcher

Use when no configured scheduled watch or repo-native automation is available.

A human or ChatGPT session must explicitly run the dispatcher checklist:

```text
1. Review active project issue and child issue queue.
2. Search for open issues labeled agent:ChatGPT.
3. Search for recent CHATGPT HANDOFF comments.
4. Search for open PRs.
5. Check recently closed predecessor issues for successor disposition.
6. Check whether any successor still says Blocked Pending <closed predecessor>.
7. Route Cursor to the next active task or record halt.
8. If routing Cursor, verify both agent:cursor and handoff:ready are set.
9. Create/update remediation issue for any process gap that stops launch work.
```

Manual dispatcher mode is not background work. It runs only when Bill, ChatGPT, or another authorized operator explicitly invokes it.

### Mode 2 — Scheduled ChatGPT watch

Use only when Bill explicitly creates or authorizes a ChatGPT scheduled/condition watch.

Minimum prompt requirements:

```text
Check wdhunter645/next-starter-template for LGFC queue stalls, agent:ChatGPT issues, CHATGPT HANDOFF comments, open PRs needing review, closed predecessors with blocked successors, missing Cursor wake labels on next active tasks, and launch-halting process defects. Notify Bill only when action is needed. Do not mutate GitHub unless explicitly authorized.
```

The scheduled watch is advisory unless its prompt or a repository issue explicitly authorizes mutation.

### Mode 3 — Repo-native automation

Use only after an issue/PR implements and validates workflow or script behavior.

Repo-native automation may detect and report defects. It must not close issues, relabel, merge, delete branches, or advance queues unless the repository authority and source issue explicitly authorize that exact mutation class.

## Required dispatcher checklist for Phase 0 / Content Collection work

For parent #2359 and child tasks #2360 through #2365:

1. Verify whether the predecessor is closed completed.
2. Verify the successor issue body no longer says blocked by the completed predecessor.
3. Verify the successor issue has an active routing state or a documented halt reason.
4. Verify Cursor has exactly one next active issue unless Bill/ChatGPT authorizes parallel execution.
5. Verify the next active Cursor issue has both `agent:cursor` and `handoff:ready`.
6. Verify terminal tasks remain blocked until all predecessors complete.
7. Verify the parent/project issue remains open unless explicitly authorized for terminal closeout.
8. Verify process defects are represented by Ops issues and not only by chat messages.

## Regression case: #2360 to #2361 / #2363 / #2364

This case must be used to test future queue-watch fixes.

Observed defect:

- #2360 closed completed.
- #2361 remained `Blocked Pending #2360`.
- #2363 remained `Blocked Pending #2360`.
- #2364 remained `Blocked Pending #2360`.
- No live dispatcher notified ChatGPT or routed Cursor to the next active work item.
- After manual queue correction, #2361 was described as the next Cursor task but initially lacked `agent:cursor` plus `handoff:ready`, so the Cursor loop still did not wake.

Expected behavior:

- #2360 closeout identifies #2361, #2363, and #2364 as successors or dependents.
- #2361 becomes the next active Cursor task unless Bill/ChatGPT authorizes a different order.
- #2361 receives both `agent:cursor` and `handoff:ready` when routed to Cursor.
- #2363 and #2364 are marked unblocked or intentionally queued/halted.
- #2362 remains blocked behind #2361.
- #2365 remains blocked until #2360 through #2364 are complete.
- A process remediation issue is created if any of those actions cannot be completed.

## Remediation issue rule

Create or update an Ops remediation issue when any of the following are true:

- a predecessor is closed completed but a successor remains blocked by that predecessor;
- a handoff marker requiring ChatGPT action is not consumed by a configured watch or manual dispatcher;
- a process failure stops launch work and is only recorded in chat;
- a post-merge closeout packet lacks successor/queue disposition;
- a merged PR carried a failed required pre-merge check and no canonical remediation issue surfaced the condition;
- duplicate or superseded PRs remain open and obscure the active queue;
- the project has no active Cursor task after a predecessor closes and the queue should continue;
- a successor is described as the next Cursor task but lacks `agent:cursor` or `handoff:ready`.

The remediation issue must include:

```text
Problem:
Evidence:
Affected issue(s):
Expected queue state:
Actual queue state:
Required correction:
Owner / dispatcher:
Mutation authority:
Stop condition:
Regression test:
```

## Mutation authority

Default posture: detect and comment first; mutate only when authorized.

Allowed without additional issue-specific authorization when Bill directly instructs ChatGPT in the active chat:

- comment on issues or PRs;
- close duplicate or superseded PRs after review;
- open an Ops remediation issue;
- update issue body metadata to clear a completed predecessor blocker;
- add routing labels that match the issue owner and dispatcher decision, including `agent:cursor` and `handoff:ready` when routing the next active task to Cursor.

Not allowed without explicit bounded authority:

- merge PRs;
- close source issues;
- close parent/project/program issues;
- delete branches or tags;
- change CI gates;
- start parallel execution when the queue says serial;
- modify production runtime configuration.

## Immediate-use operating rule

Until repo-native automation or a scheduled ChatGPT watch is proven active, every launch-control work session must begin or end with this manual dispatcher check:

```text
Check active parent issue.
Check open child issues for stale predecessor blockers.
Check open PRs for duplicates, superseded branches, failed gates, or review-ready work.
Check agent:ChatGPT and CHATGPT HANDOFF markers.
Route exactly one next Cursor task unless parallel execution is authorized.
Verify the routed Cursor task has agent:cursor and handoff:ready.
Create/update remediation issue for any launch-halting process defect.
```

## Related authorities

- Merged PR with failed pre-gate follow-up: `/docs/how-to/ci/merged-pr-failed-pre-gate-followup.md`
- ChatGPT / Cursor handoff workflow: `/docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- GitHub issue closeout protocol: `/docs/ops/pmo/github-issue-closeout-protocol.md`
- PR lifecycle state machine: `/docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`
- Program queue and dependency map: `/docs/reference/pmo/lgfc-program-queue-and-dependency-map.md`
