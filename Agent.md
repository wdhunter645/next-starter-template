---
Doc Type: Entry / Control File
Audience: Human + AI
Authority Level: Navigation
Owns: Read order, authority hierarchy, execution entry point
Does Not Own: Execution rules, design authority, governance policies
Canonical Reference: /docs/ops/ai/CORE-RULES.md
Last Reviewed: 2026-04-22
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
