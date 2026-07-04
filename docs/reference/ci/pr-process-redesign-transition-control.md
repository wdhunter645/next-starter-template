---
Doc Type: Reference
Audience: Human + AI
Authority Level: Historical
Owns: PR process redesign Task 1 (#2176) transition-control inventory
Does Not Own: Current PR-process policy, safe-mode workflow behavior, or branch protection settings
Canonical Reference: /docs/governance/PR_PROCESS.md
Supporting References:
  - /docs/reference/ci/pr-process-current-state.md
  - /docs/reference/ci/pr-process-rebuild-retired-assets.md
Related issues: #2175, #2176, #2208
Last Reviewed: 2026-07-04
---

# PR Process Redesign Transition-Control Inventory

> **Historical record.** This file documents Task 1 (#2176) transition-control changes from 2026-07-03. Subsequent emergency safe-mode relief (#2206–#2214) and documentation consolidation (#2218) superseded parts of the runtime behavior described here. For current behavior, read `/docs/governance/PR_PROCESS.md` and `/docs/reference/ci/pr-process-current-state.md`.

Parent issue: #2175  
Child issue: #2176

## Purpose

This inventory recorded the first transition-control changes for the PR process redesign. The goal was to stop legacy PR-body mutation and recursive closeout reconciliation behavior from blocking or destabilizing the redesign rollout.

## Transition rules (Task 1 intent — still valid as policy)

1. Do not delete required checks until branch protection has been updated safely.
2. Do not write generated lifecycle scaffolds into PR bodies during the redesign transition.
3. Do not require reviewer comment IDs or thread-state text in the PR body while the GitHub-native reviewer gate is being rewritten.
4. Do not allow reconciliation workflows to retrigger from their own issue/comment/label writes.
5. Keep safety CI such as secret scanning in place unless a later child issue explicitly changes routing.

## CI surfaces changed in Task 1

| Surface | Previous behavior | Task 1 transition behavior | Post–safe-mode note |
|---|---|---|---|
| `.github/workflows/reviewer-response-completion.yml` | PR events, comments, reviews; PR-body auto-repair write; legacy reviewer gate | PR target + review submissions only; auto-repair dry-run; advisory gate | Now marker-only no-op on `main` (#2206) |
| `scripts/ci/run_pr_body_auto_repair.mjs` | Could patch PR bodies | Caller set `PR_BODY_AUTO_REPAIR_DRY_RUN=true` | Retired from active PR path |
| `.github/workflows/ops-post-merge-self-healing.yml` | Issue events, push, workflow completions | Manual, schedule, selected completions only; queued concurrency | Still consolidated per #2182 |
| `tests/ops-post-merge-self-healing-workflow.test.mjs` | Expected issue-event self-healing | Expects issue/push triggers absent | Still valid |

## CI surfaces intentionally not changed in Task 1

| Surface | Reason | Current status |
|---|---|---|
| `gate-quality.yml` | Class-aware routing deferred | Marker-only (#2206); rebuild Task 6 |
| Secret scan / gitleaks | Always valid safety CI | Active required check |
| ZIP audit / ZIP safety | Repo safety | Active |
| `pr_hygiene_audit.mjs` | Rewrite after template | Cursor rebuild Task 3 |
| `reviewer_lifecycle_gate.mjs` | GitHub-native rewrite | Cursor rebuild Task 5 |
| Branch protection | After replacement checks validated | Cursor rebuild Task 7 |

## Acceptance mapping (Task 1 — complete)

- CI transition inventory recorded: this file (historical).
- Mutating PR-body repair disabled: achieved in Task 1; superseded by safe-mode markers.
- Reviewer comment-ID accounting softened: achieved; final removal in Task 5.
- Self-healing recursion reduced: achieved.
- Required checks not deleted in Task 1: achieved.

## Where to look next

- Current safe-mode state: `/docs/reference/ci/pr-process-current-state.md`
- Retired assets: `/docs/reference/ci/pr-process-rebuild-retired-assets.md`
- Validation probes: `/docs/reference/ci/pr-process-skeleton-validation.md`
