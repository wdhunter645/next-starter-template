---
Doc Type: Reference
Audience: Human + AI
Authority Level: Controlled
Owns: PR-process and CI retired asset inventory
Does Not Own: Canonical PR policy or branch protection settings
Canonical Reference: /docs/governance/PR_PROCESS.md
Related Issues: #2175, #2185, #2208, #2469
Last Reviewed: 2026-07-12
---

# PR Process Rebuild Retired Asset Inventory

## Purpose

Maintain an auditable inventory of PR-process and CI assets retired before or by #2469.

## Scope

This reference covers removed scripts, workflows, state files, tests, and compatibility boundaries. It does not define current PR policy or branch protection.

## Current known truth

The #1075 phase engine, fixed state, orphaned selector, and parked legacy workflows are removed or reduced to a non-mutating compatibility marker. Current required, advisory, closeout, generic orchestration, and OPS assets remain in place.

## Intended final state

Retired assets remain absent and cannot regain operational authority without a new issue, dependency review, and current documentation update.

## Removed before #2469

- `scripts/ci/reviewer-response-gate.mjs`
- `tests/reviewer-response-gate.test.mjs`

These implemented the retired PR-body reviewer ledger.

## Removed in #2469

### Dedicated #1075 engine

- `.github/workflows/ci-orchestration-engine.yml`
- `.github/ci-orchestration-state.json`
- `scripts/orchestrator/ci-orchestration-engine.mjs`
- dedicated CI-engine coverage from `tests/orchestrator-queue.test.mjs`
- `scripts/orchestrator/implementation-plan-tasks.mjs`
- `docs/reference/ci/lgfc-ci-orchestration-tasks.json`

### Legacy workflows

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/deploy-dev.yml`
- `.github/workflows/deploy-prod.yml`
- `.github/workflows/lgfc-validate.yml`
- `.github/workflows/test.yml`
- `.github/workflows/test-homepage.yml`
- `.github/workflows/gate-reviewer-response.yml`
- `.github/workflows/gate-close-work-issue.yml`

The previous hardcoded implementation of `.github/workflows/post-merge-intent-verification.yml` is also removed. A manual-only, read-only compatibility marker remains so retained tests can verify it is not an automatic closeout owner.

## Retained current assets

- `gate-quality.yml`
- `gitleaks.yml`
- `gate-pr-hygiene.yml`
- `gate-diff-scope.yml`
- `reviewer-response-completion.yml`
- `post-merge-closeout.yml`
- generic issue-factory and queue scripts/workflows
- scripts actively imported by the current closeout runner
- OPS production monitoring

## Deletion criteria

Retired assets may be removed only when:

- there is no live workflow caller;
- branch protection does not require the check;
- replacement or retained capability is identified;
- imports are not stranded;
- current inventory and authority docs are updated in the same PR.
