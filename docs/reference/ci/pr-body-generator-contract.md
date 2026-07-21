---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: CI-001 deterministic PR body generator and procedural preclearance validator contract
Does Not Own: Merge authorization, PR approval, post-open auto-repair, post-merge closeout, or workflow branch protection
Canonical Reference: /docs/ops/implementation-plans/content-collection/packages/ci-001-pr-body-generator-package.md
Related Issues: #2436, #2435, #2431, #1131
Last Reviewed: 2026-07-21
---

# PR Body Generator Contract

## Purpose

Define the CI-001 local CLI contract for generating template-compatible PR bodies
and failing early on procedural preclearance defects **before** PR creation.

This tooling is procedural preclearance only. It does not approve or merge pull
requests. Bill / ChatGPT merge authority remains unchanged.

## Scope

In scope:

- Deterministic PR body generation from structured fixture/task inputs
- Local preclearance validation against `.github/pull_request_template.md`
- Content Collection extensions (package path, design compliance, #2286 inheritance)
- Fixture-driven PASS/FAIL evidence for CI-001 acceptance

Out of scope:

- Auto-approval or auto-merge
- GitHub mutation (create/update PR, labels, reviews, issue state)
- Post-open advisory audit ownership (`pr_hygiene_audit.mjs`)
- Post-open body auto-repair (`pr_body_auto_repair.mjs`)
- Post-merge closeout or CI-002 admin repair

## Current known truth

| Surface | Path | Role |
| --- | --- | --- |
| Generator | `scripts/ci/pr_body_generator.mjs` | Pre-open body generation |
| Validator | `scripts/ci/validate_pr_body.mjs` | Pre-open preclearance |
| Shared template helpers | `scripts/ci/pr_hygiene_audit.mjs` | Reused section/issue/allowlist parsers |
| Fixtures | `scripts/ci/fixtures/pr_body_generator/` | Valid and invalid cases |
| Tests | `tests/pr_body_generator.test.mjs` | Unit coverage |
| Package envelope | `docs/ops/implementation-plans/content-collection/packages/ci-001-pr-body-generator-package.md` | Operational plan |

## Generated body structure

Generated bodies must include the stable template sections:

1. `# PR Summary` — including `- **Issue:** #NNN`, intent label, and PR class
2. `## Scope` — allowed paths and out-of-scope statement
3. `## Change Summary`
4. `## Verification` — local commands with `Result: PASS|FAIL|NOT RUN`
5. `## Acceptance Criteria`
6. `## Reviewer / Bot Review Attestation`

Content Collection extensions when applicable:

- `## Package Compliance` — package ID and package path
- `## #2286 Inheritance` — required when pipeline/runtime surfaces are touched
- `## Parallel Execution / File Allowlist`
- `## Design Compliance` — required for UI tasks
- `## As-Built Documentation`
- `## Closeout` — source-task readiness only; never merge authorization language

## Preclearance failure classes

| Failure | Block |
| --- | --- |
| Missing canonical source issue line | Yes |
| Multiple primary source issues without approved mixed scope | Yes |
| Missing package path when package-scoped | Yes |
| Prohibited placeholder token remains | Yes |
| Changed file outside allowlist | Yes |
| Missing validation evidence | Yes |
| UI task without design compliance section | Yes |
| Pipeline task without #2286 inheritance statement | Yes |

Administrative warnings only (non-blocking for CLI exit when configured):

- optional as-built deferral with rationale
- minor wording deviation from template comments

## Placeholder rules

Generator and validator must fail when final output contains:

- `#[issue]`, `#[program]`, `[package-id]`, `[path]`, `[command]`
- bare `TBD` tokens (case-insensitive; `tbd` / `Tbd` / `TBD`)
- template blanks such as `#____` or `path/to/`

## Authority boundary

Allowed statements:

- procedural preclearance PASS/FAIL
- ready for human/agent PR creation after local checks

Prohibited statements:

- pre-approved merge
- auto-approve
- auto-merge
- merge-ready without human/ChatGPT authorization

## Commands

```bash
node scripts/ci/pr_body_generator.mjs --dry-run --fixture scripts/ci/fixtures/pr_body_generator/valid-cc-task.json
node scripts/ci/validate_pr_body.mjs --fixture scripts/ci/fixtures/pr_body_generator/valid-cc-rendered-body.json
# Or validate generated markdown directly:
# node scripts/ci/validate_pr_body.mjs --body-file /tmp/pr-body.md
npm test -- --run tests/pr_body_generator*
```

`--fixture` for the validator requires a rendered `body` string field. Generator-input
fixtures such as `valid-cc-task.json` are not valid validator fixtures and fail fast
with a usage error.

## Relationship to existing surfaces

- Complements `pr_preflight.mjs` (evaluates existing bodies; does not generate)
- Reuses exported helpers from `pr_hygiene_audit.mjs` to avoid rule drift
- Must not replace or wire into post-open auto-repair or post-merge closeout
