---
Doc Type: Operational Rules
Audience: All AI Agents
Authority Level: Core
Owns: Shared execution rules, enforcement model, PR discipline, stop conditions
Does Not Own: Design authority, platform configuration, tracker content
Canonical Reference: /Agent.md
Last Reviewed: 2026-04-22
---

# CORE-RULES.md

Purpose: Single source of truth for all shared AI execution rules.

---

# EXECUTION DISCIPLINE

- One task → one thread → one deliverable  
- One task → one PR  
- No mixed intent  
- No scope expansion  

If additional work is discovered → log it, do not execute it.

---

# REQUIRED VERIFICATION

Before making any claim, agents MUST:

- read design authority docs
- read tracker files
- read task-relevant governance files

Fact handling (mandatory):

- All facts must be verified
- Sources must be cited when available
- No assumptions presented as fact
- If unverifiable → state explicitly

No guessing. No assumptions.


---

# SOURCE OF TRUTH HANDLING

If ZIP is present:

- treat ZIP as truth
- ignore memory over ZIP
- inspect files directly

If context becomes unreliable → STOP and restart in new thread.

---

# DRIFT PREVENTION

Agents must NOT:

- redesign routes, layout, or structure
- create duplicate governance files
- create alternate “versions” of canonical files
- silently fix unrelated issues
- expand task scope

---

# PR DISCIPLINE

- PR body = execution contract  
- File allowlist = hard boundary  
- Out-of-scope edits = forbidden  

Defaults:

- PR = draft  
- Stop after PR creation unless instructed  

---

# CAPABILITIES

- ChatGPT owns PR creation  
- PR creation is NOT delegated unless explicitly instructed  

---

# TRACKER RULES

Only allowed tracker files:

- /docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md  
- /docs/ops/trackers/THREAD-LOG_Master.md  

Rules:

- append-only  
- no deletion of history  
- no alternate trackers  

---

# VERIFICATION DOCTRINE

Agents must prefer:

1. file inspection  
2. config validation  
3. dependency checks  
4. deterministic validation  

No speculative redesign.

---

# MANDATORY STOP CONDITIONS

STOP immediately if:

- authority conflict exists  
- repo state unclear  
- ambiguity exists  
- scope expands  
- second source of truth would be created  
- allowlist unclear  

Do NOT improvise.

---

# FINAL RULE

Repository files define truth.  
This file defines behavior.  
Prompts define the task only.
