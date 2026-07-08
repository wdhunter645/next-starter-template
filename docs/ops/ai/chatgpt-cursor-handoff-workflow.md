---
Doc Type: Operational Workflow
Audience: ChatGPT, Cursor, Bill
Authority Level: Agent-Specific Workflow
Owns: Cursor to ChatGPT handoff format, Cursor wake-label expectations, source-issue PR-open notification, review-trigger expectations, local Cursor resume markers, and marker/dispatcher boundaries for LGFC repository work
Does Not Own: Shared agent law, merge authorization, implementation authority, production design authority, PR lifecycle gates, ChatGPT account-level scheduled automation, Cursor cloud-agent invocation behavior, or repo-native watch implementation
Canonical Reference: /docs/ops/ai/CHATGPT-RULES.md
Related Issues: #2396, #2391, #2379, #2369, #2360, #2359
Last Reviewed: 2026-07-08
---

# ChatGPT / Cursor Handoff Workflow

## Purpose

Define the standard issue-based handoff workflow for LGFC repository work involving Cursor and ChatGPT.

This file controls communication format, marker expectations, Cursor wake-label expectations, and local Cursor resume behavior. It does not change implementation authority, review authority, merge authorization, closeout authority, PR lifecycle gates, shared agent law, or the requirement for a real dispatcher/watch to consume handoff markers.

## Authority

- Repository docs and GitHub Issues remain operational authority.
- Cursor executes assigned implementation or documentation tasks within source-issue scope.
- ChatGPT performs governance review, disposition decisions, PR readiness review, merge-readiness synthesis, and closeout control where applicable.
- Bill remains final authority for merge authorization, high-risk scope, and unclear project decisions.
- Queue watch and dispatcher behavior is controlled by `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`.

## Required task list

| Task | Owner | Trigger | Required surface | Required action | Stop condition |
| --- | --- | --- | --- | --- | --- |
| Execute assigned work | Cursor | Source issue is assigned to Cursor, scope is clear, and the issue has `agent:cursor` plus `handoff:ready` unless a manual/no-loop exception is documented | Source issue and working branch | Work only inside source-issue scope and allowed paths | Stop if scope, authority, target paths, or wake-label state are unclear |
| Post review handoff | Cursor | Review point, blocker, proposed disposition, completion point, PR-readiness point, or closeout request | Source issue comment | Post `CHATGPT HANDOFF` with required fields and request `agent:ChatGPT` if missing | Stop after handoff until ChatGPT responds |
| Announce opened PR | Cursor | Pull request is opened from a source issue | Source issue comment | Post `CHATGPT HANDOFF` with PR link, branch, scope, changed files, validation/check status, and requested ChatGPT action | Stop until ChatGPT reviews or gives next direction |
| Propagate chat decisions | ChatGPT | Bill and ChatGPT decide direction in chat UI | Source issue, PR, or repo doc | Write accepted decision into the relevant GitHub-controlled surface before Cursor is expected to act | Do not expect Cursor to act on chat-only context |
| Route Cursor task | ChatGPT / Bill / authorized dispatcher | A successor issue is selected as the next active Cursor task | Source issue labels, body, and comment | Set or verify `agent:cursor` and `handoff:ready`, then comment the queue disposition | Do not claim Cursor is engaged if either wake label is missing |
| Review handoff | ChatGPT | Issue has `agent:ChatGPT` and a `CHATGPT HANDOFF` comment that is surfaced by a manual dispatcher, scheduled watch, or explicit chat request | Source issue, PR, repo files, validation evidence | Respond in the issue or PR with decisions, requested changes, approval path, or closeout direction | Stop if repository authority or evidence is insufficient |
| Resume local Cursor after delayed ChatGPT response | Local Cursor / Bill / authorized dispatcher | Prior local Cursor session stopped, timed out, or lost context after `CHATGPT HANDOFF`; GitHub later contains a ChatGPT response | Source issue and linked PR | Re-read the latest `CHATGPT RESPONSE` or `CHATGPT CLOSEOUT` comment, verify wake labels and issue state, then continue only from GitHub-recorded instructions | Stop if the latest response is absent, ambiguous, chat-only, or references stale branch/PR state |
| Run queue/watch dispatcher | ChatGPT / Bill / authorized automation | Manual request, scheduled watch, or repo-native workflow | GitHub issues, PRs, labels, comments, and closeout evidence | Apply `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`; surface action, route next task, or create remediation issue | Do not mutate GitHub unless explicitly authorized |
| Authorize merge readiness | ChatGPT / Bill | PR is ready for merge-readiness review | PR and source issue | Verify scope, source issue accounting, validation, PR body, and closeout expectations | Human authorization required for merge |

