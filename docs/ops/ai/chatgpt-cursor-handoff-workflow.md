---
Doc Type: Operational Workflow
Audience: ChatGPT, Cursor, Bill
Authority Level: Agent-Specific Workflow
Owns: Cursor-to-ChatGPT handoff format, ChatGPT response format, local Cursor resume transaction, Cursor wake-label expectations, source-issue PR-open notification, review-trigger expectations, and marker/dispatcher boundaries for LGFC repository work
Does Not Own: Shared agent law, merge authorization, implementation authority, production design authority, PR lifecycle gates, ChatGPT account-level scheduled automation, Cursor cloud-agent invocation behavior, or repo-native watch implementation
Canonical Reference: /docs/ops/ai/CHATGPT-RULES.md
Related Issues: #2396, #2391, #2379, #2369, #2360, #2359, #2492
Last Reviewed: 2026-07-13
---

# ChatGPT / Cursor Handoff Workflow

## Purpose

Define the deterministic GitHub communication contract for LGFC repository work involving ChatGPT and local Cursor.

This file controls communication markers, required fields, wake-label expectations, and local resume behavior. It does not change implementation authority, review authority, merge authorization, closeout authority, PR lifecycle gates, or shared agent law.

## Authority

- Repository documents and GitHub Issues remain operational authority.
- Cursor executes assigned implementation or documentation tasks within source-issue scope.
- ChatGPT performs governance review, disposition decisions, PR readiness review, merge-readiness synthesis, and closeout control where applicable.
- Bill remains final authority for merge authorization, high-risk scope, and unclear project decisions.
- Queue watch and dispatcher behavior is controlled by `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`.
- Local poller behavior is documented by `docs/how-to/cursor/github-poll-wake-loop.md`.

## Mandatory communication transaction

When Cursor requires a ChatGPT decision and ChatGPT expects Cursor to continue, the complete transaction is:

```text
1. Cursor posts CHATGPT HANDOFF.
2. ChatGPT posts CHATGPT RESPONSE or CHATGPT CLOSEOUT.
3. Dispatcher verifies the source issue is open and has agent:cursor + handoff:ready.
4. Dispatcher posts a separate LOCAL CURSOR RESUME referencing the exact ChatGPT response.
5. Local Cursor performs exactly one bounded next action.
6. Cursor returns a new CHATGPT HANDOFF when the action reaches a review, blocker, PR-ready, or completion point.
```

All six steps are required unless the ChatGPT response explicitly says `stop` or `wait`.

`LOCAL CURSOR RESUME` is not a decision record. It is only a wake/context marker pointing to a prior canonical ChatGPT decision.

## Required task list

| Task | Owner | Trigger | Required surface | Required action | Stop condition |
| --- | --- | --- | --- | --- | --- |
| Execute assigned work | Cursor | Source issue is open, scope is clear, and issue has `agent:cursor` plus `handoff:ready` unless a manual/no-loop exception is documented | Source issue and working branch | Perform only the single action authorized by the latest valid resume transaction | Stop if scope, authority, target paths, labels, branch, or action are unclear |
| Post review handoff | Cursor | Review point, blocker, proposed disposition, completion point, PR-readiness point, or closeout request | Source issue comment | Post canonical `CHATGPT HANDOFF` with all required fields | Stop after handoff until ChatGPT responds |
| Announce opened or updated PR | Cursor | PR opened or materially revised after requested changes | Source issue comment | Post canonical `CHATGPT HANDOFF` with PR, branch, head SHA, changed scope, validation, and requested action | Stop until ChatGPT reviews or gives next direction |
| Propagate chat decisions | ChatGPT | Bill and ChatGPT decide direction in chat UI | Source issue, PR, or repository document | Record the decision in a canonical GitHub comment before Cursor is expected to act | Do not expect Cursor to act on chat-only context |
| Respond to handoff | ChatGPT | Canonical `CHATGPT HANDOFF` requires a decision | Source issue | Post canonical `CHATGPT RESPONSE` or `CHATGPT CLOSEOUT` | Stop if repository authority or evidence is insufficient |
| Resume local Cursor | Bill / ChatGPT / authorized dispatcher | Canonical Chat response expects Cursor action | Source issue | Verify open state and labels, then post separate `LOCAL CURSOR RESUME` referencing the exact response and containing one bounded action | Do not claim pickup or execution merely because the marker exists |
| Run queue/watch dispatcher | ChatGPT / Bill / authorized automation | Manual request, scheduled watch, or repo-native workflow | GitHub issues, PRs, labels, comments, and closeout evidence | Apply the queue-watch protocol and this transaction | Do not mutate GitHub unless authorized |
| Authorize merge readiness | ChatGPT / Bill | PR ready for merge-readiness review | PR and source issue | Verify scope, source issue, validation, review state, rollback, and closeout expectations | Human authorization required for production promotion or protected changes |

## Cursor-to-ChatGPT handoff

Cursor must create an issue comment beginning exactly with:

```text
CHATGPT HANDOFF
```

Required fields:

```text
CHATGPT HANDOFF
Issue: #<issue-number>
Status: <needs-review | blocked | disposition-proposed | pr-opened | pr-ready | complete>
PR: <PR number or none>
Branch: <branch>
Head SHA: <SHA or none>
Summary:
- <work completed, blocker, or decision needed>

Validation:
- <commands/checks and results>

ChatGPT action requested:
- <one specific review, decision, authorization, merge-readiness review, or closeout action>

Evidence / paths:
- <repo paths, PR links, review threads, or check evidence>
```

