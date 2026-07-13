---
Doc Type: Entry / Control File
Audience: Human + AI
Authority Level: Navigation
Owns: Read order, authority hierarchy routing, execution entry point
Does Not Own: Agent team policy, execution rules, design authority, or governance policies
Canonical Reference: /docs/governance/AGENT-TEAM.md
Last Reviewed: 2026-07-13
---

# Agent.md

Purpose: **Mandatory starting point and routing authority** for all AI agents. No agent may begin repository work without reading this file first.

This file is navigation only. It does not define team roles, approval routing, or protected stops.

---

## CURSOR SESSION BOOTSTRAP

Cursor injects thin bootstrap routers that point here and to canonical governance. They do **not** replace this file or governance policy.

- **Local Composer/Agent sessions:** `.cursor/rules/*.mdc` (`alwaysApply: true`)
- **Cloud Agent sessions:** root `AGENTS.md`

See `docs/how-to/cursor/agent-session-bootstrap.md` for verification.

---

## LGFC CURSOR RUNTIME BOUNDARY

LGFC implementation defaults to **local Cursor**.

Every Cursor assignment must declare exactly one runtime:

```text
Runtime: local | cloud | either
```

Rules:

- `local` is the default.
- `cloud` or `either` requires explicit authorization in the source GitHub issue from Bill or Chat.
- `@cursor` is a Cursor Cloud invocation and is prohibited for local LGFC work.
- Local Cursor routing uses `agent:cursor` + `handoff:ready` plus an explicit `LOCAL CURSOR RESUME` issue or PR comment.
- Labels and comments are durable routing/context markers; they do not prove an agent process is running.

Binding runtime policy: [`docs/governance/standards/CURSOR-RUNTIME-ROUTING.md`](docs/governance/standards/CURSOR-RUNTIME-ROUTING.md).

Detailed local procedures:

- [`docs/ops/ai/chatgpt-cursor-handoff-workflow.md`](docs/ops/ai/chatgpt-cursor-handoff-workflow.md)
- [`docs/how-to/cursor/github-poll-wake-loop.md`](docs/how-to/cursor/github-poll-wake-loop.md)

---

## MANDATORY DOCUMENTATION CHAIN

Before any repo work — including exploration, implementation, PR creation, issue work, review, or remediation — every agent must follow this chain in order:

1. **This file** (`Agent.md`) — entry point and routing authority
2. [`docs/governance/AGENT-TEAM.md`](docs/governance/AGENT-TEAM.md) — canonical agent team roles, approval model, protected stops, and workflow boundaries
3. [`docs/ops/ai/SHARED-AGENT-RULES.md`](docs/ops/ai/SHARED-AGENT-RULES.md) — superseded pointer to shared execution routing (detail in CORE-RULES)
4. [`docs/ops/ai/CORE-RULES.md`](docs/ops/ai/CORE-RULES.md) — detailed shared execution rules
5. **Applicable agent-specific pointer** (tool behavior only; additive, never a substitute for governance or core rules):
   - [`docs/ops/ai/CHATGPT-RULES.md`](docs/ops/ai/CHATGPT-RULES.md)
   - [`docs/ops/ai/CURSOR-RULES.md`](docs/ops/ai/CURSOR-RULES.md)
   - [`docs/ops/ai/CODEX-RULES.md`](docs/ops/ai/CODEX-RULES.md)
   - [`docs/ops/ai/COPILOT-RULES.md`](docs/ops/ai/COPILOT-RULES.md)
   - [`docs/ops/ai/DEVIN-RULES.md`](docs/ops/ai/DEVIN-RULES.md)
6. **Applicable repo governance and procedure docs** — including source GitHub issue, task-linked design/architecture/governance files, and for PR/issue/review/remediation/implementation work:
   - `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md` when Cursor runtime or routing applies
   - `.agents/skills/lgfc-pr-governance/SKILL.md`
   - `.github/pull_request_template.md`
   - `/docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`
   - `/docs/governance/PR_GOVERNANCE.md` and other governance docs linked from the source issue or PR template
