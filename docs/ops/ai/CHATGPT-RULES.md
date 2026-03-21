---
Doc Type: Operational Rules
Audience: AI (ChatGPT)
Authority Level: Operational
Owns: ChatGPT operating rules for this repository
Does Not Own: Repository design authority; governance policies
Canonical Reference: /docs/ops/ai/AGENT-RULES.md
Last Reviewed: 2026-03-21
---

# CHATGPT-RULES.md

Location (authoritative):  
`/docs/ops/ai/CHATGPT-RULES.md`

---

# Purpose

Define how ChatGPT must behave when supporting:

- website implementation (#website mode)
- repository operations (#repository mode)
- planning, validation, PR creation, agent coordination
- tracker maintenance and task closeout

This file is the **execution contract** for all ChatGPT behavior.

---

# Authority Model

ChatGPT must obey the highest applicable authority in this order:

1. locked design / platform / governance documents  
2. operational trackers  
3. `/docs/ops/ai/AGENT-RULES.md`  
4. `/docs/ops/ai/CHATGPT-RULES.md`  
5. chat thread prompt  

Persistent memory provides context.  
Repository files and attached ZIP snapshots define truth.

---

# Execution Binding (MANDATORY)

When a thread references this file:

- All execution MUST follow this document strictly
- No deviations are allowed
- Do not partially apply rules
- Do not reinterpret rules

---

# Mode System (FOUNDATIONAL)

Every thread operates in exactly one mode:

- `#website`
- `#repository`

Mode defines:
- allowed tools
- deliverables
- workflow
- closeout behavior

Mode must not be mixed.

---

# Mode Enforcement

Once MODE is defined:

- All behavior MUST follow that mode only
- Do not cross-use tools between modes
- Do not produce outputs from another mode
- Stop if instructions conflict with mode

---

# Required Reads at Thread Start

ChatGPT must read:

- attached repository ZIP snapshot
- task-relevant design / governance docs

IF MODE = `#website`, ALSO read:

- `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `/docs/ops/trackers/THREAD-LOG_Master.md`

Do not claim repo state without reading.

---

# Alignment Gate (MANDATORY)

Before any execution:

1. Restate task in 1–3 lines  
2. Confirm exact scope (files, systems, PR vs files vs config)  
3. Identify risks / unknowns  
4. STOP and wait for CONFIRM  

No execution without confirmation.

---

# Execution Model

## IF MODE = #website

- Cursor = ALL implementation (code, files, updates)
- ChatGPT = research, design, validation, PR template creation, Cursor PR prompt creation
- Copilot = NOT used

## IF MODE = #repository

- Copilot = ALL implementation (PRs, workflows, repo changes)
- ChatGPT = research, design, validation, PR template creation
- Cursor = NOT used

---

# Workflow Rules

- One task per thread
- No scope expansion
- No assumptions
- No mixed intent
- Stop immediately on drift
- Do not bundle unrelated work

---

# Deliverables Model

## IF MODE = #website

ChatGPT must produce:

1. Research / design / validation
2. PR template (for PR creation)
3. Cursor PR prompt (for implementation)
4. Rewritten files ONLY if required

File handling:

- Files may be created by ChatGPT
- Human uploads files to repository BEFORE PR work begins
- PR must assume files already exist
- PR scope = integration, configuration, validation, documentation

ZIP usage:

- Provide one ZIP ONLY when file rewrites are required
- Do not generate ZIP unnecessarily

---

## IF MODE = #repository

ChatGPT must produce:

1. Research / design / validation
2. PR template

Rules:

- All work executed via PR
- One PR = one task
- No tracker usage
- No ZIP output unless explicitly required

---

# Coordination Rules (Cursor / Copilot)

ChatGPT must:

- anchor all work to repo authority
- keep scope to one task
- avoid stacked prompts
- avoid mixed intent
- ensure PR template defines exact scope
- ensure agent prompt enforces file allowlist
- require minimal, deterministic changes only

---

# Tracker Rules (#website ONLY)

Trackers are authoritative logs.

Required files:

- `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `/docs/ops/trackers/THREAD-LOG_Master.md`

Rules:

- align all work to tracker state
- reflect task progress accurately
- never fabricate updates

---

# Thread Closeout Rules (#website ONLY)

When task state changes:

Update (append-only behavior):

- `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `/docs/ops/trackers/THREAD-LOG_Master.md`

File delivery:

- provide updated files as ZIP for human upload

---

# Content Preservation Rule (CRITICAL)

For tracker files:

- Existing content MUST NOT be deleted or removed
- Only append new entries OR update existing entries in place where required
- Full historical record must be preserved

This rule applies ONLY to tracker files.

---

# Output Contract

ChatGPT must provide:

- complete files (not fragments) unless diff requested
- one ZIP when delivering multiple files
- one command block for verification when needed
- concise, execution-focused output

No placeholders unless approved.

---

# Mandatory Stop Conditions

Stop and report when:

- ZIP snapshot is incomplete
- repo state is unclear
- task conflicts with authority docs
- instructions violate mode rules
- task requires guessing
- thread has lost reliable repo context

---

# Success Criteria

- Task completed
- Mode rules followed
- No drift
- Scope preserved
- Deliverables correct
- Validation complete

---

# Final Rule

ChatGPT is the execution control layer.

It must:
- verify first
- align to authority
- enforce mode
- produce deterministic outputs

No deviation.
