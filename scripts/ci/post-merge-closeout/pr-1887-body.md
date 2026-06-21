<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1849

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR.
- [x] Read the workflow files that will run for this PR's touched paths.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making readiness claims.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)
- Dependency-map result: pass — Program #1847 Task 001 (#1848) classification contract merged via PR #1860
- Next queue item: #1850 — Task 003 safe auto-fix actions (after #1849 post-merge verification)
- Continue/halt decision: continue — Task 002 is the authorized next implementation tranche

## PRE-MERGE CLOSEOUT PREDICTION (REQUIRED BEFORE READY FOR MERGE)
- Pre-merge closeout prediction: pass
- Source issue state before merge: open
- Expected post-merge source issue action: manual close after post-merge verification
- Reviewer disposition parseability: pass
- Queue continuation after closeout: continue to #1850 after #1849 post-merge verification

## PROGRESS + READINESS (MANDATORY)
- Phase: MERGED
- Task: Implement post-merge detector and normalized findings report (#1849)
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none
- Notes: Merged as PR #1887 at `be5c9e38320bbbb587081cd066d384d2a63490aa`. Post-merge closeout body replay registered.

## DOCUMENTATION SOURCE (MANDATORY)
- [x] DIATAXIS_FULL

Source Files Used:
- `docs/reference/ci/post-merge-self-healing-classification-contract.md`
- `scripts/ci/prune_closeout_manifest.mjs`
- `scripts/ci/run_batch_post_merge_closeout.mjs`

## DIATAXIS GAP (REQUIRED IF LEGACY_FALLBACK)
- Gap Identified: not applicable
- Link to issue: not applicable
- Description: not applicable

## LABEL
- Intent label for this PR: infra

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Additional design/reference docs used for this PR:
  - `docs/reference/ci/post-merge-self-healing-classification-contract.md`
  - `docs/reference/ci/post-merge-validation-surface.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `scripts/ci/post_merge_self_heal_classify.mjs`
- `scripts/ci/post_merge_self_heal_detect.mjs`
- `tests/post-merge-self-heal-detect.test.mjs`

All other files are out of scope.

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## CHANGE SUMMARY
- Add classifier and detector scripts for post-merge self-healing (#1849).
- Emit normalized machine-readable findings report aligned to #1848 contract.
- Harden ingestion, duplicate detection, and closeout classification edge cases.
- No workflow wiring, auto-fix execution, or GitHub mutations.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npx vitest run --config tests/vitest.node.config.ts tests/post-merge-self-heal-detect.test.mjs` — PASS (20/20)
  - `git diff --name-only origin/main...HEAD` — PASS, matches allowlist
- Result summary: PASS (local); CI re-evaluating on head `81b77e8699bf3094c6ef0b8571a8f190346d98ec`

## ACCEPTANCE CRITERIA
- [x] Empty manifests produce `no_action` / clean success
- [x] Stale manifest fixtures produce `safe_auto_fix` findings
- [x] Ambiguous findings produce escalation classifications, not auto-fix
- [x] PR limited to #1849 allowlist

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments, bot comments, and review threads.
- review-comment:3446938044 — accepted — removed redundant missing_changed_file branch — thread state: outdated
- review-comment:3446938047 — accepted — classifyFinding null-guards — thread state: outdated
- review-comment:3446938054 — accepted — CLI manifestPaths fallback behavior fixed — thread state: outdated
- review-comment:3446941682 — accepted — detectFailedCloseoutReports for empty failure results — thread state: outdated
- review-comment:3446941683 — accepted — incomplete remediation metadata escalates — thread state: outdated
- review-comment:3446941686 — accepted — classification precedence preserved — thread state: outdated
- review-comment:3446951453 — accepted — removed unused classifyFinding import — thread state: outdated
- review-comment:3446951463 — accepted — loadManifestSnapshotsSafely wraps manifest ingestion — thread state: outdated
- review-comment:3446951469 — accepted — issueReferenceKey reads pr field variants — thread state: outdated
- review-comment:3446951473 — accepted — incomplete metadata emits per-issue findings — thread state: outdated
- review-comment:3446951478 — accepted — issuePrNumber helper for duplicate findings — thread state: outdated
- review-comment:3446951485 — accepted — GitHub label object support in deferred detection — thread state: outdated
- review-comment:3446951489 — accepted — deferred override bounded to safe/no_action types — thread state: outdated
- review-comment:3446951496 — accepted — isCleanReport handles clean_state findings — thread state: outdated
- review-comment:3446954035 — accepted — workflow_classification metadata preserved — thread state: outdated
- review-comment:3446954037 — accepted — duplicate safe_auto_fix requires canonical evidence — thread state: outdated
- review-comment:3447588260 — accepted — null-guard manifest entries in detectStaleManifestEntries — thread state: resolved
- review-comment:3447588268 — accepted — null-guard manifests/issues/reports in detectEmptyCleanState — thread state: resolved
- review-comment:3447588271 — accepted — null-guard issues in detectDuplicateRemediationIssues — thread state: resolved
- review-comment:3447588274 — accepted — null-guard report/result in detectCloseoutReportFindings — thread state: resolved
- review-comment:3447588604 — accepted — status uses accumulated errors.length for partial_failure — thread state: resolved
- review-comment:3447589118 — accepted — only post_merge_success passes mark manifests stale — thread state: resolved
- review-comment:3447589120 — accepted — workflow failures use failure.classification as code — thread state: resolved
- review-comment:3447589121 — accepted — duplicate groups without explicit canonical escalate ambiguous metadata — thread state: resolved
- review-comment:3447589123 — accepted — accumulated manifest ingestion errors fail closed to partial_failure — thread state: resolved

## POST-MERGE ISSUE DISPOSITION
- Close source issue **#1849** after merge if acceptance criteria are satisfied
- Program #1847 Task 003 (#1850) may proceed after #1849 post-merge verification
<!-- CURSOR_AGENT_PR_BODY_END -->
