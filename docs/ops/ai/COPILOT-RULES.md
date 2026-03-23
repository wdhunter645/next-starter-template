---
Doc Type: Operational Rules
Audience: AI (Copilot)
Authority Level: Operational
Owns: Copilot AI execution discipline for this repository
Does Not Own: Repository design authority; governance policies
Canonical Reference: /docs/ops/ai/AGENT-RULES.md
Last Reviewed: 2026-03-21
---

# COPILOT-RULES.md

Location (authoritative):  
`/docs/ops/ai/COPILOT-RULES.md`

Purpose:

Execution discipline for GitHub Copilot and Copilot-powered agents when working with this repository.

---

# Authority Model

Copilot must obey the highest applicable authority in this order:

1. locked design / platform / governance documents
2. operational trackers
3. `/docs/ops/ai/AGENT-RULES.md`
4. `/Agent.md`
5. `/docs/ops/ai/COPILOT-RULES.md`
6. current approved task prompt or PR body

If a lower-level instruction conflicts with a higher-level authority, Copilot must stop and follow the higher-level authority.

---

# Core Execution Rule

One task → one thread → one prompt → one deliverable.

Do not stack multiple objectives into one execution run.

---

# Required Context Before Execution

Before editing files, Copilot must read:

- `/Agent.md`
- `/docs/ops/ai/AGENT-RULES.md`
- `/docs/ops/ai/COPILOT-RULES.md`
- task-relevant tracker entries
- task-relevant design / governance docs named in the prompt or PR

Copilot must work from repository authority plus the current approved task prompt.  
It must not fill gaps with assumptions.

---

# PR-Centric Execution Model

When Copilot is asked to work on a PR:

- the PR body is the working contract
- the Change Summary defines the task
- the Allowed files list defines the file boundary
- all other files are out of scope unless the PR is explicitly marked recovery

Copilot must not treat a PR as permission to make adjacent improvements.

---

# Approved Execution Phase

Copilot may:

- edit only the approved files
- run only the commands needed for the approved task
- create a branch only if instructed
- update an existing PR only if instructed
- produce verification evidence tied to accepted scope

Execution must match the reviewed plan.

If new work is discovered, stop and report it separately.

---

# File and Scope Control

Copilot must not:

- create duplicate governance files
- invent new canonical filenames
- create variant files when an existing canonical file should be updated
- rename, relocate, or split authority files unless explicitly instructed
- edit unrelated files for convenience
- mix multiple intents in one deliverable
- widen a docs task into code work
- widen a code task into governance work

If documentation updates are required, touch only the approved canonical files for that task.

---

# Tracker Update Rule

If a task explicitly requires tracker updates, Copilot may touch only the approved tracker files:

- `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `/docs/ops/trackers/THREAD-LOG_Master.md`

Tracker edits must preserve historical content unless the task explicitly authorizes reconstruction work.

---

# Verification and Review Output

After execution, Copilot must provide:

- exact files changed
- concise diff summary
- confirmation that only approved files were touched
- any blocker or mismatch discovered

No vague completion claims.

---

# Mandatory Stop Conditions

Stop immediately and report when:

- task instructions conflict with locked design or governance docs
- repository state is unclear or cannot be verified
- multiple valid interpretations exist
- a requested change would create a second source of truth
- the task scope expands beyond the approved objective
- the PR allowlist is missing, ambiguous, or unparseable

Do not improvise around conflicts.

---

# Final Rule

Copilot is an execution tool for approved repository work.  
It does not define policy.  
It follows repository authority and approved PR scope only.
