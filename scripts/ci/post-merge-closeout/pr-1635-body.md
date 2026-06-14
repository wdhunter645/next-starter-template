<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1634

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #1634`.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: not-applicable — post-merge closeout remediation
- Next queue item: halt — Program #1255 Task 010 remains blocked pending #1258 reopen verification and Atlas/Bill authorization
- Continue/halt decision: halt — closeout remediation only

## PROGRESS + READINESS (MANDATORY)
- Phase: Post-merge closeout remediation
- Task: #1634
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation applied)
- Notes: Merged as PR #1635 (merge SHA `0e2e2fbada6e2fb74bed22eac10993eeb7744707`). Optional Auto-Sync workflow remediation for #1629.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

## LABEL
- Intent label for this PR: infra

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `scripts/ci/post_merge_remediation_issue.mjs`
- `scripts/ci/post-merge-closeout/pr-1536-body.md`
- `scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json`
- `tests/post-merge-closeout-automatic.test.mjs`
- `tests/post-merge-closeout-all-manifests.test.mjs`

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] No application UI or runtime behavior modified

## CHANGE SUMMARY
- Fix `blockingCloseoutFailures` to treat only `required: true` workflow failures as blocking for remediation issue creation.
- Update PR #1536 closeout body with optional-workflow gate verification note and #1629 disposition.
- Register single-target batch replay in `targets-ci-pending-rerun.json`.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test -- tests/post-merge-closeout-automatic.test.mjs tests/post-merge-closeout-all-manifests.test.mjs` — PASS (21/21)
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
- Result summary: PASS

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Copilot disposition received or not applicable.
- [x] Codex disposition received or not applicable.
- [x] Gemini disposition received or not applicable.
- [x] Cubic disposition received or not applicable.

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded (`0e2e2fbada6e2fb74bed22eac10993eeb7744707`)
- [x] Post-merge closeout body remediation applied for merged PR governance
- [x] Exception #1629 closed after merge

## ACCEPTANCE CRITERIA
- [x] `blockingCloseoutFailures` ignores non-required workflow failures
- [x] PR #1536 closeout body updated; batch replay registered
- [x] Local closeout tests pass
- [x] Exception #1629 closes after merge and closeout replay
- [x] Post-merge closeout criteria satisfied after merge and closeout body remediation

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] Allowed files section matches final diff exactly
- [x] Local checks executed and passed
- [x] Post-merge closeout body remediation applied for merged PR governance

## POST-MERGE ISSUE DISPOSITION
- Reconcile terminal labels on closed source **#1634** after successful optional-workflow remediation; remove `status:failed` and `status:post-merge-verify`; add `status:complete`

<!-- closeout-trigger: 2026-06-14T15:00:00Z -->
<!-- CURSOR_AGENT_PR_BODY_END -->
