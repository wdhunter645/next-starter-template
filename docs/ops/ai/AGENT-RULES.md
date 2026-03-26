---
Doc Type: Operational Rules
Audience: Human + AI
Authority Level: Operational
Owns: Shared AI agent operating rules and discipline for this repository
Does Not Own: Repository design authority; governance policies; tracker status truth
Canonical Reference: /Agent.md
Last Reviewed: 2026-03-21
---

# AGENT-RULES.md

Location (authoritative):  
`/docs/ops/ai/AGENT-RULES.md`

Purpose:

Shared operating rules for all AI agents working in this repository, including ChatGPT, Cursor, Copilot, and other task execution agents.

---
# Agent-Specific Rules Enforcement

If an agent-specific rules file exists for the active agent, the agent must read it before:

- editing files
- creating a branch
- pushing commits
- opening or updating a PR
- making repository status claims

Approved agent-specific rules files currently include:

- `/docs/ops/ai/CHATGPT-RULES.md`
- `/docs/ops/ai/CURSOR-RULES.md`
- `/docs/ops/ai/COPILOT-RULES.md`
- `/docs/ops/ai/DEVIN-RULES.md`

Agent-specific rules are binding but subordinate to repository authority and this file.

Agents must not claim compliance with repository rules unless their agent-specific rules file was read for the current task.

If an agent opens a PR without following its agent-specific rules file, that PR is considered non-compliant by default.

---

# Required Repository Authority

Agents must obey the highest applicable authority in this order:

1. locked design / platform / governance documents
2. operational tracker documents
3. `/docs/ops/ai/AGENT-RULES.md`
4. `/Agent.md`
5. agent-specific rules
6. temporary task prompts

If a lower-level instruction conflicts with a higher-level document, the higher-level document wins.

---

# Required Reads Before Repository Claims

Before claiming repository status, implementation state, design alignment, task completion, or blocker status, an agent must read and verify the relevant files.

Minimum verification set for most website implementation threads:

- `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- `/docs/reference/design/fanclub.md`
- `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `/docs/ops/trackers/THREAD-LOG_Master.md`
- relevant governance, workflow, or platform file for the task being discussed

No guessing.

---

# Source of Truth Handling

When a repository ZIP is attached:

- treat the ZIP as the active working snapshot
- inspect actual file contents before making claims
- do not rely on memory over the ZIP
- do not rely on prior thread assumptions if the ZIP is newer

If thread context becomes unreliable for ZIP-based work, stop and move the work to a fresh thread with a fresh ZIP.

---

# Drift Prevention Rules

Agents must not:

- redesign routes, labels, layout structure, or access boundaries
- create duplicate governance files when a canonical file already exists
- create case-variant duplicates of existing folders or files
- create alternate rule files when a canonical rule file already exists
- mix multiple intents in a single deliverable unless the task explicitly allows it
- widen scope because another issue was discovered during execution

If adjacent work is discovered, record it for follow-up. Do not bundle it silently.

---

# One-Task Discipline

Repository work follows strict task isolation:

- one task per thread
- one deliverable per thread
- one PR per intent
- one closeout entry per completed thread

This rule exists to reduce drift, preserve review quality, and keep tracker history reliable.

---

# Documentation Discipline

When a task changes implementation status, closeout state, or repository governance state, update the canonical tracker files only:

- `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `/docs/ops/trackers/THREAD-LOG_Master.md`

Tracker edits must be append-preserving. Do not delete or rewrite historical entries unless the task explicitly authorizes historical reconstruction.

Agents must not invent alternate tracker locations.

---

# Verification Doctrine

Agents must prefer:

1. file inspection
2. configuration validation
3. dependency and workflow verification
4. rollback-first reasoning for incidents
5. deterministic validation steps

Avoid speculative redesign during diagnosis.

---

# Capabilities / Permissions
- ChatGPT has direct API access to the repository
- ChatGPT is responsible for creating ALL Pull Requests
- PR creation is NOT delegated unless explicitly stated
- ChatGPT acts as the primary PR execution layer for repository operations

---

# PR Discipline

For PR-based work:

- the PR body is the execution contract
- the file-touch allowlist is binding
- out-of-scope files are forbidden unless the PR is explicitly classified as recovery
- recovery PRs may use looser scope only when clearly declared and justified
- agents must not self-expand a PR beyond its approved intent

For agent-generated PRs:

- draft PR is the default unless the task explicitly authorizes ready-for-review status
- the PR body must accurately identify the active task, scope, risks, and exact files changed
- incorrect task numbers, incorrect issue references, or copied notes from unrelated work are trust failures
- breaking changes must be disclosed explicitly in the PR body
- after opening a draft PR, the agent must stop unless explicitly instructed to continue

---

# Monitoring and Alerting Alignment

AI management must stay aligned with PR monitoring.

That means:

- rule files must not create a second authority tree
- agent-specific rules must remain subordinate to this file
- workflows may report PASS / FAIL and scope violations on PRs
- monitoring comments inform review; they do not override repository authority

---

# Mandatory Stop Conditions

Stop immediately and report when:

- instructions conflict with higher-authority docs
- repository state cannot be verified
- the requested action would create duplicate authority
- there is material ambiguity
- acceptance criteria cannot be met inside scope

---

# Final Rule

Repository documents define behavior.  
AI rules enforce discipline.  
Session prompts provide current objective only.
