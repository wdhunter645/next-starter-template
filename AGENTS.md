# Cursor Cloud Agent bootstrap

When a Cloud Agent session loads this file, the bootstrap is not complete until the agent has read the canonical chain below.

Do not merely report that these files are required. Read them before making any repo-work, readiness, implementation, or PR-governance claim:

1. `Agent.md`
2. `docs/ops/ai/SHARED-AGENT-RULES.md`
3. `docs/ops/ai/CORE-RULES.md`
4. `docs/ops/ai/CURSOR-RULES.md`

For PR, issue, review, remediation, or implementation work, also read:

5. `.agents/skills/lgfc-pr-governance/SKILL.md`
6. `.github/pull_request_template.md`
7. `docs/how-to/cursor/open-task-pr.md`

A bootstrap report that says these files are "required but not yet read" is noncompliant.

After the canonical chain, read applicable `.agents/skills/*/SKILL.md` files for the task and the source GitHub issue with task-linked authority files.

## First bootstrap report

Before any other repo-work response, report each file as **read**:

- AGENTS.md: read
- Agent.md: read
- SHARED-AGENT-RULES.md: read
- CORE-RULES.md: read
- CURSOR-RULES.md: read

For PR work, also report:

- lgfc-pr-governance/SKILL.md: read
- .github/pull_request_template.md: read
- docs/how-to/cursor/open-task-pr.md: read

## Stop before implementation when

- No primary source issue is identified
- No exact file-touch allowlist is defined

Task prompts do not override the chain in `Agent.md`.

## Local vs cloud bootstrap

- **Local Composer/Agent:** `.cursor/rules/*.mdc` (`alwaysApply: true`)
- **Cloud Agent:** this file (`AGENTS.md`)
- **Skills:** `.agents/skills/*` are relevance-selected; they are not a substitute for this bootstrap

This file routes to canonical governance. It does not replace `Agent.md` or duplicate shared/core doctrine.

See `docs/how-to/cursor/agent-session-bootstrap.md` for verification steps.
