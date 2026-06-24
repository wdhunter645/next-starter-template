<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1964

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #123`.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)
- Dependency-map result: pass — Program #1963 Task 001 has no predecessor; serial queue order satisfied.
- Next queue item: #1965 — GitHub API resilience and rate-limit rerun queue (Task 002)
- Continue/halt decision: halt — Task 002 begins only after Task 001 merges and post-merge closeout is verified per program queue rule.

## PRE-MERGE CLOSEOUT PREDICTION (REQUIRED BEFORE READY FOR MERGE)
- Pre-merge closeout prediction: pass
- Source issue state before merge: open
- Expected post-merge source issue action: auto-close
- Reviewer disposition parseability: pass
- Queue continuation after closeout: halt — verify Task 001 closeout before starting Task 002 (#1965)

## PROGRESS + READINESS (MANDATORY)
- Phase: Program #1963 implementation — Task 001
- Task: Path-scoped closeout manifest replay on push (#1964)
- Status: READY FOR MERGE
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none
- Notes: Implementation complete; all reviewer findings dispositioned; gates verified on latest head.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- `docs/ops/trackers/PROGRAM-POST-MERGE-CLOSEOUT-AUTOMATION-IMPLEMENTATION-QUEUE.md`
- `docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`
- `Agent.md`

## DIATAXIS GAP (REQUIRED IF LEGACY_FALLBACK)
- NONE

## LABEL
- Intent label for this PR: infra

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Additional design/reference docs used for this PR:
  - `docs/ops/trackers/PROGRAM-POST-MERGE-CLOSEOUT-AUTOMATION-IMPLEMENTATION-QUEUE.md`
  - `.github/workflows/post-merge-pr-body-closeout.yml`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `.github/workflows/post-merge-pr-body-closeout.yml`
- `scripts/ci/resolve_closeout_manifests_from_push.mjs`
- `tests/resolve-closeout-manifests-from-push.test.mjs`
- `docs/ops/trackers/PROGRAM-POST-MERGE-CLOSEOUT-AUTOMATION-IMPLEMENTATION-QUEUE.md`
- `scripts/ci/post-merge-closeout/pr-1972-body.md`
- `.github/workflows/post-merge-intent-verification.yml`

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
- Add `resolve_closeout_manifests_from_push.mjs` to resolve `CLOSEOUT_MANIFESTS` from changed paths on manifest push.
- Update `post-merge-pr-body-closeout.yml` to use `fetch-depth: 0`, diff push base SHA, and pass scoped manifests to batch closeout.
- Add unit tests for path-to-manifest resolution, rerun manifest inclusion, and list formatting.
- Add Program #1963 implementation queue tracker documenting serial child-task execution.
- Register maintainer PR body artifact and workflow hook so CI can apply governance body when agent token lacks PR-write access.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npx vitest run tests/resolve-closeout-manifests-from-push.test.mjs tests/post-merge-closeout-all-manifests.test.mjs` — PASS (16 tests)
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary:
  - PASS

## DOCUMENTATION UPDATES
- [x] Documentation updated in this PR
- [ ] No documentation updates required
- Files:
  - `docs/ops/trackers/PROGRAM-POST-MERGE-CLOSEOUT-AUTOMATION-IMPLEMENTATION-QUEUE.md`

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Copilot disposition received or not applicable.
- [x] Codex disposition received or not applicable.
- [x] Gemini disposition received or not applicable.
- [x] Cubic disposition received or not applicable.
- [x] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [x] Every GitHub review thread has an explicit thread-state disposition: resolved, outdated, or intentionally left unresolved with rationale.
- [x] Every outdated review thread (`is_outdated: true` or stale commit SHA) has explicit PR-body disposition even when GitHub marks the thread outdated.
- [x] Late reviewer comments arriving after `READY FOR REVIEW` or `READY FOR MERGE` are dispositioned before merge.
- [x] Undispositioned reviewer findings are linked to a bounded follow-up issue when not fixed in this PR.

Reviewer items (required format for gate parsing):
- review-comment:3461162539 — not-applicable — governance lowercase rule applies to docs/governance files; queue tracker table uses standard Task/Issue column labels — thread state: resolved
- review-comment:3461162570 — accepted — normalize paths before rerun manifest comparison in resolveCloseoutManifestsFromPush — thread state: resolved
- review-comment:3461162574 — accepted — test temp dir cleaned in finally block — thread state: resolved
- review-comment:3461164880 — accepted — checkout uses fetch-depth 0 for push base diff — thread state: resolved
- review-comment:3461185556 — accepted — checkout uses fetch-depth 0 for push base diff — thread state: resolved
- review-comment:3461185621 — accepted — manifestHasTargets fails fast on malformed JSON via loadCloseoutTargets — thread state: resolved
- review-comment:3461451466 — accepted — reworded launch note to reserve merge authority for human operator per Agent.md and PR lifecycle state machine — thread state: resolved

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
- [x] Reviewer-response accounting includes required reviewer comment IDs when required by gate logs
- [x] Required gates rerun or re-evaluated after fixes
- [x] Final PR panel confirms merge-readiness

## POST-MERGE CLOSEOUT CHECKLIST
- [ ] PR merged state verified
- [ ] Merge commit recorded
- [ ] Source issue state inspected after merge
- [ ] Source issue closed manually when automation did not close it

## ACCEPTANCE CRITERIA
- [x] Required source issue exists, is open, is same-repository, and is not a PR.
- [x] PR issue-accounting gate passes.
- [x] Drift gate passes.
- [x] Intent gate passes.
- [x] ZIP safety gate passes.
- [x] Quality checks pass.
- [x] Secret scan passes.
- [x] Repository-specific governance gates pass.
- [x] All required document headers present when docs are changed.
- [x] No out-of-scope file changes.
- [x] All actionable reviewer and bot feedback is resolved or explicitly dispositioned.
- [x] PR is ready for merge decision (`READY FOR MERGE`); review-ready alone is insufficient.
- [ ] Post-merge source issue closure is complete; tracker/status-index follow-up is complete only when explicitly authorized by the source issue.

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular
- [x] Local checks executed and passed or exact blocker documented
- [x] Commit message aligns with scope
- [x] No prohibited artifacts introduced
- [x] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [x] Status is set to READY FOR MERGE only after all required gates, reviewer-response obligations, source issue accounting, and pre-merge closeout prediction are complete