## Required handoff marker

When Cursor reaches a review point, blocker, proposed disposition, completion point, PR-readiness point, or closeout request that requires ChatGPT action, Cursor must create an issue comment beginning with:

```text
CHATGPT HANDOFF
```

## Required handoff fields

The handoff comment must include:

```text
CHATGPT HANDOFF
Issue: #<issue-number>
Status: <needs-review | blocked | disposition-proposed | pr-opened | pr-ready | complete>
Summary:
- <short summary of findings or work completed>

ChatGPT action requested:
- <specific review, decision, authorization, PR review, merge-readiness review, or closeout action requested>

Evidence / paths:
- <repo paths, PR links, validation notes, changed files, branch names, or relevant files>
```

## PR opened source-issue handoff

When Cursor opens a pull request from a source issue, Cursor must immediately comment back on the source issue using `CHATGPT HANDOFF`.

The handoff must include:

- PR number and link;
- branch name;
- short PR purpose;
- changed-file scope;
- validation or check status;
- requested ChatGPT action, such as PR review, merge-readiness review, or blocker decision.

## ChatGPT response markers

When ChatGPT responds to a Cursor handoff in GitHub and expects later local Cursor action, the response comment must begin with one of these stable markers:

```text
CHATGPT RESPONSE
```

or:

```text
CHATGPT CLOSEOUT
```

Use `CHATGPT RESPONSE` for decisions, requested changes, resumed implementation direction, or clarification. Use `CHATGPT CLOSEOUT` for merge-readiness disposition, source-issue closeout direction, queue disposition, or terminal stop/continue decisions.

A resumable ChatGPT response must include:

```text
CHATGPT RESPONSE
Issue: #<issue-number>
Responds to: <handoff comment URL or PR number>
Cursor local action: <resume | revise | open-pr | update-pr | stop | wait>
Decision:
- <accepted decision or requested change>
Evidence / authority:
- <repo doc, issue, PR, check, or validation evidence>
Next step:
- <single next action for local Cursor or explicit halt reason>
```

Do not rely on chat-only text, side-channel notes, or undocumented memory for local Cursor resumption.

## Local Cursor resume protocol

If a local Cursor session disconnects, idles out, or loses issue context after posting `CHATGPT HANDOFF`, a later Cursor session must resume from GitHub, not from chat memory.

Resume checklist:

1. Open the source issue named in the prior handoff.
2. Find the latest `CHATGPT RESPONSE` or `CHATGPT CLOSEOUT` after the handoff comment.
3. Verify the response references the same issue, PR, branch, and requested action.
4. Verify current labels still permit Cursor action: `agent:cursor` plus `handoff:ready`, unless the response explicitly states a manual/no-loop exception.
5. Verify no newer comment, PR review, failed check, merge, closeout, or issue state change supersedes the response.
6. Continue only the single next action recorded in the GitHub response.
7. If any item is missing or ambiguous, post a new `CHATGPT HANDOFF` asking for clarification and stop.

The regression case for this protocol is #2360 / PR #2372: the workflow must remain resumable even if ChatGPT response arrives after the original local Cursor session is no longer active.

## Cloud-agent invocation boundary

