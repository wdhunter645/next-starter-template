---
Doc Type: Operational Rules
Audience: All AI Agents
Authority Level: Core
Owns: Shared execution rules, enforcement model, PR discipline, stop conditions
Does Not Own: Design authority, platform configuration, tracker content
Canonical Reference: /docs/ops/ai/SHARED-AGENT-RULES.md
Last Reviewed: 2026-06-04
---

# CORE-RULES.md

## Purpose

This document is the **detailed expansion** of shared AI-agent execution rules, including PR discipline, verification behavior, drift prevention, PR gate-readiness troubleshooting, and mandatory stop conditions.

For the categorized shared agent law index (evidence-first work, one issue per PR, parser-safe PR bodies, gates, documentation taxonomy, ZIP safety, secrets, and scope boundaries), read [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md) first. Keep both documents aligned; do not weaken restrictions in either file.

## Mandatory documentation chain

Before any repo work, every agent must follow the chain defined in [`Agent.md`](../../../Agent.md):

[`Agent.md`](../../../Agent.md) → [`SHARED-AGENT-RULES.md`](./SHARED-AGENT-RULES.md) → this document → applicable agent-specific rule file → applicable repo governance/procedure docs → applicable `.agents/skills/*/SKILL.md` files.

Rules:

- Start at `Agent.md`; do not skip shared or core rules.
- Agent-specific rules are additive; they never replace shared law or repo governance.
- For PR, issue, review, remediation, and implementation work, read `.agents/skills/lgfc-pr-governance/SKILL.md` and `.github/pull_request_template.md` before opening or updating a PR.
- Task prompts and subagent instructions do not override this chain.
- If a required source issue is missing, stop before PR creation.

## Scope

This document applies to all AI agents working in this repository. It governs agent behavior, not product design, runtime architecture, platform configuration, or final merge authority.

## Current Known Truth

Repository governance is DIATAXIS-first, PRs are issue-scoped, and human/operator approval remains required for merge. PR gate-readiness troubleshooting requires correlated inspection of PR panel state, issue-accounting, review threads, PR body accounting, latest head workflow runs, failed job logs, and workflow implementation behavior.

GitHub Issues and Pull Requests are the authoritative execution record for normal implementation work. Tracker files are historical/status indexes and are not routine implementation closeout ledgers.

## Intended Final State

Agents should execute repository work predictably: one task per thread, one issue per task, one PR per implementation, all required gates passing, no scope drift, and no claims without verification against repository files and live PR state.

Normal implementation PRs should complete through the source Issue and PR lifecycle without a second tracker-update PR.

---

# EXECUTION DISCIPLINE

- One task → one thread → one deliverable
- One task → one Issue → one PR
- No mixed intent
- No scope expansion
- No routine tracker-update PRs for normal implementation tasks

If additional work is discovered → log it in the source Issue or PR, do not execute it.

---

# ISSUE-FIRST PR DISCIPLINE

Normal repository work must be Issue-first.

Rules:

- Create or identify the source Issue before creating a Pull Request.
- The PR must explicitly link to the source Issue.
- The source Issue remains the task authority for implementation, review, post-merge verification, and closure.
- Open PR count must stay limited and purposeful.
- PR-first work is an exception, not the default.
- Auto-created OPS tracker Issues are allowed only for legitimate operations troubleshooting or PR-first exceptions where a PR exists before a task Issue.
- OPS tracker Issues must not replace, override, or hijack the source task Issue.
- Post-merge validation must report against the source task Issue when one exists.
- Merge authority remains human/operator only.

---

# CURSOR-STYLE PR PREFLIGHT STANDARD

All agents must follow the execution pattern that has produced the lowest-friction PRs:

1. Confirm exactly one same-repository, open, non-PR source Issue.
2. Read the source Issue and only the task-relevant authority documents linked by that Issue.
3. Define an exact changed-file allowlist before implementation.
4. Keep the final diff inside the allowlist.
5. Use exactly one intent label.
6. Run task-relevant local checks before marking the PR ready.
7. Update the PR body so the allowlist, change summary, acceptance criteria, and verification evidence match the final diff.
8. Do not include unrelated tracker, documentation, runtime, workflow, or cleanup edits.
9. Stop when the scoped PR is ready for review or blocked by a documented gate.

This standard applies to Cursor, Codex, ChatGPT, Copilot, and any future implementation agent.

---

# OPERATIONAL TRUTH HIERARCHY

When PR readiness signals conflict, agents must use this order of authority:

1. live PR check panel state
2. latest head workflow runs and failed job logs
3. workflow files and enforcement scripts in the repository
4. GitHub review-thread state
5. PR body issue-accounting and reviewer-accounting sections
6. governance and AI operational documentation
7. prior conversation memory or agent assumptions

Rules:

- Workflow implementation and live CI results outrank assumptions or intended behavior.
- Gate behavior must be documented from actual workflow files, enforcement scripts, and CI logs.
- Undocumented exception paths must not be treated as current enforcement behavior.
- A gate is fixed only after the live PR panel and latest head workflow state support that claim.

