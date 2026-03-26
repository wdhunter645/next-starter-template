# Priority Copilot Task — Docs Header Guardrail Remediation

## Priority
High

## Why this exists
PR momentum is being blocked repeatedly because active markdown documents under `docs/**` fail the header guardrail.

Current repository behavior fails PRs when required markdown header keys are missing, but the repository does not provide a complete enforcement + repair loop.

## Problem statement
The current workflow `/.github/workflows/docs-guardrails.yml` runs `./scripts/ci/docs_check_headers.sh .`, which only fails on missing headers.

The current script `scripts/ci/docs_check_headers.sh` validates these required keys for active docs:
- `Doc Type:`
- `Audience:`
- `Authority Level:`
- `Owns:`
- `Does Not Own:`
- `Canonical Reference:`
- `Last Reviewed:`

This means the repo has a blocker, but no deterministic autofix path.

## Required outcome
Implement a deterministic docs-header workflow so missing headers stop being a chronic PR failure source.

## Required scope
1. Add one canonical markdown header template file under `docs/templates/`.
2. Update `docs/ops/ai/AGENT-RULES.md` to require all agents to use the canonical markdown header template for active docs.
3. Update `docs/ops/ai/CHATGPT-RULES.md` to require header compliance before ChatGPT opens PRs that touch `docs/**`.
4. Add a deterministic autofix script, suggested path: `scripts/ci/docs_fix_headers.sh`.
5. Update `/.github/workflows/docs-guardrails.yml` so the autofix step runs before header validation.
6. Keep `scripts/ci/docs_check_headers.sh` as the blocking validator.

## Guardrails
- Do not remove the blocking validator.
- Do not invent random metadata values.
- Autofill only deterministic values.
- If a missing field cannot be derived safely, fail loudly with a clear message.
- Do not widen scope beyond docs header template + rules + workflow + script updates.

## File-touch allowlist
- `.github/workflows/docs-guardrails.yml`
- `scripts/ci/docs_check_headers.sh`
- `scripts/ci/docs_fix_headers.sh`
- `docs/templates/markdown-header-template.md`
- `docs/ops/ai/AGENT-RULES.md`
- `docs/ops/ai/CHATGPT-RULES.md`

## Implementation notes
Preferred design:
- template file becomes the single source for header structure
- autofix inserts the missing header block only where that can be done deterministically
- workflow order becomes: autofix -> validate -> remaining docs guardrails

## Acceptance criteria
- Repo contains a canonical docs header template.
- Shared agent rules require use of that template.
- ChatGPT rules require docs header compliance before PR creation for docs changes.
- Docs guardrails workflow attempts deterministic header autofix before validation.
- Validation still fails when required values remain unsafe or missing.
- PRs stop failing for trivial missing-header cases that can be repaired automatically.
