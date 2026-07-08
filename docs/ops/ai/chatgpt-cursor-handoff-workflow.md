---
Doc Type: Operational Workflow
Audience: ChatGPT, Cursor, Bill
Authority Level: Agent-Specific Workflow
Owns: Cursor to ChatGPT handoff format, source-issue PR-open notification, and review-trigger expectations for LGFC repository work
Does Not Own: Shared agent law, merge authorization, implementation authority, production design authority, or PR lifecycle gates
Canonical Reference: /docs/ops/ai/CHATGPT-RULES.md
Related Issues: #2369, #2360, #2359
Last Reviewed: 2026-07-08
---

# ChatGPT / Cursor Handoff Workflow

## Purpose

Define the standard issue-based handoff workflow for LGFC repository work involving Cursor and ChatGPT.

This file controls communication format only. It does not change implementation authority, review authority, merge authorization, closeout authority, PR lifecycle gates, or shared agent law.

## Authority

- Repository docs and GitHub Issues remain operational authority.
- Cursor executes assigned implementation or documentation tasks within source-issue scope.
- ChatGPT performs governance review, disposition decisions, PR readiness review, merge-readiness synthesis, and closeout control where applicable.
- Bill remains final authority for merge authorization, high-risk scope, and unclear project decisions.

## Required task list

| Task | Owner | Trigger | Required surface | Required action | Stop condition |
| --- | --- | --- | --- | --- | --- |
| Execute assigned work | Cursor | Source issue is assigned to Cursor and scope is clear | Source issue and working branch | Work only inside source-issue scope and allowed paths | Stop if scope, authority, or target paths are unclear |
| Post review handoff | Cursor | Review point, blocker, proposed disposition, completion point, PR-readiness point, or closeout request | Source issue comment | Post `CHATGPT HANDOFF` with required fields and request `agent:ChatGPT` if missing | Stop after handoff until ChatGPT responds |
| Announce opened PR | Cursor | Pull request is opened from a source issue | Source issue comment | Post `CHATGPT HANDOFF` with PR link, branch, scope, changed files, validation/check status, and requested ChatGPT action | Stop until ChatGPT reviews or gives next direction |
| Propagate chat decisions | ChatGPT | Bill and ChatGPT decide direction in chat UI | Source issue, PR, or repo doc | Write accepted decision into the relevant GitHub-controlled surface before Cursor is expected to act | Do not expect Cursor to act on chat-only context |
| Review handoff | ChatGPT | Issue has `agent:ChatGPT` and a `CHATGPT HANDOFF` comment | Source issue, PR, repo files, validation evidence | Respond in the issue or PR with decisions, requested changes, approval path, or closeout direction | Stop if repository authority or evidence is insufficient |
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

Scheduled issue or PR watches are backup only. The source issue remains the primary collaboration surface.

## Label / status expectation

When labels are available, Cursor should set or request the issue label state expected by the program:

- `agent:ChatGPT`

If Cursor cannot set labels directly, Cursor must state the requested label change in the handoff comment.

## ChatGPT review trigger

`agent:ChatGPT` is the deterministic review/watch label for issue-driven work requiring ChatGPT action.

`CHATGPT HANDOFF` is the deterministic issue-comment marker for Cursor handoffs requiring ChatGPT action.

Do not use legacy Atlas labels or handoff markers for new work.

## Decision propagation rule

Decisions made by Bill and ChatGPT in the chat UI must be written into the relevant GitHub Issue, Pull Request, or repository doc before Cursor is expected to act on them.

Cursor should not infer chat-only context. If Cursor detects a missing decision, ambiguous authority, or conflict between chat-derived context and repository-controlled context, Cursor must ask in the issue instead of inferring.

## Issue reference pattern

Issues should reference this workflow with a short path reference:

```text
Handoff workflow:
docs/ops/ai/chatgpt-cursor-handoff-workflow.md
```

Do not copy the full workflow definition into every issue. Reference this file from issues and keep issue-specific scope, source files, dependencies, acceptance criteria, and stop rules in the issue body.
