---
Doc Type: Governance
Audience: AI agents and repository maintainers
Authority Level: Operational
Owns: Cross-agent governance rules for LGFC repository work
Does Not Own: Canonical product design, runtime architecture, or PR template structure
Canonical Reference: Agent.md
Last Reviewed: 2026-05-11
---

# Agent Governance

## Purpose

This document defines the longer-form operating rules for agents working in the LGFC repository. The root `Agent.md` file remains the single agent entry point and routing file.

## Authority order

Agents must resolve conflicts in this order:

1. Locked governance / design / platform documents.
2. Source Issue scope.
3. Operational trackers.
4. `Agent.md` navigation and skill routing.
5. Repository skill files under `.agents/skills/`.
6. Cross-agent operational guidance under `governance/` and `ops/`.
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
- Claim verification that was not performed.

## Required handoff

Every agent handoff must state:

- Source Issue.
- Files changed.
- Skill or governance path used.
- Verification commands run.
- Result summary.
- Known limitations.
