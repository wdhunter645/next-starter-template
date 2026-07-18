---
Doc Type: Operational Workflow
Audience: ChatGPT, Cursor, Bill
Authority Level: Agent-Specific Workflow
Owns: Canonical ChatGPT↔Cursor communication state machine, pickup/claim transitions, genuine-escalation handoffs, watcher/poller consumption, stale-event prevention, and Project #2294 runtime alignment
Does Not Own: Shared agent law, merge authorization, implementation allowlists, production design authority, credentials, repository settings, or automatic merge to main
Canonical Reference: /docs/governance/AGENT-TEAM.md
Related Issues: #2546, #2550, #2294, #2593-#2601
Last Reviewed: 2026-07-18
---

# ChatGPT / Cursor Handoff Workflow

## Purpose

Define one GitHub communication contract for LGFC repository work involving ChatGPT and local Cursor. Labels represent current routing state. Comments represent durable events and evidence. A comment without matching current labels is historical evidence, not executable authority.

## Non-negotiable boundaries

- GitHub Issues and current repository documents are authority.
- Cursor cannot approve or merge its own work.
- Automatic merge to `main` is prohibited.
- Project #2294 implements this contract; it must not invent a competing communication state machine.
- No OpenAI API or paid AI worker is required.

## Current-state labels

| Label | Meaning |
| --- | --- |
| `agent:cursor` | Cursor owns the next routine action. |
| `agent:ChatGPT` | ChatGPT owns a genuine review, decision, exception, or closeout action. |
| `handoff:ready` | An executable Cursor task exists but is unclaimed. |
| `handoff:in-progress` | Cursor has claimed and is executing the task. |
| `status:blocked` | A technical, scope, safety, or authority blocker exists. |
| `status:needs-human` | Bill or another external human action is required. |

Invariants:

1. `handoff:ready` and `handoff:in-progress` never coexist.
2. Only a dependency-eligible task carries Cursor wake state.
3. `agent:cursor` plus `handoff:ready` is necessary but not sufficient; the latest valid assignment/response event and manifest eligibility must agree.
4. Assignee-only, PR-only, and `agent:cursor`-only states do not authorize pickup.

## Canonical event markers

- `CURSOR ASSIGNMENT`: one bounded executable action.
- `CURSOR ACK`: Cursor claims the ready task and records branch/base.
- `CURSOR STATUS`: routine progress without ownership transfer.
- `CURSOR COMPLETE`: completion evidence and successor disposition.
- `CHATGPT HANDOFF`: genuine blocker, decision, exception, or production boundary.
- `CHATGPT RESPONSE`: bounded decision and resumable Cursor instruction.
- `CHATGPT CLOSEOUT`: terminal project or production disposition.

`LOCAL CURSOR RESUME` is a legacy recovery helper only. It cannot create authority.

## Required transitions

### Prepared → Cursor ready

1. Confirm project/task dependency eligibility.
2. Post `CURSOR ASSIGNMENT`.
3. Set `agent:cursor` and `handoff:ready`.

### Cursor ready → in progress

1. Re-read live labels and the latest valid event.
2. Cursor posts `CURSOR ACK` with issue, project, branch, and non-main base.
3. Replace `handoff:ready` with `handoff:in-progress`.
4. Persist the consumed event ID and lane claim.

### Routine non-main progress

Use `CURSOR STATUS` and `CURSOR COMPLETE`. Do not create a ChatGPT stop merely because a non-main PR opened, checks became green, component integration is eligible, or a successor can activate.

### Genuine escalation

Post `CHATGPT HANDOFF`, remove Cursor wake/execution labels, and add `agent:ChatGPT` plus the applicable blocked/needs-human state. Valid reasons are unresolved authority, material scope change, uncorrectable technical failure, safety/security, credential or repository-setting action, production approval, or explicit Bill decision.

### ChatGPT response → Cursor resume

Post `CHATGPT RESPONSE`, resolve the blocker labels, restore `agent:cursor` plus `handoff:ready`, and require a fresh `CURSOR ACK`.

### Non-main integration and successor

After verified technically clean integration to the project branch, activate the exact dependency-eligible successor without requiring a routine new project-level prompt. Final promotion to `main` remains Bill/ChatGPT-controlled.

## Cursor poller consumption

The local poller consumes only an open issue with:

- `agent:cursor`;
- `handoff:ready`;
- manifest/dependency eligibility;
- latest valid `CURSOR ASSIGNMENT` or resumable `CHATGPT RESPONSE`;
- no consumed event ID;
- no colliding active lane claim.

Repeated polling and restart must be idempotent.

## Broad ChatGPT watcher consumption

Every watcher run must initialize the GitHub connector, resolve the active repository and granted permissions, load current authority, and review repository state broadly. The scan includes active Issues, PRs, checks, reviews, handoffs, dependencies, component integration, closeout, workflow health, active claims, and dead letters.

Alerts are urgency and observability hints only. Alerts do not limit the broad scan, do not replace `agent:ChatGPT`/handoff authority, and do not create a decision. A watcher may find authorized ChatGPT work without an alert label. Each watcher selects at most one action, acquires a stable leased claim, re-reads live state, acts or yields, and records the result or exact halt reason.

## CI controller consumption

CI may normalize events, resolve state, evaluate lanes, plan one deterministic action, reconcile missed events, and emit bounded Alerts. Evaluation is read-only. Any mutation requires least privilege, an explicit action class, expected-state revalidation, and an idempotency key. CI never writes substantive ChatGPT decisions and never authorizes automatic merge to `main`.

## Continuous Model B execution

After one recorded project GO:

- linked tasks execute in dependency order;
- independent non-colliding lanes may proceed in parallel;
- child PRs target the project branch;
- technically clean eligible children may integrate at the non-production boundary;
- Cursor cannot self-approve;
- production promotion remains manual.

## Related procedures

- Queue watch and dispatch: `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
- Local poller: `docs/how-to/cursor/github-poll-wake-loop.md`
- Runtime controller contract: `docs/reference/ci/agent-routing-controller-contract.md`
- Operator runbook: `docs/how-to/agents/operate-agent-routing.md`
