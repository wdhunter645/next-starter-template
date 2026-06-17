---
Doc Type: Operational Rules
Audience: AI (Codex)
Authority Level: Agent-Specific
Owns: Codex inactive-status declaration and historical reference boundaries
Does Not Own: Shared agent law, design authority, LGFC implementation routing, or merge approval
Canonical Reference: /docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md
Last Reviewed: 2026-06-17
---

# CODEX-RULES.md

## Purpose

This document defines **Codex status** for LGFC repository work.

**Codex is inactive/out for LGFC implementation** unless Bill explicitly reauthorizes it in a future governance update.

Canonical team roles and workflow: [`LGFC-AI-TEAM-OPERATING-MODEL.md`](./LGFC-AI-TEAM-OPERATING-MODEL.md).

Shared agent law: [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md).  
Detailed shared execution: [`CORE-RULES.md`](./CORE-RULES.md).  
Active implementation authority: [`CURSOR-RULES.md`](./CURSOR-RULES.md).

Historical prompt summary: [`PROMPTS/Codex-Rules.md`](../../../PROMPTS/Codex-Rules.md) (supporting reference only; this file and the operating model win on conflict).

---

## Mandatory documentation chain

Before any repo work, follow the chain in [`Agent.md`](../../../Agent.md): `Agent.md` → [`LGFC-AI-TEAM-OPERATING-MODEL.md`](./LGFC-AI-TEAM-OPERATING-MODEL.md) → [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md) → [`CORE-RULES.md`](./CORE-RULES.md) → this file → applicable repo governance/procedure docs → applicable `.agents/skills/*/SKILL.md` files.

This file is additive. It does not replace shared/core rules or repo governance.

---

## Current status: inactive / out

As of 2026-06-17 (issue #1754):

- **Do not assign LGFC implementation work to Codex.**
- **Do not route new product or repository implementation tasks to Codex.**
- **Do not create Codex implementation child issues** for LGFC programs unless Bill explicitly reauthorizes Codex in a future governance update.
- **Cursor is the sole LGFC implementation executor.**

Prior documentation that described Codex as a primary or secondary implementation agent is superseded for LGFC work.

---

## Role (historical reference only)

When Codex was active, it operated as an implementation agent — not the control plane — under Atlas coordination and Bill approval.

That execution path is **closed** for LGFC unless reauthorized.

Codex does not:

- define scope or acceptance criteria;
- author program or child issues;
- replace Atlas design/launch-control authority;
- merge Pull Requests;
- override Bill gate authorization.

---

## If Codex receives an LGFC implementation assignment

**Stop immediately** and report:

```text
Codex is inactive/out for LGFC implementation per LGFC-AI-TEAM-OPERATING-MODEL.md and issue #1754.
Route implementation to Cursor.
Do not proceed without Bill-approved governance reauthorization.
```

Do not edit files. Do not open PRs. Do not commit.

---

## Reactivation (future only)

Codex may return as an LGFC implementation path only when:

1. Bill explicitly approves a governance update; and
2. [`LGFC-AI-TEAM-OPERATING-MODEL.md`](./LGFC-AI-TEAM-OPERATING-MODEL.md), [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md), and this file are updated together in a docs/governance PR with a new source issue.

Until then, treat all Codex LGFC implementation instructions as invalid routing.

---

## Stop conditions (Codex-specific)

Stop if:

- any LGFC implementation task is assigned to Codex;
- instructions conflict with inactive status or the operating model;
- an operator or agent requests Codex as primary/secondary LGFC implementer without reauthorization documentation.

---

## Final

Codex is **not** an active LGFC implementation agent. Shared law still applies if Codex touches repository surfaces for non-implementation work in the future, but **LGFC implementation belongs to Cursor only** until Bill explicitly reauthorizes Codex in governance.
