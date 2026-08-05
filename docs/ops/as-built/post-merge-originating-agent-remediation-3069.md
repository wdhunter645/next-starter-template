---
Doc Type: Operations As-Built
Audience: Human + AI
Authority Level: Operational Implementation Record
Owns: Deterministic ownership, interruption, remediation, acceptance, and resumption rules for post-merge closeout exceptions
Does Not Own: Product decisions, PR approval, Production authorization, or agent role definitions
Canonical Reference: /docs/ops/pmo/queue-watch-and-dispatch-protocol.md
Related Issues: #3069, #3030, #3033, #3038, #3039, #3042
Last Reviewed: 2026-08-05
---

# Post-merge originating-agent remediation

## Purpose

Post-merge closeout exceptions are completion defects in the originating delivery. They are not backlog work and must not be reassigned to an unrelated implementation agent.

## Ownership rule

When CI creates a post-merge closeout exception for a merged pull request:

1. Determine the originating implementation agent from the PR branch, source-Issue handoff, and implementation evidence.
2. Assign the exception to that same agent using the matching `agent:*` label.
3. Set the exception to `status:active` immediately.
4. Pause only that agent's next assigned project task at `status:queued`.
5. Keep unrelated agent lanes executable.

An error created by WORK is owned and remediated by WORK. WORK must not transfer its correction burden to Cursor Local, Claude Code, or another delivery agent.

## Required remediation

The originating owner must:

- reconcile every reported reviewer comment and review thread;
- record explicit dispositions in the originating PR record where required;
- correct invalid verification or source-Issue linkage evidence;
- create a bounded remediation PR only when repository content, code, workflow, or documentation must change;
- post an implementation handoff and stop for independent review.

Issue comments and label mutations alone do not implement repository policy changes. Any code or documentation change requires a branch, commit, pull request, required checks, independent review, and merge before the source Issue may be accepted as complete.

## Acceptance and resumption

WORK owns independent acceptance and terminal closeout of agent-created remediation. WORK may not independently approve protected work that WORK implemented.

After the exception is accepted and closed:

1. restore the paused task to its prior executable state;
2. preserve its existing branch, scope, and standing authority;
3. resume automatically without a new dispatch;
4. record the resumption on the source Issue.

## Failure handling

Post-merge exceptions must not accumulate in a deferred cleanup queue. If an exception is actionable, it remains active until corrected or placed on an evidence-specific hold with an owner, release condition, and next review time.

A premature closeout is invalid. Reopen the source Issue, restore active state, correct the repository through a reviewed PR, and repeat independent acceptance.

## Current application

- Claude Code exceptions: #3030 and #3042.
- Cursor Local exceptions: #3033, #3038, and #3039.
- WORK remediation: #3069.

Cursor Local resumes #2923 only after #3033, #3038, and #3039 receive WORK acceptance and closeout. Claude Code resumes #2919 only after #3030 and #3042 receive WORK acceptance and closeout.

## Validation

The implementation that operationalizes this rule must test at minimum:

- Cursor-created PR routing;
- Claude-created PR routing;
- WORK-created error ownership;
- agent-specific successor pausing;
- unrelated-lane continuity;
- automatic successor resumption after acceptance;
- refusal to treat issue-only mutations as implementation of code or documentation changes.
