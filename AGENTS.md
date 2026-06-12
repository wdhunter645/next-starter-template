# Cursor Cloud Agent bootstrap

Cloud Agent sessions must follow the mandatory documentation chain before any repo work.

## Read first

1. `Agent.md` — mandatory entry point (do not skip)
2. `docs/ops/ai/SHARED-AGENT-RULES.md`
3. `docs/ops/ai/CORE-RULES.md`
4. `docs/ops/ai/CURSOR-RULES.md`
5. Applicable `.agents/skills/*/SKILL.md` files for the task
6. Source GitHub issue and task-linked authority files

For PR or issue work, also read:

- `.agents/skills/lgfc-pr-governance/SKILL.md`
- `.github/pull_request_template.md`

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
