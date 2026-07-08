---
Doc Type: Implementation Plan
Audience: Bill, ChatGPT, Cursor, LGFC maintainers, CI maintainers
Authority Level: Operational Plan (non-authoritative until promoted via Issue/PR)
Owns: CI-001 implementation envelope — deterministic PR body generation and procedural preclearance for Content Collection work
Does Not Own: Merge authorization, PR approval, Bill/ChatGPT gate decisions, or live CI script implementation (#2361 is docs-only)
Canonical Reference: /docs/reference/ci/pr-hygiene-foundation.md
Related Issues: #2409, #2361, #2359, #2360, #1131, #1075
Last Reviewed: 2026-07-08
---

# CI-001 PR Body Generator Package

## Purpose

Define a deterministic PR body generator and procedural preclearance validator that prevents avoidable PR hygiene failures **before** PR creation. CI-001 supports procedural preclearance only — it does **not** authorize merge.

## Scope

**In scope:**

- Required PR body structure aligned with `.github/pull_request_template.md`.
- Deterministic inputs, placeholder rules, and failure classification.
- Repo-verified target paths for future implementation.
- File allowlist and validation fixtures plan.

**Out of scope (explicit):**

- Approving or merging PRs.
- Bypassing Bill/ChatGPT gates.
- Resolving design ambiguity.
- Codex assignment (Codex inactive per operating model).
- Implementing `scripts/ci/pr_body_generator.mjs` in #2361 (Phase P1 child issue).

## Current known truth

| Surface | Repo path | Status |
| --- | --- | --- |
| PR template | `.github/pull_request_template.md` | **Exists** — canonical stable-facts body |
| PR hygiene foundation | `docs/reference/ci/pr-hygiene-foundation.md` | **Exists** — advisory/corrective model |
| PR hygiene audit | `scripts/ci/pr_hygiene_audit.mjs` | **Exists** — does not generate bodies |
| PR body auto-repair | `scripts/ci/run_pr_body_auto_repair.mjs` | **Exists** — post-open repair, not generator |
| PR governance skill | `.agents/skills/lgfc-pr-governance/SKILL.md` | **Exists** |
| PR body generator script | `scripts/ci/pr_body_generator.mjs` | **Missing** — implement in P1 child issue |
| Generator contract ref | `docs/reference/ci/pr-body-generator-contract.md` | **Missing** — create when implementation authorizes |
| Intake draft target `docs/ops/programs/...` | — | **Rejected** — use path below |

**Approved package path:** `docs/ops/implementation-plans/content-collection/packages/ci-001-pr-body-generator-package.md`

**Phase:** P1 tooling (deferred implementation per #2360). #2361 enriches the contract only.

## Procedural preclearance principle

CI-001 must preserve:

- Exactly one primary source issue (`- **Issue:** #NNN`) unless approved mixed scope.
- Bill/ChatGPT merge authority unchanged.
- Parser-safe PR bodies per `docs/ops/ai/SHARED-AGENT-RULES.md` and PR lifecycle docs.
- No "pre-approved merge" language (rejected Accelerated Policy C1).

## Required generator inputs

| Input | Source |
| --- | --- |
| Source issue number | GitHub issue |
| Parent program/project | Issue body fields |
| Package ID and path | Package index / child issue |
| PR class / intent label | Task scope |
| File allowlist | Child issue or package |
| Validation commands | Package validation plan |
| Acceptance criteria | Source issue |
| Design compliance flag | UI tasks only |
| #2286 inheritance flag | Content pipeline tasks |
| Parallel execution block | Package parallel-control table |

## Generated body structure (minimum)

Align with `.github/pull_request_template.md` plus Content Collection extensions:

1. **PR Summary** — issue, intent label, PR class.
2. **Scope** — allowed paths, out-of-scope statement.
3. **Change Summary** — 2–5 sentences.
4. **Package Compliance** — contract preserved, deviations documented.
5. **#2286 Inheritance** — when pipeline/runtime surfaces touched.
6. **Parallel Execution / File Allowlist** — hot-zone disclosure.
7. **Design Compliance** — UI tasks only.
8. **Verification** — commands and PASS/FAIL/NOT RUN.
9. **As-Built Documentation** — path or deferral rationale.
10. **Closeout** — source task readiness (non-merge).

## Placeholder rules

**Generator must fail** when these remain in final output:

- `#[issue]`, `#[program]`, `[package-id]`, `[path]`, `[command]`, or `TBD` (unless issue draft explicitly allows).

**Not allowed in final PR body:**

- Blank source issue.
- Multiple source issues without approved mixed scope.
- Missing package path (when package-scoped).
- Missing validation result.
- Missing PR class or file scope.

## Procedural preclearance checks

| Check | Block if fail |
| --- | --- |
| Exactly one source issue | Yes |
| Source issue exists | Yes |
| Package path exists (when package-scoped) | Yes |
| Changed files within allowlist | Yes |
| Hot-zone changes disclosed | Yes |
| Validation evidence present | Yes |
| Design compliance section for UI PRs | Yes |
| #2286 inheritance when pipeline touched | Yes |
| Prohibited placeholder remains | Yes |

**Administrative warning only:** formatting mismatch, optional as-built deferral with rationale, minor wording deviation.

## Naming convention

| Artifact kind | Convention | Example |
| --- | --- | --- |
| `scripts/ci/*.mjs` | **underscore** (matches `pr_hygiene_audit.mjs`, `run_pr_body_auto_repair.mjs`) | `pr_body_generator.mjs`, `validate_pr_body.mjs` |
| `scripts/ci/fixtures/` | **underscore** directory names | `fixtures/pr_body_generator/` |
| `tests/` | **underscore** test file prefixes | `pr_body_generator.test.mjs` |
| `docs/reference/ci/*.md` | **hyphen** reference doc filenames (existing CI reference pattern) | `pr-body-generator-contract.md` |

Allowlist globs use underscore patterns for scripts, fixtures, and tests. Reference doc paths use the hyphenated filename above.

## Repo-verified future implementation surfaces

| Path | Purpose |
| --- | --- |
| `scripts/ci/pr_body_generator.mjs` | Generator (to create) |
| `scripts/ci/validate_pr_body.mjs` | Preclearance validator (to create or extend `pr_hygiene_audit.mjs`) |
| `scripts/ci/fixtures/pr_body_generator/` | Fixture inputs/outputs |
| `tests/pr_body_generator*.test.*` | Unit tests |
| `docs/reference/ci/pr-body-generator-contract.md` | Reference contract (to create with implementation) |
| This package | Operational envelope |

## File allowlist (CI-001 implementation child issue)

```text
scripts/ci/**pr_body**
scripts/ci/**pr_hygiene**
tests/**pr_body**
tests/**pr_hygiene**
docs/ops/implementation-plans/content-collection/packages/ci-001-pr-body-generator-package.md
docs/reference/ci/pr-body-generator-contract.md
```

Globs match underscore script/fixture/test names per table above. The reference contract doc uses a hyphenated filename under `docs/reference/ci/`.

**Do not touch without approval:** feature routes, content model libs, production deploy workflows, middleware/auth.

## Dependency

- **CI Stage 0** gap analysis (`docs/ops/implementation-plans/ci-stage-0-current-state-gap-analysis.md` — to be promoted in later child issue) must inventory existing hygiene/closeout scripts before generator implementation.

## Validation plan

**Fixture cases (when implemented):**

| Case | Expected |
| --- | --- |
| Valid Content Collection PR body | PASS |
| Missing source issue | FAIL |
| Missing package path | FAIL |
| Placeholder token remains | FAIL |
| File outside allowlist | FAIL |
| UI PR without design compliance | FAIL |
| Pipeline PR without #2286 statement | FAIL |

**Commands:**

```bash
npm test -- --run tests/pr_body_generator*
node scripts/ci/pr_body_generator.mjs --dry-run --fixture scripts/ci/fixtures/pr_body_generator/valid-cc-task.json
```

**Pass:** Generator produces template-compatible output; validator catches procedural defects.

**Fail:** Generator can emit missing authority, missing validation, or unapproved scope.

## Procedure

1. Complete CI Stage 0 inventory child issue.
2. Copy allowlist into CI-001 implementation issue.
3. Implement generator + validator with fixtures before high-volume feature PR wave.
4. Dry-run against sample Content Collection task bodies.
5. Never wire generator output to auto-merge or auto-approve.

## Acceptance criteria

- [ ] Generator contract documented with repo-verified paths.
- [ ] Procedural preclearance preserves Bill/ChatGPT merge authority.
- [ ] Placeholder and failure-classification rules explicit.
- [ ] Implementation deferred to P1 with clear file allowlist.
- [ ] Alignment with `.github/pull_request_template.md` and `pr-hygiene-foundation.md`.
