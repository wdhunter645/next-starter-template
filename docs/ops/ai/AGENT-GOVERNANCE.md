---
Doc Type: operations guide
Audience: AI agents and repository maintainers
Authority Level: operational
Owns: Cross-agent governance rules for LGFC repository work
Does Not Own: Canonical product design, runtime architecture, or PR template structure
Canonical Reference: AGENTS.md
Last Reviewed: 2026-05-09
---

# Agent Governance

## Purpose

This document defines the longer-form operating rules for agents working in the LGFC repository. The root `AGENTS.md` file remains the short mandatory routing law.

## Authority order

Agents must resolve conflicts in this order:

1. Source Issue scope.
2. Canonical design documentation.
3. Root `AGENTS.md`.
4. Repository skill files under `.agents/skills/`.
5. Governance documentation under `docs/governance/`.
6. Operational AI guidance under `docs/ops/ai/`.
7. Historical thread logs and tracker context.

When sources conflict, use the higher authority and document the conflict in the PR.

## Agent operating model

Agents must:

- Work from one source Issue.
- Keep scope narrow.
- Use the relevant repository skill before implementation.
- Preserve existing repository conventions.
- Avoid mixed-intent diffs.
- Prefer small PRs over broad PRs.
- Provide verification evidence.
- Avoid unapproved runtime, design, route, or architecture changes.

## Forbidden behavior

Agents must not:

- Create PR-first work without one primary source Issue.
- Treat umbrella trackers as task authority.
- Invent requirements not present in the repository.
- Modify unrelated files opportunistically.
- Introduce secrets or local-only files.
- Commit ZIP files, build output, screenshots, or temporary artifacts.
- Create a folder named `DIATAXIS`.
- Claim verification that was not performed.

## Required handoff

Every agent handoff must state:

- Source Issue.
- Files changed.
- Skill or governance path used.
- Verification commands run.
- Result summary.
- Known limitations.
