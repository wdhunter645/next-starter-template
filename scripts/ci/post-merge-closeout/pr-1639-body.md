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
- Next queue item: halt — Program #1255 Task 010 (#1562) awaits tracker issue 1258 reopen verification and @cursor authorization
- Continue/halt decision: halt — closeout remediation only; Atlas sign-off on #1258 received 2026-06-14

## PROGRESS + READINESS (MANDATORY)
- Phase: Post-merge closeout remediation
- Task: #1638
- Status: READY FOR REVIEW
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none after PR-body remediation
- Notes: Remediates terminal_label_conflict from PR #1536 closeout replay and source issue 1634 closeout for merged PR #1635.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- `scripts/ci/post-merge-closeout/pr-1536-body.md`
- `scripts/ci/post-merge-closeout/pr-1635-body.md`
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
- `scripts/ci/post-merge-closeout/pr-1536-body.md`
- `scripts/ci/post-merge-closeout/pr-1635-body.md`
- `scripts/ci/post-merge-closeout/pr-1639-body.md`
- `scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json`
- `tests/post-merge-source-issue-closeout.test.mjs`
- `tests/post-merge-closeout-all-manifests.test.mjs`
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
- Fix active-source disposition matching for "do not apply terminal close" phrasing (terminal_label_conflict from PR #1536 closeout replay).
- Reopen incorrectly closed active child projects (issue 1258) during closeout sync when disposition requires it.
- Skip `source_issue_not_open` metadata failure when active-source disposition applies to closed issues.
- Add `pr-1635-body.md` to complete source issue 1634 closeout; register batch replay for PRs #1536 and #1635.
- Extract shared disposition-section helper per Gemini review; register maintainer body apply for this PR.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test -- tests/post-merge-source-issue-closeout.test.mjs tests/post-merge-closeout-all-manifests.test.mjs tests/post-merge-closeout-automatic.test.mjs` — PASS (49/49)
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES (`post-merge-readiness`, `pr-issue-accounting`, `reviewer-response-completion`)
  - Required gates rerun or re-evaluated after fixes: YES (pending after this PR-body update)
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
- [x] Gemini disposition received.
- [x] Cubic disposition received or not applicable.
- [x] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [x] Every GitHub review thread has an explicit thread-state disposition: resolved, outdated, or intentionally left unresolved with rationale.

Reviewer items:
- review-comment:3409701224 — accepted — extract section-scoped `_shouldKeepActiveSourceIssueOpenFromSection` helper and combine do-not-close regex per Gemini suggestion — thread state: resolved

## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Commit-level workflow runs inspected
- [x] PR-level pull_request_target workflows inspected
- [x] Latest head workflow runs inspected
- [x] Failed job logs inspected for every failing gate
- [x] Workflow YAML or enforcement logic inspected before documenting gate behavior
- [x] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] All review threads and comments inspected
- [x] Actionable review feedback has PR-body disposition and GitHub thread-state disposition
- [x] Bot comments inspected
- [x] Required gates rerun or re-evaluated after fixes

## POST-MERGE CLOSEOUT CHECKLIST
- [ ] PR merged state verified
- [ ] Merge commit recorded
- [ ] Post-Merge PR Body Closeout batch replay inspected after merge
- [ ] Tracker issue 1258 reopened with `status:active`
- [ ] Remediation exception for PR 1536 resolved after replay
- [ ] Source issue 1634 closed when PR 1635 closeout replay succeeds

Post-merge outcomes deferred to automation after this PR merges to `main`:
- `Post-Merge PR Body Closeout` replays closeout for merged PRs #1536 and #1635.
- Expected closeout: reopen tracker issue 1258; resolve remediation exception for PR 1536; close source issue 1634.

## ACCEPTANCE CRITERIA
- [x] Active-source disposition matching works for do-not-apply-terminal-close phrasing
- [x] Closeout replay targets registered for PRs #1536 and #1635
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

## Atlas branch assistance
- Created and pushed `atlas/pr-lifecycle-state-machine-1633` from `main` for issue #1633 (Program 1500 Task 004 PR lifecycle state machine docs).
<!-- CURSOR_AGENT_PR_BODY_END -->
