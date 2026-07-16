---
Doc Type: Operational Workflow
Audience: ChatGPT, Cursor, Bill
Authority Level: Agent-Specific Workflow
Owns: Canonical ChatGPT↔Cursor communication state machine for LGFC repository work — label meanings, comment event markers, pickup/claim transitions, genuine-escalation handoffs, watcher/poller consumption rules, and stale-event prevention
Does Not Own: Shared agent law, merge authorization, implementation allowlists, production design authority, PR lifecycle gate implementation, Cursor Cloud billing, or local poller script trees outside the repository
Canonical Reference: /docs/governance/AGENT-TEAM.md
Related Issues: #2546, #2550, #2294, #2492, #2396
Last Reviewed: 2026-07-16
---

# ChatGPT / Cursor Handoff Workflow

## Purpose

Define one target-state GitHub communication contract for LGFC repository work involving ChatGPT and local Cursor.

**Labels represent current routing/execution state.**  
**Issue comments represent durable events, instructions, and evidence.**

A comment without matching current labels is historical evidence, not executable authority.

## Authority and promotion boundary

- GitHub Issues and current repository documents remain operational authority.
- This contract is the target-state communication model for Project #2546 on
  `component/pmo-project-autonomous-delivery`.
- It becomes repository-wide production governance only after approved promotion to `main`.
- Project #2294 must consume this contract for polling/pickup/persistence rather than inventing a competing model.
- Cursor never self-approves or self-merges.
- Automatic merge to `main` is prohibited.

## Label meanings (current state)

| Label | Meaning |
| --- | --- |
| `agent:cursor` | Cursor owns the next action. |
| `agent:ChatGPT` | ChatGPT owns the next action. |
| `handoff:ready` | An executable Cursor task is available but unclaimed. |
| `handoff:in-progress` | Cursor has claimed and is executing the task. |
| `status:blocked` | Genuine technical, scope, safety, or authority blocker. |
| `status:needs-human` | Bill or another external human action is required. |

Invariants:

- After a completed transition, exactly one of `agent:cursor` or `agent:ChatGPT` is active.
- `handoff:ready` and `handoff:in-progress` must not coexist.
- Only the current executable task carries `handoff:ready` / `handoff:in-progress`.

## Comment markers (events)

| Marker | Purpose |
| --- | --- |
| `CURSOR ASSIGNMENT` | Dispatcher provides executable work and bounded authority. |
| `CURSOR ACK` | Cursor claims the task and records branch identity. |
| `CURSOR STATUS` | Routine progress; no ChatGPT action requested. |
| `CURSOR COMPLETE` | Task evidence, PR/integration result, and successor disposition. |
| `CHATGPT HANDOFF` | Genuine blocker, decision, exception, or production-boundary request. |
| `CHATGPT RESPONSE` | Decision and resumable Cursor instruction. |
| `CHATGPT CLOSEOUT` | Terminal project or production disposition. |

`LOCAL CURSOR RESUME` is a **legacy/recovery** wake helper. It is not required for launched Model B continuous execution after `CURSOR ASSIGNMENT` + `agent:cursor` + `handoff:ready`. Prefer ASSIGNMENT/ACK. If used after a `CHATGPT RESPONSE`, it must reference that response and must not invent new authority.

## Required state transitions

### 1. Prepared → Cursor ready

1. Dispatcher posts `CURSOR ASSIGNMENT`.
2. Set `agent:cursor` + `handoff:ready`.
3. Do not require assignee-only pickup.

### 2. Cursor ready → Cursor in progress

1. Cursor posts `CURSOR ACK` with issue, project, branch, and project-branch base.
2. Remove `handoff:ready`; add `handoff:in-progress`.

### 3. Routine implementation / non-`main` PR progress

1. Cursor posts `CURSOR STATUS` or `CURSOR COMPLETE`.
2. Keep `agent:cursor` + `handoff:in-progress`.
3. **Do not** post `CHATGPT HANDOFF` merely because:
   - a non-`main` PR opened;
   - a non-`main` PR became technically clean;
   - advisory findings exist without a real defect;
   - authorized component integration is available;
   - an eligible successor can begin.

### 4. Genuine escalation

1. Cursor posts `CHATGPT HANDOFF` with a stable handoff ID and required fields.
2. Remove Cursor wake/execution labels (`agent:cursor`, `handoff:*`).
3. Add `agent:ChatGPT` and `status:blocked` or `status:needs-human` as applicable.

