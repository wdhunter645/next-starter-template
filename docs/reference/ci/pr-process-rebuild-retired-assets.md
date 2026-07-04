---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: PR process rebuild retired asset inventory
Does Not Own: Canonical PR-process policy or branch protection settings
Canonical Reference: /docs/governance/PR_PROCESS.md
Related issues: #2175, #2185, #2208
Last Reviewed: 2026-07-04
---

# PR Process Rebuild Retired Asset Inventory

This controlled reference supports `/docs/governance/PR_PROCESS.md` by recording which PR-process assets are removed, retained, simplified, or manual-only during the rebuild.

## Purpose

Record which PR-process assets are kept, temporarily simplified, or removed during the Priority 1 ground-up PR-process rebuild.

## Removed in #2185

- `scripts/ci/reviewer-response-gate.mjs`
- `tests/reviewer-response-gate.test.mjs`

These assets implemented the retired PR-body reviewer-response ledger model. Reviewer lifecycle state must be rebuilt around GitHub-native reviews and review threads, not PR-body comment IDs or disposition lines.

## Temporarily simplified before #2185

The following workflows were simplified to passing marker checks so they stop blocking PR-process repair work while the new process is rebuilt:

- `.github/workflows/gate-quality.yml`
- `.github/workflows/gate-drift.yml`
- `.github/workflows/gate-branch-freshness.yml`
- `.github/workflows/docs-guardrails.yml`
- `.github/workflows/design-compliance-warn.yml`
- `.github/workflows/reviewer-response-completion.yml`

These workflow names remain present so branch-protection check wiring does not deadlock merges while the rebuild is underway.

## Manual-only during rebuild

- `.github/workflows/gate-intent-labeler.yml`
- `.github/workflows/gate-diff-scope.yml`
- `.github/workflows/ops-pr-issue-accounting.yml`

These must not be promoted back to automatic or required until advisory behavior is implemented and verified.

## Kept compatibility assets

- `scripts/ci/reviewer_lifecycle_gate.mjs`
- `scripts/ci/reviewer_comment_disposition.mjs`
- `tests/reviewer-lifecycle-gate.test.mjs`
- `tests/reviewer-comment-disposition.test.mjs`

`reviewer_comment_disposition.mjs` remains because the current native lifecycle script still imports compatibility helpers from it. Remove it only after those compatibility exports are removed from `reviewer_lifecycle_gate.mjs`.

## Required-check position

The merge-protection reference identifies the reduced required surface as deterministic blockers only. PR-process rebuild work must not promote redesigned checks back to required until advisory evidence proves they are stable.

## Next cleanup criteria

Delete additional retired assets only when all are true:

- the asset has no live workflow caller;
- branch protection does not require its check name;
- replacement logic exists and has advisory evidence;
- deletion will not strand imports in retained scripts;
- the final CI inventory is updated in the same PR.
