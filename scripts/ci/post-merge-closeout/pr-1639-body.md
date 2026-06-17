<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1638

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #1638`.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: not-applicable — post-merge closeout remediation for #1638
- Next queue item: halt — Program #1255 Task 010 (#1562) awaits tracker issue 1258 reopen verification
- Continue/halt decision: halt — closeout replay only

## PROGRESS + READINESS (MANDATORY)
- Phase: Post-merge closeout remediation
- Task: #1638
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none after stale-sync remediation
- Notes: Merged on `main` as PR #1639 at `64cb85794b4943a2a4dd2804061a278a5380faee`. Post-merge closeout body remediation applied for sync re-fetch fix.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- `scripts/ci/post-merge-closeout/pr-1536-body.md`
- `scripts/ci/post-merge-closeout/pr-1639-body.md`
- `docs/ops/pmo/github-issue-closeout-protocol.md`
- `.github/pull_request_template.md`

## LABEL
- Intent label for this PR: infra

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `scripts/ci/post_merge_source_issue_closeout.mjs`
- `scripts/ci/post_merge_validator.mjs`
- `scripts/orchestrator/sync-pr-state.mjs`
- `scripts/ci/run_post_merge_closeout.mjs`
- `scripts/ci/post-merge-closeout/pr-1536-body.md`
- `scripts/ci/post-merge-closeout/pr-1635-body.md`
- `scripts/ci/post-merge-closeout/pr-1639-body.md`
- `scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json`
- `tests/post-merge-source-issue-closeout.test.mjs`
- `tests/post-merge-closeout-all-manifests.test.mjs`
- `tests/post-merge-closeout-automatic.test.mjs`
- `.github/workflows/post-merge-intent-verification.yml`

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied (`infra`)
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [ ] This PR contains documentation-only changes
- [x] No application code, config, or runtime behavior modified outside CI closeout scripts

## CHANGE SUMMARY
- Fix active-source disposition matching for do-not-apply-terminal-close phrasing.
- Reopen incorrectly closed active child projects during closeout sync when disposition requires it.
- Re-fetch merged PR body after remediated body apply so sync uses the same disposition the validator evaluated.
- Register batch replay for PRs #1536 and #1639 to reopen tracker issue 1258 and complete source issue 1638 closeout.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test -- tests/post-merge-closeout-automatic.test.mjs tests/post-merge-closeout-all-manifests.test.mjs tests/post-merge-source-issue-closeout.test.mjs` — PASS
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
  - Result summary: PASS

## DOCUMENTATION UPDATES
- [ ] Documentation updated in this PR
- [x] No documentation updates required

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Copilot disposition received or not applicable.
- [x] Codex disposition received or not applicable.
- [x] Gemini disposition received or not applicable.
- [x] Cubic disposition received or not applicable.
- [x] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [x] Every GitHub review thread has an explicit thread-state disposition.

Reviewer items:
- review-comment:3409701224 — accepted — section-scoped disposition helper implemented in merged PR #1639 — thread state: resolved
- review-comment:3409703941 — accepted — reopen-before-accept logic implemented in merged closeout scripts — thread state: resolved
- review-comment:3409705189 — accepted — disposition matcher updated for bold-markdown `**do not** apply terminal close` phrasing — thread state: outdated
- review-comment:3409705195 — accepted — test fixture aligned with real PR #1536 body phrasing in merged tests — thread state: outdated

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded (`64cb85794b4943a2a4dd2804061a278a5380faee`)
- [x] Source issue state inspected after merge
- [x] Post-merge closeout body remediation applied for merged PR governance

## ACCEPTANCE CRITERIA
- [x] Active-source disposition matching works for do-not-apply-terminal-close phrasing
- [x] Closeout sync re-fetches remediated merged PR body before source issue actions
- [x] Closeout replay targets registered for PRs #1536 and #1639
- [x] Local closeout tests pass
- [x] PR issue-accounting gate passes
- [x] Drift gate passes
- [x] Intent gate passes
- [x] ZIP safety gate passes
- [x] Quality checks pass
- [x] Secret scan passes
- [x] Repository-specific governance gates pass
- [x] No out-of-scope file changes
- [x] All actionable reviewer and bot feedback is resolved or explicitly dispositioned
- [x] PR is ready for human review

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] Source issue #1638 is the sole authority for this remediation PR
- [x] Allowlist matches diff exactly
- [x] Verification commands recorded
- [x] Post-merge-only outcomes moved out of unchecked pre-merge acceptance criteria

## POST-MERGE ISSUE DISPOSITION
- Source remediation issue **#1638** receives `status:complete` when validator passes after body apply
- Batch replay for PR **#1536** must **reopen** tracker issue **1258** with `status:active`; **do not close** tracker issue 1258

<!-- closeout-trigger: 2026-06-14T16:00:00Z -->
<!-- CURSOR_AGENT_PR_BODY_END -->
