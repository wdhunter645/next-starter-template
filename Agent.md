---
Doc Type: Entry / Control File
Audience: Human + AI
Authority Level: Navigation
Owns: Read order, authority hierarchy, execution entry point
Does Not Own: Execution rules, design authority, governance policies
Canonical Reference: /docs/ops/ai/SHARED-AGENT-RULES.md
Last Reviewed: 2026-06-04
---

# Agent.md

Purpose: Entry point and navigation file for all AI agents.

---

## REQUIRED READ ORDER

1. /docs/reference/design/LGFC-Production-Design-and-Standards.md
2. /docs/ops/ai/SHARED-AGENT-RULES.md
3. /docs/ops/ai/CORE-RULES.md
4. Source GitHub issue for the assigned task
5. Task-relevant design, architecture, governance, or implementation-plan files linked from the source issue
6. Agent-specific rules (tool behavior only):
   - /docs/ops/ai/CHATGPT-RULES.md
   - /docs/ops/ai/CURSOR-RULES.md
   - /docs/ops/ai/CODEX-RULES.md
   - /docs/ops/ai/COPILOT-RULES.md
   - /docs/ops/ai/DEVIN-RULES.md

Tracker files are historical/status indexes. Agents may read tracker files for verification when relevant, but update tracker files only when the source issue explicitly includes tracker governance, tracker reconciliation, or status-index maintenance in scope.

---

## AUTHORITY HIERARCHY (SINGLE SOURCE)

1. Locked design / platform / governance documents
2. /docs/ops/ai/SHARED-AGENT-RULES.md
3. /docs/ops/ai/CORE-RULES.md
4. Source GitHub issue for task scope and acceptance criteria
5. Task-specific implementation plan or queue issue
6. Agent-specific rules
7. Task prompt

This entrypoint defines the active read order for current repository work. Older cross-agent or tracker documents remain supporting references unless the source issue explicitly scopes tracker governance, tracker reconciliation, or status-index maintenance.

If conflict exists → follow highest authority.

---

## EXECUTION MODEL (HIGH LEVEL)

- One task → one thread → one deliverable
- One task → one issue → one PR
- No mixed intent
- No scope expansion
- No routine tracker-update PRs for normal implementation work

---

## REPO-SCOPED SKILL ROUTING

Use these repository skills when the task matches the trigger:

- PR creation, PR updates, issue linkage, scope control, labels, or acceptance criteria: `.agents/skills/lgfc-pr-governance/SKILL.md`
- Homepage, navigation, footer, Join/Login, FanClub, member, admin, Store, route, or visual/layout changes: `.agents/skills/lgfc-design-compliance/SKILL.md`
- Documentation creation, documentation moves, documentation edits, authority hierarchy, DIATAXIS routing, or documentation checks: `.agents/skills/lgfc-docs-authority/SKILL.md`
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