Do not use `@cursor` when the intended actor is local Cursor. `@cursor` is treated as a cloud-agent invocation path, not a local Cursor resume marker.

For local Cursor routing, use GitHub issue labels and explicit comments instead:

```text
LOCAL CURSOR RESUME
Issue: #<issue-number>
Source handoff: <comment URL>
Resume from: <CHATGPT RESPONSE or CHATGPT CLOSEOUT comment URL>
Next local action:
- <single bounded action>
```

`LOCAL CURSOR RESUME` is a human/operator marker for local Cursor context recovery. It does not wake Cursor by itself and must still be paired with an authorized dispatcher path or manual operator action.

## Watch marker limitation

`agent:ChatGPT` and `CHATGPT HANDOFF` are deterministic markers, not live notification infrastructure by themselves.

A handoff marker becomes actionable only when one of these paths consumes it:

1. Bill or ChatGPT explicitly reviews the GitHub issue or PR in an active chat session;
2. a scheduled ChatGPT watch has been created and is running;
3. a repo-native workflow or external dispatcher has been implemented and validated;
4. a manual queue/watch dispatcher pass is run under `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`.

Do not claim that ChatGPT has been alerted merely because a label or handoff comment exists.

Scheduled issue or PR watches are backup only unless they have been explicitly configured. The source issue remains the primary collaboration surface, but launched queues also require an active dispatcher path so markers do not become silent stalls.

## Cursor wake-label expectation

When a source issue is routed as the next active Cursor task, labels must include:

```text
agent:cursor
handoff:ready
```

Body text and comments such as "Cursor may begin" are not sufficient to wake the Cursor loop if either label is missing.

If the task is intentionally manual-only or should not wake the Cursor loop, the issue or dispatcher comment must state that exception explicitly.

## Label / status expectation

When labels are available, Cursor should set or request the issue label state expected by the program.

For ChatGPT review:

- `agent:ChatGPT`

For Cursor execution wake/start:

- `agent:cursor`
- `handoff:ready`

If Cursor cannot set labels directly, Cursor must state the requested label change in the handoff comment.

## ChatGPT review trigger

`agent:ChatGPT` is the deterministic review/watch label for issue-driven work requiring ChatGPT action.

`CHATGPT HANDOFF` is the deterministic issue-comment marker for Cursor handoffs requiring ChatGPT action.

These markers must be backed by a manual, scheduled, repo-native, or explicit chat dispatcher. Without such a dispatcher, they are inert GitHub metadata.

Do not use legacy Atlas labels or handoff markers for new work.

## Queue-stall escalation

If a handoff marker, completed predecessor, open PR, missing Cursor wake label, or blocked successor prevents launched work from continuing, the dispatcher must either:

- resolve the queue state directly when authorized;
- route the next eligible task to Cursor by setting `agent:cursor` and `handoff:ready`;
- create or update an Ops remediation issue; or
- record an explicit halt reason.

The dispatcher must not leave a launched workstream with no active Cursor task when a successor is eligible to start.

## Decision propagation rule

Decisions made by Bill and ChatGPT in the chat UI must be written into the relevant GitHub Issue, Pull Request, or repository doc before Cursor is expected to act on them.

Cursor should not infer chat-only context. If Cursor detects a missing decision, ambiguous authority, missing wake labels, or conflict between chat-derived context and repository-controlled context, Cursor must ask in the issue instead of inferring.

## Issue reference pattern

Issues should reference this workflow with a short path reference:

```text
Handoff workflow:
docs/ops/ai/chatgpt-cursor-handoff-workflow.md
```

Do not copy the full workflow definition into every issue. Reference this file from issues and keep issue-specific scope, source files, dependencies, acceptance criteria, and stop rules in the issue body.

For launched queues or launch-control work, issues should also reference:

```text
Queue watch / dispatcher:
docs/ops/pmo/queue-watch-and-dispatch-protocol.md
```
