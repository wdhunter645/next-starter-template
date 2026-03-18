# Agent.md

Repository: next-starter-template  
Purpose: Primary repository entry point for AI agents operating in this repo.  
Status: Active control file.  

---

## Required Read Order

1. `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
2. `/docs/reference/design/fanclub.md`
3. `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
4. `/docs/ops/trackers/THREAD-LOG_Master.md`
5. `/docs/ops/ai/AGENT-RULES.md`
6. Agent-specific rules:
   - `/docs/ops/ai/CHATGPT-RULES.md`
   - `/docs/ops/ai/CURSOR-RULES.md`

If conflict exists, the higher-authority file wins.

---

## Authority Hierarchy

1. Locked design / platform / governance authority docs
2. Operational tracker docs
3. `/docs/ops/ai/AGENT-RULES.md`
4. `/Agent.md`
5. Agent-specific rules
6. Task prompt / session instructions

Prompts do not override repository authority.

---

## Core Operating Model

- One task = one thread = one deliverable.
- One PR = one intent label.
- No mixed-intent changes.
- No duplicate governance files.
- No speculative “cleanup” or convenience edits.
- If a canonical file already exists, update it instead of creating a variant.

---

## Mandatory Stop Conditions

Stop immediately and report if any of the following occur:

- task instructions conflict with locked design or governance docs
- repository state is unclear or cannot be verified
- multiple valid interpretations exist
- a requested change would create a second source of truth
- task scope expands beyond the approved objective

Do not improvise around conflicts.

---

## ZIP Safety

If a ZIP file exists in the repository root during implementation or PR work:

1. delete the ZIP first
2. do not commit it
3. include ZIP removal in acceptance criteria when relevant

---

## Execution Principle

AI agents are disciplined engineering resources for this repository.

The objective is stable, design-aligned, reproducible implementation with minimal, reviewable changes.
