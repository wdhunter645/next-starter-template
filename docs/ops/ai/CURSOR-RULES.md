---
Doc Type: Operational Rules
Audience: AI (Cursor)
Authority Level: Operational
Owns: Cursor AI execution discipline for this repository
Does Not Own: Repository design authority; governance policies
Canonical Reference: /docs/ops/ai/AGENT-RULES.md
Last Reviewed: 2026-03-15
---

# CURSOR-RULES.md
Location: /docs/ops/ai/CURSOR-RULES.md
Purpose: Execution discipline for Cursor AI when working with this repository.

---

## Authority Level

Cursor must obey the highest applicable authority in this order:

1. Locked design / standards docs
2. Repo governance docs
3. AGENT-RULES.md
4. CURSOR-RULES.md
5. Cursor task prompt

If a lower-level instruction conflicts with a higher-level authority, Cursor must stop and follow the higher-level authority.

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
4. Keep the task scoped to one deliverable
5. Close the thread after the deliverable is produced

---

## Analysis-First Rule

Implementation tasks must begin with analysis / diff mode.

Cursor must first produce:

PART 1 — PROPOSED DIFFS ONLY

No commands
No commits
No branches
No PR creation
No file edits

Stop after diff output.

END OF PART 1 — WAITING FOR APPROVAL

Cursor must not proceed beyond analysis until approval is explicitly given.

---

## Execution Phase

After approval:

- Cursor may create a branch if instructed
- Cursor may apply only the approved edits
- Cursor may run only the commands needed for the approved task
- Cursor may update only files within the approved task scope
- Cursor may open a PR only if instructed

Execution must follow the reviewed diff.

If new work is discovered during execution, Cursor must stop and report it rather than silently expanding scope.

---

## File and Scope Control

Cursor must not:

- create duplicate governance or authority files when a canonical file already exists
- introduce a second source of truth for the same ruleset
- rename, relocate, replace, or split authority files unless explicitly instructed
- edit unrelated files for convenience
- combine multiple intents into one deliverable

When a requested change overlaps an existing canonical rules file, Cursor must consolidate the update into the canonical file instead of creating a parallel document.

---

## Commit and Branch Discipline

Cursor must not:

- create branches before approval
- commit changes before diff review
- commit changes before human review when review is required by task instructions
- make autonomous cleanup commits outside the approved task

Any branch, commit, or PR activity must remain strictly tied to the approved scope.

---

## Prohibited Behavior

Cursor must not:

- run commands during analysis phase
- modify files without authorization
- stack prompts in the same thread
- make speculative fixes
- silently resolve unrelated failures
- widen task scope without approval
- create conflicting docs that duplicate existing operational authority

---

## Post-Task Review

Before a deliverable is considered complete, Cursor should verify that:

1. only approved files changed
2. no duplicate rule or authority file was created
3. the deliverable matches the requested task intent
4. no unrelated cleanup or refactor was bundled in
5. the final output is ready for human review

---

## Purpose

These rules prevent:

- agent drift
- prompt stacking
- context pollution
- accidental repository modification
- duplicate sources of truth
- mixed-intent pull requests

They enforce deterministic, reviewable AI-assisted development.
