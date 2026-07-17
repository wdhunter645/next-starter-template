---
Doc Type: Operational Rules
Audience: AI (ChatGPT)
Authority Level: Superseded
Owns: Historical pointer only — Chat control-plane policy moved to governance
Does Not Own: Agent team policy, approval routing, or shared execution law
Canonical Reference: /docs/governance/AGENT-TEAM.md
Related Issues: #2494
Last Reviewed: 2026-07-13
---

# CHATGPT-RULES.md

## Status

**Superseded for agent team and approval policy.** Chat (Atlas) roles, primary review/approval authority, and protected-stop routing now live in [`docs/governance/AGENT-TEAM.md`](../../governance/AGENT-TEAM.md).

| Topic | Canonical owner |
| --- | --- |
| Chat roles and approval model | `docs/governance/AGENT-TEAM.md` |
| Role contracts | `docs/reference/agents/implementation-authority-contract.md` |
| Model A / Model B procedures | `docs/how-to/agents/run-model-a.md`, `docs/how-to/agents/run-model-b.md` |
| Shared execution rules | `docs/ops/ai/CORE-RULES.md` |
| Cursor handoff workflow | `docs/ops/ai/chatgpt-cursor-handoff-workflow.md` |

## Read order

Before any repo work, follow the chain in [`Agent.md`](../../../Agent.md): `Agent.md` → [`AGENT-TEAM.md`](../../governance/AGENT-TEAM.md) → [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md) → [`CORE-RULES.md`](./CORE-RULES.md) → applicable repo governance and skills.

This file is a superseded pointer. It does not replace governance, shared/core rules, or repo governance.

## Historical note

Detailed ChatGPT/Atlas control-plane behavior (startup contract, evidence posture, launch-readiness templates, operating-cycle steps, and communication rules) remains in repository history and supporting ops docs until archived in a later disposition pass. For current work, apply [`AGENT-TEAM.md`](../../governance/AGENT-TEAM.md) first, then [`CORE-RULES.md`](./CORE-RULES.md) for execution detail.

### LGFC startup contract (retained reference)

When Bill says `run startup`, Atlas performs **orientation-only** startup and **stops**. Required report sections, prohibited actions, and bounded context inspection are defined in repository history for this file. `run startup` does **not** authorize queue audit, repository posture inspection, inferred next work, GitHub mutation, PMO state advance, or implementation resume.
