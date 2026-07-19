---
Doc Type: Operational Workflow
Audience: Human + AI operators
Authority Level: Operational Procedure
Owns: GitHub communication markers, cross-lane routing, lightweight problem adjustment, local Cursor wake/resume, acknowledgment, and task-level handoff behavior
Does Not Own: Role authority, delivery and promotion policy, PR approval, Production authorization, incident recovery strategy, or runner host maintenance
Canonical Reference: /docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md
Related Issues: #2396, #2492, #2640, #2641, #2639
Last Reviewed: 2026-07-19
---

# Cross-Lane ChatGPT / Cursor Communication Workflow

## Purpose

Define the GitHub communication procedure used by PMO / Engineering, Implementation / Operations, Administration & Communications, and Day-2 Operations.

This procedure carries decisions and evidence. It does not create decision authority.

## Operating rule

A communication handoff stops only the affected task or incident unless the recorded decision or evidence requires a broader hold.

A PR handoff for Task A does not stop independent Task B Development work.

## Authority

- Repository documents and GitHub Issues remain authority.
- Durable role ownership is defined in `docs/governance/AGENT-TEAM.md`.
- Promotion transitions are defined in `docs/governance/DELIVERY-AND-RELEASE.md`.
- Administration & Communications policy is defined in `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md`.
- Runner and controller transport authorized events; they do not make product, Engineering, approval, recovery, or Production decisions.

## Minimum communication vocabulary

- `PROBLEM FOUND`
- `GUIDANCE`
- `ADJUSTMENT`
- `HOLD`
- `PLAN CHANGE REQUIRED`
- `RESUME`
- `IMPLEMENTATION HANDOFF`
- `PR REVIEW REQUEST`
- `APPROVED FOR INTEGRATION`
- `PROMOTION CANDIDATE READY`
- `PRODUCTION GO`
- `OPERATIONAL INCIDENT`
- `RECOVERY VERIFIED`
- `CLOSEOUT`

Legacy `CHATGPT HANDOFF`, `CHATGPT RESPONSE`, `CHATGPT CLOSEOUT`, and `LOCAL CURSOR RESUME` markers remain supported adapters until the controller migration is complete.

## Event envelope

A cross-lane event records:

```text
Event:
Subject:
Source role / lane:
Target role / lane:
Profile:
Status:
Evidence:
Requested action:
Blocking scope:
Decision authority:
Acknowledgment required:
Supersedes:
Resume condition:
```

Only include fields that apply, but the subject, source, target, evidence, requested action, and blocking scope must be clear.

## Lightweight problem adjustment

Most discoveries use this path:

```text
PROBLEM FOUND
  -> route to the role that made the controlling decision
  -> GUIDANCE or ADJUSTMENT
  -> Administration & Communications records and acknowledges
  -> RESUME
```

### Problem report

```text
PROBLEM FOUND
Subject: #<issue or incident>
Profile: <sandbox | development | promotion-candidate | production | day-2>
Observed fact:
- <what was discovered>

Impact:
- <why the current action cannot proceed as intended>

Evidence:
- <checks, paths, logs, screenshots, or links>

Blocking scope:
- <task | project | promotion | production | repository assessment>

Independent work:
- <safe to continue | not safe and why>

Decision requested from:
- <owning role>
```

### Guidance or adjustment

```text
GUIDANCE
Subject: #<issue or incident>
Decision:
- <bounded clarification>

OR

ADJUSTMENT
Subject: #<issue or incident>
Decision:
- <bounded change within existing objective and authority>

Resume condition:
- <exact condition>
```

Use `PLAN CHANGE REQUIRED` only when product outcome, architecture, acceptance criteria, dependency structure, delivery model, promotion path, Production boundary, or recovery strategy materially changes.

## Implementation handoff

When Implementation / Operations completes bounded Development work:

