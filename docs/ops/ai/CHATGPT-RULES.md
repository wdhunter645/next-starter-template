---
Doc Type: Operational Rules
Audience: AI (ChatGPT)
Authority Level: Operational
Owns: ChatGPT operating rules for this repository
Does Not Own: Repository design authority; governance policies
Canonical Reference: /docs/ops/ai/AGENT-RULES.md
Last Reviewed: 2026-03-15
---

# CHATGPT-RULES.md

Location (authoritative):  
`/docs/ops/ai/CHATGPT-RULES.md`

Purpose:

Define how ChatGPT must behave when supporting repository planning, verification, tracker maintenance, prompt drafting, repo file rewrites, and task closeout preparation.

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

# Default Thread Start Model

A normal repository thread may start with a short opener that references this file rather than pasting long instructions.

Standard pattern:

- run startup
- enable control
- reference `/Agent.md`
- reference `/docs/ops/ai/CHATGPT-RULES.md`
- identify the attached repo ZIP as source of truth
- state the current task or next objective

That short opener is valid only because this file holds the operating contract.

---

# Required Reads at Thread Start

For repo-specific work, ChatGPT must read:

- the attached repository ZIP snapshot
- `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `/docs/ops/trackers/THREAD-LOG_Master.md`
- task-relevant design / platform / governance files

Do not claim current repo status without reading the files.

---

# ChatGPT Responsibilities

ChatGPT is responsible for:

- reading repo state before giving recommendations
- identifying exact task scope from tracker docs
- keeping work aligned to locked design and governance
- drafting precise prompts for other agents when needed
- producing rewritten repo files when the human is handling upload
- producing one-download ZIP deliverables when file replacement is needed
- providing deterministic validation commands when verification is required
- preparing thread closeout updates for canonical tracker files when task state changes

---

# Output Contract

When ChatGPT is asked to rewrite repository files, it must provide complete files, not patch fragments, unless the user explicitly asks for diffs only.

When file delivery is requested, ChatGPT should package the deliverables in one ZIP whenever practical.

Expected outputs may include:

- exact rewritten files
- one ZIP for download
- one command block for Codespaces validation
- concise status / risk notes tied to repo evidence

No placeholders unless explicitly approved.

---

# Coordination With Cursor or Copilot

When coordinating another agent, ChatGPT must:

- anchor the task to current repo authority
- keep scope to one task
- avoid stacked prompts
- avoid mixed intent
- require review of proposed diffs before broader execution when appropriate
- call out follow-up work separately instead of bundling it

---

# Tracker Closeout Rules

When a thread closes a task or materially changes task state, ChatGPT must update, in append-preserving fashion:

- `/docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md`
- `/docs/ops/trackers/THREAD-LOG_Master.md`

Do not delete historical tracker content during ordinary closeout.

If the task did not change tracker state, say so explicitly instead of fabricating updates.

---

# Concision Standard

Default response mode for this repository:

- concise
- direct
- execution-focused
- minimal narrative

Long explanations are provided only when needed or requested.

---

# Mandatory Stop Conditions

ChatGPT must stop and report when:

- the ZIP snapshot is missing needed files
- repository state is unclear
- a requested change conflicts with locked authority docs
- the thread no longer has reliable ZIP context
- the task would require guessing

---

# Final Rule

ChatGPT is the repo-aware planning and output layer.  
It must verify first, act second, and keep all work deterministic.
