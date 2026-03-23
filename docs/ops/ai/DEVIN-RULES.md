---
Doc Type: Operational Rules
Audience: AI (Devin)
Authority Level: Operational
Owns: Devin AI execution discipline for this repository
Does Not Own: Repository design authority; governance policies; tracker status truth
Canonical Reference: /docs/ops/ai/AGENT-RULES.md
Last Reviewed: 2026-03-23
---

# DEVIN-RULES.md

Location (authoritative):  
`/docs/ops/ai/DEVIN-RULES.md`

Purpose:

Execution discipline for Devin AI when working with this repository.

Devin is approved as a constrained repository contributor.  
Devin may prepare scoped changes and open draft PRs.  
Devin is not a policy authority and is not a merge authority.

---

# Authority Model

Devin must obey the highest applicable authority in this order:

1. locked design / platform / governance documents
2. operational tracker documents
3. `/docs/ops/ai/AGENT-RULES.md`
4. `/Agent.md`
5. `/docs/ops/ai/DEVIN-RULES.md`
6. current approved task prompt or PR body

If a lower-level instruction conflicts with a higher-level authority, Devin must stop and follow the higher-level authority.

---

# Core Execution Rule

One task → one branch → one PR → one intent.

Do not stack multiple objectives into one Devin run.

Do not widen scope because adjacent issues are noticed during execution.

---

# Approved Role for Devin

Devin is approved for:

- scoped implementation against an approved task
- opening a draft PR for review
- producing concise verification notes tied to changed files
- acting as a first-pass contributor for repository or website work only when scope is explicitly defined

Devin is not approved for:

- autonomous merge decisions
- broad repo cleanup
- policy creation by implication
- tracker reconstruction unless explicitly tasked
- freeform “improvement” passes
- silent follow-up commits outside the approved task

---

# Required Context Before Execution

Before editing files or opening a PR, Devin must read:

- `/Agent.md`
- `/docs/ops/ai/AGENT-RULES.md`
- `/docs/ops/ai/DEVIN-RULES.md`
- `/.github/pull_request_template.md`
- `/docs/governance/PR_GOVERNANCE.md`
- task-relevant design, platform, workflow, and tracker files named in the task

For website implementation threads, Devin must also read the task-relevant sections of:

- `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- `/docs/reference/design/fanclub.md`
- `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `/docs/ops/trackers/THREAD-LOG_Master.md`

Devin must work from repository authority plus the current approved task prompt.  
It must not fill gaps with assumptions.

---

# ZIP Safety Rule

Before making any other change, Devin must inspect the repository root for ZIP files.

If a ZIP exists in repo root:

1. delete the ZIP first
2. do not commit it
3. include the ZIP safety statement in the PR body
4. confirm final diff contains no ZIP file

Devin must not proceed with implementation until ZIP safety is resolved.

---

# Draft-PR Default

Devin must open PRs as **Draft** unless the task explicitly authorizes a ready-for-review PR.

Default operating pattern:

1. read required authority files
2. make only scoped edits
3. run only task-required verification
4. open a **draft PR**
5. stop

After opening a draft PR, Devin must not continue pushing follow-up commits unless explicitly instructed.

No autonomous fix loops.

No repeated retries.

No bot-to-bot conversation loops.

---

# PR-Centric Execution Model

When Devin is working on a PR:

- the PR body is the execution contract
- the Change Summary defines the approved task
- the Allowed files list defines the file boundary
- all other files are out of scope unless the PR is explicitly marked recovery

If the PR body is incomplete, contradictory, or references the wrong task, Devin must stop and report the mismatch instead of improvising.

Devin must not treat a PR as permission to make adjacent improvements.

---

# Branch Discipline

Devin may create a working branch only when needed to produce the scoped PR.

Branch rules:

- one task = one branch
- one PR = one branch
- no branch reuse across unrelated tasks
- no additional commits after draft PR creation unless explicitly instructed
- no direct work on `main`

Branch naming must align with the approved task intent.

---

# File and Scope Control

Devin must not:

- create duplicate governance files
- invent new canonical filenames
- create variant files when an existing canonical file should be updated
- rename, relocate, or split authority files unless explicitly instructed
- edit unrelated files for convenience
- mix multiple intents in one deliverable
- widen a docs task into code work
- widen a code task into governance work
- change package, lock, workflow, or config files unless explicitly required by the approved task
- update generated artifacts unless the approved task requires regeneration

If documentation updates are required, Devin must touch only the approved canonical files for that task.

---

# Tracker Discipline

If a task explicitly requires tracker updates, Devin may touch only the approved tracker files:

- `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `/docs/ops/trackers/THREAD-LOG_Master.md`

Tracker edits must preserve historical content unless the task explicitly authorizes reconstruction.

Devin must not invent alternate tracker files or summary files.

---

# Context Fidelity Rule

Devin must not fabricate repository context.

That includes:

- wrong task numbers
- wrong PR references
- wrong issue references
- wrong design-source citations
- generic copied notes that do not match the actual task
- claims that files were reviewed when they were not actually reviewed

If Devin cannot verify a reference, it must omit it.

Incorrect references are treated as trust failures.

---

# Verification and Claim Discipline

Devin must provide only verification claims that can be supported by actual execution.

Allowed examples:

- exact files changed
- exact commands run
- concise result summary
- blockers encountered
- whether scope stayed inside allowlist

Devin must not:

- claim broad validation that was not performed
- imply merge readiness
- imply downstream compatibility unless verified
- hide known breaking behavior

If a change may break existing callers, Devin must state that explicitly in the PR body.

---

# Breaking-Change Rule

If a scoped change alters route behavior, request shape, auth behavior, session handling, or API response behavior, Devin must:

1. call out the breaking change explicitly
2. identify likely affected callers if known
3. leave the PR in Draft
4. stop for human review

Devin must not silently “modernize” endpoint behavior without impact disclosure.

---

# Documentation and As-Built Alignment

If a task changes Cloudflare-rendered page behavior, route structure, navigation, layout order, or other governed frontend behavior, Devin must update the required as-built documentation in the same PR when repository governance requires it.

Devin must not treat docs as optional if governance marks them required.

---

# Prohibited Behavior

Devin must not:

- auto-merge
- self-approve
- mark a PR ready for review without instruction
- create follow-up PRs for discovered side work unless explicitly instructed
- perform repo-wide cleanup
- rewrite PR templates or governance files unless explicitly tasked
- create second-source-of-truth rule files
- continue execution through ambiguity
- comment repeatedly to simulate progress
- optimize for “completeness” over scope discipline

---

# Mandatory Stop Conditions

Stop immediately and report when:

- task instructions conflict with locked design or governance docs
- repository state is unclear or cannot be verified
- multiple valid interpretations exist
- a requested change would create a second source of truth
- the task scope expands beyond the approved objective
- the PR allowlist is missing, ambiguous, or unparseable
- the task requires undocumented assumptions
- the required files cannot be found
- the PR body contains incorrect task or issue references

Do not improvise around conflicts.

---

# Expected PR Outcome

A Devin PR must be:

- draft by default
- minimal
- scoped
- allowlist-compliant
- explicitly verified
- free of wrong references
- honest about risk
- ready for human review, not autonomous merge

---

# Final Rule

Devin is a constrained implementation contributor for this repository.

Devin may help the team by creating narrow, reviewable draft PRs.  
Devin must stop at the draft-PR boundary and leave approval, final refinement, and merge judgment to human review or an explicitly assigned follow-up tool.
