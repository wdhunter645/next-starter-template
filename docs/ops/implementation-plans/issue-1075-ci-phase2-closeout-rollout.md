---
Doc Type: Implementation Plan
Audience: Human + AI
Authority Level: Operational Authority
Owns: issue #1075 CI redesign phase-2 closeout and CI maintenance task decomposition for issue-factory orchestration
Does Not Own: CI architecture source of truth, website product behavior, branch protection UI changes executed outside the repository
Status: production-ready
Project: issue-1075-ci-phase2-closeout-rollout
Owner: Atlas
Execution Mode: orchestrated
Source Issue: 1075
Related Program Issue: 1058
Canonical Reference: /docs/reference/ci/lgfc-ci-as-built-reconciliation.md
Related Issues: #1058, #1075
Last Reviewed: 2026-06-03
---

# issue 1075 CI Phase 2 Closeout and Maintenance Rollout

## Purpose

This plan defines phase-2 work after CI redesign Tasks 001–006 merged on `main`.
It closes the `#1075` program, creates orchestrator issues for CI maintenance under
`#1058`, and tests issue-factory behavior against completed phase-1 tasks.

## Scope

This plan owns:

- CI program closeout issue hygiene for `#1075` and stale redesign children
- `#1058` maintenance tasks (branch protection documentation, drift gate, legacy
  workflow retirement, workflow inventory rewrite)
- issue-factory orchestration for new task markers under project slug
  `issue-1075-ci-phase2-closeout-rollout`

This plan does not own website product implementation, website design authority,
website tracker reconciliation, or runtime changes outside each task allowlist.

## Current Known Truth

