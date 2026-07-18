---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: LGFC queue watch, canonical dispatch, local Cursor wake routing, broad ChatGPT review, silent-stall detection, lane-aware continuation, and process-remediation routing
Does Not Own: Product scheduling configuration, production approval, credentials, repository settings, destructive actions, or automatic merge to main
Canonical Reference: /docs/ops/ai/chatgpt-cursor-handoff-workflow.md
Related Issues: #2550, #2546, #2294, #2593-#2601
Last Reviewed: 2026-07-18
---

# Queue Watch and Dispatch Protocol

## Purpose

Keep approved LGFC execution lanes moving by converting live GitHub state into one deterministic next action without creating a second authority model.

## Operating truths

- GitHub Issues are executable task authority.
- Labels are current state; canonical comments are durable events.
- Local Cursor pickup requires `agent:cursor`, `handoff:ready`, dependency eligibility, and the latest valid assignment/response.
- Assignee, PR assignment, and alert state are convenience/priority signals only.
- Routine non-main progress does not create a ChatGPT stop.
- `CHATGPT HANDOFF` is reserved for genuine blockers, decisions, exceptions, and production boundaries.
- Any automatic merge to `main` is prohibited.

## Deterministic dispatcher transaction

1. Load current repository authority and the active project manifest.
2. Rebuild live Issue, PR, check, review, handoff, dependency, integration, closeout, workflow-health, claim, and dead-letter state.
3. Evaluate every approved lane; do not stop scanning because one lane is blocked.
4. Reject ambiguous, stale, contradictory, consumed, or colliding state.
5. Rank only existing authorized actions; never invent work to use capacity.
6. Select one action with a stable action key and expected-state revision.
7. Re-read live state immediately before mutation.
8. Apply a bounded mutation or record an exact halt/idle reason.
9. Preserve evidence and stop.

## Cursor assignment

1. Confirm the source issue is open, active, and dependency-eligible.
2. Confirm no colliding `handoff:in-progress` claim exists in the lane.
3. Post one bounded `CURSOR ASSIGNMENT`.
4. Set `agent:cursor` and `handoff:ready`.
5. Do not claim pickup until `CURSOR ACK` exists and the labels transition to `handoff:in-progress`.

## Cursor completion

On `CURSOR COMPLETE`, verify PR base, required checks, review state, component integration, and task acceptance evidence. Integrate only to the authorized non-main project branch. Activate only the exact manifest-eligible successor. Route terminal promotion to Bill/ChatGPT.

## Broad ChatGPT watcher cycle

Every watcher cycle must:

1. initialize the GitHub connector and discover granted capabilities;
2. load current repository authority;
3. inspect repository status broadly rather than querying only alerts or `agent:ChatGPT`;
4. include active Issues, PRs, checks, reviews, dependencies, handoffs, component integration, closeout, workflow health, claims, and dead letters;
5. use Alerts as priority hints only;
6. rank candidates by safety, priority, dependency-unblock value, objective impact, and role ownership;
7. acquire one stable leased claim;
8. re-read live state;
9. perform the full connector-supported action or yield;
10. record `CHATGPT WATCH RESULT` or the exact halt/capability reason.

A watcher must not report “no action” solely because no alert or `agent:ChatGPT` label exists.

## Trigger classes

| Trigger | Action |
| --- | --- |
| Eligible Cursor task | Assign and set ready labels. |
| Ready task without ACK | Verify event/poller health; emit one deduplicated alert after threshold. |
| Routine Cursor progress | Monitor without ownership transfer. |
| Genuine handoff | ChatGPT reviews and responds. |
| Green eligible non-main PR | Integrate only when the approved mode and expected state permit. |
| Integrated predecessor | Activate exact successor. |
| Required CI failure | Classify; rerun only an authorized transient failure. |
| Ambiguous/permanent failure | Record one dead letter and escalate safely. |
| Production or repository-setting boundary | Route to Bill/ChatGPT; never auto-merge `main`. |

## Lane and collision rules

- Serial predecessors remain serial.
- Independent non-colliding lanes may proceed.
- One active local Cursor claim is allowed per lane unless the manifest explicitly permits more.
- File/Issue mutation overlap blocks concurrent action.
- Earlier unexpired watcher claims win; later watchers yield.
- Expired claims may be superseded only after live-state recheck.

## Alerts and idle evidence

Alerts are durable, revision-keyed, deduplicated, and non-authoritative. Every approved idle lane records a precise reason such as dependency blocked, awaiting ACK, required check running, review requested, production approval required, claim collision, or connector capability unavailable.

## Disable and rollback

Set mode to `disabled`, disable scheduled mutation, stop the local poller while preserving state, disable watchers, expire active claims, disable non-main integration, and restore manual assignment/review/closeout. Preserve all Issues, comments, manifests, Alerts, claims, dead letters, and reports.

## Related authority

- Handoff state machine: `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- Local poller: `docs/how-to/cursor/github-poll-wake-loop.md`
- Runtime contract: `docs/reference/ci/agent-routing-controller-contract.md`
- Operator runbook: `docs/how-to/agents/operate-agent-routing.md`
