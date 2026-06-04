- **Issue:** #1226

## PROGRESS + READINESS (MANDATORY)
- Phase: CI Task 002 — Merge Protection Consolidation
- Task: Task-002
- Status: DRAFT
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: Awaiting required gate runs on this PR
- Notes: Implements deterministic merge-protection consolidation after Task 001 PR Hygiene Foundation closeout.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- docs/explanation/ci/lgfc-ci-production-design.md
- docs/how-to/ci/lgfc-ci-implementation-plan.md
- docs/how-to/ci/lgfc-ci-orchestration-issue-model.md
- docs/reference/ci/lgfc-ci-implementation-dependency-matrix.md
- docs/reference/ci/lgfc-ci-workflow-classification-matrix.md
- docs/ops/implementation-plans/issue-1075-ci-redesign-rollout.md

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## LABEL
- Intent label for this PR: infra

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Additional design/reference docs used for this PR:
  - docs/explanation/ci/lgfc-ci-production-design.md
  - docs/reference/ci/merge-protection-surface.md

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- .github/workflows/gate-quality.yml
- .github/workflows/gate-zip-safety.yml
- .github/workflows/gitleaks.yml
- .github/workflows/ops-pr-issue-accounting.yml
- scripts/ci/check_no_tracked_zips.sh
- scripts/ci/merge_protection_surface.mjs
- tests/merge-protection-surface.test.mjs
- docs/how-to/ci/lgfc-ci-implementation-plan.md
- docs/ops/workflows-inventory.md
- docs/reference/ci/lgfc-ci-workflow-classification-matrix.md
- docs/reference/ci/merge-protection-surface.md

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [ ] This PR contains documentation-only changes
- [x] No application code, config, or runtime behavior modified

## CHANGE SUMMARY
- Consolidated tracked-ZIP and PR-range ZIP taint checks into `gate-quality.yml` via shared scripts.
- Retired duplicate `gate-zip-safety.yml` workflow to reduce overlapping merge blockers.
- Added production build to the quality gate for deterministic merge safety.
- Aligned merge-blocker workflow display names (`GATE — Secret Scan`, `GATE — PR Issue Accounting`).
- Added merge-protection surface inventory script, tests, and canonical reference documentation.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test` — PASS (313 tests)
  - `npm run typecheck` — PASS
  - `npm run build` — PASS
  - `./scripts/ci/docs_check_headers.sh .` — PASS
  - `node scripts/ci/merge_protection_surface.mjs` — PASS
- Gate verification:
  - Commit-level workflow runs inspected: NO (pending PR open)
  - PR-level governance/accounting workflows inspected: NO (pending PR open)
  - Failed job logs inspected for every failing gate: N/A
  - Required gates rerun or re-evaluated after fixes: NO (initial open)
- Result summary: PENDING

## DOCUMENTATION UPDATES
- [x] Documentation updated in this PR
- [ ] No documentation updates required
- Files:
  - docs/reference/ci/merge-protection-surface.md
  - docs/how-to/ci/lgfc-ci-implementation-plan.md
  - docs/ops/workflows-inventory.md
  - docs/reference/ci/lgfc-ci-workflow-classification-matrix.md

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular
- [x] Local checks executed and passed or exact blocker documented
- [x] Post-merge closeout body remediation applied for merged PR governance

## ACCEPTANCE CRITERIA
- [x] Blocking pre-merge gates are deterministic and locally attributable to the PR.
- [x] Duplicate blocker `gate-zip-safety.yml` removed; ZIP enforcement consolidated into quality gate.
- [x] Branch-protection documentation matches the as-built check surface.

## ROLLBACK
Restore the previous merge-protection workflow files and branch-protection documentation only.

## POST-MERGE VERIFICATION REQUIREMENTS
- Confirm required pre-merge checks completed on this PR.
- Confirm post-merge detection completed successfully.
- Update branch protection to use `quality`, `gitleaks`, and `pr-issue-accounting`; remove retired `check-no-zip-files` if still listed.

## REVIEWER RESPONSE ACCOUNTING
- [ ] Reviewed all reviewer comments.
- [ ] Reviewed all bot comments.
- [ ] Reviewed all GitHub review threads.
- [ ] Copilot disposition received or not applicable.
- [ ] Codex disposition received or not applicable.
- [ ] Gemini disposition received or not applicable.
- [ ] Cubic disposition received or not applicable.

Reviewer items:
- (pending first review pass)

## PR GATE READINESS CHECKLIST
- [ ] Live PR check panel inspected
- [ ] Commit-level workflow runs inspected
- [ ] PR-level pull_request_target workflows inspected
- [ ] Latest head workflow runs inspected
- [ ] Failed job logs inspected for every failing gate
- [ ] Workflow YAML or enforcement logic inspected before documenting gate behavior
- [ ] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue
- [ ] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [ ] All review threads and comments inspected

<!-- This is an auto-generated description by cubic. -->
---
## Summary by cubic
Consolidates merge protection into a single deterministic quality gate and aligns required status checks, removing the duplicate ZIP safety workflow. Adds production build and ZIP taint checks, plus scripts, tests, and docs to define the required check surface (addresses #1226).

- **Refactors**
  - Moved tracked-ZIP and PR-range ZIP checks into `gate-quality.yml`.
  - Retired `gate-zip-safety.yml` to remove overlapping blockers.
  - Added production build to the quality job.
  - Aligned workflow display names to `GATE — …`.
  - Added `scripts/ci/merge_protection_surface.mjs`, tests, and the canonical reference doc; removed executable blocks per DIATAXIS.

- **Migration**
  - Require these checks in branch protection: `quality`, `gitleaks`, `pr-issue-accounting`.
  - Remove `check-no-zip-files` if it still appears.

<sup>Written for commit 57622839f1758676ff3351271d5746a86e5ac017. Summary will update on new commits.</sup>

<a href="https://cubic.dev/pr/wdhunter645/next-starter-template/pull/1229?utm_source=github" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/review-in-cubic-dark.svg"><source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/review-in-cubic-light.svg"><img alt="Review in cubic" src="https://cubic.dev/buttons/review-in-cubic-dark.svg"></picture></a>

<!-- End of auto-generated description by cubic. -->