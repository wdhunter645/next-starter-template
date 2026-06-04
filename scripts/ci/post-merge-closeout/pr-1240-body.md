- **Issue:** #1197

## PROGRESS + READINESS (MANDATORY)
- Phase: CI Task 004 — Post-Merge Validation Expansion
- Task: Task-004
- Status: READY FOR REVIEW
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none — awaiting CI rerun on head 2111cdc
- Notes: Depends on Task 003 landing first; includes compatible post-merge reviewer audit step from Task 003 design.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- docs/explanation/ci/lgfc-ci-production-design.md
- docs/how-to/ci/lgfc-ci-implementation-plan.md
- docs/ops/implementation-plans/issue-1075-ci-redesign-rollout.md
- docs/reference/ci/merge-protection-surface.md
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
  - docs/reference/ci/post-merge-validation-surface.md

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- .github/workflows/post-merge-intent-verification.yml
- .github/workflows/post-merge-remediation.yml
- .github/workflows/diataxis-post-merge-validate.yml
- .github/workflows/ops-design-compliance-audit.yml
- scripts/ci/post_merge_validator.mjs
- scripts/ci/post_merge_remediation_issue.mjs
- scripts/ci/post_merge_implementation_evidence.mjs
- scripts/ci/post_merge_diataxis_audit.mjs
- scripts/ci/post_merge_validation_surface.mjs
- tests/post-merge-validator.test.mjs
- tests/post-merge-implementation-evidence.test.mjs
- tests/post-merge-validation-surface.test.mjs
- tests/vitest.node.config.ts
- docs/how-to/ci/lgfc-ci-implementation-plan.md
- docs/reference/ci/lgfc-ci-workflow-classification-matrix.md
- docs/reference/ci/post-merge-validation-surface.md

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
- Expanded `post_merge_validator.mjs` with implementation evidence, DIATAXIS evidence, richer reports, and consolidated merge-protection workflow classification.
- Added post-merge evidence scripts and surface inventory validator.
- Updated Post-Merge Detection to write step summaries, comment evidence, sync orchestrator state, and run reviewer audit on failure.
- Restricted Post-Merge Remediation to failed detection runs only and expanded remediation issue bodies.
- Implemented DIATAXIS post-merge evidence workflow and documented the as-built post-merge surface.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npx vitest run --config tests/vitest.node.config.ts tests/post-merge-validator.test.mjs tests/post-merge-implementation-evidence.test.mjs tests/post-merge-validation-surface.test.mjs` — PASS (20 tests)
  - `npm run typecheck` — PASS
  - `./scripts/ci/docs_check_headers.sh .` — PASS
  - `./scripts/ci/docs_canonical_hashes_verify.sh .` — PASS
  - `node scripts/ci/post_merge_validation_surface.mjs` — PASS
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
  - docs/reference/ci/post-merge-validation-surface.md
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
- [x] Post-merge checks report implementation evidence from merged code.
- [x] Failures create actionable remediation output.
- [x] Queue advancement remains blocked until validation succeeds.

## ROLLBACK
Revert post-merge validation and remediation workflow/script changes only.

## POST-MERGE VERIFICATION REQUIREMENTS
- Confirm post-merge validation comments include evidence and failure counts.
- Confirm remediation issue creation occurs only when validation fails.
- Confirm orchestration pauses on post-merge failure.

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Copilot disposition received or not applicable.
- [x] Codex disposition received or not applicable.
- [x] Gemini disposition received or not applicable.
- [x] Cubic disposition received or not applicable.
- [x] Every actionable reviewer comment has a PR-body disposition.
- [x] Every GitHub review thread has an explicit thread-state disposition.

Reviewer items:
- review-comment:3349663566 — accepted — Hardened Result summary and Commands run parsing; reject template placeholder. — thread state: resolved
- review-comment:3349663586 — accepted — Use filename fallback in metadataFailures file existence checks. — thread state: resolved
- review-comment:3349663601 — accepted — Match unchecked acceptance criteria on hyphen and asterisk list markers. — thread state: resolved
- review-comment:3349663640 — accepted — readWorkflow now respects supplied validation root. — thread state: resolved
- review-comment:3349663665 — accepted — Validator surface checks pass root into readWorkflow. — thread state: resolved
- review-comment:3349663693 — accepted — Apply merge-protection job patterns to job name candidates. — thread state: resolved
- review-comment:3349664056 — accepted — Reject unchanged PASS / FAIL / PENDING template placeholder. — thread state: resolved
- review-comment:3349683691 — accepted — Reduced workflow permissions to issues:write plus pull-requests:read. — thread state: resolved
- review-comment:3349683765 — accepted — Reduced DIATAXIS workflow permissions to issues:write plus pull-requests:read. — thread state: resolved
- review-comment:3349683794 — accepted — Removed redundant || true from continue-on-error audit step. — thread state: resolved
- review-comment:3349683844 — accepted — readWorkflow respects validation root. — thread state: resolved
- review-comment:3349683888 — accepted — Merge-protection job patterns use job name candidates. — thread state: resolved
- review-comment:3349683982 — accepted — Guard readWorkflow calls when workflow files exist. — thread state: resolved
- review-comment:3350386961 — accepted — readWorkflow respects supplied validation root. — thread state: resolved

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
Expands post-merge validation (Task 004) with structured evidence reporting, DIATAXIS and implementation checks, and failure-only remediation, while documenting source-issue closeout and adding a validation-surface inventory. Aligns with #1197.

- **New Features**
  - Validator aggregates metadata, implementation, and DIATAXIS failures, computes `evidence_summary`, and renders a structured report for PR comments and the step summary (`post_merge_validator.mjs`).
  - Adds `post_merge_implementation_evidence.mjs`, `post_merge_diataxis_audit.mjs`, and `post_merge_validation_surface.mjs` with tests.
  - Workflow updates:
    - `diataxis-post-merge-validate.yml`: runs on merges to `main`, audits changed DIATAXIS docs, uploads artifacts, and comments evidence.
    - `post-merge-intent-verification.yml`: writes the step summary from the validator report.
    - `post-merge-remediation.yml`: runs only when Post-Merge Detection fails.
    - Clarifies OPS ownership in `ops-design-compliance-audit.yml`.
  - Documentation updates:
    - `docs/reference/ci/post-merge-validation-surface.md`: adds evidence domains, orchestration pause behavior, and source-issue closeout.
    - Classification matrix reflects expanded evidence and remediation handoff.
  - Treats consolidated merge-protection jobs as required (quality, gitleaks, PR accounting) and includes them in failure classification.

- **Bug Fixes**
  - Hardened verification evidence parsing to catch placeholders and non-PASS results.
  - Fixed validation-surface root handling in `post_merge_validation_surface.mjs`.
  - Remediation issue creation is skipped when validation passes.

<sup>Written for commit 2111cdc7dcad16a0769726e07e2e2a8a7dd61433. Summary will update on new commits.</sup>

<a href="https://cubic.dev/pr/wdhunter645/next-starter-template/pull/1240?utm_source=github" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/review-in-cubic-dark.svg"><source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/review-in-cubic-light.svg"><img alt="Review in cubic" src="https://cubic.dev/buttons/review-in-cubic-dark.svg"></picture></a>

<!-- End of auto-generated description by cubic. -->