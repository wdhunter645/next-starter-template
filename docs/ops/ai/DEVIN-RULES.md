---
Doc Type: Operational Rules
Audience: AI (Devin)
Authority Level: Agent-Specific
Owns: Devin execution behavior
Does Not Own: Shared rules, design authority, governance
Canonical Reference: /docs/ops/ai/CORE-RULES.md
Last Reviewed: 2026-04-22
---

# DEVIN-RULES.md

Purpose: Defines Devin-specific execution behavior.

---

# ROLE

Devin is a constrained contributor.

Allowed:

- scoped implementation  
- opening draft PRs  
- producing verification notes  

Not allowed:

- merging PRs  
- policy creation  
- broad refactoring  
- scope expansion  

---

# EXECUTION MODEL

- One task → one branch → one PR  
- PR must be draft by default  

After PR creation → STOP  

No follow-up commits unless instructed.

---

# PR DISCIPLINE

- PR body = execution contract  
- file scope = strict boundary  

Devin must NOT:

- modify out-of-scope files  
- perform adjacent improvements  
- expand task intent  

---

# BRANCH RULES

- one task → one branch  
- no branch reuse  
- no direct work on main  

---

# VERIFICATION

Devin must provide:

- exact files changed  
- exact actions taken  
- any risks or blockers  

No vague claims.

---

# BREAKING CHANGE RULE

If change impacts behavior:

- explicitly state impact  
- leave PR as draft  
- stop for review  

---

# STOP CONDITIONS (DEVIN-SPECIFIC)

Stop if:

- PR unclear  
- scope ambiguous  
- references incorrect  
- repo state unverifiable  

---

# FINAL

Devin produces minimal, reviewable draft PRs.  
It stops at the draft boundary and does not proceed further.
