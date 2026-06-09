- **Issue:** #1488

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: not-applicable
- Next queue item: not-applicable
- Continue/halt decision: not-applicable — one-off CI gate task

## PROGRESS + READINESS (MANDATORY)
- Phase: CI gate hardening
- Task: Add detect-only branch freshness gate
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge body remediation applied)
- Notes: Merged as PR #1489 (merge SHA `670d525c70d56f6654a02c77c7f4dc9178e72baf`). Post-merge body remediation applied for parser-compliant section headers.

## LABEL
- Intent label for this PR: change-ops

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical troubleshooting reference: `docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical CI inventory: `docs/reference/ci/workflow-inventory.md`
- Operational guardrails map: `.github/CI_GUARDRAILS_MAP.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `.github/workflows/gate-branch-freshness.yml`
- `scripts/ci/branch_freshness_gate.mjs`
- `tests/branch-freshness-gate.test.mjs`
- `.github/CI_GUARDRAILS_MAP.md`
- `docs/reference/ci/workflow-inventory.md`

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] No runtime UI changes
- [x] No route/layout/header/footer changes

## CHANGE SUMMARY
- Adds `.github/workflows/gate-branch-freshness.yml` to run on PRs and non-`main` pushes.
- Implements `scripts/ci/branch_freshness_gate.mjs` to detect branches behind `main` and print merge remediation steps without auto-syncing.
- Adds `tests/branch-freshness-gate.test.mjs` and updates CI guardrails map and workflow inventory.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test -- tests/branch-freshness-gate.test.mjs` — PASS (6 tests)
  - `npm test` — PASS (493 tests, 46 files)
  - `npm run typecheck` — PASS
  - `npm run lint` — PASS (pre-existing warnings only)
  - `GITHUB_EVENT_NAME=push GITHUB_REF=refs/heads/main GITHUB_SHA=$(git rev-parse HEAD) node scripts/ci/branch_freshness_gate.mjs` — PASS (skipped for main push)
  - `GITHUB_EVENT_NAME=pull_request GITHUB_BASE_SHA=$(git rev-parse origin/main) GITHUB_HEAD_SHA=$(git rev-parse HEAD) node scripts/ci/branch_freshness_gate.mjs` — PASS (fresh)
- Gate verification:
  - Commit-level workflow runs inspected: YES (merge commit `670d525`)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES (post-merge metadata section alignment remediated)
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary: PASS (branch freshness, quality, and drift gates green on merge head)

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Copilot disposition received or not applicable.
- [x] Codex disposition received or not applicable.
- [x] Gemini disposition received or not applicable.
- [x] Cubic disposition received or not applicable.
- [x] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [x] Every outdated review thread has explicit PR-body disposition with comment ID and thread state.

Reviewer items:
- review-comment:3382025121 — accepted — Copilot inline CI gate feedback addressed in merged branch freshness gate — thread state: resolved
- review-comment:3382025215 — accepted — Copilot inline CI gate feedback addressed in merged branch freshness gate — thread state: resolved
- review-comment:3381990618 — accepted — Gemini inline CI gate feedback addressed in merged branch freshness gate — thread state: outdated
- review-comment:3382004206 — accepted — Codex inline CI gate feedback addressed in merged branch freshness gate — thread state: outdated

## ACCEPTANCE CRITERIA
- [x] Gate fails when HEAD does not contain required base commits
- [x] Gate passes when branch is current with `main`
- [x] `main` push events are skipped
- [x] Remediation text tells agents to `git fetch origin main && git merge origin/main`
- [x] No automatic branch sync behavior
- [x] Unit tests cover behind/fresh/main-push cases

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] Allowed files section matches final diff exactly
- [x] ZIP safety confirmed
- [x] Intent label correct and singular
- [x] Post-merge closeout body remediation applied for merged PR governance

## POST-MERGE ISSUE DISPOSITION
- Post-merge closeout reconciliation for prior PR #1489: close **#1488** after post-merge verification passes following body apply with `state_reason: completed` and terminal label reconciliation (`status:complete` only)
- Post-merge closeout reconciliation for source issue **#1488** after post-merge verification passes following body apply
- Post-merge closeout reconciliation for remediation issue **#1490** when validator passes after body apply

<!-- closeout-trigger: 2026-06-09 -->
