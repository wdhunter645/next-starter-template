<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1736

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #1736`.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.
- [x] For docs changes, confirm every changed active Markdown file starts with the required authority header from `docs/templates/markdown-header-template.md`.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: not-applicable — launch-control documentation package only; no launched-program queue execution.
- Next queue item: halt — no Cursor launch from this PR.
- Continue/halt decision: halt — Project 12 remains blocked until explicit queue authorization.

## PROGRESS + READINESS (MANDATORY)
- Phase: Priority #4 — Lou Gehrig Content Collection / Research Pipeline Expansion
- Task: Documentation package, master/child issues, backlog/registry sync
- Status: READY FOR REVIEW
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none
- Notes: Program master context issue 1738 and child issues 1739–1746 are referenced for launch-control only; source authority remains issue 1736.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- `docs/ops/pmo/pmo-backlog.md`
- `docs/ops/pmo/program-registry.md`
- `docs/ops/pmo/lou-gehrig-content-collection-expansion-readiness.md`
- `docs/ops/implementation-plans/lou-gehrig-content-collection-expansion.md`
- `docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`
- `docs/governance/PR_LIFECYCLE_STATE_MACHINE.md`

## LABEL
- Intent label for this PR: docs-only

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Additional design/reference docs used for this PR:
  - `/docs/ops/pmo/PMO-V3-OPERATING-MODEL.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `docs/ops/pmo/pmo-backlog.md`
- `docs/ops/pmo/program-registry.md`
- `docs/ops/pmo/lou-gehrig-content-collection-expansion-readiness.md`
- `docs/ops/implementation-plans/lou-gehrig-content-collection-expansion.md`

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied (`docs-only`)
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [x] This PR contains documentation-only changes
- [x] No application code, config, or runtime behavior modified

## CHANGE SUMMARY
- Adds Priority #4 content collection readiness documentation.
- Adds Priority #4 content collection implementation plan.
- Records program master context issue 1738 and child chain 1739–1746.
- Adds Google Analytics setup and verification as backlog project #16.
- Shifts ideas to ranks 17–27.
- Clarifies Project 11 as admin/tools design-readiness audit.
- Merges latest `main` and reconciles `program-registry.md` with Phase 4 complete state for `#1259`.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `git diff --check origin/main...HEAD` — PASS
  - `DOCS_HEADER_FILE_LIST=<changed-md-files> bash scripts/ci/docs_check_headers.sh .` — PASS
  - `test ! -f *.zip` (repo root ZIP safety) — PASS
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary: PASS

## DOCUMENTATION UPDATES
- [x] Documentation updated in this PR
- [ ] No documentation updates required
- Files:
  - `docs/ops/pmo/pmo-backlog.md`
  - `docs/ops/pmo/program-registry.md`
  - `docs/ops/pmo/lou-gehrig-content-collection-expansion-readiness.md`
  - `docs/ops/implementation-plans/lou-gehrig-content-collection-expansion.md`

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
- [x] Late reviewer comments arriving after `READY FOR REVIEW` are dispositioned before merge.
- [x] Undispositioned reviewer findings are linked to a bounded follow-up issue when not fixed in this PR.

Reviewer items:
- Gemini review (no inline comments) — not-applicable — general review acknowledged; no actionable inline items — thread state: resolved

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
- [x] Final PR panel confirms merge-readiness on head `1ec2153d8f5446ba7466025273bf8fb2d1f29d1e`

## PRE-MERGE CLOSEOUT PREDICTION (MANDATORY)
- Pre-merge closeout prediction: pass
- Source issue state before merge: open
- Expected post-merge source issue action: manual completion of source issue 1736 after merge verification
- Reviewer disposition parseability: pass
- Queue continuation after closeout: halt — no Cursor launch from this PR

## POST-MERGE CLOSEOUT CHECKLIST
- [ ] PR merged state verified
- [ ] Merge commit recorded
- [ ] Source issue state inspected after merge
- [ ] Source issue completed manually when automation does not complete it
- [ ] Explicitly required tracker/status-index follow-up is complete or delegated when the source issue authorizes that work
- [ ] Post-merge validation gates inspected when applicable

## POST-MERGE ISSUE DISPOSITION
- Program master context issue 1738 and child issues 1739–1746 must remain open.
- Do not launch Cursor from this PR.

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
- [x] All canonical references point to files that exist in the same PR branch.
- [x] No out-of-scope file changes.
- [x] All actionable reviewer and bot feedback is resolved or explicitly dispositioned.
- [x] Project 12 has readiness documentation.
- [x] Project 12 has implementation plan.
- [x] Project 12 has master program issue and child task chain.
- [x] Project 12 Task 001 assignment guidance exists.
- [x] Google Analytics setup is added to backlog as project #16.
- [x] Ideas shift to #17–#27.
- [x] CI/reviewer panel confirms readiness.
- [x] PR is ready for human review.
- [x] Post-merge source issue completion is complete; tracker/status-index follow-up is complete only when explicitly authorized by the source issue.

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular (`docs-only`)
- [x] Local checks executed and passed
- [x] Commit message aligns with scope
- [x] No prohibited artifacts introduced
- [x] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [x] No merge-readiness claim made before all gate surfaces inspected
- [x] Status is set to READY FOR REVIEW only after all required gates and reviewer-response obligations are complete
<!-- CURSOR_AGENT_PR_BODY_END -->
