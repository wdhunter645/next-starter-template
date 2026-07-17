---
Doc Type: Operational Rules
Audience: AI (Cursor)
Authority Level: Superseded
Owns: Historical pointer only — Cursor implementation policy moved to governance
Does Not Own: Agent team policy, runtime routing standard, or shared execution law
Canonical Reference: /docs/governance/AGENT-TEAM.md
Related Issues: #2494
Last Reviewed: 2026-07-13
---

# CURSOR-RULES.md

## Status

**Superseded for agent team and approval policy.** Cursor implementation authority, continuous execution boundaries, and no-self-approval rules now live in [`docs/governance/AGENT-TEAM.md`](../../governance/AGENT-TEAM.md).

| Topic | Canonical owner |
| --- | --- |
| Cursor roles and stop conditions | `docs/governance/AGENT-TEAM.md` |
| Role contracts and protected stops | `docs/reference/agents/implementation-authority-contract.md` |
| Model A / Model B procedures | `docs/how-to/agents/run-model-a.md`, `docs/how-to/agents/run-model-b.md` |
| Runtime routing | `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md` |
| Shared execution rules | `docs/ops/ai/CORE-RULES.md` |
| Cursor handoff and wake loop | `docs/ops/ai/chatgpt-cursor-handoff-workflow.md`, `docs/how-to/cursor/github-poll-wake-loop.md` |

## Read order

Before any repo work, follow the chain in [`Agent.md`](../../../Agent.md): `Agent.md` → [`AGENT-TEAM.md`](../../governance/AGENT-TEAM.md) → [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md) → [`CORE-RULES.md`](./CORE-RULES.md) → this pointer → applicable repo governance and skills.

Cursor is the **sole LGFC implementation executor**. Cursor must not self-approve, merge its own assigned PRs, or treat routine Bill approval as required between implementation Go and PR review on Model B child work.

## Historical note

Detailed Cursor-specific sections (pre-implementation package review steps, thread discipline, analysis-first rule, git/push boundaries, GitHub API budget discipline) remain in repository history until archived. For current work:

- pre-implementation review → `docs/governance/AGENT-TEAM.md` launch-control requirements and `docs/templates/agent-assignment-template.md`
- continuous execution without routine Bill stops → `docs/how-to/agents/run-model-b.md`
- runtime selection → `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md`

Binding runtime policy: [`docs/governance/standards/CURSOR-RUNTIME-ROUTING.md`](../../governance/standards/CURSOR-RUNTIME-ROUTING.md).
