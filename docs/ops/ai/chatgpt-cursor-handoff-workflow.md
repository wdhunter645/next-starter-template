---
Doc Type: Operational Workflow
Audience: ChatGPT, Cursor, Bill
Authority Level: Agent-Specific Workflow
Owns: Cursor to ChatGPT handoff format, Cursor wake-label expectations, source-issue PR-open notification, review-trigger expectations, and marker/dispatcher boundaries for LGFC repository work
Does Not Own: Shared agent law, merge authorization, implementation authority, production design authority, PR lifecycle gates, ChatGPT account-level scheduled automation, or repo-native watch implementation
Canonical Reference: /docs/ops/ai/CHATGPT-RULES.md
Related Issues: #2396, #2391, #2369, #2360, #2359
Last Reviewed: 2026-07-08
---

# ChatGPT / Cursor Handoff Workflow

## Purpose

Define the standard issue-based handoff workflow for LGFC repository work involving Cursor and ChatGPT.

This file controls communication format, marker expectations, and Cursor wake-label expectations. It does not change implementation authority, review authority, merge authorization, closeout authority, PR lifecycle gates, shared agent law, or the requirement for a real dispatcher/watch to consume handoff markers.

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
