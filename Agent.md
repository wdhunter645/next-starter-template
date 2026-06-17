---
Doc Type: Entry / Control File
Audience: Human + AI
Authority Level: Navigation
Owns: Read order, authority hierarchy, execution entry point
Does Not Own: Execution rules, design authority, governance policies
Canonical Reference: /docs/ops/ai/SHARED-AGENT-RULES.md
Last Reviewed: 2026-06-17
---

# Agent.md

Purpose: **Mandatory starting point and routing authority** for all AI agents. No agent may begin repository work without reading this file first.

---

## CURSOR SESSION BOOTSTRAP

Cursor injects thin bootstrap routers that point here and to canonical governance. They do **not** replace this file or shared/core rules.

- **Local Composer/Agent sessions:** `.cursor/rules/*.mdc` (`alwaysApply: true`)
- **Cloud Agent sessions:** root `AGENTS.md`

See `docs/how-to/cursor/agent-session-bootstrap.md` for verification.

---

## MANDATORY DOCUMENTATION CHAIN

Before any repo work — including exploration, implementation, PR creation, issue work, review, or remediation — every agent must follow this chain in order:

1. **This file** (`Agent.md`) — entry point and routing authority
2. `/docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md` — canonical LGFC AI team roles, modes, and workflow
3. `/docs/ops/ai/SHARED-AGENT-RULES.md` — categorized shared agent law
4. `/docs/ops/ai/CORE-RULES.md` — detailed shared execution rules
5. **Applicable agent-specific rule file** (tool behavior only; additive, never a substitute for shared/core rules or the operating model):
   - `/docs/ops/ai/CHATGPT-RULES.md`
   - `/docs/ops/ai/CURSOR-RULES.md`
   - `/docs/ops/ai/CODEX-RULES.md`
   - `/docs/ops/ai/COPILOT-RULES.md`
   - `/docs/ops/ai/DEVIN-RULES.md`
6. **Applicable repo governance and procedure docs** — including source GitHub issue, task-linked design/architecture/governance files, and for PR/issue/review/remediation/implementation work:
   - `.agents/skills/lgfc-pr-governance/SKILL.md`
   - `.github/pull_request_template.md`
   - `/docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`
   - `/docs/governance/PR_GOVERNANCE.md` and other governance docs linked from the source issue or PR template
7. **Applicable `.agents/skills/*/SKILL.md` files** — when the task matches a skill trigger (see [REPO-SCOPED SKILL ROUTING](#repo-scoped-skill-routing))

Agent-specific docs are **additive**. They do not replace shared/core rules or repo governance.

Task prompts, operator messages, and subagent instructions do not override this chain.

---

## REQUIRED READ ORDER

After the mandatory documentation chain above, continue with task-scoped reading:

1. `/docs/reference/design/LGFC-Production-Design-and-Standards.md` (when design authority applies)
2. Source GitHub issue for the assigned task
3. Task-relevant design, architecture, governance, or implementation-plan files linked from the source issue

Tracker files are historical/status indexes. Agents may read tracker files for verification when relevant, but update tracker files only when the source issue explicitly includes tracker governance, tracker reconciliation, or status-index maintenance in scope.

---

## AUTHORITY HIERARCHY (SINGLE SOURCE)

1. Locked design / platform / governance documents
2. /docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md
3. /docs/ops/ai/SHARED-AGENT-RULES.md
4. /docs/ops/ai/CORE-RULES.md
5. Source GitHub issue for task scope and acceptance criteria
6. Task-specific implementation plan or queue issue
7. Agent-specific rules
8. Task prompt

This entrypoint defines the active read order for current repository work. Older cross-agent or tracker documents remain supporting references unless the source issue explicitly scopes tracker governance, tracker reconciliation, or status-index maintenance.

If conflict exists → follow highest authority.

---

## EXECUTION MODEL (HIGH LEVEL)

Canonical LGFC AI team roles, modes, authority boundaries, and workflow: [`docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md`](docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md).

Summary:

- **Bill** — project owner, final authority, PR approval, gate authorization.
- **Atlas (ChatGPT)** — design authority, documentation PR/package authority, program and child issue authorship, launch-control packages, gate review partner.
- **Cursor** — **sole** LGFC implementation executor; pre-implementation package review required before execution.
- **Codex** — **inactive/out** for LGFC implementation unless Bill explicitly reauthorizes in a future governance update.

Execution discipline:

- One task → one thread → one deliverable
- One task → one issue → one PR
- No mixed intent
- No scope expansion
- No routine tracker-update PRs for normal implementation work
- PR lifecycle states must follow `/docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`
- Cursor stops at verification gates; Bill/Atlas authorize continue, hold, or revise

**Agent assignments (PMO model):** All future Cursor implementation assignments must use [`docs/templates/agent-assignment-template.md`](docs/templates/agent-assignment-template.md), including documentation package, draft/reference code, Cursor review checkpoint, and Bill/Atlas stop-gate authorization fields.

---

## REPO-SCOPED SKILL ROUTING

Use these repository skills when the task matches the trigger:

- PR creation, PR updates, issue linkage, scope control, labels, acceptance criteria, lifecycle state transitions, or pre-merge closeout prediction: `.agents/skills/lgfc-pr-governance/SKILL.md`
- Homepage, navigation, footer, Join/Login, FanClub, member, admin, Store, route, or visual/layout changes: `.agents/skills/lgfc-design-compliance/SKILL.md`
- Documentation creation, documentation moves, documentation edits, authority hierarchy, DIATAXIS routing, or documentation checks: `.agents/skills/lgfc-docs-authority/SKILL.md`
- Packaging scoped work for Cursor implementation: `docs/templates/agent-assignment-template.md`
- LGFC AI team roles, modes, and workflow: `docs/ops/ai/LGFC-AI-TEAM-OPERATING-MODEL.md`
- Tracker/status-index updates: `.agents/skills/lgfc-docs-authority/SKILL.md` only when the source issue explicitly authorizes tracker governance, tracker reconciliation, or status-index maintenance
- Next.js build, API, route handler, middleware, Cloudflare Pages, D1, static export, or deployment compatibility changes: `.agents/skills/lgfc-cloudflare-static-export/SKILL.md`
- Final PR handoff, closeout, verification evidence, or post-merge readiness: `.agents/skills/lgfc-verification-closeout/SKILL.md`

Long-form cross-agent instructions live in:

- `governance/ai/AGENT-GOVERNANCE.md`
- `ops/ai/CROSS-AGENT-OPERATING-RULES.md`

Agent governance files are checked by:

- `.agents/checks/agent-governance-check.mjs`
- `.github/workflows/agent-governance.yml`

---

## STOP CONDITIONS (REFERENCE)

Shared agent law (categorized): `/docs/ops/ai/SHARED-AGENT-RULES.md`  
Detailed execution rules: `/docs/ops/ai/CORE-RULES.md`

- Conflict with authority
- Ambiguity
- Unverified repo state
- Scope expansion

---

## FINAL

This file is navigation only.
Shared agent law is defined in SHARED-AGENT-RULES.md and expanded in CORE-RULES.md.
Tool-specific rules are defined in the agent-specific files listed above.
