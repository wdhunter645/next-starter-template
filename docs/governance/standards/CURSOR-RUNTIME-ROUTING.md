---
Doc Type: Governance Standard
Audience: Human + AI
Authority Level: Binding
Owns: LGFC Cursor runtime selection, local-versus-cloud invocation boundary, assignment runtime metadata, and local resume routing
Does Not Own: Cursor product configuration, local poller implementation, implementation scope, merge approval, or cloud billing
Canonical Reference: /Agent.md
Related Issues: #2477, #2489, #2550
Last Reviewed: 2026-07-16
---

# Cursor Runtime Routing

## Purpose

Define which Cursor runtime may execute LGFC repository work and prevent local execution instructions from accidentally invoking Cursor Cloud.

## Default runtime

LGFC implementation defaults to:

```text
Runtime: local
```

A source issue may select one of these stable values:

```text
Runtime: local
Runtime: cloud
Runtime: either
```

`cloud` or `either` requires explicit authorization in the source GitHub issue from Bill or Chat. Runtime must not be inferred from labels, branch names, prior sessions, or agent availability.

## Invocation boundary

`@cursor` is a Cursor Cloud invocation. It is prohibited for local LGFC work.

Local Cursor routing uses:

- source issue label `agent:cursor`;
- source issue label `handoff:ready`;
- an executable assignment event (`CURSOR ASSIGNMENT`, or after escalation a `CHATGPT RESPONSE`);
- manual operator action or the documented local poll-wake loop.

Cursor claims with `CURSOR ACK` and transitions to `handoff:in-progress`.

`LOCAL CURSOR RESUME` is a legacy/recovery helper and is not required for launched Model B continuous execution. When used, it must reference a prior canonical ChatGPT decision:

```text
LOCAL CURSOR RESUME
Issue: #<issue-number>
Source handoff: <comment URL>
Resume from: <GitHub authority comment URL>
Next local action:
- <one bounded action>
```

Labels and comments are durable routing and context markers. They do not prove that a local Cursor process is running and must not be described as an automatic cloud invocation.

## Assignment requirement

Every Cursor assignment must declare `Runtime: local | cloud | either`.

For LGFC work:

- omitted runtime is invalid;
- `local` is the default selection;
- `cloud` or `either` requires explicit issue authorization;
- a runtime change requires a new GitHub-recorded decision before execution continues.

## Local authority sources

Local Cursor resumes from repository-controlled state, not chat memory. The detailed procedures are:

- `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`
- `docs/how-to/cursor/github-poll-wake-loop.md`

If either procedure conflicts with this standard, this standard controls runtime selection and the procedures must be corrected.

## Prohibited behavior

Do not:

- use `@cursor` to start, resume, revise, or remediate local LGFC work;
- treat a cloud-agent acknowledgement as evidence that the local agent is active;
- switch an assignment from local to cloud because local execution is delayed;
- use labels alone as execution authorization;
- rely on chat-only instructions for local resume.

## Exception path

Cloud execution may be used only when the source issue explicitly states:

```text
Runtime: cloud
Cloud authorization: Bill | Chat — <issue comment reference>
```

The issue must also define cost/resource expectations, branch, allowed paths, validation, and review authority. A cloud exception does not become the default for successor work.

## Verification

For agent-authority or assignment-template changes:

1. Confirm the assignment contains exactly one Runtime field.
2. Search active authority for `@cursor`.
3. Retain `@cursor` only where it is explicitly identified as prohibited, historical, or cloud-only.
4. Confirm local instructions use labels plus `LOCAL CURSOR RESUME`.
5. Run repository documentation-header and DIATAXIS checks.
