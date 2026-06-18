<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1259

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present. Preferred format: `- **Issue:** #1259`.
- [x] Read the workflow files that will run for this PR's touched paths.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: not-applicable — gate remediation prerequisite for Task 006 delivery
- Next queue item: halt — merge this gate fix before Task 006 PR #1728 can pass post-merge-readiness
- Continue/halt decision: halt — serial unblock only; no Task 007 work

## PROGRESS + READINESS (MANDATORY)
- Phase: Program #1255 / `#1259` Phase 4 gate remediation
- Task: Post-merge-readiness unblock after PR #1716 auto-repair rollout
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation applied)
- Notes: Merged as PR #1729 (merge SHA `0232254ce32d90d3f8e5cbd64369a1c07665ac17`). Post-merge closeout body remediation for exception #1731 (batch #1791).

## DOCUMENTATION SOURCE (MANDATORY)
- [x] DIATAXIS_ROUTED

Source Files Used:
- `scripts/ci/pr_body_auto_repair.mjs`
- `scripts/ci/post_merge_validator.mjs`
- `docs/reference/governance/troubleshooting-data-surface-requirements.md`

## LABEL
- Intent label for this PR: infra

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `scripts/ci/post_merge_validator.mjs`
- `scripts/ci/pr_body_auto_repair.mjs`
- `tests/post-merge-validator.test.mjs`
- `tests/pr-body-auto-repair.test.mjs`

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
- [x] No application code, config, or runtime behavior modified

## CHANGE SUMMARY
- Strip the managed `pr-body-auto-repair` block before forbidden-token validation in `post_merge_validator.mjs`.
- Replace auto-repair scaffold wording that contained the forbidden token after #1716.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test -- tests/post-merge-validator.test.mjs tests/pr-body-auto-repair.test.mjs` — PASS (30 tests)
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES (bootstrap unchecked-criteria only at first run)
  - Required gates rerun or re-evaluated after fixes: YES
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
- review-comment:3428488544 — acknowledged — addressed or superseded in merged head; post-merge closeout disposition recorded — thread state: outdated
- none at open

## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Commit-level workflow runs inspected
- [x] PR-level pull_request_target workflows inspected
- [x] Latest head workflow runs inspected
- [x] Failed job logs inspected for every failing gate
- [x] Required gates rerun or re-evaluated after fixes
- [x] Final PR panel confirms merge-readiness on head `fc302e5`

## PRE-MERGE CLOSEOUT PREDICTION (MANDATORY)
- Pre-merge closeout prediction: pass
- Source issue state before merge: open
- Expected post-merge source issue action: no-op — **do NOT close `#1259`**
- Reviewer disposition parseability: pass
- Queue continuation after closeout: halt — Task 006 PR #1728 awaits this merge

## POST-MERGE ISSUE DISPOSITION
- Source issue **#1259** remains **open** with `status:active`; remove stale workflow labels; **do not close** #1259
- Close remediation exception **#1731** when validator passes after body apply.

## POST-MERGE CLOSEOUT CHECKLIST
- [ ] PR merged state verified
- [ ] Merge commit recorded
- [ ] Source issue `#1259` state inspected after merge — **must remain OPEN**
- [ ] **Do NOT close `#1259`**

## ACCEPTANCE CRITERIA
- [x] Required source issue exists, is open, is same-repository, and is not a PR.
- [x] Auto-repair scaffold no longer trips forbidden-token validation.
- [x] Targeted tests pass locally.
- [x] All required gates pass on latest head
- [x] PR is ready for human review.

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular (`infra`)
- [x] Local checks executed and passed
- [x] Status is set to READY FOR REVIEW only after all required gates and reviewer-response obligations are complete
<!-- CURSOR_AGENT_PR_BODY_END -->
