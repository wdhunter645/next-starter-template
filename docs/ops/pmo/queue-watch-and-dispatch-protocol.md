---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: LGFC queue watch, canonical dispatch, local Cursor wake routing, silent-stall detection, lane-aware continuation, and process-remediation routing under the #2550 communication contract
Does Not Own: ChatGPT product automation configuration, GitHub workflow implementation, merge authority, production configuration, branch deletion, or uncontrolled issue mutation
Canonical Reference: /docs/ops/ai/chatgpt-cursor-handoff-workflow.md
Related Issues: #2550, #2546, #2294, #2492, #2396
Last Reviewed: 2026-07-16
---

# Queue Watch and Dispatch Protocol

## Purpose

Keep every approved LGFC execution lane moving by converting GitHub state into one deterministic next action without inventing a second communication model.

Handoff markers are inert until a dispatcher, poller, or operator consumes them under matching current labels.

## Current operating truths

- GitHub Issues are executable task authority.
- Local Cursor is the default runtime.
- Never use `@cursor` for local work.
- Labels are current state; comments are durable events.
- Primary Cursor pickup requires `agent:cursor` + `handoff:ready`.
- Assignee and PR assignment are convenience signals only, not pickup authority.
- Parallel Model B lanes are authorized; maintain at most one active local Cursor claim per lane unless lane authority permits internal parallelism.
- Routine non-`main` PR progress uses `CURSOR STATUS` / `CURSOR COMPLETE` and does not create a ChatGPT stop.
- `CHATGPT HANDOFF` is reserved for genuine blockers, decisions, exceptions, and production/`main` boundaries.
- A source issue cannot close before verified integration evidence and canonical closeout.

## Canonical dispatch transactions

### Assign Cursor work (routine)

```text
1. Confirm the source issue is open and executable.
2. Post CURSOR ASSIGNMENT with one bounded action.
3. Set agent:cursor + handoff:ready.
4. Do not require assignee-only pickup.
5. Do not claim pickup until Cursor posts CURSOR ACK or equivalent claim evidence.
```

### Resume after genuine ChatGPT escalation

```text
1. Confirm the unresolved CHATGPT HANDOFF and handoff ID.
2. Post CHATGPT RESPONSE (or CLOSEOUT).
3. Remove agent:ChatGPT and resolved blocked/needs-human labels.
4. Restore agent:cursor + handoff:ready.
5. Optional recovery: LOCAL CURSOR RESUME referencing the exact response.
6. Cursor claims with CURSOR ACK before continuing.
```

Do not post duplicate response pairs for the same decision. A replacement must explicitly supersede the prior instruction.

## Trigger classes

| Trigger | Evidence | Dispatcher action |
| --- | --- | --- |
| Cursor assignment needed | Eligible task selected | Post `CURSOR ASSIGNMENT`; set ready labels |
| Routine Cursor progress | `CURSOR STATUS` / `CURSOR COMPLETE` | No ChatGPT stop; monitor; activate successor when eligible |
| Genuine Cursor escalation | `CHATGPT HANDOFF` | Review, decide, respond |
| Successor unblock | Predecessor integrated on project branch | Activate next eligible task without routine human stop |
| Production / `main` boundary | Promotion PR or needs-human production state | Route to ChatGPT/Bill; never auto-merge `main` |
| Silent stall | Eligible ready task with no ACK/pickup | Correct labels/assignment event; inspect poller health |
| Launch-halting defect | Process failure prevents progress | Create/update bounded Ops remediation issue |

## Lane-aware dispatcher checklist

For every approved lane:

1. Identify the component/program/project master and current child.
2. Check open source issues, PRs, CI, predecessors, and component-branch drift.
3. Confirm no more than one `handoff:in-progress` local Cursor claim exists in that lane unless explicitly permitted.
4. Confirm the active executable issue has `agent:cursor` + `handoff:ready` or is correctly `handoff:in-progress`.
5. Ensure routine progress is not misrouted to ChatGPT.
6. On genuine escalation, require one canonical response before restoring Cursor ready state.
7. After non-`main` integration, activate the next eligible manifest task without a routine human prompt when project Go already exists.
8. If no action is eligible, record the halt reason.

## Cursor-to-Chat requirement

Cursor must use `CHATGPT HANDOFF` only for genuine stops listed in the handoff workflow.

Cursor must **not** use `CHATGPT HANDOFF` for:

- opening a non-`main` PR;
- a technically clean non-`main` PR;
- advisory/process-only findings without a real defect;
- authorized component integration availability;
- eligible successor activation.

## Closeout

- Non-`main` child integration: record evidence; activate successor; keep project continuous execution.
- Terminal/production closeout: `CHATGPT CLOSEOUT`, remove wake state, then close completed issues only after verified evidence.
- Never authorize automatic merge to `main` via labels or comments.

## Related authority

- Communication state machine: `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- Local poller how-to: `docs/how-to/cursor/github-poll-wake-loop.md`
- Future poller implementation project: #2294
