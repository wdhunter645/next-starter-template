---
Doc Type: operations guide
Audience: AI agents and repository maintainers
Authority Level: operational
Owns: Cross-agent operating rules and handoff expectations
Does Not Own: Canonical product design, source Issue scope, or CI implementation details
Canonical Reference: AGENTS.md
Last Reviewed: 2026-05-09
---

# Cross-Agent Operating Rules

## Purpose

This document makes LGFC repository work repeatable across ChatGPT, Codex, Cursor, Copilot, Gemini, Cubic, Deepwiki, Semgrep, and future agents.

## Shared rules

All agents must:

1. Read `AGENTS.md` first.
2. Use the relevant `.agents/skills/*/SKILL.md` file when the task matches a skill trigger.
3. Follow the source Issue exactly.
4. Preserve canonical design and governance references.
5. Keep diffs narrow and reviewable.
6. Run applicable checks.
7. Report limitations without guessing.

## Role mapping

- Design agents define scope and acceptance criteria.
- Execution agents edit files only within the approved scope.
- Verification agents check the diff, tests, docs, and policy compliance.
- Governance agents enforce Issue-first workflow, file allowlists, labels, and documentation authority.
- Troubleshooting agents isolate failure, prefer rollback-first correction, and document evidence.
- Worklist agents track status without changing product behavior.

## Handoff contract

A valid handoff includes:

- What changed.
- Why it changed.
- Source Issue.
- Files touched.
- Verification performed.
- Remaining risks.

## Drift control

If an agent finds useful but out-of-scope work, it must not include that work in the current PR. It must create or recommend a separate Issue instead.

## Enforcement

The repository enforces this structure through:

- Root `AGENTS.md`.
- Repo-scoped skill files.
- Documentation checks.
- Agent governance checks.
- PR issue-accounting checks.
- Intent labels and file allowlists.
