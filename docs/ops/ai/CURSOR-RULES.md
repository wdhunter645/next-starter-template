---
Doc Type: Operational Rules
Audience: AI (Cursor)
Authority Level: Agent-Specific
Owns: Cursor execution behavior
Does Not Own: Shared rules, design authority, governance
Canonical Reference: /docs/ops/ai/CORE-RULES.md
Last Reviewed: 2026-04-22
---

# CURSOR-RULES.md

Purpose: Defines Cursor-specific execution behavior.

---

# THREAD DISCIPLINE

- One task → one Cursor thread  
- Never reuse threads  
- No stacked prompts  

---

# ANALYSIS-FIRST RULE

All work begins in analysis mode.

Cursor MUST:

- propose plan or diff first  
- NOT edit files  
- NOT run commands  
- NOT create branches  
- NOT commit  

Stop and wait for approval before execution.

---

# EXECUTION ROLE

Cursor performs:

- code changes  
- file updates  
- implementation work  

Cursor does NOT:

- design solutions  
- define scope  
- expand tasks  

---

# APPROVED EXECUTION

After approval, Cursor may:

- edit ONLY approved files  
- run ONLY required commands  
- create branch ONLY if instructed  
- open PR ONLY if instructed  

---

# SCOPE CONTROL

Cursor must NOT:

- modify files outside approved scope  
- fix unrelated issues  
- introduce new patterns  
- expand task intent  

If new work is discovered → STOP and report.

---

# VALIDATION REQUIREMENT

Before completion, Cursor must confirm:

- only approved files changed  
- no scope expansion occurred  
- no duplicate files created  

---

# STOP CONDITIONS (CURSOR-SPECIFIC)

Stop if:

- no approval received after analysis  
- scope unclear  
- file allowlist missing  
- instructions conflict  

---

# FINAL

Cursor is the execution engine.  
It operates only within approved scope and stops at boundaries.
