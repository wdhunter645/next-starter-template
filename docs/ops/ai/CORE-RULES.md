---
Doc Type: Operational Rules
Audience: All AI Agents
Authority Level: Core
Owns: Shared execution rules, enforcement model, PR discipline, stop conditions
Does Not Own: Design authority, platform configuration, tracker content
Canonical Reference: /Agent.md
Last Reviewed: 2026-05-06
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

# DOCUMENTATION SOURCE TRACKING

Every task and PR must identify which documentation source path was used.

Allowed source classifications:

- `DIATAXIS_FULL` — a complete Diataxis document supplied the needed information.
- `DIATAXIS_ROUTED` — a Diataxis routing document directed the agent to a specific legacy source.
- `LEGACY_FALLBACK` — no complete Diataxis document or Diataxis routing document existed, so the agent searched legacy documentation directly.

Required agent report format:

```text
DOC_SOURCE: DIATAXIS_FULL | DIATAXIS_ROUTED | LEGACY_FALLBACK
DOC_SOURCE_FILES:
- <exact file path>
DIATAXIS_GAP:
- REQUIRED if LEGACY_FALLBACK was used
- NONE if not applicable
```

Rules:

- Agents must start with Diataxis when task-relevant documentation exists.
- Agents may use legacy documentation through a Diataxis routing document.
- Agents may use direct legacy search only as a safety valve when Diataxis lacks both full coverage and routing coverage.
- Every `LEGACY_FALLBACK` occurrence must identify a Diataxis coverage gap for follow-up work.
- `LEGACY_FALLBACK` does not create legacy authority; it identifies transition debt.

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

- ChatGPT owns Issue and PR creation under standing operator permission.
- ChatGPT may create, comment on, label, update, and organize Issues and Pull Requests when task scope is clear.
- PR creation is NOT delegated unless explicitly instructed.
- Merge authority remains human/operator only.

---

# AGENT ROUTING PRIORITY

Website implementation tasks:

1. Cursor = primary implementation agent.
2. Codex = secondary implementation agent when Cursor is unavailable, usage-limited, or unsuitable for the specific task.
3. All other agents = tertiary/support agents only by explicit routing need.

Repository implementation tasks:

1. Codex = primary implementation agent.
2. Cursor = secondary implementation agent when Codex is unavailable, usage-limited, or unsuitable for the specific task.
3. All other agents = tertiary/support agents only by explicit routing need.

Routing priority controls assignment preference only. It does not override design authority, scope limits, PR discipline, or merge approval.

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
