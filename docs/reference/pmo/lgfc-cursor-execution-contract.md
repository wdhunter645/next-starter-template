---
Doc Type: Reference
Audience: Human + AI
Authority Level: Operational Authority
Owns: Current Cursor runtime compatibility, continuation behavior, PR handoff behavior, and execution-surface limitations while Cursor is mapped to Implementation / Operations
Does Not Own: Durable role authority, current team mapping, GitHub merge authority, closeout policy, project/master audit authority, workflow implementation, or Production authority
Canonical Reference: /docs/governance/AGENT-TEAM.md
Related Issues: #1449, #1448, #1411, #1409, #1379, #1255, #1335, #1501, #1719, #1720, #1722, #2489, #2700
Last Reviewed: 2026-07-21
---

# LGFC Cursor Execution Compatibility Contract

## Status

This document is a current-member compatibility adapter. It describes how Cursor exercises the durable roles currently assigned to it. It does not define repository-wide authority and must not be used to prevent a future agent or system from filling the same role.

Durable authority is owned by:

- `docs/governance/AGENT-TEAM.md`
- `docs/reference/agents/implementation-authority-contract.md`
- `docs/governance/ADMINISTRATION-AND-COMMUNICATIONS.md`
- `docs/reference/operations/administrative-control-lane-contract.md`
- `docs/ops/pmo/github-issue-closeout-protocol.md`

If this compatibility document conflicts with those sources, the durable role policy controls.

## Current mapping

At the time of review, Cursor Local is mapped to:

- Implementation / Operations; and
- Day-2 Operations remediation implementation.

The mapping may change through `docs/governance/AGENT-TEAM.md` or an approved project manifest. Cursor does not permanently own these roles.

## Runtime boundary

Runtime selection and local-versus-cloud invocation boundaries are owned by `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md`.

This document does not authorize `@cursor` for local work or change credential, repository, or paid-service policy.

## Source authority

Cursor acts only through:

- one active same-repository source Issue;
- an assigned durable role and current-role-holder mapping;
- an exact file and action allowlist;
- verifiable acceptance and validation requirements;
- an applicable runtime declaration;
- recorded implementation Go or other action authority; and
- the stop conditions in the role contract and source Issue.

Labels, merge state, branch availability, queue order, prior chats, old PRs, and memory are evidence or routing surfaces; they do not replace source authority.

## Default Implementation / Operations permissions

While mapped to Implementation / Operations, Cursor may:

- read canonical repository authority and source Issues;
- perform the required pre-implementation checkpoint;
- edit files inside the active allowlist;
- run validation commands;
- commit and push scoped changes when authorized;
- open or update the active task PR when authorized;
- remediate CI and review findings within scope;
- post implementation handoff and PR review request evidence;
- verify integrated task state after authorized integration; and
- execute eligible assigned task closeout when the source Issue delegates it and all role-based invariants pass.

Cursor may not:

- approve or merge its own protected work;
- invent scope, acceptance, integration, Promotion Candidate, Production, or recovery authority;
- create child Issues, advance queues, or mutate unrelated Issues without explicit authority;
- close project/master, program/umbrella, Promotion Candidate, Production, release, incident, standalone `OPS:`, or Product Authority disposition Issues through task delegation;
- modify workflow YAML, application/runtime code, D1 migrations, Production configuration, credentials, or paid services outside the active allowlist; or
- combine multiple source Issues into one PR without explicit authority.

## Ready-for-review behavior

When the PR is ready for review, Cursor:

1. runs required validation;
2. inspects the final diff and allowlist;
3. updates the PR body with exact evidence;
4. commits and pushes final in-scope corrections;
5. posts `IMPLEMENTATION HANDOFF` and `PR REVIEW REQUEST` on the source Issue; and
6. stops for the assigned PR Approver / Engineering role holder or authorized deterministic integration path.

PR readiness is not approval, merge, or closeout authority.

## Post-integration behavior

After authorized integration, Cursor may resume only to perform actions authorized by the source Issue and role contract:

- verify the exact integration identity;
- run or inspect required post-integration checks;
- verify integrated acceptance evidence;
- determine parent/master and successor disposition;
- check whether deterministic CI completed task closeout; and
- complete or route the task-closeout transaction.

A failed or ambiguous result is a stop condition and routes one bounded exception.

## Task-closeout compatibility

When all of the following are true, Cursor may execute the fallback assigned-task transaction under delegated Administration & Communications authority:

- Cursor is the recorded Implementation / Operations role holder for the Issue;
- Issue class is `project-child` or `child-remediation`;
- task-closeout delegation is `delegated`;
- independent review or authorized integration is recorded;
- post-integration verification passes;
- terminal task and successor state are deterministic;
- no protected stop or operational hold applies;
- the closeout packet is complete; and
- deterministic CI did not already complete the transaction.

The fallback transaction may:

- post the task `CLOSEOUT` packet;
- reconcile permitted labels and assignment state;
- record parent/master and successor disposition;
- close the assigned task Issue; and
- re-fetch and verify the final state.

If Cursor's token or runtime cannot reliably perform the required GitHub mutation, Cursor posts the complete closeout packet and routes the transaction to the designated Administration & Communications role holder. A token limitation changes the executor, not the decision authority or evidence requirements.

## Program and queue continuation

A launched-program dependency map may authorize serial task continuation, but it does not grant self-approval, merge, project/master closeout, or higher-level authority.

The next task requires its own source Issue and current role assignment. Technical dependency, collision, hold, and implementation-Go state control continuation. Routine administrative prose does not create a dependency.

## Issue-comment bridge

GitHub Issue comments may act as a controlled operational bridge for source-authorized assignments, acknowledgments, handoffs, review requests, post-integration verification, and closeout events.

A bridge event identifies:

```text
Event type:
Subject Issue:
Source role and role holder:
Target role and role holder:
Instruction or result:
Allowed scope:
Prohibited actions:
Evidence:
Blocking scope:
Requested next action:
Acknowledgment required: yes | no
```

Detailed code review belongs on the PR. Cross-role routing and controlling dispositions must be durable on the source Issue.

## Required Cursor output

For each implementation pass, Cursor reports:

```text
Task:
Source Issue:
Assigned role:
Issue class:
Parent/master:
Task-closeout delegation:
Changed files or actions:
Validation:
Out-of-scope files touched: yes | no
PR or integration identity:
Post-integration verification: pass | failed | not-run
Deterministic closeout result: complete | incomplete | not-applicable
Closeout action: completed | routed | not-authorized
Stop condition: none | <reason>
```

## Stop conditions

Cursor stops and routes when:

- current role mapping is absent or contradictory;
- the requested action exceeds the source Issue or allowlist;
- a protected stop or operational hold applies;
- required validation, independent review, integration, or post-integration verification is missing or failed;
- Issue class, parent/master, successor, or terminal state is ambiguous;
- a transaction belongs to project/master or a higher closeout class;
- the runtime cannot safely perform the required action and no authorized fallback exists; or
- more than one source Issue would be required for one PR.

## Supersession

Earlier Cursor-specific statements that permanently reserve review, closeout, queue, or administrative authority to named agents are superseded. Current behavior follows durable role policy, current mapping, source-Issue authority, and runtime capability.
