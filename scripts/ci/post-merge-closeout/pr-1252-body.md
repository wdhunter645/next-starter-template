- **Issue:** #1196

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.

## PROGRESS + READINESS (MANDATORY)
- Phase: CI hotfix — post-merge validator
- Task: Task-003 follow-up
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none
- Notes: Merged on `main` as PR #1252. Restores post-merge validation after duplicate import regression.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- scripts/ci/post_merge_validator.mjs

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## LABEL
- Intent label for this PR: infra

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- scripts/ci/post_merge_validator.mjs

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
- Removes duplicate `linkedIssueNumber` declaration in `post_merge_validator.mjs` that caused `SyntaxError` on `main` after PR #1249 merged.
- Restores post-merge validation and source-issue closeout automation.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `node -e "import('./scripts/ci/post_merge_validator.mjs')"` — PASS
  - `npm test -- tests/post-merge-validator.test.mjs tests/post-merge-source-issue-closeout.test.mjs` — PASS (21 tests)
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary: PASS

## DOCUMENTATION UPDATES
- [ ] Documentation updated in this PR
- [x] No documentation updates required

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
- [x] `post_merge_validator.mjs` loads without duplicate identifier error.
- [x] Post-merge detection workflow can run for merged PRs after merge.

## ROLLBACK
Revert `scripts/ci/post_merge_validator.mjs` only.