```text
IMPLEMENTATION HANDOFF
Issue: #<issue>
PR: #<PR or none>
Branch:
Head SHA:
Profile: development
Summary:
Validation:
Changed scope:
Protected or material concerns:
Requested action:
Independent successor safe: <yes | no with reason>
```

The affected task enters review or integration disposition. An independent successor may continue when the source authority and dependency state allow it.

## PR review request and disposition

```text
PR REVIEW REQUEST
Issue:
PR:
Candidate/head SHA:
Profile: <development | promotion-candidate | production>
Acceptance evidence:
Checks:
Protected scope:
Requested disposition:
```

PR Approver / Engineering responds with one of:

- `APPROVED FOR INTEGRATION`
- `ADJUSTMENT`
- `PLAN CHANGE REQUIRED`
- `HOLD`

Automated Development eligibility is recorded as deterministic CI eligibility, not as human Engineering approval.

## Promotion Candidate communication

```text
PROMOTION CANDIDATE READY
Release unit:
Candidate SHA:
Development scope included:
Qualification plan/results:
Repository standards reconciliation:
Rollback evidence:
Unresolved gaps:
Decision requested:
```

Promotion Candidate is mandatory before Production. No event may route Sandbox or Development directly to Production.

## Operational incident communication

```text
OPERATIONAL INCIDENT
Incident:
Evidence:
Known impact:
Assessment hold: <applied | not applied>
Current scope:
Owner needed:
```

After assessment:

```text
ADJUSTMENT
Incident:
Impact / probable cause / containment:
Targeted hold:
Resolution owner:
Unaffected work resume: <authorized | not authorized>
```

Day-2 Operations authorizes hold release. Administration & Communications records the state and routes `RESUME`.

## Local Cursor wake and resume adapter

Until runtime migration is complete, local Cursor may still require the legacy wake transaction:

1. authoritative decision/event exists on the source Issue;
2. Issue is open;
3. required wake labels exist;
4. no newer state supersedes the decision;
5. a separate `LOCAL CURSOR RESUME` references the exact decision;
6. the resume contains one bounded next action.

```text
LOCAL CURSOR RESUME
Issue: #<issue>
Resume from: <exact decision comment URL>
Runtime: local
Branch:
PR:
Next local action:
- <one bounded action>
```

The marker is transport, not decision authority. It does not prove pickup or work execution.

## Acknowledgment and retry

Administration & Communications tracks whether a routed event was acknowledged.

- Repeated identical events must not create duplicate work.
- A retry may refresh attention but must preserve the same event/action identity.
- A stale event must not overwrite a newer review, check, decision, hold, resume, merge, or closeout.
- Missed acknowledgment routes to the recorded escalation role.

## Runner and controller boundary

The runner/controller may:

- detect and normalize events;
- publish routing and evidence;
- retry bounded communication;
- apply authorized labels/comments/checks;
- execute deterministic authorized automation.

It must not:

- invent authority;
- make subjective decisions;
- impersonate human review;
- skip promotion profiles;
- merge to `main` without Production authority.

Runner host/service failure routes to Day-2 Operations. Communication state and retry remain Administration & Communications responsibilities.

## Decision propagation

A decision made in chat, email, or another external surface must be written to the relevant GitHub Issue, PR, incident, or canonical repository document before repository work depends on it.

## Closeout

`CLOSEOUT` records task, project, program, release, or incident disposition after required execution, validation, approval, promotion, Production, and evidence conditions are satisfied.

Closeout does not block an independent Development successor unless a substantive invariant is missing or contradictory.

## Required references

- Roles: `docs/governance/AGENT-TEAM.md`
- Administration & Communications: `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md`
- Lane/profile contract: `docs/reference/operations/operating-lanes-and-promotion-profiles.md`
- Delivery and promotion: `docs/governance/DELIVERY-AND-RELEASE.md`
- Queue/dispatch: `docs/ops/pmo/queue-watch-and-dispatch-protocol.md`
- Runner: `docs/reference/ci/repository-runner-contract.md`