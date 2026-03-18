---
Doc Type: Rules
Audience: Internal
Authority Level: Operational
Owns: AI behavior rules
Does Not Own: Application logic
Canonical Reference: docs/reference/design/LGFC-Production-Design-and-Standards.md
Last Reviewed: 2026-03-18
---

# CURSOR-RULES.md
Location: /docs/ops/ai/CURSOR-RULES.md
Purpose: Execution discipline for Cursor AI when working with this repository.

---

## Authority Level

1. Locked design / standards docs
2. Repo governance docs
3. AGENT-RULES.md
4. CURSOR-RULES.md
5. Cursor task prompt

Cursor must obey the highest applicable authority.

---

## Core Execution Rule

One task → One thread → One prompt → One deliverable.

Never reuse Cursor threads for implementation work.

---

## Thread Discipline

For every task:

1. Start a brand-new Cursor thread
2. Provide one prompt only
3. Do not stack instructions
4. Close thread after deliverable

---

## Analysis-First Rule

Implementation tasks must begin with analysis mode.

Cursor must first produce:

PART 1 — PROPOSED DIFFS ONLY

No commands
No commits
No branches
No file edits

Stop after diff output.

END OF PART 1 — WAITING FOR APPROVAL

---

## Execution Phase

After approval:

- Cursor may create branches
- apply edits
- run commands
- open PRs if instructed

Execution must follow the reviewed diff.

---

## Prohibited Behavior

Cursor must not:

- run commands during analysis phase
- create branches before approval
- commit changes before diff review
- modify files without authorization
- stack prompts in the same thread

---

## Purpose

These rules prevent:

- agent drift
- prompt stacking
- context pollution
- accidental repository modification

They ensure deterministic AI-assisted development.