- CI redesign Tasks 001–006 are merged on `main` (PRs #1189, #1229, #1239, #1240,
  #1242, #1244).
- Phase-1 tasks in `issue-1075-ci-redesign-rollout.md` are marked `Status: completed`.
- Open GitHub issues (#1196–#1199, #1226, #1011, #1009, #1116, #1247, `#1075`) remain
  open despite merged implementation; closeout is still required.
- Website work under `#1053` is outside this CI program. Ops tracker files under
  `docs/ops/trackers/**` may be stale relative to GitHub issue state.

## Intended Final State

- `#1075` is closed with evidence pointing to `lgfc-ci-as-built-reconciliation.md`.
- Superseded and stale CI redesign issues are closed with explicit rationale.
- `#1058` remains open and owns maintenance Tasks 002–005 through orchestration.
- Issue factory creates only phase-2 tasks; phase-1 tasks are skipped as terminal.

This plan begins after CI redesign Tasks 001 through 006 merged on `main`
(PRs #1189, #1229, #1239, #1240, #1242, #1244).

Phase 1 rollout tasks in `issue-1075-ci-redesign-rollout.md` remain marked
`Status: completed` so the issue factory skips already-delivered work. This plan
introduces new task IDs under a new project slug so orchestration can create only
net-new issues.

Program decision recorded in `docs/reference/ci/lgfc-ci-as-built-reconciliation.md`:

- Close the **#1075 CI redesign program** after Task 001 below completes.
- Keep **#1058** open as the umbrella for CI normalization and maintenance.
- Do not reopen redesign Tasks 001–006.

## Task 001 — CI Redesign Program Closeout

Type: ci
Agent: cursor
Priority: 1
Depends On: none
Supersedes Issues: #1011, #1009, #1116, #1247, #1196, #1197, #1198, #1199, #1226
Allowed Files:
- `docs/reference/ci/**`
- `docs/ops/**`
- `docs/explanation/ci/**`
Acceptance Criteria:
- Stale redesign task issues (#1196–#1199, #1226) are closed with merge evidence comments.
- Superseded child issues (#1011, #1009, #1116, #1247) are closed with explicit superseded-by references.
- `#1075` is closed with a summary pointing to `lgfc-ci-as-built-reconciliation.md`.
- `#1058` remains open and is re-parented to the maintenance tasks in this plan.
- No workflow or runtime behavior changes are introduced.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
Rollback:
- Revert only closeout documentation updates; GitHub issue state must be restored manually if needed.

## Task 002 — Branch Protection Reconciliation

Type: ci
Agent: cursor
Priority: 2
Depends On: Task 001
Parent Program: #1058
Allowed Files:
- `docs/reference/ci/merge-protection-surface.md`
- `docs/reference/ci/lgfc-ci-as-built-reconciliation.md`
- `docs/ops/**`
Acceptance Criteria:
- Required GitHub branch protection checks are documented against the as-built merge-protection surface.
- Any mismatch between documented checks and repository settings is recorded as an operator action item.
- No workflow behavior changes are required in this task unless documentation reveals a naming mismatch only.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
Rollback:
- Revert branch-protection reconciliation documentation only.

## Task 003 — Drift Gate ZIP Deduplication

Type: ci
Agent: cursor
Priority: 3
Depends On: Task 002
Parent Program: #1058
Allowed Files:
- `.github/workflows/gate-drift.yml`
- `scripts/ci/**`
- `tests/**`
- `docs/reference/ci/**`
Acceptance Criteria:
- `gate-drift.yml` no longer duplicates ZIP enforcement already covered by `gate-quality.yml`.
- Merge protection and drift responsibilities remain documented in surface references.
- Targeted tests cover the reduced duplicate enforcement behavior.
Validation:
- `npm test`
- `npm run typecheck`
- `./scripts/ci/docs_check_headers.sh .`
Rollback:
- Restore previous `gate-drift.yml` ZIP checks and related tests/docs only.

## Task 004 — Legacy Workflow Retirement

Type: ci
Agent: cursor
Priority: 4
Depends On: Task 003
Parent Program: #1058
Allowed Files:
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/deploy-dev.yml`
- `.github/workflows/deploy-prod.yml`
- `.github/workflows/lgfc-validate.yml`
- `.github/workflows/test.yml`
- `.github/workflows/test-homepage.yml`
- `docs/reference/ci/**`
- `docs/ops/**`
- `tests/**`
Acceptance Criteria:
- Parked legacy workflows are retired with evidence that no active merge protection or OPS runtime path depends on them.
- Retirement is documented in workflow inventory and guardrails map pointers.
- No active workflow behavior regresses for merge protection or OPS runtime.
Validation:
- `npm test`
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
Rollback:
- Restore retired workflow files and retirement documentation only.

## Task 005 — Workflow Inventory Table Rewrite

Type: ci
Agent: cursor
Priority: 5
Depends On: Task 004
Parent Program: #1058
Allowed Files:
- `docs/reference/ci/workflow-inventory.md`
- `docs/reference/ci/lgfc-ci-workflow-classification-matrix.md`
- `.github/CI_GUARDRAILS_MAP.md`
- `docs/reference/ci/lgfc-ci-as-built-reconciliation.md`
Acceptance Criteria:
- Workflow inventory table reflects every active workflow file under
  `.github/workflows/` on `main` after Task 004 retirement (not the pre-retirement
  file count).
- Retired workflows are removed or marked inactive consistently across inventory and guardrails map.
- Domain surface references remain authoritative for merge protection, reviewer lifecycle, post-merge validation, and OPS runtime.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
- `node scripts/ci/post_merge_validation_surface.mjs`
Rollback:
- Revert inventory rewrite files only.

## Orchestration Verification Expectations

When this plan merges to `main`, the issue factory should:

1. Skip all Tasks 001–006 in `issue-1075-ci-redesign-rollout.md` because they are terminal.
2. Create Task 001 in this plan if no `lgfc-task-id:issue-1075-ci-phase2-closeout-rollout:Task-001`
   marker exists. `create-issues.mjs` labels the first created issue `status:queued` only when
   **no** open orchestrator-labeled issue exists (`openOrchestratorIssueExists()`); otherwise
   new issues receive `status:blocked` even for Task 001.
3. Task 001 closeout must close stale phase-1 orchestrator task issues (#1196–#1199, #1226) so
   phase-2 maintenance issues are not blocked behind abandoned redesign queue entries.
4. Create Task 002–005 issues with `status:blocked` while any other orchestrator issue remains
   open, per the same queue guard.

The CI orchestration engine JSON state remains the phase-1 record; phase-2 execution is driven by this markdown plan through `orchestrator-issue-factory.yml`.