A comment beginning with `LOCAL CURSOR STATUS`, `LOCAL CURSOR`, `status update`, or any other marker is informational only. It does not satisfy the handoff contract and must not trigger final review, merge, or closeout disposition.

## PR-open and PR-update handoff

When Cursor opens a PR or pushes requested remediation, Cursor must immediately post a new canonical `CHATGPT HANDOFF` on the source issue.

The handoff must identify:

- PR number and link;
- branch and current head SHA;
- short purpose;
- changed-file scope;
- validation and current CI state;
- unresolved review threads or `none`;
- one requested ChatGPT action.

## ChatGPT response markers

Use `CHATGPT RESPONSE` for decisions, requested changes, resumed implementation direction, or clarification.

Use `CHATGPT CLOSEOUT` only for a terminal child disposition, verified integration, queue disposition after integration, or explicit stop. A source issue must not be closed merely because a PR is ready or checks pass.

Required response form:

```text
CHATGPT RESPONSE
Issue: #<issue-number>
Responds to: <exact CHATGPT HANDOFF comment URL>
Cursor local action: <resume | revise | open-pr | update-pr | stop | wait>
Decision:
- <accepted decision or requested change>

Evidence / authority:
- <repo document, issue, PR, review, check, or validation evidence>

Next step:
- <exactly one bounded action for local Cursor or one explicit halt reason>
```

Required closeout form:

```text
CHATGPT CLOSEOUT
Issue: #<issue-number>
Responds to: <exact CHATGPT HANDOFF comment URL>
Disposition: <integrated | closed-complete | superseded | stopped | queued>
Evidence:
- <merge SHA, PR state, check state, or authority>

Queue action:
- <exactly one successor action or explicit none>
```

Closeout requires verified integration evidence when the issue delivered a PR. A PR marked ready, green, approved, or mergeable is not integration evidence.

## Local Cursor resume protocol

A valid local resume requires all of the following:

1. The source issue is open.
2. The issue has both `agent:cursor` and `handoff:ready`, unless a documented manual/no-loop exception applies.
3. A canonical `CHATGPT RESPONSE` or `CHATGPT CLOSEOUT` exists after the relevant handoff.
4. The response references the same issue and current PR/branch state.
5. No newer review, failed check, merge, closeout, or issue-state change supersedes it.
6. A separate `LOCAL CURSOR RESUME` references the exact response URL.
7. The resume contains exactly one bounded next action.

Required resume form:

```text
LOCAL CURSOR RESUME
Issue: #<issue-number>
Source handoff: <exact CHATGPT HANDOFF comment URL>
Resume from: <exact CHATGPT RESPONSE or CHATGPT CLOSEOUT comment URL>
Runtime: local
Branch: <branch>
PR: <PR number or none>
Next local action:
- <exactly one bounded action>

Do not invoke Cursor Cloud. Do not merge unless the referenced response explicitly authorizes it.
```

Do not use `LOCAL CURSOR RESUME` as the decision itself. Do not include multiple independent actions, checklists, implementation phases, or alternative paths in one resume. Detailed scope belongs in the source issue or referenced response.

If any required element is absent or ambiguous, Cursor must post canonical `CHATGPT HANDOFF` with `Status: blocked` and stop.

## Poller and pickup semantics

The labels and resume comment make the issue eligible for the local poller. They do not prove that the poller detected the update or that local Cursor began work.

The poller treats activity as new only when the qualifying issue or PR update time is later than its stored watermark. Therefore:

- set or verify both wake labels;
- post the canonical response;
- post the separate resume after the response;
- confirm the source issue remains open;
- do not report `Cursor active`, `Cursor resumed`, or `work underway` until Cursor posts a subsequent comment or pushes a new commit.

If no Cursor evidence appears, the dispatcher must treat the lane as idle and re-check poller eligibility rather than assuming engagement.

## Cloud-agent invocation boundary

Do not use `@cursor` when the intended actor is local Cursor. `@cursor` is a cloud-agent invocation path, not a local resume marker.

Cloud execution requires explicit source-issue authorization under `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md`.

## Wake-label requirements

For local Cursor execution, the open source issue must include:

```text
agent:cursor
handoff:ready
```

Body text or comments alone are insufficient. Labels alone are also insufficient without a qualifying issue update and canonical resume transaction.

For ChatGPT review, use:

```text
agent:ChatGPT
CHATGPT HANDOFF
```

These are routing markers and require an actual manual, scheduled, or repo-native dispatcher.

## Queue-stall escalation

If a valid handoff is not answered, a valid response is not followed by a resume, a resume is not consumed, a PR remains review-ready without disposition, or a successor lacks an active Cursor task, the dispatcher must:

- correct the communication transaction when authorized;
- preserve the local loop and active wake labels;
- create or update an Ops remediation issue if the stall cannot be corrected directly;
- record an explicit halt reason when no action is authorized.

The dispatcher must not silently leave an approved execution lane idle.

## Decision propagation rule

Decisions made in chat must be written to the relevant GitHub Issue, PR, or repository document before Cursor is expected to act. Cursor must not infer chat-only context.

## Required references

Active source issues should reference:

```text
Handoff workflow:
docs/ops/ai/chatgpt-cursor-handoff-workflow.md

Queue watch / dispatcher:
docs/ops/pmo/queue-watch-and-dispatch-protocol.md
```
