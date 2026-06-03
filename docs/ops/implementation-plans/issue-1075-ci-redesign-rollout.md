---
Doc Type: Implementation Plan
Audience: Human + AI
Authority Level: Operational Authority
Owns: Issue #1075 CI redesign implementation task decomposition for issue-factory orchestration
Does Not Own: CI architecture source of truth, individual phase implementation, production runtime behavior
Status: production-ready
Project: issue-1075-ci-redesign-rollout
Owner: Atlas
Execution Mode: orchestrated
Source Issue: 1075
Related Program Issue: 1058
Canonical Reference: /docs/how-to/ci/lgfc-ci-implementation-plan.md
Related Issues: #1058, #1199
Last Reviewed: 2026-06-03
---

# Issue 1075 CI Redesign Rollout Implementation Plan

This plan converts issue #1075 and the approved LGFC CI implementation plan into orchestrated GitHub implementation issues.

The rollout remains serial. The issue factory may create all task issues, but only the first task should start as `status:queued`; subsequent tasks remain blocked until queue advancement promotes them.

Source-of-truth documents:

- `/docs/explanation/ci/lgfc-ci-production-design.md`
- `/docs/how-to/ci/lgfc-ci-implementation-plan.md`
- `/docs/how-to/ci/lgfc-ci-orchestration-issue-model.md`
- `/docs/reference/ci/lgfc-ci-implementation-dependency-matrix.md`
- `/docs/reference/ci/lgfc-ci-workflow-classification-matrix.md`

## Task 001 — PR Hygiene Foundation

Type: ci
Agent: cursor
Priority: 1
Depends On: none
Status: completed
Issue: #1131
Implementation PR: #1189
Merged: 2026-06-02
Allowed Files:
- `.github/workflows/gate-intent-labeler.yml`
- `.github/workflows/docs-guardrails.yml`
- `.github/workflows/diataxis-folder-authority-check.yml`
- `scripts/ci/**`
- `tests/**`
- `docs/how-to/ci/**`
- `docs/reference/ci/**`
- `docs/ops/**`
Acceptance Criteria:
- PR hygiene automation corrects or reports deterministic PR metadata defects without adding brittle merge blockers.
- Documentation correction behavior is covered by targeted tests.
- No production runtime, website, or Cloudflare behavior changes are introduced.
Validation:
- `npm test -- tests/orchestrator-queue.test.mjs`
- `npm run typecheck`
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
Rollback:
- Revert only the PR hygiene workflow/script changes and their tests/docs; leave the CI orchestration engine and unrelated gates intact.
Closeout:
- PR #1189 merged the PR Hygiene Foundation implementation for issue #1131.
- Post-merge verification confirmed the merge commit on `origin/main`.
- Lifecycle normalization removed stale active issue state from issue #1131, preserved post-merge verification evidence, and keeps Task 002 blocked until this closeout PR merges.

## Task 002 — Merge Protection Consolidation

Type: ci
Agent: cursor
Priority: 2
Depends On: Task 001
Allowed Files:
- `.github/workflows/gate-quality.yml`
- `.github/workflows/gate-zip-safety.yml`
- `.github/workflows/gitleaks.yml`
- `.github/workflows/ops-pr-issue-accounting.yml`
- `scripts/ci/**`
- `tests/**`
- `docs/how-to/ci/**`
- `docs/reference/ci/**`
- `docs/ops/**`
Acceptance Criteria:
- Blocking pre-merge gates are deterministic and locally attributable to the PR.
- Duplicate or timing-sensitive blockers are removed or moved out of merge protection.
- Branch-protection documentation matches the as-built check surface.
Validation:
- `npm test`
- `npm run typecheck`
- `npm run build`
- `./scripts/ci/docs_check_headers.sh .`
Rollback:
- Restore the previous merge-protection workflow files and branch-protection documentation only.

## Task 003 — Reviewer Lifecycle Redesign

