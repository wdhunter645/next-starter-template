- **Issue:** #1198

## PROGRESS + READINESS (MANDATORY)
- Phase: CI Task 005 — OPS Runtime Consolidation
- Task: Task-005
- Status: DRAFT
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: Awaiting required gate runs on this PR
- Notes: Branched from current main while Task 003 (#1239) and Task 004 (#1240) are still in flight.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- docs/explanation/ci/lgfc-ops-runtime-philosophy.md
- docs/explanation/ci/lgfc-ci-production-design.md
- docs/how-to/ci/lgfc-ci-implementation-plan.md
- docs/ops/implementation-plans/issue-1075-ci-redesign-rollout.md
- docs/reference/ci/lgfc-ci-workflow-classification-matrix.md

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
  - docs/reference/ci/ops-runtime-surface.md
  - docs/reference/platform/CLOUDFLARE.md

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- .github/workflows/ops-assess.yml
- .github/workflows/ops-cf-pages-retry.yml
- .github/workflows/production-audit.yml
- .github/workflows/ops-main-change-monitor.yml
- .github/workflows/snapshot.yml
- .github/workflows/b2-d1-daily-sync.yml
- .github/workflows/b2-s3-smoke-test.yml
- scripts/ci/install_aws_cli_v2.sh
- scripts/ci/ops_runtime_escalation.mjs
- scripts/ci/ops_runtime_surface.mjs
- tests/ops-runtime-surface.test.mjs
- tests/ops-runtime-escalation.test.mjs
- tests/vitest.node.config.ts
- docs/explanation/ci/lgfc-ops-runtime-philosophy.md
- docs/how-to/ci/lgfc-ci-implementation-plan.md
- docs/reference/ci/lgfc-ci-workflow-classification-matrix.md
- docs/reference/ci/ops-runtime-surface.md

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
- Aligned OPS runtime workflow display names (`OPS — Production Audit`, `OPS — Snapshot Backup`, `OPS — B2 ...`).
- Added shared runtime escalation helper and OPS runtime surface inventory validator.
- Deduplicated AWS CLI install via `scripts/ci/install_aws_cli_v2.sh`.
- Added runtime step summaries and GitHub issue escalation for B2, snapshot, and sync failures.
- Documented consolidated OPS runtime surface and updated philosophy/classification references.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npx vitest run --config tests/vitest.node.config.ts tests/ops-runtime-surface.test.mjs tests/ops-runtime-escalation.test.mjs` — PASS (5 tests)
  - `npm run typecheck` — PASS
  - `npm run build` — PASS
  - `npm run assess:ci` — PASS
  - `./scripts/ci/docs_check_headers.sh .` — PASS
  - `node scripts/ci/ops_runtime_surface.mjs` — PASS
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
  - docs/reference/ci/ops-runtime-surface.md
  - docs/explanation/ci/lgfc-ops-runtime-philosophy.md
  - docs/how-to/ci/lgfc-ci-implementation-plan.md
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
- [x] OPS runtime workflows provide proactive health and retry visibility.
- [x] Runtime failures produce evidence and escalation paths.
- [x] Cloudflare Pages static export compatibility remains intact.

## ROLLBACK
Revert OPS workflow/script consolidation while preserving prior snapshot and audit artifacts.

## POST-MERGE VERIFICATION REQUIREMENTS
- Confirm OPS monitoring workflows report production/runtime health.
- Confirm retry behavior is capped and evidence is preserved.
- Confirm no Cloudflare runtime contract changed without documentation.

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
Consolidated OPS runtime workflows with `OPS —` naming, shared failure escalation, and clearer step summaries to improve post-deploy monitoring and evidence. Implements Task 005 from #1198 while keeping Cloudflare Pages static export compatibility.

- **New Features**
  - Shared escalation via `scripts/ci/ops_runtime_escalation.mjs` (upserts issues, adds step summary with run URL).
  - OPS runtime surface validator `scripts/ci/ops_runtime_surface.mjs` with tests.
  - Step summaries added to assessment, production audit, and snapshot jobs.
  - New reference doc `docs/reference/ci/ops-runtime-surface.md` linking the consolidated model to #1198.

- **Refactors**
  - Standardized workflow display names: `OPS — Production Audit`, `OPS — Snapshot Backup`, `OPS — B2 S3 Smoke Test`, `OPS — B2 D1 Daily Sync`.
  - Replaced inline AWS CLI install with `scripts/ci/install_aws_cli_v2.sh`; Node setup uses `.node-version`.
  - Granted `issues: write` where escalation is used.
  - Updated philosophy, implementation plan, and classification docs to reflect the consolidated OPS runtime surface.

<sup>Written for commit 186a1dd3de8137f72016d8391322770e710840d2. Summary will update on new commits.</sup>

<a href="https://cubic.dev/pr/wdhunter645/next-starter-template/pull/1242?utm_source=github" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/review-in-cubic-dark.svg"><source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/review-in-cubic-light.svg"><img alt="Review in cubic" src="https://cubic.dev/buttons/review-in-cubic-dark.svg"></picture></a>

<!-- End of auto-generated description by cubic. -->