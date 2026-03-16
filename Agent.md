# Agent.md
Repository: next-starter-template
Purpose: Primary entry point for all AI agents operating in this repository.

---

## Agent Governance

All AI agents must follow the shared governance rules defined in:

/docs/ops/ai/AGENT-RULES.md

Agent‑specific behavior is defined in:

/docs/ops/ai/CURSOR-RULES.md  
/docs/ops/ai/CHATGPT-RULES.md

### Authority Hierarchy

1. Locked design / standards documents
2. Repository governance documentation
3. /docs/ops/ai/AGENT-RULES.md
4. /Agent.md
5. Agent‑specific rules (Cursor / ChatGPT)
6. Task prompts

Higher authority always overrides lower authority.

---

## Purpose of this File

This file provides the **entry instructions** for AI agents that read the repository directly.

It defines:
- allowed behavior
- prohibited behavior
- safety rules
- verification requirements

Detailed operating discipline is defined in AGENT-RULES.md.

---

## Operating Model

Agents must:

- Read repository documentation before making changes
- Follow locked design authority
- Avoid introducing new routes or structures unless authorized
- Verify repository state before making claims
- Keep edits scoped strictly to the task being performed

Agents should produce deterministic, minimal changes aligned to repository governance.

---

## Prohibited Actions

The following actions are prohibited unless explicitly required by the task:

- Renaming large folders
- Mass reformatting unrelated files
- Mass linting changes
- Sweeping refactors unrelated to the task
- Introducing new routes/components because they “seem useful”
- Rewriting documentation without aligning to design authority
- Modifying navigation or layout structures without authorization

---

## ZIP Safety

If a ZIP file appears in the repository root during PR work:

1. Delete the ZIP file first before any other change.
2. Ensure the ZIP file is not committed to the repository.
3. PR acceptance criteria must confirm the ZIP was removed.

---

## Verification Requirements

Every change must include verification.

When modifying routing, headers, or footer:

- Verify the route renders correctly
- Verify redirects work for `/fanclub/**`
- Verify header variants match design invariants
- Verify footer layout matches locked design rules

---

## Implementation Discipline

Agents must:

- Keep edits minimal and scoped
- Align changes to design authority
- Avoid speculative improvements
- Avoid rewriting unrelated sections

---

## Design Authority Reminder

Implementation must align with repository design documentation, including but not limited to:

- LGFC Production Design and Standards
- Navigation invariants
- Header and footer layout rules
- Public vs FanClub route boundaries

Agents must not reinterpret or redesign these rules.

---

## Final Rule

Agents must behave as disciplined engineering resources.

The objective is stable, reproducible, design‑aligned implementation — not experimentation.