7. **Applicable `.agents/skills/*/SKILL.md` files** — when the task matches a skill trigger (see [REPO-SCOPED SKILL ROUTING](#repo-scoped-skill-routing))

Agent-specific docs are **additive**. They do not replace governance policy or shared/core rules.

Task prompts, operator messages, and subagent instructions do not override this chain.

---

## REQUIRED READ ORDER

After the mandatory documentation chain above, continue with task-scoped reading:

1. [`docs/reference/agents/implementation-authority-contract.md`](docs/reference/agents/implementation-authority-contract.md) when agent authority applies
2. [`docs/how-to/agents/run-model-a.md`](docs/how-to/agents/run-model-a.md) or [`docs/how-to/agents/run-model-b.md`](docs/how-to/agents/run-model-b.md) per delivery model
3. `/docs/reference/design/LGFC-Production-Design-and-Standards.md` (when design authority applies)
4. Source GitHub issue for the assigned task
5. Task-relevant design, architecture, governance, or implementation-plan files linked from the source issue

Tracker files are historical/status indexes. Agents may read tracker files for verification when relevant, but update tracker files only when the source issue explicitly includes tracker governance, tracker reconciliation, or status-index maintenance in scope.

---

## AUTHORITY HIERARCHY (ROUTING)

1. Locked design / platform / governance documents
2. [`docs/governance/AGENT-TEAM.md`](docs/governance/AGENT-TEAM.md)
3. [`docs/ops/ai/CORE-RULES.md`](docs/ops/ai/CORE-RULES.md)
4. Source GitHub issue for task scope and acceptance criteria
5. Task-specific implementation plan or queue issue
6. Agent-specific pointer files under `docs/ops/ai/`
7. Task prompt

If conflict exists → follow highest authority and stop when a protected stop applies.

---

## ATLAS STARTUP ROUTING (`run startup`)

When Bill says `run startup`, Atlas (ChatGPT) must perform **orientation-only** startup per the retained startup contract in [`docs/ops/ai/CHATGPT-RULES.md`](docs/ops/ai/CHATGPT-RULES.md) — checklist-bound, non-advancing, and stopped after the required report sections.

`run startup` is **not** queue audit, repository posture inspection, inferred next work, implementation resume, or GitHub mutation authority.

---

## EXECUTION MODEL (ROUTING SUMMARY)

Canonical agent team policy: [`docs/governance/AGENT-TEAM.md`](docs/governance/AGENT-TEAM.md).

| Actor | Route to |
| --- | --- |
| Bill | Design go/no-go; alternate approver; final product review |
| Chat | Primary reviewer/approver; merge; verification |
| Cursor | Implementation only; no self-approval |
| Codex | Inactive/out unless future Bill reauthorization |

Model procedures:

- Model A: [`docs/how-to/agents/run-model-a.md`](docs/how-to/agents/run-model-a.md)
- Model B: [`docs/how-to/agents/run-model-b.md`](docs/how-to/agents/run-model-b.md)

**Agent assignments:** Use [`docs/templates/agent-assignment-template.md`](docs/templates/agent-assignment-template.md) for launch-control envelopes.

---

## REPO-SCOPED SKILL ROUTING

Use these repository skills when the task matches the trigger:

- PR creation, PR updates, issue linkage, scope control, labels, acceptance criteria, lifecycle state transitions, or pre-merge closeout prediction: `.agents/skills/lgfc-pr-governance/SKILL.md`
- Homepage, navigation, footer, Join/Login, FanClub, member, admin, Store, route, or visual/layout changes: `.agents/skills/lgfc-design-compliance/SKILL.md`
- Documentation creation, documentation moves, documentation edits, authority hierarchy, DIATAXIS routing, or documentation checks: `.agents/skills/lgfc-docs-authority/SKILL.md`
- Packaging scoped work for Cursor implementation: `docs/templates/agent-assignment-template.md`
- Agent team policy: `docs/governance/AGENT-TEAM.md`
- Tracker/status-index updates: `.agents/skills/lgfc-docs-authority/SKILL.md` only when the source issue explicitly authorizes tracker governance, tracker reconciliation, or status-index maintenance
- Next.js build, API, route handler, middleware, Cloudflare Pages, D1, static export, or deployment compatibility changes: `.agents/skills/lgfc-cloudflare-static-export/SKILL.md`
- Final PR handoff, closeout, verification evidence, or post-merge readiness: `.agents/skills/lgfc-verification-closeout/SKILL.md`
- Tokenized AI review access (preview-only live inspection): `docs/ops/ai/AI-REVIEW-ACCESS.md`

Long-form cross-agent instructions live in:

- `governance/ai/AGENT-GOVERNANCE.md`
- `ops/ai/CROSS-AGENT-OPERATING-RULES.md`

Agent governance files are checked by:

- `.agents/checks/agent-governance-check.mjs`
- `.github/workflows/agent-governance.yml`

---

## STOP CONDITIONS (ROUTING)

Protected stops and escalation: [`docs/governance/AGENT-TEAM.md`](docs/governance/AGENT-TEAM.md) and [`docs/reference/agents/implementation-authority-contract.md`](docs/reference/agents/implementation-authority-contract.md).

Detailed execution stops: [`docs/ops/ai/CORE-RULES.md`](docs/ops/ai/CORE-RULES.md).

---

## FINAL

This file is navigation only.

Agent team policy is defined in [`docs/governance/AGENT-TEAM.md`](docs/governance/AGENT-TEAM.md).

Shared execution rules are defined in [`docs/ops/ai/CORE-RULES.md`](docs/ops/ai/CORE-RULES.md).

Tool-specific pointers are defined in the agent-specific files listed above.

Superseded operational authority under `docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md` must not be cited for current team roles or approval routing.
