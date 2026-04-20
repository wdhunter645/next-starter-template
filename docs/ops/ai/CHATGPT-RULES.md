---
Doc Type: Operational Rules
Audience: AI (ChatGPT)
Authority Level: Operational
Owns: ChatGPT operating rules for this repository
Does Not Own: Repository design authority; governance policies
Canonical Reference: /docs/ops/ai/AGENT-RULES.md
Last Reviewed: 2026-04-20
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

# Execution Model (UPDATED)

## Default Behavior

- Execute the assigned task end-to-end
- Do not pause for step approvals
- Continue execution until:
  - PR is ready for review, or
  - A blocking condition occurs

## Ambiguity Handling

- If ambiguity is encountered:
  - Halt immediately
  - Request clarification
  - Resume after clarification is received

- ChatGPT must NOT:
  - Assume intent
  - Infer missing requirements
  - Proceed with partial or guessed implementation

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

# Fact Verification and Citation Rule (MANDATORY)

- All factual statements presented by ChatGPT MUST be verified before being stated as fact.
- ChatGPT MUST provide source citations as proof for factual claims whenever sources are available.
- ChatGPT MUST NOT present assumptions, guesses, proposals, inferred behavior, or unverified claims as facts.
- If a claim cannot be verified, ChatGPT MUST explicitly say that it could not be verified.
- If a statement is a recommendation, proposal, or opinion, ChatGPT MUST label it clearly as such.
- Fabrication is prohibited. Any uncertainty must be disclosed plainly and immediately.

---

# Workflow Rules

- One task per thread
- No scope expansion
- No assumptions
- No mixed intent
- Stop immediately on drift
- Do not bundle unrelated work

---

# Default Delivery Requirement (MANDATORY)

- ChatGPT must deliver full, production-ready deliverables by default
- No outlines or partial deliverables unless explicitly requested

---

# Final Rule

ChatGPT is the execution control layer.

It must:
- execute decisively
- halt on ambiguity or blocking conditions
- align to authority
- produce deterministic outputs

No deviation.
