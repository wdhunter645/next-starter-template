---
Doc Type: Operational Rules
Audience: AI (Cursor)
Authority Level: Agent-Specific
Owns: Cursor execution behavior
Does Not Own: Shared agent law, design authority, governance, or merge approval
Canonical Reference: /docs/ops/ai/SHARED-AGENT-RULES.md
Last Reviewed: 2026-06-04
---

# CURSOR-RULES.md

Purpose: Defines **Cursor-specific** execution behavior for local and cloud agent sessions.

Shared agent law: [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md).  
Detailed shared execution: [`CORE-RULES.md`](./CORE-RULES.md).

---

# THREAD DISCIPLINE

- One task → one Cursor thread  
- Never reuse threads  
- No stacked prompts  

---

# ANALYSIS-FIRST RULE

All work begins in analysis mode when the session or operator workflow requires plan-before-edit discipline.

Cursor MUST:

- propose plan or diff first  
- NOT edit files  
- NOT run commands  
- NOT create branches  
- NOT commit  

Stop and wait for approval before execution when that workflow applies.

Cloud Agent sessions that receive explicit "implement now" instructions from the repo workflow or source Issue may proceed when approval is already encoded in the Issue.

---

# EXECUTION ROLE

Cursor performs:

- code changes  
- file updates  
- implementation work  

Cursor does NOT:

- design solutions (unless explicitly assigned in the source Issue)  
- define scope  
- expand tasks  
- merge Pull Requests  
- push to remote or open PRs **unless** the approved GitHub Issue/PR or repository workflow explicitly instructs it  

---

# GIT, PUSH, AND MERGE (CURSOR-SPECIFIC)

Unless the source Issue or an active repository workflow (for example Cloud Agent branch instructions) explicitly instructs otherwise:

- perform **local edits and local validation only**;
- **do not** `git push`;
- **do not** merge Pull Requests;
- **do not** create PRs.

When push/PR creation is explicitly instructed:

- use the branch name and base branch specified in the Issue;
- follow [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md) for PR body and gate preflight;
- stop after PR creation unless the Issue instructs further work.

---

# APPROVED EXECUTION

After approval, Cursor may:

- edit ONLY approved files  
- run ONLY required commands  
- create a working branch ONLY if the approved GitHub Issue/PR explicitly instructs it
- open a PR ONLY if the approved GitHub Issue/PR or repository workflow explicitly instructs it

GitHub Issues created by repository automation may be implementation requests. If such an Issue explicitly says to create a branch and open a PR against `main`, that instruction is approved execution scope.

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
- shared law preflight satisfied when a PR was created or updated  

---

# STOP CONDITIONS (CURSOR-SPECIFIC)

Stop if:

- no approval received after analysis (when analysis-first applies)  
- scope unclear  
- file allowlist missing  
- instructions conflict with [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md)  
- push, merge, or PR creation requested without explicit authorization  

---

# FINAL

Cursor is the execution engine. It operates only within approved scope, respects shared agent law, and stops at boundaries — including git push and merge unless explicitly instructed.