Type: ci
Agent: cursor
Priority: 3
Depends On: Task 002
Allowed Files:
- `.github/workflows/reviewer-response-completion.yml`
- `.github/workflows/gate-reviewer-response.yml`
- `.github/workflows/post-merge-intent-verification.yml`
- `scripts/ci/post_merge_reviewer_audit.mjs`
- `scripts/ci/reviewer-gate-simulation.mjs`
- `tests/**`
- `docs/explanation/ci/**`
- `docs/how-to/ci/**`
- `docs/reference/ci/**`
Acceptance Criteria:
- Reviewer lifecycle state is not a brittle synchronous merge blocker.
- Reviewer evidence remains available for audit/remediation.
- Late reviewer findings pause orchestration through post-merge failure state.
Validation:
- `npm test -- tests/reviewer-gate-simulation.test.mjs`
- `npm test -- tests/orchestrator-queue.test.mjs`
- `./scripts/ci/docs_check_headers.sh .`
Rollback:
- Revert reviewer workflow/script changes and reviewer-specific docs/tests.

## Task 004 — Post-Merge Validation Expansion

Type: ci
Agent: cursor
Priority: 4
Depends On: Task 003
Allowed Files:
- `.github/workflows/post-merge-intent-verification.yml`
- `.github/workflows/post-merge-remediation.yml`
- `.github/workflows/diataxis-post-merge-validate.yml`
- `.github/workflows/ops-design-compliance-audit.yml`
- `scripts/ci/**`
- `tests/**`
- `docs/how-to/ci/**`
- `docs/reference/ci/**`
- `docs/ops/**`
Acceptance Criteria:
- Post-merge checks report implementation evidence from merged code.
- Failures create actionable remediation output.
- Queue advancement remains blocked until validation succeeds.
Validation:
- `npm test`
- `npm run typecheck`
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
Rollback:
- Revert post-merge validation and remediation workflow/script changes only.

## Task 005 — OPS Runtime Consolidation

Type: ci
Agent: cursor
Priority: 5
Depends On: Task 004
Allowed Files:
- `.github/workflows/ops-assess.yml`
- `.github/workflows/ops-cf-pages-retry.yml`
- `.github/workflows/production-audit.yml`
- `.github/workflows/ops-main-change-monitor.yml`
- `.github/workflows/snapshot.yml`
- `.github/workflows/b2-d1-daily-sync.yml`
- `.github/workflows/b2-s3-smoke-test.yml`
- `scripts/**`
- `tests/**`
- `docs/ops/**`
- `docs/reference/ci/**`
- `docs/reference/platform/**`
Acceptance Criteria:
- OPS runtime workflows provide proactive health and retry visibility.
- Runtime failures produce evidence and escalation paths.
- Cloudflare Pages static export compatibility remains intact.
Validation:
- `npm test`
- `npm run typecheck`
- `npm run build`
- `npm run assess:ci`
Rollback:
- Revert OPS workflow/script consolidation while preserving prior snapshot and audit artifacts.

## Task 006 — As-built Documentation Update

Type: ci
Agent: cursor
Priority: 6
Depends On: Task 005
Allowed Files:
- `docs/explanation/ci/**`
- `docs/how-to/ci/**`
- `docs/reference/ci/**`
- `docs/ops/**`
- `.github/CI_GUARDRAILS_MAP.md`
Acceptance Criteria:
- Final docs compare intended design with as-built workflows.
- Implementation variances and deferred items are explicit.
- Monitoring behavior and operational ownership are documented.
Validation:
- `./scripts/ci/docs_check_headers.sh .`
- `./scripts/ci/docs_canonical_hashes_verify.sh .`
Rollback:
- Revert only final CI documentation reconciliation files.

## Task 006 Closeout Notes

Task 006 (#1199) is documentation-only reconciliation. It does not change workflow
runtime behavior.

Deliverables opened in the Task 006 PR:

- `docs/reference/ci/lgfc-ci-as-built-reconciliation.md` — design vs as-built matrix
- `docs/ops/ci-monitoring-ownership.md` — monitoring ownership and escalation paths
- Guardrails map, workflow inventory, production design, implementation plan, and
  monitoring coverage updates pointing at the reconciliation record

Post-merge follow-up after PRs #1239, #1240, and #1242 land:

- Reconcile the as-built matrix to mark Tasks 003–005 complete on `main`
- Schedule a mechanical workflow inventory table rewrite (deferred from Task 006)
- Confirm branch protection required checks match `merge-protection-surface.md`
