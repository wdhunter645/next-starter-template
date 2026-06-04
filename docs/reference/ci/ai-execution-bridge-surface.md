---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: AI execution bridge workflow behavior, triggers, validation outputs, and phase boundaries
Does Not Own: OpenAI API execution, autonomous code generation, merge approval, or PR intent allowlists
Canonical Reference: /docs/how-to/ops/controlled-ai-execution-bridge.md
Related Issues: #1266, #1267
Last Reviewed: 2026-06-04
---

# AI Execution Bridge Surface

## Purpose

This reference documents the controlled AI execution bridge introduced in PR #1267. Phase 1 validates approved issues and posts a deterministic branch/PR plan comment. It does not call OpenAI or modify repository files.

## Workflow

| Workflow file | Display name | Enforcement |
|---|---|---|
| `ai-execution-bridge.yml` | AI Execution Bridge | Operational (issue label trigger) |
| `ensure-ai-build-label.yml` | Ensure AI Build Label | Operational (creates `ai-build` label on `main` when missing) |
| `ai-execution-bridge-smoke.yml` | AI Execution Bridge Smoke Test | Operational (weekly + path-filtered `main` push; synthetic issue validation) |

## Trigger

- Event: `issues` → `labeled`
- Condition: added label name is exactly `ai-build`
- Concurrency: one run per issue number

## Permissions

- `contents: write`
- `issues: write`
- `pull-requests: write`

Phase 1 uses write permissions only for commenting and future branch/PR hooks. No autonomous commits are made in phase 1.

## Validation Scripts

| Script | Output | Role |
|---|---|---|
| `scripts/ci/ai_execution_bridge_validate.mjs` | `ai-execution-bridge-result.json` | Parse issue event, enforce sections and allowed-files safety |
| `scripts/ci/ai_execution_bridge_prepare.mjs` | `ai-execution-bridge-plan.json` | Build deterministic branch name and governance PR body |

## Required Issue Sections

- `## Approved Task`
- `## Scope`
- `## Allowed Files`
- `## Acceptance Criteria`
- `## Validation`

## Allowed Files Safety Rules

The validator fails closed when allowed files are missing, empty, or match unsafe patterns including:

- `.github/workflows/*` and workflow path prefixes
- `**/*` recursive wildcards
- `.env` and `.env.*`
- Path traversal (`..`), absolute paths, or drive-letter paths
- Paths suggesting secrets or credentials

## Future Phase

OpenAI API execution and autonomous code generation remain disabled until a separate approved phase. The prepare script documents this boundary in plan JSON and issue comments.

## Operator Entry Points

- How-to: `docs/how-to/ops/controlled-ai-execution-bridge.md`
- Issue template: `docs/templates/ai-build-issue-template.md`
- Tests: `tests/ai-execution-bridge.test.mjs`

## Smoke Test Cadence

| Trigger | Schedule |
|---|---|
| `push` to `main` (path-filtered) | Bridge workflow, smoke workflow, ensure-label workflow, bridge scripts, or bridge tests |
| `schedule` | Mondays 09:00 UTC |
| `workflow_dispatch` | Operator rerun |

The smoke workflow runs unit tests and a synthetic labeled-issue validation/plan check. It does not run on every unrelated merge to `main`.