---

# PR GATE READINESS TROUBLESHOOTING

When preparing any PR for merge approval, agents must validate all required gate classes, not only reviewer response.

Required sequence:

1. inspect the live PR check panel before relying on commit-scoped workflow runs
2. confirm PR issue-accounting uses exactly one same-repository, open, non-PR Issue reference as the primary source Issue
3. inspect PR body sections, file-touch allowlist, ZIP safety, source authority, acceptance criteria, and issue/reviewer accounting sections
4. inspect GitHub review-thread state and resolve addressed threads directly in PR review state
5. inspect the latest head workflow runs for every required gate
6. inspect failed job logs for any failing gate, including PR issue-accounting, reviewer-response gates, intent labeling, drift control, docs guardrails, quality checks, ZIP safety, and secret scanning
7. inspect relevant workflow files or enforcement scripts before documenting gate behavior or exception paths
8. patch the underlying content, workflow, PR body, issue link, or review-state defect
9. add a later maintainer acknowledgment for any high-severity review-level finding required by the gate logs
10. rerun or wait for gate evaluation and verify the live PR check panel plus latest gate runs together

Rules:

- The live PR check panel is authoritative for merge readiness.
- A green reviewer gate alone does not mean the PR is ready for merge approval.
- PR issue-accounting must be checked separately from reviewer response.
- The PR issue-accounting gate currently requires exactly one primary `Issue:` reference to one same-repository, open, non-PR issue.
- Design-compliance warnings and manually dispatched deployment workflows are not current blocking PR gate classes unless the live PR panel shows them as failing required checks.
- Reviewer-accounting, thread-resolution state, issue-accounting, review-level acknowledgments, latest job logs, workflow behavior, and all required checks must be reconciled together.

Canonical governance authority:

- `docs/governance/standards/governance-enforcement-standard.md`

---

# REQUIRED VERIFICATION

Before making any claim, agents MUST:

- read the source Issue
- read task-relevant design, architecture, governance, or implementation-plan files linked from the source Issue
- inspect the actual changed files and live PR state before readiness or closeout claims

Tracker files may be read for verification when relevant. Tracker files are updated only when the source Issue explicitly includes tracker governance, tracker reconciliation, or tracker/status-index edits in scope.

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
- add tracker/status-index edits to implementation PRs unless the source Issue explicitly authorizes them

---

# PR DISCIPLINE

- PR body = execution contract
- File allowlist = hard boundary
- Out-of-scope edits = forbidden
- Source Issue link = required except documented PR-first operations exceptions
- Tracker/status-index edits = forbidden unless explicitly in the source Issue scope

Defaults:

- PR = draft
- Stop after PR creation unless instructed

---

# AGENT COMPLETION DEFINITION

An implementation agent is not complete when code is pushed or a PR is opened.

The agent's task is complete only when all of the following are true:

1. The PR body is updated to match the final diff, source issue, allowlist, verification evidence, and reviewer-response accounting.
2. All reviewer comments, bot comments, and review threads have been inspected.
3. Every actionable reviewer item has either been fixed, rejected with rationale, marked not applicable, or linked to a bounded follow-up issue using the required PR-body disposition format.
4. All required gates have passed on the latest PR head after the final code and PR-body updates.
5. The PR status is changed from DRAFT/BLOCKED to READY FOR REVIEW, or the agent explicitly reports the exact blocker preventing readiness.
6. The agent's final report includes the current head SHA, exact checks run, gate status, reviewer disposition status, and whether the PR is READY FOR REVIEW.

A PR must not be handed to Atlas/Bill for review while any required gate, reviewer comment, bot comment, review thread, PR-body section, or source-issue accounting item still requires agent action.

---

# CAPABILITIES

- ChatGPT owns Issue and PR creation under standing operator permission.
- ChatGPT may create, comment on, label, update, and organize Issues and Pull Requests when task scope is clear.
- Issue-first discipline remains mandatory unless the work is a legitimate PR-first operations troubleshooting exception.
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

# TRACKER / STATUS-INDEX RULES

Tracker files are historical/status indexes, not routine implementation ledgers.

Only allowed tracker files:

- /docs/ops/trackers/IMPLEMENTATION-WORKLIST_Master.md
- /docs/ops/trackers/THREAD-LOG_Master.md

Rules:

- Do not update tracker files during normal website, CI, repository, or documentation implementation PRs.
- Update tracker files only when the source Issue explicitly authorizes tracker governance, tracker reconciliation, or status-index maintenance.
- Preserve append-only history when tracker edits are authorized.
- Do not create alternate trackers.
- GitHub Issues and PRs are the authoritative execution record for task status and closure.

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
- scope is unclear
- repo state is unclear
- required source Issue is missing
- changed-file allowlist is missing
- live PR state cannot be verified for a readiness claim
