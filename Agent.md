---
Doc Type: Entry / Control File
Audience: Human + AI
Authority Level: Navigation
Owns: Read order, authority hierarchy, execution entry point
Does Not Own: Execution rules, design authority, governance policies
Canonical Reference: /docs/ops/ai/CORE-RULES.md
Last Reviewed: 2026-05-11
---

# Agent.md

Purpose: Entry point and navigation file for all AI agents.

---

## REQUIRED READ ORDER

1. /docs/reference/design/LGFC-Production-Design-and-Standards.md
2. /docs/reference/design/fanclub.md
3. /docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md
4. /docs/ops/trackers/THREAD-LOG_Master.md
5. /docs/ops/ai/CORE-RULES.md
6. Agent-specific rules:
   - /docs/ops/ai/CHATGPT-RULES.md
   - /docs/ops/ai/CURSOR-RULES.md
   - /docs/ops/ai/COPILOT-RULES.md
   - /docs/ops/ai/DEVIN-RULES.md

---

## AUTHORITY HIERARCHY (SINGLE SOURCE)

1. Locked design / platform / governance documents  
2. Operational trackers  
3. /docs/ops/ai/CORE-RULES.md  
4. Agent-specific rules  
5. Task prompt  

If conflict exists → follow highest authority.

---

## EXECUTION MODEL (HIGH LEVEL)

- One task → one thread → one deliverable  
- One task → one PR  
- No mixed intent  
- No scope expansion  

---

## REPO-SCOPED SKILL ROUTING

Use these repository skills when the task matches the trigger:

- PR creation, PR updates, Issue linkage, scope control, labels, or acceptance criteria: `.agents/skills/lgfc-pr-governance/SKILL.md`
- Homepage, navigation, footer, Join/Login, FanClub, member, admin, Store, route, or visual/layout changes: `.agents/skills/lgfc-design-compliance/SKILL.md`
- Documentation creation, documentation moves, authority hierarchy, DIATAXIS routing, or tracker updates: `.agents/skills/lgfc-docs-authority/SKILL.md`
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

Full definitions: `/docs/ops/ai/CORE-RULES.md`

- Conflict with authority  
- Ambiguity  
- Unverified repo state  
- Scope expansion  

---

## FINAL

This file is navigation only.  
All rules are defined in CORE-RULES.md.
