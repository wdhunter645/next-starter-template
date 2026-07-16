---
Doc Type: How-To
Audience: Bill, ChatGPT, Cursor, LGFC maintainers
Authority Level: Operational Authority
Owns: Local Cursor GitHub poll-wake loop operation aligned to the canonical communication state machine
Does Not Own: Poller script implementation in `~/.cursor/github-poller/`, merge authority, GitHub webhook configuration, or cloud agent billing
Canonical Reference: /docs/ops/ai/chatgpt-cursor-handoff-workflow.md
Related Issues: #2550, #2546, #2294, #2492, #2398
Last Reviewed: 2026-07-16
---

# Cursor local GitHub poll-wake loop

## Purpose

Document local Cursor GitHub poll-wake operation against the canonical communication contract in `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`.

## Authority boundary

Until that contract is promoted to `main`, treat this as target-state guidance for Project #2546 / component-branch work. Project #2294 implements durable poller/pickup behavior against the same contract.

## Current known truth

- Authoritative Cursor pickup requires an open issue with **`agent:cursor` + `handoff:ready`**.
- Assignee state, PR updates, and `agent:cursor` alone are **not** pickup authority.
- Labels are current state; comments are durable events.
- A comment without matching current labels is historical evidence only.
- Labels/comments do not prove Cursor began work.
- `@cursor` is a cloud invocation and is not a local wake mechanism.

## Components

| Path | Role |
| --- | --- |
| `~/.cursor/github-poller/poll-github.mjs` | Single poll through `gh`; emits JSON |
| `~/.cursor/github-poller/poll-wake-loop.sh` | Repeating poll and wake wrapper |
| `~/.cursor/github-poller/state.json` | Watermark and seen-event state |
| `~/.cursor/github-poller/README.md` | Local operator reference |

Local scripts may lag this document until #2294 reconciliation. Operators must not widen pickup rules beyond this contract.

## Detection rules (target state)

| Trigger | Rule |
| --- | --- |
| Cursor pickup queue | Open issue labeled `agent:cursor` **and** `handoff:ready` |
| In-progress monitoring | Open issue labeled `handoff:in-progress` may be inspected, never dual-claimed |
| ChatGPT escalation queue | Open issue labeled `agent:ChatGPT` with unresolved `CHATGPT HANDOFF` (ChatGPT/dispatcher concern, not Cursor pickup) |

Deprecated as pickup authority (do not use for new work):

- assigned-issue-only matches;
- assigned-PR-only matches;
- `agent:cursor` without `handoff:ready`.

## Preferred routing bundle

1. Open source issue.
2. Post `CURSOR ASSIGNMENT` with one bounded action.
3. Set `agent:cursor` + `handoff:ready`.
4. Local poller/operator wakes on those labels.
5. Cursor posts `CURSOR ACK` and transitions to `handoff:in-progress`.
6. Cursor posts `CURSOR STATUS` / `CURSOR COMPLETE` for routine progress.
7. Use `CHATGPT HANDOFF` only for genuine escalation; ChatGPT replies with `CHATGPT RESPONSE` and restores `agent:cursor` + `handoff:ready` when Cursor should continue.

`LOCAL CURSOR RESUME` is optional recovery after a ChatGPT response. It is not required for launched Model B continuous execution.

## Required marker alignment

Recognize:

- `CURSOR ASSIGNMENT`
- `CURSOR ACK`
- `CURSOR STATUS`
- `CURSOR COMPLETE`
- `CHATGPT HANDOFF`
- `CHATGPT RESPONSE`
- `CHATGPT CLOSEOUT`

Legacy `LOCAL CURSOR RESUME` / `### AGENT HANDOFF` may be accepted only as migration aliases.

After a wake, Cursor must:

1. Open the qualifying source issue.
2. Confirm `agent:cursor` + `handoff:ready` still present.
3. Post `CURSOR ACK` and claim (`handoff:in-progress`).
4. Execute the bounded assignment.
5. Return `CURSOR STATUS` / `CURSOR COMPLETE`, or `CHATGPT HANDOFF` only for a genuine stop.

Do not stop for ChatGPT merely because a non-`main` PR opened or became technically clean.

## Idempotency and stale events

- Persist consumed event IDs / comment IDs in local state.
- Ignore already-consumed events on restart.
- Ignore comments whose required labels are no longer present.
- Never claim a second colliding Cursor task while one `handoff:in-progress` task is active in the same lane.

## Loop behavior

`poll-wake-loop.sh [minutes]` accepts intervals from 2 through 12 minutes and defaults to 5.

Expected wake output:

```text
AGENT_LOOP_TICK_github_poll {"fresh":N,"prompt":"..."}
```

A wake means qualifying activity was detected. It does not authorize merge, broaden scope, or prove execution started.

## Stop conditions

Stop and escalate when:

- pickup labels are missing or contradictory;
- a second colliding task would be claimed;
- required credentials or repository settings are missing;
- production/`main` approval is required;
- authority sources conflict.
