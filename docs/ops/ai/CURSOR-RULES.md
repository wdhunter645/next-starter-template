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

Location (authoritative):  
`/docs/ops/ai/CURSOR-RULES.md`

Purpose:

Execution discipline for Cursor AI when working with this repository.

---

# Authority Model

Cursor must obey the highest applicable authority in this order:

1. locked design / platform / governance documents
2. operational trackers
3. `/docs/ops/ai/AGENT-RULES.md`
4. `/Agent.md`
5. `/docs/ops/ai/CURSOR-RULES.md`
6. current approved task prompt

If a lower-level instruction conflicts with a higher-level authority, Cursor must stop and follow the higher-level authority.

---

# Core Execution Rule

One task → one thread → one prompt → one deliverable.

Never reuse Cursor threads for implementation work.

---

# Required Context Before Execution

Before editing files, Cursor must read:

- `/Agent.md`
- `/docs/ops/ai/AGENT-RULES.md`
- `/docs/ops/ai/CURSOR-RULES.md`
- task-relevant tracker entries
- task-relevant design / governance docs named in the prompt

Cursor must work from repository authority plus the current approved task prompt.  
It must not fill gaps with assumptions.

---

# Analysis-First Rule

Implementation tasks must begin with analysis / diff mode.

Cursor must first produce a proposed change plan or proposed diffs only.

During analysis phase Cursor must not:

- edit files
- run build or git commands
- create branches
- commit changes
- open PRs

Stop after analysis and wait for approval when the task requires review before execution.

---

# Approved Execution Phase

After approval, Cursor may:

- edit only the approved files
- run only the commands needed for the approved task
- create a branch only if instructed
- open a PR only if instructed
- produce verification evidence tied to the accepted scope

Execution must match the reviewed plan.

If new work is discovered, stop and report it separately.

---

# File and Scope Control

Cursor must not:

- create duplicate governance files
- invent new canonical filenames
- create variant files when an existing canonical file should be updated
- rename, relocate, or split authority files unless explicitly instructed
- edit unrelated files for convenience
- mix multiple intents in one deliverable

If documentation updates are required, touch only the approved canonical files for that task.

---

# Tracker Update Rule

If a task explicitly requires tracker updates, Cursor may touch only the approved tracker files:

- `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `/docs/ops/trackers/THREAD-LOG_Master.md`

Tracker edits must preserve historical content unless the task explicitly authorizes reconstruction work.

---

# Commit / PR Discipline

Cursor must not:

- commit before approved edits are complete
- create cleanup commits outside task scope
- open mixed-intent PRs
- bypass label / allowlist / governance expectations defined by the repo

One PR should map to one task intent and one allowed file-touch pattern.

---

# Prohibited Behavior

Cursor must not:

- stack prompts in the same thread
- silently fix unrelated issues
- modify package or config files unless the task explicitly requires it
- rewrite docs outside scope
- create alternative rule files because naming seems preferable
- continue execution through ambiguity

---

# Post-Task Review Checklist

Before considering a deliverable complete, Cursor must verify:

1. only approved files changed
2. no duplicate authority file was created
3. no mixed intent was introduced
4. required docs updates were included if the task required them
5. the deliverable is ready for human review

---

# Final Rule

Cursor is the scoped execution engine.  
It must stay inside the approved lane and stop at the lane boundary.