Reserve `CHATGPT HANDOFF` for:

- unresolved authority conflict;
- material scope change;
- uncorrectable technical failure;
- safety or security concern;
- external credential or repository-setting requirement;
- production or `main` approval boundary;
- explicit Bill decision.

### 5. ChatGPT decision → Cursor resume

1. ChatGPT posts `CHATGPT RESPONSE` referencing the handoff ID and one bounded next action.
2. Remove `agent:ChatGPT` and resolved `status:blocked` / `status:needs-human`.
3. Restore `agent:cursor` + `handoff:ready`.
4. Cursor claims again with `CURSOR ACK` before continuing.

### 6. Technically clean non-`main` child integration

1. Integration automation or ChatGPT records integration evidence.
2. Activate the eligible successor via `CURSOR ASSIGNMENT` (or equivalent label transition) **without** a routine human approval stop.
3. Cursor continues under the launched project Go decision.

### 7. Final production boundary

1. Route to `agent:ChatGPT` and `status:needs-human` when Bill/ChatGPT production approval is required.
2. Never add a label or comment that authorizes automatic merge to `main`.

## Required marker fields

### CURSOR ASSIGNMENT

```text
CURSOR ASSIGNMENT
Issue: #<issue>
Project: #<project>
Runtime: local
Base: <component/... or other non-main base>
Bounded next action:
- <one executable action>
Authority / allowlist:
- <paths or reference>
```

### CURSOR ACK

```text
CURSOR ACK
Issue: #<issue>
Project: #<project>
Runtime: local
Branch: <working branch>
Base: <project branch>
Claim: handoff:ready → handoff:in-progress
```

### CURSOR STATUS / CURSOR COMPLETE

```text
CURSOR STATUS | CURSOR COMPLETE
Issue: #<issue>
Project: #<project>
Branch: <branch>
PR: <number or none>
Base: <base>
Summary:
- <progress or completion evidence>
Validation:
- <commands and results>
Successor:
- <next issue, halt reason, or none>
```

Routine STATUS/COMPLETE must not transfer ownership to ChatGPT unless they are replaced by a `CHATGPT HANDOFF`.

### CHATGPT HANDOFF

```text
CHATGPT HANDOFF
Handoff ID: <stable-id>
Issue: #<issue>
Project: #<project>
Branch: <branch>
PR: <number or none>
Status: blocked | needs-human | decision-required
Exact stop reason:
- <one reason>
Decision requested:
- <one decision>
Evidence:
- <paths, PR, checks>
Safe options:
- <A/B/C>
Current labels:
- <list>
Recommended next action:
- <one action>
```

### CHATGPT RESPONSE / CLOSEOUT

```text
CHATGPT RESPONSE | CHATGPT CLOSEOUT
Handoff ID: <stable-id>
Issue: #<issue>
Decision:
- <decision>
Next Cursor action (if any):
- <one bounded action or stop>
```

## Watcher and poller consumption

- Cursor pickup keys on **`agent:cursor` + `handoff:ready`** plus manifest/task eligibility when a project manifest exists.
- Do **not** treat assignee-only, PR-update-only, or `agent:cursor`-only as a new pickup signal.
- Status monitoring may inspect `handoff:in-progress` issues but must not claim a second colliding Cursor task.
- ChatGPT watches key on `agent:ChatGPT` plus the latest unresolved `CHATGPT HANDOFF`, production-boundary state, or explicit `main`-target review request.
- Ignore stale comments superseded by later responses or label transitions.
- Repeated polling must be idempotent: no repost, relabel, or reactivation of already-consumed events.

## Continuous Model B execution

After one recorded project-level Go on a complete package:

- Cursor may execute linked tasks in dependency order without a new routine launch prompt.
- Child PRs target the project branch, not `main`.
- Technically clean eligible children may auto-integrate into the project branch.
- Cursor still cannot approve or merge its own work.
- Final promotion to `main` remains Bill/ChatGPT-approved.

## Related procedures

- Local poller operation: `docs/how-to/cursor/github-poll-wake-loop.md`
- Queue watch/dispatch: `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
- Runtime selection: `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md`
- Cursor execution contract: `docs/reference/pmo/lgfc-cursor-execution-contract.md`
