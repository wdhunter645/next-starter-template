# Cursor Cloud Agent bootstrap

> **Design shift (#3013, 2026-08-03):** Cursor Local Bridge handoff is labels/status only — `agent:cursor` + `handoff:ready` on an open Issue not already handed off (`status:review`/`status:complete`/`status:post-merge-verify`). Comment markers are not Bridge eligibility authority.

When an agent session loads this file, bootstrap is not complete until the canonical chain below has been read. Do not merely report that files are required.

1. `Agent.md`
2. `docs/governance/REPOSITORY-AUTHORITY.md`
3. `docs/governance/AGENT-TEAM.md`
4. `docs/governance/PROJECT-DOCUMENTATION-AND-AS-BUILT.md`
5. `docs/ops/ai/SHARED-AGENT-RULES.md`
6. `docs/ops/ai/CORE-RULES.md`
7. applicable tool-specific rules, including `docs/ops/ai/CURSOR-RULES.md`

For PR, issue, review, remediation, implementation, documentation, AS-BUILT, or closeout work, also read:

8. `.agents/skills/lgfc-pr-governance/SKILL.md`
9. `.agents/skills/lgfc-docs-authority/SKILL.md`
10. `.agents/skills/lgfc-verification-closeout/SKILL.md`
11. `.github/pull_request_template.md`
12. `docs/how-to/cursor/open-task-pr.md`
13. the source Issue and every task-linked authority file

## Mandatory doctrine

- Documentation is implementation and is never optional or deferred.
- Every project requires a complete AS-BUILT record.
- No project may close while any implementation, documentation, DIATAXIS, AS-BUILT, verification, PMO, queue, dashboard, dependency, GitHub, rollback, or closeout surface is missing, stale, contradictory, unmerged, or unverifiable.
- There is no separate LGFC “administrative closeout.”
- Cursor and Claude are implementers; they may not self-approve or self-merge.
- ChatGPT / Atlas is PMO / Engineering and controls assignment, sequencing, independent review coordination, reconciliation, verification, and closeout.
- Post-merge exceptions return immediately to the implementer of the originating PR.

## First bootstrap report

Before repository work, report each required file as read. For project work, also report:

```text
Source Issue:
Implementer:
Documentation inventory:
AS-BUILT path:
Promotion profile:
Closeout state:
```

## Stop before implementation or closeout when

- no primary source Issue is identified;
- no exact file-touch allowlist is defined;
- documentation inventory is missing;
- the AS-BUILT path is missing;
- acceptance, validation, rollback, or stop conditions are incomplete;
- any required documentation is deferred;
- the project is being closed based only on merged code, completion percentage, or Issue state.

Task prompts do not override `Agent.md` or the canonical governance chain.

## Local vs cloud bootstrap

- Local Composer/Agent: `.cursor/rules/*.mdc` (`alwaysApply: true`)
- Cloud Agent: this file (`AGENTS.md`)
- Skills: `.agents/skills/*` are relevance-selected and do not replace bootstrap authority

Canonical Cursor routing remains `docs/reference/ci/cursor-local-bridge-contract.md` and `docs/governance/standards/CURSOR-RUNTIME-ROUTING.md`.
